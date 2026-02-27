// app/admin/athletes/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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

const biomechanicalSnippets = {
    squat: [
        { label: "Butt Wink (Retroversión)", text: "Diagnóstico: Presencia de retroversión pélvica al final de la fase excéntrica (Butt Wink). Prescripción: Limitar la profundidad de la flexión de rodilla justo antes de perder la neutralidad lumbar. Trabajar en movilidad de tobillo (dorsiflexión) y fortalecer el core en isometría." },
        { label: "Colapso Valgo (Rodillas)", text: "Diagnóstico: Colapso en valgo de las rodillas durante la fase concéntrica. Prescripción: Aplicar rotación externa activa desde la cadera (intentar 'separar' el suelo con los pies). Reforzar glúteo medio y abductores." },
        { label: "Shift Anterior (Peso a puntas)", text: "Diagnóstico: Desplazamiento del centro de masa hacia la zona metatarsal. Prescripción: Mantener el trípode del pie anclado. Iniciar el movimiento con una ligera bisagra de cadera antes de la flexión de rodilla." }
    ],
    bench: [
        { label: "Pérdida de Leg Drive", text: "Diagnóstico: Inestabilidad y falta de transferencia de fuerza desde el tren inferior (Leg Drive). Prescripción: Anclar activamente los pies al suelo y generar tensión isométrica de empuje hacia atrás durante toda la fase concéntrica." },
        { label: "Retracción Escapular Débil", text: "Diagnóstico: Desacoplamiento de las escápulas en la fase profunda, exponiendo la cápsula articular del hombro. Prescripción: Mantener depresión y retracción escapular estricta. El pecho debe ser el punto más alto." },
        { label: "Trayectoria de Barra Lineal", text: "Diagnóstico: Empuje estrictamente vertical (90 grados). Prescripción: Aplicar la curva en 'J'. La barra debe descender hacia el esternón inferior/apófisis xifoides y empujar ligeramente hacia el rostro." }
    ],
    deadlift: [
        { label: "Cadera Prematura (Stripper Pull)", text: "Diagnóstico: Elevación prematura de la cadera antes que los hombros. Prescripción: Cuadrar la cadera y generar tensión en los isquiosurales antes del despegue (Pull the slack out of the bar). Empujar el suelo con las piernas, no tirar con la espalda baja." },
        { label: "Pérdida de Dorsal (Barra alejada)", text: "Diagnóstico: La barra se separa del centro de masa (tibias). Prescripción: Activación estricta del dorsal ancho (Lat engagement). Imaginar 'romper' la barra o exprimir esponjas en las axilas." },
        { label: "Hiperextensión Lumbar en Bloqueo", text: "Diagnóstico: Hiperextensión de la columna lumbar en el bloqueo final (Lockout). Prescripción: Finalizar el movimiento contrayendo los glúteos de forma isométrica (Soft Lockout), manteniendo la pelvis neutra y las costillas abajo." }
    ],
    dips: [
        { label: "Falta de Inclinación Torácica", text: "Diagnóstico: Ejecución excesivamente vertical, derivando la tensión a la articulación glenohumeral y tríceps. Prescripción: Para focalizar la porción inferior del pectoral, mantener una inclinación torácica anterior de aproximadamente 30-45 grados y flexionar ligeramente las caderas." },
        { label: "Desplome en Fase Excéntrica", text: "Diagnóstico: Pérdida de control excéntrico y 'rebote' en la fase de máxima elongación. Prescripción: Control estricto de 3 segundos en la fase excéntrica. Detener el descenso cuando el deltoides anterior esté alineado o ligeramente por debajo del codo, evitando estrés innecesario en la cápsula articular." }
    ],
    military: [
        { label: "Arco Lumbar Excesivo", text: "Diagnóstico: Compensación del empuje vertical mediante la hiperextensión lumbar. Prescripción: Contracción isométrica de glúteos y abdomen (Bracing estricto). Si el arco persiste, sugiere fatiga o carga excesiva; considerar ajuste de intensidad." },
        { label: "Trayectoria de Barra Alejada", text: "Diagnóstico: La barra se aleja del plano frontal durante el empuje. Prescripción: Empujar la cabeza 'a través de la ventana' creada por los brazos una vez que la barra supera la línea de la frente. La barra debe terminar exactamente sobre la línea media del cuerpo." }
    ]
};

