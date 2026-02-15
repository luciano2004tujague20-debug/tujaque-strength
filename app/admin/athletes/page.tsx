"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchActiveAthletes();
  }, []);

  async function fetchActiveAthletes() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "paid")
      .order("customer_name", { ascending: true });

    if (!error) setAthletes(data || []);
    setLoading(false);
  }

  // FUNCIÓN PARA GUARDAR CORRECCIONES TÉCNICAS
  async function updateFeedback(id: string, feedback: string) {
    setUpdatingId(`${id}-feedback`);
    const { error } = await supabase
      .from("orders")
      .update({ biomechanic_feedback: feedback })
      .eq("id", id);

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
    a.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black uppercase italic animate-pulse">Sincronizando Estación de Análisis...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <header className="mb-12">
        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
          Gestión de <span className="text-emerald-400">Atletas Elite</span>
        </h1>
        <div className="mt-8">
          <input
            type="text"
            placeholder="BUSCAR ATLETA POR NOMBRE..."
            className="w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all text-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="space-y-24">
        {filteredAthletes.map((athlete) => (
          <section key={athlete.id} className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            
            {/* CABECERA: PERFIL Y PRs */}
            <div className="p-10 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent flex flex-col md:flex-row justify-between gap-10">
              <div>
                <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter">{athlete.customer_name}</h2>
                <p className="text-zinc-500 font-mono text-sm mt-2">{athlete.customer_email}</p>
                <div className="mt-4 flex gap-2">
                   <span className="bg-emerald-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic">
                    {athlete.plan_title || 'Elite Athlete'}
                  </span>
                  {athlete.extra_video && (
                    <span className="bg-white/5 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic">
                      Requiere Auditoría Semanal
                    </span>
                  )}
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

            {/* SECCIÓN DE AUDITORÍA: VIDEOS Y FEEDBACK */}
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
                        Esperando carga del atleta...
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CAMPO DE FEEDBACK TÉCNICO */}
              <div className="relative group">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest group-focus-within:text-emerald-400 transition-colors">Correcciones del Coach</label>
                  {updatingId === `${athlete.id}-feedback` && (
                    <span className="text-[9px] text-emerald-500 animate-pulse font-black uppercase italic">Enviando correcciones...</span>
                  )}
                </div>
                <textarea
                  className="w-full bg-[#111113] border border-white/10 rounded-[1.5rem] p-6 text-sm text-emerald-50 focus:border-emerald-500/50 outline-none transition-all min-h-[120px] font-mono leading-relaxed resize-y italic"
                  placeholder="Escribí acá el análisis de trayectoria, bar-path y palancas..."
                  defaultValue={athlete.biomechanic_feedback || ""}
                  onBlur={(e) => updateFeedback(athlete.id, e.target.value)}
                />
              </div>
            </div>

            {/* PROGRAMACIÓN SEMANAL */}
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
        ))}
      </div>
    </div>
  );
}