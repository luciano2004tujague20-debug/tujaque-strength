import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: any }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = await Promise.resolve(ctx.params);
  const orderId = String(params?.orderId || "").trim();
  if (!orderId) return Response.json({ error: "Falta orderId" }, { status: 400 });

  const { data: order, error: e1 } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id, order_id, customer_name, customer_email, customer_ref,
      payment_method, amount_ars, status, created_at,
      plans:plan_id (code,name,cadence,days,price_ars,benefits)
    `
    )
    .eq("order_id", orderId)
    .single();

  if (e1 || !order) return Response.json({ error: "Orden no encontrada" }, { status: 404 });

  const { data: receipts, error: e2 } = await supabaseAdmin
    .from("receipts")
    .select("id, file_path, file_mime, file_size, original_name, reference_text, created_at")
    .eq("order_uuid", order.id)
    .order("created_at", { ascending: false });

  if (e2) return Response.json({ error: e2.message }, { status: 500 });

  const withUrls = await Promise.all(
    (receipts || []).map(async (r: any) => {
      if (!r.file_path) return { ...r, signedUrl: null };

      const { data } = await supabaseAdmin.storage
        .from("receipts")
        .createSignedUrl(r.file_path, 60 * 10); // 10 min

      return { ...r, signedUrl: data?.signedUrl || null };
    })
  );

  return Response.json({ order, receipts: withUrls });
}
