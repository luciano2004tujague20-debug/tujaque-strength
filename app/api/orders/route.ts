// app/api/orders/route.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeOrderId() {
  // Formato: TS-YYMMDD-XXXXX (similar a tus TS-260211-XXXXXX)
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TS-${yy}${mm}${dd}-${rand}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const planCode = String(body.planCode ?? "");
  const paymentMethod = String(body.paymentMethod ?? "");
  const name = String(body.name ?? "");
  const email = String(body.email ?? "");
  const customerRef = body.customerRef ? String(body.customerRef) : null;

  // NUEVO: extra por video
  const extraVideo = !!body.extraVideo;
  const extra_video_price_ars = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;

  if (!planCode) {
    return Response.json({ error: "Falta planCode" }, { status: 400 });
  }
  if (!paymentMethod) {
    return Response.json({ error: "Falta paymentMethod" }, { status: 400 });
  }
  if (!name) {
    return Response.json({ error: "Falta name" }, { status: 400 });
  }
  if (!email) {
    return Response.json({ error: "Falta email" }, { status: 400 });
  }

  // Buscar plan
  const { data: plan, error: planErr } = await supabaseAdmin
    .from("plans")
    .select("id, code, name, days, cadence, price_ars, active, benefits")
    .eq("code", planCode)
    .eq("active", true)
    .single();

  if (planErr || !plan) {
    return Response.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  const baseAmount = Number(plan.price_ars ?? 0);
  const amount_ars = baseAmount + extra_video_price_ars;

  const order_id = makeOrderId();

  // Insert order
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("orders")
    .insert({
      order_id,
      plan_id: plan.id,
      customer_name: name,
      customer_email: email,
      customer_ref: customerRef,
      payment_method: paymentMethod,
      amount_ars,
      status: "awaiting_payment",

      // NUEVO:
      extra_video: extraVideo,
      extra_video_price_ars,
    })
    .select("order_id")
    .single();

  if (insErr || !inserted) {
    return Response.json(
      { error: insErr?.message || "Error creando orden" },
      { status: 500 }
    );
  }

  return Response.json({ orderId: inserted.order_id });
}
