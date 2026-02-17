import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req: Request) {
  try {
    const { orderId, field, value } = await req.json();

    // Validamos que solo toquen campos de video/rm (Seguridad)
    const allowedFields = [
        'video_squat', 'video_bench', 'video_deadlift', 'video_dips',
        'rm_squat', 'rm_bench', 'rm_deadlift'
    ];

    if (!allowedFields.includes(field)) {
        return NextResponse.json({ error: "Campo no permitido" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ [field]: value })
      .eq("order_id", orderId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}