import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';

// ✅ SOLUCIÓN AL ERROR DE IMPORTACIÓN: 
// Usamos el alias '@' que Next.js entiende perfectamente para ir a la raíz
import WelcomeEmail from '@/components/emails/WelcomeEmail';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, plans(*)")
      .or(`order_id.eq.${orderId},id.eq.${orderId.includes('-') && !orderId.startsWith('TS-') ? orderId : '00000000-0000-0000-0000-000000000000'}`)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;
    const { status } = await req.json();
    let query = supabaseAdmin.from("orders").update({ status });

    if (orderId.startsWith("TS-")) query = query.eq("order_id", orderId);
    else query = query.eq("id", orderId);

    const { data, error } = await query.select('*, plans(*)').maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (status === 'paid' && data) {
      try {
          await resend.emails.send({
              from: 'Tujaque Strength <onboarding@resend.dev>',
              to: data.customer_email,
              subject: '🔥 Acceso Habilitado - Tujaque Strength',
              react: WelcomeEmail({ customerName: data.customer_name, planName: data.plans?.name || 'Plan Personalizado' }),
          });
      } catch (e) { console.error(e); }
    }
    return NextResponse.json({ ok: true, order: data });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;
    let query = supabaseAdmin.from("orders").delete();
    if (orderId.startsWith("TS-")) query = query.eq("order_id", orderId);
    else query = query.eq("id", orderId);
    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}