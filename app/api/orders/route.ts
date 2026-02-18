import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planCode, paymentMethod, name, email, customerRef, extraVideo } = body;
    
    // 1. Buscamos el plan en la base de datos por su código
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", planCode)
      .single();

    if (planErr || !plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

    // Calculamos el monto total
    const planPrice = Number(plan.price) || 0; 
    const extraPrice = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;
    const totalAmount = planPrice + extraPrice; 
    
    const orderId = `TS-${Date.now()}`;

    // 2. CREACIÓN DE LA ORDEN (Cambio Crítico aquí)
    const { error: insErr } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,
      // ✅ USAMOS plan.code (texto) para que coincida con la Foreign Key del SQL
      plan_id: plan.code, 
      customer_name: name,
      customer_email: email,
      customer_instagram: customerRef, 
      payment_method: paymentMethod,
      amount_ars: totalAmount, 
      status: "awaiting_payment",
      extra_video: !!extraVideo,
      extra_video_price_ars: extraPrice
    });

    if (insErr) {
      console.error("❌ Error Supabase Insert:", insErr.message);
      throw new Error(insErr.message);
    }

    // 3. Generación de Link de Mercado Pago o respuesta directa
    let paymentUrl = null;
    if (paymentMethod === 'mercado_pago') {
      const preference = new Preference(client);
      const mpResponse = await preference.create({
        body: {
          items: [{
            id: plan.code,
            title: `Plan ${plan.name} - Tujaque Strength`,
            quantity: 1,
            unit_price: totalAmount,
            currency_id: 'ARS',
          }],
          external_reference: orderId,
          payer: { email: email },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${orderId}?status=success`,
            failure: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${orderId}?status=failure`,
            pending: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${orderId}?status=pending`,
          },
          auto_return: "approved",
        },
      });
      paymentUrl = mpResponse.init_point;
    } 

    return NextResponse.json({ ok: true, orderId, paymentUrl });

  } catch (error: any) {
    console.error("❌ ERROR API POST:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}