// app/api/commerce/webhook/route.ts

import { NextResponse } from "next/server";
import { grantEntitlementsFromOrder } from "@/lib/commerce/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function POST(req: Request) {
  const supabase = await createAdminClient();

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const url = new URL(req.url);

  const type =
    url.searchParams.get("type") ||
    url.searchParams.get("topic") ||
    body.type ||
    body.topic ||
    "unknown";

  const rawEventId = body?.data?.id ?? body?.id ?? null;
  const eventId = rawEventId ? String(rawEventId) : null;

  if (!eventId) {
    return NextResponse.json({ error: "Sin ID de evento." }, { status: 400 });
  }

  const action = String(body?.action || "update");
  const eventFingerprint = `${type}-${eventId}-${action}`;

  // 1) Registrar auditoría
  const { data: webhookEvent, error: webhookInsertError } = await supabase
    .from("commerce_webhook_events")
    .insert({
      event_type: type,
      provider_event_id: eventId,
      provider_resource_id: eventId,
      event_fingerprint: eventFingerprint,
      payload: body,
      processing_status: "pending",
    })
    .select("id")
    .single();

  if (webhookInsertError) {
    // 23505 = duplicado esperado
    if (webhookInsertError.code === "23505") {
      return NextResponse.json({ message: "Webhook ya procesado." }, { status: 200 });
    }

    return NextResponse.json(
      { error: `Fallo al registrar auditoría: ${webhookInsertError.message}` },
      { status: 500 }
    );
  }

  try {
    if (type === "payment") {
      const mpAccessToken = process.env.MP_ACCESS_TOKEN;

      if (!mpAccessToken) {
        throw new Error("Falta MP_ACCESS_TOKEN en variables de entorno.");
      }

      // 2) Consultar a Mercado Pago: esta es la fuente real de verdad
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${eventId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
          "Content-Type": "application/json",
        },
      });

      const verifiedPayment = (await mpRes.json()) as VerifiedPayment;

      if (!mpRes.ok) {
        throw new Error(
          `Error validando pago en Mercado Pago: ${JSON.stringify(verifiedPayment)}`
        );
      }

      if (verifiedPayment.status === "approved") {
        if (!verifiedPayment.external_reference) {
          throw new Error("El pago aprobado no trae external_reference.");
        }

        // 3) Buscar la orden real en nuestro sistema
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
          .eq("external_reference", verifiedPayment.external_reference)
          .maybeSingle<CommerceOrder>();

        if (orderError) {
          throw new Error(`No se pudo consultar la orden: ${orderError.message}`);
        }

        if (!order) {
          throw new Error(
            `La orden con external_reference ${verifiedPayment.external_reference} no existe.`
          );
        }

        // 4) Validar monto
        if (Number(verifiedPayment.transaction_amount) !== Number(order.total_amount)) {
          throw new Error(
            `Monto inválido. Pagó ${verifiedPayment.transaction_amount} y la orden vale ${order.total_amount}.`
          );
        }

        // 5) Validar moneda si Mercado Pago la devuelve
        if (
          verifiedPayment.currency_id &&
          verifiedPayment.currency_id !== order.currency
        ) {
          throw new Error(
            `Moneda inválida. MP envió ${verifiedPayment.currency_id} y la orden espera ${order.currency}.`
          );
        }

        // 6) Guardar comprobante del pago
        const { error: paymentError } = await supabase
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

        if (paymentError) {
          throw new Error(`No se pudo guardar el pago: ${paymentError.message}`);
        }

        // 7) Marcar orden como pagada si todavía no lo está
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

        // 8) Otorgar permisos (idempotente por índice único + 23505)
        await grantEntitlementsFromOrder(order, supabase);
      }
    }

    // 9) Marcar webhook como procesado
    const { error: processedError } = await supabase
      .from("commerce_webhook_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", webhookEvent.id);

    if (processedError) {
      throw new Error(
        `No se pudo marcar el webhook como processed: ${processedError.message}`
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Fallo interno procesando webhook.";

    await supabase
      .from("commerce_webhook_events")
      .update({
        processing_status: "failed",
        error_message: message,
      })
      .eq("id", webhookEvent.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}