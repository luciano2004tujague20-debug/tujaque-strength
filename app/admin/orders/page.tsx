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
  const [plans, setPlans] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DEL MODAL
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    email: "",
    password: "",
    planCode: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });

    const { data: plansData } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (ordersData) setOrders(ordersData);
    if (plansData) {
        setPlans(plansData);
        if (plansData.length > 0) {
            setNewAthlete(prev => ({ ...prev, planCode: plansData[0].code }));
        }
    }
    setLoading(false);
  }

  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const selectedPlan = plans.find(p => p.code === newAthlete.planCode);
      const price = selectedPlan ? selectedPlan.price : 0;

      const res = await fetch("/api/admin/create-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAthlete, price })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("✅ Atleta creado correctamente");
      setShowModal(false);
      setNewAthlete({ name: "", email: "", password: "", planCode: plans[0]?.code || "" });
      fetchData(); 
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setCreating(false);
    }
  }

  const totalRecaudado = orders
    .filter((o) => o.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.amount_ars), 0);

  return (
    <div className="bg-transparent min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-zinc-900/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-md">
              Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Órdenes</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium">Control de ingresos, pagos y altas manuales</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <button 
                onClick={() => setShowModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95"
            >
                + Nuevo Atleta
            </button>

            <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 p-5 rounded-2xl text-right min-w-[200px] shadow-lg shadow-emerald-500/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 flex items-center justify-end gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Total Recaudado
                </p>
                <p className="text-3xl font-black italic text-white tracking-tight">${totalRecaudado.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* LISTA DE ÓRDENES */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
               <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Escaneando base de datos...</p>
            </div>
          ) : (
            orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/admin/orders/${order.order_id}`}
                className="group bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-3xl hover:border-emerald-500/40 hover:bg-zinc-800/80 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left">
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    order.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_#10b981]' : 
                    order.status === 'under_review' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_#3b82f6]' : 'bg-zinc-800 border-zinc-700'
                  }`}>
                     <div className={`w-3 h-3 rounded-full ${
                        order.status === 'paid' ? 'bg-emerald-500' : 
                        order.status === 'under_review' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'
                     }`} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{order.customer_name}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-1 bg-black/50 inline-block px-2 py-1 rounded-md border border-zinc-800">
                      ID: {order.order_id.slice(0,8)}... | {order.customer_email}
                    </p>
                  </div>
                </div>

                <div className="text-center w-full md:w-auto bg-black/30 px-6 py-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Plan Contratado</p>
                  <p className="text-sm font-bold text-zinc-200">{order.plans?.name || 'Plan Eliminado'}</p>
                </div>

                <div className="text-center md:text-right w-full md:w-auto">
                  <p className="text-3xl font-black text-white italic tracking-tighter">${Number(order.amount_ars).toLocaleString()}</p>
                  <div className={`inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    order.status === 'under_review' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL (VENTANA EMERGENTE) PREMIUM --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                
                {/* Decoración Modal */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none -mr-10 -mt-10"></div>

                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800"
                >✕</button>

                <h2 className="text-3xl font-black italic uppercase text-white mb-2">Nuevo <span className="text-emerald-500">Atleta</span></h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8">Creación de ficha y acceso</p>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5 relative z-10">
                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Nombre Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700"
                            placeholder="Ej: Juan Perez"
                            value={newAthlete.name}
                            onChange={e => setNewAthlete({...newAthlete, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Email (Acceso Atleta)</label>
                        <input 
                            required
                            type="email" 
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700"
                            placeholder="usuario@email.com"
                            value={newAthlete.email}
                            onChange={e => setNewAthlete({...newAthlete, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Contraseña</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700"
                            placeholder="Clave para el atleta"
                            value={newAthlete.password}
                            onChange={e => setNewAthlete({...newAthlete, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Plan a Asignar</label>
                        <div className="relative">
                          <select 
                              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all"
                              value={newAthlete.planCode}
                              onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}
                          >
                              {plans.map(plan => (
                                  <option key={plan.id} value={plan.code} className="bg-zinc-900">
                                      {plan.name} - ${plan.price.toLocaleString()}
                                  </option>
                              ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={creating}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all mt-6 disabled:opacity-50"
                    >
                        {creating ? "AUTORIZANDO..." : "CREAR FICHA Y ACCESO"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}