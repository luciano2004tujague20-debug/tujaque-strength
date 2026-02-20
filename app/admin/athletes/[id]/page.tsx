"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MONTHS_STRUCTURE = [
  { name: "Mes 1", weeks: [1, 2, 3, 4] },
  { name: "Mes 2", weeks: [5, 6, 7, 8] },
  { name: "Mes 3", weeks: [9, 10, 11, 12, 13] },
  { name: "Mes 4", weeks: [14, 15, 16, 17] },
  { name: "Mes 5", weeks: [18, 19, 20, 21] },
  { name: "Mes 6", weeks: [22, 23, 24, 25, 26] },
  { name: "Mes 7", weeks: [27, 28, 29, 30] },
  { name: "Mes 8", weeks: [31, 32, 33, 34] },
  { name: "Mes 9", weeks: [35, 36, 37, 38, 39] },
  { name: "Mes 10", weeks: [40, 41, 42, 43] },
  { name: "Mes 11", weeks: [44, 45, 46, 47] },
  { name: "Mes 12", weeks: [48, 49, 50, 51, 52] },
];

export default function TrainerDashboard() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'rutina' | 'videos' | 'datos'>('rutina');
  const [routineView, setRoutineView] = useState<'macro' | 'micro'>('micro');
  const [activeDay, setActiveDay] = useState('d1');

  // Estados para el Acordeón del Planificador Anual
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [activeMacroDay, setActiveMacroDay] = useState('d1'); // Día seleccionado dentro de la semana anual

  const [routine, setRoutine] = useState<any>({});
  const [feedback, setFeedback] = useState<any>({});
  const [rms, setRms] = useState<any>({ squat: "", bench: "", deadlift: "", dips: "" });
  const [macros, setMacros] = useState({ calories: "", protein: "", water: "" });
  const [cycles, setCycles] = useState({ macro: "", meso: "", micro: "" });

  const [annualPlan, setAnnualPlan] = useState<Record<number, any>>({});
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  async function fetchData() {
    if (!orderId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .eq("order_id", orderId)
      .single();

    if (data) {
      setOrder(data);
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
        squat: data.rm_squat || "", bench: data.rm_bench || "", 
        deadlift: data.rm_deadlift || "", dips: data.rm_dips || ""
      });
      setMacros({
        calories: data.macro_calories || "",
        protein: data.macro_protein || "",
        water: data.macro_water || ""
      });
      setCycles({
        macro: data.macrocycle || "",
        meso: data.mesocycle || "",
        micro: data.microcycle || ""
      });
      setAnnualPlan(data.annual_plan || {});
    }
    setLoading(false);
  }

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from("templates")
      .select("id, title, content")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setTemplates(data);
    }
  }

  // Inyectar Plantilla en el Microciclo Actual
  const handleApplyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) return;

    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      if (routine[activeDay] && !confirm(`¿Reemplazar la rutina del ${activeDay.replace('d', 'Día ')} por "${selectedTemplate.title}"?`)) {
        e.target.value = ""; 
        return;
      }
      setRoutine({ ...routine, [activeDay]: selectedTemplate.content });
      alert(`✅ Plantilla inyectada.`);
    }
    e.target.value = ""; 
  };

  // 🆕 Inyectar Plantilla DENTRO del Planificador Anual
  const handleApplyTemplateToMacro = (e: React.ChangeEvent<HTMLSelectElement>, weekNum: number, dayKey: string) => {
    const templateId = e.target.value;
    if (!templateId) return;

    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      if (annualPlan[weekNum]?.[dayKey] && !confirm(`¿Reemplazar lo escrito en el ${dayKey.replace('d', 'Día ')} de la Semana ${weekNum}?`)) {
        e.target.value = ""; 
        return;
      }
      updateAnnualWeek(weekNum, dayKey, selectedTemplate.content);
    }
    e.target.value = ""; 
  };

  const updateAnnualWeek = (weekNum: number, field: string, value: string) => {
    setAnnualPlan(prev => ({
      ...prev,
      [weekNum]: {
        ...(prev[weekNum] || {}),
        [field]: value
      }
    }));
  };

  // 🆕 Función MEJORADA: Carga la semana y la AUTO-GUARDA en vivo
  const pushToMicrocycle = async (weekNum: number) => {
      const weekData = annualPlan[weekNum] || {};
      
      if(!confirm(`¿Seguro que quieres publicar la Semana ${weekNum} como el entrenamiento actual del atleta? Esto se guardará en vivo.`)) return;

      const newRoutine = {
          d1: weekData.d1 || "", d2: weekData.d2 || "", d3: weekData.d3 || "",
          d4: weekData.d4 || "", d5: weekData.d5 || "", d6: weekData.d6 || "", d7: weekData.d7 || ""
      };
      const newMicro = `Semana ${weekNum}${weekData.focus ? ` - ${weekData.focus}` : ''}`;
      const newMeso = weekData.phase || cycles.meso;

      // Actualizar pantalla al instante
      setRoutine(newRoutine);
      setCycles(prev => ({ ...prev, meso: newMeso, micro: newMicro }));
      setRoutineView('micro');
      setSaving(true);

      // Guardar directamente en Base de Datos
      try {
          const { error } = await supabase
              .from('orders')
              .update({
                  routine_d1: newRoutine.d1, routine_d2: newRoutine.d2, routine_d3: newRoutine.d3,
                  routine_d4: newRoutine.d4, routine_d5: newRoutine.d5, routine_d6: newRoutine.d6, routine_d7: newRoutine.d7,
                  mesocycle: newMeso,
                  microcycle: newMicro,
                  annual_plan: annualPlan // Guarda también el plan anual por si hubo cambios
              })
              .eq('order_id', orderId);

          if (error) throw error;
          alert(`✅ Semana ${weekNum} publicada oficialmente en el Dashboard del atleta.`);
      } catch (e: any) {
          alert("❌ Error al publicar: " + e.message);
      } finally {
          setSaving(false);
      }
  };

  async function handleSave() {
    setSaving(true);
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                routine_d1: routine.d1, routine_d2: routine.d2, routine_d3: routine.d3,
                routine_d4: routine.d4, routine_d5: routine.d5, routine_d6: routine.d6, routine_d7: routine.d7,
                feedback_squat: feedback.squat, feedback_bench: feedback.bench, 
                feedback_deadlift: feedback.deadlift, feedback_dips: feedback.dips,
                rm_squat: rms.squat, rm_bench: rms.bench, rm_deadlift: rms.deadlift, rm_dips: rms.dips,
                macro_calories: macros.calories, macro_protein: macros.protein, macro_water: macros.water,
                macrocycle: cycles.macro, mesocycle: cycles.meso, microcycle: cycles.micro,
                annual_plan: annualPlan
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
  
  if (!order) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p>Atleta no encontrado.</p>
        <Link href="/admin/athletes" className="text-emerald-500 underline">Volver a la lista</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      
      {/* 🆕 HEADER ARREGLADO (Full width sin cortes) */}
      <div className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 p-5 md:px-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <Link href="/admin/athletes" className="bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:text-black w-10 h-10 flex items-center justify-center rounded-xl transition-all font-black text-lg">←</Link>
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">{order.customer_name}</h1>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
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
        
        {/* TABS PRINCIPALES */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-2xl w-fit border border-zinc-800">
            <button onClick={() => setActiveTab('rutina')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'rutina' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Rutina</button>
            <button onClick={() => setActiveTab('videos')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'videos' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Videos</button>
            <button onClick={() => setActiveTab('datos')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'datos' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Datos</button>
        </div>

        {/* --- PESTAÑA 1: RUTINA --- */}
        {activeTab === 'rutina' && (
            <div className="animate-in fade-in duration-500">
                
                {/* SWITCHER DE VISTAS */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-4">
                    <div className="flex gap-4">
                        <button 
                           onClick={() => setRoutineView('macro')}
                           className={`flex items-center gap-2 pb-2 text-sm font-black uppercase tracking-widest transition-all ${routineView === 'macro' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                        >
                           🗓️ Planificador Anual
                        </button>
                        <button 
                           onClick={() => setRoutineView('micro')}
                           className={`flex items-center gap-2 pb-2 text-sm font-black uppercase tracking-widest transition-all ${routineView === 'micro' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                        >
                           ⚡ Microciclo Actual
                        </button>
                    </div>
                    {routineView === 'micro' && cycles.micro && (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                           Editando: {cycles.micro}
                        </span>
                    )}
                </div>

                {/* 🆕 VISTA 1: PLANIFICADOR ANUAL (CON EDITOR ESTRUCTURADO) */}
                {routineView === 'macro' && (
                   <div className="bg-[#09090b] border border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                       
                       <div className="mb-8 relative z-10">
                           <h2 className="text-2xl font-black italic text-white mb-2 uppercase">Planificador Anual</h2>
                           <p className="text-zinc-400 text-xs font-medium">Bóveda de programación a largo plazo. Toca una semana para desplegar el editor completo de 7 días.</p>
                       </div>

                       <div className="grid lg:grid-cols-2 gap-6 h-[70vh] overflow-y-auto pr-4 custom-scrollbar relative z-10 items-start">
                           {MONTHS_STRUCTURE.map((month, idx) => (
                               <div key={idx} className="bg-black/50 border border-zinc-800 rounded-3xl p-6">
                                   <h3 className="text-emerald-500 font-black italic uppercase text-xl border-b border-zinc-800/50 pb-3 mb-4">{month.name}</h3>
                                   
                                   <div className="space-y-4">
                                       {month.weeks.map(weekNum => (
                                           <div key={weekNum} className={`bg-[#050505] rounded-2xl border transition-all overflow-hidden ${expandedWeek === weekNum ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' : 'border-zinc-800/50 hover:border-zinc-700'}`}>
                                               
                                               <div 
                                                  className="p-4 cursor-pointer flex justify-between items-center bg-zinc-900/40 hover:bg-zinc-800 transition-colors"
                                                  onClick={() => {
                                                    setExpandedWeek(expandedWeek === weekNum ? null : weekNum);
                                                    setActiveMacroDay('d1'); // Resetea a Día 1 al abrir
                                                  }}
                                               >
                                                   <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${expandedWeek === weekNum ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-white'}`}>
                                                       Semana {weekNum}
                                                   </span>
                                                   <div className="flex items-center gap-3">
                                                      {annualPlan[weekNum]?.phase && <span className="text-[10px] text-emerald-400 font-bold uppercase">{annualPlan[weekNum].phase}</span>}
                                                      <span className="text-zinc-500 text-xs">{expandedWeek === weekNum ? '▲' : '▼'}</span>
                                                   </div>
                                               </div>

                                               {/* 🆕 EDITOR ÉLITE DENTRO DEL MACROCICLO */}
                                               {expandedWeek === weekNum && (
                                                   <div className="p-5 border-t border-zinc-800 bg-[#09090b] space-y-5 animate-in slide-in-from-top-2 duration-200">
                                                       
                                                       <div className="flex flex-col sm:flex-row gap-3">
                                                           <select 
                                                               value={annualPlan[weekNum]?.phase || ""}
                                                               onChange={(e) => updateAnnualWeek(weekNum, 'phase', e.target.value)}
                                                               className="flex-1 bg-black border border-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                                                           >
                                                               <option value="">-- Asignar Fase --</option>
                                                               <option value="Adaptacion">Adaptación</option>
                                                               <option value="Hipertrofia">Hipertrofia</option>
                                                               <option value="Fuerza Base">Fuerza Base</option>
                                                               <option value="Intensificacion">Intensificación</option>
                                                               <option value="Peaking">Peaking / RM</option>
                                                               <option value="Descarga">Descarga</option>
                                                           </select>
                                                           <input 
                                                              type="text"
                                                              placeholder="Foco (Ej: Tolerancia al volumen)"
                                                              value={annualPlan[weekNum]?.focus || ""}
                                                              onChange={(e) => updateAnnualWeek(weekNum, 'focus', e.target.value)}
                                                              className="flex-1 bg-black border border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 placeholder:text-zinc-700"
                                                           />
                                                       </div>

                                                       {/* Selector de Días Estilo Microciclo */}
                                                       <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-zinc-800">
                                                          {['d1','d2','d3','d4','d5','d6','d7'].map(d => (
                                                             <button 
                                                                key={d}
                                                                onClick={() => setActiveMacroDay(d)}
                                                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-t-xl transition-colors whitespace-nowrap ${activeMacroDay === d ? 'bg-zinc-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                                                             >
                                                                {d.replace('d', 'Día ')}
                                                                {annualPlan[weekNum]?.[d] && <span className="ml-1.5 w-1.5 h-1.5 inline-block bg-emerald-500 rounded-full"></span>}
                                                             </button>
                                                          ))}
                                                       </div>

                                                       {/* Textarea Grande con Selector de Plantillas */}
                                                       <div className="bg-black border border-zinc-800 rounded-2xl p-4 relative">
                                                          <div className="flex justify-between items-center mb-3">
                                                             <span className="text-xs font-black text-white uppercase tracking-widest">{activeMacroDay.replace('d', 'Día ')}</span>
                                                             <select 
                                                                onChange={(e) => handleApplyTemplateToMacro(e, weekNum, activeMacroDay)}
                                                                className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-400 text-[9px] font-bold uppercase rounded-lg px-2 py-1 outline-none transition-colors w-32"
                                                                defaultValue=""
                                                             >
                                                                <option value="" disabled>Inyectar...</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                                             </select>
                                                          </div>
                                                          <textarea 
                                                             className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 font-mono text-xs leading-relaxed resize-none outline-none focus:border-emerald-500/50 custom-scrollbar placeholder:text-zinc-700"
                                                             placeholder={`Escribe o inyecta la rutina del ${activeMacroDay.replace('d', 'Día ')} para esta semana...`}
                                                             value={annualPlan[weekNum]?.[activeMacroDay] || ""}
                                                             onChange={(e) => updateAnnualWeek(weekNum, activeMacroDay, e.target.value)}
                                                             spellCheck={false}
                                                          />
                                                       </div>

                                                       <button 
                                                          onClick={() => pushToMicrocycle(weekNum)}
                                                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex justify-center items-center gap-2"
                                                       >
                                                          ⚡ Publicar como Semana Actual
                                                       </button>
                                                   </div>
                                               )}
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                )}

                {/* VISTA 2: EL DÍA A DÍA (MICROCICLO ACTUAL) */}
                {routineView === 'micro' && (
                  <>
                    <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6">
                       <h3 className="text-xs font-black italic text-emerald-500 uppercase tracking-widest mb-4">Etiquetas Visibles para el Atleta</h3>
                       <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Macrociclo (Global)</p>
                             <input 
                                type="text" 
                                className="bg-transparent text-sm font-bold text-white w-full outline-none placeholder:text-zinc-700"
                                value={cycles.macro}
                                placeholder="Ej: Temporada Competitiva"
                                onChange={(e) => setCycles({...cycles, macro: e.target.value})}
                             />
                          </div>
                          <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Mesociclo (Bloque)</p>
                             <input 
                                type="text" 
                                className="bg-transparent text-sm font-bold text-white w-full outline-none placeholder:text-zinc-700"
                                value={cycles.meso}
                                placeholder="Ej: Bloque 1 - Fuerza Base"
                                onChange={(e) => setCycles({...cycles, meso: e.target.value})}
                             />
                          </div>
                          <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Microciclo (Semana Actual)</p>
                             <input 
                                type="text" 
                                className="bg-transparent text-sm font-bold text-emerald-400 w-full outline-none placeholder:text-zinc-700"
                                value={cycles.micro}
                                placeholder="Ej: Semana 3 - Pico de Intensidad"
                                onChange={(e) => setCycles({...cycles, micro: e.target.value})}
                             />
                          </div>
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-350px)] min-h-[500px]">
                        <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
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

                        <div className="lg:col-span-3 h-full">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col shadow-2xl relative overflow-hidden">
                                
                                <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-b from-zinc-800/30 to-transparent pointer-events-none"></div>
                                <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center gap-4 relative z-10 border-b border-zinc-800/50 pb-4">
                                     <div>
                                       <h3 className="text-lg font-black italic uppercase text-white">Programación: {activeDay.replace('d', 'Día ')}</h3>
                                       <span className="text-[9px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase font-bold tracking-widest mt-2 inline-block">Editor Maestro</span>
                                     </div>
                                     
                                     <div className="flex items-center gap-3 w-full md:w-auto">
                                        <span className="text-emerald-500 text-xl hidden md:block">🧪</span>
                                        <select 
                                           onChange={handleApplyTemplate}
                                           className="bg-black border border-zinc-700 hover:border-emerald-500 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none transition-all cursor-pointer shadow-lg w-full md:w-64 appearance-none"
                                           defaultValue=""
                                        >
                                           <option value="" disabled>Inyectar Plantilla Base...</option>
                                           {templates.length === 0 ? (
                                              <option disabled>No hay plantillas creadas</option>
                                           ) : (
                                              templates.map(t => (
                                                 <option key={t.id} value={t.id}>{t.title}</option>
                                              ))
                                           )}
                                        </select>
                                     </div>
                                </div>

                                <textarea 
                                    className="w-full flex-1 bg-black border border-zinc-800 rounded-xl p-6 text-zinc-300 font-mono text-sm leading-relaxed focus:border-emerald-500 outline-none resize-none transition-all placeholder:text-zinc-800 relative z-10 custom-scrollbar"
                                    placeholder={`Escribí aquí los ejercicios, series y repeticiones para el ${activeDay.replace('d', 'Día ')} o inyecta una plantilla desde el menú superior...`}
                                    value={routine[activeDay]}
                                    onChange={(e) => setRoutine({...routine, [activeDay]: e.target.value})}
                                    spellCheck={false}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                  </>
                )}
            </div>
        )}

        {/* --- PESTAÑA 2: VIDEOS --- */}
        {activeTab === 'videos' && (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {[
                  { id: 'squat', name: 'Sentadilla' },
                  { id: 'bench', name: 'Press Banca' },
                  { id: 'deadlift', name: 'Peso Muerto' },
                  { id: 'dips', name: 'Fondos en Paralela' }
                ].map(lift => (
                    <div key={lift.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                            <h3 className="text-lg font-black italic uppercase text-white">{lift.name}</h3>
                            <span className="text-emerald-500 text-xl">📹</span>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Video del Atleta</p>
                            {order[`video_${lift.id}`] ? (
                                <div className="flex gap-2">
                                    <input disabled value={order[`video_${lift.id}`]} className="flex-1 bg-black border border-zinc-800 text-zinc-500 text-[10px] px-3 rounded-lg font-mono" />
                                    <a href={order[`video_${lift.id}`]} target="_blank" className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg font-black text-[10px] flex items-center uppercase tracking-widest transition-all">Ver</a>
                                </div>
                            ) : (
                                <div className="bg-black/30 border border-zinc-800/50 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-zinc-600 italic">Pendiente de subida</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Tu Devolución</p>
                            <textarea 
                                className="w-full bg-black border border-zinc-800 focus:border-emerald-500/50 rounded-xl p-4 text-zinc-300 text-sm h-32 resize-none outline-none transition-all"
                                placeholder={`Correcciones para ${lift.name}...`}
                                value={feedback[lift.id]}
                                onChange={(e) => setFeedback({...feedback, [lift.id]: e.target.value})}
                            />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- PESTAÑA 3: DATOS --- */}
        {activeTab === 'datos' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                 
                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
                    
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xl font-black italic uppercase text-white">Último <span className="text-emerald-500">Check-In</span></h3>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Reporte de Fatiga</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-6 relative z-10">
                        <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Peso Corporal</p>
                            <p className="text-3xl font-black text-white">{order.checkin_weight || '--'} <span className="text-xs text-zinc-600 ml-1">KG</span></p>
                        </div>
                        <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Horas de Sueño</p>
                            <p className="text-3xl font-black text-white">{order.checkin_sleep || '--'} <span className="text-xs text-zinc-600 ml-1">HRS</span></p>
                        </div>
                        <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estrés General</p>
                            <p className="text-3xl font-black text-emerald-400">{order.checkin_stress || '--'} <span className="text-xs text-zinc-600 ml-1">/ 10</span></p>
                        </div>
                    </div>
                    
                    <div className="bg-black/50 p-6 rounded-2xl border border-zinc-800 relative z-10">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Notas del Atleta</p>
                        <p className="text-sm text-zinc-300 italic font-medium">{order.checkin_notes || 'El atleta no dejó notas adicionales en su último reporte.'}</p>
                    </div>
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-black italic uppercase text-white">Directrices de <span className="text-emerald-500">Rendimiento</span></h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-black/50 p-5 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Calorías Estimadas</p>
                            <input 
                                type="text" 
                                className="bg-transparent text-xl font-black text-white w-full outline-none placeholder:text-zinc-700"
                                value={macros.calories}
                                placeholder="Ej: 2800 kcal"
                                onChange={(e) => setMacros({...macros, calories: e.target.value})}
                            />
                        </div>
                        <div className="bg-black/50 p-5 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Proteína Diaria</p>
                            <input 
                                type="text" 
                                className="bg-transparent text-xl font-black text-white w-full outline-none placeholder:text-zinc-700"
                                value={macros.protein}
                                placeholder="Ej: 160g"
                                onChange={(e) => setMacros({...macros, protein: e.target.value})}
                            />
                        </div>
                        <div className="bg-black/50 p-5 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Hidratación Mínima</p>
                            <input 
                                type="text" 
                                className="bg-transparent text-xl font-black text-white w-full outline-none placeholder:text-zinc-700"
                                value={macros.water}
                                placeholder="Ej: 3.5 Litros"
                                onChange={(e) => setMacros({...macros, water: e.target.value})}
                            />
                        </div>
                    </div>
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-black italic uppercase mb-8 text-center">Marcas Históricas (1RM)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                          { id: 'squat', name: 'Sentadilla' },
                          { id: 'bench', name: 'Press Banca' },
                          { id: 'deadlift', name: 'Peso Muerto' },
                          { id: 'dips', name: 'Fondos' }
                        ].map(lift => (
                            <div key={lift.id} className="bg-black p-4 md:p-6 rounded-3xl border border-zinc-800 text-center relative group">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">{lift.name}</p>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="bg-transparent text-center text-3xl md:text-4xl font-black text-white w-full outline-none z-10 relative"
                                        value={rms[lift.id]}
                                        placeholder="0"
                                        onChange={(e) => setRms({...rms, [lift.id]: e.target.value})}
                                    />
                                    <span className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 text-zinc-700 text-[10px] md:text-xs font-black">KG</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-[2rem]">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Credenciales</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black p-4 rounded-xl border border-zinc-800">
                            <p className="text-[9px] text-zinc-500 uppercase mb-1">Usuario</p>
                            <p className="text-sm font-bold text-white break-all">{order.customer_email}</p>
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

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
      `}} />
    </div>
  );
}