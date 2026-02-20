import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, planCode, price } = body;

    // 1. Iniciamos Supabase con PODERES DE ADMIN (Service Role Key)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // <-- Esta clave es la que hace la magia
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 2. Creamos al usuario en la Bóveda (Auth) y lo AUTO-CONFIRMAMOS
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // ✅ ¡ESTO HACE QUE ENTRE DIRECTO SIN VERIFICAR NADA!
      user_metadata: { name: name }
    });

    // Ignoramos el error si el usuario ya existía de pruebas anteriores
    if (authError && !authError.message.includes("already registered") && !authError.message.includes("already exists")) {
      throw authError;
    }

    // 3. Creamos su ficha visual en tu tabla 'orders'
    const { error: dbError } = await supabaseAdmin
      .from("orders")
      .insert([{
        order_id: `MANUAL-${Date.now()}`,
        customer_name: name,
        customer_email: email.trim(),
        plan_id: planCode,
        amount_ars: price || 0,
        status: "paid", // Entra activo y pagado
        payment_method: "alta_manual",
        password: password // Guardamos la clave para que vos la veas
      }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}