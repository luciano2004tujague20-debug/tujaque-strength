import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "under_review").trim();
  const q = (url.searchParams.get("q") || "").trim();

  let query = supabaseAdmin
    .from("orders")
    .select(
      `
      id, order_id, customer_name, customer_email, customer_ref,
      payment_method, amount_ars, status, created_at,
      plans:plan_id (code,name,cadence,days,price_ars)
    `
    )
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`order_id.ilike.%${q}%,customer_email.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ orders: data || [] });
}