export default function TrainerDashboard() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'rutina' | 'videos' | 'datos'>('rutina');
  const [routineView, setRoutineView] = useState<'macro' | 'micro'>('micro');
  const [activeDay, setActiveDay] = useState('d1');

  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [activeMacroDay, setActiveMacroDay] = useState('d1'); 
  
  const [currentDesignWeek, setCurrentDesignWeek] = useState<number>(1);

  const [routine, setRoutine] = useState<any>({});
  const [logs, setLogs] = useState<any>({});
  
  const [feedback, setFeedback] = useState<any>({});
  const [rms, setRms] = useState<any>({ squat: "", bench: "", deadlift: "", dips: "", military: "" });
  
  // ✅ MACROS ACTUALIZADOS CON CARBOS Y GRASAS
  const [macros, setMacros] = useState({ calories: "", protein: "", carbs: "", fats: "", water: "" });
  
  const [cycles, setCycles] = useState({ macro: "", meso: "", micro: "" });

  const [subStatus, setSubStatus] = useState("active");
  const [expiresAt, setExpiresAt] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [annualPlan, setAnnualPlan] = useState<Record<number, any>>({});
  const [templates, setTemplates] = useState<any[]>([]);

  const [daysLeftCalculated, setDaysLeftCalculated] = useState<number | null>(null);

  const [aiNotes, setAiNotes] = useState({ squat: "", bench: "", deadlift: "", dips: "", military: "", extra1: "", extra2: "" });
  const [aiInsights, setAiInsights] = useState({ squat: "", bench: "", deadlift: "", dips: "", military: "", extra1: "", extra2: "" }); 
  const [generatingAi, setGeneratingAi] = useState({ squat: false, bench: false, deadlift: false, dips: false, military: false, extra1: false, extra2: false });
  
  const [generatingCopilot, setGeneratingCopilot] = useState(false);
  const [generatingWeek, setGeneratingWeek] = useState(false);
  const [aiMode, setAiMode] = useState<'auto' | 'manual'>('manual');
  const [aiParams, setAiParams] = useState({
      methodology: "Top Set + Backoffs",
      focus: "Tensión Mecánica (Hipertrofia)",
      intensity: "Ninguna (Fuerza clásica)",
      tempo: "Excéntrica Controlada (3-1-X-1)",
      rpe: "RPE 8-9 (Cerca del fallo)"
  });

  const [loadingLupa, setLoadingLupa] = useState(false);
  const [lupaReport, setLupaReport] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
    fetchTemplates();
    
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'es-AR';
      }
    }
  }, []);

  useEffect(() => {
      if (expiresAt) {
         const expDate = new Date(expiresAt);
         const today = new Date();
         const diffTime = expDate.getTime() - today.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         setDaysLeftCalculated(diffDays);
      } else {
         setDaysLeftCalculated(null);
      }
  }, [expiresAt]);

  const toggleRecording = (liftId: string) => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta la función de dictado por voz. Te recomiendo usar Google Chrome o Microsoft Edge.");
      return;
    }

    if (isRecording === liftId) {
      recognitionRef.current.stop();
      setIsRecording(null);
    } else {
      if (isRecording) recognitionRef.current.stop(); 
      
      let finalTranscript = aiNotes[liftId as keyof typeof aiNotes] ? aiNotes[liftId as keyof typeof aiNotes] + " " : "";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setAiNotes(prev => ({ ...prev, [liftId]: finalTranscript + interimTranscript }));
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Error en reconocimiento de voz:", event.error);
        setIsRecording(null);
      };

      recognitionRef.current.onend = () => {
         setIsRecording(null);
      };

      recognitionRef.current.start();
      setIsRecording(liftId);
    }
  };

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
      
      setLogs({
        d1: data.log_d1 || "", d2: data.log_d2 || "", d3: data.log_d3 || "",
        d4: data.log_d4 || "", d5: data.log_d5 || "", d6: data.log_d6 || "",
        d7: data.log_d7 || ""
      });
      
      setFeedback({
        squat: data.feedback_squat || "", bench: data.feedback_bench || "", 
        deadlift: data.feedback_deadlift || "", dips: data.feedback_dips || "",
        military: data.feedback_military || "", extra1: data.feedback_extra1 || "", extra2: data.feedback_extra2 || ""
      });
      setRms({
        squat: data.rm_squat || "", bench: data.rm_bench || "", 
        deadlift: data.rm_deadlift || "", dips: data.rm_dips || "", military: data.rm_military || ""
      });
      
      // ✅ ACTUALIZAMOS CON TODOS LOS MACROS
      setMacros({
        calories: data.macro_calories || "", 
        protein: data.macro_protein || "", 
        carbs: data.macro_carbs || "", 
        fats: data.macro_fats || "", 
        water: data.macro_water || ""
      });
      
      setCycles({
        macro: data.macrocycle || "", meso: data.mesocycle || "", micro: data.microcycle || ""
      });
      setAnnualPlan(data.annual_plan || {});
      
      setSubStatus(data.sub_status || "active");
      setExpiresAt(data.expires_at ? new Date(data.expires_at).toISOString().split('T')[0] : "");
      setCustomerPhone(data.customer_phone || "");

      const weekMatch = data.microcycle?.match(/\d+/);
      if (weekMatch) {
          setCurrentDesignWeek(parseInt(weekMatch[0]));
      }
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

  const pushToMicrocycle = async (weekNum: number) => {
      const weekData = annualPlan[weekNum] || {};
      if(!confirm(`¿Seguro que quieres publicar la Semana ${weekNum} como el entrenamiento actual del atleta? Esto se guardará en vivo.`)) return;

      const newRoutine = {
          d1: weekData.d1 || "", d2: weekData.d2 || "", d3: weekData.d3 || "",
          d4: weekData.d4 || "", d5: weekData.d5 || "", d6: weekData.d6 || "", d7: weekData.d7 || ""
      };
      const newMicro = `Semana ${weekNum}${weekData.focus ? ` - ${weekData.focus}` : ''}`;
      const newMeso = weekData.phase || cycles.meso;

      setRoutine(newRoutine);
      setCycles(prev => ({ ...prev, meso: newMeso, micro: newMicro }));
      setCurrentDesignWeek(weekNum);
      setRoutineView('micro');
      setSaving(true);

      try {
          const { error } = await supabase
              .from('orders')
              .update({
                  routine_d1: newRoutine.d1, routine_d2: newRoutine.d2, routine_d3: newRoutine.d3,
                  routine_d4: newRoutine.d4, routine_d5: newRoutine.d5, routine_d6: newRoutine.d6, routine_d7: newRoutine.d7,
                  mesocycle: newMeso, microcycle: newMicro, annual_plan: annualPlan
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

  const adjustDaysToExpire = async (days: number) => {
      const date = expiresAt ? new Date(expiresAt) : new Date();
      date.setDate(date.getDate() + days);
      const newDateStr = date.toISOString().split('T')[0];
      const newStatus = "active";
      
      setExpiresAt(newDateStr);
      setSubStatus(newStatus);
      
      try {
         await supabase
            .from('orders')
            .update({ 
               expires_at: date.toISOString(),
               sub_status: newStatus 
            })
            .eq('order_id', orderId);
      } catch (error) {
         console.error(error);
      }
  };

  const handleManualDateChange = async (newDateStr: string) => {
      setExpiresAt(newDateStr);
      const newStatus = "active"; 
      setSubStatus(newStatus);
      
      try {
          await supabase
              .from('orders')
              .update({ 
                  expires_at: new Date(newDateStr).toISOString(),
                  sub_status: newStatus 
              })
              .eq('order_id', orderId);
      } catch (error) {
          console.error("Error guardando fecha manual:", error);
      }
  };

  const handleCopilot = async () => {
    setGeneratingCopilot(true);
    try {
      const res = await fetch('/api/admin/generate-routine', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           athleteData: {
              rm_squat: rms.squat, rm_bench: rms.bench, rm_deadlift: rms.deadlift, rm_dips: rms.dips, rm_military: rms.military,
              medical_history: order?.medical_history || "Ninguna",
              training_days: "1 día",
              recent_fatigue: "Sin datos"
           },
           context: {
              phase: aiParams.methodology,
              focus: aiParams.focus,
              daysCount: 1
           }
        })
      });
      const data = await res.json();
      
      if (data.routine) {
        if (routine[activeDay] && !confirm(`¿Reemplazar la rutina del ${activeDay} con el diseño de la IA?`)) return;
        setRoutine({ ...routine, [activeDay]: data.routine });
        updateAnnualWeek(currentDesignWeek, activeDay, data.routine);
      } else {
        alert("Error de respuesta del Motor IA: " + (data.error || "Formato incorrecto."));
      }
    } catch (error) {
      alert("Error de conexión con el Servidor IA.");
    } finally {
      setGeneratingCopilot(false);
    }
  };

  const handleGenerateFullWeek = async () => {
      const weekTarget = prompt("¿Para qué número de semana deseas generar este microciclo? (Ej: 1, 5, 12)", currentDesignWeek.toString());
      if (!weekTarget) return;
      const weekNum = parseInt(weekTarget);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) return alert("Número de semana inválido.");

      setGeneratingWeek(true);
      try {
          const res = await fetch('/api/admin/generate-routine', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  athleteData: {
                      rm_squat: rms.squat, rm_bench: rms.bench, rm_deadlift: rms.deadlift, rm_dips: rms.dips, rm_military: rms.military,
                      medical_history: order?.medical_history || "Ninguna", 
                      training_days: order?.training_days || "3-4 días por semana",
                      recent_fatigue: "Sin datos"
                  },
                  context: {
                     phase: aiParams.methodology,
                     focus: aiParams.focus,
                     daysCount: 7 
                  }
              })
          });
          const data = await res.json();

          if (data.isWeek && data.routine) {
              const hasContent = Object.values(routine).some(v => typeof v === 'string' && v.trim() !== "");
              if (hasContent && !confirm(`⚠️ ¿Deseas SOBRESCRIBIR absolutamente toda la semana actual con el diseño de la Semana ${weekNum}?`)) {
                  setGeneratingWeek(false);
                  return;
              }
              
              setRoutine({
                  d1: data.routine.d1 || "", d2: data.routine.d2 || "", d3: data.routine.d3 || "",
                  d4: data.routine.d4 || "", d5: data.routine.d5 || "", d6: data.routine.d6 || "", d7: data.routine.d7 || ""
              });

              setAnnualPlan(prev => ({
                ...prev,
                [weekNum]: {
                    ...(prev[weekNum] || {}),
                    phase: aiParams.methodology,
                    focus: aiParams.focus,
                    d1: data.routine.d1 || "", d2: data.routine.d2 || "", d3: data.routine.d3 || "",
                    d4: data.routine.d4 || "", d5: data.routine.d5 || "", d6: data.routine.d6 || "", d7: data.routine.d7 || ""
                }
              }));

              setCurrentDesignWeek(weekNum);
              setCycles(prev => ({ ...prev, micro: `Semana ${weekNum}` }));
              alert(`📅 ¡Microciclo de Semana ${weekNum} generado con éxito y distribuido en las pestañas!`);
          } else {
              alert("Error de respuesta del Motor IA: No se devolvió el formato esperado.");
          }
      } catch (e) {
          alert("Fallo al contactar el servidor de programación semanal.");
      } finally {
          setGeneratingWeek(false);
      }
  };

  const handleGenerateFeedback = async (lift: string) => {
    const notes = aiNotes[lift as keyof typeof aiNotes];
    if (!notes.trim()) return alert("Head Coach, requiero indicaciones clínicas previas para estructurar el dictamen técnico.");

    setGeneratingAi({ ...generatingAi, [lift]: true });
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           action: 'expand_feedback', 
           data: { 
              notes, 
              currentFeedback: feedback[lift as keyof typeof feedback] 
           } 
        })
      });
      const data = await res.json();
      
      if (data.result && data.result.client_feedback) {
        setFeedback({ ...feedback, [lift]: data.result.client_feedback });
        setAiInsights({ ...aiInsights, [lift]: data.result.coach_insights });
        setAiNotes({ ...aiNotes, [lift]: "" }); 
      } else {
        alert("La IA encontró un problema procesando tu indicación. Por favor, reintenta.");
      }
    } catch (error) {
      alert("Error de conexión. Revisa tu internet.");
    } finally {
      setGeneratingAi({ ...generatingAi, [lift]: false });
    }
  };

  const insertSnippet = (liftId: string, text: string) => {
      setFeedback((prev: any) => {
          const currentText = prev[liftId] || "";
          const separator = currentText ? "\n\n" : "";
          return { ...prev, [liftId]: currentText + separator + text };
      });
  };

  // ✅ REPARADO: BOTÓN DE LUPA CONECTADO AL COPILOT CORRECTAMENTE
  const handleLupaAnalysis = async () => {
      setLoadingLupa(true);
      setLupaReport(null);

      const hasLogs = Object.values(logs).some(v => typeof v === 'string' && v.trim().length > 5);
      const hasCheckins = order?.checkin_history?.length > 0;

      if (!hasLogs && !hasCheckins) {
          setLoadingLupa(false);
          alert("El atleta no ha registrado entrenamientos ni parámetros de sueño/estrés en esta semana. La IA no tiene datos para auditar.");
          return;
      }

      try {
          const recentCheckins = order?.checkin_history?.slice(-7) || [];
          const checkinText = recentCheckins.length > 0 
              ? recentCheckins.map((c: any) => `Fecha: ${c.date} | Peso: ${c.weight}kg | Sueño: ${c.sleep}h | Estrés: ${c.stress}/10`).join('\n')
              : "Sin reportes de SNC esta semana.";

          const res = await fetch('/api/assistant/insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: 'coach_copilot',
                  data: { 
                      log: `
                      [ESTADO DEL SNC ESTA SEMANA]
                      ${checkinText}
                      
                      [BITÁCORA TÉCNICA DE LOS 7 DÍAS]
                      Día 1: ${logs.d1 || 'Sin registro'}
                      Día 2: ${logs.d2 || 'Sin registro'}
                      Día 3: ${logs.d3 || 'Sin registro'}
                      Día 4: ${logs.d4 || 'Sin registro'}
                      Día 5: ${logs.d5 || 'Sin registro'}
                      Día 6: ${logs.d6 || 'Sin registro'}
                      Día 7: ${logs.d7 || 'Sin registro'}
                      
                      [PERFIL CLÍNICO DEL ATLETA]
                      Marcas: Sentadilla ${rms.squat}kg, Banca ${rms.bench}kg, P.Muerto ${rms.deadlift}kg, Militar ${rms.military}kg, Fondos ${rms.dips}kg.
                      Lesiones declaradas: ${order.medical_history || 'Ninguna'}
                      ` 
                  }
              })
          });
          const data = await res.json();
          if (data.result) {
              setLupaReport(data.result);
          } else {
              alert("Error procesando el análisis clínico.");
          }
      } catch (error) {
          alert("Fallo de conexión con el servidor IA.");
      } finally {
          setLoadingLupa(false);
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
                feedback_military: feedback.military, feedback_extra1: feedback.extra1, feedback_extra2: feedback.extra2, 
                rm_squat: rms.squat, rm_bench: rms.bench, rm_deadlift: rms.deadlift, rm_dips: rms.dips, rm_military: rms.military,
                macro_calories: macros.calories, macro_protein: macros.protein, macro_carbs: macros.carbs, macro_fats: macros.fats, macro_water: macros.water,
                macrocycle: cycles.macro, mesocycle: cycles.meso, microcycle: cycles.micro,
                annual_plan: annualPlan,
                sub_status: subStatus,
                expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
                customer_phone: customerPhone
            })
            .eq('order_id', orderId);

        if (error) throw error;
        alert("💾 Historia Clínica Actualizada Correctamente.");
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
        <Link href="/admin/orders" className="text-emerald-500 underline">Volver a la lista</Link>
    </div>
  );

  const videoLifts = [
    { id: 'squat', name: 'Sentadilla' },
    { id: 'bench', name: 'Press Banca' },
    { id: 'deadlift', name: 'Peso Muerto' },
    { id: 'military', name: 'Press Militar' },
    { id: 'dips', name: 'Fondos en Paralela' },
    { id: 'extra1', name: order.name_extra1 || 'Registro Libre 1' },
    { id: 'extra2', name: order.name_extra2 || 'Registro Libre 2' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500 selection:text-black">
      
      {/* BARRA SUPERIOR */}
      <div className="w-full bg-[#050505] border-b border-white/10 mb-8 pb-4">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 p-5 md:px-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <Link href="/admin/athletes" className="bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:text-black w-10 h-10 flex items-center justify-center rounded-xl transition-all font-black text-lg">←</Link>
                <div>
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">{order.customer_name}</h1>
                       {subStatus === 'active' ? (
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/50">Activo</span>
                       ) : (
                          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-500/50">Vencido</span>
                       )}
                    </div>
                    <Link href="/">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer">
                          TUJAGUE STRENGTH
                      </p>
                    </Link>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2"
            >
                {saving ? "Registrando Datos..." : "💾 Confirmar Modificaciones"}
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* BOTONERA DE PESTAÑAS */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-2xl w-fit border border-zinc-800">
            <button onClick={() => setActiveTab('rutina')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'rutina' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Arquitectura de Entrenamiento</button>
            <button onClick={() => setActiveTab('videos')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'videos' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Auditoría Biomecánica 🤖</button>
            <button onClick={() => setActiveTab('datos')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'datos' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Administración Financiera</button>
        </div>

        {/* ─── PESTAÑA RUTINA Y LABORATORIO IA ─── */}
        {activeTab === 'rutina' && (
            <div className="animate-in fade-in duration-500">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-4">
                    <div className="flex gap-4">
                        <button 
                           onClick={() => setRoutineView('macro')}
                           className={`flex items-center gap-2 pb-2 text-sm font-black uppercase tracking-widest transition-all ${routineView === 'macro' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                        >
                            🗓️ Macro-Planificador
                        </button>
                        <button 
                           onClick={() => setRoutineView('micro')}
                           className={`flex items-center gap-2 pb-2 text-sm font-black uppercase tracking-widest transition-all ${routineView === 'micro' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                        >
                            ⚡ Consola Microciclo
                        </button>
                    </div>

                    {/* 🔍 BOTÓN DE LA LUPA DEL HEAD COACH */}
                    <button 
                        onClick={handleLupaAnalysis}
                        disabled={loadingLupa}
                        className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        {loadingLupa ? "Procesando Perfil..." : "🔍 Auditar Bitácora Atleta"}
                    </button>
                </div>

                {/* 🔍 REPORTE DE LA LUPA */}
                {lupaReport && (
                    <div className="mb-8 bg-amber-950/30 border border-amber-500/50 p-6 rounded-2xl relative animate-in slide-in-from-top-4">
                        <button onClick={() => setLupaReport(null)} className="absolute top-4 right-4 text-amber-500 hover:text-white font-bold">✕</button>
                        <h4 className="text-amber-400 font-black italic uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                           <span className="text-xl">🔍</span> Reporte Clínico Automatizado
                        </h4>
                        <p className="text-sm text-amber-50 font-medium leading-relaxed whitespace-pre-wrap">{lupaReport}</p>
                    </div>
                )}

                {routineView === 'macro' && (
                   <div className="bg-[#09090b] border border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                       <div className="mb-8 relative z-10 flex justify-between items-center">
                           <div>
                               <h2 className="text-2xl font-black italic text-white mb-2 uppercase">Planificador Anual BII</h2>
                               <p className="text-zinc-400 text-xs font-medium">Arquitectura estructural de largo plazo. Expanda el bloque semanal para editar la dosificación.</p>
                           </div>
                           <div className="bg-emerald-950/50 border border-emerald-500/30 px-4 py-2 rounded-xl text-center">
                               <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Diseño Actual</p>
                               <p className="font-mono font-bold text-white">Semana {currentDesignWeek}</p>
                           </div>
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
                                                    setActiveMacroDay('d1'); 
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

                                               {expandedWeek === weekNum && (
                                                   <div className="p-5 border-t border-zinc-800 bg-[#09090b] space-y-5 animate-in slide-in-from-top-2 duration-200">
                                                       <div className="flex flex-col sm:flex-row gap-3">
                                                           <select 
                                                               value={annualPlan[weekNum]?.phase || ""}
                                                               onChange={(e) => updateAnnualWeek(weekNum, 'phase', e.target.value)}
                                                               className="flex-1 bg-black border border-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                                                           >
                                                               <option value="">-- Fase Fisiológica --</option>
                                                               <option value="Adaptacion">Adaptación Anatómica</option>
                                                               <option value="Hipertrofia">Hipertrofia (Acumulación)</option>
                                                               <option value="Fuerza Base">Fuerza Base</option>
                                                               <option value="Intensificacion">Fuerza Máxima (Intensificación)</option>
                                                               <option value="Peaking">Pico de Rendimiento (Peaking)</option>
                                                               <option value="Descarga">Descarga del SNC (Deload)</option>
                                                           </select>
                                                           <input 
                                                              type="text"
                                                              placeholder="Énfasis Biomecánico"
                                                              value={annualPlan[weekNum]?.focus || ""}
                                                              onChange={(e) => updateAnnualWeek(weekNum, 'focus', e.target.value)}
                                                              className="flex-1 bg-black border border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 placeholder:text-zinc-700"
                                                           />
                                                       </div>

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

                                                       <div className="bg-black border border-zinc-800 rounded-2xl p-4 relative">
                                                          <div className="flex justify-between items-center mb-3">
                                                              <span className="text-xs font-black text-white uppercase tracking-widest">{activeMacroDay.replace('d', 'Día ')}</span>
                                                              <select 
                                                                 onChange={(e) => handleApplyTemplateToMacro(e, weekNum, activeMacroDay)}
                                                                 className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-400 text-[9px] font-bold uppercase rounded-lg px-2 py-1 outline-none transition-colors w-32"
                                                                 defaultValue=""
                                                              >
                                                                 <option value="" disabled>Seleccionar Template</option>
                                                                 {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                                              </select>
                                                          </div>
                                                          <textarea 
                                                             className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 font-mono text-xs leading-relaxed resize-none outline-none focus:border-emerald-500/50 custom-scrollbar placeholder:text-zinc-700"
                                                             placeholder={`Desarrollo de parámetros de carga para el ${activeMacroDay.replace('d', 'Día ')}...`}
                                                             value={annualPlan[weekNum]?.[activeMacroDay] || ""}
                                                             onChange={(e) => updateAnnualWeek(weekNum, activeMacroDay, e.target.value)}
                                                             spellCheck={false}
                                                          />
                                                       </div>

                                                       <button 
                                                          onClick={() => pushToMicrocycle(weekNum)}
                                                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex justify-center items-center gap-2"
                                                       >
                                                          ⚡ Transferir al Dashboard del Atleta
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

                {routineView === 'micro' && (
                  <>
                    <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6">
                       <h3 className="text-xs font-black italic text-emerald-500 uppercase tracking-widest mb-4">Etiquetado Estructural (Vista del Atleta)</h3>
                       <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Macrociclo</p>
                             <input type="text" className="bg-transparent text-sm font-bold text-white w-full outline-none placeholder:text-zinc-700" value={cycles.macro} placeholder="Ej: Temporada Pre-Competitiva" onChange={(e) => setCycles({...cycles, macro: e.target.value})} />
                          </div>
                          <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Mesociclo</p>
                             <input type="text" className="bg-transparent text-sm font-bold text-white w-full outline-none placeholder:text-zinc-700" value={cycles.meso} placeholder="Ej: Bloque 1 - Fuerza Base" onChange={(e) => setCycles({...cycles, meso: e.target.value})} />
                          </div>
                          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 focus-within:border-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                             <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Microciclo</p>
                             <input type="text" className="bg-transparent text-sm font-black text-emerald-400 w-full outline-none placeholder:text-emerald-900" value={cycles.micro} placeholder="Ej: Semana 3 - Descarga" onChange={(e) => setCycles({...cycles, micro: e.target.value})} />
                          </div>
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-350px)] min-h-[700px]">
                        <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {['d1','d2','d3','d4','d5','d6','d7'].map(day => (
                                <button key={day} onClick={() => setActiveDay(day)} className={`w-full text-left px-5 py-4 rounded-xl border font-black uppercase text-xs tracking-widest transition-all flex justify-between items-center ${activeDay === day ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}>
                                    {day.replace('d', 'Día ')}
                                    <div className="flex items-center gap-2">
                                       {logs[day] && <span title="Bitácora registrada" className="text-sm">📓</span>}
                                       {routine[day] && <span className={`text-[8px] px-2 py-0.5 rounded-full ${activeDay === day ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-500'}`}>OK</span>}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="lg:col-span-3 h-full flex flex-col gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex-1 flex flex-col shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none"></div>
                                
                                {/* ✅ CONSOLA DE DISEÑO CLÍNICA (IA MASTER) */}
                                <div className="bg-zinc-950 border border-indigo-500/40 rounded-2xl p-5 mb-6 relative z-10 shadow-lg">
                                   <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
                                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                         <span className="text-xl">🧬</span> Consola de Prescripción BII-Vintage
                                      </span>
                                   </div>
                                   
                                   <div className="grid md:grid-cols-3 gap-4 mb-5">
                                      <div>
                                         <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Metodología Principal</label>
                                         <select value={aiParams.methodology} onChange={(e) => setAiParams({...aiParams, methodology: e.target.value})} className="w-full bg-black border border-zinc-800 text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500">
                                            <option>Top Set + Backoffs</option>
                                            <option>Progresión Lineal Clásica</option>
                                            <option>Heavy Duty (1 Serie Efectiva)</option>
                                            <option>DUP (Ondulante Diaria)</option>
                                         </select>
                                      </div>
                                      <div>
                                         <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Vía Energética / Foco</label>
                                         <select value={aiParams.focus} onChange={(e) => setAiParams({...aiParams, focus: e.target.value})} className="w-full bg-black border border-zinc-800 text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500">
                                            <option>Tensión Mecánica (Hipertrofia)</option>
                                            <option>Reclutamiento Neural (Fuerza Max)</option>
                                            <option>Estrés Metabólico / Bombeo</option>
                                         </select>
                                      </div>
                                      <div>
                                         <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Exigencia (RIR / RPE)</label>
                                         <select value={aiParams.rpe} onChange={(e) => setAiParams({...aiParams, rpe: e.target.value})} className="w-full bg-black border border-zinc-800 text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500">
                                            <option>RPE 8-9 (Cerca del fallo)</option>
                                            <option>RPE 10 (Fallo muscular absoluto)</option>
                                            <option>Descarga del SNC (RPE 6)</option>
                                         </select>
                                      </div>
                                   </div>
                                   
                                   <div className="flex flex-col md:flex-row gap-3">
                                      <button onClick={handleCopilot} disabled={generatingCopilot || generatingWeek} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg border ${generatingCopilot ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-zinc-950 border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/30'}`}>
                                         {generatingCopilot ? <span className="flex items-center gap-2">Procesando Patrones... <span className="animate-spin">🌀</span></span> : <span>⚡ Sintetizar Día Actual</span>}
                                      </button>
                                      
                                      <button onClick={handleGenerateFullWeek} disabled={generatingCopilot || generatingWeek} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 ${generatingWeek ? 'bg-zinc-900 text-zinc-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                                         {generatingWeek ? <span className="flex items-center gap-2">Construyendo Mesociclo... <span className="animate-spin">🌀</span></span> : <span>📅 Diseñar Estructura Semanal</span>}
                                      </button>
                                   </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center gap-4 relative z-10 border-b border-zinc-800/50 pb-4">
                                     <div><h3 className="text-lg font-black italic uppercase text-white">Bloque Operativo: {activeDay.replace('d', 'Día ')}</h3></div>
                                     <div className="flex items-center gap-3 w-full md:w-auto">
                                        <select onChange={handleApplyTemplate} className="bg-black border border-zinc-700 hover:border-emerald-500 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none transition-all cursor-pointer shadow-lg w-full md:w-48 appearance-none" defaultValue="">
                                           <option value="" disabled>Inyectar Plantilla Base...</option>
                                           {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                        </select>
                                     </div>
                                </div>

                                <textarea className="w-full flex-1 bg-black border border-zinc-800 rounded-xl p-6 text-zinc-300 font-mono text-sm leading-relaxed focus:border-emerald-500 outline-none resize-none transition-all placeholder:text-zinc-800 relative z-10 custom-scrollbar" placeholder={`Espacio de diseño estructural...`} value={routine[activeDay]} onChange={(e) => setRoutine({...routine, [activeDay]: e.target.value})} spellCheck={false}></textarea>
                            </div>

                            <div className="bg-black/80 border border-emerald-900/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden shrink-0">
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-lg">📓</span> Bitácora Subjetiva del Atleta</p>
                                {logs[activeDay] ? <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl"><p className="text-zinc-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{logs[activeDay]}</p></div> : <p className="text-zinc-600 text-xs italic">A la espera de reporte de rendimiento post-sesión.</p>}
                            </div>
                        </div>
                    </div>
                  </>
                )}
            </div>
        )}

        {/* ─── PESTAÑA VIDEOS Y DIAGNÓSTICO CLÍNICO ─── */}
        {activeTab === 'videos' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-indigo-950/20 border border-indigo-500/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-indigo-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                         <span className="text-xl">🧠</span> Tujague AI: Biomecánica & Patologías de Movimiento
                      </h3>
                      <p className="text-zinc-400 text-[11px] mt-1 uppercase font-bold tracking-tight">Utilice la matriz de Snippets para diagnósticos rápidos o el micrófono para dictados complejos.</p>
                    </div>
                    {isRecording && (
                       <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span className="text-[9px] font-black uppercase tracking-widest">Micrófono Activo</span>
                       </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-10">
                {videoLifts.map(lift => (
                    <div key={lift.id} className={`bg-[#0a0a0a] border ${isRecording === lift.id ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-zinc-800'} rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col xl:flex-row min-h-[500px] transition-all`}>
                        <div className="w-full xl:w-[450px] bg-black flex flex-col p-6 border-b xl:border-b-0 xl:border-r border-zinc-800 relative shrink-0">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">{lift.name}</span>
                            <div className="flex-1 flex items-center justify-center bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden relative">
                                {order[`video_${lift.id}`] ? (
                                    <video src={order[`video_${lift.id}`]} controls className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-zinc-700 text-center uppercase font-black text-[10px]">Material Clínico Ausente</div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#0a0a0a] min-w-0">
                            <div className="grid lg:grid-cols-2 gap-8 h-full">
                                
                                {/* COLUMNA 1: APUNTES DEL COACH Y DIAGNÓSTICOS RÁPIDOS */}
                                <div className="flex flex-col min-w-0 h-full">
                                   <div className="flex justify-between items-center mb-3">
                                      <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">1. Dictamen Base</label>
                                      <button onClick={() => setAiNotes({...aiNotes, [lift.id]: ""})} className="text-[8px] text-zinc-600 hover:text-white uppercase font-bold transition-colors">Limpiar Base</button>
                                   </div>
                                   
                                   <div className="relative w-full h-32 group mb-3">
                                      <textarea 
                                         className={`w-full h-full bg-zinc-900/50 border ${isRecording === lift.id ? 'border-red-500/50 text-red-100' : 'border-zinc-800 text-zinc-300'} rounded-2xl p-4 text-xs outline-none focus:border-indigo-500 transition-all resize-none custom-scrollbar`}
                                         placeholder="Escriba o dicte el fallo biomecánico aquí..."
                                         value={aiNotes[lift.id as keyof typeof aiNotes]}
                                         onChange={e => setAiNotes({...aiNotes, [lift.id]: e.target.value})}
                                      />
                                      <button 
                                         onClick={() => toggleRecording(lift.id)}
                                         className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording === lift.id ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                         title="Dictar notas por voz"
                                      >
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                                      </button>
                                   </div>

                                   {/* ✅ EL SELECTOR DE DIAGNÓSTICOS RÁPIDOS (SNIPPETS) */}
                                   {(biomechanicalSnippets as any)[lift.id] && (
                                       <div className="mb-4 bg-black border border-zinc-800 p-3 rounded-xl flex flex-col gap-2">
                                           <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Matriz de Patologías (Auto-completar):</span>
                                           <select 
                                              className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 p-2 rounded-lg outline-none cursor-pointer"
                                              onChange={(e) => {
                                                  if(e.target.value) {
                                                      insertSnippet(lift.id, e.target.value);
                                                      e.target.value = ""; 
                                                  }
                                              }}
                                              defaultValue=""
                                           >
                                               <option value="" disabled>Seleccionar y pegar en Reporte Oficial...</option>
                                               {(biomechanicalSnippets as any)[lift.id].map((snip: any, idx: number) => (
                                                   <option key={idx} value={snip.text}>{snip.label}</option>
                                               ))}
                                           </select>
                                       </div>
                                   )}

                                   <button 
                                      onClick={() => handleGenerateFeedback(lift.id)}
                                      disabled={generatingAi[lift.id as keyof typeof generatingAi] || !aiNotes[lift.id as keyof typeof aiNotes].trim() || isRecording === lift.id}
                                      className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                   >
                                      {generatingAi[lift.id as keyof typeof generatingAi] ? 'Ampliando con Lenguaje Clínico...' : 'Refinar Texto con IA ⚡'}
                                   </button>
                                </div>

                                {/* COLUMNA 2: REPORTE OFICIAL AL ATLETA */}
                                <div className="flex flex-col min-w-0 h-full">
                                   <div className="flex justify-between items-center mb-3">
                                      <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">2. Reporte Clínico Oficial</label>
                                      <button onClick={() => setFeedback({...feedback, [lift.id]: ""})} className="text-[8px] text-red-500 hover:text-red-400 uppercase font-bold transition-colors">Limpiar Reporte</button>
                                   </div>
                                   <textarea 
                                      className="w-full flex-1 min-h-[200px] bg-black border border-emerald-900/30 rounded-2xl p-4 text-xs text-white outline-none focus:border-emerald-500 transition-all resize-none custom-scrollbar leading-relaxed"
                                      value={feedback[lift.id] || ""}
                                      onChange={(e) => setFeedback({...feedback, [lift.id]: e.target.value})}
                                      placeholder="El diagnóstico técnico final estructurado aparecerá aquí..."
                                   />
                                   <p className="text-[8px] text-zinc-600 text-right mt-2 font-bold uppercase tracking-widest">Visible en el Dashboard del Atleta</p>
                                </div>
                            </div>
                            
                            {aiInsights[lift.id as keyof typeof aiInsights] && (
                               <div className="coach-insight-anim bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 relative">
                                  <button onClick={() => setAiInsights({...aiInsights, [lift.id]: ""})} className="absolute top-4 right-4 text-indigo-500 hover:text-white font-bold">✕</button>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                                     <span>🛡️</span> Insight Privado para Head Coach
                                  </p>
                                  <p className="text-xs text-indigo-100/70 italic leading-relaxed">
                                     {aiInsights[lift.id as keyof typeof aiInsights]}
                                  </p>
                               </div>
                            )}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        )}

        {/* ─── PESTAÑA DATOS (ADMINISTRATIVA) ─── */}
        {activeTab === 'datos' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                 {/* ✅ SECCIÓN AGREGADA: DIRECTRICES DE RENDIMIENTO CON CARBOS Y GRASAS */}
                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xl font-black italic uppercase text-white">Directrices de <span className="text-emerald-500">Rendimiento</span></h3>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Nutrición & SNC</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
                        <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Calorías</p>
                            <input type="text" className="bg-transparent text-lg font-black text-white w-full outline-none placeholder:text-zinc-700" value={macros.calories} placeholder="Ej: 2800" onChange={(e) => setMacros({...macros, calories: e.target.value})} />
                        </div>
                        <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Proteínas</p>
                            <input type="text" className="bg-transparent text-lg font-black text-white w-full outline-none placeholder:text-zinc-700" value={macros.protein} placeholder="Ej: 160g" onChange={(e) => setMacros({...macros, protein: e.target.value})} />
                        </div>
                        <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Carbos</p>
                            <input type="text" className="bg-transparent text-lg font-black text-white w-full outline-none placeholder:text-zinc-700" value={macros.carbs} placeholder="Ej: 300g" onChange={(e) => setMacros({...macros, carbs: e.target.value})} />
                        </div>
                        <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Grasas</p>
                            <input type="text" className="bg-transparent text-lg font-black text-white w-full outline-none placeholder:text-zinc-700" value={macros.fats} placeholder="Ej: 70g" onChange={(e) => setMacros({...macros, fats: e.target.value})} />
                        </div>
                        <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800 focus-within:border-emerald-500/50 transition-colors col-span-2 md:col-span-1">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Hidratación</p>
                            <input type="text" className="bg-transparent text-lg font-black text-white w-full outline-none placeholder:text-zinc-700" value={macros.water} placeholder="Ej: 3.5L" onChange={(e) => setMacros({...macros, water: e.target.value})} />
                        </div>
                    </div>
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -ml-20 -mt-20"></div>
                    <h3 className="text-xl font-black italic uppercase text-white mb-6">Gestión de <span className="text-blue-500">Suscripción</span></h3>
                    {daysLeftCalculated !== null && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 font-bold text-sm tracking-widest uppercase ${daysLeftCalculated < 0 ? 'bg-red-500/10 border-red-500/50 text-red-500' : daysLeftCalculated <= 3 ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                           <span>⏱️</span> 
                           {daysLeftCalculated < 0 ? `¡VENCIDO HACE ${Math.abs(daysLeftCalculated)} DÍAS!` : `LE QUEDAN ${daysLeftCalculated} DÍAS DE ACCESO`}
                        </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6 relative z-10">
                        <div className="bg-black/50 p-5 rounded-2xl border border-zinc-800">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estado del Acceso</p>
                            <select value={subStatus} onChange={(e) => setSubStatus(e.target.value)} className={`w-full bg-transparent text-xl font-black outline-none transition-colors ${subStatus === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                <option value="active" className="text-black">ACTIVO (Permitir Ingreso)</option>
                                <option value="vencido" className="text-black">VENCIDO (Bloquear Panel)</option>
                            </select>
                        </div>
                        <div className="bg-black/50 p-5 rounded-2xl border border-zinc-800">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex justify-between"><span>Elegir Fecha Manual:</span></p>
                            <input type="date" className="bg-transparent text-xl font-black text-white w-full outline-none color-scheme-dark cursor-pointer hover:text-emerald-400 transition-colors" value={expiresAt} onChange={(e) => handleManualDateChange(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 relative z-10">
                        <button onClick={() => adjustDaysToExpire(30)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">+ Sumar 30 Días (Mes)</button>
                        <button onClick={() => adjustDaysToExpire(7)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">+ Sumar 7 Días (Semana)</button>
                        <button onClick={() => adjustDaysToExpire(-7)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ml-auto">- Restar 7 Días</button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800 relative z-10">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Protocolo de Retención Logística</p>
                        <div className="flex flex-col md:flex-row gap-4">
                           <input type="text" placeholder="Ej: 5491123021760 (Sin el +)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="flex-1 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50" />
                           <a href={customerPhone ? `https://wa.me/${customerPhone}?text=Hola%20bestia!%20Faltan%20pocos%20días%20para%20que%20termine%20tu%20ciclo.%20Venís%20rindiendo%20excelente.%20¿Te%20genero%20el%20link%20del%20próximo%20mes%20así%20no%20perdemos%20el%20ritmo?` : "#"} target={customerPhone ? "_blank" : "_self"} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${customerPhone ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>Enviar Aviso de Renovación 💬</a>
                        </div>
                    </div>
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xl font-black italic uppercase text-white">Último <span className="text-emerald-500">Check-In</span></h3>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Reporte de Fatiga</span>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-6 relative z-10">
                        <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Peso Corporal</p><p className="text-3xl font-black text-white">{order.checkin_weight || '--'} <span className="text-xs text-zinc-600 ml-1">KG</span></p></div>
                        <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Horas de Sueño</p><p className="text-3xl font-black text-white">{order.checkin_sleep || '--'} <span className="text-xs text-zinc-600 ml-1">HRS</span></p></div>
                        <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800"><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estrés General</p><p className="text-3xl font-black text-emerald-400">{order.checkin_stress || '--'} <span className="text-xs text-zinc-600 ml-1">/ 10</span></p></div>
                    </div>
                    <div className="bg-black/50 p-6 rounded-2xl border border-zinc-800 relative z-10">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Notas del Atleta</p>
                        <p className="text-sm text-zinc-300 italic font-medium">{order.checkin_notes || 'El atleta no dejó notas adicionales en su último reporte.'}</p>
                    </div>
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-black italic uppercase mb-8 text-center">Marcas Históricas (1RM)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                        {[ { id: 'squat', name: 'Sentadilla' }, { id: 'bench', name: 'Banca' }, { id: 'deadlift', name: 'P. Muerto' }, { id: 'military', name: 'Militar' }, { id: 'dips', name: 'Fondos' } ].map(lift => (
                            <div key={lift.id} className="bg-black p-4 md:p-6 rounded-3xl border border-zinc-800 text-center relative group">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">{lift.name}</p>
                                <div className="relative">
                                    <input type="text" className="bg-transparent text-center text-3xl md:text-4xl font-black text-white w-full outline-none z-10 relative" value={rms[lift.id as keyof typeof rms]} placeholder="0" onChange={(e) => setRms({...rms, [lift.id]: e.target.value})} />
                                    <span className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 text-zinc-700 text-[10px] md:text-xs font-black">KG</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 
                 <div className="bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-[2rem]">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Credenciales de Acceso</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black p-4 rounded-xl border border-zinc-800"><p className="text-[9px] text-zinc-500 uppercase mb-1">Usuario</p><p className="text-sm font-bold text-white break-all">{order.customer_email}</p></div>
                        <div className="bg-black p-4 rounded-xl border border-zinc-800"><p className="text-[9px] text-zinc-500 uppercase mb-1">Contraseña</p><p className="text-sm font-mono text-emerald-400">{order.password || '••••••'}</p></div>
                    </div>
                 </div>

            </div>
        )}
      </div>

      {/* ✅ SE AÑADIÓ whitespace: pre-wrap !important PARA RESPETAR SALTOS DE LÍNEA */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        
        textarea {
           white-space: pre-wrap !important; 
        }

        textarea, p, div {
           overflow-wrap: break-word;
           word-wrap: break-word;
           word-break: break-word;
        }

        .coach-insight-anim { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; opacity: 0.6; }
      `}} />
    </div>
  );
}