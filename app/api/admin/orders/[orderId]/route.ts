import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status } = await request.json();
    const id = params.orderId;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Esto aparecerá en tu terminal negra para confirmar que el dato llegó
    console.log(`Petición recibida - ID: ${id} - Nuevo Estado: ${status}`);

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: status })
      .eq("id", id);

    if (error) {
      console.error("Error de Supabase:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en el servidor:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
