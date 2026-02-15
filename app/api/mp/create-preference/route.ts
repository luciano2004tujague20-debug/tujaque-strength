import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializamos Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { price, title, orderId } = body;

    // Detectar la URL base (tu dominio)
    // Si estás en local usa localhost, si estás en vercel usa tu dominio
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tujaque-strength.vercel.app";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: orderId,
            title: title,
            unit_price: Number(price),
            quantity: 1,
            currency_id: "ARS"
          }
        ],
        external_reference: orderId,
        // Al terminar, MP te devuelve a tu página de orden
        back_urls: {
          success: `${baseUrl}/order/${orderId}?status=approved`,
          failure: `${baseUrl}/order/${orderId}?status=failure`,
          pending: `${baseUrl}/order/${orderId}?status=pending`
        },
        auto_return: "approved",
      }
    });

    // Devolvemos la URL para redirigir al usuario
    return NextResponse.json({ url: result.init_point });
    
  } catch (error: any) {
    console.error("Error al crear preferencia MP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}