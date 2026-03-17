import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";
import { MercadoPagoConfig, Preference, PreApproval } from "mercadopago"; 

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

function generateReferralCode(name: string) {
    const firstName = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomNum = Math.floor(Math.random() * 90 + 10); 
    return `${firstName}${randomNum}`;
}

const STATIC_PLANS: Record<string, { code: string, name: string, price: number }> = {
  "static-fuerza": { code: "static-fuerza", name: "Fuerza Base", price: 35000 },
  "static-hipertrofia": { code: "static-hipertrofia", name: "Mutación Hipertrófica", price: 35000 },
  "mesociclo-definicion-4-semanas": { code: "mesociclo-definicion-4-semanas", name: "Definición (Cut)", price: 35000 },
  "programa-elite-12-semanas": { code: "programa-elite-12-semanas", name: "Mentoría Élite BII-Vintage", price: 500 },
  "clinica-tecnica": { code: "clinica-tecnica", name: "Clínica Técnica BII", price: 50 },
  "bii-performance-mensual": { code: "bii-performance-mensual", name: "BII Performance (Suscripción)", price: 80 }
};

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
      referredBy,   
      finalPrice    
    } = body;
    
    let plan = STATIC_PLANS[planCode];

    if (!plan) {
        const { data: dbPlan, error: planErr } = await supabaseAdmin
          .from("plans")
          .select("*")
          .eq("code", planCode)
          .single();

        if (planErr || !dbPlan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
        plan = dbPlan;
    }

    const basePlanPrice = Number(plan.price) || 0; 
    const extraPrice = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;
    const amountToCharge = finalPrice ? finalPrice : (basePlanPrice + extraPrice); 
    
    const orderId = `TS-${Date.now()}`;
    const newReferralCode = generateReferralCode(name); 

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
      referral_code: newReferralCode, 
      referred_by: referredBy || null, 
      wallet_balance: 0 
    });

    if (insErr) {
      console.error("❌ Error Supabase Insert:", insErr.message);
      throw new Error(insErr.message);
    }

    let paymentUrl = null;
    
    if (paymentMethod === 'mercado_pago') {
      
      if (plan.code === "bii-performance-mensual") {
          const preapproval = new PreApproval(client);
          const mpResponse = await preapproval.create({
            body: {
              reason: `Suscripción Mensual - ${plan.name}`,
              external_reference: orderId,
              payer_email: email,
              auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: amountToCharge, 
                currency_id: "ARS",
              },
              back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
              status: "pending",
            }
          });
          paymentUrl = mpResponse.init_point;
          
      } else {
          const preference = new Preference(client);
          const mpResponse = await preference.create({
            body: {
              items: [{
                id: plan.code,
                title: `Plan ${plan.name} - Tujague Strength`,
                quantity: 1,
                unit_price: amountToCharge,
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
    } 

    return NextResponse.json({ ok: true, orderId, paymentUrl });

  } catch (error: any) {
    console.error("❌ ERROR API POST:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}