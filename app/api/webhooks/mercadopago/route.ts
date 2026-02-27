import { NextResponse } from 'next/server';
import { mpPayment } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    // 1. Obtener parámetros de la URL (MercadoPago manda ?topic=payment&id=12345)
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    console.log(`Webhook recibido: Topic: ${topic}, ID: ${paymentId}`);

    if (topic === 'payment' && paymentId) {
      // 2. Consultar a Mercado Pago el estado real del pago
      const payment = await mpPayment.get({ id: paymentId });
      
      const { status, external_reference } = payment;

      // 3. Si el pago está aprobado, actualizamos la orden
      if (status === 'approved' && external_reference) {
        console.log(`Pago aprobado para referencia: ${external_reference}`);

        // 🌟 BIFURCACIÓN INTELIGENTE: ¿Qué estamos cobrando?
        
        if (external_reference.startsWith('upsell_')) {
            // 🎬 ES UNA COMPRA DEL MÓDULO DE VIDEOS
            // Le sacamos el prefijo "upsell_" para quedarnos solo con el ID de la base de datos
            const realOrderId = external_reference.replace('upsell_', '');
            
            const { error } = await supabaseAdmin
              .from('orders')
              .update({ 
                has_video_review: true, // ✅ ¡ABRIMOS EL CANDADO EN EL DASHBOARD!
                updated_at: new Date().toISOString()
              })
              .eq('id', realOrderId); 

            if (error) {
              console.error('Error abriendo candado de video:', error);
              return NextResponse.json({ error: 'Error DB Upsell' }, { status: 500 });
            }
            console.log(`¡Módulo de video desbloqueado para la orden ID: ${realOrderId}!`);

        } else {
            // 🛒 ES LA COMPRA NORMAL DE UN PLAN NUEVO (Tu código original)
            const { error } = await supabaseAdmin
              .from('orders')
              .update({ 
                status: 'paid', // ✅ CAMBIO A PAGADO AUTOMÁTICAMENTE
                payment_id: paymentId, // Guardamos el ID de MP por si acaso
                updated_at: new Date().toISOString()
              })
              .eq('order_id', external_reference); // Usamos el external_reference que seteamos antes

            if (error) {
              console.error('Error actualizando orden:', error);
              return NextResponse.json({ error: 'Error DB' }, { status: 500 });
            }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}