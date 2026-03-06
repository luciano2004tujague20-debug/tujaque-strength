import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, email } = body;

    if (!orderId || !email) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // 1. Buscamos el precio del módulo extra en la base de datos
    // IMPORTANTE: Debe existir un plan con el code 'upsell-video' en Supabase
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", "upsell-video")
      .single();

    if (planErr || !plan) {
        return NextResponse.json({ error: "No se pudo encontrar el precio del módulo extra en la base de datos." }, { status: 404 });
    }

    // 🔥 BLINDAJE DE PRECIOS: Backend como única fuente de verdad
    const price = plan.price_ars != null ? Number(plan.price_ars) : (Number(plan.price) || 0);

    // 🔥 GUARD ESTRICTO: Rechazar si el precio base está roto
    if (price <= 0) {
        return NextResponse.json({ error: "Precio inválido configurado en la base de datos para el Upsell." }, { status: 400 });
    }

    // 2. Inicializamos Mercado Pago con tu token
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    // 3. Creamos la preferencia de pago para el Módulo de Video
    const response = await preference.create({
      body: {
        items: [
          {
            id: "upsell-video",
            title: plan.name || "Auditoría Técnica Biomecánica (Módulo Extra)",
            quantity: 1,
            unit_price: price, // Usamos el precio validado desde la base de datos
            currency_id: "ARS",
          },
        ],
        // Identificamos esta compra
        external_reference: `upsell_${orderId}`,
        payer: {
          email: email,
        },
        back_urls: {
          // ✅ CAMBIO CLAVE: Lo mandamos a la pantalla de éxito que destraba la BD
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/upsell-success?orderId=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=pago_rechazado`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=pendiente`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ initPoint: response.init_point });
  } catch (error) {
    console.error("Error creando el pago del Upsell:", error);
    return NextResponse.json({ error: "No se pudo generar el pago" }, { status: 500 });
  }
}