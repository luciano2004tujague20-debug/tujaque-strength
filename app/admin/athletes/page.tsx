"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminAthletesPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
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
    const { data: athletesData } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .eq("status", "paid") 
      .order("created_at", { ascending: false });

    const { data: plansData } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (athletesData) setAthletes(athletesData);
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

  async function handleDelete(id: string, name: string) {
    const confirmDelete = confirm(`¿Estás seguro de ELIMINAR a ${name}?\n\nSe borrará su acceso, rutinas y datos de pago. Esta acción no se puede deshacer.`);
    
    if (confirmDelete) {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('order_id', id);

        if (error) {
            alert("❌ Error al borrar: " + error.message);
        } else {
            alert("🗑️ Atleta eliminado.");
            fetchData(); 
        }
    }
  }

  return (
    <div className="bg-transparent min-h-screen text-white font-sans pb-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-zinc-900/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-md">
              Plantel de <span className="text-emerald-500">Atletas</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium">Gestión de entrenamientos y credenciales activas</p>
          </div>
          
          <button 
              onClick={() => setShowModal(true)}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95"
          >
              + Nuevo Atleta
          </button>
        </div>

        {/* LISTA DE ATLETAS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
             <div className="xl:col-span-2 flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
             </div>
          ) : athletes.length === 0 ? (
             <div className="xl:col-span-2 text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 font-bold uppercase tracking-widest">No hay atletas activos todavía.</p>
             </div>
          ) : (
            athletes.map((athlete) => (
              <div 
                key={athlete.id} 
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:bg-zinc-900/80 hover:border-emerald-500/30 transition-all duration-300 shadow-lg"
              >
                {/* INFO DEL ATLETA */}
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {athlete.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-black text-white uppercase tracking-tight">{athlete.customer_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="bg-black text-[9px] text-zinc-400 font-mono px-2 py-1 rounded border border-zinc-800">{athlete.customer_email}</span>
                        <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">{athlete.plans?.name || 'Personalizado'}</span>
                    </div>
                    {athlete.password && (
                        <p className="text-[10px] text-zinc-500 mt-2 font-medium flex items-center gap-1">
                          <span className="text-emerald-500">🔑 Clave:</span> <span className="bg-black/50 px-2 py-0.5 rounded font-mono text-zinc-300">{athlete.password}</span>
                        </p>
                    )}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex gap-3 w-full sm:w-auto border-t border-white/5 sm:border-none pt-4 sm:pt-0">
                   <Link 
                      href={`/admin/athletes/${athlete.order_id}`} 
                      className="flex-1 sm:flex-none bg-black hover:bg-emerald-500 text-white hover:text-black px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center border border-zinc-700 hover:border-emerald-500 shadow-md"
                   >
                      Gestión ⚙️
                   </Link>

                   <button 
                      onClick={() => handleDelete(athlete.order_id, athlete.customer_name)}
                      className="bg-zinc-900/50 hover:bg-red-600 hover:text-white text-zinc-600 px-5 py-4 rounded-xl transition-all border border-zinc-800 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      title="Eliminar Atleta"
                   >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL ALTA MANUAL (ESTILO PREMIUM) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none -mr-10 -mt-10"></div>

                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800"
                >✕</button>

                <h2 className="text-3xl font-black italic uppercase text-white mb-2">Alta <span className="text-emerald-500">Manual</span></h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8">Crear nuevo acceso directo</p>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5 relative z-10">
                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Nombre Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700"
                            placeholder="Ej: Luciano Tujague"
                            value={newAthlete.name}
                            onChange={e => setNewAthlete({...newAthlete, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Email (Acceso)</label>
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
                        {creating ? "CREANDO ACCESO..." : "CREAR FICHA"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}