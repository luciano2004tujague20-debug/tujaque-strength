import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("code,name,description,price,price_ars,is_public")
    .eq("is_public", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const plans = (data ?? []).map((p) => ({
    code: p.code,
    name: p.name,
    description: p.description,
    // prioridad: price_ars, si no existe usa price
    priceArs: p.price_ars ?? p.price ?? 0,
  }));

  return NextResponse.json({ plans });
}