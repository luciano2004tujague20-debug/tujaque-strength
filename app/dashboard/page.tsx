"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; 
import Link from "next/link";

export default function AthleteDashboard() {
  const [athlete, setAthlete] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('d1');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    getPlayerData();
  }, []);

  async function getPlayerData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // Buscamos en la tabla 'athletes' que es la base definitiva
      const { data: athleteData } = await supabase
        .from('athletes')
        .select('*')
        .eq('email', user.email)
        .single();
      
      setAthlete(athleteData);
    }
    setLoading(false);
  }

  // Actualizar RM desde el dashboard (si el atleta quiere anotar su progreso)
  const updatePR = async (lift: string, weight: string) => {
    const column = lift === 'Sentadilla' ? 'squat_1rm' : lift === 'Banca' ? 'bench_1rm' : 'deadlift_1rm';
    await supabase
      .from('athletes')
      .update({ [column]: parseFloat(weight) || 0 })
      .eq('email', user.email);
    
    // Actualizamos el estado local para que se vea el cambio sin recargar
    setAthlete({ ...athlete, [column]: weight });
  };

  const handleVideoUpload = async (event: any, liftKey: string) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      setUploading(liftKey);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${liftKey}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos-auditoria')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos-auditoria')
        .getPublicUrl(fileName);

      const column = liftKey === 'SQ' ? 'video_sq_url' : liftKey === 'BP' ? 'video_bp_url' : 'video_dl_url';
      
      const { error: updateError } = await supabase
        .from('athletes')
        .update({ [column]: publicUrl })
        .eq('email', user.email);

      if (updateError) throw updateError;
      alert("¡Video sincronizado! Luciano lo revisará pronto.");
      getPlayerData();
    } catch (error: any) {
      alert("Error en la subida: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-emerald-400 font-black italic animate-pulse">Iniciando Protocolo...</div>;

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-4 md:p-10 relative overflow-hidden font-sans print:bg-white print:text-black">
      <div className="fixed inset-0 tech-grid opacity-20 pointer-events-none print:hidden"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* CABECERA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-md print:hidden">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">
              Tujaque <span className="text-emerald-400">Strength</span>
            </h1>
            <p className="text-zinc-500 font-bold text-[10px] tracking-[0.4em] mt-2 italic">Atleta: {athlete?.full_name || user?.email}</p>
          </div>
          <div className="px-8 py-3 rounded-xl border-2 border-emerald-500/50 text-emerald-400 font-black text-xs tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            ● ACCESO ELITE
          </div>
        </header>

        {/* --- SECCIÓN DE RÉCORDS (1RM) DISEÑO IMPACTANTE --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 print:hidden">
          {[
            { name: 'Sentadilla', icon: 'SQ', key: 'squat_1rm', color: 'text-emerald-400' },
            { name: 'Banca', icon: 'BP', key: 'bench_1rm', color: 'text-blue-400' },
            { name: 'Peso Muerto', icon: 'DL', key: 'deadlift_1rm', color: 'text-red-400' }
          ].map((lift) => (
            <div key={lift.name} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center group hover:border-emerald-500/30 transition-all">
              <span className="text-[10px] font-black text-zinc-600 tracking-[0.3em] mb-4">{lift.name.toUpperCase()}</span>
              <div className="flex items-end gap-2">
                <input 
                  type="number" 
                  defaultValue={athlete?.[lift.key] || 0} 
                  onBlur={(e) => updatePR(lift.name, e.target.value)} 
                  className={`bg-transparent w-32 text-center text-6xl font-black italic outline-none ${lift.color} transition-all focus:scale-110`}
                />
                <span className="text-xl font-black text-white/20 italic mb-2">kg</span>
              </div>
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-4 gap-8 print:block">
          <div className="lg:col-span-3 space-y-8 print:w-full">
            
            {/* FEEDBACK TÉCNICO DE LUCIANO */}
            {athlete?.biomechanic_feedback && (
              <section className="bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden animate-fade-in print:border-black print:text-black">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 print:hidden">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <h3 className="text-[10px] font-black text-emerald-400 tracking-[0.3em]">Análisis Técnico de Luciano</h3>
                  </div>
                  <div className="text-white text-lg font-bold italic leading-relaxed whitespace-pre-wrap print:text-black print:text-sm">
                    "{athlete.biomechanic_feedback}"
                  </div>
                </div>
              </section>
            )}

            {/* PROGRAMACIÓN SEMANAL */}
            <section className="glass-card p-8 md:p-12 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm print:bg-white print:text-black">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 print:hidden">
                <h2 className="text-2xl font-black italic flex items-center gap-4">
                  <span className="w-3 h-10 bg-emerald-500 block rounded-full"></span>
                  Programación Semanal
                </h2>
                
                <div className="flex gap-4">
                  <button onClick={() => window.print()} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border border-white/10 italic">
                    🖨️ Descargar Sesión
                  </button>
                  <div className="flex gap-2">
                    {['d1', 'd2', 'd3', 'd4', 'd5'].map((day) => (
                      <button key={day} onClick={() => setActiveDay(day)} className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all border ${activeDay === day ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-zinc-500 border-white/5'}`}>
                        {day.slice(1).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden min-h-[300px] print:border-0">
                  {athlete?.[`routine_${activeDay}`] ? (
                    <div className="whitespace-pre-wrap text-zinc-300 font-bold text-lg p-8 md:p-12 leading-relaxed font-mono print:text-black print:p-0">
                      <div className="hidden print:block text-xl font-black mb-6 border-b-2 border-black pb-2">
                        Tujaque Strength - Sesión {activeDay.toUpperCase()}
                      </div>
                      {athlete[`routine_${activeDay}`]}
                    </div>
                  ) : (
                    <div className="py-32 text-center text-zinc-600 font-black italic tracking-widest text-xs">
                      No hay programación cargada para este día.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* COLUMNA LATERAL: AUDITORÍA DE VIDEOS */}
          <div className="space-y-8 print:hidden">
            <section className="glass-card p-8 border border-emerald-500/30 bg-emerald-500/5 rounded-[2rem]">
              <h3 className="font-black mb-3 italic text-lg tracking-tighter">Auditoría Técnica</h3>
              <p className="text-[10px] text-zinc-400 mb-8 font-bold leading-relaxed italic">Subí tus series pesadas para análisis biomecánico.</p>
              
              <div className="space-y-3">
                {[
                  { label: 'Sentadilla (SQ)', key: 'SQ', url: athlete?.video_sq_url },
                  { label: 'Banca (BP)', key: 'BP', url: athlete?.video_bp_url },
                  { label: 'Peso Muerto (DL)', key: 'DL', url: athlete?.video_dl_url }
                ].map((item) => (
                  <label key={item.key} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${item.url ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                    <span className="text-[10px] font-black tracking-widest">{item.key} {item.url && "✅"}</span>
                    <span className="text-[9px] font-black text-emerald-500 ">{uploading === item.key ? "..." : item.url ? "CAMBIAR" : "SUBIR"}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoUpload(e, item.key)} disabled={!!uploading} />
                  </label>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}