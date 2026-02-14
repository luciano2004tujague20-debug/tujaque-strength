import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializamos Mercado Pago (solo se usará si el método es 'mercado_pago')
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planCode, paymentMethod, name, email, customerRef, extraVideo } = body;
    
    // paymentMethod puede ser: 'mercado_pago', 'transfer_ars', 'crypto', 'international_usd'

    // 1. Buscar el plan en la DB para saber el precio
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", planCode)
      .single();

    if (planErr || !plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

    // Calcular total
    const extraPrice = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;
    const totalAmount = Number(plan.price_ars) + extraPrice; 
    
    // ID único para la orden
    const orderId = `TS-${Date.now()}`;

    // 2. Crear la orden en Supabase (SIEMPRE se crea, sin importar el método)
    const { error: insErr } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,
      plan_id: plan.id,
      customer_name: name,
      customer_email: email,
      payment_method: paymentMethod, // Aquí guardamos si es crypto, brubank, etc.
      amount_ars: totalAmount,
      status: "awaiting_payment", // Siempre nace pendiente
      extra_video: !!extraVideo,
      extra_video_price_ars: extraPrice
    });

    if (insErr) throw new Error(insErr.message);

    // 3. Lógica según el método de pago
    let paymentUrl = null;

    // CASO A: Mercado Pago -> Generamos el link
    if (paymentMethod === 'mercado_pago') {
      const preference = new Preference(client);
      const mpResponse = await preference.create({
        body: {
          items: [
            {
              id: plan.code,
              title: `Plan ${plan.name} - Tujaque Strength`,
              quantity: 1,
              unit_price: totalAmount,
              currency_id: 'ARS',
            },
          ],
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
    
    // CASO B: Transferencia, Crypto o USD
    // No hacemos nada extra, solo devolvemos el orderId. 
    // El Frontend se encargará de mostrar el CBU o la Wallet.

    return NextResponse.json({ ok: true, orderId, paymentUrl });

  } catch (error: any) {
    console.error("❌ ERROR API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}