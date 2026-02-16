import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params; // Este es el UUID de la orden (ej: "a1b2c3...")
    const { status } = await req.json();

    // Validar que el status sea válido
    if (!['paid', 'rejected', 'under_review'].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    // Actualizar la orden
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: status })
      .eq("id", orderId); // Buscamos por el ID interno (UUID)

    if (error) throw error;

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    console.error("Error Admin Status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}