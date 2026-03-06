import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

function normalize(v?: string | null) {
  return (v || "").toLowerCase().trim();
}

function daysBetweenMs(days: number) {
  return days * 24 * 60 * 60 * 1000;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, email } = body;

    if (!email) {
      return NextResponse.json({ error: "Falta el email del usuario." }, { status: 400 });
    }

    // 1) Buscar la orden del usuario:
    // - si te pasan orderId, intentamos usarla
    // - si no, caemos a la más reciente
    let orderQuery = supabaseAdmin
      .from("orders")
      .select("id, order_id, plan_id, amount_ars, customer_email, created_at")
      .eq("customer_email", email);

    if (orderId) {
      // order_id suele ser tipo "ORD-xxxx"
      orderQuery = orderQuery.eq("order_id", String(orderId));
    } else {
      orderQuery = orderQuery.order("created_at", { ascending: false }).limit(1);
    }

    const { data: orderData, error: orderErr } = await orderQuery.maybeSingle();

    if (orderErr) {
      console.error("❌ Error buscando orden:", orderErr);
      return NextResponse.json({ error: "Error buscando la orden." }, { status: 500 });
    }

    if (!orderData) {
      return NextResponse.json({ error: "No se encontró una orden para ese email." }, { status: 404 });
    }

    const currentPlanId = normalize(orderData.plan_id);
    const priceAlreadyPaid = Number(orderData.amount_ars) || 0;
    const realOrderId = orderData.order_id || (orderId ? String(orderId) : `temp_${Date.now()}`);

    // 2) Derivar a mensual-* (tu “fuente de verdad” actual)
    let targetPlanCode: string | null = null;

    // Sprint -> mensual equivalente
    if (currentPlanId.startsWith("semanal-3-4") || currentPlanId.includes("3-4") || currentPlanId.includes("base")) {
      targetPlanCode = "mensual-3-4";
    } else if (currentPlanId.startsWith("semanal-5-6") || currentPlanId.includes("5-6") || currentPlanId.includes("pro")) {
      targetPlanCode = "mensual-5-6";
    } else if (currentPlanId.startsWith("semanal-7") || currentPlanId.includes("elite") || /\b7\b/.test(currentPlanId)) {
      targetPlanCode = "mensual-7";
    }

    // Si ya era mensual, lo mandamos a su mensual correspondiente
    if (!targetPlanCode) {
      if (currentPlanId.startsWith("mensual-3-4")) targetPlanCode = "mensual-3-4";
      else if (currentPlanId.startsWith("mensual-5-6")) targetPlanCode = "mensual-5-6";
      else if (currentPlanId.startsWith("mensual-7")) targetPlanCode = "mensual-7";
    }

    // Legacy mensual (por compatibilidad)
    if (!targetPlanCode) {
      if (currentPlanId === "mesociclo_base") targetPlanCode = "mensual-3-4";
      else if (currentPlanId === "pro_performance") targetPlanCode = "mensual-5-6";
      else if (currentPlanId === "elite_total") targetPlanCode = "mensual-7";
      else if (currentPlanId === "mesociclo_mensual") targetPlanCode = "mensual-3-4";
    }

    if (!targetPlanCode) {
      return NextResponse.json(
        { error: `No pude derivar el plan actual (${currentPlanId}) a un mensual-* válido.` },
        { status: 400 }
      );
    }

    // 3) Buscar precio desde BD (price_ars primero)
    const { data: targetPlan, error: targetErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", targetPlanCode)
      .single();

    if (targetErr || !targetPlan) {
      return NextResponse.json({ error: `No existe el plan destino ${targetPlanCode} en plans.` }, { status: 404 });
    }

    const fullPrice =
      targetPlan.price_ars != null ? Number(targetPlan.price_ars) : (Number(targetPlan.price) || 0);

    if (fullPrice <= 0) {
      return NextResponse.json({ error: "Precio inválido en BD para el plan destino." }, { status: 400 });
    }

    // 4) Diferencia a cobrar
    const priceToCharge = fullPrice - priceAlreadyPaid;

    if (priceToCharge <= 0) {
      return NextResponse.json(
        { error: "Upgrade inválido: ya pagó el total o el cálculo dio cero/negativo." },
        { status: 400 }
      );
    }

    // 5) MercadoPago preference
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: `upgrade_${targetPlanCode}`,
            title: `Upgrade a ${targetPlan.name} (Diferencia)`,
            quantity: 1,
            unit_price: priceToCharge,
            currency_id: "ARS",
          },
        ],
        external_reference: `upgrade_${realOrderId}`,
        payer: { email },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgrade=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=pago_rechazado`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=pendiente`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ initPoint: response.init_point });
  } catch (error) {
    console.error("❌ Error creando upgrade:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}