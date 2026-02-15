"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ESTADOS PARA EL MODAL DE CREACIÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Estado del formulario (Por defecto ponemos uno de los planes mensuales)
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    email: "",
    password: "", 
    plan: "Fuerza Pro (3 Días)" 
  });

  useEffect(() => {
    fetchActiveAthletes();
  }, []);

  async function fetchActiveAthletes() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (!error) setAthletes(data || []);
    setLoading(false);
  }

  // --- FUNCIÓN DE CREACIÓN AUTOMÁTICA ---
  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      // 1. Calculamos el precio según el plan elegido
      let price = 50000;
      if (newAthlete.plan.includes("Fuerza Base")) price = 18000;
      if (newAthlete.plan.includes("Powerbuilding")) price = 32000;
      if (newAthlete.plan.includes("Fuerza Pro")) price = 50000;
      if (newAthlete.plan.includes("Elite Total")) price = 100000;

      // 2. Enviamos los datos a la API
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAthlete, price }), 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear atleta");
      }

      alert(`✅ ¡LISTO! Atleta creado.\n\nUsuario: ${newAthlete.email}\nContraseña: ${newAthlete.password}\nPlan: ${newAthlete.plan}\n\nEnviale estos datos por WhatsApp.`);
      setIsModalOpen(false);
      // Reseteamos el formulario
      setNewAthlete({ name: "", email: "", password: "", plan: "Fuerza Pro (3 Días)" });
      fetchActiveAthletes();

    } catch (error: any) {
      alert("❌ Ocurrió un error: " + error.message);
    } finally {
      setCreating(false);
    }
  }

  // --- RESTO DE TUS FUNCIONES ---
  async function updateFeedback(id: string, feedback: string) {
    setUpdatingId(`${id}-feedback`);
    const { error } = await supabase.from("orders").update({ biomechanic_feedback: feedback }).eq("id", id);
    if (error) alert("Error al guardar el feedback técnico");
    setUpdatingId(null);
  }

  async function updateDailyRoutine(id: string, day: string, text: string) {
    setUpdatingId(`${id}-${day}`);
    const column = `routine_${day}`;
    const { error } = await supabase.from("orders").update({ [column]: text }).eq("id", id);
    if (error) alert(`Error al guardar Sesión ${day.toUpperCase()}`);
    setUpdatingId(null);
  }

  const filteredAthletes = athletes.filter(a =>
    a.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black uppercase italic animate-pulse">Sincronizando Estación de Análisis...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 relative">
      
      {/* HEADER */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            Gestión de <span className="text-emerald-400">Atletas</span>
          </h1>
          <div className="mt-8">
            <input
              type="text"
              placeholder="BUSCAR POR NOMBRE O EMAIL..."
              className="w-full md:w-[400px] bg-[#111113] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <span>+</span> Crear Nuevo Atleta
        </button>
      </header>

      {/* --- MODAL DE CREACIÓN AUTOMÁTICA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0c0e] border border-emerald-500/30 rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white font-black text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-black italic uppercase text-white mb-8 border-b border-white/10 pb-4">
              Alta <span className="text-emerald-500">Automática</span>
            </h2>

            <form onSubmit={handleCreateAthlete} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={newAthlete.name}
                  onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Ej: Juan Perez"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Email del Atleta</label>
                <input 
                  type="email" 
                  required
                  value={newAthlete.email}
                  onChange={(e) => setNewAthlete({...newAthlete, email: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="ejemplo@gmail.com"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Contraseña Provisoria</label>
                <input 
                  type="text" 
                  required
                  value={newAthlete.password}
                  onChange={(e) => setNewAthlete({...newAthlete, password: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Ej: Tujaque2026"
                />
              </div>

              {/* AQUÍ ESTÁN LOS 4 PLANES CORRECTOS */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Plan Seleccionado</label>
                <select 
                  value={newAthlete.plan}
                  onChange={(e) => setNewAthlete({...newAthlete, plan: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors appearance-none uppercase text-xs font-bold cursor-pointer"
                >
                  <option value="Fuerza Base (3 Días)">Fuerza Base (3 Días) - Semanal</option>
                  <option value="Powerbuilding (5 Días)">Powerbuilding (5 Días) - Semanal</option>
                  <option value="Fuerza Pro (3 Días)">Fuerza Pro (3 Días) - Mensual</option>
                  <option value="Elite Total (5 Días)">Elite Total (5 Días) - Mensual</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={creating}
                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all mt-4 disabled:opacity-50"
              >
                {creating ? "Creando Usuario..." : "DAR DE ALTA AHORA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE ATLETAS */}
      <div className="space-y-24">
        {filteredAthletes.length === 0 ? (
           <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest text-zinc-500">No se encontraron atletas activos</div>
        ) : (
          filteredAthletes.map((athlete) => (
            <section key={athlete.id} className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              
              <div className="p-10 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent flex flex-col md:flex-row justify-between gap-10">
                <div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter">
                      {athlete.customer_name}
                    </h2>
                    {((athlete.video_sq_url || athlete.video_bp_url || athlete.video_dl_url) && !athlete.biomechanic_feedback) && (
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]" title="Auditoría técnica pendiente"></span>
                    )}
                  </div>
                  <p className="text-zinc-500 font-mono text-sm mt-2">{athlete.customer_email}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-emerald-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic">
                      {athlete.plan_title}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                  {[
                    { label: 'SENTADILLA', val: athlete.squat_pr },
                    { label: 'BANCA', val: athlete.bench_pr },
                    { label: 'PESO MUERTO', val: athlete.deadlift_pr }
                  ].map(pr => (
                    <div key={pr.label} className="bg-black p-6 rounded-[2rem] border border-white/10 min-w-[140px] text-center">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{pr.label}</p>
                      <p className="text-3xl font-black italic text-emerald-400">{pr.val || '0'}<span className="text-xs ml-1">KG</span></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 bg-[#111113]/50 border-b border-white/5">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-8 italic">Análisis Biomecánico Semanal</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                  {[
                    { label: 'SENTADILLA', url: athlete.video_sq_url },
                    { label: 'BANCA', url: athlete.video_bp_url },
                    { label: 'PESO MUERTO', url: athlete.video_dl_url }
                  ].map((video) => (
                    <div key={video.label} className="bg-black/60 rounded-3xl p-4 border border-white/10 overflow-hidden">
                      <p className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-widest text-center">{video.label}</p>
                      {video.url ? (
                        <video src={video.url} controls className="w-full aspect-video rounded-xl bg-black" />
                      ) : (
                        <div className="aspect-video flex items-center justify-center text-[8px] text-zinc-700 font-black uppercase italic text-center px-4">
                          Esperando carga...
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="relative group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest group-focus-within:text-emerald-400 transition-colors">Correcciones del Coach</label>
                    {updatingId === `${athlete.id}-feedback` && (
                      <span className="text-[9px] text-emerald-500 animate-pulse font-black uppercase italic">Enviando correcciones...</span>
                    )}
                  </div>
                  <textarea
                    className="w-full bg-[#111113] border border-white/10 rounded-[1.5rem] p-6 text-sm text-emerald-50 focus:border-emerald-500/50 outline-none transition-all min-h-[120px] font-mono leading-relaxed resize-y italic"
                    placeholder="Escribí acá el análisis..."
                    defaultValue={athlete.biomechanic_feedback || ""}
                    onBlur={(e) => updateFeedback(athlete.id, e.target.value)}
                  />
                </div>
              </div>

              <div className="p-10 bg-black/20">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8 italic">Programación de Sesiones</h3>
                <div className="grid grid-cols-1 gap-10">
                  {['d1', 'd2', 'd3', 'd4', 'd5'].map((day) => (
                    <div key={day} className="relative group">
                      <div className="flex justify-between items-center mb-3 px-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-focus-within:text-white transition-colors">Sesión {day.toUpperCase()}</label>
                        {updatingId === `${athlete.id}-${day}` && (
                          <span className="text-[9px] text-emerald-500 animate-pulse font-black uppercase">Guardando...</span>
                        )}
                      </div>
                      <textarea
                        className="w-full bg-[#111113] border border-white/5 rounded-[1.5rem] p-8 text-lg text-zinc-300 focus:border-emerald-500/30 outline-none transition-all min-h-[250px] font-mono leading-relaxed resize-y"
                        defaultValue={athlete[`routine_${day}`] || ""}
                        onBlur={(e) => updateDailyRoutine(athlete.id, day, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}