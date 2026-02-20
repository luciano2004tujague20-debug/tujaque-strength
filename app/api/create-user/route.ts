import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, plan } = body;

    // Conectamos con la llave maestra (SOLO EN EL SERVIDOR)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Crear el Usuario en Auth (Login)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Lo confirmamos automáticamente
      user_metadata: { full_name: name }
    });

    if (authError) {
      return NextResponse.json({ error: "Error Auth: " + authError.message }, { status: 400 });
    }

    // 2. Crear la Ficha en la Base de Datos (Orders)
    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_name: name,
          customer_email: email,
          plan_title: plan,
          status: 'paid',
          price: plan.includes("Elite") ? 100000 : 50000,
          squat_pr: 0,
          bench_pr: 0,
          deadlift_pr: 0,
          // Textos por defecto para que no quede vacío
          routine_d1: "Bienvenido a Tujague Strength. Esta es tu primera semana de evaluación.",
          routine_d2: "Descanso activo o movilidad.",
          routine_d3: "Testeo de técnica en básicos.",
          routine_d4: "Descanso.",
          routine_d5: "Trabajo accesorio."
        }
      ]);

    if (dbError) {
      return NextResponse.json({ error: "Error DB: " + dbError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Atleta creado exitosamente" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}