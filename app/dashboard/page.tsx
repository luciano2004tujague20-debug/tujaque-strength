"use client";

import { generateAndDownloadPDF, mergeAndDownload12WeekPDF } from '@/utils/pdfGenerator';
import TabEvolucionDashboard from '@/components/TabEvolucionDashboard';
import TabCheckin from '@/components/TabCheckin';
import TabVideos from '@/components/TabVideos';
import TabNutricion from '@/components/TabNutricion';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import TabEvolucion from "@/components/dashboard/TabEvolucion";
import AffiliateDashboard from "@/components/dashboard/afiliados/AffiliateDashboard"; // 🔥 ESTA ES LA LÍNEA NUEVA
import AthleteNutritionDashboard from "@/components/dashboard/nutrition/AthleteNutritionDashboard";
import AthleteMacroPlanner from '@/components/AthleteMacroPlanner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'; // 🔥 Línea 3 unificada y limpia
import React from 'react';
import FeatureCard from '@/components/FeatureCard'; // 🔥 NUEVO: Tarjeta con Candado
import UpgradeModal from '@/components/UpgradeModal'; // 🔥 NUEVO: Ventana Emergente
// ... el resto de las importaciones siguen igual ...
import { resolvePlan } from '@/lib/permissions';
import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PDFDocument, rgb } from 'pdf-lib';

export default function DashboardAtleta() {
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState("rutina");
  // 🔥 NUEVOS ESTADOS RELACIONALES (SaaS BII-Vintage) 🔥
  const [activeDbRoutine, setActiveDbRoutine] = useState<any>(null); // Va a guardar la rutina que descarguemos de Supabase
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string, reps: string }>>({}); // Va a guardar los KG y Reps que el atleta escriba
  const [savingSetId, setSavingSetId] = useState<string | null>(null); // Es para que el botón diga "Guardando..." mientras carga
  const [showAssistant, setShowAssistant] = useState(false); // 🔥 NUEVA LLAVE
  const [showNotifications, setShowNotifications] = useState(false); // 🔥 LLAVE DE LA CAMPANA
  const [dbNotifications, setDbNotifications] = useState<any[]>([]); // 🔥 GUARDA LOS MENSAJES DE SUPABASE
  const [hiddenNotifs, setHiddenNotifs] = useState<string[]>([]); // 🔥 GUARDA QUÉ ALERTAS OCULTÓ EL ATLETA
  
  // 🚀 MAGIA ÉLITE: MEMORIA PERMANENTE PARA NOTIFICACIONES BORRADAS 🚀
  useEffect(() => {
      // Al abrir la app, busca si Franco ya había borrado notificaciones antes
      const savedHidden = localStorage.getItem('tujague_hidden_notifs');
      if (savedHidden) {
          setHiddenNotifs(JSON.parse(savedHidden));
      }
  }, []);

  useEffect(() => {
      // Cada vez que Franco borra una nueva, la guardamos en el disco duro del celu
      if (hiddenNotifs.length > 0) {
          localStorage.setItem('tujague_hidden_notifs', JSON.stringify(hiddenNotifs));
      }
  }, [hiddenNotifs]);

  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<string[]>([]);

// --- NUEVO: ESTADO DE RUTINAS BII ---
  const [hasNewBiiRoutine, setHasNewBiiRoutine] = useState(false);
  const [activeBiiProgram, setActiveBiiProgram] = useState<any>(null); // El programa actual de HOY
  const [allBiiPrograms, setAllBiiPrograms] = useState<any[]>([]); // 🔥 Guarda todas las semanas del atleta
  const [viewingBiiProgram, setViewingBiiProgram] = useState<any>(null); // 🔥 La semana que elige ver en el menú
  const [routineLoading, setRoutineLoading] = useState(true);
  
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingRm, setSavingRm] = useState(false);
  
  const [rms, setRms] = useState({ squat: "", bench: "", deadlift: "", dips: "", military: "" });

const [savingCheckin, setSavingCheckin] = useState(false);
  
  const [checkin, setCheckin] = useState({ 
    weight: "", 
    sleep: "", 
    stress: "5", 
    notes: "",
    adherence: "100",
    energy: "5",
    hunger: "5",
    recovery: "5",
    joint_pain: "ninguno",
    hit_failure: true
  });

  // 🔥 NUEVO: ESTADO DEL MODAL DE UPGRADE (SEGURIDAD) 🔥
  const [upgradeModalData, setUpgradeModalData] = useState({ isOpen: false, featureName: '' });

  // Función que dispara el Modal cuando tocan un candado
  const handleRestrictedClick = (featureName: string) => {
    setUpgradeModalData({ isOpen: true, featureName });
  };
  
  const [checkinHistory, setCheckinHistory] = useState<any[]>([]);

  const [isLocked, setIsLocked] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  const [isOnboarded, setIsOnboarded] = useState(false);
  
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [isBeginner, setIsBeginner] = useState(false);

  // ─── Variables de Renovación Élite ───
  const [loadingRenewal, setLoadingRenewal] = useState(false); 
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const [onboardingData, setOnboardingData] = useState({
      age: "", body_weight: "", height: "", experience: "intermedio", goal: "fuerza",
      equipment: "gimnasio", medical_history: "", training_days: "4", // Default 4 days for Elite
      rm_squat: "", rm_bench: "", rm_deadlift: "", rm_dips: "", rm_military: ""
  });

  const [onboardingStep, setOnboardingStep] = useState(1);
  const [jointIssues, setJointIssues] = useState<string[]>([]);
  
  const toggleJoint = (joint: string) => {
      setJointIssues(prev => prev.includes(joint) ? prev.filter(j => j !== joint) : [...prev, joint]);
  };

  const [calcLift, setCalcLift] = useState("squat");
  const [calcPercent, setCalcPercent] = useState(80);

  const [logs, setLogs] = useState({ d1: "", d2: "", d3: "", d4: "", d5: "", d6: "", d7: "" });
  const [savingLogs, setSavingLogs] = useState(false);

  const [time, setTime] = useState(180); 
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [fatigueStatus, setFatigueStatus] = useState<any>(null);
  // Nuevos estados para la IA
  const [analyzingFatigue, setAnalyzingFatigue] = useState(false);
  const [fatigueVerdict, setFatigueVerdict] = useState("");
  const [warmupPlan, setWarmupPlan] = useState("");
  const [generatingWarmup, setGeneratingWarmup] = useState(false);
  const [logFeedback, setLogFeedback] = useState("");

  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicExercise, setPanicExercise] = useState("");
  const [panicProblem, setPanicProblem] = useState("");
  const [panicLoading, setPanicLoading] = useState(false);
  const [panicResponse, setPanicResponse] = useState("");

  const [aiMode, setAiMode] = useState<'biomechanic' | 'chef'>('biomechanic');

  const initialBiomechanicMessage = "Saludos cordiales. Soy el Sistema de Análisis Biomecánico de Tujague Strength. ¿En qué aspecto técnico o de programación puedo asistirle hoy?";
  const [bioInput, setBioInput] = useState("");
  const [bioHistory, setBioHistory] = useState<{role: string, content: string}[]>([
      { role: "assistant", content: initialBiomechanicMessage }
  ]);

  const initialChefMessage = "Saludos cordiales. Soy el Asistente Clínico Nutricional. Ingrese sus parámetros o ingredientes para diseñar una estrategia dietética.";
  const [chefInput, setChefInput] = useState("");
  const [chefHistory, setChefHistory] = useState<{role: string, content: string}[]>([
      { role: "assistant", content: initialChefMessage }
  ]);

  const [showChefForm, setShowChefForm] = useState(false);
  const [chefIngredients, setChefIngredients] = useState("");
  const [dietGoal, setDietGoal] = useState("mantenimiento");
  const [activityLevel, setActivityLevel] = useState("moderado");
  const [calculatedMacros, setCalculatedMacros] = useState<{cals: number, prot: number, fats: number, carbs: number, water: string} | null>(null);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isDownloadingMeso, setIsDownloadingMeso] = useState(false);

  const [rmAiLoading, setRmAiLoading] = useState(false);
  const [rmAiFeedback, setRmAiFeedback] = useState("");

  // 🔥 DISEÑO PREMIUM PARA LAS ETIQUETAS DE LAS BARRAS 🔥
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    // Si el valor es 0 o no existe, no dibuja nada (Mantiene el gráfico limpio)
    if (!value || value === 0) return null; 
    
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="#1f2937" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fontSize="11" 
        fontWeight="900"
      >
        {value}kg
      </text>
    );
  };

