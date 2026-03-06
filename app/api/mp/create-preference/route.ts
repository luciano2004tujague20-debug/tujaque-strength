import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ignoramos completamente el 'price' del body.
    const { title, orderId, planId: bodyPlanId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    let planIdToUse = bodyPlanId;

    // 🔥 SALVAVIDAS INTELIGENTE: Búsqueda segura evitando error de tipos (String vs BigInt)
    if (!planIdToUse) {
        let query = supabaseAdmin.from("orders").select("plan_id");
        
        // Si orderId son puros números, buscamos en la columna 'id', sino en 'order_id'
        const isNumericId = /^\d+$/.test(String(orderId));
        if (isNumericId) {
            query = query.eq("id", Number(orderId));
        } else {
            query = query.eq("order_id", orderId);
        }

        const { data: orderData, error: orderErr } = await query.single();
        
        if (orderData && orderData.plan_id) {
            planIdToUse = orderData.plan_id;
        } else {
            console.error("No se encontró planId ni en el body ni en la orden:", orderErr);
            return NextResponse.json({ error: "Faltan datos requeridos (planId no identificado)" }, { status: 400 });
        }
    }

    // 1. Buscamos el precio real del plan en Supabase
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("code", planIdToUse)
      .single();

    if (planErr || !plan) {
        return NextResponse.json({ error: "No se pudo encontrar el plan en la base de datos." }, { status: 404 });
    }

    // 🔥 BLINDAJE DE PRECIOS: Backend como única fuente de verdad
    const price = plan.price_ars != null ? Number(plan.price_ars) : (Number(plan.price) || 0);

    // 🔥 GUARD ESTRICTO: Rechazar si el precio base está roto
    if (price <= 0) {
        return NextResponse.json({ error: "Precio inválido configurado en la base de datos." }, { status: 400 });
    }

    // 🔥 BASE URL MEJORADA: Prioriza .env, sino usa los headers
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host");
        siteUrl = `${protocol}://${host}`;
    }
    // Removemos la barra final por las dudas para que las rutas no queden con doble barra (//)
    siteUrl = siteUrl.replace(/\/$/, "");

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: planIdToUse,
            title: title || plan.name, // Usamos el título que venga o el nombre oficial del plan
            unit_price: price, // ✅ PRECIO VALIDADO Y BLINDADO
            quantity: 1,
            currency_id: "ARS"
          }
        ],
        external_reference: String(orderId), // Mantenemos comportamiento exacto
        back_urls: {
          success: `${siteUrl}/order/${orderId}?status=approved`,
          failure: `${siteUrl}/order/${orderId}?status=failure`,
          pending: `${siteUrl}/order/${orderId}?status=pending`
        },
        auto_return: "approved",
      }
    });

    // ✅ COMPATIBILIDAD TOTAL: Devolvemos 'url' y 'initPoint' para que el frontend viejo no se rompa
    return NextResponse.json({ 
        url: result.init_point, 
        initPoint: result.init_point 
    });
    
  } catch (error: any) {
    console.error("Error en Mercado Pago:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}