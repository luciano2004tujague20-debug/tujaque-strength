"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(*)") 
      .eq("order_id", orderId)
      .single();

    if (error) {
        console.error("Error:", error);
    }
    
    if (data) setOrder(data);
    setLoading(false);
  }

  // --- FUNCIÓN 1: CAMBIAR ESTADO (Aprobar/Rechazar) ---
  async function updateStatus(newStatus: string) {
    if (!confirm(`¿Confirmás cambiar el estado a ${newStatus.toUpperCase()}?`)) return;
    
    setUpdating(true);
    const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("order_id", orderId);

    if (error) {
        alert("Error al actualizar: " + error.message);
    } else {
        setOrder({ ...order, status: newStatus });
        alert(`✅ Orden actualizada a: ${newStatus.toUpperCase()}`);
    }
    setUpdating(false);
  }

  // --- FUNCIÓN 2: ELIMINAR ORDEN (Lo que pediste) ---
  async function deleteOrder() {
    const confirmDelete = confirm("⚠️ ¿ESTÁS SEGURO DE ELIMINAR ESTA ORDEN?\n\nEsta acción es irreversible. Se borrarán todos los datos, rutinas y pagos asociados.");
    
    if (!confirmDelete) return;

    setUpdating(true);
    const { error } = await supabase
        .from("orders")
        .delete()
        .eq("order_id", orderId);

    if (error) {
        alert("❌ Error al eliminar: " + error.message);
        setUpdating(false);
    } else {
        alert("🗑️ Orden eliminada correctamente.");
        router.push("/admin/orders"); // Te devuelve a la lista
    }
  }

  const getReceiptUrl = (path: string) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${path}`;
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse uppercase tracking-widest">Cargando Sistema...</div>;
  if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Orden no encontrada.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-6">
                <Link href="/admin/orders" className="bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black w-12 h-12 flex items-center justify-center rounded-xl transition-all font-bold shadow-lg">
                    ←
                </Link>
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                        Gestión de <span className="text-emerald-500">Pagos</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-zinc-500 text-xs font-mono bg-zinc-900 px-2 py-1 rounded">ID: {order.order_id}</p>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                            order.status === 'paid' ? 'bg-emerald-500 text-black' : 
                            order.status === 'rejected' ? 'bg-red-500 text-white' : 
                            'bg-yellow-500 text-black'
                        }`}>
                            {order.status === 'paid' ? 'APROBADO' : order.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: DETALLES */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* DATOS CLIENTE */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem]">
                    <h3 className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        👤 Datos del Cliente
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Nombre Completo</p>
                            <p className="text-xl font-bold text-white capitalize">{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Email (Acceso)</p>
                            <p className="text-sm font-mono text-zinc-300">{order.customer_email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Instagram</p>
                            <p className="text-sm font-bold text-white">{order.customer_instagram || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Contraseña</p>
                            <p className="text-sm font-mono text-zinc-400 bg-black/50 p-2 rounded inline-block">
                                {order.password || 'No asignada'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* DETALLES FINANCIEROS */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem]">
                    <h3 className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        💳 Detalles Financieros
                    </h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Plan Seleccionado</p>
                                <p className="text-lg font-bold text-white">{order.plans?.name || 'Plan Personalizado'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Método de Pago</p>
                                <p className="text-sm font-bold text-white uppercase">{order.payment_method?.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <p className="text-xs text-zinc-500 uppercase font-bold">Monto Total</p>
                            <p className="text-4xl font-black italic text-emerald-400">
                                ${Number(order.amount_ars).toLocaleString()} <span className="text-sm text-zinc-500 not-italic">ARS</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- ACCIONES ADMINISTRATIVAS (ACÁ ESTÁ EL BOTÓN DE BORRAR) --- */}
                <div className="bg-black border border-zinc-800 p-8 rounded-[2rem]">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-6">Acciones Administrativas</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button 
                            onClick={() => updateStatus('paid')}
                            disabled={updating || order.status === 'paid'}
                            className={`py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                                order.status === 'paid' 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed' 
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02]'
                            }`}
                        >
                            {order.status === 'paid' ? '✓ Pago Aprobado' : '✅ Aprobar Pago'}
                        </button>
                        
                        <button 
                             onClick={() => updateStatus('rejected')}
                             disabled={updating || order.status === 'rejected'}
                             className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
                        >
                            🚫 Rechazar
                        </button>
                    </div>

                    {/* BOTÓN DE ELIMINAR (EL QUE PEDISTE) */}
                    <button 
                        onClick={deleteOrder}
                        disabled={updating}
                        className="w-full bg-red-900/20 hover:bg-red-600 hover:text-white text-red-500 border border-red-900/40 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                    >
                        🗑️ Eliminar Orden Definitivamente
                    </button>
                </div>
            </div>

            {/* COLUMNA DERECHA: COMPROBANTE */}
            <div className="lg:col-span-1">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] h-full flex flex-col">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-6 text-center">
                        Comprobante Adjunto
                    </h3>
                    
                    <div className="flex-1 bg-black rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden relative min-h-[400px]">
                        {order.receipt_url ? (
                            <>
                                <img 
                                    src={getReceiptUrl(order.receipt_url)!}
                                    alt="Comprobante de pago" 
                                    className="object-contain w-full h-full absolute inset-0"
                                />
                                <a 
                                    href={getReceiptUrl(order.receipt_url)!} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all"
                                >
                                    🔍 Ver Original
                                </a>
                            </>
                        ) : (
                            <div className="text-center p-6 opacity-50">
                                <span className="text-6xl block mb-4">📄</span>
                                <p className="text-sm font-bold text-zinc-400 uppercase">Sin comprobante subido</p>
                                <p className="text-[10px] text-zinc-600 mt-2">El cliente no subió foto todavía</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}