// 🔥 CEREBRO DE PERMISOS BII-VINTAGE 3.0 (HIGH-TICKET) 🔥
  const safePlanId = (order?.plan_id || "").toLowerCase();

  // 1. Identificamos qué plan compró el usuario
  const isElitePlan = safePlanId.includes('elite') || safePlanId.includes('leyenda') || safePlanId.includes('vip');
  
  // 2. Si no es Élite/Leyenda, por descarte es un plan Estático (Bóveda de PDFs)
  const isStaticPlan = !isElitePlan;

  // 3. Matriz de Accesos de Alta Gama
  const canViewRoutine = true; 
  const canViewVideos = isElitePlan;
  const canViewSNC = isElitePlan;
  const canViewRMs = isElitePlan;
  const canViewAI = isElitePlan;
  
  // Link de WhatsApp para agendar llamada (Upsell)
  const whatsappUpsellUrl = "https://wa.me/5491123021760?text=" + encodeURIComponent("Hola Coach, estoy en mi Dashboard y quiero aplicar a la Mentoría Élite para desbloquear todas las herramientas de alto rendimiento. ¿Podemos agendar una llamada?");

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && time > 0) {
      interval = setInterval(() => { setTime((t) => t - 1); }, 1000);
    } else if (time === 0 && isTimerActive) {
      setIsTimerActive(false);
      playBeep();
      setTimeout(() => alert("¡TIEMPO DE RECUPERACIÓN FINALIZADO! PROCEDA A LA BARRA."), 100);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, time]);

  const toggleTimer = () => {
      if (time === 0) setTime(180);
      setIsTimerActive(!isTimerActive);
  };

  const resetTimer = (newTime: number) => {
      setTime(newTime);
      setIsTimerActive(false);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
      oscillator.start();
      setTimeout(() => oscillator.stop(), 1000); 
    } catch (e) {
      console.log("Audio no soportado");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      const user = session.user;
      setUser(user);

      const { data: oldOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: newOrders } = await supabase
        .from("commerce_orders")
        .select(`
          id,
          items:commerce_order_items (
            product_snapshot
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "paid");

      const hasOldOrder = oldOrders && oldOrders.length > 0;
      const hasNewProduct = newOrders && newOrders.length > 0;

      if (hasNewProduct && newOrders) {
        const boughtSlugs: string[] = [];
        newOrders.forEach((o: any) => {
          if (o.items) {
            o.items.forEach((i: any) => {
              if (i.product_snapshot && i.product_snapshot.slug) {
                boughtSlugs.push(i.product_snapshot.slug);
              }
            });
          }
        });
        setMyProducts(boughtSlugs);
      }

      if (!hasOldOrder && !hasNewProduct) {
        setLoading(false);
        return;
      }

      if (hasOldOrder && oldOrders) {
        const currentOrder = oldOrders[0];
        setOrder(currentOrder);
        setRms({
          squat: currentOrder.rm_squat || "",
          bench: currentOrder.rm_bench || "",
          deadlift: currentOrder.rm_deadlift || "",
          dips: currentOrder.rm_dips || "",
          military: currentOrder.rm_military || ""
        });
        
        setLogs({
          d1: currentOrder.log_d1 || "", d2: currentOrder.log_d2 || "", d3: currentOrder.log_d3 || "",
          d4: currentOrder.log_d4 || "", d5: currentOrder.log_d5 || "", d6: currentOrder.log_d6 || "", d7: currentOrder.log_d7 || ""
        });
        
        setCheckinHistory(currentOrder.checkin_history || []);
        
        setCheckin({
            weight: currentOrder.checkin_weight || "",
            sleep: currentOrder.checkin_sleep || "",
            stress: currentOrder.checkin_stress || "5",
            notes: currentOrder.checkin_notes || "",
            adherence: currentOrder.checkin_adherence || "100",
            energy: currentOrder.checkin_energy || "5",
            hunger: currentOrder.checkin_hunger || "5",
            recovery: currentOrder.checkin_recovery || "5",
            joint_pain: currentOrder.checkin_joint_pain || "ninguno",
            hit_failure: currentOrder.checkin_hit_failure !== false
        });
        
        const planId = currentOrder.plan_id || "";
        const planTitle = (currentOrder.plan_title || "").toLowerCase();
        
        // Excluir planes estáticos del onboarding obligatorio
        const isStaticCheck = planId.includes('static') || 
                              planId.includes('definicion') || 
                              planId.includes('cut') || 
                              planId.includes('mesociclo-') || 
                              planId.includes('calculadora') || 
                              planId.includes('especializacion') || 
                              planId.includes('brazos') || 
                              planTitle.includes('fuerza base') || 
                              planTitle.includes('mutación');
        
        if (isStaticCheck) {
            setIsOnboarded(true);
        } else {
            setIsOnboarded(currentOrder.is_onboarded === true);
        }
        
        if (!isStaticCheck && currentOrder.checkin_history && currentOrder.checkin_history.length > 0) {
            const recentCheckins = currentOrder.checkin_history.slice(-3);
            fetch('/api/assistant/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'analyze_fatigue', data: recentCheckins })
            })
            .then(res => res.json())
            .then(data => {
                if(data.result) setFatigueStatus(data.result);
            })
            .catch(e => console.log("Error en Ojo de Halcón:", e));
        }

        if (currentOrder.sub_status === 'vencido') {
           setIsLocked(true);
        } else if (currentOrder.expires_at) {
           const expDate = new Date(currentOrder.expires_at);
           const today = new Date();
           const diffTime = expDate.getTime() - today.getTime();
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
           
           if (diffDays < 0) {
              setIsLocked(true);
           } else {
              setDaysLeft(diffDays);
           }
        }
      }

      // --- NUEVO: BUSCAR SI TIENE RUTINA BII ASIGNADA (BLINDADO MULTI-ID) ---
      const possibleIds: string[] = [user.id];
      
      if (oldOrders && oldOrders.length > 0) {
          if (oldOrders[0].id) possibleIds.push(oldOrders[0].id);
          if (oldOrders[0].user_id) possibleIds.push(oldOrders[0].user_id);
      }

      // 🔥 Traemos TODAS las semanas asignadas al atleta 🔥
      const { data: allPrograms } = await supabase
          .from('assigned_programs')
          .select('*')
          .in('user_id', possibleIds)
          .order('created_at', { ascending: false });

      if (allPrograms && allPrograms.length > 0) {
          setHasNewBiiRoutine(true);
          setAllBiiPrograms(allPrograms);
          
          // Buscamos cuál es la activa de esta semana para ponerla por defecto
          const active = allPrograms.find(p => p.is_active) || allPrograms[0];
          setActiveBiiProgram(active.program_data);
          setViewingBiiProgram(active.program_data); // Esta es la que se ve en la agenda
      }

// 🔥 BUSCAR NOTIFICACIONES DEL COACH (GLOBALES O PRIVADAS) 🔥
      const { data: fetchNotifs } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Traemos las últimas 10

      if (fetchNotifs) {
          setDbNotifications(fetchNotifs);
      }

// -------------------------------------------------------------------------
      // 🔥 MAGIA RELACIONAL Y EVOLUCIÓN (SaaS BII) 🔥
      // 🚀 FASE 4 (OPTIMIZACIÓN): EL PEAJE DE SUPABASE 🚀
      // -------------------------------------------------------------------------
      // 🔥 Corrección 1: Usamos order?. en lugar de currentOrder
      const userPlanId = (order?.plan_id || "").toLowerCase();
      const isUserElite = userPlanId.includes('elite') || userPlanId.includes('leyenda') || userPlanId.includes('vip');

      // Solo gastamos recursos de Supabase si el usuario pagó un plan de alto rendimiento
      if (user.id && isUserElite) {
          const { data: dbRoutineData, error: dbRoutineErr } = await supabase
            .from('routines')
            .select('*, workouts(*, workout_exercises(*))') // 🔥 Corrección 2: Todo en una sola línea para evitar el ParserError
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (dbRoutineData && dbRoutineData.workouts) {
              // Ordenamos los días por número y los ejercicios por su orden de aparición
              dbRoutineData.workouts.sort((a: any, b: any) => a.day_number - b.day_number);
              dbRoutineData.workouts.forEach((w: any) => {
                  if (w.workout_exercises) {
                      w.workout_exercises.sort((a: any, b: any) => a.order_index - b.order_index);
                  }
              });
              setActiveDbRoutine(dbRoutineData);
          }

          // 🔥 MOTOR DE EVOLUCIÓN AUTOMÁTICA (ALGORITMO DE BRZYCKI) 🔥
          const { data: sweatData } = await supabase
              .from('logged_sets')
              .select('weight_kg, reps_achieved, workout_exercises(exercise_name)') // 🔥 Todo en una línea aquí también
              .eq('user_id', user.id);

          if (sweatData && sweatData.length > 0) {
              // 🔥 Corrección 1: Usamos order?. en lugar de currentOrder
              let maxSquat = Number(order?.rm_squat || 0);
              let maxBench = Number(order?.rm_bench || 0);
              let maxDeadlift = Number(order?.rm_deadlift || 0);
              let maxMilitary = Number(order?.rm_military || 0);
              let maxDips = Number(order?.rm_dips || 0);

              sweatData.forEach((set: any) => {
                  const exName = set.workout_exercises?.exercise_name?.toLowerCase() || '';
                  const weight = Number(set.weight_kg);
                  const reps = Number(set.reps_achieved);
                  
                  const e1RM = reps === 1 ? weight : Math.round(weight * (36 / (37 - reps)));

                  if (exName.includes('sentadilla') || exName.includes('squat')) {
                      if (e1RM > maxSquat) maxSquat = e1RM;
                  } else if (exName.includes('banca') || exName.includes('bench')) {
                      if (e1RM > maxBench) maxBench = e1RM;
                  } else if (exName.includes('muerto') || exName.includes('deadlift')) {
                      if (e1RM > maxDeadlift) maxDeadlift = e1RM;
                  } else if (exName.includes('militar') || exName.includes('ohp')) {
                      if (e1RM > maxMilitary) maxMilitary = e1RM;
                  } else if (exName.includes('fondo') || exName.includes('dip')) {
                      if (e1RM > maxDips) maxDips = e1RM;
                  }
              });

              setRms({
                  squat: maxSquat > 0 ? maxSquat.toString() : "",
                  bench: maxBench > 0 ? maxBench.toString() : "",
                  deadlift: maxDeadlift > 0 ? maxDeadlift.toString() : "",
                  military: maxMilitary > 0 ? maxMilitary.toString() : "",
                  dips: maxDips > 0 ? maxDips.toString() : ""
              });
          }
      }
      // -------------------------------------------------------------------------

      setRoutineLoading(false);
      setLoading(false);
    }; 

    fetchDashboardData();
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bioHistory, chefHistory, isTyping, aiMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 🔥 BOTÓN MÁGICO DE TESTEO (BORRAR DESPUÉS) 🔥
  const handleInyectarRutinaSaaS = async () => {
      if (!user?.id) return alert("Falta usuario");
      
      const { data: routine, error: rErr } = await supabase.from('routines').insert({
          user_id: user.id, name: "Protocolo Heavy Duty (SaaS)", macrocycle: "Prueba", mesocycle: "Semana 1", is_active: true
      }).select().single();
      if (rErr) return alert("Error: " + rErr.message);

      const { data: workout, error: wErr } = await supabase.from('workouts').insert({
          routine_id: routine.id, day_number: 1, name: "Día 1 - Push", focus: "Pecho y Hombro", is_rest_day: false
      }).select().single();
      if (wErr) return alert("Error Día: " + wErr.message);

      await supabase.from('workout_exercises').insert([
          { workout_id: workout.id, exercise_name: "Press Banca", sets_target: "3", reps_target: "5", rpe_target: "8", tempo: "3-1-X-1", rest_time: "3 min", order_index: 1 },
          { workout_id: workout.id, exercise_name: "Press Militar", sets_target: "3", reps_target: "8", rpe_target: "7", tempo: "3-0-X-1", rest_time: "2 min", order_index: 2 }
      ]);

      alert("✅ RUTINA RELACIONAL INYECTADA CON ÉXITO. ¡Actualizá la página (F5)!");
  };

  const handleSaveOnboarding = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingOnboarding(true);
      try {
          const finalSquat = isBeginner ? "0" : onboardingData.rm_squat;
          const finalBench = isBeginner ? "0" : onboardingData.rm_bench;
          const finalDeadlift = isBeginner ? "0" : onboardingData.rm_deadlift;
          const finalDips = isBeginner ? "0" : onboardingData.rm_dips;
          const finalMilitary = isBeginner ? "0" : onboardingData.rm_military;
          
          const finalMedical = isBeginner 
              ? `[ATLETA PRINCIPIANTE] - Lesiones: ${jointIssues.join(", ")} | Detalle: ${onboardingData.medical_history}` 
              : `Lesiones: ${jointIssues.join(", ")} | Detalle: ${onboardingData.medical_history}`;

          const { error } = await supabase
              .from('orders')
              .update({
                  is_onboarded: true,
                  age: onboardingData.age,
                  body_weight: onboardingData.body_weight,
                  height: onboardingData.height,
                  experience: onboardingData.experience,
                  goal: onboardingData.goal,
                  equipment: onboardingData.equipment,
                  medical_history: finalMedical,
                  training_days: onboardingData.training_days,
                  rm_squat: finalSquat,
                  rm_bench: finalBench,
                  rm_deadlift: finalDeadlift,
                  rm_dips: finalDips,
                  rm_military: finalMilitary
              })
              .eq('id', order.id);

          if (error) throw error;
          
          setRms({ squat: finalSquat, bench: finalBench, deadlift: finalDeadlift, dips: finalDips, military: finalMilitary });
          
          setOnboardingStep(5); 
          
      } catch (error: any) {
          alert("❌ Error: " + error.message);
      } finally {
          setSavingOnboarding(false);
      }
  };

  const handleSaveLogs = async () => {
      setSavingLogs(true);
      setLogFeedback(""); 
      try {
         const { error } = await supabase.from('orders').update({
            log_d1: logs.d1, log_d2: logs.d2, log_d3: logs.d3,
            log_d4: logs.d4, log_d5: logs.d5, log_d6: logs.d6, log_d7: logs.d7
         }).eq('id', order.id);

         if (error) throw error;
         alert("💾 Registros de rendimiento almacenados exitosamente.");

         const allLogsText = Object.values(logs).join(" ").trim();
         if (isElitePlan && allLogsText.length > 15) {
             const res = await fetch('/api/assistant/insights', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ action: 'evaluate_log', data: { log: allLogsText } })
             });
             const data = await res.json();
             if (data.result) {
                 setLogFeedback(data.result);
             }
         }
      } catch(e: any) {
         alert("Error de almacenamiento: " + e.message);
      } finally {
         setSavingLogs(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, lift: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeInBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
       alert("❌ Límite excedido (Máx 50MB).");
       e.target.value = ''; 
       return;
    }

    setUploading(lift);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${lift}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
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
      alert("📹 Archivo audiovisual subido correctamente.");
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleUpdateExtraName = async (lift: string, value: string) => {
      setOrder({ ...order, [`name_${lift}`]: value });
      await supabase.from('orders').update({ [`name_${lift}`]: value }).eq('id', order.id);
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
                rm_dips: rms.dips, 
                rm_military: rms.military
            })
            .eq('id', order.id);

        if (error) throw error;
        alert("💪 Récords actualizados en la base de datos.");
    } catch (error: any) {
        alert("Error: " + error.message);
    } finally {
        setSavingRm(false);
    }
  };

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCheckin(true);
    setFatigueVerdict(""); 
    
    const newEntry = {
        date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        weight: Number(checkin.weight),
        stress: Number(checkin.stress),
        sleep: Number(checkin.sleep)
    };

    const updatedHistory = [...checkinHistory, newEntry];

    try {
       const { error } = await supabase
          .from('orders')
          .update({ 
              checkin_weight: checkin.weight, 
              checkin_sleep: checkin.sleep, 
              checkin_stress: checkin.stress, 
              checkin_notes: checkin.notes,
              checkin_adherence: checkin.adherence,
              checkin_energy: checkin.energy,
              checkin_hunger: checkin.hunger,
              checkin_recovery: checkin.recovery,
              checkin_joint_pain: checkin.joint_pain,
              checkin_hit_failure: checkin.hit_failure,
              checkin_history: updatedHistory
          })
          .eq('id', order.id);

       if (error) throw error;
       
       alert("✅ Auditoría fisiológica enviada a la Base de Datos del Coach.");
       setCheckinHistory(updatedHistory);

       // 🔥 LA MAGIA DE LA IA COMIENZA AQUÍ 🔥
       setAnalyzingFatigue(true);
       try {
           const res = await fetch('/api/chat', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   action: 'fatigue_analysis',
                   data: {
                       sleep_hours: Number(checkin.sleep),
                       stress_level: Number(checkin.stress),
                       lethargy: Number(checkin.energy) <= 4 
                   }
               })
           });
           
           const data = await res.json();
           if (data.result) {
               setFatigueVerdict(data.result);
           }
       } catch (aiError) {
           console.error("Error contactando a la IA:", aiError);
       } finally {
           setAnalyzingFatigue(false);
       }

    } catch (error: any) {
       alert("Error: " + error.message);
    } finally {
       setSavingCheckin(false);
    }
  };

  // -------------------------------------------------------------------------
  // 🔥 PASO 3: FUNCIÓN PARA REGISTRAR EL SUDOR EN LA BÓVEDA (SaaS) 🔥
  // -------------------------------------------------------------------------
  const handleLogSet = async (exerciseId: string) => {
      const inputs = setInputs[exerciseId];
      if (!inputs || !inputs.weight || !inputs.reps) return alert("Por favor, ingresá los KG y las Repeticiones logradas.");
      
      setSavingSetId(exerciseId);
      try {
          const { error } = await supabase.from('logged_sets').insert({
              user_id: user.id,
              workout_exercise_id: exerciseId,
              weight_kg: Number(inputs.weight),
              reps_achieved: Number(inputs.reps)
          });
          if (error) throw error;
          
          alert("✅ ¡Serie registrada con éxito! El Coach IA ya tiene los datos.");
          
          // Limpiamos los casilleros de este ejercicio para que pueda anotar la siguiente serie
          setSetInputs(prev => ({ ...prev, [exerciseId]: { weight: '', reps: '' } }));
      } catch (error: any) {
          alert("Error guardando serie: " + error.message);
      } finally {
          setSavingSetId(null);
      }
  };

  const handleRenewPlan = async () => {
    setLoadingRenewal(true);
    try {
        const res = await fetch("/api/checkout-renewal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               orderId: order.id, 
               email: user.email, 
               planId: order.plan_id,
               useWallet: useWalletBalance 
            })
        });
        const data = await res.json();
        if (data.initPoint) {
            window.location.href = data.initPoint; 
        } else {
            alert("Error de conexión con la pasarela financiera.");
        }
    } catch (error) {
        alert("Error de red.");
    } finally {
        setLoadingRenewal(false);
    }
  };
const downloadPDF = async () => {
      setGeneratingPDF(true);
      try {
          // 🔥 Le pasamos "supabase" (tu conexión segura) a nuestro trabajador
          await mergeAndDownload12WeekPDF(supabase, order?.customer_name);
      } catch (error: any) {
          console.error("Error unificando PDF:", error);
          alert(`❌ Ocurrió un error de seguridad al armar tu plan:\n${error.message}`);
      } finally {
          setGeneratingPDF(false);
      }
  };
  const handleDownloadKit = () => {
      const link = document.createElement('a');
      link.href = '/kit_acelerador_bii_vintage.pdf'; 
      link.download = 'Kit_Acelerador_BII_Vintage.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDownloadSecureMeso = async () => {
    if (!order || !order.id) return;
    setIsDownloadingMeso(true);
    
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
            throw new Error("No se encontró la credencial de sesión. Vuelve a iniciar sesión.");
        }

        const response = await fetch('/api/download-pdf', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId: order.id }) 
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Operación denegada");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const planId = (order.plan_id || "").toLowerCase();
        const planTitle = (order.plan_title || "").toLowerCase();
        
        let pdfFileName = 'Mesociclo';
        if (planId.includes("fuerza") || planTitle.includes("fuerza")) {
            pdfFileName = 'Fuerza_Base';
        } else if (planId.includes("hipertrofia") || planTitle.includes("hipertrofia")) {
            pdfFileName = 'Mutacion_Hipertrofica';
        } else if (planId.includes("definicion") || planTitle.includes("definicion") || planTitle.includes("cut")) {
            pdfFileName = 'Definicion_Cut';
        }

        link.download = `Tujague_${pdfFileName}_Oficial.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error: any) {
        alert("❌ Error: " + error.message);
    } finally {
        setIsDownloadingMeso(false);
    }
  };

  const handleBioMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      const input = (e.target as HTMLFormElement).elements.namedItem('chatInput') as HTMLInputElement;
      const text = input.value;
      if (!text.trim()) return;

      const newHistory = [...bioHistory, { role: "user", content: text }];
      // Añadimos un mensaje vacío del asistente que se va a ir llenando de letras
      setBioHistory([...newHistory, { role: "assistant", content: "" }]); 
      input.value = ""; 
      setIsTyping(true);

      try {
         const res = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newHistory })
         });
         
         if (!res.ok) throw new Error();

         // 🔥 MAGIA: ATAJAMOS EL STREAMING Y CREAMOS EL EFECTO MÁQUINA DE ESCRIBIR 🔥
         setIsTyping(false); // Apagamos los puntitos rebotando porque ya empieza a escribir
         const reader = res.body?.getReader();
         const decoder = new TextDecoder();
         let aiResponse = "";

         while (true) {
             const { done, value } = await reader!.read();
             if (done) break;
             aiResponse += decoder.decode(value, { stream: true });
             
             // Actualizamos el historial en tiempo real con las letras nuevas
             setBioHistory([...newHistory, { role: "assistant", content: aiResponse }]);
         }
      } catch (error) {
         setBioHistory([...newHistory, { role: "assistant", content: "El sistema central se encuentra inactivo momentáneamente." }]);
         setIsTyping(false);
      }
  };

  const handleChefMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      const input = (e.target as HTMLFormElement).elements.namedItem('chatInput') as HTMLInputElement;
      const text = input.value;
      if (!text.trim()) return;

      const newHistory = [...chefHistory, { role: "user", content: text }];
      setChefHistory([...newHistory, { role: "assistant", content: "" }]);
      input.value = "";
      setIsTyping(true);

      try {
         const res = await fetch("/api/assistant/chef", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newHistory })
         });
         
         if (!res.ok) throw new Error();

         setIsTyping(false);
         const reader = res.body?.getReader();
         const decoder = new TextDecoder();
         let aiResponse = "";

         while (true) {
             const { done, value } = await reader!.read();
             if (done) break;
             aiResponse += decoder.decode(value, { stream: true });
             
             setChefHistory([...newHistory, { role: "assistant", content: aiResponse }]);
         }
      } catch (error) {
         setChefHistory([...newHistory, { role: "assistant", content: "Error de conexión con los servidores culinarios." }]);
         setIsTyping(false);
      }
  };

  // 🔥 ACÁ ESTÁ LA CALCULADORA QUE FALTABA (Intacta) 🔥
  const handleCalculateMacros = () => {
      const weight = Number(checkin.weight);
      if (!weight || weight < 30) return alert("Por favor, registre su peso corporal válido en el Check-in (Pestaña 'Control SNC') antes de calcular los macros.");

      let multiplier = 22; 
      if (activityLevel === "ligero") multiplier = 26;
      if (activityLevel === "moderado") multiplier = 30;
      if (activityLevel === "intenso") multiplier = 35;

      let tdee = weight * multiplier;
      
      if (dietGoal === "volumen") tdee += 300;
      if (dietGoal === "deficit") tdee -= 400;

      const protein = Math.round(weight * 2.2);
      const fats = Math.round(weight * 0.9);
      const caloriesFromProteinAndFats = (protein * 4) + (fats * 9);
      const remainingCals = tdee - caloriesFromProteinAndFats;
      const carbs = Math.max(0, Math.round(remainingCals / 4));
      
      const water = (weight * 0.04).toFixed(1);

      setCalculatedMacros({
          cals: Math.round(tdee),
          prot: protein,
          fats: fats,
          carbs: carbs,
          water: water
      });
  };

  const handleQuickChefRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      const input = (e.target as HTMLFormElement).elements.namedItem('chatInput') as HTMLInputElement;
      const text = input.value;
      if (!text.trim()) return alert("Por favor, detalle los ingredientes de su inventario.");
      
      setIsTyping(true);
      
      let targetCals = order?.macro_calories || (calculatedMacros ? calculatedMacros.cals : "No definido");
      let targetProt = order?.macro_protein || (calculatedMacros ? calculatedMacros.prot + "g" : "Alto en proteína");
      let targetCarbs = order?.macro_carbs || (calculatedMacros ? calculatedMacros.carbs + "g" : "Moderado");
      let targetFats = order?.macro_fats || (calculatedMacros ? calculatedMacros.fats + "g" : "Moderado");
      let targetWater = order?.macro_water || (calculatedMacros ? calculatedMacros.water + " L" : "3 Litros");

      const macroContext = `OBJETIVO ESTRICTO DE MACRONUTRIENTES DIARIOS: Calorías: ${targetCals}, Proteína: ${targetProt}, Carbohidratos: ${targetCarbs}, Grasas: ${targetFats}. Hidratación Mínima: ${targetWater}.`;

      const promptFinal = `Actúa como un Nutricionista Deportivo de Élite de la academia Tujague Strength.
      Ingredientes disponibles en mi cocina: ${text}.\n\n${macroContext}\n\n
      REGLAS: Diseña 4 comidas (Desayuno, Almuerzo, Pre-Entreno, Cena). Muestra GRAMOS EXACTOS. Usa saltos de línea y viñetas sin asteriscos.`;

      const newHistory = [...chefHistory, { role: "user", content: promptFinal }];
      const displayHistory = [...chefHistory, { role: "user", content: `🥩 Generar menú de hoy con: ${text}` }];
      
      setChefHistory([...displayHistory, { role: "assistant", content: "" }]);
      setShowChefForm(false);
      input.value = ""; 

      try {
          const res = await fetch('/api/assistant/chef', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: newHistory })
          });
          
          if (!res.ok) throw new Error();

          setIsTyping(false);
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let aiResponse = "";

          while (true) {
             const { done, value } = await reader!.read();
             if (done) break;
             aiResponse += decoder.decode(value, { stream: true });
             
             setChefHistory([...displayHistory, { role: "assistant", content: aiResponse }]);
          }
      } catch (error) { 
          alert("Error en la conexión con el módulo culinario."); 
          setIsTyping(false); 
      }
  };

  const handlePanicRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!panicExercise.trim() || !panicProblem.trim()) return alert("Complete los datos requeridos para el diagnóstico.");
      setPanicLoading(true); setPanicResponse("");
      try {
          const res = await fetch('/api/chat', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'panic_button', data: { exercise: panicExercise, problem: panicProblem, medical_history: order.medical_history } })
          });
          const data = await res.json();
          if (data.result) setPanicResponse(data.result);
      } catch (error) { setPanicResponse("Error en los servidores. Proceda con una variante con mancuernas para su seguridad."); } finally { setPanicLoading(false); }
  };

  const calculatedWeight = rms[calcLift as keyof typeof rms] ? Math.round((Number(rms[calcLift as keyof typeof rms]) * calcPercent) / 100) : 0;
  
  const handleGenerateWarmup = async () => {
      if(!calculatedWeight || calculatedWeight === 0) return alert("Parámetro RM inexistente o nulo.");
      setGeneratingWarmup(true); setWarmupPlan("");
      try {
          const res = await fetch('/api/assistant/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate_warmup', data: { lift: calcLift, weight: calculatedWeight } }) });
          const data = await res.json();
          if(data.result) setWarmupPlan(data.result);
      } catch (error) { alert("Error de cálculo."); } finally { setGeneratingWarmup(false); }
  };

  const totalAbsoluto = useMemo(() => {
    return (Number(rms.squat) || 0) + (Number(rms.bench) || 0) + (Number(rms.deadlift) || 0) + (Number(rms.dips) || 0) + (Number(rms.military) || 0);
  }, [rms.squat, rms.bench, rms.deadlift, rms.dips, rms.military]);
  
  const handleAnalyzeRMs = async () => {
      if (totalAbsoluto === 0) {
          alert("Coach: No hay datos suficientes. Ingresá al menos una marca en tus RMs para que la IA pueda analizar tus proporciones.");
          return;
      }
      
      setRmAiLoading(true);
      setRmAiFeedback("");
      try {
          const res = await fetch('/api/assistant/insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: 'analyze_rms',
                  data: {
                      rms: rms,
                      body_weight: checkin.weight || order?.body_weight || "No especificado",
                      experience: order?.experience || "Intermedio",
                      total: totalAbsoluto
                  }
              })
          });
          const data = await res.json();
          if (data.result) {
              setRmAiFeedback(data.result);
          } else {
              setRmAiFeedback("Análisis Estructural Completado. Tus proporciones se encuentran dentro de los rangos seguros para tu nivel. Enfócate en mantener el déficit de fatiga bajo y continuar con la sobrecarga progresiva programada por el Coach.");
          }
      } catch (error) {
          setRmAiFeedback("Error temporal en la red neuronal biomecánica. Intente nuevamente en unos minutos.");
      } finally {
          setRmAiLoading(false);
      }
  };

  const levelInfo = useMemo(() => {
      const total = totalAbsoluto;
      if (total < 400) return { current: "Iniciado", next: "Fuerza Base", nextTarget: 400, min: 0 };
      if (total < 550) return { current: "Fuerza Base", next: "Atleta Avanzado", nextTarget: 550, min: 400 };
      if (total < 700) return { current: "Atleta Avanzado", next: "Bestia Pura", nextTarget: 700, min: 550 };
      if (total < 850) return { current: "Bestia Pura", next: "Mutación BII", nextTarget: 850, min: 700 };
      if (total < 1000) return { current: "Mutación BII", next: "Élite Mundial", nextTarget: 1000, min: 850 };
      if (total < 1150) return { current: "Élite Mundial", next: "Mito Inmortal", nextTarget: 1150, min: 1000 };
      if (total < 1300) return { current: "Mito Inmortal", next: "Dios de la Fuerza", nextTarget: 1300, min: 1150 };
      return { current: "Dios de la Fuerza", next: "Nivel Máximo Alcanzado", nextTarget: 1300, min: 1300 };
  }, [totalAbsoluto]);

  const progressPercent = useMemo(() => {
      return totalAbsoluto >= 1300 ? 100 : Math.max(0, Math.min(100, ((totalAbsoluto - levelInfo.min) / (levelInfo.nextTarget - levelInfo.min)) * 100));
  }, [totalAbsoluto, levelInfo]);

  const kgLeft = useMemo(() => {
      return totalAbsoluto >= 1300 ? 0 : levelInfo.nextTarget - totalAbsoluto;
  }, [totalAbsoluto, levelInfo]);

  const trophies = useMemo(() => [
    { id: 'bp80', category: 'Press de Banca', title: 'Fundación', desc: 'Banca 80 kg', unlocked: Number(rms.bench) >= 80, icon: '🧱' },
    { id: 'bp100', category: 'Press de Banca', title: 'Club 3 Dígitos', desc: 'Banca 100 kg', unlocked: Number(rms.bench) >= 100, icon: '💯' },
    { id: 'bp120', category: 'Press de Banca', title: 'Fuerza Sólida', desc: 'Banca 120 kg', unlocked: Number(rms.bench) >= 120, icon: '🥈' },
    { id: 'bp130', category: 'Press de Banca', title: 'Empuje Avanzado', desc: 'Banca 130 kg', unlocked: Number(rms.bench) >= 130, icon: '🥉' },
    { id: 'bp140', category: 'Press de Banca', title: 'Espalda Plateada', desc: 'Banca 140 kg', unlocked: Number(rms.bench) >= 140, icon: '🦍' },
    { id: 'bp150', category: 'Press de Banca', title: 'Pectoral de Acero', desc: 'Banca 150 kg', unlocked: Number(rms.bench) >= 150, icon: '🛡️' },
    { id: 'bp160', category: 'Press de Banca', title: 'Mutación Superior', desc: 'Banca 160 kg', unlocked: Number(rms.bench) >= 160, icon: '🦾' },
    { id: 'bp180', category: 'Press de Banca', title: 'Élite Nacional', desc: 'Banca 180 kg', unlocked: Number(rms.bench) >= 180, icon: '🏅' },
    { id: 'bp200', category: 'Press de Banca', title: 'Extraterrestre', desc: 'Banca 200 kg', unlocked: Number(rms.bench) >= 200, icon: '☄️' },
    { id: 'bp220', category: 'Press de Banca', title: 'Leyenda Viva', desc: 'Banca 220 kg', unlocked: Number(rms.bench) >= 220, icon: '👑' },
    { id: 'sq100', category: 'Sentadilla', title: 'Estructura Base', desc: 'Sentadilla 100 kg', unlocked: Number(rms.squat) >= 100, icon: '🦵' },
    { id: 'sq140', category: 'Sentadilla', title: 'Ruedas de Acero', desc: 'Sentadilla 140 kg', unlocked: Number(rms.squat) >= 140, icon: '🦿' },
    { id: 'sq160', category: 'Sentadilla', title: 'Fémur Denso', desc: 'Sentadilla 160 kg', unlocked: Number(rms.squat) >= 160, icon: '🧱' },
    { id: 'sq180', category: 'Sentadilla', title: 'Potencia Pura', desc: 'Sentadilla 180 kg', unlocked: Number(rms.squat) >= 180, icon: '🚂' },
    { id: 'sq200', category: 'Sentadilla', title: 'Fémur Intacto', desc: 'Sentadilla 200 kg', unlocked: Number(rms.squat) >= 200, icon: '🪵' },
    { id: 'sq220', category: 'Sentadilla', title: 'Gravedad Vencida', desc: 'Sentadilla 220 kg', unlocked: Number(rms.squat) >= 220, icon: '🌌' },
    { id: 'sq240', category: 'Sentadilla', title: 'Motor BII', desc: 'Sentadilla 240 kg', unlocked: Number(rms.squat) >= 240, icon: '⚙️' },
    { id: 'sq260', category: 'Sentadilla', title: 'Anomalía Gravitacional', desc: 'Sentadilla 260 kg', unlocked: Number(rms.squat) >= 260, icon: '🧬' },
    { id: 'sq280', category: 'Sentadilla', title: 'Bastión de Titán', desc: 'Sentadilla 280 kg', unlocked: Number(rms.squat) >= 280, icon: '🏛️' },
    { id: 'sq300', category: 'Sentadilla', title: 'El Coloso', desc: 'Sentadilla 300 kg', unlocked: Number(rms.squat) >= 300, icon: '🏔️' },
    { id: 'dl140', category: 'Peso Muerto', title: 'Primer Tirón', desc: 'Peso Muerto 140 kg', unlocked: Number(rms.deadlift) >= 140, icon: '⚓' },
    { id: 'dl180', category: 'Peso Muerto', title: 'Agarre Firme', desc: 'Peso Muerto 180 kg', unlocked: Number(rms.deadlift) >= 180, icon: '🪝' },
    { id: 'dl200', category: 'Peso Muerto', title: 'Cadena Posterior', desc: 'Peso Muerto 200 kg', unlocked: Number(rms.deadlift) >= 200, icon: '⛓️' },
    { id: 'dl220', category: 'Peso Muerto', title: 'Arranca Troncos', desc: 'Peso Muerto 220 kg', unlocked: Number(rms.deadlift) >= 220, icon: '🌲' },
    { id: 'dl240', category: 'Peso Muerto', title: 'Tensión Absoluta', desc: 'Peso Muerto 240 kg', unlocked: Number(rms.deadlift) >= 240, icon: '⚡' },
    { id: 'dl260', category: 'Peso Muerto', title: 'Leviatán', desc: 'Peso Muerto 260 kg', unlocked: Number(rms.deadlift) >= 260, icon: '🐉' },
    { id: 'dl280', category: 'Peso Muerto', title: 'Rompedor de Suelos', desc: 'Peso Muerto 280 kg', unlocked: Number(rms.deadlift) >= 280, icon: '🌋' },
    { id: 'dl300', category: 'Peso Muerto', title: 'Monstruo de la Bisagra', desc: 'Peso Muerto 300 kg', unlocked: Number(rms.deadlift) >= 300, icon: '👹' },
    { id: 'dl320', category: 'Peso Muerto', title: 'Dios del Peso Muerto', desc: 'Peso Muerto 320 kg', unlocked: Number(rms.deadlift) >= 320, icon: '🔱' },
    { id: 'dl340', category: 'Peso Muerto', title: 'Rey del Inframundo', desc: 'Peso Muerto 340 kg', unlocked: Number(rms.deadlift) >= 340, icon: '👑' },
    { id: 'ohp60', category: 'Press Militar', title: 'Hombros Base', desc: 'Militar 60 kg', unlocked: Number(rms.military) >= 60, icon: '🛠️' },
    { id: 'ohp80', category: 'Press Militar', title: 'Deltoides de Cañón', desc: 'Militar 80 kg', unlocked: Number(rms.military) >= 80, icon: '💣' },
    { id: 'ohp90', category: 'Press Militar', title: 'Prensa de Hierro', desc: 'Militar 90 kg', unlocked: Number(rms.military) >= 90, icon: '🦾' },
    { id: 'ohp100', category: 'Press Militar', title: 'Club de los 100', desc: 'Militar 100 kg', unlocked: Number(rms.military) >= 100, icon: '🎯' },
    { id: 'ohp110', category: 'Press Militar', title: 'Foco Estricto', desc: 'Militar 110 kg', unlocked: Number(rms.military) >= 110, icon: '👁️' },
    { id: 'ohp120', category: 'Press Militar', title: 'Hombros de Atlas', desc: 'Militar 120 kg', unlocked: Number(rms.military) >= 120, icon: '🗿' },
    { id: 'ohp130', category: 'Press Militar', title: 'Fuerza Vertical', desc: 'Militar 130 kg', unlocked: Number(rms.military) >= 130, icon: '🚀' },
    { id: 'ohp140', category: 'Press Militar', title: 'Pilar Celestial', desc: 'Militar 140 kg', unlocked: Number(rms.military) >= 140, icon: '🏛️' },
    { id: 'dips20', category: 'Fondos Lastrados', title: 'Lastre Inicial', desc: 'Fondos +20 kg', unlocked: Number(rms.dips) >= 20, icon: '🔗' },
    { id: 'dips40', category: 'Fondos Lastrados', title: 'Cadena Pesada', desc: 'Fondos +40 kg', unlocked: Number(rms.dips) >= 40, icon: '⛓️' },
    { id: 'dips60', category: 'Fondos Lastrados', title: 'Tríceps Blindado', desc: 'Fondos +60 kg', unlocked: Number(rms.dips) >= 60, icon: '🛡️' },
    { id: 'dips80', category: 'Fondos Lastrados', title: 'Gravedad Cero', desc: 'Fondos +80 kg', unlocked: Number(rms.dips) >= 80, icon: '🚀' },
    { id: 'dips100', category: 'Fondos Lastrados', title: 'Anomalía Física', desc: 'Fondos +100 kg', unlocked: Number(rms.dips) >= 100, icon: '🛸' },
    { id: 'dips120', category: 'Fondos Lastrados', title: 'Carga Descomunal', desc: 'Fondos +120 kg', unlocked: Number(rms.dips) >= 120, icon: '🌋' },
    { id: 'dips140', category: 'Fondos Lastrados', title: 'Mutante de Paralelas', desc: 'Fondos +140 kg', unlocked: Number(rms.dips) >= 140, icon: '🧬' },
    { id: 'tot400', category: 'Fuerza Absoluta (Total)', title: 'El Despertar', desc: 'Total 400 kg', unlocked: totalAbsoluto >= 400, icon: '🔥' },
    { id: 'tot550', category: 'Fuerza Absoluta (Total)', title: 'Atleta Avanzado', desc: 'Total 550 kg', unlocked: totalAbsoluto >= 550, icon: '⚔️' },
    { id: 'tot700', category: 'Fuerza Absoluta (Total)', title: 'Bestia Pura', desc: 'Total 700 kg', unlocked: totalAbsoluto >= 700, icon: '🩸' },
    { id: 'tot850', category: 'Fuerza Absoluta (Total)', title: 'Mutación BII', desc: 'Total 850 kg', unlocked: totalAbsoluto >= 850, icon: '🧬' },
    { id: 'tot1000', category: 'Fuerza Absoluta (Total)', title: 'Élite Mundial', desc: 'Total 1000 kg', unlocked: totalAbsoluto >= 1000, icon: '🌐' },
    { id: 'tot1150', category: 'Fuerza Absoluta (Total)', title: 'Mito Inmortal', desc: 'Total 1150 kg', unlocked: totalAbsoluto >= 1150, icon: '⚡' },
    { id: 'tot1300', category: 'Fuerza Absoluta (Total)', title: 'Dios de la Fuerza', desc: 'Total 1300 kg', unlocked: totalAbsoluto >= 1300, icon: '👑' },
  ], [rms.bench, rms.squat, rms.deadlift, rms.military, rms.dips, totalAbsoluto]);

  const groupedTrophies = useMemo(() => {
    return trophies.reduce((acc, trophy) => {
      if (!acc[trophy.category]) acc[trophy.category] = [];
      acc[trophy.category].push(trophy);
      return acc;
    }, {} as Record<string, typeof trophies>);
  }, [trophies]);

  const shareTrophies = async () => {
      const unlockedCount = trophies.filter(t => t.unlocked).length;
      const text = `Registro de rendimiento: He alcanzado los ${totalAbsoluto}kg de Fuerza Absoluta y desbloqueado ${unlockedCount} medallas de élite en el protocolo BII-Vintage de @tujague.strenght. La consistencia es la clave.`;
      if (navigator.share) { try { await navigator.share({ title: 'Mis Marcas BII-Vintage', text: text }); } catch (err) {} } 
      else { navigator.clipboard.writeText(text); alert("Datos copiados al portapapeles con éxito."); }
  };

  const days = [{ id: 'd1', label: 'Día 1' }, { id: 'd2', label: 'Día 2' }, { id: 'd3', label: 'Día 3' }, { id: 'd4', label: 'Día 4' }, { id: 'd5', label: 'Día 5' }, { id: 'd6', label: 'Día 6' }, { id: 'd7', label: 'Día 7' }];
  const hasRoutines = order ? days.some(day => order[`routine_${day.id}`]) : false;

  const mainLifts = [{ id: 'squat', label: 'Sentadilla' }, { id: 'bench', label: 'Press de Banca' }, { id: 'deadlift', label: 'Peso Muerto' }, { id: 'dips', label: 'Fondos en Paralela' }, { id: 'military', label: 'Press Militar' }];
  const extraLifts = [{ id: 'extra1', label: 'Registro Libre 1' }, { id: 'extra2', label: 'Registro Libre 2' }];

  const chartData = [
    { name: 'Mes 1', Sentadilla: Number(rms.squat) ? Math.round(Number(rms.squat) * 0.85) : 0, Banca: Number(rms.bench) ? Math.round(Number(rms.bench) * 0.85) : 0, PesoMuerto: Number(rms.deadlift) ? Math.round(Number(rms.deadlift) * 0.85) : 0, Fondos: Number(rms.dips) ? Math.round(Number(rms.dips) * 0.85) : 0 },
    { name: 'Mes 2', Sentadilla: Number(rms.squat) ? Math.round(Number(rms.squat) * 0.90) : 0, Banca: Number(rms.bench) ? Math.round(Number(rms.bench) * 0.90) : 0, PesoMuerto: Number(rms.deadlift) ? Math.round(Number(rms.deadlift) * 0.90) : 0, Fondos: Number(rms.dips) ? Math.round(Number(rms.dips) * 0.90) : 0 },
    { name: 'Mes 3', Sentadilla: Number(rms.squat) ? Math.round(Number(rms.squat) * 0.95) : 0, Banca: Number(rms.bench) ? Math.round(Number(rms.bench) * 0.95) : 0, PesoMuerto: Number(rms.deadlift) ? Math.round(Number(rms.deadlift) * 0.95) : 0, Fondos: Number(rms.dips) ? Math.round(Number(rms.dips) * 0.95) : 0 },
    { name: 'Actual', Sentadilla: Number(rms.squat) || 0, Banca: Number(rms.bench) || 0, PesoMuerto: Number(rms.deadlift) || 0, Fondos: Number(rms.dips) || 0 },
  ];

  const adherenceScore = useMemo(() => {
      if (!checkinHistory || checkinHistory.length === 0) return 0;
      return Math.min(100, Math.round(checkinHistory.length * 15 + 25)); 
  }, [checkinHistory]);

  let adherenceColor = "text-red-500";
  let adherenceStroke = "stroke-red-500";
  let adherenceBg = "bg-red-500/10";
  let adherenceLabel = "Falta Compromiso";
  
  if (adherenceScore >= 80) {
      adherenceColor = "text-emerald-500";
      adherenceStroke = "stroke-emerald-500";
      adherenceBg = "bg-emerald-500/10";
      adherenceLabel = "Atleta Disciplinado";
  } else if (adherenceScore >= 50) {
      adherenceColor = "text-yellow-500";
      adherenceStroke = "stroke-yellow-500";
      adherenceBg = "bg-yellow-500/10";
      adherenceLabel = "Riesgo de Estancamiento";
  }

