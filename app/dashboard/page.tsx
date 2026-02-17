"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inicializamos cliente Supabase (Público)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AthleteDashboard() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [activeDay, setActiveDay] = useState('d1');
  const [videoSaving, setVideoSaving] = useState<string | null>(null);

  // Intentamos login automático si ya entró antes
  useEffect(() => {
    const savedEmail = localStorage.getItem("ts_client_email");
    if (savedEmail) {
        setEmail(savedEmail);
        fetchPlayerData(savedEmail);
    } else {
        setLoading(false);
    }
  }, []);

  async function fetchPlayerData(emailToSearch: string) {
    setLoading(true);
    // Buscamos en la tabla 'orders' (la base unificada)
    // Filtramos por email y que esté PAGADO
    const { data, error } = await supabase
      .from('orders')
      .select('*, plans(name)')
      .eq('customer_email', emailToSearch.trim().toLowerCase())
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (data) {
      setOrder(data);
      localStorage.setItem("ts_client_email", emailToSearch);
    } else {
      if (emailToSearch) alert("No encontramos un plan activo con este email.");
    }
    setLoading(false);
  }

  // Guardar video o RM (API)
  async function saveField(field: string, value: string) {
    setVideoSaving(field);
    try {
        await fetch("/api/client/update-video", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.order_id, field, value })
        });
        // Actualizamos estado local
        setOrder({ ...order, [field]: value });
    } catch (e) {
        alert("Error al guardar. Intenta de nuevo.");
    } finally {
        setVideoSaving(null);
    }
  }

  // Logout simple
  const handleLogout = () => {
    localStorage.removeItem("ts_client_email");
    setOrder(null);
    setEmail("");
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-emerald-400 font-black italic animate-pulse">Sincronizando Estación...</div>;

  // PANTALLA DE LOGIN (Si no hay orden cargada)
  if (!order) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 w-full max-w-sm bg-zinc-900/80 p-10 rounded-3xl border border-white/10 backdrop-blur-xl">
            <h1 className="text-3xl font-black italic mb-8 text-center tracking-tighter">TUJAQUE <span className="text-emerald-500">STRENGTH</span></h1>
            <p className="text-xs text-zinc-400 mb-4 font-bold uppercase tracking-widest text-center">Acceso Atletas</p>
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 mb-4 text-white outline-none focus:border-emerald-500 text-center font-bold"
            />
            <button 
                onClick={() => fetchPlayerData(email)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
                Ingresar
            </button>
        </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-4 md:p-10 relative overflow-hidden font-sans print:bg-white print:text-black print:p-0">
      
      {/* ESTILOS DE IMPRESIÓN */}
      <style jsx global>{`
        @media print {
            @page { margin: 2cm; }
            body { background: white; color: black; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .bg-zinc-900, .bg-black { background: white !important; border: 1px solid #eee !important; }
            .text-white, .text-zinc-300 { color: black !important; }
            .text-emerald-400, .text-emerald-500 { color: black !important; font-weight: bold; }
            .glass-card { box-shadow: none !important; backdrop-filter: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 opacity-10 pointer-events-none no-print" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, #10b981 0%, transparent 20%)'}}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* CABECERA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-md no-print">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none">
              BIENVENIDO <span className="text-emerald-400 uppercase">{order.customer_name}</span>
            </h1>
            <p className="text-zinc-500 font-bold text-[10px] tracking-[0.2em] mt-2 italic uppercase">{order.plans?.name || 'PLAN PERSONALIZADO'}</p>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
            Cerrar Sesión
          </button>
        </header>

        {/* CABECERA PRINT ONLY */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
            <h1 className="text-4xl font-black uppercase">{order.customer_name}</h1>
            <p className="text-sm font-bold mt-2">PLANIFICACIÓN DE ENTRENAMIENTO</p>
        </div>

        {/* --- SECCIÓN DE RÉCORDS (1RM) --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 no-print">
          {[
            { name: 'Sentadilla', icon: 'SQ', key: 'rm_squat', color: 'text-emerald-400' },
            { name: 'Banca', icon: 'BP', key: 'rm_bench', color: 'text-blue-400' },
            { name: 'Peso Muerto', icon: 'DL', key: 'rm_deadlift', color: 'text-red-400' }
          ].map((lift) => (
            <div key={lift.name} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center group hover:border-emerald-500/30 transition-all">
              <span className="text-[10px] font-black text-zinc-600 tracking-[0.3em] mb-4 uppercase">{lift.name}</span>
              <div className="flex items-end gap-2">
                <input 
                  type="text" 
                  defaultValue={order[lift.key] || ''} 
                  placeholder="0"
                  onBlur={(e) => saveField(lift.key, e.target.value)} 
                  className={`bg-transparent w-24 text-center text-5xl font-black italic outline-none ${lift.color} transition-all placeholder:text-zinc-800`}
                />
                <span className="text-xl font-black text-zinc-700 italic mb-3">kg</span>
              </div>
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* COLUMNA PRINCIPAL: PROGRAMACIÓN */}
          <div className="lg:col-span-3 space-y-8 w-full">
            
            {/* PROGRAMACIÓN SEMANAL */}
            <section className="glass-card p-8 md:p-12 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm print:border-0 print:p-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 no-print">
                <h2 className="text-2xl font-black italic flex items-center gap-4">
                  <span className="w-3 h-10 bg-emerald-500 block rounded-full"></span>
                  Tu Rutina
                </h2>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => window.print()} className="bg-white text-black px-5 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all hover:bg-zinc-200 flex items-center gap-2">
                    <span>🖨️</span> PDF
                  </button>
                  <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                  {['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map((day) => (
                    <button key={day} onClick={() => setActiveDay(day)} className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all border ${activeDay === day ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/20'}`}>
                      {day.replace('d', 'DÍA ')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden min-h-[400px] print:bg-white print:border-0 print:min-h-0">
                  {order[`routine_${activeDay}`] ? (
                    <div className="p-8 md:p-12">
                        <h3 className="hidden print:block text-xl font-black mb-4 border-b pb-2">DÍA {activeDay.slice(1)}</h3>
                        <div className="whitespace-pre-wrap text-zinc-300 font-bold text-lg leading-relaxed font-mono print:text-black print:text-sm">
                            {order[`routine_${activeDay}`]}
                        </div>
                    </div>
                  ) : (
                    <div className="py-32 text-center text-zinc-600 font-black italic tracking-widest text-xs flex flex-col items-center gap-4">
                      <span className="text-4xl opacity-20">💤</span>
                      Día de descanso o sin programar.
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN OCULTA SOLO VISIBLE AL IMPRIMIR (Muestra todos los días) */}
              <div className="hidden print:block mt-8">
                  {['d1','d2','d3','d4','d5','d6','d7'].map(day => {
                      if(day === activeDay || !order[`routine_${day}`]) return null;
                      return (
                          <div key={day} className="mt-8 page-break">
                              <h3 className="text-xl font-black mb-4 border-b pb-2 uppercase">{day.replace('d', 'DÍA ')}</h3>
                              <div className="whitespace-pre-wrap text-sm font-mono">{order[`routine_${day}`]}</div>
                          </div>
                      )
                  })}
              </div>
            </section>
          </div>

          {/* COLUMNA LATERAL: AUDITORÍA DE VIDEOS (No se imprime) */}
          <div className="space-y-8 no-print">
            <section className="glass-card p-8 border border-emerald-500/30 bg-emerald-500/5 rounded-[2rem]">
              <h3 className="font-black mb-2 italic text-lg tracking-tighter text-white">Análisis Técnico</h3>
              <p className="text-[10px] text-zinc-400 mb-8 font-bold leading-relaxed uppercase tracking-widest">Pega tus links de video aquí</p>
              
              <div className="space-y-6">
                {[
                  { label: 'Sentadilla', key: 'squat', fb: order.feedback_squat },
                  { label: 'Banca', key: 'bench', fb: order.feedback_bench },
                  { label: 'Peso Muerto', key: 'deadlift', fb: order.feedback_deadlift },
                  { label: 'Fondos', key: 'dips', fb: order.feedback_dips }
                ].map((item) => (
                  <div key={item.key} className="relative group">
                    <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black tracking-widest uppercase text-emerald-500">{item.label}</span>
                        {videoSaving === `video_${item.key}` && <span className="text-[9px] text-white animate-pulse">Guardando...</span>}
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Pegar link (YouTube/Drive)..."
                        defaultValue={order[`video_${item.key}`] || ''}
                        onBlur={(e) => saveField(`video_${item.key}`, e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white focus:border-emerald-500 outline-none transition-all mb-2"
                    />

                    {item.fb && (
                        <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-xl">
                            <p className="text-[9px] font-bold text-emerald-400 mb-1">FEEDBACK COACH:</p>
                            <p className="text-xs text-zinc-300 italic leading-snug">"{item.fb}"</p>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}