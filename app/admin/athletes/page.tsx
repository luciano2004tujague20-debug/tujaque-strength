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
    // 1. Traemos los atletas activos (pagados)
    const { data: athletesData } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .eq("status", "paid") 
      .order("created_at", { ascending: false });

    // 2. Traemos los planes
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

  // --- CREAR ATLETA ---
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

  // --- BORRAR ATLETA ---
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
    <div className="p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Gestión de <span className="text-emerald-500">Atletas</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2">Usuarios activos en la plataforma</p>
          </div>
          
          <button 
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
              + Nuevo Atleta
          </button>
        </div>

        {/* LISTA DE ATLETAS */}
        <div className="grid gap-4">
          {loading ? (
            <p className="text-center py-20 italic text-zinc-600">Cargando atletas...</p>
          ) : (
            athletes.map((athlete) => (
              <div 
                key={athlete.id} 
                className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-500/20 transition-all"
              >
                {/* INFO DEL ATLETA */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-500 font-black text-xl shadow-lg">
                    {athlete.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{athlete.customer_name}</p>
                    <div className="flex gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                        <span>{athlete.customer_email}</span>
                        <span className="text-zinc-700">|</span>
                        <span className="text-emerald-400">{athlete.plans?.name || 'Personalizado'}</span>
                    </div>
                    {athlete.password && (
                        <p className="text-[9px] text-zinc-600 mt-1">🔑 Clave: {athlete.password}</p>
                    )}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex gap-3 w-full md:w-auto">
                   
                   {/* ✅ LINK CORREGIDO: AHORA LLEVA A /admin/athletes/... */}
                   <Link 
                      href={`/admin/athletes/${athlete.order_id}`} 
                      className="flex-1 md:flex-none bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center border border-white/5"
                   >
                      Gestionar Rutina
                   </Link>

                   {/* BOTÓN BORRAR */}
                   <button 
                      onClick={() => handleDelete(athlete.order_id, athlete.customer_name)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl transition-all border border-red-500/20"
                      title="Eliminar Atleta"
                   >
                      🗑️
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL ALTA MANUAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-zinc-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 text-zinc-600 hover:text-white font-bold"
                >✕</button>

                <h2 className="text-2xl font-black italic uppercase text-white mb-8">Alta <span className="text-emerald-500">Manual</span></h2>
                
                <form onSubmit={handleCreateAthlete} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Nombre Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-800 font-medium"
                            placeholder="Ej: Luciano Tujague"
                            value={newAthlete.name}
                            onChange={e => setNewAthlete({...newAthlete, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Email (Acceso)</label>
                        <input 
                            required
                            type="email" 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-800 font-medium"
                            placeholder="usuario@email.com"
                            value={newAthlete.email}
                            onChange={e => setNewAthlete({...newAthlete, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Contraseña</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-800 font-medium"
                            placeholder="Clave para el atleta"
                            value={newAthlete.password}
                            onChange={e => setNewAthlete({...newAthlete, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Plan a Asignar</label>
                        <div className="relative">
                          <select 
                              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none appearance-none font-medium cursor-pointer"
                              value={newAthlete.planCode}
                              onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}
                          >
                              {plans.map(plan => (
                                  <option key={plan.id} value={plan.code}>
                                      {plan.name} - ${plan.price.toLocaleString()}
                                  </option>
                              ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={creating}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all mt-4"
                    >
                        {creating ? "Creando Acceso..." : "Crear Acceso"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}