// 🔥 CEREBRO DE NOTIFICACIONES INTELIGENTES + MENSAJES DEL COACH 🔥
  const unreadNotifications = useMemo(() => {
      const notifs = [];
      
      // 1. Alertas Automáticas del Sistema
      if (daysLeft !== null && daysLeft <= 7) {
          notifs.push({ id: 'exp', title: 'Mentoría por Vencer', desc: `Te quedan ${daysLeft} días de acceso a la plataforma.`, icon: '⚠️' });
      }
      if (totalAbsoluto === 0 && !isStaticPlan) {
          notifs.push({ id: 'rm', title: 'Falta Calibración', desc: 'Ingresá tus 1RM en la pestaña Evolución para calibrar la IA.', icon: '⚖️' });
      }
      if (hasNewBiiRoutine) {
          notifs.push({ id: 'rutina', title: 'Nueva Rutina Activa', desc: 'El Coach actualizó tu hoja de ruta.', icon: '⚡' });
      }
      if (checkinHistory.length === 0 && !isStaticPlan) {
          notifs.push({ id: 'snc', title: 'Auditoría SNC', desc: 'Completá tu primer Check-in diario en Inicio.', icon: '🧬' });
      }

      // 2. Mensajes Reales desde Supabase (Los que vos mandás)
      dbNotifications.forEach(msg => {
          notifs.push({ 
              id: msg.id, 
              title: msg.title, 
              desc: msg.message, 
              icon: msg.is_global ? '📢' : '💬' 
          });
      });

      // 🔥 3. FILTRAMOS LAS QUE EL ATLETA YA "OCULTÓ" (Tachito de basura) 🔥
      const visibleNotifs = notifs.filter(n => !hiddenNotifs.includes(n.id));
      
      // 4. Si después de limpiar quedó vacío, mostramos el "Todo OK"
      if(visibleNotifs.length === 0) {
          visibleNotifs.push({ id: 'ok', title: 'Todo al día', desc: 'No tienes tareas pendientes ni mensajes nuevos. ¡A la barra!', icon: '✅' });
      }
      
      return visibleNotifs;
  }, [daysLeft, totalAbsoluto, isStaticPlan, hasNewBiiRoutine, checkinHistory, dbNotifications, hiddenNotifs]);

