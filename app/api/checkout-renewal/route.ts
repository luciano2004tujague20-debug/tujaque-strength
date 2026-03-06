import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, email, useWallet } = body;

    if (!orderId || !email) {
      return NextResponse.json({ error: "Faltan datos requeridos (orderId/email)" }, { status: 400 });
    }

    // 0) Traemos la ORDEN real y validamos ownership por email
    // (mínimo viable; si después querés versión PRO con cookies SSR, lo hacemos)
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, order_id, customer_email, customer_name, plan_id, wallet_balance, expires_at")
      .eq("order_id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
    }

    if ((order.customer_email || "").toLowerCase().trim() !== String(email).toLowerCase().trim()) {
      return NextResponse.json({ error: "Acceso denegado (orden no pertenece a este email)." }, { status: 403 });
    }

    // 1) Tomamos el planId REAL desde la orden (NO desde el body)
    const planId = (order.plan_id || "").toLowerCase().trim();
    if (!planId) {
      return NextResponse.json({ error: "Orden sin plan_id asociado." }, { status: 400 });
    }

    // 2) Buscamos el precio real del plan en BD
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("code, name, price, price_ars")
      .eq("code", planId)
      .single();

    if (planErr || !plan) {
      return NextResponse.json({ error: "No se pudo encontrar el precio del plan." }, { status: 404 });
    }

    // 🔥 BACKEND COMO ÚNICA FUENTE DE VERDAD 🔥
    let priceBase = plan.price_ars != null ? Number(plan.price_ars) : (Number(plan.price) || 0);

    if (!Number.isFinite(priceBase) || priceBase <= 0) {
      return NextResponse.json({ error: "Precio inválido configurado en la base de datos." }, { status: 400 });
    }

    let finalPrice = priceBase;
    let walletApplied = 0;

    // ✅ USO DE BILLETERA (sin borrar saldo sobrante)
    if (useWallet) {
      const walletBalance = Number(order.wallet_balance) || 0;

      if (walletBalance > 0) {
        walletApplied = Math.min(walletBalance, finalPrice);
        finalPrice = Math.max(0, finalPrice - walletApplied);

        // 🔥 MUY IMPORTANTE: NO BORRAMOS TODO, SOLO LO USADO
        const newWalletBalance = Math.max(0, walletBalance - walletApplied);

        const { error: walletErr } = await supabaseAdmin
          .from("orders")
          .update({ wallet_balance: newWalletBalance, updated_at: new Date().toISOString() })
          .eq("id", order.id);

        if (walletErr) {
          console.error("❌ Error actualizando billetera:", walletErr);
          return NextResponse.json({ error: "Error actualizando billetera." }, { status: 500 });
        }
      }
    }

    // 3) Inicializamos Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    // 4) Creamos la preferencia de pago
    const response = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: `Renovación: ${plan.name}${walletApplied > 0 ? " (Créditos Aplicados)" : ""}`,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: "ARS",
          },
        ],
        // ✅ debe coincidir con webhook
        external_reference: `renew_${orderId}`,

        // ✅ CLAVE: webhook para que se extienda expires_at
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,

        payer: { email },
        back_urls: {
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