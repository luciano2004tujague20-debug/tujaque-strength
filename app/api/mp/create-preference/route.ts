import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { price, title, orderId } = body;

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

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
        back_urls: {
          success: `${baseUrl}/order/${orderId}?status=approved`,
          failure: `${baseUrl}/order/${orderId}?status=failure`,
          pending: `${baseUrl}/order/${orderId}?status=pending`
        },
        auto_return: "approved",
      }
    });

    // IMPORTANTE: Devolvemos 'url' para que el frontend lo reconozca
    return NextResponse.json({ url: result.init_point });
    
  } catch (error: any) {
    console.error("Error en Mercado Pago:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}