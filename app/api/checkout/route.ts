import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, planName, price, extraVideo, extraPrice, name, email, referralCode } = body;

    if (!planId || !name || !email) {
      return NextResponse.json({ error: "Faltan datos obligatorios (Plan, Nombre o Email)." }, { status: 400 });
    }

    let finalPrice = Number(price);
    
    // Si seleccionó la auditoría en video, sumamos el extra
    if (extraVideo && extraPrice) {
        finalPrice += Number(extraPrice);
    }

    let appliedDiscount = false;
    let validReferralCode = "";

    // 1. Lógica de Descuento (Si el usuario ingresó un código)
    if (referralCode) {
        const cleanCode = referralCode.trim().toUpperCase();
        
        // Códigos Master (Tus códigos de promoción en Instagram)
        const masterCodes: Record<string, number> = {
            "TUJAGUE20": 20, // 20% OFF
            "VERANO15": 15,  // 15% OFF
        };

        if (masterCodes[cleanCode]) {
            const discountPercentage = masterCodes[cleanCode];
            finalPrice = finalPrice - (finalPrice * (discountPercentage / 100));
            appliedDiscount = true;
        } 
        // Códigos de Atletas (BII-Affiliates)
        else {
            const { data: ambassador } = await supabaseAdmin
                .from("orders")
                .select("id")
                .eq("referral_code", cleanCode)
                .single();

            if (ambassador) {
                // 🔥 ACTUALIZADO: Si el código existe y es de un alumno, le hacemos 15% de descuento
                finalPrice = finalPrice - (finalPrice * 0.15); 
                appliedDiscount = true;
                validReferralCode = cleanCode; // Guardamos quién lo refirió
            }
        }
    }

    // 2. Creamos un "order_id" único para este cliente
    const orderId = `ORD-${Date.now()}`;
    
    // 3. Generamos el código de referido automático para ESTE nuevo cliente
    const firstName = name.split(" ")[0].toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newPersonalCode = `${firstName}${randomNum}`;

    // 4. Guardamos la orden inicial en Supabase como "PENDIENTE"
    const { error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_id: orderId,
        customer_name: name,
        customer_email: email,
        plan_id: planId,
        plan_title: planName,
        amount_ars: finalPrice,
        status: "pending",
        has_video_review: extraVideo || false,
        referred_by: validReferralCode, // Quién lo trajo (para pagar comisión luego en el webhook)
        referral_code: newPersonalCode, // Su código propio para el futuro
        wallet_balance: 0
      });

    if (insertError) {
        console.error("Error guardando orden en BD:", insertError);
        return NextResponse.json({ error: "Error al registrar la orden en la base de datos." }, { status: 500 });
    }

    // 5. Inicializamos Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const preference = new Preference(client);

    // 6. Creamos la preferencia de pago
    const response = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: appliedDiscount ? `${planName} (Con Descuento)` : planName,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: "ARS",
          },
        ],
        external_reference: orderId,
        
        // ✅ LA PIEZA CLAVE: Le decimos a MP dónde mandar el Webhook
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
        
        payer: { email: email, name: name },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/login?checkout=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/?error=pago_rechazado`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/login?status=pendiente`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ initPoint: response.init_point });

  } catch (error) {
    console.error("Error en checkout:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}