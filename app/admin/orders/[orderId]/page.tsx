'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      // 1. Fetch Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.orderId) // Usamos el UUID de la URL
        .single();

      if (orderError) {
        alert('Orden no encontrada');
        router.push('/admin/orders');
        return;
      }
      setOrder(orderData);

      // 2. Fetch Plan
      if (orderData.plan_id) {
        const { data: planData } = await supabase
          .from('plans')
          .select('*')
          .eq('id', orderData.plan_id)
          .single();
        setPlan(planData);
      }

      // 3. Fetch Receipt (Comprobante)
      const { data: receiptData } = await supabase
        .from('receipts')
        .select('*')
        .eq('order_uuid', orderData.id) // Usar order_uuid que relaciona con orders.id
        .single();
      
      setReceipt(receiptData);
      setLoading(false);
    };

    if (params.orderId) fetchDetail();
  }, [params.orderId, router]);

  const updateStatus = async (newStatus: 'paid' | 'rejected') => {
    if (!confirm(`¿Estás seguro de marcar esta orden como ${newStatus}?`)) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrder({ ...order, status: newStatus });
      } else {
        alert('Error al actualizar');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500">Cargando detalle...</div>;

  // Calculos
  const basePrice = order.amount_ars || 0;
  const extraPrice = order.extra_video ? (order.extra_video_price_ars || 0) : 0;
  const total = basePrice + extraPrice;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
       {/* Nav Back */}
       <div className="max-w-5xl mx-auto px-6 pt-8 mb-6">
        <Link href="/admin/orders" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm">
            ← Volver al listado
        </Link>
       </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: DETALLES PRINCIPALES */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Header de Orden */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Orden {order.order_id}</h1>
                        <p className="text-zinc-400 text-sm">Creada el {new Date(order.created_at).toLocaleDateString()} a las {new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border
                        ${order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {order.status === 'paid' ? 'PAGADO' : order.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE'}
                    </span>
                </div>

                {/* Cliente */}
                <div className="border-t border-zinc-800 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Cliente</label>
                        <p className="text-white font-medium">{order.customer_name}</p>
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Email</label>
                        <p className="text-white">{order.customer_email}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Referencia / Objetivo</label>
                        <p className="text-zinc-300 text-sm mt-1 p-3 bg-zinc-950 rounded border border-zinc-800">
                            {order.customer_ref || 'Sin referencia'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comprobante */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Comprobante de Pago</h3>
                {receipt ? (
                    <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                        <div className="h-10 w-10 bg-indigo-500/20 rounded flex items-center justify-center text-indigo-400">
                            📄
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{receipt.original_name}</p>
                            <p className="text-xs text-zinc-500">Subido: {new Date(receipt.uploaded_at).toLocaleDateString()}</p>
                        </div>
                        <a 
                            href={receipt.file_path} /* Asumiendo que file_path es una URL firmada o pública, si es bucket privado, necesitaría una función para generar URL firmada */
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
                        >
                            Ver Archivo
                        </a>
                    </div>
                ) : (
                    <p className="text-zinc-500 text-sm italic">El cliente aún no ha subido comprobante.</p>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: DESGLOSE Y ACCIONES */}
        <div className="space-y-6">
            
            {/* DESGLOSE FINANCIERO (LO QUE PEDISTE) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="text-lg font-bold mb-4 relative z-10">Detalle del Plan</h3>
                
                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Plan Base ({plan?.name || '---'})</span>
                        <span className="text-white">{formatMoney(basePrice)}</span>
                    </div>

                    {/* BLOQUE EXTRA VISIBLE */}
                    <div className={`flex justify-between items-center text-sm p-2 rounded ${order.extra_video ? 'bg-indigo-500/10 border border-indigo-500/20' : ''}`}>
                        <div className="flex items-center gap-2">
                             <span className={order.extra_video ? 'text-indigo-400' : 'text-zinc-500'}>
                                {order.extra_video ? '✅ Revisión Video' : '❌ Sin Revisión'}
                             </span>
                        </div>
                        <span className={order.extra_video ? 'text-indigo-300 font-medium' : 'text-zinc-600'}>
                            {order.extra_video ? formatMoney(extraPrice) : '$ 0'}
                        </span>
                    </div>

                    <div className="border-t border-zinc-800 pt-3 mt-3 flex justify-between items-center">
                        <span className="font-bold text-white">Total a Cobrar</span>
                        <span className="font-bold text-xl text-emerald-400">{formatMoney(total)}</span>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Método de pago</p>
                    <p className="text-white font-medium capitalize">{order.payment_method}</p>
                </div>
            </div>

            {/* ACCIONES */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Acciones de Admin</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => updateStatus('paid')}
                        disabled={processing || order.status === 'paid'}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
                    >
                        Aprobar Orden
                    </button>
                    <button
                        onClick={() => updateStatus('rejected')}
                        disabled={processing || order.status === 'rejected'}
                        className="w-full py-3 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 hover:border-red-900/50 border border-transparent disabled:opacity-50 text-zinc-300 rounded-lg font-medium transition-all"
                    >
                        Rechazar Orden
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}