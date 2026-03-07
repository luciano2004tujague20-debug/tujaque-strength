import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CommerceProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_type: "one_time" | "subscription";
  billing_interval: "day" | "week" | "month" | "year" | null;
  billing_interval_count: number;
  price: number | string;
  currency: string;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
};

type ExistingOrderItem = {
  id: string;
  product_id: string;
  product_snapshot: CommerceProduct;
};

type ExistingOrder = {
  id: string;
  status: string;
  external_reference: string;
  provider_preference_id: string | null;
  metadata: { init_point?: string } | null;
  currency: string | null;
  items: ExistingOrderItem[];
};

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const body = await req.json();
  const { productIds, idempotencyKey } = body as {
    productIds: string[];
    idempotencyKey: string;
  };

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json(
      { error: "Debes enviar al menos un producto válido." },
      { status: 400 }
    );
  }

  if (typeof idempotencyKey !== "string" || idempotencyKey.trim().length < 10) {
    return NextResponse.json(
      { error: "Idempotency key inválida." },
      { status: 400 }
    );
  }

  const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const mpAccessToken = process.env.MP_ACCESS_TOKEN;

  if (!siteUrl) {
    return NextResponse.json(
      { error: "Falta NEXT_PUBLIC_SITE_URL en variables de entorno." },
      { status: 500 }
    );
  }

  if (!mpAccessToken) {
    return NextResponse.json(
      { error: "Falta MP_ACCESS_TOKEN en variables de entorno." },
      { status: 500 }
    );
  }

  try {
    // 1) Asegurar perfil commerce para usuarios ya existentes
    const { error: profileError } = await supabase.from("commerce_profiles").upsert(
      {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || "Atleta Tujague",
        email: user.email || null,
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      throw new Error(`No se pudo asegurar commerce_profiles: ${profileError.message}`);
    }

    // 2) Buscar orden previa por idempotencia
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("commerce_orders")
      .select(`
        id,
        status,
        external_reference,
        provider_preference_id,
        metadata,
        currency,
        items:commerce_order_items(
          id,
          product_id,
          product_snapshot
        )
      `)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle<ExistingOrder>();

    if (existingOrderError) {
      throw new Error(`No se pudo consultar la orden previa: ${existingOrderError.message}`);
    }

    let currentOrder: Pick<ExistingOrder, "id" | "external_reference"> | ExistingOrder | null = null;
    let productsForMP: CommerceProduct[] = [];

    if (existingOrder) {
      if (existingOrder.status === "paid") {
        return NextResponse.json({
          alreadyPaid: true,
          orderId: existingOrder.id,
        });
      }

      if (!existingOrder.items || existingOrder.items.length === 0) {
        return NextResponse.json(
          { error: "Orden inválida. Refrescá la página e intentá de nuevo." },
          { status: 400 }
        );
      }

      if (
        existingOrder.provider_preference_id &&
        existingOrder.metadata?.init_point
      ) {
        return NextResponse.json({
          preferenceId: existingOrder.provider_preference_id,
          initPoint: existingOrder.metadata.init_point,
        });
      }

      currentOrder = existingOrder;
      productsForMP = existingOrder.items.map(
        (item: ExistingOrderItem) => item.product_snapshot
      );
    } else {
      // 3) Validar productos reales desde BD
      const uniqueProductIds = Array.from(new Set(productIds));

      const { data: products, error: productsError } = await supabase
        .from("commerce_products")
        .select("*")
        .in("id", uniqueProductIds)
        .eq("is_active", true)
        .returns<CommerceProduct[]>();

      if (productsError) {
        throw new Error(`No se pudieron consultar los productos: ${productsError.message}`);
      }

      if (!products || products.length !== uniqueProductIds.length) {
        return NextResponse.json(
          { error: "Algunos productos no existen o no están activos." },
          { status: 400 }
        );
      }

      const firstCurrency = products[0].currency;

      for (const product of products) {
        if (product.product_type !== "one_time") {
          return NextResponse.json(
            { error: "Este checkout solo acepta productos de pago único." },
            { status: 400 }
          );
        }

        if (product.currency !== firstCurrency) {
          return NextResponse.json(
            { error: "No se pueden mezclar productos con distinta moneda." },
            { status: 400 }
          );
        }
      }

      const totalAmount = products.reduce(
        (acc: number, product: CommerceProduct) => acc + Number(product.price),
        0
      );

      const orderExternalRef = `ORD-COMM-${crypto.randomUUID()}`;

      const { data: newOrder, error: newOrderError } = await supabase
        .from("commerce_orders")
        .insert({
          user_id: user.id,
          subtotal_amount: totalAmount,
          total_amount: totalAmount,
          currency: firstCurrency,
          external_reference: orderExternalRef,
          idempotency_key: idempotencyKey,
          metadata: {},
        })
        .select("id, external_reference")
        .single<{ id: string; external_reference: string }>();

      if (newOrderError) {
        throw new Error(`No se pudo crear la orden: ${newOrderError.message}`);
      }

      const orderItems = products.map((product: CommerceProduct) => ({
        order_id: newOrder.id,
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        product_snapshot: product,
      }));

      const { error: itemsError } = await supabase
        .from("commerce_order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new Error(`No se pudieron crear los items de la orden: ${itemsError.message}`);
      }

      currentOrder = newOrder;
      productsForMP = products;
    }

    if (!currentOrder) {
      throw new Error("No se pudo resolver la orden actual.");
    }

    if (!productsForMP || productsForMP.length === 0) {
      return NextResponse.json(
        { error: "No hay productos válidos para crear la preferencia." },
        { status: 400 }
      );
    }

    // 4) Crear preferencia real en Mercado Pago
    const mpPayload = {
      items: productsForMP.map((product: CommerceProduct) => ({
        title: product.name,
        quantity: 1,
        unit_price: Number(product.price),
        currency_id: product.currency,
      })),
      external_reference: currentOrder.external_reference,
      notification_url: `${siteUrl}/api/commerce/webhook`,
      back_urls: {
        success: `${siteUrl}/dashboard`,
        pending: `${siteUrl}/commerce-test?status=pending`,
        failure: `${siteUrl}/commerce-test?status=failure`,
      },
      auto_return: "approved",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok || !mpData?.id || !mpData?.init_point) {
      throw new Error(
        `Fallo al crear preferencia en Mercado Pago: ${JSON.stringify(mpData)}`
      );
    }

    // 5) Guardar datos de Mercado Pago en la orden
    const { error: updateOrderError } = await supabase
      .from("commerce_orders")
      .update({
        provider_preference_id: mpData.id,
        metadata: {
          init_point: mpData.init_point,
        },
      })
      .eq("id", currentOrder.id);

    if (updateOrderError) {
      throw new Error(
        `No se pudo guardar la preferencia en la orden: ${updateOrderError.message}`
      );
    }

    return NextResponse.json({
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno en checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}