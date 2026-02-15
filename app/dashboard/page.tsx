"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; 
import Link from "next/link";

export default function AthleteDashboard() {
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
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
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .eq('status', 'paid') 
        .single();
      setPlan(order);
    }
    setLoading(false);
  }

  const updatePR = async (lift: string, weight: string) => {
    const column = lift === 'Sentadilla' ? 'squat_pr' : lift === 'Banca' ? 'bench_pr' : 'deadlift_pr';
    await supabase
      .from('orders')
      .update({ [column]: weight })
      .eq('customer_email', user.email);
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
        .from('orders')
        .update({ [column]: publicUrl })
        .eq('customer_email', user.email);

      if (updateError) throw updateError;
      alert("Video sincronizado. Luciano iniciará la auditoría pronto.");
      getPlayerData();
    } catch (error: any) {
      alert("Error en el protocolo de subida: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-emerald-400 font-black uppercase italic animate-pulse">Iniciando Protocolo...</div>;

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-4 md:p-10 relative overflow-hidden font-sans">
      <div className="fixed inset-0 tech-grid opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* CABECERA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Tujaque <span className="text-emerald-400">Strength</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Atleta: {user?.email}</p>
          </div>
          <div className={`px-8 py-3 rounded-xl border-2 font-black uppercase text-xs tracking-widest ${plan ? "border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "border-yellow-500/50 text-yellow-500 animate-pulse"}`}>
            {plan ? "● ACCESO ELITE" : "○ VALIDANDO PAGO"}
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            
            {/* --- BLOQUE DE FEEDBACK TÉCNICO (AGREGADO) --- */}
            {plan?.biomechanic_feedback && (
              <section className="bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 p-6 opacity-10 select-none pointer-events-none">
                  <span className="text-6xl font-black italic uppercase text-emerald-500">FEEDBACK</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Análisis Técnico de Luciano</h3>
                  </div>
                  <div className="text-white text-lg font-bold italic leading-relaxed whitespace-pre-wrap">
                    "{plan.biomechanic_feedback}"
                  </div>
                </div>
              </section>
            )}

            {/* PROGRAMACIÓN */}
            <section className="glass-card p-8 md:p-12 border-emerald-500/20 relative overflow-hidden rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-4">
                  <span className="w-3 h-10 bg-emerald-500 block rounded-full"></span>
                  Programación Semanal
                </h2>
                <div className="flex flex-wrap gap-2">
                  {['d1', 'd2', 'd3', 'd4', 'd5'].map((day) => (
                    <button key={day} onClick={() => setActiveDay(day)} className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border ${activeDay === day ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20'}`}>
                      Día {day.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {plan ? (
                <div className="space-y-10">
                  <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 italic text-emerald-100/80 text-sm leading-relaxed">
                    <span className="font-black uppercase block text-[9px] tracking-widest mb-2 text-emerald-400">Instrucciones de Luciano:</span>
                    "Foco absoluto en la fase excéntrica de 6 segundos. No sacrifiques tempo por kilogramos."
                  </div>
                  <div className="bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden min-h-[300px]">
                    {plan[`routine_${activeDay}`] ? (
                      <div className="whitespace-pre-wrap text-zinc-300 font-bold text-lg p-8 md:p-12 leading-relaxed font-mono">
                        {plan[`routine_${activeDay}`]}
                      </div>
                    ) : (
                      <div className="py-32 text-center text-zinc-600 font-black uppercase italic tracking-widest text-xs">Sincronizando...</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-32 border-2 border-dashed border-white/10 rounded-[2rem]">ESPERANDO ACTIVACIÓN...</div>
              )}
            </section>
          </div>

          {/* COLUMNA LATERAL */}
          <div className="space-y-8">
            <section className="glass-card p-8 border border-white/5 rounded-[2rem] bg-white/[0.02]">
              <h3 className="font-black uppercase mb-8 text-[11px] tracking-[0.2em] text-zinc-500 border-b border-white/5 pb-4 italic">Registro de PRs</h3>
              <div className="space-y-8">
                {[{ name: 'Sentadilla', icon: 'SQ', key: 'squat_pr' }, { name: 'Banca', icon: 'BP', key: 'bench_pr' }, { name: 'Peso Muerto', icon: 'DL', key: 'deadlift_pr' }].map((lift) => (
                  <div key={lift.name} className="flex justify-between items-end group">
                    <div className="flex-grow">
                      <span className="text-[9px] text-emerald-500 font-black uppercase block mb-1 tracking-widest">{lift.icon}</span>
                      <span className="font-black uppercase italic text-zinc-400 text-sm">{lift.name}</span>
                    </div>
                    <input type="number" defaultValue={plan?.[lift.key] || ""} onBlur={(e) => updatePR(lift.name, e.target.value)} className="bg-transparent border-b-2 border-white/10 w-20 text-right text-3xl font-black italic text-emerald-400 outline-none focus:border-emerald-500 transition-all" placeholder="0" />
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card p-8 border border-emerald-500/30 bg-emerald-500/5 rounded-[2rem] relative overflow-hidden">
              <h3 className="font-black uppercase mb-3 italic text-lg tracking-tighter">Auditoría Técnica</h3>
              <p className="text-[10px] text-zinc-400 mb-8 uppercase font-bold tracking-wide leading-relaxed">Subí tus series pesadas para análisis.</p>
              <div className="space-y-3">
                {[{ label: 'Sentadilla (SQ)', key: 'SQ', url: plan?.video_sq_url }, { label: 'Banca (BP)', key: 'BP', url: plan?.video_bp_url }, { label: 'Peso Muerto (DL)', key: 'DL', url: plan?.video_dl_url }].map((item) => (
                  <label key={item.key} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${item.url ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.key} {item.url && "✅"}</span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">{uploading === item.key ? "SUBIENDO..." : item.url ? "CAMBIAR" : "SUBIR"}</span>
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