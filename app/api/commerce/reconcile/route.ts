import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantEntitlementsFromOrder } from "@/lib/commerce/entitlements";

type SearchPaymentsResponse = {
  results?: Array<{
    id: string | number;
    status: string;
    external_reference: string | null;
    transaction_amount: number | string;
    currency_id?: string;
  }>;
};

type VerifiedPayment = {
  id: string | number;
  status: string;
  external_reference: string | null;
  transaction_amount: number | string;
  currency_id?: string;
};

type CommerceOrder = {
  id: string;
  user_id: string;
  total_amount: number | string;
  currency: string;
  status: string;
  external_reference: string;
  items: Array<{
    id: string;
    product_id: string;
  }>;
};

async function reconcileByExternalReference(externalReference: string) {
  const supabase = createAdminClient();
  const mpAccessToken = process.env.MP_ACCESS_TOKEN;

  if (!mpAccessToken) {
    throw new Error("Falta MP_ACCESS_TOKEN en variables de entorno.");
  }

  const { data: order, error: orderError } = await supabase
    .from("commerce_orders")
    .select(`
      id,
      user_id,
      total_amount,
      currency,
      status,
      external_reference,
      items:commerce_order_items(
        id,
        product_id
      )
    `)
    .eq("external_reference", externalReference)
    .maybeSingle<CommerceOrder>();

  if (orderError) {
    throw new Error(`No se pudo consultar la orden: ${orderError.message}`);
  }

  if (!order) {
    throw new Error(
      `No existe una orden con external_reference ${externalReference}.`
    );
  }

  const searchUrl = new URL("https://api.mercadopago.com/v1/payments/search");
  searchUrl.searchParams.set("external_reference", externalReference);
  searchUrl.searchParams.set("sort", "date_created");
  searchUrl.searchParams.set("criteria", "desc");
  searchUrl.searchParams.set("limit", "10");

  const searchRes = await fetch(searchUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${mpAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  const searchData = (await searchRes.json()) as SearchPaymentsResponse;

  if (!searchRes.ok) {
    throw new Error(
      `No se pudo buscar pagos en Mercado Pago: ${JSON.stringify(searchData)}`
    );
  }

  const approvedCandidate = (searchData.results || []).find((payment) => {
    return (
      payment.status === "approved" &&
      payment.external_reference === externalReference
    );
  });

  if (!approvedCandidate) {
    throw new Error(
      "No se encontró un pago aprobado en Mercado Pago para esta external_reference."
    );
  }

  const paymentId = String(approvedCandidate.id);

  const paymentRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const verifiedPayment = (await paymentRes.json()) as VerifiedPayment;

  if (!paymentRes.ok) {
    throw new Error(
      `No se pudo obtener el pago ${paymentId}: ${JSON.stringify(verifiedPayment)}`
    );
  }

  if (verifiedPayment.status !== "approved") {
    throw new Error(`El pago ${paymentId} no está approved.`);
  }

  if (verifiedPayment.external_reference !== externalReference) {
    throw new Error(
      "El pago encontrado no coincide con la external_reference esperada."
    );
  }

  if (Number(verifiedPayment.transaction_amount) !== Number(order.total_amount)) {
    throw new Error(
      `Monto inválido. Mercado Pago muestra ${verifiedPayment.transaction_amount} y la orden vale ${order.total_amount}.`
    );
  }

  if (
    verifiedPayment.currency_id &&
    verifiedPayment.currency_id !== order.currency
  ) {
    throw new Error(
      `Moneda inválida. Mercado Pago envió ${verifiedPayment.currency_id} y la orden espera ${order.currency}.`
    );
  }

  const { error: paymentSaveError } = await supabase
    .from("commerce_payments")
    .upsert(
      {
        order_id: order.id,
        provider_payment_id: String(verifiedPayment.id),
        provider_status: verifiedPayment.status,
        amount: verifiedPayment.transaction_amount,
        currency: verifiedPayment.currency_id || order.currency,
        raw_payload: verifiedPayment,
      },
      { onConflict: "provider_payment_id" }
    );

  if (paymentSaveError) {
    throw new Error(`No se pudo guardar el pago: ${paymentSaveError.message}`);
  }

  if (order.status !== "paid") {
    const { error: updateOrderError } = await supabase
      .from("commerce_orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderError) {
      throw new Error(
        `No se pudo actualizar la orden a paid: ${updateOrderError.message}`
      );
    }
  }

  await grantEntitlementsFromOrder(order, supabase);

  const manualFingerprint = `manual-reconcile-${externalReference}-${paymentId}`;
  const { error: auditError } = await supabase
    .from("commerce_webhook_events")
    .insert({
      event_type: "manual_reconcile",
      provider_event_id: paymentId,
      provider_resource_id: paymentId,
      event_fingerprint: manualFingerprint,
      payload: {
        externalReference,
        paymentId,
        source: "manual_reconcile_route",
      },
      processing_status: "processed",
      processed_at: new Date().toISOString(),
    });

  if (auditError && auditError.code !== "23505") {
    console.error("No se pudo registrar auditoría manual:", auditError.message);
  }

  return {
    ok: true,
    message: "Orden reconciliada correctamente.",
    orderId: order.id,
    externalReference,
    paymentId,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const externalReference =
      url.searchParams.get("externalReference")?.trim() || "";

    if (!externalReference) {
      return NextResponse.json(
        { error: "Falta externalReference en la URL." },
        { status: 400 }
      );
    }

    const result = await reconcileByExternalReference(externalReference);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno reconciliando.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const externalReference =
      typeof body?.externalReference === "string"
        ? body.externalReference.trim()
        : "";

    if (!externalReference) {
      return NextResponse.json(
        { error: "Debes enviar externalReference." },
        { status: 400 }
      );
    }

    const result = await reconcileByExternalReference(externalReference);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno reconciliando.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}