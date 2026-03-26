"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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

interface RoutineSet { id: string; setNumber: number; type: string; targetWeight: string; targetReps: string; targetRpe: string; targetRir: string; }
interface RoutineExercise { id: string; name: string; tempo: string; rest: string; methodology: string; technique: string; sets: RoutineSet[]; }
interface RoutineDay { id: string; dayOfWeek: string; name: string; focus: string; isRest: boolean; exercises: RoutineExercise[]; }
interface RoutineProgram { week: number; annualPlan?: Record<number, any>; days: RoutineDay[]; }

export default function RoutineBuilder({ athleteId, athleteName }: { athleteId: string, athleteName: string }) {
  const supabase = createClient();
  
  // ─── ESTADOS DE VISTAS Y ESTRUCTURA ───
  const [routineView, setRoutineView] = useState<'macro' | 'micro'>('macro');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [macrocycle, setMacrocycle] = useState("Macrociclo 1: Base de Fuerza");
  const [mesocycle, setMesocycle] = useState("Mesociclo 1: Fuerza y Torque");
  
  const [annualPlan, setAnnualPlan] = useState<Record<number, any>>({});
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const [programData, setProgramData] = useState<RoutineProgram>({
    week: 1,
    days: [
      { id: "d1", dayOfWeek: "LUN", name: "Día 1", focus: "Torso Pesado", isRest: false, exercises: [] },
      { id: "d2", dayOfWeek: "MAR", name: "Día 2", focus: "Descanso Activo", isRest: true, exercises: [] },
      { id: "d3", dayOfWeek: "MIE", name: "Día 3", focus: "Pierna Dominante", isRest: false, exercises: [] },
      { id: "d4", dayOfWeek: "JUE", name: "Día 4", focus: "Descanso", isRest: true, exercises: [] },
      { id: "d5", dayOfWeek: "VIE", name: "Día 5", focus: "Fullbody", isRest: false, exercises: [] },
      { id: "d6", dayOfWeek: "SAB", name: "Día 6", focus: "Descanso", isRest: true, exercises: [] },
      { id: "d7", dayOfWeek: "DOM", name: "Día 7", focus: "Descanso", isRest: true, exercises: [] },
    ]
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // 🚀 MEMORIA: Cargar la rutina existente al abrir 🚀
  useEffect(() => {
    const fetchExistingProgram = async () => {
      try {
        const { data } = await supabase.from('assigned_programs').select('*').eq('user_id', athleteId).eq('is_active', true).order('created_at', { ascending: false }).limit(1).single();
        if (data && data.program_data) {
          setProgramData(data.program_data);
          if (data.macrocycle) setMacrocycle(data.macrocycle);
          if (data.mesocycle) setMesocycle(data.mesocycle);
          if (data.program_data.annualPlan) setAnnualPlan(data.program_data.annualPlan);
          if (data.program_data.week) setCurrentWeek(data.program_data.week);
        }
      } catch (err) {
        console.log("Panel en blanco.");
      }
    };
    fetchExistingProgram();
  }, [athleteId]);

  // ─── FUNCIONES DEL MACRO-PLANIFICADOR (52 SEMANAS) ───
  const updateAnnualWeek = (weekNum: number, field: string, value: string) => {
    setAnnualPlan(prev => ({
      ...prev,
      [weekNum]: { ...(prev[weekNum] || {}), [field]: value }
    }));
  };

  const pushToMicrocycle = (weekNum: number) => {
    const weekData = annualPlan[weekNum] || {};
    setCurrentWeek(weekNum);
    setRoutineView('micro');
    
    // Si la fase existe en el macro, la pasamos al mesociclo automáticamente
    if (weekData.phase) setMesocycle(weekData.phase);
    
    // Actualizamos el número de semana en los datos del programa
    setProgramData(prev => ({ ...prev, week: weekNum }));
  };

  // ─── FUNCIONES DE EDICIÓN DEL MICROCICLO ───
  const toggleRestDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...programData };
    newData.days[selectedDayIndex].isRest = e.target.checked;
    setProgramData(newData);
  };

  const addExercise = () => {
    const newData = { ...programData };
    newData.days[selectedDayIndex].exercises.push({
      id: `ex_${Date.now()}`, name: "", tempo: "3-1-X-1", rest: "120s", methodology: "Top Set + Backoff", technique: "",
      sets: [{ id: `s_${Date.now()}`, setNumber: 1, type: "Working", targetWeight: "0", targetReps: "8", targetRpe: "8", targetRir: "2" }]
    });
    setProgramData(newData);
  };

  const updateExercise = (exIndex: number, field: keyof RoutineExercise, value: string) => {
    const newData = { ...programData };
    // @ts-ignore
    newData.days[selectedDayIndex].exercises[exIndex][field] = value;
    setProgramData(newData);
  };

  const removeExercise = (exIndex: number) => {
    const newData = { ...programData };
    newData.days[selectedDayIndex].exercises.splice(exIndex, 1);
    setProgramData(newData);
  };

  const addSet = (exIndex: number) => {
    const newData = { ...programData };
    const currentSets = newData.days[selectedDayIndex].exercises[exIndex].sets;
    currentSets.push({ id: `s_${Date.now()}`, setNumber: currentSets.length + 1, type: "Working", targetWeight: "", targetReps: "", targetRpe: "8", targetRir: "2" });
    setProgramData(newData);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof RoutineSet, value: string) => {
    const newData = { ...programData };
    // @ts-ignore
    newData.days[selectedDayIndex].exercises[exIndex].sets[setIndex][field] = value;
    setProgramData(newData);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const newData = { ...programData };
    newData.days[selectedDayIndex].exercises[exIndex].sets.splice(setIndex, 1);
    newData.days[selectedDayIndex].exercises[exIndex].sets.forEach((s, i) => s.setNumber = i + 1);
    setProgramData(newData);
  };

  // ─── GUARDAR EN BASE DE DATOS Y DISPARAR NOTIFICACIÓN ───
  const handleAssignProgram = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      // 1. Guardar la estructura de 52 semanas dentro del programa
      const finalProgramData = { ...programData, annualPlan, week: currentWeek };

      // 2. Apagamos la rutina vieja
      await supabase.from('assigned_programs').update({ is_active: false }).eq('user_id', athleteId);

      // 3. Guardamos la rutina nueva con los 12 meses adentro
      const { error } = await supabase.from('assigned_programs').insert({
          user_id: athleteId, macrocycle: macrocycle, mesocycle: mesocycle, program_data: finalProgramData, is_active: true
      });
      if (error) throw error;

      // 4. 🚀 AUTO-MEGÁFONO: Le mandamos la alerta al cliente
      await supabase.from('notifications').insert([{ 
          user_id: athleteId,
          is_global: false,
          title: "¡Nueva Estructura BII Asignada!", 
          message: `El Coach ha desplegado tu bloque para la Semana ${currentWeek}. Dirígete a la pestaña Agenda para comenzar.` 
      }]);

      setMessage(`✅ ¡BLOQUE GUARDADO! EL ATLETA YA VE LOS 12 MESES Y LA RUTINA.`);
    } catch (error: any) {
      setMessage("❌ ERROR: " + error.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="bg-[#0a0a0c] border border-zinc-800 p-6 md:p-8 rounded-[2.5rem] text-white font-sans shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* HEADER Y PESTAÑAS (MACRO / MICRO) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-zinc-800/80 pb-6 relative z-10 gap-4">
        <div className="flex gap-6">
          <button 
             onClick={() => setRoutineView('macro')}
             className={`flex items-center gap-2 pb-2 text-sm font-black uppercase tracking-widest transition-all ${routineView === 'macro' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-white'}`}
          >
              🗓️ MACRO-PLANIFICADOR
          </button>
          <button 
             onClick={() => setRoutineView('micro')}
             className={`flex items-center gap-2 pb-2 text-sm font-black uppercase tracking-widest transition-all ${routineView === 'micro' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-white'}`}
          >
              ⚡ CONSOLA MICROCICLO
          </button>
        </div>
        <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2 bg-[#050505] px-4 py-2 rounded-xl border border-zinc-800">
           Atleta: <span className="text-amber-500">{athleteName}</span>
        </p>
      </div>

      {/* ========================================================
          VISTA 1: MACRO-PLANIFICADOR (12 MESES / 52 SEMANAS)
      ======================================================== */}
      {routineView === 'macro' && (
         <div className="animate-in fade-in duration-300">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
               <div>
                   <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">PLANIFICADOR <span className="text-amber-500">ANUAL BII</span></h2>
                   <p className="text-zinc-400 text-xs font-medium mt-1">Defina las fases y enfoques para las 52 semanas del año.</p>
               </div>
               <div className="bg-[#050505] border border-amber-500/30 px-5 py-3 rounded-xl text-center shadow-inner">
                   <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1">Diseño Actual</p>
                   <p className="font-mono font-bold text-white text-lg">Semana {currentWeek}</p>
               </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar relative z-10 mb-8">
               {MONTHS_STRUCTURE.map((month, idx) => (
                   <div key={idx} className="bg-[#050505] border border-zinc-800 rounded-[1.5rem] p-5 h-fit shadow-inner">
                       <h3 className="text-amber-500 font-black italic uppercase text-lg border-b border-zinc-800 pb-3 mb-4">{month.name}</h3>
                       <div className="space-y-4">
                           {month.weeks.map(weekNum => (
                               <div key={weekNum} className={`bg-[#0a0a0c] rounded-xl border transition-all overflow-hidden ${expandedWeek === weekNum ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30' : 'border-zinc-800 hover:border-zinc-700'}`}>
                                   <div 
                                      className="p-4 cursor-pointer flex justify-between items-center hover:bg-zinc-900/50 transition-colors"
                                      onClick={() => setExpandedWeek(expandedWeek === weekNum ? null : weekNum)}
                                   >
                                       <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${expandedWeek === weekNum ? 'bg-amber-500 text-black' : 'bg-[#050505] text-zinc-300 border border-zinc-800'}`}>
                                           Semana {weekNum}
                                       </span>
                                       <span className="text-zinc-500 text-xs">{expandedWeek === weekNum ? '▲' : '▼'}</span>
                                   </div>

                                   {expandedWeek === weekNum && (
                                       <div className="p-5 border-t border-zinc-800 bg-[#050505] space-y-5 animate-in slide-in-from-top-2 duration-200">
                                           <div className="flex flex-col gap-3">
                                               <select 
                                                   value={annualPlan[weekNum]?.phase || ""}
                                                   onChange={(e) => updateAnnualWeek(weekNum, 'phase', e.target.value)}
                                                   className="w-full bg-[#0a0a0c] border border-zinc-800 text-zinc-300 text-xs font-bold uppercase rounded-xl px-4 py-3 outline-none focus:border-amber-500 appearance-none cursor-pointer"
                                               >
                                                   <option value="">-- Fase Fisiológica --</option>
                                                   <option value="Adaptacion Anatómica">Adaptación Anatómica</option>
                                                   <option value="Hipertrofia">Hipertrofia (Acumulación)</option>
                                                   <option value="Fuerza Base">Fuerza Base</option>
                                                   <option value="Fuerza Máxima">Fuerza Máxima (Intensificación)</option>
                                                   <option value="Peaking">Pico de Rendimiento (Peaking)</option>
                                                   <option value="Descarga">Descarga del SNC (Deload)</option>
                                               </select>
                                               <input 
                                                  type="text"
                                                  placeholder="Énfasis (Ej: Torso Pesado)"
                                                  value={annualPlan[weekNum]?.focus || ""}
                                                  onChange={(e) => updateAnnualWeek(weekNum, 'focus', e.target.value)}
                                                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-amber-500 placeholder:text-zinc-600"
                                               />
                                           </div>

                                           <button 
                                              onClick={() => pushToMicrocycle(weekNum)}
                                              className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 flex justify-center items-center gap-2"
                                           >
                                              ⚡ TRANSFERIR AL MICROCICLO
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

      {/* ========================================================
          VISTA 2: CONSOLA MICROCICLO (7 DÍAS Y EJERCICIOS)
      ======================================================== */}
      {routineView === 'micro' && (
        <div className="animate-in fade-in duration-300 relative z-10">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="bg-[#050505] p-4 rounded-2xl border border-zinc-800 shadow-inner">
              <label className="block text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">Macrociclo (Global)</label>
              <input type="text" value={macrocycle} onChange={(e) => setMacrocycle(e.target.value)} className="w-full bg-transparent text-sm md:text-base font-bold text-white outline-none focus:text-amber-400" />
            </div>
            <div className="bg-[#050505] p-4 rounded-2xl border border-zinc-800 shadow-inner">
              <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2 flex justify-between">
                <span>Mesociclo (Fase Actual)</span>
                <span className="text-amber-500">Semana {currentWeek}</span>
              </label>
              <input type="text" value={mesocycle} onChange={(e) => setMesocycle(e.target.value)} className="w-full bg-transparent text-sm md:text-base font-bold text-white outline-none focus:text-amber-400" />
            </div>
          </div>

          {/* TABS DE DÍAS */}
          <div className="mb-8 border-b border-zinc-800/80 pb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {programData.days.map((day, index) => (
                <button key={day.id} onClick={() => setSelectedDayIndex(index)} className={`px-5 py-4 rounded-2xl border flex-shrink-0 flex flex-col items-center transition-all min-w-[100px] ${selectedDayIndex === index ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-[#050505] border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                  <span className={`font-black text-xs md:text-sm uppercase ${selectedDayIndex === index ? 'text-amber-500' : 'text-white'}`}>{day.dayOfWeek}</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold mt-1">{day.isRest ? '💤 Rest' : '⚡ Go'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ÁREA DE TRABAJO DEL DÍA */}
          <div className="bg-[#050505] border border-zinc-800/80 rounded-[2rem] p-5 md:p-8 mb-8 shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-800/50 pb-6">
              <div className="w-full md:w-auto flex-1">
                <input 
                  type="text" value={programData.days[selectedDayIndex].focus} 
                  onChange={(e) => { const newData = {...programData}; newData.days[selectedDayIndex].focus = e.target.value; setProgramData(newData); }}
                  className="bg-transparent text-xl md:text-2xl font-black uppercase text-white outline-none focus:text-amber-400 transition-colors w-full placeholder:text-zinc-700"
                  placeholder="Enfoque del Día. Ej: Torso Pesado"
                />
              </div>
              
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl cursor-pointer transition-all border shadow-sm ${programData.days[selectedDayIndex].isRest ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-[#0a0a0c] border-zinc-800 hover:border-amber-500/50'}`}>
                <input type="checkbox" checked={programData.days[selectedDayIndex].isRest} onChange={toggleRestDay} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${programData.days[selectedDayIndex].isRest ? 'text-indigo-400' : 'text-zinc-400'}`}>
                  {programData.days[selectedDayIndex].isRest ? 'Día de Recuperación 💤' : 'Forzar Descanso'}
                </span>
              </label>
            </div>

            {programData.days[selectedDayIndex].isRest ? (
              <div className="text-center py-16 bg-[#0a0a0c] rounded-2xl border border-dashed border-zinc-700/50">
                <span className="text-5xl block mb-4 opacity-50">🔋</span>
                <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">El atleta no verá ejercicios este día.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {programData.days[selectedDayIndex].exercises.map((ex, exIndex) => (
                  <div key={ex.id} className="bg-[#0a0a0c] border border-zinc-800/80 p-5 md:p-6 rounded-[1.5rem] relative group shadow-md">
                    <button onClick={() => removeExercise(exIndex)} className="absolute top-5 right-5 text-zinc-600 hover:text-red-500 font-bold bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 pr-10">
                      <div className="md:col-span-12">
                        <label className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1 block">Ejercicio {exIndex + 1}</label>
                        <input type="text" value={ex.name} onChange={e => updateExercise(exIndex, 'name', e.target.value)} placeholder="Ej: Sentadilla Hack" className="w-full bg-transparent text-lg font-black text-white border-b border-zinc-800 focus:border-amber-500 outline-none pb-2 placeholder:text-zinc-700" />
                      </div>
                      
                      <div className="md:col-span-4">
                        <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Método</label>
                        <input type="text" value={ex.methodology} onChange={e => updateExercise(exIndex, 'methodology', e.target.value)} placeholder="Ej: Top Set" className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-3 text-xs text-white outline-none focus:border-amber-500 placeholder:text-zinc-700 shadow-inner" />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Tempo</label>
                        <input type="text" value={ex.tempo} onChange={e => updateExercise(exIndex, 'tempo', e.target.value)} placeholder="Ej: 3-1-X-1" className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-3 text-xs text-amber-400 font-mono outline-none focus:border-amber-500 placeholder:text-zinc-700 shadow-inner" />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Descanso</label>
                        <input type="text" value={ex.rest} onChange={e => updateExercise(exIndex, 'rest', e.target.value)} placeholder="Ej: 180s" className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-3 text-xs text-blue-400 font-mono outline-none focus:border-blue-500 placeholder:text-zinc-700 shadow-inner" />
                      </div>
                      <div className="md:col-span-12">
                        <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Apuntes Técnicos (Coach)</label>
                        <input type="text" value={ex.technique} onChange={e => updateExercise(exIndex, 'technique', e.target.value)} placeholder="Ej: Pausa obligatoria abajo." className="w-full bg-[#050505] border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 outline-none focus:border-amber-500 placeholder:text-zinc-700 shadow-inner" />
                      </div>
                    </div>

                    <div className="bg-[#050505] rounded-xl border border-zinc-800 p-4">
                      <div className="flex justify-between items-center mb-3 border-b border-zinc-800/50 pb-2">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Series de Trabajo</span>
                        <div className="flex gap-6 pr-12 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                           <span className="w-16 text-center">Tipo</span><span className="w-12 text-center">KG</span><span className="w-12 text-center">Reps</span><span className="w-10 text-center">RPE</span><span className="w-10 text-center">RIR</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {ex.sets.map((set, setIndex) => (
                          <div key={set.id} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-[#0a0a0c] border border-zinc-800/80 p-2 rounded-lg relative transition-colors hover:border-zinc-700">
                            <span className="text-xs font-black text-zinc-500 w-4 text-center">{set.setNumber}</span>
                            
                            <select value={set.type} onChange={e => updateSet(exIndex, setIndex, 'type', e.target.value)} className="bg-transparent border border-zinc-700 text-[10px] text-white rounded p-1.5 outline-none w-20 cursor-pointer">
                              <option className="bg-zinc-900" value="Warmup">Warmup</option><option className="bg-zinc-900" value="Working">Working</option><option className="bg-zinc-900" value="Top Set">Top Set</option><option className="bg-zinc-900" value="Backoff">Backoff</option>
                            </select>

                            <div className="flex-1 flex items-center justify-end gap-2 pr-8">
                              <input type="text" value={set.targetWeight} onChange={e => updateSet(exIndex, setIndex, 'targetWeight', e.target.value)} placeholder="KG" className="w-14 bg-[#050505] border border-zinc-700 rounded p-1.5 text-center text-xs text-white font-mono outline-none focus:border-amber-500 shadow-inner" />
                              <span className="text-zinc-600 text-[10px]">x</span>
                              <input type="text" value={set.targetReps} onChange={e => updateSet(exIndex, setIndex, 'targetReps', e.target.value)} placeholder="Reps" className="w-14 bg-[#050505] border border-zinc-700 rounded p-1.5 text-center text-xs text-white font-mono outline-none focus:border-amber-500 shadow-inner" />
                              <input type="text" value={set.targetRpe} onChange={e => updateSet(exIndex, setIndex, 'targetRpe', e.target.value)} placeholder="RPE" className="w-12 bg-[#050505] border border-blue-900/30 rounded p-1.5 text-center text-xs text-blue-400 font-mono outline-none focus:border-blue-500 shadow-inner" />
                              <input type="text" value={set.targetRir} onChange={e => updateSet(exIndex, setIndex, 'targetRir', e.target.value)} placeholder="RIR" className="w-12 bg-[#050505] border border-amber-900/30 rounded p-1.5 text-center text-xs text-amber-500 font-mono outline-none focus:border-amber-500 shadow-inner" />
                            </div>

                            <button onClick={() => removeSet(exIndex, setIndex)} className="absolute right-2 text-zinc-600 hover:text-red-500 bg-zinc-900 rounded-md w-6 h-6 flex items-center justify-center font-bold transition-colors">✕</button>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => addSet(exIndex)} className="w-full mt-3 bg-zinc-950 hover:bg-zinc-900 text-amber-500 border border-zinc-800 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md">
                        + Añadir Serie
                      </button>
                    </div>
                  </div>
                ))}
                
                <button onClick={addExercise} className="w-full bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 border border-amber-500/20 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-dashed active:scale-95">
                  + Insertar Ejercicio Estructural
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── BOTÓN FINAL DE GUARDADO Y ALERTAS ─── */}
      {message && <div className={`p-4 rounded-xl mb-6 text-xs font-black text-center uppercase tracking-widest border relative z-10 animate-in fade-in zoom-in ${message.includes('❌') ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>{message}</div>}
      
      <button onClick={handleAssignProgram} disabled={isSaving} className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(245,158,11,0.2)] border border-amber-300 relative group overflow-hidden z-10">
        <span className="relative z-10">{isSaving ? "Sincronizando..." : "🚀 ASIGNAR PROGRAMA AL ATLETA"}</span>
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
      </button>
    </div>
  );
}