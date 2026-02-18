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
  
  // ESTADOS DEL MODAL (VENTANA EMERGENTE)
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
    // 1. Traemos las órdenes
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });

    // 2. Traemos los planes para el formulario
    const { data: plansData } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (ordersData) setOrders(ordersData);
    if (plansData) {
        setPlans(plansData);
        // Pre-seleccionamos el primer plan si existe
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
      // Buscamos el precio real del plan seleccionado
      const selectedPlan = plans.find(p => p.code === newAthlete.planCode);
      const price = selectedPlan ? selectedPlan.price : 0;

      // Llamamos a la API que creaste en el paso anterior
      const res = await fetch("/api/admin/create-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAthlete, price })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("✅ Atleta creado correctamente");
      setShowModal(false); // Cerramos el modal
      setNewAthlete({ name: "", email: "", password: "", planCode: plans[0]?.code || "" });
      fetchData(); // Recargamos la lista para ver al nuevo
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
    <div className="p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: AQUI ESTÁ EL BOTÓN NUEVO */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Gestión de <span className="text-emerald-500">Órdenes</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2">Control de ingresos y aprobaciones</p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* --- ESTE ES EL BOTÓN NUEVO --- */}
            <button 
                onClick={() => setShowModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
                + Nuevo Atleta
            </button>
            {/* ----------------------------- */}

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-right min-w-[200px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Total Recaudado</p>
                <p className="text-2xl font-black italic text-white">${totalRecaudado.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* LISTA DE ÓRDENES */}
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

      {/* --- MODAL (VENTANA EMERGENTE) PARA CREAR ATLETA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 text-zinc-600 hover:text-white font-bold"
                >✕</button>

                <h2 className="text-2xl font-black italic uppercase text-white mb-6">Nuevo <span className="text-emerald-500">Atleta</span></h2>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Nombre Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
                            placeholder="Ej: Juan Perez"
                            value={newAthlete.name}
                            onChange={e => setNewAthlete({...newAthlete, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Gmail (Usuario)</label>
                        <input 
                            required
                            type="email" 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
                            placeholder="juan@gmail.com"
                            value={newAthlete.email}
                            onChange={e => setNewAthlete({...newAthlete, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Contraseña</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
                            placeholder="Clave de acceso"
                            value={newAthlete.password}
                            onChange={e => setNewAthlete({...newAthlete, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Plan a Asignar</label>
                        <select 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none appearance-none"
                            value={newAthlete.planCode}
                            onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}
                        >
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.code}>
                                    {plan.name} - ${plan.price.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 mt-8 pt-4 border-t border-zinc-900">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={creating}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
                        >
                            {creating ? "Guardando..." : "Confirmar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}