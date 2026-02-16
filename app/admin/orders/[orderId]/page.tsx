'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Función para formatear dinero
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para arreglar el link de la imagen si viene cortado
const getFullImageUrl = (path: string | null) => {
  if (!path) return null;
  // Si ya es un link completo (empieza con http), lo dejamos igual
  if (path.startsWith('http')) return path;
  
  // Si es solo el nombre del archivo, le pegamos la dirección de Supabase
  // Asegúrate de que tu bucket se llame 'receipts'
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${path}`;
};

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const orderIdParam = params.orderId as string;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Usamos cache: 'no-store' para que siempre traiga el dato fresco
        const res = await fetch(`/api/admin/orders/${orderIdParam}`, { cache: 'no-store' });
        const json = await res.json();

        if (!res.ok) {
          alert(`Error: ${json.error || 'No encontrada'}`);
          router.push('/admin/orders');
          return;
        }
        setOrder(json.order);
      } catch (err) {
        alert('Error de conexión.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderIdParam, router]);

  const updateStatus = async (newStatus: 'paid' | 'rejected') => {
    const action = newStatus === 'paid' ? 'APROBAR' : 'RECHAZAR';
    if (!confirm(`¿Estás seguro de ${action} el pago?`)) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderIdParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();

      if (res.ok) {
        setOrder({ ...order, status: newStatus });
        alert('Estado actualizado correctamente.');
      } else {
        alert('Error: ' + (json.error || "No se pudo actualizar"));
      }
    } catch (e) {
      alert('Error de conexión.');
    } finally {
      setProcessing(false);
    }
  };

  const deleteOrder = async () => {
    if (!confirm('⚠️ ¿ELIMINAR este registro permanentemente?')) return;
    setProcessing(true);
    try {
        const res = await fetch(`/api/admin/orders/${orderIdParam}`, { method: 'DELETE' });
        if (res.ok) {
            router.push('/admin/orders');
        } else {
            const json = await res.json();
            alert("Error: " + json.error);
        }
    } catch (e) {
        alert("Error de conexión");
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500 font-black italic text-2xl animate-pulse">CARGANDO...</div>;
  if (!order) return null;

  // Calculamos la URL real de la imagen usando la función nueva
  const receiptUrl = getFullImageUrl(order.receipt_url);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Navbar Superior */}
      <div className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/admin/orders" className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors">
                ← Volver al listado
            </Link>
            <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                  order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                  order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            }`}>
                {order.status.replace('_', ' ')}
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA: DATOS Y FOTO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tarjeta de Info Principal */}
          <div className="bg-black border border-zinc-800 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 text-white">Orden <span className="text-emerald-500">{order.order_id}</span></h1>
            <p className="text-zinc-500 text-xs font-bold uppercase mb-8">Fecha: {new Date(order.created_at).toLocaleDateString()}</p>

            <div className="grid md:grid-cols-2 gap-8 border-t border-zinc-800/50 pt-8">
                <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-lg font-bold text-zinc-200">{order.customer_name}</p>
                    <p className="text-sm text-zinc-400">{order.customer_email}</p>
                </div>
                <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Referencia / IG</p>
                    <p className="text-lg font-bold text-zinc-200">{order.customer_ref || "-"}</p>
                </div>
            </div>
          </div>

          {/* VISUALIZADOR DE COMPROBANTE */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
            <h3 className="text-lg font-black italic uppercase mb-6 tracking-tight flex items-center gap-2">
                📸 Comprobante de Pago
            </h3>
            
            {receiptUrl ? (
              <div className="space-y-4">
                <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-700 bg-black/50 group">
                  <img 
                    src={receiptUrl} 
                    alt="Comprobante del cliente" 
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                  {/* Overlay para abrir */}
                  <a 
                    href={receiptUrl} 
                    target="_blank"
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                        Abrir Original ↗
                    </span>
                  </a>
                </div>
                
                {/* Botón de respaldo visible */}
                <a 
                    href={receiptUrl}
                    target="_blank"
                    className="block w-full text-center text-[10px] font-black text-emerald-500 border border-emerald-500/20 py-3 rounded-lg hover:bg-emerald-500/10 transition-colors uppercase tracking-widest"
                >
                    Abrir Imagen en Pestaña Nueva
                </a>
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-black/20">
                <p className="text-zinc-500 font-bold text-sm">🚫 Sin comprobante adjunto</p>
                <p className="text-zinc-600 text-xs mt-1">El cliente pagó con Mercado Pago o aún no subió la foto.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN Y BOTONES */}
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-emerald-500/20 rounded-[2rem] p-8 sticky top-24 shadow-2xl">
                <h3 className="text-lg font-black italic uppercase mb-6 text-white">Resumen</h3>
                
                <div className="space-y-3 mb-8 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Plan ({order.plans?.name || '...'})</span>
                        <span className="font-mono text-zinc-200">{formatMoney(Number(order.amount_ars))}</span>
                    </div>
                    {order.extra_video && (
                        <div className="flex justify-between text-indigo-400 font-bold">
                            <span>+ Revisión Video</span>
                            <span className="font-mono">+{formatMoney(Number(order.extra_video_price_ars || 15000))}</span>
                        </div>
                    )}
                    <div className="pt-4 mt-2 border-t border-zinc-800 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Total</span>
                        <span className="text-3xl font-black text-emerald-500 italic">
                             {formatMoney(Number(order.amount_ars) + (order.extra_video ? Number(order.extra_video_price_ars || 15000) : 0))}
                        </span>
                    </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 mb-8 text-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Método</p>
                    <p className="text-sm font-bold uppercase text-white">{order.payment_method?.replace(/_/g, ' ')}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => updateStatus('paid')}
                        disabled={processing || order.status === 'paid'}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 uppercase"
                    >
                        {processing ? '...' : order.status === 'paid' ? 'Aprobado' : '✅ Aprobar Pago'}
                    </button>
                    
                    <button
                        onClick={() => updateStatus('rejected')}
                        disabled={processing || order.status === 'rejected'}
                        className="w-full py-4 bg-transparent border border-zinc-700 hover:border-red-500 hover:text-red-500 text-zinc-400 font-black text-[10px] tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 uppercase"
                    >
                        ❌ Rechazar
                    </button>

                    <div className="pt-4 mt-4 border-t border-white/5">
                        <button
                            onClick={deleteOrder}
                            disabled={processing}
                            className="w-full py-3 text-zinc-700 hover:text-red-800 text-[9px] font-black tracking-widest transition-colors uppercase"
                        >
                            Eliminar Registro
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}