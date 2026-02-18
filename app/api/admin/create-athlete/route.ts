import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, planCode, price } = body;

    // Validación básica
    if (!name || !email || !password || !planCode) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // ✅ SOLUCIÓN: Generamos un UUID real válido para que Supabase no tire error
    const orderId = crypto.randomUUID();

    // Insertamos el atleta
    const { data, error } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,  // Ahora sí es un UUID válido
      customer_name: name,
      customer_email: email.trim().toLowerCase(),
      password: password, // Guardamos la contraseña
      plan_id: planCode,  
      amount_ars: price,  
      status: "paid",     
      payment_method: "manual_admin",
      created_at: new Date().toISOString()
    }).select();

    if (error) {
      console.error("❌ Error Supabase:", error);
      throw error;
    }

    return NextResponse.json({ ok: true, order: data[0] });

  } catch (error: any) {
    console.error("❌ Error creando atleta:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}