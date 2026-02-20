"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardAtleta() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("rutina");
  
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingRm, setSavingRm] = useState(false);
  const [rms, setRms] = useState({ squat: "", bench: "", deadlift: "", dips: "" });

  const [savingCheckin, setSavingCheckin] = useState(false);
  const [checkin, setCheckin] = useState({ weight: "", sleep: "", stress: "5", notes: "" });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        setOrder(orders[0]);
        setRms({
          squat: orders[0].rm_squat || "",
          bench: orders[0].rm_bench || "",
          deadlift: orders[0].rm_deadlift || "",
          dips: orders[0].rm_dips || ""
        });
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, lift: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛑 FILTRO ÉLITE: Limitar tamaño de video a 50MB para fluidez
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSizeInBytes) {
       alert("❌ El video es demasiado pesado (Máx 50MB). Por favor, recórtalo (solo el levantamiento) o bájale la resolución a 1080p para mantener la fluidez del panel.");
       e.target.value = ''; // Resetea el input para que intente de nuevo
       return;
    }

    setUploading(lift);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${lift}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName);
      const videoUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('orders')
        .update({ [`video_${lift}`]: videoUrl })
        .eq('id', order.id);

      if (updateError) throw updateError;

      setOrder({ ...order, [`video_${lift}`]: videoUrl });
      alert("📹 Video subido correctamente. Tu coach lo revisará pronto.");
    } catch (error: any) {
      alert("❌ Error al subir el video: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  const saveRMs = async () => {
    setSavingRm(true);
    try {
        const { error } = await supabase
            .from('orders')
            .update({ 
                rm_squat: rms.squat, 
                rm_bench: rms.bench, 
                rm_deadlift: rms.deadlift,
                rm_dips: rms.dips 
            })
            .eq('id', order.id);

        if (error) throw error;
        alert("💪 Récords actualizados. ¡Vamos por más!");
    } catch (error: any) {
        alert("Error: " + error.message);
    } finally {
        setSavingRm(false);
    }
  };

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCheckin(true);
    try {
       const { error } = await supabase
          .from('orders')
          .update({ 
              checkin_weight: checkin.weight, 
              checkin_sleep: checkin.sleep, 
              checkin_stress: checkin.stress, 
              checkin_notes: checkin.notes 
          })
          .eq('id', order.id);

       if (error) throw error;
       alert("✅ Check-in diario registrado. Tu coach ya puede ver tus niveles de fatiga.");
       setCheckin({ weight: "", sleep: "", stress: "5", notes: "" });
    } catch (error: any) {
       alert("Error: " + error.message);
    } finally {
       setSavingCheckin(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-black animate-pulse tracking-widest uppercase text-sm">Cargando Panel Elite...</div>;

  if (!order) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
       <h2 className="text-3xl font-black italic mb-4">AÚN NO TIENES UN PLAN ACTIVO</h2>
       <p className="text-zinc-500 mb-8">Ve a la página principal para elegir tu suscripción.</p>
       <div className="flex gap-4">
         <button onClick={() => router.push('/')} className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black tracking-widest uppercase hover:bg-emerald-400 transition-colors">Ver Planes</button>
         <button onClick={handleLogout} className="border border-zinc-700 text-zinc-300 px-8 py-3 rounded-xl font-black tracking-widest uppercase hover:bg-zinc-800 transition-colors">Cerrar Sesión</button>
       </div>
    </div>
  );

  const days = [
    { id: 'd1', label: 'Día 1' }, { id: 'd2', label: 'Día 2' },
    { id: 'd3', label: 'Día 3' }, { id: 'd4', label: 'Día 4' },
    { id: 'd5', label: 'Día 5' }, { id: 'd6', label: 'Día 6' },
    { id: 'd7', label: 'Día 7' }
  ];
  const hasRoutines = days.some(day => order[`routine_${day.id}`]);

  const lifts = [
    { id: 'squat', label: 'Sentadilla' },
    { id: 'bench', label: 'Press de Banca' },
    { id: 'deadlift', label: 'Peso Muerto' },
    { id: 'dips', label: 'Fondos en Paralela' }
  ];

  const chartData = [
    { name: 'Mes 1', Sentadilla: Number(rms.squat) ? Math.round(Number(rms.squat) * 0.85) : 0, Banca: Number(rms.bench) ? Math.round(Number(rms.bench) * 0.85) : 0, PesoMuerto: Number(rms.deadlift) ? Math.round(Number(rms.deadlift) * 0.85) : 0, Fondos: Number(rms.dips) ? Math.round(Number(rms.dips) * 0.85) : 0 },
    { name: 'Mes 2', Sentadilla: Number(rms.squat) ? Math.round(Number(rms.squat) * 0.90) : 0, Banca: Number(rms.bench) ? Math.round(Number(rms.bench) * 0.90) : 0, PesoMuerto: Number(rms.deadlift) ? Math.round(Number(rms.deadlift) * 0.90) : 0, Fondos: Number(rms.dips) ? Math.round(Number(rms.dips) * 0.90) : 0 },
    { name: 'Mes 3', Sentadilla: Number(rms.squat) ? Math.round(Number(rms.squat) * 0.95) : 0, Banca: Number(rms.bench) ? Math.round(Number(rms.bench) * 0.95) : 0, PesoMuerto: Number(rms.deadlift) ? Math.round(Number(rms.deadlift) * 0.95) : 0, Fondos: Number(rms.dips) ? Math.round(Number(rms.dips) * 0.95) : 0 },
    { name: 'Actual', Sentadilla: Number(rms.squat) || 0, Banca: Number(rms.bench) || 0, PesoMuerto: Number(rms.deadlift) || 0, Fondos: Number(rms.dips) || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Header del Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
            ATLETA <span className="text-emerald-500">DASHBOARD</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase tracking-widest">Atleta: <span className="text-white">{order.customer_name}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-[10px] font-black tracking-widest uppercase text-zinc-400 hover:text-white transition-colors border border-white/10 px-5 py-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800"
        >
          CERRAR SESIÓN
        </button>
      </header>

      {/* Navegación por Pestañas */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button onClick={() => setActiveTab("rutina")} className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${activeTab === "rutina" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Mi Rutina</button>
        <button onClick={() => setActiveTab("videos")} className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${activeTab === "videos" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Videos y Coach</button>
        <button onClick={() => setActiveTab("rm")} className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${activeTab === "rm" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Récords 📈</button>
        <button onClick={() => setActiveTab("checkin")} className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${activeTab === "checkin" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Check-In Diario ⚡</button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="animate-in fade-in duration-500">
        
        {/* 1. VISTA DE RUTINAS */}
        {activeTab === "rutina" && (
          <div>
            
            {/* ETIQUETAS DE PERIODIZACIÓN (Vista Atleta) */}
            {(order.macrocycle || order.mesocycle || order.microcycle) && (
              <div className="mb-6 bg-zinc-900/60 border border-zinc-800 p-6 rounded-[2rem] flex flex-col md:flex-row gap-4 justify-between items-stretch shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10"></div>
                
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                   {order.macrocycle && (
                     <div className="bg-black/50 border border-white/5 p-4 rounded-xl relative z-10">
                       <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Macrociclo</p>
                       <p className="text-sm font-bold text-white">{order.macrocycle}</p>
                     </div>
                   )}
                   {order.mesocycle && (
                     <div className="bg-black/50 border border-white/5 p-4 rounded-xl relative z-10">
                       <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Mesociclo</p>
                       <p className="text-sm font-bold text-white">{order.mesocycle}</p>
                     </div>
                   )}
                   {order.microcycle && (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                       <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                         Semana Actual
                       </p>
                       <p className="text-sm font-black text-emerald-400">{order.microcycle}</p>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* DIRECTRICES DE RENDIMIENTO (Nutrición) */}
            {(order.macro_calories || order.macro_protein || order.macro_water) && (
              <div className="mb-8 bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <h3 className="text-emerald-500 font-black italic uppercase tracking-tighter text-xl mb-1">Combustible & Recuperación</h3>
                    <p className="text-emerald-100/60 text-xs font-medium">Directrices establecidas por el Coach para este ciclo.</p>
                 </div>
                 <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {order.macro_calories && (
                      <div className="bg-black/50 border border-emerald-500/20 px-4 py-3 rounded-xl flex-1 md:flex-none text-center">
                         <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Calorías</p>
                         <p className="text-lg font-black text-white">{order.macro_calories}</p>
                      </div>
                    )}
                    {order.macro_protein && (
                      <div className="bg-black/50 border border-emerald-500/20 px-4 py-3 rounded-xl flex-1 md:flex-none text-center">
                         <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Proteína</p>
                         <p className="text-lg font-black text-white">{order.macro_protein}</p>
                      </div>
                    )}
                    {order.macro_water && (
                      <div className="bg-black/50 border border-emerald-500/20 px-4 py-3 rounded-xl flex-1 md:flex-none text-center">
                         <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Agua</p>
                         <p className="text-lg font-black text-white">{order.macro_water}</p>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {!hasRoutines ? (
              <div className="bg-zinc-900/30 border border-zinc-800 p-10 rounded-3xl text-center">
                 <p className="text-zinc-400 italic">Tu coach Luciano está diseñando tu programación. Aparecerá aquí pronto.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                {days.map(day => {
                  if (!order[`routine_${day.id}`]) return null;
                  return (
                    <div key={day.id} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl backdrop-blur-sm shadow-xl">
                       <h3 className="text-xl font-black italic text-emerald-400 mb-6 uppercase tracking-tight">{day.label}</h3>
                       <pre className="text-zinc-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                         {order[`routine_${day.id}`]}
                       </pre>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. VISTA DE VIDEOS Y FEEDBACK */}
        {activeTab === "videos" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {lifts.map(lift => (
               <div key={lift.id} className="bg-zinc-900/40 border border-zinc-800 p-6 md:p-8 rounded-[2rem] shadow-xl">
                  <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4">
                     <h3 className="text-xl font-black italic text-white uppercase">{lift.label}</h3>
                     {order[`video_${lift.id}`] 
                        ? <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-500/20">Video Subido</span> 
                        : <span className="bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Pendiente</span>
                     }
                  </div>

                  <div className="mb-6 bg-black/50 border border-zinc-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                        <p className="text-xs text-zinc-300 font-bold mb-1 uppercase tracking-widest">Auditoría Técnica</p>
                        <p className="text-[10px] text-zinc-600">Formato MP4/MOV (Máx 50MB)</p>
                     </div>
                     <label className={`cursor-pointer px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex-shrink-0 ${uploading === lift.id ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}>
                        {uploading === lift.id ? 'SUBIENDO...' : 'SUBIR VIDEO 📹'}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, lift.id)} disabled={uploading === lift.id} />
                     </label>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-2xl">
                     <h4 className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-4">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Respuesta del Coach
                     </h4>
                     {order[`feedback_${lift.id}`] ? (
                       <p className="text-emerald-100/80 text-sm leading-relaxed whitespace-pre-wrap font-medium">{order[`feedback_${lift.id}`]}</p>
                     ) : (
                       <p className="text-emerald-500/40 text-xs italic">Aún no hay correcciones. Sube tu video para que Luciano lo analice.</p>
                     )}
                  </div>
               </div>
            ))}
          </div>
        )}

        {/* 3. VISTA DE RMs */}
        {activeTab === "rm" && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 p-8 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
               
               <h2 className="text-3xl font-black italic text-center mb-12 text-white relative z-10">HISTORIAL DE <span className="text-emerald-500">1RM</span></h2>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 relative z-10">
                  {[
                    { id: 'squat', name: 'Sentadilla' },
                    { id: 'bench', name: 'Press Banca' },
                    { id: 'deadlift', name: 'Peso Muerto' },
                    { id: 'dips', name: 'Fondos' }
                  ].map(lift => (
                     <div key={lift.id} className="bg-black/60 p-4 md:p-6 rounded-3xl border border-zinc-800 text-center relative group focus-within:border-emerald-500/50 transition-colors">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">{lift.name}</p>
                         <div className="relative inline-block w-full">
                            <input 
                               type="number" 
                               value={rms[lift.id as keyof typeof rms]} 
                               onChange={e => setRms({...rms, [lift.id]: e.target.value})}
                               className="bg-transparent text-center text-3xl md:text-5xl font-black text-white w-full outline-none focus:text-emerald-400 transition-colors placeholder:text-zinc-800"
                               placeholder="0"
                            />
                            <span className="absolute top-1/2 -translate-y-1/2 right-0 text-zinc-700 text-[10px] md:text-xs font-black">KG</span>
                         </div>
                     </div>
                  ))}
               </div>

               <button 
                 onClick={saveRMs}
                 disabled={savingRm}
                 className="relative z-10 w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
               >
                 {savingRm ? 'GUARDANDO...' : 'ACTUALIZAR MIS RÉCORDS 💪'}
               </button>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-10 rounded-[3rem] shadow-xl">
               <h3 className="text-xl font-black italic text-white mb-8">CURVA DE <span className="text-emerald-500">PROGRESO ESTIMADA</span></h3>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                     <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                     <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                     />
                     <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} iconType="circle" />
                     <Line type="monotone" dataKey="Sentadilla" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="Banca" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="PesoMuerto" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="Fondos" stroke="#eab308" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* 4. VISTA DE CHECK-IN DIARIO */}
        {activeTab === "checkin" && (
           <div className="max-w-3xl mx-auto bg-zinc-900/40 border border-zinc-800 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
              
              <h2 className="text-3xl font-black italic text-center mb-4 text-white relative z-10">CONTROL DE <span className="text-emerald-500">FATIGA</span></h2>
              <p className="text-center text-zinc-400 text-sm mb-10 relative z-10">Reporte pre-entrenamiento. Fundamental para ajustar tu RPE de hoy.</p>
              
              <form onSubmit={handleSaveCheckin} className="space-y-6 relative z-10">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                       <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 block">Peso Corporal Hoy (KG)</label>
                       <input 
                          type="number" step="0.1" required
                          value={checkin.weight} onChange={e => setCheckin({...checkin, weight: e.target.value})}
                          className="w-full bg-transparent text-3xl font-black text-white outline-none focus:text-emerald-400 transition-colors placeholder:text-zinc-800"
                          placeholder="Ej: 80.5"
                       />
                    </div>
                    <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                       <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 block">Horas de Sueño</label>
                       <input 
                          type="number" step="0.5" required
                          value={checkin.sleep} onChange={e => setCheckin({...checkin, sleep: e.target.value})}
                          className="w-full bg-transparent text-3xl font-black text-white outline-none focus:text-blue-400 transition-colors placeholder:text-zinc-800"
                          placeholder="Ej: 7.5"
                       />
                    </div>
                 </div>

                 <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                      <span>Nivel de Estrés General</span>
                      <span className="text-emerald-500 text-lg">{checkin.stress} / 10</span>
                    </div>
                    <input 
                       type="range" min="1" max="10" required
                       value={checkin.stress} onChange={e => setCheckin({...checkin, stress: e.target.value})}
                       className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-600 mt-2 font-bold uppercase">
                       <span>1 (Muy Relajado)</span>
                       <span>10 (Exhausto)</span>
                    </div>
                 </div>

                 <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 block">Notas Adicionales (Opcional)</label>
                    <textarea 
                       value={checkin.notes} onChange={e => setCheckin({...checkin, notes: e.target.value})}
                       placeholder="Me duele un poco el lumbar hoy..."
                       className="w-full bg-transparent text-sm font-medium text-zinc-300 outline-none resize-none h-20 placeholder:text-zinc-700"
                    />
                 </div>

                 <button 
                    type="submit"
                    disabled={savingCheckin}
                    className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(16,185,129,0.2)] mt-4"
                 >
                    {savingCheckin ? 'ENVIANDO REPORTE...' : 'ENVIAR CHECK-IN AL COACH 🚀'}
                 </button>
              </form>
           </div>
        )}

      </div>
    </div>
  );
}