import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, email, planId, useWallet } = body;

    if (!orderId || !email || !planId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // 1. Buscamos en la base de datos el precio exacto del plan que tiene el atleta
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", planId)
      .single();

    if (planErr || !plan) {
        return NextResponse.json({ error: "No se pudo encontrar el precio del plan." }, { status: 404 });
    }

    let price = Number(plan.price) || 0;

    // ✅ PUNTO 8: USO DE BILLETERA VIRTUAL (BII-AFFILIATES)
    if (useWallet) {
        // Consultamos cuánto saldo tiene a favor el atleta
        const { data: orderData, error: orderErr } = await supabaseAdmin
            .from("orders")
            .select("wallet_balance")
            .eq("order_id", orderId)
            .single();
            
        if (orderData && !orderErr) {
            const walletBalance = Number(orderData.wallet_balance) || 0;
            
            // Restamos el saldo de su billetera al precio final
            if (walletBalance > 0) {
                price = price - walletBalance;
                if (price < 0) price = 0; // Evitamos que MP intente cobrar un monto negativo
                
                // Vaciamos la billetera porque ya usó los créditos
                await supabaseAdmin
                    .from("orders")
                    .update({ wallet_balance: 0 })
                    .eq("order_id", orderId);
            }
        }
    }

    // 2. Inicializamos Mercado Pago con tu token
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    // 3. Creamos la preferencia de pago
    const response = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: `Renovación: ${plan.name}${useWallet ? ' (Con Créditos Aplicados)' : ''}`,
            quantity: 1,
            unit_price: price, // Le cobramos el precio modificado
            currency_id: "ARS",
          },
        ],
        // Identificamos esta compra como "renewal_"
        external_reference: `renewal_${orderId}`,
        payer: {
          email: email,
        },
        back_urls: {
          // Lo mandamos a la nueva pantalla de éxito de renovación
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/renewal-success?orderId=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=pago_rechazado`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=pendiente`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ initPoint: response.init_point });
  } catch (error) {
    console.error("Error creando el pago de Renovación:", error);
    return NextResponse.json({ error: "No se pudo generar el pago" }, { status: 500 });
  }
}