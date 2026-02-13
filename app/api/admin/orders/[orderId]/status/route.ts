import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: any }) {
  if (!(await isAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = await Promise.resolve(ctx.params);
  const orderId = String(params?.orderId || "").trim();
  const { status } = await req.json().catch(() => ({}));

  if (!orderId) return Response.json({ error: "Falta orderId" }, { status: 400 });

  const allowed = ["awaiting_payment", "under_review", "paid", "rejected"];
  if (!allowed.includes(status)) {
    return Response.json({ error: "Status inválido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("order_id", orderId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
