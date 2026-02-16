import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;

    if (!file) {
      return NextResponse.json({ error: "No seleccionaste ningún archivo." }, { status: 400 });
    }

    // 1. Validar que la orden existe
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .eq("customer_email", email)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Orden no encontrada para ese email." }, { status: 404 });
    }

    // 2. Subir el archivo al Bucket 'receipts'
    const fileExt = file.name.split(".").pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("receipts")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error Storage:", uploadError);
      return NextResponse.json({ error: "Error al guardar la imagen en el servidor." }, { status: 500 });
    }

    // 3. Obtener la URL pública de la imagen
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("receipts")
      .getPublicUrl(fileName);

    // 4. Actualizar la orden
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ 
        receipt_url: publicUrl,
        status: "under_review" 
      })
      .eq("order_id", orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, url: publicUrl });

  } catch (error: any) {
    console.error("❌ ERROR API RECEIPT:", error.message);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}