// ─── ESQUELETO DE CARGA (CORREGIDO PARA MODO CLEAN) ───
  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-12 flex flex-col gap-6 md:gap-8 animate-pulse font-sans">
      
      {/* 🔥 ACÁ AGREGAMOS EL TEXTO QUE PEDISTE 🔥 */}
      <div className="text-center py-4">
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Sincronizando Bitácora Neural...</p>
      </div>

      {/* Barritas de carga: cambiamos de negro a gris ultra-claro */}
      <div className="w-full h-32 md:h-40 bg-white border border-gray-100 rounded-[2rem] shadow-sm"></div>
      <div className="w-full h-16 md:h-20 bg-gray-50 border border-gray-100 rounded-2xl shadow-inner"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="w-full h-[60vh] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm md:col-span-2"></div>
        <div className="w-full h-[60vh] bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner"></div>
      </div>
    </div>
  );

  // VISTA SIN ORDEN PERO CON PRODUCTOS NUEVOS
  if (!order) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_60%)] pointer-events-none -mr-20 -mt-20 transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none -ml-20 -mb-20 transform-gpu"></div>

        <div className="relative z-10 bg-[#0a0a0c] border border-zinc-800/80 p-10 md:p-16 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-3xl w-full backdrop-blur-xl">
           <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block shadow-inner">
             Bóveda de Atleta
           </span>
           <h2 className="text-4xl md:text-6xl font-black italic mb-8 uppercase tracking-tighter drop-shadow-md">
             Mis <span className="text-emerald-500">Recursos</span>
           </h2>

           {myProducts.length > 0 ? (
             <>
               <p className="text-zinc-400 mb-12 max-w-md mx-auto text-sm md:text-base font-medium">
                 Accedé a tus estructuras y mesociclos adquiridos. Listos para descargar y aplicar en tu próximo entrenamiento.
               </p>
               <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                 
                 {myProducts.includes("calculadora-volumen-basura") && (
                   <Link href="/dashboard/producto/calculadora-volumen-basura" className="w-full sm:w-auto bg-gradient-to-br from-amber-950/40 to-black border border-amber-500/50 hover:border-amber-400 text-white px-10 py-8 rounded-3xl transition-all duration-300 shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:shadow-[0_0_60px_rgba(245,158,11,0.3)] hover:-translate-y-2 group flex flex-col items-center justify-center gap-3">
                     <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-md mb-2 block">🧮</span>
                     <span className="font-black text-sm md:text-base uppercase tracking-widest text-white text-center">Junk Volume<br/>Killer</span>
                     <span className="text-[10px] text-amber-400 uppercase font-black tracking-[0.2em] mt-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Iniciar Software →</span>
                   </Link>
                 )}
                 {myProducts.includes("mesociclo-fuerza-4-semanas") && (
                   <Link href="/dashboard/producto/mesociclo-fuerza-4-semanas" className="w-full sm:w-auto bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/50 hover:border-emerald-400 text-white px-10 py-8 rounded-3xl transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.3)] hover:-translate-y-2 group flex flex-col items-center justify-center gap-3">
                     <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-md mb-2 block">🦍</span>
                     <span className="font-black text-sm md:text-base uppercase tracking-widest text-white">Mesociclo de Fuerza</span>
                     <span className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mt-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Descargar PDF oficial →</span>
                   </Link>
                 )}

                 {myProducts.includes("mesociclo-hipertrofia-4-semanas") && (
                   <Link href="/dashboard/producto/mesociclo-hipertrofia-4-semanas" className="w-full sm:w-auto bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/50 hover:border-emerald-400 text-white px-10 py-8 rounded-3xl transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.3)] hover:-translate-y-2 group flex flex-col items-center justify-center gap-3">
                     <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-md mb-2 block">🧬</span>
                     <span className="font-black text-sm md:text-base uppercase tracking-widest text-white">Mutación Hipertrófica</span>
                     <span className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mt-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Descargar PDF oficial →</span>
                   </Link>
                 )}
               </div>
             </>
           ) : (
             <div className="mb-12 bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] max-w-lg mx-auto shadow-inner">
               <span className="text-5xl block mb-4 animate-bounce">⏳</span>
               <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Aguardando Confirmación</h3>
               <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                 Si acabás de pagar con Mercado Pago, el sistema está validando la transacción. <strong className="text-emerald-400">Actualizá la página en unos segundos.</strong><br/><br/>
                 Si pagaste por Transferencia, el Coach habilitará tu acceso en breve.
               </p>
             </div>
           )}
           <button onClick={handleLogout} className="border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-900/50 px-8 py-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-colors w-full sm:w-auto">
             Cerrar Sesión
           </button>
        </div>
      </div>
    );
  }

