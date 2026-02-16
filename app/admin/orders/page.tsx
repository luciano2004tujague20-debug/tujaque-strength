"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  const totalRecaudado = orders
    .filter((o) => o.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.amount_ars), 0);

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Gestión de <span className="text-emerald-500">Órdenes</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2">Control de ingresos y aprobaciones</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Total Recaudado</p>
            <p className="text-3xl font-black italic text-white">${totalRecaudado.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <p className="text-center py-20 italic text-zinc-600">Cargando historial...</p>
          ) : (
            orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/admin/orders/${order.order_id}`}
                className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'paid' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                    order.status === 'under_review' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'
                  }`} />
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{order.customer_name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{order.order_id} | {order.customer_email}</p>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Plan</p>
                  <p className="text-sm font-bold text-zinc-300">{order.plans?.name || 'Plan Eliminado'}</p>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-2xl font-black text-white italic">${Number(order.amount_ars).toLocaleString()}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                    order.status === 'paid' ? 'text-emerald-500' : 'text-zinc-500'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}