import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

// Función experta para generar un código de referido único (Ej: JUAN74)
function generateReferralCode(name: string) {
    const firstName = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomNum = Math.floor(Math.random() * 90 + 10); // Número entre 10 y 99
    return `${firstName}${randomNum}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      planCode, 
      paymentMethod, 
      name, 
      email, 
      password, 
      customerRef, 
      extraVideo,
      onboardingData,
      referredBy,   // ✅ NUEVO: Código del amigo que lo refirió
      finalPrice    // ✅ NUEVO: El precio real que debe pagar (con descuento aplicado)
    } = body;
    
    // 1. Buscamos el plan en la base de datos por su código
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", planCode)
      .single();

    if (planErr || !plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

    // Si viene un finalPrice desde el frontend (con descuento), usamos ese. 
    // Si no (por si acaso alguien intenta hackear o falla algo), calculamos el normal.
    const basePlanPrice = Number(plan.price) || 0; 
    const extraPrice = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;
    const amountToCharge = finalPrice ? finalPrice : (basePlanPrice + extraPrice); 
    
    const orderId = `TS-${Date.now()}`;
    const newReferralCode = generateReferralCode(name); // ✅ Creamos su código propio

    // 2. CREACIÓN DE LA ORDEN (CON BILLETERA VIRTUAL)
    const { error: insErr } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,
      plan_id: plan.code, 
      customer_name: name,
      customer_email: email,
      password: password, 
      customer_instagram: customerRef, 
      payment_method: paymentMethod,
      amount_ars: amountToCharge, 
      status: "awaiting_payment",
      extra_video: !!extraVideo,
      extra_video_price_ars: extraPrice,
      onboarding_data: onboardingData || {},
      
      // ✅ INFRAESTRUCTURA BII-AFFILIATES
      referral_code: newReferralCode, // Su código para compartir
      referred_by: referredBy || null, // A quién le debemos pagar la comisión
      wallet_balance: 0 // Inicia con $0 en créditos
    });

    if (insErr) {
      console.error("❌ Error Supabase Insert:", insErr.message);
      throw new Error(insErr.message);
    }

    // 3. Generación de Link de Mercado Pago
    let paymentUrl = null;
    if (paymentMethod === 'mercado_pago') {
      const preference = new Preference(client);
      const mpResponse = await preference.create({
        body: {
          items: [{
            id: plan.code,
            title: `Plan ${plan.name} - Tujague Strength`,
            quantity: 1,
            unit_price: amountToCharge, // ✅ Le cobramos lo que dicta el descuento
            currency_id: 'ARS',
          }],
          external_reference: orderId,
          payer: { email: email },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`, 
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