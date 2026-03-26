"use client";



import { useEffect, useState, useRef } from "react";

import { useParams, useRouter } from "next/navigation";

import { createClient } from "@supabase/supabase-js";

import Link from "next/link";

import RoutineBuilder from "../../../../components/admin/RoutineBuilder";



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

  

  // 🚀 MENÚ LATERAL: Agregamos megafono a tu lista de pestañas intacta

  const [activeTab, setActiveTab] = useState<'constructor' | 'datos' | 'videos' | 'megafono'>('constructor');

  

  const [routineView, setRoutineView] = useState<'macro' | 'micro'>('micro');

  const [activeDay, setActiveDay] = useState('d1');



  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const [activeMacroDay, setActiveMacroDay] = useState('d1'); 

  

  const [currentDesignWeek, setCurrentDesignWeek] = useState<number>(1);



  const [routine, setRoutine] = useState<any>({});

  const [logs, setLogs] = useState<any>({});

  

  const [feedback, setFeedback] = useState<any>({});

  const [rms, setRms] = useState<any>({ squat: "", bench: "", deadlift: "", dips: "", military: "" });

  

  const [macros, setMacros] = useState({ calories: "", protein: "", carbs: "", fats: "", water: "" });

  

  const [cycles, setCycles] = useState({ macro: "", meso: "", micro: "" });



  const [subStatus, setSubStatus] = useState("active");

  const [expiresAt, setExpiresAt] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");



  const [annualPlan, setAnnualPlan] = useState<Record<number, any>>({});

  const [templates, setTemplates] = useState<any[]>([]);



  const [aiDraftText, setAiDraftText] = useState("");



  const [daysLeftCalculated, setDaysLeftCalculated] = useState<number | null>(null);

  

  const [clientSessions, setClientSessions] = useState<any[]>([]);



  const [aiNotes, setAiNotes] = useState({ squat: "", bench: "", deadlift: "", dips: "", military: "", extra1: "", extra2: "" });

  const [aiInsights, setAiInsights] = useState({ squat: "", bench: "", deadlift: "", dips: "", military: "", extra1: "", extra2: "" }); 

  const [generatingAi, setGeneratingAi] = useState({ squat: false, bench: false, deadlift: false, dips: false, military: false, extra1: false, extra2: false });

  

  const [generatingCopilot, setGeneratingCopilot] = useState(false);

  const [generatingWeek, setGeneratingWeek] = useState(false);

  const [aiParams, setAiParams] = useState({

      methodology: "Top Set + Backoffs",

      focus: "Tensión Mecánica (Hipertrofia)",

      intensity: "Ninguna (Fuerza clásica)",

      tempo: "Excéntrica Controlada (3-1-X-1)",

      rpe: "RPE 8-9 (Cerca del fallo)"

  });



  const [coachDecision, setCoachDecision] = useState("mantener");



  const [loadingLupa, setLoadingLupa] = useState(false);

  const [lupaReport, setLupaReport] = useState<string | null>(null);



  const [isRecording, setIsRecording] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);



  // 🔥 ESTADOS PARA EL MEGÁFONO PRIVADO 🔥

  const [msgTitle, setMsgTitle] = useState("");

  const [msgBody, setMsgBody] = useState("");

  const [sendingMsg, setSendingMsg] = useState(false);

  const [msgHistory, setMsgHistory] = useState<any[]>([]);



  useEffect(() => {

    if (orderId) {

        fetchData();

        fetchTemplates();

    }

    

    if (typeof window !== "undefined") {

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {

        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.continuous = true;

        recognitionRef.current.interimResults = true;

        recognitionRef.current.lang = 'es-AR';

      }

    }

  }, [orderId]);



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

    try {

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

        

        let query = supabase.from("orders").select("*, plans(name)");



        if (isUUID) {

            query = query.or(`user_id.eq.${orderId},id.eq.${orderId}`);

        } else {

            query = query.eq("order_id", orderId);

        }



        const { data, error } = await query.limit(1).single();

        if (error) throw error;



        if (data.user_id) {

            const { data: sessions, error: sessionErr } = await supabase

                .from('workout_sessions')

                .select(`

                    id, completed_at, session_rpe, athlete_notes,

                    workouts ( name, week_number, day_number, routines (name) )

                `)

                .eq('user_id', data.user_id)

                .eq('status', 'completed')

                .order('completed_at', { ascending: false })

                .limit(50); 



            if (sessions && sessions.length > 0) {

                const sessionIds = sessions.map(s => s.id);

                const { data: logsData } = await supabase

                    .from('logged_sets')

                    .select(`

                        session_id, set_number, weight, reps, rir, rpe,

                        workout_exercises ( exercises (name) )

                    `)

                    .in('session_id', sessionIds)

                    .order('set_number', { ascending: true });



                const sessionsWithLogs = sessions.map(session => ({

                    ...session,

                    logs: logsData?.filter(log => log.session_id === session.id) || []

                }));



                setClientSessions(sessionsWithLogs);

            } else {

                setClientSessions([]);

            }



            // CARGAR MENSAJES PRIVADOS

            const { data: msgs } = await supabase.from('notifications').select('*').eq('user_id', data.user_id).eq('is_global', false).order('created_at', { ascending: false });

            if (msgs) setMsgHistory(msgs);

        }



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

          

          setAiDraftText(data.ai_draft_text || "");

          setCoachDecision(data.coach_decision || "mantener");

          

          setSubStatus(data.sub_status || "active");

          setExpiresAt(data.expires_at ? new Date(data.expires_at).toISOString().split('T')[0] : "");

          setCustomerPhone(data.customer_phone || "");



          const weekMatch = data.microcycle?.match(/\d+/);

          if (weekMatch) {

             setCurrentDesignWeek(parseInt(weekMatch[0]));

          }

        }

    } catch (err: any) {

        console.error("Error cargando datos:", err.message);

    } finally {

        setLoading(false); 

    }

  }



  async function fetchTemplates() {

    try {

        const { data, error } = await supabase

          .from("templates")

          .select("id, title, content")

          .order("created_at", { ascending: false });

        

        if (!error && data) {

          setTemplates(data);

        }

    } catch (e) {

        console.error(e);

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

      if(!confirm(`¿Seguro que quieres extraer la Semana ${weekNum} del Macro-Planificador y PUBLICARLA oficialmente en las cajas del Día 1 al 7 para el atleta?`)) return;



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

              .eq('id', order.id);



          if (error) throw error;

          alert(`✅ Semana ${weekNum} extraída y publicada oficialmente en el Dashboard del atleta.`);

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

            .eq('id', order.id); 

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

              .eq('id', order.id); 

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



  const handleLupaAnalysis = async () => {

      setLoadingLupa(true);

      setLupaReport(null);



      const hasCheckins = order?.checkin_history?.length > 0;

      const hasRealLogs = clientSessions && clientSessions.length > 0;



      if (!hasRealLogs && !hasCheckins) {

          setLoadingLupa(false);

          alert("El atleta no ha registrado entrenamientos en la App ni reportes de SNC esta semana. La IA no tiene datos para auditar.");

          return;

      }



      try {

          const recentCheckins = order?.checkin_history?.slice(-7) || [];

          const checkinText = recentCheckins.length > 0 

              ? recentCheckins.map((c: any) => `Fecha: ${c.date} | Peso: ${c.weight}kg | Sueño: ${c.sleep}h | Estrés: ${c.stress}/10 | Adherencia: ${c.adherence}% | Energía: ${c.energy} | Recuperación: ${c.recovery}`).join('\n')

              : "Sin reportes de SNC esta semana.";



          let realLogsText = "Sin registros de entrenamiento esta semana.";

          if (hasRealLogs) {

              realLogsText = clientSessions.map(session => {

                  const date = new Date(session.completed_at).toLocaleDateString('es-AR');

                  const logsArr = session.logs.map((log: any) => 

                      `- ${log.workout_exercises?.exercises?.name}: S${log.set_number} -> ${log.weight}kg x ${log.reps} reps (RPE: ${log.rpe || '-'} / RIR: ${log.rir || '-'})`

                  );

                  return `🗓️ FECHA: ${date} (sRPE del Atleta: ${session.session_rpe || '-'})\n${logsArr.join('\n')}`;

              }).join('\n\n');

          }



          const res = await fetch('/api/assistant/insights', {

              method: 'POST',

              headers: { 'Content-Type': 'application/json' },

              body: JSON.stringify({

                  action: 'coach_copilot',

                  data: { 

                      log: `

                      [ESTADO DEL SNC ESTA SEMANA]

                      ${checkinText}

                      

                      [BITÁCORA DE RENDIMIENTO REAL (CONSTRUCTOR BII)]

                      ${realLogsText}

                      

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

                ai_draft_text: aiDraftText, 

                coach_decision: coachDecision,

                sub_status: subStatus,

                expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,

                customer_phone: customerPhone

            })

            .eq('id', order.id);



        if (error) throw error;

        alert("💾 ¡Cambios Guardados y Publicados Oficialmente!");

    } catch (e: any) {

        alert("❌ Error al guardar: " + e.message);

    } finally {

        setSaving(false);

    }

  }



  // 🚀 MEGÁFONO PRIVADO: FUNCION 🚀

  const handleSendPrivateMessage = async (e: React.FormEvent) => {

      e.preventDefault();

      if (!order?.user_id) return alert("El atleta no tiene un ID de usuario vinculado.");

      setSendingMsg(true);

      try {

          const { error } = await supabase.from('notifications').insert([{ 

              user_id: order.user_id, 

              is_global: false, 

              title: msgTitle, 

              message: msgBody 

          }]);

          if (error) throw error;

          alert("✅ Mensaje enviado al dashboard de " + order.customer_name);

          setMsgTitle(""); setMsgBody(""); fetchData();

      } catch (err:any) {

          alert("❌ Error: " + err.message);

      } finally {

          setSendingMsg(false);

      }

  };



  if (loading) return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-amber-500 font-black animate-pulse uppercase tracking-widest">Cargando Atleta...</div>;

  

if (!order) return (

    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center gap-4">

        <p>Atleta no encontrado o datos duplicados en la Base de Datos.</p>

        <Link href="/admin/athletes" className="text-amber-500 hover:text-white font-black tracking-widest uppercase transition-colors">← Volver a la lista de Atletas</Link>

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

<div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-amber-500 selection:text-white relative">     
      {/* BARRA SUPERIOR LIGHT */}
      <div className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 pb-4 sticky top-0 z-50 shadow-sm">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 p-5 md:px-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <Link href="/admin/athletes" className="bg-gray-50 hover:bg-black hover:text-white border border-gray-200 w-10 h-10 flex items-center justify-center rounded-xl transition-all font-black text-lg text-gray-500 shrink-0 shadow-sm">←</Link>
                <div>
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl font-black italic uppercase tracking-tighter text-black drop-shadow-sm">{order.customer_name}</h1>
                       {subStatus === 'active' ? (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-200">Activo</span>
                       ) : (
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-200">Vencido</span>
                       )}
                    </div>
                    <Link href="/">
                      <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest hover:text-amber-600 cursor-pointer mt-1">TUJAGUE STRENGTH</p>
                    </Link>
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-md transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2 active:scale-95 border-none"
            >
                {saving ? "Registrando Datos..." : "💾 Guardar Modificaciones"}
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">

        {/* 🚀 RADAR GENERAL LIGHT 🚀 */}
        <div className="mb-10 bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mt-8">
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
           
           <div className="flex-1 w-full relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><span>📡</span> Radar Clínico (Último Check-In)</h3>
              
              {order.checkin_history && order.checkin_history.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Peso</p>
                       <p className="text-black font-black">{order.checkin_weight || '-'} kg</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Adherencia</p>
                       <p className={`font-black ${Number(order.checkin_adherence) < 80 ? 'text-red-500' : 'text-emerald-600'}`}>{order.checkin_adherence || '-'}%</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Sueño</p>
                       <p className={`font-black ${Number(order.checkin_sleep) < 6 ? 'text-red-500' : 'text-emerald-600'}`}>{order.checkin_sleep || '-'} hrs</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Estrés</p>
                       <p className={`font-black ${Number(order.checkin_stress) >= 8 ? 'text-red-500' : 'text-emerald-600'}`}>{order.checkin_stress || '-'}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Energía</p>
                       <p className="text-amber-500 font-black">{order.checkin_energy || '-'}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Recuperación</p>
                       <p className="text-blue-500 font-black">{order.checkin_recovery || '-'}/10</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center col-span-2 md:col-span-1">
                       <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Dolor</p>
                       <p className={`font-black text-[10px] uppercase truncate ${order.checkin_joint_pain && order.checkin_joint_pain !== 'ninguno' ? 'text-red-500' : 'text-emerald-600'}`}>{order.checkin_joint_pain || 'Ninguno'}</p>
                    </div>
                 </div>
              ) : (
                 <p className="text-xs text-gray-400 font-medium italic">El atleta aún no ha completado su Check-in Semanal.</p>
              )}
           </div>

           <div className="w-full lg:w-72 bg-gray-50 border border-gray-200 p-5 rounded-2xl relative z-10 shrink-0 group hover:border-amber-300 transition-colors">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Decisión del Coach (Semana)</p>
              <select 
                 value={coachDecision} 
                 onChange={(e) => setCoachDecision(e.target.value)} 
                 className={`w-full bg-transparent text-sm font-black uppercase tracking-widest outline-none transition-colors border-b-2 pb-2 cursor-pointer appearance-none ${coachDecision === 'sobrecargar' ? 'text-emerald-600 border-emerald-200' : coachDecision === 'descargar' ? 'text-blue-600 border-blue-200' : 'text-amber-500 border-amber-200'}`}
              >
                 <option value="mantener" className="bg-white text-amber-600">Mantener Cargas</option>
                 <option value="sobrecargar" className="bg-white text-emerald-600">Progresar (Sobrecarga)</option>
                 <option value="descargar" className="bg-white text-blue-600">Descarga SNC (Deload)</option>
              </select>
           </div>
        </div>

        {/* 🚀 NUEVO LAYOUT: SIDEBAR IZQUIERDO + CONTENIDO 🚀 */}



        {/* 🚀 NUEVO LAYOUT: SIDEBAR IZQUIERDO + CONTENIDO 🚀 */}

        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">

            

{/* 1. MENÚ VERTICAL LATERAL LIGHT */}
            <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2 lg:sticky lg:top-32">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-2">Módulos Élite</p>
                
                <button onClick={() => setActiveTab('constructor')} className={`w-full text-left px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center gap-3 ${activeTab === 'constructor' ? 'bg-amber-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'}`}>
                    <span className="text-lg">⚙️</span> Constructor BII
                </button>

                <button onClick={() => setActiveTab('datos')} className={`w-full text-left px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center gap-3 ${activeTab === 'datos' ? 'bg-black text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black'}`}>
                    <span className="text-lg">👁️</span> Ojo de Halcón (SNC)
                </button>

                <button onClick={() => setActiveTab('videos')} className={`w-full text-left px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center gap-3 ${activeTab === 'videos' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'}`}>
                    <span className="text-lg">🤖</span> Clínica Biomecánica
                </button>

                <button onClick={() => setActiveTab('megafono')} className={`w-full text-left px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center gap-3 mt-4 ${activeTab === 'megafono' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 border border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-100'}`}>
                    <span className="text-lg">💬</span> Megáfono Privado
                </button>
            </div>



{/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
            <div className="flex-1 w-full min-w-0">

                {/* ─── PESTAÑA: CONSTRUCTOR BII ─── */}
                {activeTab === 'constructor' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <RoutineBuilder athleteId={order.user_id || order.id || orderId} athleteName={order.customer_name || "Atleta BII"} />
                    </div>
                )}

                {/* ─── PESTAÑA: OJO DE HALCÓN Y DATOS LIGHT ─── */}
                {activeTab === 'datos' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* SUSCRIPCIÓN */}
                        <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                            <h3 className="text-2xl font-black italic uppercase text-black mb-6 border-b border-gray-100 pb-4 relative z-10">Suscripción y <span className="text-amber-500">Logística</span></h3>
                            
                            {daysLeftCalculated !== null && (
                                <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 font-black text-xs uppercase relative z-10 ${daysLeftCalculated < 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                                ⏳ {daysLeftCalculated < 0 ? `VENCIDO HACE ${Math.abs(daysLeftCalculated)} DÍAS` : `LE QUEDAN ${daysLeftCalculated} DÍAS`}
                                </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-6 mb-6 relative z-10">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Estado del Panel</p>
                                    <select value={subStatus} onChange={(e) => setSubStatus(e.target.value)} className="w-full bg-transparent text-xl font-black outline-none appearance-none text-black cursor-pointer">
                                        <option value="active">ACTIVO (Permitir Ingreso)</option>
                                        <option value="vencido">VENCIDO (Bloquear Panel)</option>
                                    </select>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Vencimiento Manual</p>
                                    <input type="date" className="bg-transparent text-xl font-black text-black w-full outline-none cursor-pointer" value={expiresAt} onChange={(e) => handleManualDateChange(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 relative z-10 border-b border-gray-100 pb-8 mb-8">
                                <button onClick={() => adjustDaysToExpire(30)} className="flex-1 bg-black hover:bg-zinc-800 text-white px-4 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95">+ Sumar 30 Días</button>
                                <button onClick={() => adjustDaysToExpire(7)} className="flex-1 bg-black hover:bg-zinc-800 text-white px-4 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95">+ Sumar 7 Días</button>
                                <button onClick={() => adjustDaysToExpire(-7)} className="flex-1 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-500 px-4 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all active:scale-95">- Restar 7 Días</button>
                            </div>

                            <div className="relative z-10">
                                <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="text-lg">💬</span> Protocolo de Retención Logística</p>
                                <div className="flex flex-col md:flex-row gap-4">
                                   <input type="text" placeholder="Teléfono. Ej: 5491123021760" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-black text-sm md:text-base font-bold outline-none focus:border-green-500 focus:bg-white transition-colors shadow-inner" />
                                   <a href={customerPhone ? `https://wa.me/${customerPhone}?text=Hola%20bestia!%20Faltan%20pocos%20días%20para%20que%20termine%20tu%20ciclo.%20Venís%20rindiendo%20excelente.%20¿Te%20genero%20el%20link%20del%20próximo%20mes%20así%20no%20perdemos%20el%20ritmo?` : "#"} target={customerPhone ? "_blank" : "_self"} className={`px-8 py-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shrink-0 ${customerPhone ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md active:scale-95' : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'}`}>Enviar Aviso WhatsApp</a>
                                </div>
                            </div>
                        </div>

                        {/* MACROS */}
                        <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                            <h3 className="text-2xl font-black italic uppercase text-black mb-6 border-b border-gray-100 pb-4 relative z-10">Directrices de <span className="text-amber-500">Rendimiento</span></h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 relative z-10">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 focus-within:border-amber-300 transition-colors shadow-inner">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Calorías</p>
                                    <input type="text" className="bg-transparent text-xl md:text-2xl font-black text-black w-full outline-none placeholder:text-gray-300 transition-colors focus:text-amber-500" value={macros.calories} placeholder="Ej: 2800" onChange={(e) => setMacros({...macros, calories: e.target.value})} />
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 focus-within:border-amber-300 transition-colors shadow-inner">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Proteínas</p>
                                    <input type="text" className="bg-transparent text-xl md:text-2xl font-black text-black w-full outline-none placeholder:text-gray-300 transition-colors focus:text-amber-500" value={macros.protein} placeholder="Ej: 160g" onChange={(e) => setMacros({...macros, protein: e.target.value})} />
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 focus-within:border-amber-300 transition-colors shadow-inner">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Carbos</p>
                                    <input type="text" className="bg-transparent text-xl md:text-2xl font-black text-black w-full outline-none placeholder:text-gray-300 transition-colors focus:text-amber-500" value={macros.carbs} placeholder="Ej: 300g" onChange={(e) => setMacros({...macros, carbs: e.target.value})} />
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 focus-within:border-amber-300 transition-colors shadow-inner">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Grasas</p>
                                    <input type="text" className="bg-transparent text-xl md:text-2xl font-black text-black w-full outline-none placeholder:text-gray-300 transition-colors focus:text-amber-500" value={macros.fats} placeholder="Ej: 70g" onChange={(e) => setMacros({...macros, fats: e.target.value})} />
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 focus-within:border-blue-300 transition-colors col-span-2 md:col-span-1 shadow-inner">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Hidratación</p>
                                    <input type="text" className="bg-transparent text-xl md:text-2xl font-black text-blue-600 w-full outline-none placeholder:text-gray-300 transition-colors focus:text-blue-500" value={macros.water} placeholder="Ej: 3.5L" onChange={(e) => setMacros({...macros, water: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* MARCAS HISTORICAS */}
                        <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-[2.5rem] shadow-sm">
                            <h3 className="text-2xl font-black italic uppercase mb-8 border-b border-gray-100 pb-6 text-black">Marcas Históricas <span className="text-amber-500">(1RM)</span></h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                                {[ { id: 'squat', name: 'Sentadilla' }, { id: 'bench', name: 'Banca' }, { id: 'deadlift', name: 'P. Muerto' }, { id: 'military', name: 'Militar' }, { id: 'dips', name: 'Fondos' } ].map(lift => (
                                    <div key={lift.id} className="bg-gray-50 p-4 md:p-6 rounded-3xl border border-gray-100 text-center relative group hover:border-amber-300 transition-colors shadow-inner">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 group-hover:text-amber-500 transition-colors">{lift.name}</p>
                                        <div className="relative">
                                            <input type="text" className="bg-transparent text-center text-3xl md:text-4xl font-black text-black w-full outline-none z-10 relative focus:text-amber-500 transition-colors placeholder:text-gray-300" value={rms[lift.id as keyof typeof rms]} placeholder="0" onChange={(e) => setRms({...rms, [lift.id]: e.target.value})} />
                                            <span className="absolute top-1/2 -translate-y-1/2 right-0 md:right-2 text-gray-400 text-[10px] md:text-xs font-black">KG</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* OJO DE HALCÓN (BITÁCORA REAL) */}
                        <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] relative overflow-hidden shadow-sm">
                            <h3 className="text-2xl font-black italic uppercase text-black mb-6 border-b border-gray-100 pb-4 relative z-10">Ojo de <span className="text-amber-500">Halcón</span></h3>
                            <div className="space-y-6">
                                {clientSessions.length > 0 ? clientSessions.map(s => (
                                    <div key={s.id} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                                        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                                            <div>
                                                <h4 className="text-black font-black uppercase text-sm">{new Date(s.completed_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}</h4>
                                                <span className="text-[9px] text-amber-600 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded uppercase mt-1 inline-block">S{s.workouts?.week_number} - {s.workouts?.routines?.name}</span>
                                            </div>
                                            {s.session_rpe && <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 font-black uppercase">sRPE {s.session_rpe}</span>}
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {s.athlete_notes && (
                                                <p className="text-xs text-gray-600 italic bg-white p-3 rounded-lg border-l-2 border-purple-500 shadow-sm">"{s.athlete_notes}"</p>
                                            )}
                                            {s.logs && s.logs.map((l: any, i: number) => (
                                                <div key={i} className="flex justify-between text-xs border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-gray-800 font-bold">{l.workout_exercises?.exercises?.name || 'Ejercicio'} (S{l.set_number})</span>
                                                    <span className="text-emerald-600 font-mono font-bold">{l.weight}kg x {l.reps} <span className="text-gray-400 text-[10px] ml-2">RPE{l.rpe} RIR{l.rir}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-gray-400 text-center py-10 font-bold uppercase tracking-widest text-xs">Sin sesiones registradas aún</p>}
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-8 md:p-10 rounded-[2.5rem] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6 shadow-inner">
                            <div>
                               <h3 className="text-xs md:text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Credenciales de Acceso</h3>
                               <p className="text-xs text-gray-400 font-medium">Información de login del atleta.</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="flex-1 md:flex-none bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm"><p className="text-[8px] md:text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Usuario</p><p className="text-sm font-bold text-black break-all">{order.customer_email}</p></div>
                                <div className="flex-1 md:flex-none bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm"><p className="text-[8px] md:text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Contraseña</p><p className="text-sm font-mono text-amber-500">{order.password || '••••••'}</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PESTAÑA: VIDEOS Y CLÍNICA ─── */}
                {activeTab === 'videos' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-purple-50 border border-purple-200 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                            <div className="relative z-10">
                              <h3 className="text-purple-600 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                 <span className="text-2xl">🧠</span> Tujague AI: Biomecánica & Patologías de Movimiento
                              </h3>
                              <p className="text-gray-500 text-[11px] mt-2 uppercase font-bold tracking-tight">Utilice la matriz de Snippets para diagnósticos rápidos o el micrófono para dictados complejos.</p>
                            </div>
                            {isRecording && (
                               <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-5 py-2.5 rounded-full animate-pulse shadow-sm relative z-10">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Micrófono Activo</span>
                               </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-10">
                        {videoLifts.map(lift => (
                            <div key={lift.id} className={`bg-white border ${isRecording === lift.id ? 'border-red-400 shadow-md' : 'border-gray-200'} rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col xl:flex-row min-h-[500px] transition-all`}>
                                <div className="w-full xl:w-[450px] bg-gray-50 flex flex-col p-6 border-b xl:border-b-0 xl:border-r border-gray-200 relative shrink-0">
                                    <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-3">{lift.name}</span>
                                    <div className="flex-1 flex items-center justify-center bg-black rounded-3xl border border-gray-200 overflow-hidden relative shadow-inner">
                                        {order[`video_${lift.id}`] ? (
                                            <video src={order[`video_${lift.id}`]} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="text-gray-400 text-center uppercase font-black text-[10px] flex flex-col items-center gap-2">
                                                <span className="text-3xl opacity-50">🔒</span>
                                                Material Clínico Ausente
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 bg-white min-w-0">
                                    <div className="grid lg:grid-cols-2 gap-8 h-full">
                                        
                                        {/* COLUMNA 1: APUNTES DEL COACH Y DIAGNÓSTICOS RÁPIDOS */}
                                        <div className="flex flex-col min-w-0 h-full">
                                           <div className="flex justify-between items-center mb-4">
                                              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                                  <span className="text-base">✍️</span> 1. Dictamen Base
                                              </label>
                                              <button onClick={() => setAiNotes({...aiNotes, [lift.id]: ""})} className="text-[9px] text-gray-400 hover:text-black uppercase font-bold transition-colors bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">Limpiar</button>
                                           </div>
                                           
                                           <div className="relative w-full h-40 group mb-4">
                                              <textarea 
                                                 className={`w-full h-full bg-gray-50 border ${isRecording === lift.id ? 'border-red-300 text-red-800' : 'border-gray-200 text-black focus:border-blue-400 focus:bg-white'} rounded-2xl p-5 text-xs outline-none transition-all resize-none custom-scrollbar shadow-inner`}
                                                 placeholder="Escriba o dicte el fallo biomecánico aquí. Ej: 'Butt wink en excéntrica, perder tensión en core...'"
                                                 value={aiNotes[lift.id as keyof typeof aiNotes]}
                                                 onChange={e => setAiNotes({...aiNotes, [lift.id]: e.target.value})}
                                              />
                                              <button 
                                                 onClick={() => toggleRecording(lift.id)}
                                                 className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording === lift.id ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-white border border-gray-200 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
                                                 title="Dictar notas por voz"
                                              >
                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                                              </button>
                                           </div>

                                           {/* ✅ EL SELECTOR DE DIAGNÓSTICOS RÁPIDOS (SNIPPETS) */}
                                           {(biomechanicalSnippets as any)[lift.id] && (
                                               <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col gap-3 shadow-inner">
                                                   <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                                       <span>🧩</span> Matriz de Patologías (Auto-completar):
                                                   </span>
                                                   <select 
                                                      className="bg-white border border-gray-200 text-xs text-gray-600 p-3 rounded-lg outline-none cursor-pointer appearance-none hover:border-blue-300 transition-colors shadow-sm"
                                                      onChange={(e) => {
                                                          if(e.target.value) {
                                                              insertSnippet(lift.id, e.target.value);
                                                              e.target.value = ""; 
                                                          }
                                                      }}
                                                      defaultValue=""
                                                   >
                                                      <option value="" disabled>Seleccionar e inyectar en Reporte Oficial...</option>
                                                      {(biomechanicalSnippets as any)[lift.id].map((snip: any, idx: number) => (
                                                          <option key={idx} value={snip.text}>{snip.label}</option>
                                                      ))}
                                                   </select>
                                               </div>
                                           )}

                                           <button 
                                              onClick={() => handleGenerateFeedback(lift.id)}
                                              disabled={generatingAi[lift.id as keyof typeof generatingAi] || !aiNotes[lift.id as keyof typeof aiNotes].trim() || isRecording === lift.id}
                                              className="mt-auto bg-blue-600 hover:bg-blue-500 text-white py-4 md:py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 shadow-md active:scale-95"
                                           >
                                              {generatingAi[lift.id as keyof typeof generatingAi] ? 'AMPLIANDO CON LENGUAJE CLÍNICO...' : 'REFINAR TEXTO CON IA ⚡'}
                                           </button>
                                        </div>

                                        {/* COLUMNA 2: REPORTE OFICIAL AL ATLETA */}
                                        <div className="flex flex-col min-w-0 h-full">
                                           <div className="flex justify-between items-center mb-4">
                                              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                                  <span className="text-base">📨</span> 2. Reporte Clínico Oficial
                                              </label>
                                              <button onClick={() => setFeedback({...feedback, [lift.id]: ""})} className="text-[9px] text-gray-400 hover:text-black uppercase font-bold transition-colors bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">Limpiar Final</button>
                                           </div>
                                           <textarea 
                                              className="w-full flex-1 min-h-[250px] bg-gray-50 border border-amber-200 rounded-2xl p-5 text-sm text-black outline-none focus:border-amber-400 focus:bg-white transition-all resize-none custom-scrollbar leading-relaxed shadow-inner placeholder:text-gray-400"
                                              value={feedback[lift.id] || ""}
                                              onChange={(e) => setFeedback({...feedback, [lift.id]: e.target.value})}
                                              placeholder="El diagnóstico técnico final estructurado aparecerá aquí..."
                                           />
                                           <p className="text-[8px] text-gray-400 text-right mt-3 font-bold uppercase tracking-widest">Visible en el Dashboard del Atleta</p>
                                        </div>
                                    </div>
                                    
                                    {/* INSIGHTS OCULTOS DE LA IA PARA EL COACH */}
                                    {aiInsights[lift.id as keyof typeof aiInsights] && (
                                       <div className="coach-insight-anim bg-blue-50 border border-blue-200 rounded-2xl p-6 relative shadow-sm mt-4">
                                          <button onClick={() => setAiInsights({...aiInsights, [lift.id]: ""})} className="absolute top-6 right-6 text-blue-400 hover:text-white font-bold bg-white border border-blue-200 hover:bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2 border-b border-blue-100 pb-3">
                                              <span className="text-lg">🛡️</span> Insight Privado para Head Coach
                                          </p>
                                          <p className="text-xs md:text-sm text-gray-700 italic leading-relaxed">
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

                {/* ─── PESTAÑA: MEGÁFONO PRIVADO (NUEVA) ─── */}
                {activeTab === 'megafono' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-6">
                        <div className="bg-white border border-gray-200 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                            <h3 className="text-2xl font-black italic uppercase text-black mb-2 tracking-tighter">Mensajería <span className="text-blue-500">Directa</span></h3>
                            <p className="text-gray-500 text-xs mb-8 uppercase font-bold tracking-widest">Impacta el panel de {order.customer_name} de forma privada.</p>
                            
                            <form onSubmit={handleSendPrivateMessage} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2 block ml-1">Título del Mensaje</label>
                                    <input type="text" required value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} placeholder="Ej: Revisión de Técnica..." className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl text-sm font-black text-black outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2 block ml-1">Cuerpo del Comunicado</label>
                                    <textarea required value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="Escribí tu indicación detallada..." className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl text-sm font-medium text-gray-800 outline-none h-40 resize-none focus:border-blue-400 focus:bg-white transition-all custom-scrollbar placeholder:text-gray-400" />
                                </div>
                                <button type="submit" disabled={sendingMsg} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 disabled:opacity-50">
                                    {sendingMsg ? 'TRANSMITIENDO...' : 'DISPARAR COMUNICADO PRIVADO 🚀'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 border-b border-gray-100 pb-4">Historial de mensajes con este atleta</h4>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {msgHistory.length > 0 ? msgHistory.map(m => (
                                    <div key={m.id} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl shadow-inner">
                                        <p className="text-[8px] text-gray-400 font-black uppercase mb-1">{new Date(m.created_at).toLocaleString()}</p>
                                        <h5 className="text-sm font-black text-black mb-1">{m.title}</h5>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{m.message}</p>
                                    </div>
                                )) : <p className="text-gray-400 italic text-sm">No has enviado mensajes privados aún.</p>}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>



      <style dangerouslySetInnerHTML={{__html: `

        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }

        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.4); border-radius: 10px; }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.8); }

        

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