"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 1. Conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrderDetailPage() {
  const { orderId } = useParams(); // Esto define 'orderId'
  const router = useRouter();      // Esto define 'router'
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Esto define 'loading' y 'setLoading'

  // 2. Cargar los datos de la orden al entrar
  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, plans(name)")
        .eq("id", orderId)
        .single();
      setOrder(data);
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  // 3. Función para Aprobar o Rechazar (LA QUE TENÍAS EN ROJO)
  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      alert(`Orden marcada como: ${newStatus === 'paid' ? 'APROBADA' : 'RECHAZADA'}`);
      window.location.reload(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="p-10 text-white font-mono text-center">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-8 bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem]">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-emerald-500">
          Gestionar Orden
        </h1>
        
        <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
          <p className="text-sm text-gray-400 uppercase font-bold tracking-widest">Cliente</p>
          <p className="text-xl font-bold">{order.customer_name}</p>
          <p className="text-emerald-400 font-mono">${order.amount_ars?.toLocaleString('es-AR')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => updateStatus("paid")}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "PROCESANDO..." : "✅ APROBAR PAGO"}
          </button>
          
          <button
            onClick={() => updateStatus("rejected")}
            disabled={loading}
            className="bg-white/5 hover:bg-red-600/20 text-gray-500 hover:text-red-500 border border-white/10 py-5 rounded-2xl font-black transition-all"
          >
            ❌ RECHAZAR
          </button>
        </div>
      </div>
    </div>
  );
}