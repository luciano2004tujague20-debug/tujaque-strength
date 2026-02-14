import { NextResponse } from 'next/server';
import { mpPreference } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, plans(*)')
      .eq('order_id', orderId)
      .single();

    if (error || !order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });

    const response = await mpPreference.create({
      body: {
        items: [{
          id: order.order_id,
          title: `Plan ${order.plans?.name || 'Entrenamiento'}`,
          quantity: 1,
          unit_price: Number(order.amount_ars),
          currency_id: 'ARS',
        }],
        external_reference: order.order_id,
        back_urls: {
          success: `${appUrl}/order/${order.order_id}`,
          failure: `${appUrl}/order/${order.order_id}`,
          pending: `${appUrl}/order/${order.order_id}`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mp`,
      },
    });

    return NextResponse.json({ url: response.init_point });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
