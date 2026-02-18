"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TrainerDashboard() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Pestaña activa
  const [activeTab, setActiveTab] = useState<'rutina' | 'videos' | 'datos'>('rutina');
  const [activeDay, setActiveDay] = useState('d1');

  // Estados editables
  const [routine, setRoutine] = useState<any>({});
  const [feedback, setFeedback] = useState<any>({});
  const [rms, setRms] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .eq("order_id", orderId)
      .single();

    if (data) {
      setOrder(data);
      // Precargamos los datos existentes en los estados
      setRoutine({
        d1: data.routine_d1 || "", d2: data.routine_d2 || "", d3: data.routine_d3 || "",
        d4: data.routine_d4 || "", d5: data.routine_d5 || "", d6: data.routine_d6 || "",
        d7: data.routine_d7 || ""
      });
      setFeedback({
        squat: data.feedback_squat || "", bench: data.feedback_bench || "", 
        deadlift: data.feedback_deadlift || "", dips: data.feedback_dips || ""
      });
      setRms({
        squat: data.rm_squat || "", bench: data.rm_bench || "", deadlift: data.rm_deadlift || ""
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                // Guardamos Rutina
                routine_d1: routine.d1, routine_d2: routine.d2, routine_d3: routine.d3,
                routine_d4: routine.d4, routine_d5: routine.d5, routine_d6: routine.d6, routine_d7: routine.d7,
                // Guardamos Feedback
                feedback_squat: feedback.squat, feedback_bench: feedback.bench, 
                feedback_deadlift: feedback.deadlift, feedback_dips: feedback.dips,
                // Guardamos RMs
                rm_squat: rms.squat, rm_bench: rms.bench, rm_deadlift: rms.deadlift
            })
            .eq('order_id', orderId);

        if (error) throw error;
        alert("💾 Cambios guardados correctamente.");
    } catch (e: any) {
        alert("❌ Error al guardar: " + e.message);
    } finally {
        setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse uppercase tracking-widest">Cargando Atleta...</div>;
  if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Atleta no encontrado.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20">
      
      {/* HEADER FIJO SUPERIOR */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <Link href="/admin/athletes" className="bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black w-10 h-10 flex items-center justify-center rounded-xl transition-all font-bold">←</Link>
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">{order.customer_name}</h1>
                    <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                        Panel de Entrenador
                    </p>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2"
            >
                {saving ? "Guardando..." : "💾 Guardar Todo"}
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-2xl w-fit border border-zinc-800">
            <button onClick={() => setActiveTab('rutina')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'rutina' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Rutina</button>
            <button onClick={() => setActiveTab('videos')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'videos' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Videos</button>
            <button onClick={() => setActiveTab('datos')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'datos' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Datos</button>
        </div>

        {/* --- PESTAÑA 1: EDITOR DE RUTINA --- */}
        {activeTab === 'rutina' && (
            <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                {/* Selector de Días */}
                <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-2">
                    {['d1','d2','d3','d4','d5','d6','d7'].map(day => (
                        <button 
                            key={day} 
                            onClick={() => setActiveDay(day)}
                            className={`w-full text-left px-5 py-4 rounded-xl border font-black uppercase text-xs tracking-widest transition-all flex justify-between items-center ${activeDay === day ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                        >
                            {day.replace('d', 'Día ')}
                            {routine[day] && <span className={`text-[8px] px-2 py-0.5 rounded-full ${activeDay === day ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-500'}`}>OK</span>}
                        </button>
                    ))}
                </div>

                {/* Área de Texto */}
                <div className="lg:col-span-3 h-full">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col shadow-2xl">
                        <div className="flex justify-between mb-4 items-center">
                             <h3 className="text-lg font-black italic uppercase text-white">Programación: {activeDay.replace('d', 'Día ')}</h3>
                             <span className="text-[9px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Editor de Texto</span>
                        </div>
                        <textarea 
                            className="w-full flex-1 bg-black border border-zinc-800 rounded-xl p-6 text-zinc-300 font-mono text-sm leading-relaxed focus:border-emerald-500 outline-none resize-none transition-all placeholder:text-zinc-800"
                            placeholder={`Escribí aquí los ejercicios, series y repeticiones para el ${activeDay.replace('d', 'Día ')}...`}
                            value={routine[activeDay]}
                            onChange={(e) => setRoutine({...routine, [activeDay]: e.target.value})}
                            spellCheck={false}
                        ></textarea>
                    </div>
                </div>
            </div>
        )}

        {/* --- PESTAÑA 2: VIDEOS Y FEEDBACK --- */}
        {activeTab === 'videos' && (
            <div className="grid md:grid-cols-2 gap-6">
                {['squat', 'bench', 'deadlift', 'dips'].map(lift => (
                    <div key={lift} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                            <h3 className="text-lg font-black italic uppercase text-white">{lift}</h3>
                            <span className="text-emerald-500 text-xl">📹</span>
                        </div>
                        
                        {/* Link del Atleta */}
                        <div className="mb-6">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Video del Atleta</p>
                            {order[`video_${lift}`] ? (
                                <div className="flex gap-2">
                                    <input disabled value={order[`video_${lift}`]} className="flex-1 bg-black border border-zinc-800 text-zinc-500 text-[10px] px-3 rounded-lg font-mono" />
                                    <a href={order[`video_${lift}`]} target="_blank" className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg font-black text-[10px] flex items-center uppercase tracking-widest transition-all">Ver</a>
                                </div>
                            ) : (
                                <div className="bg-black/30 border border-zinc-800/50 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-zinc-600 italic">Pendiente de subida</p>
                                </div>
                            )}
                        </div>

                        {/* Feedback */}
                        <div>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Tu Devolución</p>
                            <textarea 
                                className="w-full bg-black border border-zinc-800 focus:border-emerald-500/50 rounded-xl p-4 text-zinc-300 text-sm h-32 resize-none outline-none transition-all"
                                placeholder={`Escribí tus correcciones técnicas para ${lift}...`}
                                value={feedback[lift]}
                                onChange={(e) => setFeedback({...feedback, [lift]: e.target.value})}
                            />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- PESTAÑA 3: DATOS Y CONFIG --- */}
        {activeTab === 'datos' && (
            <div className="max-w-4xl mx-auto space-y-8">
                 {/* RMs */}
                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-black italic uppercase mb-8 text-center">Marcas Históricas (1RM)</h3>
                    <div className="grid grid-cols-3 gap-8">
                        {['squat', 'bench', 'deadlift'].map(lift => (
                            <div key={lift} className="bg-black p-6 rounded-3xl border border-zinc-800 text-center relative group">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">{lift}</p>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="bg-transparent text-center text-4xl font-black text-white w-full outline-none z-10 relative"
                                        value={rms[lift]}
                                        placeholder="0"
                                        onChange={(e) => setRms({...rms, [lift]: e.target.value})}
                                    />
                                    <span className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-700 text-xs font-black">KG</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* INFO DE LA CUENTA */}
                 <div className="bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-[2rem]">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Credenciales de Acceso</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black p-4 rounded-xl border border-zinc-800">
                            <p className="text-[9px] text-zinc-500 uppercase mb-1">Usuario / Email</p>
                            <p className="text-sm font-bold text-white">{order.customer_email}</p>
                        </div>
                        <div className="bg-black p-4 rounded-xl border border-zinc-800">
                            <p className="text-[9px] text-zinc-500 uppercase mb-1">Contraseña</p>
                            <p className="text-sm font-mono text-emerald-400">{order.password || '••••••'}</p>
                        </div>
                    </div>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
}