import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("price_ars", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ plans: data ?? [] });
}