// ONBOARDING VIP: MULTI-STEP CON PUENTE A WHATSAPP
  if (!isOnboarded && !isStaticPlan) {
    return (
      <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center p-4 md:p-12 font-sans selection:bg-amber-500 selection:text-black overflow-y-auto">
        <div className="w-full max-w-7xl mb-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-[#0a0a0c] hover:bg-zinc-900 px-4 py-2 rounded-xl border border-white/5 text-xs font-black uppercase tracking-widest shadow-md">
               <span className="text-sm">🏠</span> Volver a la Web
            </Link>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Cerrar Sesión</button>
        </div>

        <div className="max-w-4xl w-full bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_80px_rgba(245,158,11,0.05)] relative overflow-hidden my-auto">
           {/* BARRA DE PROGRESO (Oculta en el paso 5) */}
           {onboardingStep < 5 && (
             <div className="mb-10">
               <div className="flex justify-between mb-2">
                 {[1, 2, 3, 4].map(step => (
                   <div key={step} className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${onboardingStep >= step ? 'text-amber-500' : 'text-zinc-600'}`}>Fase {step}</div>
                 ))}
               </div>
               <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden flex">
                 <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(onboardingStep / 4) * 100}%` }}></div>
               </div>
             </div>
           )}

           <form onSubmit={handleSaveOnboarding} className="relative z-10">
             
              {/* PASO 1: BIOMETRÍA */}
              {onboardingStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 text-white">Escaneo <span className="text-amber-500">Biométrico</span></h2>
                  <p className="text-zinc-400 font-medium text-sm mb-8">Estructura base para la red neuronal.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Edad</label>
                          <input required type="number" value={onboardingData.age} onChange={(e) => setOnboardingData({...onboardingData, age: e.target.value})} placeholder="Ej: 25" className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500 transition-colors" />
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Peso Corporal (KG)</label>
                          <input required type="number" step="0.1" value={onboardingData.body_weight} onChange={(e) => setOnboardingData({...onboardingData, body_weight: e.target.value})} placeholder="Ej: 80.5" className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500 transition-colors" />
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Estatura (CM)</label>
                          <input required type="number" value={onboardingData.height} onChange={(e) => setOnboardingData({...onboardingData, height: e.target.value})} placeholder="Ej: 178" className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500 transition-colors" />
                      </div>
                  </div>
                  <button type="button" onClick={() => { if(onboardingData.age && onboardingData.body_weight && onboardingData.height) setOnboardingStep(2); else alert("Completá los datos"); }} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Siguiente Fase ➔</button>
                </div>
              )}

              {/* PASO 2: LOGÍSTICA */}
              {onboardingStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 text-white">Variables <span className="text-amber-500">Logísticas</span></h2>
                  <p className="text-zinc-400 font-medium text-sm mb-8">Para estructurar el microciclo a tu estilo de vida.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Objetivo Principal</label>
                          <select value={onboardingData.goal} onChange={(e) => setOnboardingData({...onboardingData, goal: e.target.value})} className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500">
                              <option value="fuerza">Fuerza Absoluta (Powerlifting)</option>
                              <option value="hipertrofia">Hipertrofia Estética</option>
                              <option value="hibrido">Híbrido (Powerbuilding)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Experiencia</label>
                          <select value={onboardingData.experience} onChange={(e) => setOnboardingData({...onboardingData, experience: e.target.value})} className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500">
                              <option value="principiante">Principiante (Menos de 1 año)</option>
                              <option value="intermedio">Intermedio (1 a 3 años)</option>
                              <option value="avanzado">Avanzado (+3 años)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Días Disponibles</label>
                          <select value={onboardingData.training_days} onChange={(e) => setOnboardingData({...onboardingData, training_days: e.target.value})} className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500">
                              <option value="3">3 Días</option>
                              <option value="4">4 Días (Recomendado)</option>
                              <option value="5">5 Días</option>
                              <option value="6">6 Días</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Equipamiento</label>
                          <select value={onboardingData.equipment} onChange={(e) => setOnboardingData({...onboardingData, equipment: e.target.value})} className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-amber-500">
                              <option value="gimnasio">Gym Comercial (Poleas, máquinas)</option>
                              <option value="home_gym">Home Gym (Solo Barra y Rack)</option>
                          </select>
                      </div>
                  </div>
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setOnboardingStep(1)} className="w-1/3 bg-zinc-900 hover:bg-zinc-800 text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Atrás</button>
                     <button type="button" onClick={() => setOnboardingStep(3)} className="w-2/3 bg-amber-500 hover:bg-amber-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Siguiente Fase ➔</button>
                  </div>
                </div>
              )}

              {/* PASO 3: MAPEO ARTICULAR */}
              {onboardingStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 text-white">Mapeo <span className="text-red-500">Articular</span></h2>
                  <p className="text-zinc-400 font-medium text-sm mb-6">Identificá zonas de dolor crónico para prevenir sobrecargas.</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                     {["Rodillas", "Lumbares", "Hombros", "Codos", "Muñecas", "Caderas"].map(joint => (
                        <button 
                           key={joint} type="button" onClick={() => toggleJoint(joint)}
                           className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${jointIssues.includes(joint) ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#050505] border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                        >
                           {joint} {jointIssues.includes(joint) && "⚠️"}
                        </button>
                     ))}
                  </div>

                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Detalles adicionales (Opcional)</label>
                  <textarea 
                     value={onboardingData.medical_history} onChange={(e) => setOnboardingData({...onboardingData, medical_history: e.target.value})}
                     placeholder="Ej: Tengo hernia discal L4-L5 diagnosticada hace 2 años..."
                     className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-red-500 transition-colors h-24 resize-none mb-8"
                  />

                  <div className="flex gap-4">
                     <button type="button" onClick={() => setOnboardingStep(2)} className="w-1/3 bg-zinc-900 hover:bg-zinc-800 text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Atrás</button>
                     <button type="button" onClick={() => setOnboardingStep(4)} className="w-2/3 bg-amber-500 hover:bg-amber-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Siguiente Fase ➔</button>
                  </div>
                </div>
              )}

              {/* PASO 4: CALIBRACIÓN NEURAL (RMS) */}
              {onboardingStep === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 text-white">Calibración <span className="text-amber-500">Neural</span></h2>
                        <p className="text-zinc-400 font-medium text-sm">Tus máximos a 1 Repetición (1RM) en KG.</p>
                     </div>
                     <label className="flex items-center gap-2 cursor-pointer bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-700 hover:border-amber-500 transition-all">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Soy Principiante Total</span>
                        <input type="checkbox" checked={isBeginner} onChange={() => setIsBeginner(!isBeginner)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                     </label>
                  </div>

                  {!isBeginner ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                          {['squat', 'bench', 'deadlift', 'military', 'dips'].map(lift => (
                             <div key={lift} className={lift === 'deadlift' ? "col-span-2 md:col-span-1" : ""}>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 text-center font-bold">
                                    {lift === 'squat' ? 'Sentadilla' : lift === 'bench' ? 'Banca' : lift === 'deadlift' ? 'P. Muerto' : lift === 'military' ? 'Militar' : 'Fondos'}
                                </label>
                                <input required={!isBeginner} type="number" placeholder="0" value={(onboardingData as any)[`rm_${lift}`] || ""} onChange={e => setOnboardingData({...onboardingData, [`rm_${lift}`]: e.target.value})} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-center text-white font-black text-2xl outline-none focus:border-amber-500 transition-colors"/>
                             </div>
                          ))}
                      </div>
                  ) : (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-8 rounded-2xl text-center mb-8">
                          <span className="text-3xl mb-3 block">🛡️</span>
                          <p className="text-amber-400 font-bold text-sm">El sistema construirá tu fuerza base desde cero. No necesitas ingresar RMs.</p>
                      </div>
                  )}

                  <div className="flex gap-4">
                     <button type="button" onClick={() => setOnboardingStep(3)} className="w-1/3 bg-zinc-900 hover:bg-zinc-800 text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Atrás</button>
                     <button type="submit" disabled={savingOnboarding} className="w-2/3 bg-gradient-to-r from-amber-500 to-amber-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                        {savingOnboarding ? 'Sincronizando...' : 'GUARDAR AUDITORÍA 💾'}
                     </button>
                  </div>
                </div>
              )}

              {/* PASO 5: PUENTE AL WHATSAPP (ÉXITO) */}
              {onboardingStep === 5 && (
                <div className="text-center animate-in zoom-in duration-500 py-8">
                  <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">✅</div>
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-white">¡Diagnóstico <span className="text-emerald-500">Procesado!</span></h2>
                  <p className="text-zinc-300 font-medium text-sm md:text-base max-w-lg mx-auto mb-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                     Tus datos han sido encriptados en la base del Coach. <br/><br/>
                     Para finalizar tu alta en la Mentoría Élite, envíame por WhatsApp tus <strong className="text-emerald-400">fotos de estado físico actual (frente, perfil y espalda)</strong>.
                  </p>

                  <div className="flex flex-col gap-4 max-w-sm mx-auto">
                     <a 
                        href={`https://wa.me/5491123021760?text=${encodeURIComponent(`¡Coach! Acabo de completar mi Auditoría Clínica en la App. Te paso mis fotos de estado físico actual para calibrar el plan:`)}`} 
                        target="_blank"
                        onClick={() => setIsOnboarded(true)} // Lo deja pasar al panel al hacer clic
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(37,211,102,0.4)] flex justify-center items-center gap-2"
                     >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                        MANDAR FOTOS POR WHATSAPP
                     </a>
                     <button type="button" onClick={() => setIsOnboarded(true)} className="bg-transparent border border-zinc-700 hover:bg-zinc-900 text-zinc-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Omitir y Entrar al Panel
                     </button>
                  </div>
                </div>
              )}

           </form>
        </div>
      </main>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-red-500 selection:text-white">
        <div className="w-24 h-24 bg-red-900/20 border border-red-500/50 rounded-full flex items-center justify-center text-4xl mb-8 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            ⏳
        </div>
        <h2 className="text-3xl md:text-5xl font-black italic mb-4 uppercase tracking-tighter drop-shadow-md">
            PERÍODO <span className="text-red-500">FINALIZADO</span>
        </h2>
        <p className="text-zinc-400 mb-10 max-w-md mx-auto text-sm md:text-base font-medium leading-relaxed">
            Tu tiempo de acceso ha concluido. El diagnóstico y la estructura generada quedan blindados en la base de datos del Coach. 
            <br /><br />
            Para no perder el progreso y continuar tu evolución, solicitá admisión a la Mentoría Élite.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <a href={whatsappUpsellUrl} target="_blank" className="flex-1 bg-amber-500 text-black px-8 py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center">
                RENOVAR MENTORÍA ÉLITE
            </a>
            <button onClick={handleLogout} className="border border-zinc-700 text-zinc-300 px-8 py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-zinc-800 transition-colors">
                Cerrar Sesión
            </button>
        </div>
      </div>
    );
  }

  const balance = Number(order?.wallet_balance || 0);
  const precioPlanAtleta = Number(order?.amount_ars) > 0 ? Number(order?.amount_ars) : 50000;
  const affiliateProgress = Math.min(100, (balance / precioPlanAtleta) * 100);
  const isFreeMonthSecured = balance >= precioPlanAtleta;

 return (
<div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-4 pt-8 pb-28 md:p-12 font-sans selection:bg-emerald-500 selection:text-white">     
<header className="flex flex-col mb-6 gap-4 pt-2">
{/* Barra superior: Botones a la derecha */}
        <div className="flex justify-between items-center w-full">
           <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={handleLogout} title="Cerrar Sesión">
             {/* Acá pusimos el CERRAR SESIÓN (Provisionalmente en la foto de perfil) */}
             <span className="text-xs">👋</span>
           </div>
           <div className="flex gap-3">
              {/* BOTÓN ASISTENTE (TUJAGUE IA) */}
              <button onClick={() => setShowAssistant(true)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors active:scale-95">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.373 5.48.432.415.545 1.05.295 1.583a8.966 8.966 0 01-1.393 2.164 11.236 11.236 0 002.83-.872c.45-.205.975-.121 1.343.208C9.52 19.866 10.725 20.25 12 20.25z" /></svg>
              </button>
              
{/* 🔥 CENTRO DE ALERTAS PREMIUM (CAMPANA INTERACTIVA) 🔥 */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-500 transition-colors relative active:scale-95">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                   {/* Puntito rojo real: Solo se muestra si hay notificaciones que no sean "Todo OK" */}
                   {unreadNotifications.filter(n => n.id !== 'ok').length > 0 && (
                     <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                   )}
                </button>

{/* PANEL DESPLEGABLE (CLEAN ÉLITE - BLINDADO PARA TEXTOS LARGOS) */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-[60] bg-black/5 md:bg-transparent" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute top-12 right-0 w-[300px] md:w-80 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-[70] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      
                      <div className="p-4 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <h4 className="font-black italic uppercase text-black tracking-tight">Centro de <span className="text-amber-500">Alertas</span></h4>
                           {/* Solo mostramos el badge si hay algo que no sea el "ok" */}
                           {unreadNotifications.filter(n => n.id !== 'ok').length > 0 && (
                               <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-amber-200">
                                   {unreadNotifications.filter(n => n.id !== 'ok').length} Nuevas
                               </span>
                           )}
                        </div>
                        
                        {/* 🔥 BOTÓN LIMPIAR ALERTAS 🔥 */}
                        {unreadNotifications.filter(n => n.id !== 'ok').length > 0 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Evita que se cierre el panel
                                    // Guardamos TODOS los IDs actuales en la lista de "Ocultos"
                                    setHiddenNotifs([...hiddenNotifs, ...unreadNotifications.map(n => n.id)]);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center p-1 bg-white border border-gray-200 rounded-md shadow-sm active:scale-95"
                                title="Marcar todas como leídas"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                        )}
                      </div>

                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {unreadNotifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start cursor-default">
                            <div className="text-2xl mt-1 shrink-0">{notif.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] md:text-xs font-bold text-black uppercase tracking-widest mb-1">{notif.title}</p>
                              <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed break-words overflow-wrap-break-word whitespace-pre-line hyphens-auto">
                                {notif.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
           </div>
        </div>

        {/* LOGO CENTRAL */}
        <div className="flex justify-center my-2">
           <div className="text-7xl font-black italic text-black tracking-tighter drop-shadow-sm">
              T
           </div>
        </div>

        {/* SALUDO (Buenos días, Nombre) */}
        <div className="mt-4">
          <h1 className="text-2xl font-medium text-gray-600">
            Buenos días, <span className="font-bold text-black">{order?.customer_name?.split(" ")[0] || "Atleta"}</span>
          </h1>
        </div>
      </header>

{/* 🔥 ACÁ INYECTAMOS LA TRAMPA PARA RECOLECTAR EL TOKEN 🔥 */}
      <div className="mt-6">
        <PushNotificationManager />
      </div>

      {/* USO DE BILLETERA EN ALERTA DE RENOVACIÓN */}
      {daysLeft !== null && daysLeft <= 3 && !isStaticPlan && (
         <div className="mb-10 bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/50 p-6 md:p-8 rounded-[2rem] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
               <span className="text-5xl md:text-6xl animate-bounce">⚠️</span>
               <div>
                  <h3 className="text-white font-black italic text-xl md:text-2xl tracking-tighter uppercase">Mentoría próxima a caducar ({daysLeft} días)</h3>
                  <p className="text-red-200/80 text-sm md:text-base font-medium mt-1">Evite interrupciones en su progreso y agende la renovación.</p>
               </div>
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-auto">
               <a 
                  href={whatsappUpsellUrl} target="_blank"
                  className="w-full lg:w-auto bg-red-500 hover:bg-red-400 text-black px-10 py-5 rounded-2xl font-black tracking-[0.2em] text-xs md:text-sm uppercase transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] whitespace-nowrap active:scale-95 flex items-center justify-center"
               >
                  GESTIONAR RENOVACIÓN ÉLITE
               </a>
            </div>
         </div>
      )}

      {/* 🔥 FASE 1: BOTTOM NAVIGATION BAR ESTILO APP NATIVA 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-zinc-200 pb-5 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-none md:shadow-none md:pb-10 md:pt-0">
        <div className="flex justify-around items-center h-[60px] px-2 max-w-md mx-auto md:max-w-full md:justify-start md:gap-6">
          
          {/* 1. INICIO (Mapeado a Checkin/SNC) */}
          <button onClick={() => setActiveTab("checkin")} className="flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95">
            <svg className={`w-6 h-6 transition-colors ${activeTab === 'checkin' ? 'text-black' : 'text-zinc-400'}`} fill={activeTab === 'checkin' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'checkin' ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`text-[10px] tracking-wide ${activeTab === 'checkin' ? 'text-black font-bold' : 'text-zinc-400 font-medium'}`}>Inicio</span>
          </button>

          {/* 2. AGENDA (Mapeado a Rutina) */}
          <button onClick={() => setActiveTab("rutina")} className="flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 relative">
            {hasNewBiiRoutine && <span className="absolute top-0 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>}
            <svg className={`w-6 h-6 transition-colors ${activeTab === 'rutina' ? 'text-black' : 'text-zinc-400'}`} fill={activeTab === 'rutina' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'rutina' ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`text-[10px] tracking-wide ${activeTab === 'rutina' ? 'text-black font-bold' : 'text-zinc-400 font-medium'}`}>Agenda</span>
          </button>

          {/* 3. VIDEOS (Unificamos Videos y Bóveda) */}
          <button onClick={() => setActiveTab("videos")} className="flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 relative">
            {!canViewVideos && <span className="absolute top-0 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            <svg className={`w-6 h-6 transition-colors ${activeTab === 'videos' ? 'text-black' : 'text-zinc-400'}`} fill={activeTab === 'videos' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'videos' ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className={`text-[10px] tracking-wide ${activeTab === 'videos' ? 'text-black font-bold' : 'text-zinc-400 font-medium'}`}>Vídeos</span>
          </button>

          {/* 4. EVOLUCIÓN (Mapeado a RM / Progression) */}
          <button onClick={() => setActiveTab("rm")} className="flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 relative">
            <svg className={`w-6 h-6 transition-colors ${activeTab === 'rm' ? 'text-black' : 'text-zinc-400'}`} fill={activeTab === 'rm' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'rm' ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span className={`text-[10px] tracking-wide ${activeTab === 'rm' ? 'text-black font-bold' : 'text-zinc-400 font-medium'}`}>Evolución</span>
          </button>

          {/* 🔥 NUEVO BOTÓN: NUTRICIÓN 🔥 */}
          <button onClick={() => setActiveTab("nutricion")} className="flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 relative">
            <svg className={`w-6 h-6 transition-colors ${activeTab === 'nutricion' ? 'text-black' : 'text-zinc-400'}`} fill={activeTab === 'nutricion' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'nutricion' ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            <span className={`text-[10px] tracking-wide ${activeTab === 'nutricion' ? 'text-black font-bold' : 'text-zinc-400 font-medium'}`}>Nutrición</span>
          </button>

          {/* 🔥 5. NUEVO BOTÓN: AFILIADOS 🔥 */}
          <button onClick={() => setActiveTab("afiliados")} className="flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 relative">
            <svg className={`w-6 h-6 transition-colors ${activeTab === 'afiliados' ? 'text-black' : 'text-zinc-400'}`} fill={activeTab === 'afiliados' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'afiliados' ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className={`text-[10px] tracking-wide ${activeTab === 'afiliados' ? 'text-black font-bold' : 'text-zinc-400 font-medium'}`}>Afiliados</span>
          </button>

        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        
{/* ─── BOTTOM SHEET: ASISTENTE IA NATIVO ─── */}
        {showAssistant && (
           <div className="fixed inset-0 z-[70] flex flex-col justify-end animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAssistant(false)}></div>
              
              <div className="relative bg-white w-full h-[85vh] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
                 
                 <div className="flex justify-center pt-4 pb-2 relative shrink-0">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                    <button onClick={() => setShowAssistant(false)} className="absolute right-5 top-3 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-colors font-bold">✕</button>
                 </div>

                 {!canViewAI ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                         <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">🤖</div>
                         <h3 className="text-2xl font-black tracking-tight text-black mb-2">Sistema Restringido</h3>
                         <p className="text-gray-500 font-medium mb-8 text-sm">El análisis biomecánico de Tujague AI es exclusivo para la Mentoría Élite.</p>
                         <a href={whatsappUpsellUrl} target="_blank" className="bg-black text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest w-full hover:scale-105 transition-transform active:scale-95 text-center">Postularme a Élite 🚀</a>
                     </div>
                 ) : (
                     <div className="flex flex-col h-full overflow-hidden">
                        <div className="px-6 pb-4 border-b border-gray-100 flex flex-col gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xl shadow-md">🤖</div>
                               <div>
                                  <h3 className="font-bold text-black leading-none text-lg">Tujague AI</h3>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{aiMode === 'chef' ? 'Asesor Nutricional' : 'Soporte Biomecánico'}</p>
                               </div>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                               <button onClick={() => setAiMode('biomechanic')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${aiMode === 'biomechanic' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Biomecánica</button>
                               <button onClick={() => setAiMode('chef')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${aiMode === 'chef' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Nutrición</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 custom-scrollbar">
                           {aiMode === 'chef' && chefHistory.length <= 1 && (
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                       <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Calculadora Rápida</span>
                                       <button onClick={() => setShowChefForm(!showChefForm)} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">{showChefForm ? 'Ocultar' : 'Configurar'}</button>
                                    </div>
                                    {showChefForm && (
                                        <div className="space-y-3 mb-4 animate-in fade-in">
                                            <div className="grid grid-cols-2 gap-2">
                                                <select value={dietGoal} onChange={e=>setDietGoal(e.target.value)} className="bg-gray-50 border border-gray-200 text-xs p-2 rounded-lg text-gray-600 outline-none">
                                                    <option value="volumen">Superávit</option><option value="mantenimiento">Recomposición</option><option value="deficit">Déficit</option>
                                                </select>
                                                <select value={activityLevel} onChange={e=>setActivityLevel(e.target.value)} className="bg-gray-50 border border-gray-200 text-xs p-2 rounded-lg text-gray-600 outline-none">
                                                    <option value="sedentario">Sedentario</option><option value="ligero">Ligero</option><option value="moderado">Moderado</option><option value="intenso">Intenso</option>
                                                </select>
                                            </div>
                                            <button onClick={handleCalculateMacros} className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg text-[10px] font-bold uppercase border border-orange-100">Calcular (Base {checkin.weight || '0'}kg)</button>
                                            {calculatedMacros && (
                                                <div className="flex justify-between text-[10px] font-bold bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                                                    <div><span className="block text-gray-400">Kcal</span>{calculatedMacros.cals}</div>
                                                    <div><span className="block text-gray-400">P</span>{calculatedMacros.prot}g</div>
                                                    <div><span className="block text-gray-400">C</span>{calculatedMacros.carbs}g</div>
                                                    <div><span className="block text-gray-400">G</span>{calculatedMacros.fats}g</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                           )}

                           {(aiMode === 'biomechanic' ? bioHistory : chefHistory).map((msg, index) => (
                              <div key={index} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 px-1">{msg.role === 'user' ? 'Atleta' : 'Tujague AI'}</span>
                                 <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 whitespace-pre-wrap'}`}>
                                    {msg.content}
                                 </div>
                              </div>
                           ))}
                           {isTyping && (
                               <div className="mr-auto bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 w-fit">
                                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                               </div>
                           )}
                           <div ref={chatEndRef} />
                        </div>

<div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-8">
                            {aiMode === 'chef' && chefHistory.length <= 1 ? (
                                <form onSubmit={handleQuickChefRequest} className="flex gap-2 relative">
                                   <input 
                                      name="chatInput" 
                                      type="text" 
                                      className="flex-1 bg-gray-100 rounded-xl px-5 py-4 text-sm text-black font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-400" 
                                      placeholder="Ingredientes (Ej: pollo, arroz)..." 
                                      disabled={isTyping} 
                                   />
                                   <button type="submit" disabled={isTyping} className="bg-orange-500 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform shadow-md">
                                      Menú
                                   </button>
                                </form>
                            ) : (
                                <form onSubmit={aiMode === 'chef' ? handleChefMessage : handleBioMessage} className="flex gap-2 relative">
                                   <input 
                                      name="chatInput"
                                      type="text" 
                                      className="flex-1 bg-gray-100 rounded-xl px-5 py-4 text-sm text-black font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400" 
                                      placeholder={aiMode === 'chef' ? "Consulta nutricional libre..." : "Consulta técnica..."} 
                                      disabled={isTyping} 
                                   />
                                   <button type="submit" disabled={isTyping} className="bg-black text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform shadow-md">
                                      Enviar
                                   </button>
                                </form>
                            )}
                        </div>
                     </div>
                 )}
              </div>
           </div>
        )}

{/* ─── PESTAÑA AGENDA (VISOR DE MESOCICLO COMPLETO) ─── */}
        {activeTab === "rutina" && (
          <div className="relative pb-24 max-w-[100vw] overflow-x-hidden md:max-w-6xl mx-auto"> 

{isStaticPlan ? (
                // 🔥 NUEVA VISTA ULTRA SIMPLE PARA BÓVEDA ESTÁTICA (12 SEMANAS) 🔥
                <div className="bg-white border border-gray-200 p-10 md:p-16 rounded-[3rem] text-center shadow-sm relative overflow-hidden my-10 max-w-4xl mx-auto animate-in zoom-in duration-500 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">📄</div>
                    
                    <h2 className="text-3xl md:text-5xl font-black italic text-black mb-4 tracking-tighter uppercase">
                        TU PLAN <span className="text-amber-500">MAESTRO</span>
                    </h2>
                    
                    <p className="text-gray-500 font-medium text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed px-4">
                        Aquí tienes tu estructura BII-Vintage de 12 semanas. Descarga el archivo, imprímelo y llévalo al gimnasio para dominar tus marcas. Este modo es 100% independiente.
                    </p>
                    
                    <button 
                        onClick={downloadPDF}
                        disabled={generatingPDF}
                        className="bg-black hover:bg-zinc-800 text-white px-10 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-3"
                    >
                        {generatingPDF ? 'GENERANDO PDF...' : '⬇ DESCARGAR PDF (12 SEMANAS)'}
                    </button>

                    {/* SECCIÓN DE UPSELL */}
                    <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-md">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">¿Buscas herramientas interactivas y Tujague AI?</p>
                         <a href={whatsappUpsellUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600 font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                             Mejorar a Mentoría Élite 🚀
                         </a>
                    </div>
                </div>
            ) : (

                /* 🔥 VISOR DE AGENDA PARA MENTORÍA ÉLITE 🔥 */
                <div className="animate-in fade-in duration-500 mt-6 space-y-12">

                    {/* 🔥 1. ENCABEZADO: HOJA DE RUTA Y BOTONES PREMIUM (PRIMERO) 🔥 */}
                    <div className="max-w-4xl mx-auto bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden flex flex-col items-start gap-8">
                        <div>
                            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Panel Activo
                            </p>
                            <h2 className="text-3xl md:text-5xl font-black italic text-black uppercase tracking-tighter">
                                Hoja de <span className="text-amber-500">Ruta</span>
                            </h2>
                            <p className="text-gray-500 font-medium mt-2 text-sm md:text-base">Ejecución táctica programada. La intensidad no se negocia.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full max-w-lg">
                            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl flex-1">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Macrociclo</p>
                                <p className="text-xs font-bold text-black uppercase tracking-tight truncate">{order?.macrocycle || '1'}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl flex-1">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Mesociclo</p>
                                <p className="text-xs font-bold text-black uppercase tracking-tight truncate">{viewingBiiProgram?.mesocycle || order?.mesocycle || '1'}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex-1 shadow-sm w-full mt-2">
                                <p className="text-[8px] text-amber-600 font-black uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                    Fase Actual
                                </p>
                                <p className="text-xs font-black text-amber-600 uppercase tracking-tight">Semana {viewingBiiProgram?.week || '1'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row w-full gap-3 relative z-10 mt-2">
                            {/* 🔥 BOTÓN DE PDF ELIMINADO PARA MENTORÍA ÉLITE 🔥 */}
                            
                            {isElitePlan && (
                                <button 
                                    onClick={() => setShowPanicModal(true)}
                                    className="w-full md:w-auto flex justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest items-center gap-3 transition-all shadow-sm active:scale-95"
                                >
                                    🚨 REPORTE DE EMERGENCIA
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 🔥 2. BOTÓN JUNK VOLUME KILLER (SEGUNDO) 🔥 */}
                    {(safePlanId.includes('calculadora') || safePlanId.includes('junk') || myProducts.includes('calculadora-volumen-basura') || isElitePlan) && (
                        <div className="max-w-4xl mx-auto">
                            <Link 
                                href="/dashboard/producto/calculadora-volumen-basura" 
                                className="w-full flex justify-center bg-zinc-900 hover:bg-black text-white px-6 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] items-center gap-3 transition-all shadow-lg active:scale-95 border border-zinc-800"
                            >
                                <span className="text-xl md:text-2xl">🧮</span> JUNK VOLUME KILLER - Auditoría Táctica
                            </Link>
                        </div>
                    )}
                    
                    {/* 🚀 3. MAPA ANUAL DINÁMICO (TERCERO) 🚀 */}
                    <div className="max-w-4xl mx-auto">
                        {(() => {
                            const combinedAnnualPlan = { ...(order?.annual_plan || {}) };
                           if (viewingBiiProgram && viewingBiiProgram.week) {
                                const wNum = Number(viewingBiiProgram.week);
                                const newWeekObj: any = { phase: viewingBiiProgram.mesocycle || 'Fase BII', focus: viewingBiiProgram.focus || '' };
                                if (viewingBiiProgram.days) {
                                    viewingBiiProgram.days.forEach((day: any, i: number) => {
                                        if (!day.isRestDay && day.exercises && day.exercises.length > 0) {
                                            newWeekObj[`d${i+1}`] = day.exercises.map((ex:any, idx:number) => `${idx+1}. ${ex.name}\n${Array.isArray(ex.sets)?ex.sets.length:ex.sets} SERIES @ RPE ${ex.rpe}`).join('\n\n');
                                        } else {
                                            newWeekObj[`d${i+1}`] = "Descanso Activo / Recuperación";
                                        }
                                    });
                                }
                                combinedAnnualPlan[wNum] = newWeekObj;
                            }
                            const currentWeekNum = Number(viewingBiiProgram?.week) || parseInt(String(order?.microcycle || '1').match(/\d+/)?.[0] || '1');
                            return (
                               <AthleteMacroPlanner 
                                  annualPlan={combinedAnnualPlan} 
                                  currentWeek={currentWeekNum} 
                                  onWeekSelect={(weekStr: string | number) => {
                                      const prog = allBiiPrograms.find(p => String(p.program_data?.week) === String(weekStr));
                                      if (prog) {
                                          setViewingBiiProgram(prog.program_data);
                                          window.scrollTo({ top: 800, behavior: 'smooth' });
                                      } else {
                                          alert("El Coach aún no ha diseñado la estructura táctica para la Semana " + weekStr + ".");
                                      }
                                  }}
                               />
                            );
                        })()}
                    </div>

                    {/* 🔥 4. SELECTOR DE SEMANAS (CUARTO Y ÚLTIMO) 🔥 */}
                    <div className="max-w-4xl mx-auto border-t border-gray-200 pt-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 mb-8">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black italic text-black uppercase tracking-tighter">
                                    Agenda de <span className="text-amber-500">Planificación</span>
                                </h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">Navegá tu mesociclo completo.</p>
                            </div>
                            
                            <select 
                                className="w-full md:w-auto bg-white border border-gray-200 text-black font-black uppercase tracking-widest text-[10px] md:text-xs px-4 py-3 rounded-xl shadow-sm outline-none focus:border-amber-500 cursor-pointer appearance-none"
                                value={viewingBiiProgram?.week || ''}
                                onChange={(e) => {
                                    const selectedWeek = e.target.value;
                                    const prog = allBiiPrograms.find(p => String(p.program_data?.week) === String(selectedWeek));
                                    if (prog) setViewingBiiProgram(prog.program_data);
                                }}
                            >
                                {allBiiPrograms.length === 0 && <option value="">No hay semanas asignadas</option>}
                                {allBiiPrograms.map((p, idx) => (
                                    <option key={idx} value={p.program_data?.week}>
                                        SEMANA {p.program_data?.week} {p.is_active ? '(ACTIVA HOY)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

{/* 🔥 VISOR DE SEMANAS JSON 🔥 */}
                            {!viewingBiiProgram ? (
                                <div className="bg-white border border-gray-200 p-10 md:p-16 rounded-[3rem] text-center shadow-sm relative overflow-hidden max-w-4xl mx-auto">
                                   <span className="text-5xl block opacity-50 mb-4 animate-bounce">⏳</span>
                                   <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-widest mb-3">Estructurando Mesociclo</h3>
                                   <p className="text-gray-500 font-medium max-w-md mx-auto">El Coach está diseñando tu próxima etapa de entrenamiento. Tu hoja de ruta aparecerá aquí pronto.</p>
                                </div>
                            ) : (
                                <div className="space-y-8 max-w-4xl mx-auto">
                                   
                                   {/* 🔥 BOTÓN AMARILLO: LÓGICA INTELIGENTE 🔥 */}
                                   {activeBiiProgram?.week === viewingBiiProgram.week ? (
                                       <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm mb-12 animate-in slide-in-from-bottom duration-500">
                                           <div className="flex flex-col items-start gap-4">
                                               <div>
                                                   <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-1 flex items-center gap-1.5">
                                                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Panel Activo - Semana en Curso
                                                   </p>
                                                   <h3 className="text-2xl md:text-3xl font-black italic text-black uppercase tracking-tight">Estructura del día <span className="text-amber-500">lista</span></h3>
                                               </div>
                                               <Link 
                                                   href="/entrenamiento"
                                                   className="w-full flex justify-center bg-amber-500 hover:bg-amber-400 text-black px-12 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95 text-center items-center gap-3"
                                               >
                                                   ▶ INICIAR ENTRENAMIENTO
                                               </Link>
                                           </div>
                                       </div>
                                   ) : (
                                        <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-[2rem] mb-12 text-center flex flex-col items-center justify-center">
                                             <span className="text-2xl mb-2 block opacity-70">📅</span>
                                             <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Visualizando Semana {viewingBiiProgram.week}</p>
                                             <p className="text-[10px] text-gray-400 font-medium mt-1">El botón de entrenamiento solo se activa en tu semana en curso (Semana {activeBiiProgram?.week || '-'}).</p>
                                        </div>
                                   )}

                                   {/* 🔥 NUEVO VISOR INTERACTIVO RELACIONAL (Con Inputs) 🔥 */}
                                   {activeDbRoutine ? (
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 px-2 mt-8 border-t border-gray-200 pt-8">
                                           <div className="col-span-full mb-2">
                                               <h3 className="text-2xl font-black italic text-black uppercase tracking-tighter">
                                                   Panel de <span className="text-amber-500">Ejecución Diaria</span>
                                               </h3>
                                               <p className="text-gray-500 text-sm font-medium">Registrá tus pesos reales para alimentar el algoritmo de Evolución.</p>
                                           </div>

                                           {activeDbRoutine.workouts?.map((workout: any) => {
                                               if (workout.is_rest_day || !workout.workout_exercises || workout.workout_exercises.length === 0) {
                                                   return (
                                                       <div key={workout.id} className="bg-gray-50 border border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center opacity-60 min-h-[150px]">
                                                           <span className="text-3xl mb-2">💤</span>
                                                           <h4 className="font-black text-gray-500 uppercase tracking-widest text-[10px]">Día {workout.day_number} - Descanso</h4>
                                                       </div>
                                                   );
                                               }

                                               return (
                                                   <div key={workout.id} className="bg-white border border-gray-200 rounded-[1.5rem] shadow-sm flex flex-col h-full overflow-hidden hover:border-amber-300 transition-colors group">
                                                       <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                                           <div>
                                                               <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Día {workout.day_number}</p>
                                                               <h4 className="font-black italic text-black uppercase tracking-tight text-sm">{workout.name}</h4>
                                                           </div>
                                                       </div>
                                                       
                                                       <div className="p-4 flex-1 space-y-4">
                                                           {workout.workout_exercises.map((ex: any) => (
                                                               <div key={ex.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                                   <p className="font-black text-gray-800 text-[11px] mb-2 leading-tight uppercase tracking-tight">
                                                                       <span className="text-amber-500 mr-1">{ex.order_index}.</span> {ex.exercise_name}
                                                                   </p>
                                                                   <div className="flex flex-wrap gap-1.5 mb-3">
                                                                       <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-widest">{ex.sets_target} SERIES DE {ex.reps_target}</span>
                                                                       <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-widest border border-amber-100">RPE {ex.rpe_target}</span>
                                                                       {ex.tempo && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-widest border border-blue-100">Tempo: {ex.tempo}</span>}
                                                                   </div>
                                                                   
                                                                   {/* 🔥 ZONA DE INPUTS (El Sudor) 🔥 */}
                                                                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col gap-2">
                                                                       <div className="flex gap-2">
                                                                           <input 
                                                                               type="number" 
                                                                               placeholder="KG" 
                                                                               value={setInputs[ex.id]?.weight || ''}
                                                                               onChange={(e) => setSetInputs(prev => ({...prev, [ex.id]: { ...prev[ex.id], weight: e.target.value } }))}
                                                                               className="w-1/2 bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold text-center outline-none focus:border-amber-500"
                                                                           />
                                                                           <input 
                                                                               type="number" 
                                                                               placeholder="Reps" 
                                                                               value={setInputs[ex.id]?.reps || ''}
                                                                               onChange={(e) => setSetInputs(prev => ({...prev, [ex.id]: { ...prev[ex.id], reps: e.target.value } }))}
                                                                               className="w-1/2 bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold text-center outline-none focus:border-amber-500"
                                                                           />
                                                                       </div>
                                                                       <button 
                                                                           onClick={() => handleLogSet(ex.id)}
                                                                           disabled={savingSetId === ex.id}
                                                                           className="w-full bg-black text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-lg disabled:opacity-50 active:scale-95 transition-transform"
                                                                       >
                                                                           {savingSetId === ex.id ? 'GUARDANDO...' : 'GUARDAR SERIE'}
                                                                       </button>
                                                                   </div>
                                                               </div>
                                                           ))}
                                                       </div>
                                                   </div>
                                               );
                                           })}
                                       </div>
                                   ) : (
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 px-2">
                                           {viewingBiiProgram.days && viewingBiiProgram.days.map((day: any, dIdx: number) => {
                                               if (day.isRestDay || !day.exercises || day.exercises.length === 0) {
                                                   return (
                                                       <div key={dIdx} className="bg-gray-50 border border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center opacity-60 min-h-[150px]">
                                                           <span className="text-3xl mb-2">💤</span>
                                                           <h4 className="font-black text-gray-500 uppercase tracking-widest text-[10px]">Día {dIdx + 1} - Descanso</h4>
                                                       </div>
                                                   );
                                               }
                                               return (
                                                   <div key={dIdx} className="bg-white border border-gray-200 rounded-[1.5rem] shadow-sm flex flex-col h-full overflow-hidden hover:border-amber-300 transition-colors group">
                                                       <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                                           <div>
                                                               <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Día {dIdx + 1}</p>
                                                               <h4 className="font-black italic text-black uppercase tracking-tight text-sm">{day.title || 'Entrenamiento'}</h4>
                                                           </div>
                                                       </div>
                                                       <div className="p-4 flex-1 space-y-3">
                                                           {day.exercises.map((ex: any, eIdx: number) => (
                                                               <div key={eIdx} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                                                   <p className="font-black text-gray-800 text-[11px] mb-1.5 leading-tight uppercase tracking-tight">
                                                                       <span className="text-amber-500 mr-1">{eIdx + 1}.</span> {ex.name}
                                                                   </p>
                                                               </div>
                                                           ))}
                                                       </div>
                                                   </div>
                                               );
                                           })}
                                       </div>
                                   )}

                                </div>
                            )}
                        </div>
                    </div>
                )}
              </div>
            )}

{/* ─── PESTAÑA BOVEDA TÉCNICA ─── */}

  {activeTab === "boveda" && (
    <>
      {!isElitePlan ? (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-white border border-red-200 rounded-[3rem] shadow-sm relative overflow-hidden text-center h-[60vh] min-h-[400px]">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10">🏛️</div>
          <h3 className="text-3xl md:text-5xl font-black italic text-black mb-4 tracking-tighter relative z-10 uppercase">MÓDULO <span className="text-red-500">RESTRINGIDO</span></h3>
          <p className="text-gray-500 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">La Bóveda Técnica y los manuales de calibración biomecánica están reservados exclusivamente para atletas de la Mentoría Élite.</p>
          <a href={whatsappUpsellUrl} target="_blank" className="relative z-10 inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-md hover:scale-105 active:scale-95 w-full sm:w-auto">
              AGENDAR LLAMADA DE ADMISIÓN 📞
          </a>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black italic text-black uppercase tracking-tighter">Bóveda Técnica <span className="text-amber-500">BII-Vintage</span></h2>
            <p className="text-gray-500 mt-4 text-sm md:text-base font-medium max-w-2xl mx-auto">Estudie rigurosamente el diseño de palancas y ejecución antes del abordaje práctico en el gimnasio.</p>
          </div>

          {/* 🔥 BANNER DEL KIT ACELERADOR VIP 🔥 */}
          {(order?.has_kit || order?.wants_kit || order?.upsell_kit) && (
            <div className="bg-amber-50 border border-amber-100 p-6 md:p-10 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden mb-12 group">
              <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-amber-200 rounded-2xl flex items-center justify-center text-4xl shadow-sm shrink-0 group-hover:scale-110 transition-transform">📚</div>
                <div className="text-left">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-600 mb-1 block animate-pulse">Material Premium Desbloqueado</span>
                  <h3 className="text-2xl md:text-3xl font-black italic text-black tracking-tighter uppercase">Kit Acelerador BII-Vintage</h3>
                  <p className="text-gray-600 font-medium text-sm mt-1">Guía definitiva de nutrición, descansos y mentalidad.</p>
                </div>
              </div>
              <button onClick={handleDownloadKit} className="relative z-10 bg-amber-500 hover:bg-amber-600 text-white px-8 py-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap w-full md:w-auto">
                 📥 DESCARGAR KIT
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { id: 'squat', name: 'Sentadilla (Squat)', url: '' }, 
              { id: 'bench', name: 'Press Banca (Bench)', url: '' },
              { id: 'deadlift', name: 'Peso Muerto (Deadlift)', url: '' },
              { id: 'military', name: 'Press Militar (OHP)', url: '' },
              { id: 'dips', name: 'Fondos (Dips)', url: '' }
            ].map(video => (
              <div key={video.id} className="bg-white border border-gray-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-black italic uppercase text-lg md:text-xl text-black tracking-tight">{video.name}</h3>
                </div>
                {video.url ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe width="100%" height="100%" src={video.url} title={video.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                ) : (
                    <div className="aspect-video w-full bg-gray-100 flex flex-col items-center justify-center p-8 relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[2rem] flex items-center justify-center border border-gray-200 mb-6 shadow-sm"><span className="text-3xl opacity-50">🔒</span></div>
                        <h4 className="text-gray-400 font-black tracking-widest text-[10px] md:text-xs uppercase text-center">Clínica Técnica en Producción</h4>
                        <p className="text-gray-300 text-[9px] md:text-[10px] mt-2 font-bold uppercase tracking-widest">Coach Luciano Tujague</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )}

{/* ─── PESTAÑA DE AUDITORÍA DE VIDEOS (REFACTORIZADA) ─── */}
        {activeTab === "videos" && (
            <TabVideos 
                canViewVideos={canViewVideos}
                whatsappUpsellUrl={whatsappUpsellUrl}
                handleRestrictedClick={handleRestrictedClick}
                mainLifts={mainLifts}
                extraLifts={extraLifts}
                order={order}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                handleUpdateExtraName={handleUpdateExtraName}
            />
        )}

{/* ─── PESTAÑA EVOLUCIÓN Y MÉTRICAS (REFACTORIZADA) ─── */}
        {activeTab === "rm" && (
            <TabEvolucionDashboard 
                canViewRMs={canViewRMs}
                whatsappUpsellUrl={whatsappUpsellUrl}
                handleRestrictedClick={handleRestrictedClick}
                order={order}
                checkin={checkin}
                checkinHistory={checkinHistory}
                rms={rms}
                totalAbsoluto={totalAbsoluto}
                rmAiLoading={rmAiLoading}
                rmAiFeedback={rmAiFeedback}
                handleAnalyzeRMs={handleAnalyzeRMs}
                calcLift={calcLift}
                setCalcLift={setCalcLift}
                calcPercent={calcPercent}
                setCalcPercent={setCalcPercent}
                calculatedWeight={calculatedWeight}
                handleGenerateWarmup={handleGenerateWarmup}
                generatingWarmup={generatingWarmup}
                warmupPlan={warmupPlan}
                groupedTrophies={groupedTrophies}
                shareTrophies={shareTrophies}
            />
        )}

{/* ─── PESTAÑA DE AUDITORÍA DE RECUPERACIÓN (REFACTORIZADA) ─── */}
        {activeTab === "checkin" && (
            <TabCheckin 
                canViewSNC={canViewSNC}
                whatsappUpsellUrl={whatsappUpsellUrl}
                handleRestrictedClick={handleRestrictedClick}
                checkin={checkin}
                setCheckin={setCheckin}
                handleSaveCheckin={handleSaveCheckin}
                savingCheckin={savingCheckin}
                analyzingFatigue={analyzingFatigue}
                fatigueVerdict={fatigueVerdict}
                checkinHistory={checkinHistory}
            />
        )}

{/* ─── PESTAÑA NUTRICIÓN (REFACTORIZADA) ─── */}
        {activeTab === "nutricion" && (
            <TabNutricion 
                isElitePlan={isElitePlan}
                whatsappUpsellUrl={whatsappUpsellUrl}
                handleRestrictedClick={handleRestrictedClick}
                userId={user?.id}
            />
        )}

{/* ─── PESTAÑA AFILIADOS (NUEVA) ─── */}
        {activeTab === "afiliados" && (
           <AffiliateDashboard 
              userName={order?.customer_name?.split(" ")[0] || "Atleta"}
              isAffiliate={isElitePlan} 
              referralCode={order?.referral_code}
              walletBalance={Number(order?.wallet_balance || 0)}
              amountArs={Number(order?.amount_ars) > 0 ? Number(order?.amount_ars) : 50000}
              discountPct={order?.affiliate_discount || 15} 
              commissionPct={order?.affiliate_commission || 20}
           />
        )}

        {/* 🔥 EL MODAL INVISIBLE ESPERANDO SER ACTIVADO 🔥 */}
<UpgradeModal 
    isOpen={upgradeModalData.isOpen} 
    featureName={upgradeModalData.featureName}
    onClose={() => setUpgradeModalData({ isOpen: false, featureName: '' })}
    whatsappUrl={whatsappUpsellUrl} // 🔥 Le pasamos la URL aquí
/>

        </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
        
        .whitespace-pre-wrap { white-space: pre-wrap !important; }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #10b981;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(16,185,129,0.8);
            border: 2px solid #000;
            transition: all 0.2s;
        }
        
        input[type="range"]:active::-webkit-slider-thumb {
            transform: scale(1.2);
            background: #fff;
        }

        input[type="range"].accent-orange-500::-webkit-slider-thumb { background: #f97316; box-shadow: 0 0 15px rgba(249,115,22,0.8); }
        input[type="range"].accent-white::-webkit-slider-thumb { background: #ffffff; box-shadow: 0 0 15px rgba(255,255,255,0.8); }
        input[type="range"].accent-yellow-400::-webkit-slider-thumb { background: #facc15; box-shadow: 0 0 15px rgba(250,204,21,0.8); }
        input[type="range"].accent-red-500::-webkit-slider-thumb { background: #ef4444; box-shadow: 0 0 15px rgba(239,68,68,0.8); }
        input[type="range"].accent-blue-400::-webkit-slider-thumb { background: #60a5fa; box-shadow: 0 0 15px rgba(96,165,250,0.8); }

        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
            opacity: 0.6;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}