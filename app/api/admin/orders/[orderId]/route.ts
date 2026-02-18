import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';

// AHORA SÍ: Importación limpia y estándar (al mover la carpeta a la raíz)
import WelcomeEmail from '@/components/emails/WelcomeEmail';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    let { orderId } = params;

    if (orderId.includes(".png") || orderId.includes(".jpg")) {
        orderId = orderId.split(".")[0];
    }

    console.log("🔍 API buscando ID limpio:", orderId);

    let query = supabaseAdmin.from("orders").select("*, plans(name)");

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    if (isUUID) {
      query = query.eq("id", orderId);
    } else {
      query = query.eq("order_id", orderId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error("🔥 Error Base de Datos:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ 
            error: "Orden no encontrada", 
            searched_for: orderId
        }, { status: 404 });
    }

    return NextResponse.json({ order: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- PATCH: ENVIAR EMAIL ---

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const { status } = await req.json();
  
  let query = supabaseAdmin.from("orders").update({ status });

  if (orderId.startsWith("TS-")) query = query.eq("order_id", orderId);
  else query = query.eq("id", orderId);

  const { data, error } = await query.select('*, plans(name)').maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Lógica de Email
  if (status === 'paid' && data) {
    try {
        await resend.emails.send({
            from: 'Tujaque Strength <onboarding@resend.dev>',
            to: data.customer_email,
            subject: '🔥 Acceso Habilitado - Tujaque Strength',
            react: WelcomeEmail({ 
                customerName: data.customer_name, 
                planName: data.plans?.name || 'Plan Personalizado' 
            }),
        });
        console.log("✅ Email enviado a:", data.customer_email);
    } catch (emailError) {
        console.error("⚠️ Error enviando email:", emailError);
    }
  }

  return NextResponse.json({ ok: true, order: data });
}

export async function DELETE(req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  let query = supabaseAdmin.from("orders").delete();

  if (orderId.startsWith("TS-")) query = query.eq("order_id", orderId);
  else query = query.eq("id", orderId);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}