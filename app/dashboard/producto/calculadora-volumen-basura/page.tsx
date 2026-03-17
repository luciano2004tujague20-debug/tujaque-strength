"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

type ExerciseInput = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  rir: number;
  frequency: number;
};

export default function JunkVolumeKiller() {
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { id: '1', name: 'Press de Banca', muscle: 'Pecho', sets: 5, reps: 10, rir: 2, frequency: 2 },
    { id: '2', name: 'Aperturas', muscle: 'Pecho', sets: 4, reps: 12, rir: 3, frequency: 2 },
    { id: '3', name: 'Sentadilla', muscle: 'Piernas', sets: 4, reps: 8, rir: 1, frequency: 2 }
  ]);
  const [showOptimized, setShowOptimized] = useState(false);
  
  // 🔥 ESTADOS PARA LA IA DE LA CALCULADORA
  const [aiQuestion, setAiQuestion] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now().toString(), name: '', muscle: 'Pecho', sets: 3, reps: 10, rir: 2, frequency: 1 }]);
    setShowOptimized(false);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    setShowOptimized(false);
  };

  const updateExercise = (id: string, field: keyof ExerciseInput, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    setShowOptimized(false);
  };

  // 🔥 MOTOR MATEMÁTICO BII-VINTAGE (NIVEL ÉLITE MUNDIAL) 🔥
  const analysis = useMemo(() => {
    let rawTotalSets = 0;
    let rawEffectiveSets = 0;
    let totalSNCFatigue = 0;
    
    // 1. Base de datos Biomecánica (MRV = Límite Biológico de Series por Semana)
    const BIOMECHANICS: Record<string, { mrv: number, cnsCost: number, joints: string[] }> = {
      'Pecho': { mrv: 10, cnsCost: 1.2, joints: ['Hombro Anterior', 'Codos'] },
      'Espalda': { mrv: 12, cnsCost: 1.5, joints: ['Lumbares', 'Codos'] },
      'Piernas': { mrv: 8, cnsCost: 2.5, joints: ['Rodillas', 'Lumbares', 'Caderas'] }, // Piernas fríe el SNC rapidísimo
      'Hombros': { mrv: 10, cnsCost: 1.1, joints: ['Manguito Rotador', 'Codos'] },
      'Bíceps': { mrv: 12, cnsCost: 0.5, joints: ['Codos', 'Muñecas'] },  
      'Tríceps': { mrv: 12, cnsCost: 0.6, joints: ['Codos', 'Muñecas'] }
    };

    const muscleGroups: Record<string, { total: number, effective: number, junk: number, isOvertraining: boolean, mrvLimit: number }> = {};
    const jointStress: Record<string, number> = {};

    exercises.forEach(ex => {
      const weeklyVolume = ex.sets * ex.frequency;
      rawTotalSets += weeklyVolume;

      // 2. Penalización Exponencial por Falta de Intensidad (Curva de Tensión)
      let intensityFactor = 0;
      if (ex.rir === 0) intensityFactor = 1.0;     // 100% estímulo
      else if (ex.rir === 1) intensityFactor = 0.85; 
      else if (ex.rir === 2) intensityFactor = 0.60; 
      else if (ex.rir === 3) intensityFactor = 0.30; 
      else intensityFactor = 0.0; // RIR > 3 es cardio

      const effective = weeklyVolume * intensityFactor;
      rawEffectiveSets += effective;

      // 3. Costo al Sistema Nervioso Central (SNC)
      const cnsMultiplier = BIOMECHANICS[ex.muscle]?.cnsCost || 1.0;
      totalSNCFatigue += (weeklyVolume * cnsMultiplier * (ex.rir === 0 ? 1.2 : 1.0));

      // 4. Mapeo de Riesgo Articular (Acumulación de estrés en tendones)
      const jointsAffected = BIOMECHANICS[ex.muscle]?.joints || [];
      jointsAffected.forEach(joint => {
          jointStress[joint] = (jointStress[joint] || 0) + weeklyVolume;
      });

      if (!muscleGroups[ex.muscle]) {
        muscleGroups[ex.muscle] = { total: 0, effective: 0, junk: 0, isOvertraining: false, mrvLimit: BIOMECHANICS[ex.muscle]?.mrv || 12 };
      }
      muscleGroups[ex.muscle].total += weeklyVolume;
      muscleGroups[ex.muscle].effective += effective;
    });

    let finalEffectiveSets = 0;
    let overtrainingFatigue = 0;

    Object.keys(muscleGroups).forEach(muscle => {
      let group = muscleGroups[muscle];
      if (group.effective > group.mrvLimit) {
        const excess = group.effective - group.mrvLimit;
        group.junk += excess + (group.total - group.effective);
        group.effective = group.mrvLimit;
        group.isOvertraining = true;
        overtrainingFatigue += excess;
      } else {
        group.junk = group.total - group.effective;
      }
      finalEffectiveSets += group.effective;
    });

    // Detectar articulaciones en peligro (> 15 series semanales de impacto)
    const jointsAtRisk = Object.keys(jointStress).filter(j => jointStress[j] > 15).map(j => ({ name: j, volume: jointStress[j] }));

    const junkSets = rawTotalSets - finalEffectiveSets;
    const efficiencyScore = rawTotalSets > 0 ? Math.round((finalEffectiveSets / rawTotalSets) * 100) : 0;
    
    // Clasificación del SNC
    let systemicFatigueLevel = "BAJA";
    let sncColor = "text-emerald-500";
    let sncBg = "bg-emerald-500";
    
    if (totalSNCFatigue > 80) { systemicFatigueLevel = "COLAPSO INMINENTE"; sncColor = "text-red-500"; sncBg = "bg-red-500"; }
    else if (totalSNCFatigue > 55) { systemicFatigueLevel = "ALTA (PELIGRO)"; sncColor = "text-amber-500"; sncBg = "bg-amber-500"; }
    else if (totalSNCFatigue > 35) { systemicFatigueLevel = "ÓPTIMA"; sncColor = "text-emerald-400"; sncBg = "bg-emerald-400"; }

    let diagnosis = { title: "", desc: "", color: "", action: "" };

    if (efficiencyScore >= 85 && overtrainingFatigue === 0 && totalSNCFatigue <= 55) {
      diagnosis = { title: "Rango Élite", desc: "Volumen biomecánico perfecto. Estás operando en la zona de máximo rendimiento sin freír tu SNC.", color: "text-emerald-500", action: "No toques nada. Concéntrate en añadir kilos a la barra." };
    } else if (overtrainingFatigue > 0 || totalSNCFatigue > 80) {
      let worstMuscle = Object.keys(muscleGroups).length > 0 ? Object.keys(muscleGroups).reduce((a, b) => muscleGroups[a].junk > muscleGroups[b].junk ? a : b) : 'cuerpo';
      diagnosis = { title: "Colapso del SNC Detectado", desc: `ALERTA CLÍNICA: Tu ${worstMuscle} está recibiendo daño puro sin estímulo hipertrófico. El estrés neural es altísimo.`, color: "text-red-600", action: "Riesgo de lesión. Usa la guillotina de IA ahora mismo para salvar tu SNC." };
    } else if (efficiencyScore >= 60) {
      diagnosis = { title: "Falta de Intensidad Real", desc: "Mucho movimiento logístico, poca tensión mecánica. Estás dejando demasiadas repeticiones en reserva.", color: "text-amber-500", action: "Estás perdiendo el tiempo. Eliminá el volumen basura y acercate al fallo absoluto (RIR 0)." };
    } else {
      diagnosis = { title: "Rutina Basura (Nivel Cardio)", desc: "El algoritmo indica que no estás entrenando fuerza, estás haciendo zumba con pesas. El crecimiento es matemáticamente imposible.", color: "text-red-500", action: "URGENTE: Activá el Optimizador BII y reestructura tu planificación." };
    }

    return { rawTotalSets, effectiveSets: Math.round(finalEffectiveSets * 10)/10, junkSets: Math.round(junkSets * 10)/10, efficiencyScore, diagnosis, muscleGroups, overtrainingFatigue, systemicFatigueLevel, sncColor, sncBg, totalSNCFatigue, jointsAtRisk };
  }, [exercises]);

  // 🔥 CONTROLADOR DE IA CON CONTEXTO BIOMECÁNICO PROFUNDO 🔥
  const handleAskAI = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiQuestion.trim()) return;
      setIsAiThinking(true);
      setAiResponse("");

      const routineContext = exercises.map(ex => `${ex.name} (${ex.sets} sets x ${ex.frequency} días, RIR ${ex.rir})`).join(", ");
      const jointContext = analysis.jointsAtRisk.length > 0 ? `Articulaciones en riesgo de ruptura inminente: ${analysis.jointsAtRisk.map(j => j.name).join(', ')}.` : 'Articulaciones en rango seguro.';
      const biomechanicData = `DATOS CLÍNICOS: Eficiencia Neural: ${analysis.efficiencyScore}%. Fatiga del SNC: ${analysis.systemicFatigueLevel}. ${jointContext} Músculos con exceso de volumen: ${Object.keys(analysis.muscleGroups).filter(m => analysis.muscleGroups[m].isOvertraining).join(', ') || 'Ninguno'}.`;

      try {
          const res = await fetch("/api/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  messages: [{
                      role: "user", 
                      content: `ACTÚA COMO EL HEAD COACH LUCIANO TUJAGUE (Metodología BII-Vintage). Eres directo, clínico, no usas emojis infantiles y hablas con autoridad biomecánica.
                      Acabo de usar tu software Junk Volume Killer. 
                      Mi rutina original: ${routineContext}.
                      ${biomechanicData}
                      Me guillotinaste la rutina dejándola a RIR 0 y volumen mínimo. 
                      RESPONDE ESTA DUDA DEL ATLETA DE FORMA CORTA, CLÍNICA Y AL GRANO (Máximo 3 párrafos): "${aiQuestion}"`
                  }] 
              })
          });
          const data = await res.json();
          if (data.reply) {
              setAiResponse(data.reply);
          } else {
              setAiResponse("El sistema está procesando demasiada información. Reinicia e intenta de nuevo.");
          }
      } catch (error) {
          setAiResponse("Fallo de conexión en los servidores centrales.");
      } finally {
          setIsAiThinking(false);
          setAiQuestion("");
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
        
        {/* ENCABEZADO VIP */}
        <div className="bg-[#0a0a0c] border border-red-900/40 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(239,68,68,0.1)] relative overflow-hidden transform-gpu">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(239,68,68,0.1)_0%,transparent_60%)] pointer-events-none transform-gpu -translate-y-1/4 translate-x-1/4"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <Link href="/dashboard" className="text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-red-500 transition-colors mb-4 inline-flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
                 ← Panel Principal
              </Link>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase drop-shadow-md">
                Junk Volume <span className="text-red-500">Killer</span>
              </h1>
              <p className="text-zinc-400 mt-3 max-w-xl font-medium text-sm md:text-base">
                Herramienta de Auditoría Quirúrgica. Ingresá tu estructura semanal y el algoritmo BII detectará el volumen inútil y el riesgo de sobreentrenamiento.
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl text-center shadow-inner shrink-0">
              <span className="text-4xl block mb-2 drop-shadow-md">🔪</span>
              <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">Guillotina Biomecánica</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: PANEL DE INPUTS (LA RUTINA) */}
          <div className="lg:col-span-7 bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative z-10">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                <span className="text-red-500 text-2xl">1.</span> Tu Estructura Actual
              </h3>
              <button onClick={addExercise} className="bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black border border-zinc-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                + Agregar Ejercicio
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {exercises.map((ex, index) => (
                <div key={ex.id} className="bg-[#050505] border border-zinc-800 p-5 rounded-2xl relative group hover:border-zinc-600 transition-colors shadow-inner">
                  <button onClick={() => removeExercise(ex.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 text-xl font-bold transition-colors" title="Eliminar">×</button>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">Movimiento {index + 1}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Nombre (Opcional)</label>
                      <input type="text" value={ex.name} onChange={(e) => updateExercise(ex.id, 'name', e.target.value)} placeholder="Ej: Sentadilla Hack" className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 transition-colors shadow-inner" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Grupo Muscular</label>
                      <div className="relative">
                        <select value={ex.muscle} onChange={(e) => updateExercise(ex.id, 'muscle', e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 cursor-pointer appearance-none shadow-inner">
                          <option value="Pecho">Pecho</option>
                          <option value="Espalda">Espalda</option>
                          <option value="Piernas">Piernas</option>
                          <option value="Hombros">Hombros</option>
                          <option value="Bíceps">Bíceps</option>
                          <option value="Tríceps">Tríceps</option>
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-zinc-500">▼</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1 text-center">Series Diarias</label>
                      <input type="number" min="1" value={ex.sets} onChange={(e) => updateExercise(ex.id, 'sets', Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg px-2 py-2 text-sm md:text-base font-black text-center text-white outline-none focus:border-red-500" />
                    </div>
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1 text-center">Repeticiones</label>
                      <input type="number" min="1" value={ex.reps} onChange={(e) => updateExercise(ex.id, 'reps', Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg px-2 py-2 text-sm md:text-base font-black text-center text-white outline-none focus:border-red-500" />
                    </div>
                    <div>
                      <label className="block text-[8px] text-amber-500 font-black uppercase tracking-widest mb-1 text-center">RIR (Fallo)</label>
                      <input type="number" min="0" max="10" value={ex.rir} onChange={(e) => updateExercise(ex.id, 'rir', Number(e.target.value))} className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-2 text-sm md:text-base font-black text-center text-amber-400 outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1 text-center">Días x Semana</label>
                      <input type="number" min="1" value={ex.frequency} onChange={(e) => updateExercise(ex.id, 'frequency', Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg px-2 py-2 text-sm md:text-base font-black text-center text-white outline-none focus:border-red-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: DASHBOARD HUD CLÍNICO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* EFICIENCIA SCORE */}
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${analysis.efficiencyScore >= 80 ? 'bg-emerald-500' : analysis.efficiencyScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Eficiencia Biomecánica Real</h3>
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#18181b" strokeWidth="12" fill="none" />
                  <circle cx="80" cy="80" r="70" stroke={analysis.efficiencyScore >= 80 ? '#10b981' : analysis.efficiencyScore >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * analysis.efficiencyScore) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black italic tracking-tighter text-white">{analysis.efficiencyScore}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">/ 100</span>
                </div>
              </div>
              <h4 className={`text-xl font-black uppercase italic tracking-tight mb-2 ${analysis.diagnosis.color}`}>{analysis.diagnosis.title}</h4>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed bg-[#050505] p-4 rounded-xl border border-zinc-800 shadow-inner">{analysis.diagnosis.desc}</p>
            </div>

            {/* TERMÓMETRO DEL SNC (NUEVO) */}
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2"><span>🌡️</span> Estrés del Sist. Nervioso</span>
                <span className={`text-[10px] font-black uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 ${analysis.sncColor} ${analysis.totalSNCFatigue > 80 ? 'animate-pulse' : ''}`}>{analysis.systemicFatigueLevel}</span>
              </div>
              
              <div className="relative w-full bg-black rounded-full h-4 md:h-5 border border-zinc-800 overflow-hidden shadow-inner mb-3">
                <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${analysis.sncBg}`} style={{ width: `${Math.min(100, analysis.totalSNCFatigue)}%` }}>
                   {analysis.totalSNCFatigue > 80 && <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]"></div>}
                </div>
              </div>
              <div className="flex justify-between text-[8px] md:text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                 <span>Óptimo (Recuperación)</span>
                 <span>Peligro Clínico (Fritura)</span>
              </div>
            </div>

            {/* MAPEO DE RIESGO ARTICULAR (NUEVO) */}
            {analysis.jointsAtRisk.length > 0 && (
              <div className="bg-red-950/20 border border-red-500/30 p-6 md:p-8 rounded-[2rem] shadow-lg animate-in slide-in-from-right-4">
                 <h4 className="text-red-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-500/20 pb-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></span> Riesgo Articular Crítico
                 </h4>
                 <p className="text-sm text-red-200/80 font-medium mb-4">El volumen programado está ejerciendo demasiada fricción en las siguientes estructuras articulares. Riesgo de tendinitis inminente:</p>
                 <div className="flex flex-wrap gap-2">
                    {analysis.jointsAtRisk.map(j => (
                       <span key={j.name} className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                          ⚠️ {j.name}
                       </span>
                    ))}
                 </div>
              </div>
            )}

            {/* MÉTRICAS SECUNDARIAS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Series Totales (Logística)</span>
                <span className="text-3xl font-black text-white">{analysis.rawTotalSets}</span>
              </div>
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Efectivas (Ganancia)</span>
                <span className="text-3xl font-black text-emerald-400">{analysis.effectiveSets}</span>
              </div>
            </div>

            {/* BOTÓN DE GUILLOTINA */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
                <button 
                  onClick={() => setShowOptimized(!showOptimized)}
                  className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-[0_0_40px_rgba(239,68,68,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 border ${showOptimized ? 'bg-[#050505] text-red-500 border-red-500/50 hover:bg-zinc-900' : 'bg-red-600 hover:bg-red-500 text-white border-red-500'}`}
                >
                  {showOptimized ? "OCULTAR INTERVENCIÓN" : "🔪 EJECUTAR GUILLOTINA IA"}
                </button>
                <p className="text-center text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-4 leading-relaxed px-4">El algoritmo eliminará el {analysis.junkSets} sets de volumen basura y reestructurará tu rutina al límite biológico (MRV).</p>
            </div>
          </div>
        </div>

        {/* 🤖 RESULTADO DE LA GUILLOTINA (ANIMADO) */}
        {showOptimized && (
           <div className="bg-gradient-to-br from-zinc-900/80 to-[#0a0a0c] border border-red-500/50 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(239,68,68,0.2)] animate-in slide-in-from-top-8 relative overflow-hidden mt-10">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-amber-500"></div>
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(239,68,68,0.15)_0%,transparent_60%)] pointer-events-none transform-gpu"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-zinc-800/80 pb-8 relative z-10">
                 <div>
                     <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                     <span className="text-4xl drop-shadow-md">🔪</span> Estructura <span className="text-red-500">Guillotinada</span>
                     </h3>
                     <p className="text-zinc-400 font-medium text-sm md:text-base mt-2 max-w-2xl leading-relaxed">El algoritmo ajustó la tensión mecánica de todos tus ejercicios al Fallo (RIR 0) y recortó los sets al Mínimo Volumen Efectivo para preservar tu Sistema Nervioso.</p>
                 </div>
                 <div className="bg-red-500/10 border border-red-500/30 px-6 py-4 rounded-2xl shadow-inner text-center w-full md:w-auto shrink-0 flex items-center justify-center gap-4">
                     <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest text-red-400/80 font-black mb-1">Volumen Amputado</p>
                        <p className="text-zinc-300 font-bold text-xs">Ahorraste 45 min en el gym.</p>
                     </div>
                     <p className="text-red-500 font-black text-4xl italic leading-none drop-shadow-md">-{analysis.junkSets}</p>
                 </div>
             </div>
             
             {/* LISTA GUILLOTINADA */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12 relative z-10">
                {exercises.map((ex) => {
                  const optimalSets = Math.max(1, Math.min(2, ex.sets)); // BII estricto: 1 a 2 sets al fallo.
                  
                  return (
                  <div key={ex.id + 'opt'} className="bg-[#050505] border border-zinc-800 p-6 md:p-8 rounded-[2rem] flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-lg group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:w-2 transition-all shadow-[0_0_10px_#10b981]"></div>
                    
                    <div className="flex justify-between items-start mb-6 pl-3">
                      <div>
                        <p className="text-white font-black uppercase tracking-tight text-xl mb-1">{ex.name || 'Ejercicio sin nombre'}</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-md inline-block border border-zinc-800">{ex.muscle}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {/* El tachado visual hermoso */}
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Antes:</span>
                           <span className="text-zinc-600 font-black text-lg line-through decoration-red-500 decoration-2">{ex.sets} SETS</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                           <span className="text-emerald-400 font-black text-3xl md:text-4xl italic tracking-tighter drop-shadow-md">{optimalSets}</span>
                           <span className="text-[10px] md:text-xs text-emerald-500 font-black uppercase tracking-widest">Sets Efectivos</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-900/30 ml-3 flex justify-between items-center shadow-inner">
                        <div className="flex items-center gap-2">
                           <span className="text-lg">🎯</span>
                           <div>
                              <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Intensidad Requerida</p>
                              <p className="text-xs text-white font-bold">{ex.reps} Repeticiones exactas</p>
                           </div>
                        </div>
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md border border-red-500">RIR 0 (Fallo Real)</span>
                    </div>
                  </div>
                )})}
             </div>

             {/* MÓDULO DE CONSULTA IA INTEGRADO */}
             <div className="bg-[#050505] border border-blue-900/40 rounded-[2rem] p-8 md:p-10 relative z-10 shadow-xl">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-blue-900/30 pb-6">
                     <div>
                         <h4 className="text-blue-500 font-black uppercase tracking-widest text-xs md:text-sm flex items-center gap-3">
                             <span className="text-2xl p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">🤖</span> Consultorio Biomecánico
                         </h4>
                         <p className="text-zinc-400 text-sm font-medium mt-2 max-w-lg">¿No entendés por qué la IA te recortó {analysis.junkSets} series? Preguntale el motivo biológico o cómo ejecutar esta nueva estructura.</p>
                     </div>
                 </div>
                 
                 {aiResponse && (
                     <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-blue-950/40 to-black border border-zinc-800 border-l-4 border-l-blue-500 rounded-r-2xl text-blue-50 text-sm md:text-base leading-relaxed font-medium animate-in slide-in-from-left-4 shadow-lg">
                         <span className="block text-[10px] text-blue-400 font-black uppercase tracking-widest mb-3">Dictamen del Head Coach:</span>
                         {aiResponse}
                     </div>
                 )}

                 <form onSubmit={handleAskAI} className="flex flex-col md:flex-row gap-3">
                     <input 
                         type="text" 
                         value={aiQuestion}
                         onChange={(e) => setAiQuestion(e.target.value)}
                         placeholder="Ej: Coach, ¿por qué me bajaste los sets de pecho si no me duelen los hombros?"
                         className="flex-1 bg-black border border-zinc-800 rounded-xl px-6 py-5 text-sm text-white outline-none focus:border-blue-500 transition-colors shadow-inner placeholder:text-zinc-600"
                         disabled={isAiThinking}
                     />
                     <button 
                         type="submit" 
                         disabled={isAiThinking || !aiQuestion.trim()}
                         className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] md:text-xs uppercase tracking-widest px-8 py-5 md:py-0 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                     >
                         {isAiThinking ? 'PROCESANDO...' : 'CONSULTAR A LA IA 🧠'}
                     </button>
                 </form>
             </div>
           </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}} />
    </div>
  );
}