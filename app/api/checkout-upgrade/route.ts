// app/api/checkout-upgrade/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, email } = body;

    console.log("=== INICIANDO UPGRADE ===");
    console.log("Datos recibidos del Frontend -> Email:", email, "| OrderId:", orderId);

    if (!email) {
      return NextResponse.json({ error: "Falta el email del usuario en la solicitud." }, { status: 400 });
    }

    // 1. Buscamos la orden más reciente del atleta (SIN USAR plan_title)
    const { data: orderData, error: orderErr } = await supabaseAdmin
        .from("orders")
        .select("id, order_id, plan_id, amount_ars")
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    // VARIABLES POR DEFECTO
    let currentPlanId = "";
    let priceAlreadyPaid = 0;
    let realOrderId = orderId || `temp_${Date.now()}`;

    if (orderErr || !orderData) {
        console.error("⚠️ ALERTA: No se encontró la orden en BD para el email:", email);
        console.log("Error detallado de Supabase:", orderErr);
    } else {
        console.log("✅ Orden encontrada:", orderData);
        currentPlanId = (orderData.plan_id || "").toLowerCase();
        priceAlreadyPaid = Number(orderData.amount_ars) || 0;
        realOrderId = orderData.order_id || orderId; 
    }

    // 2. LÓGICA AUTOMÁTICA DE DERIVACIÓN (Basado SOLO en plan_id)
    let targetPlanCode = "mesociclo_mensual"; // Plan por defecto (Fallback)

    // Analizamos el ID del plan actual para ver a cuál lo mandamos
    if (currentPlanId.includes("3") || currentPlanId.includes("4") || currentPlanId.includes("base")) {
        targetPlanCode = "mesociclo_base"; // MESOCICLO BASE (3-4 DÍAS)
    } else if (currentPlanId.includes("5") || currentPlanId.includes("6") || currentPlanId.includes("pro")) {
        targetPlanCode = "pro_performance"; // PRO PERFORMANCE (5-6 DÍAS)
    } else if (currentPlanId.includes("7") || currentPlanId.includes("elite")) {
        targetPlanCode = "elite_total"; // ÉLITE TOTAL (7 DÍAS)
    }
    
    console.log("🔄 Derivando Upgrade hacia el plan code:", targetPlanCode);

    // 3. BUSCAMOS EL PRECIO DEL NUEVO PLAN EN LA BD
    const { data: targetPlanData, error: targetPlanErr } = await supabaseAdmin
      .from("plans")
      .select("price, name")
      .eq("code", targetPlanCode)
      .single();

    if (targetPlanErr || !targetPlanData) {
        console.error("❌ El plan de destino no existe en la BD:", targetPlanCode);
        return NextResponse.json({ error: `El plan derivado (${targetPlanCode}) no existe en tu tabla 'plans'. Verifica los códigos en Supabase.` }, { status: 404 });
    }

    const fullPriceOfNewPlan = Number(targetPlanData.price) || 0;
    const targetPlanName = targetPlanData.name;

    // 4. LA MAGIA FINANCIERA: Calcular la diferencia a cobrar
    let priceToCharge = fullPriceOfNewPlan - priceAlreadyPaid;

    console.log(`💰 Finanzas -> Precio Nuevo: $${fullPriceOfNewPlan} | Pagó antes: $${priceAlreadyPaid} | A cobrar: $${priceToCharge}`);

    // Si la diferencia es menor o igual a 0 cobramos un Fee estándar de contingencia
    if (priceToCharge <= 0) {
        priceToCharge = 15000; 
        console.log("Aplicando tarifa de contingencia: $15000");
    }

    // 5. Inicializamos Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    // 6. Creamos la preferencia
    const response = await preference.create({
      body: {
        items: [
          {
            id: `upgrade_${targetPlanCode}`,
            title: `Upgrade a ${targetPlanName} (Diferencia)`,
            quantity: 1,
            unit_price: priceToCharge, 
            currency_id: "ARS",
          },
        ],
        external_reference: `upgrade_${realOrderId}`,
        payer: {
          email: email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgrade=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=pago_rechazado`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=pendiente`,
        },
        auto_return: "approved",
      },
    });

    console.log("🚀 URL generada con éxito");
    return NextResponse.json({ initPoint: response.init_point });
    
  } catch (error) {
    console.error("❌ Error CRÍTICO creando el pago de Upgrade:", error);
    return NextResponse.json({ error: "No se pudo conectar con la pasarela de pagos" }, { status: 500 });
  }
}