import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: any }) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").toLowerCase().trim();

  const params = await Promise.resolve(ctx.params);
  const orderId = String(params?.orderId || "").trim();

  if (!email) return Response.json({ error: "Falta email" }, { status: 400 });
  if (!orderId) return Response.json({ error: "Falta orderId" }, { status: 400 });
  if (!supabaseAdmin) return Response.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id, order_id, customer_name, customer_email, customer_ref,
      payment_method, amount_ars, status, created_at,
      plans:plan_id (code,name,cadence,days,price_ars,benefits)
    `
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !data) return Response.json({ error: "Orden no encontrada" }, { status: 404 });

  if ((data.customer_email || "").toLowerCase() !== email) {
    return Response.json({ error: "Email no coincide con la orden" }, { status: 403 });
  }

  return Response.json({ order: data });
}
