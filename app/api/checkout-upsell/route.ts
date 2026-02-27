import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, email } = body;

    if (!orderId || !email) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Inicializamos Mercado Pago con tu token
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    // Creamos la preferencia de pago para el Módulo de Video
    const response = await preference.create({
      body: {
        items: [
          {
            id: "upsell-video",
            title: "Auditoría Técnica Biomecánica (Módulo Extra)",
            quantity: 1,
            unit_price: 15000, // Precio del módulo extra
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