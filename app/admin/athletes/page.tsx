"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
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
    // CAMBIO: Ahora consultamos la tabla 'athletes' directamente
    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setAthletes(data || []);
    setLoading(false);
  }

  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      let price = 50000;
      if (newAthlete.plan.includes("Fuerza Base")) price = 18000;
      if (newAthlete.plan.includes("Powerbuilding")) price = 32000;
      if (newAthlete.plan.includes("Fuerza Pro")) price = 50000;
      if (newAthlete.plan.includes("Elite Total")) price = 100000;

      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAthlete, price }), 
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al crear atleta");

      alert(`✅ Atleta creado.\nUsuario: ${newAthlete.email}\nContraseña: ${newAthlete.password}`);
      setIsModalOpen(false);
      setNewAthlete({ name: "", email: "", password: "", plan: "Fuerza Pro (3 Días)" });
      fetchActiveAthletes();

    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateFeedback(id: string, feedback: string) {
    setUpdatingId(`${id}-feedback`);
    const { error } = await supabase.from("athletes").update({ biomechanic_feedback: feedback }).eq("id", id);
    if (error) alert("Error al guardar el feedback técnico");
    setUpdatingId(null);
  }

  async function updateDailyRoutine(id: string, day: string, text: string) {
    setUpdatingId(`${id}-${day}`);
    const column = `routine_${day}`;
    const { error } = await supabase.from("athletes").update({ [column]: text }).eq("id", id);
    if (error) alert(`Error al guardar Sesión ${day}`);
    setUpdatingId(null);
  }

  const filteredAthletes = athletes.filter(a =>
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black italic animate-pulse">Sincronizando Estación de Análisis...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 relative">
      
      {/* HEADER */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">
            Gestión de <span className="text-emerald-400">Atletas</span>
          </h1>
          <div className="mt-8">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full md:w-[400px] bg-[#111113] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest outline-none focus:border-emerald-500 transition-all text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <span>+</span> Crear Nuevo Atleta
        </button>
      </header>

      {/* MODAL DE CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0c0e] border border-emerald-500/30 rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white font-black text-xl">✕</button>
            <h2 className="text-2xl font-black italic text-white mb-8 border-b border-white/10 pb-4">Alta <span className="text-emerald-500">Manual</span></h2>
            <form onSubmit={handleCreateAthlete} className="space-y-4">
              <input type="text" required placeholder="Nombre Completo" value={newAthlete.name} onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
              <input type="email" required placeholder="Email del Atleta" value={newAthlete.email} onChange={(e) => setNewAthlete({...newAthlete, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
              <input type="text" required placeholder="Contraseña Provisoria" value={newAthlete.password} onChange={(e) => setNewAthlete({...newAthlete, password: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
              <select value={newAthlete.plan} onChange={(e) => setNewAthlete({...newAthlete, plan: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 text-xs font-bold">
                <option value="Fuerza Base (3 Días)">Fuerza Base (3 Días)</option>
                <option value="Powerbuilding (5 Días)">Powerbuilding (5 Días)</option>
                <option value="Fuerza Pro (3 Días)">Fuerza Pro (3 Días)</option>
                <option value="Elite Total (5 Días)">Elite Total (5 Días)</option>
              </select>
              <button type="submit" disabled={creating} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black tracking-widest text-xs hover:bg-emerald-400 transition-all">{creating ? "PROCESANDO..." : "DAR DE ALTA"}</button>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE ATLETAS */}
      <div className="space-y-24">
        {filteredAthletes.length === 0 ? (
           <div className="text-center py-20 opacity-50 font-black tracking-widest text-zinc-500 italic">No hay atletas registrados</div>
        ) : (
          filteredAthletes.map((athlete) => (
            <section key={athlete.id} className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              
              <div className="p-10 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent flex flex-col md:flex-row justify-between gap-10">
                <div>
                  <h2 className="text-4xl font-black italic text-white tracking-tighter">{athlete.full_name}</h2>
                  <p className="text-zinc-500 font-mono text-sm mt-2">{athlete.email}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-emerald-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full italic">{athlete.plan_title || "Plan Personalizado"}</span>
                  </div>
                </div>

                {/* LOS 3 BÁSICOS (Marcas de la tabla athletes) */}
                <div className="flex gap-4 flex-wrap">
                  {[
                    { label: 'SENTADILLA', val: athlete.squat_1rm },
                    { label: 'BANCA', val: athlete.bench_1rm },
                    { label: 'PESO MUERTO', val: athlete.deadlift_1rm }
                  ].map(pr => (
                    <div key={pr.label} className="bg-black p-6 rounded-[2rem] border border-white/10 min-w-[140px] text-center">
                      <p className="text-[9px] font-black text-zinc-600 tracking-widest mb-1">{pr.label}</p>
                      <p className="text-3xl font-black italic text-emerald-400">{pr.val || '0'}<span className="text-xs ml-1">KG</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ANÁLISIS DE VIDEOS */}
              <div className="p-10 bg-[#111113]/50 border-b border-white/5">
                <h3 className="text-[10px] font-black text-emerald-500 tracking-[0.4em] mb-8 italic">Análisis Biomecánico Semanal</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                  {[
                    { label: 'SENTADILLA', url: athlete.video_sq_url },
                    { label: 'BANCA', url: athlete.video_bp_url },
                    { label: 'PESO MUERTO', url: athlete.video_dl_url }
                  ].map((video) => (
                    <div key={video.label} className="bg-black/60 rounded-3xl p-4 border border-white/10">
                      <p className="text-[9px] font-black text-zinc-500 mb-3 tracking-widest text-center">{video.label}</p>
                      {video.url ? <video src={video.url} controls className="w-full aspect-video rounded-xl" /> : <div className="aspect-video flex items-center justify-center text-[8px] text-zinc-700 italic text-center px-4">Esperando carga...</div>}
                    </div>
                  ))}
                </div>

                {/* CORRECCIONES (Acepta minúsculas) */}
                <div className="relative group">
                  <label className="text-xs font-black text-zinc-500 tracking-widest block mb-3 italic">Correcciones del Coach</label>
                  <textarea
                    className="w-full bg-[#111113] border border-white/10 rounded-[1.5rem] p-6 text-sm text-emerald-50 outline-none transition-all min-h-[120px] font-mono leading-relaxed italic"
                    placeholder="Escribí acá el análisis..."
                    defaultValue={athlete.biomechanic_feedback || ""}
                    onBlur={(e) => updateFeedback(athlete.id, e.target.value)}
                  />
                </div>
              </div>

              {/* PROGRAMACIÓN (Acepta minúsculas) */}
              <div className="p-10 bg-black/20">
                <h3 className="text-[10px] font-black text-zinc-600 tracking-[0.4em] mb-8 italic">Programación de Sesiones</h3>
                <div className="grid grid-cols-1 gap-10">
                  {['d1', 'd2', 'd3', 'd4', 'd5'].map((day) => (
                    <div key={day}>
                      <label className="text-[10px] font-black text-zinc-600 tracking-widest block mb-3 px-2 italic">Sesión {day.toUpperCase()}</label>
                      <textarea
                        className="w-full bg-[#111113] border border-white/5 rounded-[1.5rem] p-8 text-lg text-zinc-300 outline-none transition-all min-h-[250px] font-mono leading-relaxed"
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