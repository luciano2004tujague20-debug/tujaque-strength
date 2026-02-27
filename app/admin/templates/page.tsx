"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link"; // ✅ ACÁ ESTÁ EL IMPORT CORREGIDO

// Tipo para estructurar los ejercicios en el constructor visual
interface ExerciseBlock {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rpe: string;
  rest: string;
  tempo: string;
  notes: string;
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Estados del Modo Texto (El original, mantenido intacto por seguridad)
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Estados del MODO CONSTRUCTOR ÉLITE
  const [buildMode, setBuildMode] = useState<"visual" | "text" | "ai">("ai");
  const [metaPhase, setMetaPhase] = useState("Fuerza Máxima");
  const [metaMethodology, setMetaMethodology] = useState("BII-Vintage");
  const [exercises, setExercises] = useState<ExerciseBlock[]>([]);

  // 🤖 NUEVOS ESTADOS: MODO IA
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTemplates(data || []);
    setLoading(false);
  }

  // 🤖 GENERAR PLANTILLA CON IA
  const handleGenerateWithAI = async () => {
      if (!aiPrompt.trim()) return alert("Fiera, escribí qué tipo de rutina querés generar.");
      
      setIsGeneratingAi(true);
      try {
          const res = await fetch('/api/admin/ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                 action: 'generate_template', 
                 data: { prompt: aiPrompt } 
              })
          });
          const data = await res.json();
          
          if (data.result) {
              setNewContent(data.result);
              // Cambiamos automáticamente a modo texto para que el Coach la vea y la edite
              setBuildMode("text");
              setAiPrompt("");
          } else {
              alert("Error procesando la solicitud con la IA.");
          }
      } catch (error) {
          alert("Error de conexión con el Asistente Experto.");
      } finally {
          setIsGeneratingAi(false);
      }
  };

  // Agregar un ejercicio vacío al constructor
  const addExercise = () => {
    setExercises([...exercises, { 
      id: Math.random().toString(), 
      name: "", sets: "", reps: "", rpe: "", rest: "", tempo: "", notes: "" 
    }]);
  };

  // Actualizar un ejercicio específico
  const updateExercise = (id: string, field: keyof ExerciseBlock, value: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  // Quitar un ejercicio
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  // Compilador Inteligente: Convierte los campos visuales en texto estructurado
  const compileTemplate = () => {
    if (!newTitle) return alert("⚠️ Falta el Título de la Plantilla");
    if (exercises.length === 0) return alert("⚠️ Agrega al menos un ejercicio");

    let compiledText = `🔥 FASE: ${metaPhase} | ⚙️ METODOLOGÍA: ${metaMethodology}\n\n`;

    exercises.forEach((ex, index) => {
      compiledText += `${index + 1}️⃣ ${ex.name.toUpperCase() || "EJERCICIO SIN NOMBRE"}\n`;
      if (ex.sets || ex.reps) compiledText += `   🔸 Series/Reps: ${ex.sets} x ${ex.reps}\n`;
      if (ex.rpe) compiledText += `   🔸 Intensidad: ${ex.rpe}\n`;
      if (ex.rest) compiledText += `   🔸 Descanso: ${ex.rest}\n`;
      if (ex.tempo) compiledText += `   🔸 Cadencia/Tempo: ${ex.tempo}\n`;
      if (ex.notes) compiledText += `   📝 Notas: ${ex.notes}\n`;
      compiledText += `\n`;
    });

    return compiledText;
  };

  async function saveTemplate() {
    let finalContent = newContent;

    if (buildMode === "visual") {
      const compiled = compileTemplate();
      if (!compiled) return; // Si faltan datos, frena acá
      finalContent = compiled;
    } else {
      if (!newTitle || !newContent) return alert("Completá título y contenido");
    }

    const { error } = await supabase
      .from("templates")
      .insert([{ title: newTitle, content: finalContent }]);

    if (error) {
      console.error("Error completo de Supabase:", error);
      alert(`❌ ERROR DE SUPABASE:\n${error.message}\n\nDetalles: ${error.details || "Ninguno"}`);
    } else {
      setNewTitle("");
      setNewContent("");
      setExercises([]); // Reseteamos el constructor
      fetchTemplates();
      alert("✅ ¡Plantilla guardada con éxito!");
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  async function deleteTemplate(id: string) {
    if (!confirm("¿Borrar esta plantilla permanentemente?")) return;
    await supabase.from("templates").delete().eq("id", id);
    fetchTemplates();
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 min-h-screen bg-transparent">
       <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
       <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Cargando Laboratorio...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in bg-transparent text-white font-sans">
      
      {/* HEADER PREMIUM */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-zinc-900/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-md text-white">
            Librería <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">BII-VINTAGE</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">Laboratorio de Programación y Bloques Maestros</p>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/admin/orders" className="text-zinc-400 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
              Ir a Órdenes 💸
           </Link>
           <div className="bg-black/30 border border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-3">
             <span className="text-2xl">🧪</span>
             <div>
               <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Bloques Activos</p>
               <p className="text-xl font-black text-white">{templates.length}</p>
             </div>
           </div>
        </div>
      </header>

      {/* CREADOR DE PLANTILLAS */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 mb-16 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6 gap-4 relative z-10">
            <h2 className="flex items-center gap-3 text-emerald-500 font-black tracking-widest text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Constructor Inteligente
            </h2>
            
            {/* SWITCH DE MODOS ACTUALIZADO */}
            <div className="flex flex-wrap bg-black/50 border border-zinc-800 rounded-xl p-1 gap-1">
               <button 
                 onClick={() => setBuildMode('ai')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${buildMode === 'ai' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-zinc-500 hover:text-white'}`}
               >
                 <span>🧠</span> IA Experta
               </button>
               <button 
                 onClick={() => setBuildMode('visual')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${buildMode === 'visual' ? 'bg-emerald-500 text-black shadow-md' : 'text-zinc-500 hover:text-white'}`}
               >
                 Avanzado (Visual)
               </button>
               <button 
                 onClick={() => setBuildMode('text')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${buildMode === 'text' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
               >
                 Texto Libre
               </button>
            </div>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div>
             <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 block ml-1">Título del Bloque / Día</label>
             <input 
               type="text" 
               placeholder="Ej: DÍA 1 - PIERNAS (FOCO SENTADILLA)"
               value={newTitle}
               onChange={(e) => setNewTitle(e.target.value)}
               className="w-full bg-black/50 border border-zinc-800 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-700"
             />
          </div>

          {/* 🤖 NUEVO: MODO IA GENERATIVA */}
          {buildMode === "ai" && (
             <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-3xl p-6 md:p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-start gap-4 mb-6">
                   <span className="text-4xl drop-shadow-lg">🧠</span>
                   <div>
                      <h3 className="text-indigo-400 font-black italic uppercase tracking-tighter text-xl">Generador Asistido por IA</h3>
                      <p className="text-xs text-indigo-200/70 font-medium mt-1">
                         Describe la rutina que necesitas. La IA aplicará metodologías avanzadas (DUP, BII, Cluster Sets) y armará la estructura perfecta. Luego podrás editarla.
                      </p>
                   </div>
                </div>
                
                <textarea 
                   className="w-full bg-black/60 border border-indigo-900/50 rounded-2xl p-6 text-sm text-zinc-300 outline-none focus:border-indigo-500 transition-all h-32 resize-none custom-scrollbar placeholder:text-zinc-700 mb-4"
                   placeholder="Ej: Armame un Día 1 de Fuerza Base enfocado en Pecho. Quiero que el primer ejercicio sea Press Banca usando un protocolo DUP, y luego 2 accesorios con técnica de Rest-Pause..."
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                />
                
                <button 
                   onClick={handleGenerateWithAI}
                   disabled={isGeneratingAi}
                   className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-8 py-5 rounded-2xl transition-all disabled:opacity-50 uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3"
                >
                   {isGeneratingAi ? 'Diseñando Estructura Fisiológica...' : 'Generar Plantilla Mágica ⚡'}
                </button>
             </div>
          )}

          {/* MODO TEXTO ANTIGUO */}
          {buildMode === "text" && (
             <div className="animate-in fade-in duration-300">
               <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 flex justify-between items-center ml-1">
                  <span>Contenido Libre</span>
                  <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Editor Activo</span>
               </label>
               <textarea 
                 placeholder="Escribí la estructura a mano o edita la que generó la IA..."
                 value={newContent}
                 onChange={(e) => setNewContent(e.target.value)}
                 className="w-full bg-black/50 border border-zinc-800 rounded-xl p-6 text-sm text-zinc-300 outline-none focus:border-emerald-500 transition-all h-64 font-mono leading-relaxed resize-y placeholder:text-zinc-700 custom-scrollbar"
               />
             </div>
          )}

          {/* MODO CONSTRUCTOR ÉLITE */}
          {buildMode === "visual" && (
             <div className="space-y-6 bg-black/20 p-6 rounded-3xl border border-zinc-800/50 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-800/50 pb-6">
                   <div>
                      <label className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Fase del Mesociclo</label>
                      <input type="text" value={metaPhase} onChange={e => setMetaPhase(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Metodología / Sistema</label>
                      <input type="text" value={metaMethodology} onChange={e => setMetaMethodology(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none" />
                   </div>
                </div>

                {/* Lista de Ejercicios */}
                <div className="space-y-4">
                   {exercises.map((ex, idx) => (
                      <div key={ex.id} className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-5 relative group hover:border-zinc-500 transition-colors">
                         <div className="absolute -left-3 -top-3 w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-emerald-500 font-black text-xs shadow-lg">{idx + 1}</div>
                         <button onClick={() => removeExercise(ex.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">✕ Eliminar</button>
                         
                         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                            <div className="md:col-span-12">
                               <input type="text" placeholder="Nombre del Ejercicio (Ej: Sentadilla Low Bar)" value={ex.name} onChange={e => updateExercise(ex.id, 'name', e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-emerald-500 outline-none placeholder:text-zinc-600" />
                            </div>
                            <div className="md:col-span-3">
                               <label className="text-[9px] text-zinc-500 uppercase font-black ml-1 mb-1 block">Series</label>
                               <input type="text" placeholder="Ej: 4" value={ex.sets} onChange={e => updateExercise(ex.id, 'sets', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none text-center" />
                            </div>
                            <div className="md:col-span-3">
                               <label className="text-[9px] text-zinc-500 uppercase font-black ml-1 mb-1 block">Reps</label>
                               <input type="text" placeholder="Ej: 5 o 8-10" value={ex.reps} onChange={e => updateExercise(ex.id, 'reps', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none text-center" />
                            </div>
                            <div className="md:col-span-3">
                               <label className="text-[9px] text-emerald-500 uppercase font-black ml-1 mb-1 block">RPE / RIR</label>
                               <input type="text" placeholder="Ej: RPE 8" value={ex.rpe} onChange={e => updateExercise(ex.id, 'rpe', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none text-center" />
                            </div>
                            <div className="md:col-span-3">
                               <label className="text-[9px] text-zinc-500 uppercase font-black ml-1 mb-1 block">Descanso</label>
                               <input type="text" placeholder="Ej: 3-5 min" value={ex.rest} onChange={e => updateExercise(ex.id, 'rest', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none text-center" />
                            </div>
                            <div className="md:col-span-4">
                               <label className="text-[9px] text-zinc-500 uppercase font-black ml-1 mb-1 block">Tempo (Opcional)</label>
                               <input type="text" placeholder="Ej: 3-1-X-1" value={ex.tempo} onChange={e => updateExercise(ex.id, 'tempo', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none text-center" />
                            </div>
                            <div className="md:col-span-8">
                               <label className="text-[9px] text-zinc-500 uppercase font-black ml-1 mb-1 block">Notas del Coach</label>
                               <input type="text" placeholder="Ej: Pausa de 1 seg en el hoyo." value={ex.notes} onChange={e => updateExercise(ex.id, 'notes', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <button 
                   onClick={addExercise}
                   className="w-full border-2 border-dashed border-zinc-700 hover:border-emerald-500 text-zinc-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-all"
                >
                   + Agregar Ejercicio
                </button>
             </div>
          )}

          {/* BOTÓN MAESTRO DE GUARDADO */}
          {buildMode !== "ai" && (
             <div className="flex justify-end pt-4 border-t border-white/5">
                <button 
                  onClick={saveTemplate}
                  className="w-full md:w-auto bg-emerald-500 text-black font-black text-xs px-10 py-5 rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 uppercase tracking-widest flex justify-center items-center gap-2"
                >
                  {buildMode === 'visual' ? 'Compilar y Guardar Plantilla ⚙️' : 'Guardar Plantilla en Bóveda 💾'}
                </button>
             </div>
          )}
        </div>
      </section>

      {/* LISTADO DE PLANTILLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {templates.map((t) => (
          <article key={t.id} className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 flex flex-col group hover:bg-zinc-900/60 hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
            
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
              <h3 className="text-xl font-black italic text-white tracking-tight leading-tight pr-4">{t.title}</h3>
              <button 
                onClick={() => deleteTemplate(t.id)}
                className="opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg transition-all border border-red-500/20 flex-shrink-0"
                title="Eliminar Plantilla"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            
            <div className="bg-black/60 border border-zinc-800/50 rounded-xl p-6 text-xs text-zinc-400 font-mono mb-6 flex-1 overflow-hidden relative custom-scrollbar overflow-y-auto max-h-[300px]">
              <div className="leading-relaxed whitespace-pre-wrap">{t.content}</div>
            </div>

            <button 
              onClick={() => copyToClipboard(t.content, t.id)}
              className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                copyStatus === t.id 
                ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                : "bg-zinc-800/50 text-white border-zinc-700 hover:bg-zinc-800 hover:border-emerald-500/50"
              }`}
            >
              {copyStatus === t.id ? (
                <>¡RUTINA COPIADA! <span className="text-lg leading-none">✅</span></>
              ) : (
                <>Copiar Bloque a Memoria <span className="text-lg leading-none">📋</span></>
              )}
            </button>
          </article>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="py-24 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/10 mt-10">
          <span className="text-4xl mb-4 block">📭</span>
          <p className="text-zinc-500 font-black uppercase tracking-widest">Tu librería de plantillas está vacía</p>
          <p className="text-zinc-600 text-sm mt-2">Crea tu primer bloque maestro arriba.</p>
        </div>
      )}

      {/* ESTILOS DEL SCROLL Y TEXTO */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        textarea { overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
      `}} />
    </div>
  );
}