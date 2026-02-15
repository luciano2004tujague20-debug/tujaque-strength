"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // URL base para los comprobantes en tu storage de Supabase
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/`;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    
    // 1. Buscamos los datos de esta orden específica en nuestro estado local
    const orderData = orders.find(o => o.id === id);

    // 2. Actualizamos el estado en la tabla de órdenes
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar estado");
    } else {
      // 3. LÓGICA AUTOMÁTICA: Si validás el pago, creamos al atleta
      if (newStatus === "paid" && orderData) {
        const { error: athleteError } = await supabase
          .from("athletes")
          .upsert({ 
            email: orderData.customer_email,
            full_name: orderData.customer_name,
            instagram: orderData.customer_ref || null
          }, { onConflict: 'email' }); // Si ya existe el mail, no lo duplica, lo actualiza

        if (athleteError) {
          console.error("Error al crear atleta automático:", athleteError);
        }
      }

      // Actualizamos la lista visualmente
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
    setUpdatingId(null);
  }

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black italic animate-pulse tracking-widest leading-relaxed">Sincronizando Facturación...</div>;

  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white italic tracking-tighter">
          Control de <span className="text-emerald-400">Ventas y Pagos</span>
        </h1>
        <p className="text-zinc-500 text-xs font-bold tracking-widest mt-2 italic">Administración de ingresos y validación de comprobantes</p>
      </header>

      <div className="admin-glass-card !max-w-none overflow-x-auto border border-white/5 rounded-[2rem] bg-black/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[9px] text-emerald-400 font-black tracking-[0.2em]">
              <th className="py-6 px-8 ">Fecha / Cliente</th>
              <th className="py-6 px-8 ">Plan Adquirido</th>
              <th className="py-6 px-8 text-center ">Comprobante</th>
              <th className="py-6 px-8 text-center ">Estado del Pago</th>
              <th className="py-6 px-8 text-right ">Monto Total</th>
            </tr>
          </thead>
          <tbody className="text-sm text-white divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                {/* 1. DATOS DEL CLIENTE */}
                <td className="py-6 px-8">
                  <p className="text-[9px] text-zinc-600 font-mono mb-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-black tracking-tight text-lg text-emerald-50">{order.customer_name}</p>
                  <p className="text-[11px] text-zinc-500 italic lowercase">{order.customer_email}</p>
                </td>

                {/* 2. DETALLE DEL SERVICIO */}
                <td className="py-6 px-8">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-black italic text-xs text-white tracking-wider">
                      {order.plan_title || 'Plan Estándar'}
                    </span>
                    {order.extra_video && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black tracking-tighter">
                        + Auditoría Técnica Biomecánica
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. TICKET DE PAGO */}
                <td className="py-6 px-8 text-center">
                  <a 
                    href={order.receipt_url || `${storageUrl}${order.order_id}.jpg`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-emerald-500 px-4 py-2 rounded-xl text-[9px] font-black transition-all border border-white/10 tracking-widest hover:text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Ver Comprobante 📄
                  </a>
                </td>

                {/* 4. ACCIONES DE VALIDACIÓN */}
                <td className="py-6 px-8 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    {order.status === "paid" ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        Pago Verificado
                      </span>
                    ) : order.status === "rejected" ? (
                      <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                        ✖ Rechazado
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(order.id, "paid")} 
                          className="bg-emerald-500 text-black text-[9px] font-black px-4 py-2 rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                          disabled={updatingId === order.id}
                        >
                          {updatingId === order.id ? "..." : "Validar"}
                        </button>
                        <button 
                          onClick={() => updateStatus(order.id, "rejected")} 
                          className="bg-transparent text-red-500 text-[9px] font-black px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-all"
                          disabled={updatingId === order.id}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* 5. MONTO FINAL */}
                <td className="py-6 px-8 text-right">
                  <p className="font-mono font-black text-emerald-400 text-xl tracking-tighter italic">
                    ${(order.amount_ars || 0).toLocaleString()}
                  </p>
                  <p className="text-[8px] text-zinc-600 font-black tracking-[0.2em]">
                    {order.payment_method?.replace('_', ' ') || 'ARS'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="py-32 text-center text-zinc-700 text-[10px] font-black tracking-[0.5em] italic">No hay transacciones pendientes</div>
        )}
      </div>
    </div>
  );
}