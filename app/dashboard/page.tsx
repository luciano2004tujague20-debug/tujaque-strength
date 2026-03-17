"use client";

import { resolvePlan } from '@/lib/permissions';
import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from "next/link";
import { PDFDocument, rgb } from 'pdf-lib';

export default function DashboardAtleta() {
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState("rutina");
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<string[]>([]);
  
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

// 🔥 CEREBRO DE PERMISOS BII-VINTAGE 3.0 (HIGH-TICKET) 🔥
  const safePlanId = (order?.plan_id || "").toLowerCase();

  // 1. Identificamos qué plan compró el usuario
  // Ahora la Mentoría Élite abarca 90 días, 180 días y el plan "Leyenda" de 365 días.
  const isElitePlan = safePlanId.includes('elite') || safePlanId.includes('leyenda') || safePlanId.includes('vip');
  
  // 2. Si no es Élite/Leyenda, por descarte es un plan Estático (Bóveda de PDFs)
  const isStaticPlan = !isElitePlan;

  // 3. Matriz de Accesos de Alta Gama
  // El Plan Estático SOLO accede a la Bóveda de PDFs (Rutina). Todo lo demás está bloqueado.
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

const handleSaveOnboarding = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingOnboarding(true);
      try {
          const finalSquat = isBeginner ? "0" : onboardingData.rm_squat;
          const finalBench = isBeginner ? "0" : onboardingData.rm_bench;
          const finalDeadlift = isBeginner ? "0" : onboardingData.rm_deadlift;
          const finalDips = isBeginner ? "0" : onboardingData.rm_dips;
          const finalMilitary = isBeginner ? "0" : onboardingData.rm_military;
          
          // 🔥 Acá inyectamos los botones de dolor articular al historial médico
          const finalMedical = isBeginner 
              ? `[ATLETA PRINCIPIANTE] - Lesiones: ${jointIssues.join(", ")} | Detalle: ${onboardingData.medical_history}` 
              : `Lesiones: ${jointIssues.join(", ")} | Detalle: ${onboardingData.medical_history}`;

          const { error } = await supabase
              .from('orders')
              .update({
                  is_onboarded: true, // Lo marcamos como completado
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
          
          // 🔥 En vez de cerrar el modal de golpe, lo mandamos al paso 5 (El puente de WhatsApp)
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
    setFatigueVerdict(""); // Limpiamos el veredicto anterior si lo hubiera
    
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
                       lethargy: Number(checkin.energy) <= 4 // Si la energía es 4 o menos, consideramos letargo
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
          const response = await fetch('/plantilla-blanco.pdf');
          if (!response.ok) throw new Error("No se encontró plantilla-blanco.pdf");
          const existingPdfBytes = await response.arrayBuffer();

          const pdfDoc = await PDFDocument.load(existingPdfBytes);
          const pages = pdfDoc.getPages();
          const firstPage = pages[0]; 

          const cleanText = (str: string | undefined | null) => {
              if (!str) return "";
              let s = str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[\u2026]/g, "...");
              return s.replace(/[^\x00-\xFF]/g, ""); 
          };

          firstPage.drawText(cleanText(order?.customer_name) || 'Atleta', { x: 150, y: 550, size: 12, color: rgb(0, 0, 0) });
          firstPage.drawText(cleanText(checkin.weight || order?.body_weight) || '-', { x: 150, y: 520, size: 12, color: rgb(0, 0, 0) });
          firstPage.drawText(cleanText(order?.goal) || 'Fuerza / Hipertrofia', { x: 400, y: 550, size: 12, color: rgb(0, 0, 0) });

          const textOptions = { x: 50, y: 650, size: 10, maxWidth: 500, lineHeight: 14, color: rgb(0, 0, 0) };
          
          if (pages[2] && order?.routine_d1) pages[2].drawText(cleanText(order.routine_d1), textOptions);
          if (pages[3] && order?.routine_d2) pages[3].drawText(cleanText(order.routine_d2), textOptions);
          if (pages[4] && order?.routine_d3) pages[4].drawText(cleanText(order.routine_d3), textOptions);
          if (pages[5] && order?.routine_d4) pages[5].drawText(cleanText(order.routine_d4), textOptions);
          if (pages[6] && order?.routine_d5) pages[6].drawText(cleanText(order.routine_d5), textOptions);
          if (pages[7] && order?.routine_d6) pages[7].drawText(cleanText(order.routine_d6), textOptions);
          if (pages[8] && order?.routine_d7) pages[8].drawText(cleanText(order.routine_d7), textOptions);

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `Tujague_Strength_${cleanText(order?.customer_name)?.replace(/\s+/g, '_') || 'Plan'}.pdf`;
          link.click();
      } catch (error) {
          console.error("Error generando PDF:", error);
          alert("Ocurrió un error al generar el documento. Verifica que plantilla-blanco.pdf esté en tu carpeta public.");
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
     if (!bioInput.trim()) return;

     const newHistory = [...bioHistory, { role: "user", content: bioInput }];
     setBioHistory(newHistory);
     setBioInput("");
     setIsTyping(true);

     try {
        const res = await fetch("/api/assistant", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ messages: newHistory })
        });

        const data = await res.json();
        
        if (data.reply) {
           setBioHistory([...newHistory, { role: "assistant", content: data.reply }]);
        } else {
           setBioHistory([...newHistory, { role: "assistant", content: "Error de conexión central." }]);
        }
     } catch (error) {
        setBioHistory([...newHistory, { role: "assistant", content: "El sistema central se encuentra inactivo momentáneamente." }]);
     } finally {
        setIsTyping(false);
     }
  };

  const handleChefMessage = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!chefInput.trim()) return;

     const newHistory = [...chefHistory, { role: "user", content: chefInput }];
     setChefHistory(newHistory);
     setChefInput("");
     setIsTyping(true);

     try {
        const res = await fetch("/api/assistant/chef", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ messages: newHistory })
        });

        const data = await res.json();
        
        if (data.reply) {
           setChefHistory([...newHistory, { role: "assistant", content: data.reply }]);
        } else {
           setChefHistory([...newHistory, { role: "assistant", content: "Error en la consulta nutricional." }]);
        }
     } catch (error) {
        setChefHistory([...newHistory, { role: "assistant", content: "Error de conexión con los servidores culinarios." }]);
     } finally {
        setIsTyping(false);
     }
  };

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
     if (!chefIngredients.trim()) return alert("Por favor, detalle los ingredientes de su inventario.");
     
     setIsTyping(true);
     
     let targetCals = order?.macro_calories || (calculatedMacros ? calculatedMacros.cals : "No definido");
     let targetProt = order?.macro_protein || (calculatedMacros ? calculatedMacros.prot + "g" : "Alto en proteína");
     let targetCarbs = order?.macro_carbs || (calculatedMacros ? calculatedMacros.carbs + "g" : "Moderado");
     let targetFats = order?.macro_fats || (calculatedMacros ? calculatedMacros.fats + "g" : "Moderado");
     let targetWater = order?.macro_water || (calculatedMacros ? calculatedMacros.water + " L" : "3 Litros");

     const macroContext = `OBJETIVO ESTRICTO DE MACRONUTRIENTES DIARIOS: Calorías: ${targetCals}, Proteína: ${targetProt}, Carbohidratos: ${targetCarbs}, Grasas: ${targetFats}. Hidratación Mínima: ${targetWater}.`;

     const promptFinal = `Actúa como un Nutricionista Deportivo de Élite de la academia Tujague Strength.
     Ingredientes disponibles en mi cocina: ${chefIngredients}.
     
     ${macroContext}
     
     REGLAS DE FORMATO Y ESTRUCTURA (OBLIGATORIO):
     1. Diseña exactamente 4 comidas (Desayuno, Almuerzo, Merienda Pre-Entreno, Cena).
     2. Muestra los GRAMOS EXACTOS de cada alimento al lado del ingrediente para que la suma total del día cuadre matemáticamente con los macros exigidos.
     3. Usa saltos de línea (\n) para separar las comidas. NO escribas párrafos largos.
     4. Utiliza viñetas y emojis para hacerlo visual y atractivo.
     5. No des introducciones largas ni explicaciones robóticas. Ve directo al menú.`;

     const newHistory = [...chefHistory, { role: "user", content: promptFinal }];
     const displayHistory = [...chefHistory, { role: "user", content: `🥩 Generar menú de hoy con: ${chefIngredients}` }];
     
     setChefHistory(displayHistory);
     setShowChefForm(false);
     setChefIngredients(""); 

     try {
         const res = await fetch('/api/assistant/chef', {
             method: 'POST', 
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ messages: newHistory })
         });
         const data = await res.json();
         if (data.reply) {
            setChefHistory([...displayHistory, { role: "assistant", content: data.reply }]);
         }
     } catch (error) { 
         alert("Error en la conexión con el módulo culinario."); 
     } finally { 
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

  // ESQUELETO DE CARGA
  if (loading) return (
    <div className="min-h-screen bg-[#000000] p-4 md:p-12 flex flex-col gap-6 md:gap-8">
      <div className="w-full h-32 md:h-40 bg-[#0a0a0c] rounded-[2rem] animate-pulse border border-zinc-800/50 shadow-lg"></div>
      <div className="w-full h-16 md:h-20 bg-[#0a0a0c] rounded-2xl animate-pulse border border-zinc-800/50"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="w-full h-[60vh] bg-[#0a0a0c] rounded-[2.5rem] animate-pulse border border-zinc-800/50 shadow-xl md:col-span-2"></div>
        <div className="w-full h-[60vh] bg-[#0a0a0c] rounded-[2.5rem] animate-pulse border border-zinc-800/50 shadow-xl"></div>
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
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans selection:bg-emerald-500 selection:text-black">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 md:mb-12 gap-6 bg-[#0a0a0c] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl">
        <div className="w-full lg:w-auto">
          <div className="flex justify-between items-center w-full mb-4">
            <Link href="/" className="flex items-center gap-2 text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border border-amber-500/20 shadow-md">
               <span className="text-sm">🏠</span> Volver a la Web
            </Link>
            <button onClick={handleLogout} className="text-[10px] font-black tracking-widest uppercase text-zinc-500 hover:text-white transition-colors lg:hidden">
              Cerrar Sesión
            </button>
          </div>
      
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-md mt-2">
            PANEL DE <span className="text-amber-500">MANDO</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
             <p className="text-xs md:text-sm text-zinc-400 uppercase tracking-widest font-medium">ID Atleta: <span className="text-white font-bold">{order.customer_name}</span></p>
             {daysLeft !== null && daysLeft > 3 && (<span className="bg-zinc-800/80 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Acceso: {daysLeft} Días</span>)}
             {daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && (<span className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> CADUCA EN {daysLeft} DÍAS</span>)}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
           <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border border-white/5 ${adherenceBg} w-full sm:w-auto shadow-inner`}>
               <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                       <path className="stroke-black/50" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className={`${adherenceStroke} transition-all duration-1000 ease-out`} strokeDasharray={`${adherenceScore}, 100`} strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   </svg>
                   <span className={`absolute text-[11px] font-black ${adherenceColor}`}>{adherenceScore}%</span>
               </div>
               <div>
                   <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-1">Adherencia</p>
                   <p className={`text-xs md:text-sm font-black uppercase tracking-tight ${adherenceColor}`}>{adherenceLabel}</p>
               </div>
           </div>

           <button onClick={handleLogout} className="text-[10px] font-black tracking-widest uppercase text-zinc-400 hover:text-white transition-colors border border-white/10 px-6 py-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 shrink-0 w-full sm:w-auto hidden lg:block">
             CERRAR SESIÓN
           </button>
        </div>
      </header>

       {order.referral_code && (
          <div className="mb-10 bg-gradient-to-br from-zinc-900/80 to-black border border-emerald-900/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none transform-gpu -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
                  <div className="lg:col-span-6 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl md:text-3xl">🤝</span>
                          <div>
                              <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter">Programa de <span className="text-emerald-500">Afiliados</span></h3>
                              <p className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-widest mt-0.5">El sistema financia tu esfuerzo.</p>
                          </div>
                      </div>

                      <p className="text-zinc-300 text-sm font-medium leading-relaxed bg-black/40 p-4 rounded-xl border border-zinc-800/80 mb-4">
                          Si un prospecto usa tu código, él recibe un <strong className="text-emerald-500">15% de bonificación</strong> en su ingreso, y el sistema inyecta el <strong className="text-emerald-500">20% del valor</strong> directo en tu Billetera Virtual. Traé 5 personas y tu mentoría te sale $0.
                      </p>
                      
                      <div className="bg-black/60 border border-zinc-800 p-5 rounded-2xl mt-4">
                          <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-3">Tu Código Privado de Invasión</p>
                          <div className="flex items-center gap-3">
                              <p className="flex-1 text-2xl md:text-3xl font-mono font-black text-white tracking-widest bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-700 text-center select-all">
                                  {order.referral_code}
                              </p>
                              <button 
                                  onClick={() => {navigator.clipboard.writeText(order.referral_code); alert("✅ Código copiado al portapapeles");}}
                                  className="w-14 md:w-16 h-[60px] md:h-[64px] bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-500 border border-emerald-500/30 rounded-xl flex items-center justify-center transition-all shrink-0"
                                  title="Copiar Código"
                              >
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              </button>
                          </div>
                          
                          <a 
                              href={`https://wa.me/?text=${encodeURIComponent(`¡Fiera! Estoy entrenando con la app de Tujague Strength y las marcas suben solas. Sumate al equipo usando mi código VIP: *${order.referral_code}* al momento del pago y te hacen un 15% de descuento en tu inscripción. Entrá acá: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://tujague.com'}`)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-4 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                          >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                              Bombardear Contactos por WhatsApp
                          </a>
                      </div>
                  </div>

                  <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-8 lg:pt-0 lg:pl-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                          <div>
                              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-50 mb-1">Caja Fuerte Virtual</p>
                              <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-white">${balance.toLocaleString()}</p>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center shadow-inner w-full sm:w-auto">
                              <p className="text-3xl mb-1">🏆</p>
                              <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Socio Estratégico</p>
                          </div>
                      </div>

                      <div className="bg-black/50 p-6 md:p-8 rounded-[2rem] border border-zinc-800 shadow-lg">
                          <div className="flex justify-between items-end mb-4">
                              <p className="text-xs md:text-sm font-bold text-zinc-400">Progreso hacia tu Mes Financiado</p>
                              <p className="text-sm md:text-base font-black uppercase tracking-widest text-emerald-400">{Math.floor(affiliateProgress)}%</p>
                          </div>
                          
                          <div className="w-full bg-zinc-900 rounded-full h-4 mb-6 border border-zinc-800 relative overflow-hidden">
                              <div 
                                  className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isFreeMonthSecured ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-800 to-emerald-500'}`}
                                  style={{ width: `${affiliateProgress}%` }}
                              >
                                  {isFreeMonthSecured && <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"></div>}
                              </div>
                          </div>

                          {isFreeMonthSecured ? (
                              <p className="text-xs md:text-sm text-emerald-400 font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center shadow-inner">
                                  🎉 ¡Felicidades, Atleta! El sistema tiene fondos suficientes para que tu próxima Mentoría cueste exactamente $0.
                              </p>
                          ) : (
                              <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest text-center">
                                  Faltan <span className="text-white">${(precioPlanAtleta - balance).toLocaleString()}</span> de saldo para financiar la renovación.
                              </p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

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

      {/* 🔥 TABS (TODOS LAS VEN, PERO SI ES ESTATICO SE BLOQUEAN POR DENTRO) 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-zinc-800/80 p-3 md:relative md:bg-transparent md:border-none md:p-0 md:mb-10 md:flex md:overflow-x-auto md:gap-4 md:border-b md:border-zinc-800 md:pb-4 md:custom-scrollbar md:whitespace-nowrap">
        <div className="flex justify-around md:justify-start items-center w-full max-w-7xl mx-auto gap-1">
          
          <button onClick={() => setActiveTab("rutina")} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-2 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all flex-1 md:flex-none ${activeTab === "rutina" ? "text-amber-400 md:bg-amber-500 md:text-black md:shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300 md:bg-zinc-900/50 md:border md:border-zinc-800"}`}>
            <span className="text-2xl md:text-lg">📋</span>
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">Plan</span>
          </button>
          
          <button onClick={() => setActiveTab("videos")} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-2 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all flex-1 md:flex-none ${activeTab === "videos" ? "text-amber-400 md:bg-amber-500 md:text-black md:shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300 md:bg-zinc-900/50 md:border md:border-zinc-800"}`}>
            <span className="text-2xl md:text-lg">📹</span>
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">Video {!canViewVideos && "🔒"}</span>
          </button>
          
          <button onClick={() => setActiveTab("boveda")} className={`hidden md:flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-2 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all flex-1 md:flex-none ${activeTab === "boveda" ? "text-amber-400 md:bg-amber-500 md:text-black md:shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300 md:bg-zinc-900/50 md:border md:border-zinc-800"}`}>
            <span className="text-2xl md:text-lg">🏛️</span>
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">Bóveda {!isElitePlan && "🔒"}</span>
          </button>
          
          <button onClick={() => setActiveTab("rm")} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-2 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all flex-1 md:flex-none ${activeTab === "rm" ? "text-amber-400 md:bg-amber-500 md:text-black md:shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300 md:bg-zinc-900/50 md:border md:border-zinc-800"}`}>
            <span className="text-2xl md:text-lg">📈</span>
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">RMs {!canViewRMs && "🔒"}</span>
          </button>
          
          <button onClick={() => setActiveTab("checkin")} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-2 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all flex-1 md:flex-none ${activeTab === "checkin" ? "text-amber-400 md:bg-amber-500 md:text-black md:shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300 md:bg-zinc-900/50 md:border md:border-zinc-800"}`}>
            <span className="text-2xl md:text-lg">⚡</span>
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">SNC {!canViewSNC && "🔒"}</span>
          </button>
          
          <div className="hidden lg:block flex-1"></div>
          
          <button onClick={() => setActiveTab("asistente")} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-2 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all flex-1 md:flex-none ${activeTab === "asistente" ? "text-blue-400 md:bg-blue-600 md:text-white md:shadow-[0_0_30px_rgba(37,99,235,0.4)] md:border-blue-500" : "text-blue-500/50 hover:text-blue-400 md:bg-blue-900/10 md:border md:border-blue-900/30"}`}>
            <span className="text-2xl md:text-lg">🤖</span>
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">IA {!canViewAI && "🔒"}</span>
          </button>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        
{/* ─── PANTALLA ASISTENTE IA ─── */}
        {activeTab === "asistente" && (
           <>
             {!canViewAI ? (
                 <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900/40 border border-blue-900/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center h-[60vh] min-h-[400px]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 border border-blue-500/20 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10 shadow-inner">🤖</div>
                     <h3 className="text-3xl md:text-5xl font-black italic text-white mb-4 tracking-tighter relative z-10 uppercase">SISTEMA <span className="text-blue-500">RESTRINGIDO</span></h3>
                     <p className="text-zinc-400 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">La tecnología de soporte biomecánico y análisis nutricional de Tujague AI es exclusiva para atletas en la Mentoría Élite.</p>
                     <a href={whatsappUpsellUrl} target="_blank" className="relative z-10 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 w-full sm:w-auto">
                         POSTULARME A MENTORÍA ÉLITE 🚀
                     </a>
                 </div>
              ) : (
                  <div className="max-w-5xl mx-auto flex flex-col h-[75vh] min-h-[600px] bg-[#0a0a0c] border border-zinc-800/80 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20"></div>
                     
                     <div className="p-4 md:p-6 border-b border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between bg-black/40 relative z-10 gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-2xl md:text-3xl shadow-inner relative shrink-0">
                               {aiMode === 'chef' ? '👨‍🍳' : '🤖'}
                               <span className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 border-2 border-black rounded-full"></span>
                            </div>
                            <div>
                               <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight flex items-center gap-2">Tujague <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">AI System</span></h3>
                               <p className="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">
                                  {aiMode === 'chef' ? 'Asesoría Nutricional Clínica' : 'Análisis Biomecánico & Técnico'}
                               </p>
                            </div>
                        </div>

                        <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full md:w-auto">
                           <button onClick={() => setAiMode('biomechanic')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${aiMode === 'biomechanic' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                              ⚙️ Biomecánica
                           </button>
                           <button onClick={() => setAiMode('chef')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${aiMode === 'chef' ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'text-zinc-500 hover:text-white'}`}>
                              👨‍🍳 Nutrición
                           </button>
                        </div>
                     </div>

                     {aiMode === 'chef' && (
                         <div className="p-4 md:p-6 bg-gradient-to-b from-orange-950/20 to-transparent border-b border-zinc-800/50 relative z-20 overflow-y-auto max-h-[50vh]">
                             
                             {(order?.macro_calories || order?.macro_protein || order?.macro_carbs || order?.macro_fats) && (
                                 <div className="mb-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl md:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                     <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎯</span>
                                        <div>
                                            <p className="text-[9px] md:text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Directrices del Coach Activas</p>
                                            <p className="text-xs md:text-sm text-white font-bold">
                                                {order.macro_calories || 'N/A'} Kcal | {order.macro_protein || 'N/A'} Prot | {order.macro_carbs || 'N/A'} Carbs | {order.macro_fats || 'N/A'} Grasas | {order.macro_water || 'N/A'}
                                            </p>
                                        </div>
                                     </div>
                                 </div>
                             )}

                             <div className="flex justify-between items-center mb-4 bg-black/40 p-4 rounded-xl border border-zinc-800">
                                <p className="text-orange-400 font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2">
                                   <span className="text-base">⚡</span> Calculadora Metabólica
                                </p>
                                <button onClick={() => setShowChefForm(!showChefForm)} className="text-zinc-400 hover:text-white text-xs font-bold bg-zinc-900 px-4 py-2 rounded-lg transition-colors border border-zinc-700">
                                   {showChefForm ? 'Ocultar Herramienta' : 'Configurar Manual'}
                                </button>
                             </div>
                             
                             {showChefForm && (
                                 <div className="animate-in slide-in-from-top-2 space-y-4 bg-black/60 p-5 rounded-2xl border border-zinc-800 mb-6 shadow-inner">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                                            <label className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-widest mb-2 block">Objetivo</label>
                                            <select value={dietGoal} onChange={e=>setDietGoal(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 p-3 md:p-4 rounded-xl text-xs md:text-sm text-white outline-none focus:border-orange-500 transition-colors">
                                                <option value="volumen">Superávit (Ganar Fuerza)</option>
                                                <option value="mantenimiento">Mantenimiento (Recomposición)</option>
                                                <option value="deficit">Déficit (Definición)</option>
                                            </select>
                                         </div>
                                         <div>
                                            <label className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-widest mb-2 block">Actividad Diaria</label>
                                            <select value={activityLevel} onChange={e=>setActivityLevel(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 p-3 md:p-4 rounded-xl text-xs md:text-sm text-white outline-none focus:border-orange-500 transition-colors">
                                                <option value="sedentario">Sedentario (Trabajo de oficina)</option>
                                                <option value="ligero">Ligero (10k pasos/día)</option>
                                                <option value="moderado">Moderado (Entreno + Activo)</option>
                                                <option value="intenso">Intenso (Trabajo Físico Pesado)</option>
                                            </select>
                                         </div>
                                     </div>
                                     
                                     <button type="button" onClick={handleCalculateMacros} className="w-full bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all border border-orange-500/50">
                                         Calcular Macros (Basado en {checkin.weight || '0'}kg)
                                     </button>

                                     {calculatedMacros && (
                                         <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl grid grid-cols-5 text-center divide-x divide-orange-500/20 mt-4 shadow-inner">
                                             <div><p className="text-[8px] md:text-[10px] text-orange-400 font-bold uppercase mb-1">Kcal</p><p className="font-mono font-black text-white text-xs md:text-base">{calculatedMacros.cals}</p></div>
                                             <div><p className="text-[8px] md:text-[10px] text-orange-400 font-bold uppercase mb-1">Prot</p><p className="font-mono font-black text-white text-xs md:text-base">{calculatedMacros.prot}g</p></div>
                                             <div><p className="text-[8px] md:text-[10px] text-orange-400 font-bold uppercase mb-1">Carbs</p><p className="font-mono font-black text-white text-xs md:text-base">{calculatedMacros.carbs}g</p></div>
                                             <div><p className="text-[8px] md:text-[10px] text-orange-400 font-bold uppercase mb-1">Grasas</p><p className="font-mono font-black text-white text-xs md:text-base">{calculatedMacros.fats}g</p></div>
                                             <div><p className="text-[8px] md:text-[10px] text-orange-400 font-bold uppercase mb-1">Agua</p><p className="font-mono font-black text-white text-xs md:text-base">{calculatedMacros.water}L</p></div>
                                         </div>
                                     )}
                                 </div>
                             )}

                             <form onSubmit={handleQuickChefRequest} className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800">
                                 <input type="text" value={chefIngredients} onChange={e=>setChefIngredients(e.target.value)} placeholder="Ej: Tengo Arroz, pollo, huevos y avena..." className="flex-1 bg-black border border-zinc-700 p-4 md:p-5 rounded-xl text-sm text-white outline-none focus:border-orange-500 transition-colors shadow-inner" />
                                 <button type="submit" disabled={isTyping || !chefIngredients.trim()} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 md:py-5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] disabled:opacity-50 shrink-0 flex items-center justify-center gap-2">
                                     🥩 Generar Menú 
                                 </button>
                             </form>
                         </div>
                     )}

                     <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar relative z-10 bg-black/20">
                        {aiMode === 'biomechanic' ? (
                           <>
                              {bioHistory.map((msg, index) => (
                                 <div key={index} className={`flex flex-col max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-zinc-500' : 'text-emerald-500'}`}>{msg.role === 'user' ? 'Atleta' : 'Tujague AI'}</span>
                                    <div className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-base font-medium leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-zinc-800/90 text-white rounded-tr-sm border border-zinc-700/50' : 'bg-gradient-to-br from-blue-950/60 to-emerald-950/20 border border-blue-500/30 text-blue-50 rounded-tl-sm whitespace-pre-wrap'}`}>
                                       {msg.content}
                                    </div>
                                 </div>
                              ))}
                           </>
                        ) : (
                           <>
                              {chefHistory.map((msg, index) => (
                                 <div key={index} className={`flex flex-col max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-zinc-500' : 'text-orange-500'}`}>{msg.role === 'user' ? 'Atleta' : 'Asesor Culinario'}</span>
                                    <div className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-base font-medium leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-zinc-800/90 text-white rounded-tr-sm border border-zinc-700/50' : 'bg-gradient-to-br from-orange-950/60 to-[#0a0a0c] border border-orange-500/30 text-orange-50 rounded-tl-sm whitespace-pre-wrap'}`}>
                                       {msg.content}
                                    </div>
                                 </div>
                              ))}
                           </>
                        )}
                        
                        {isTyping && (
                           <div className="mr-auto flex flex-col items-start max-w-[80%]">
                              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 text-emerald-500">Procesando Base de Datos...</span>
                              <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-blue-950/60 to-emerald-950/20 border border-blue-500/30 rounded-tl-sm flex items-center gap-2 shadow-lg">
                                 <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full animate-bounce"></span>
                                 <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                                 <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                              </div>
                           </div>
                        )}
                        <div ref={chatEndRef} />
                     </div>

                     <div className="p-4 md:p-6 border-t border-zinc-800/80 bg-zinc-950 relative z-10 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                        <form onSubmit={aiMode === 'chef' ? handleChefMessage : handleBioMessage} className="flex gap-3 md:gap-4 items-center">
                           <input 
                              type="text" 
                              className="flex-1 bg-black border border-zinc-700/80 rounded-xl md:rounded-2xl px-5 py-4 md:py-5 text-sm md:text-base text-white font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600 shadow-inner" 
                              placeholder={aiMode === 'chef' ? "Haz una consulta nutricional libre..." : "Escribe tu consulta sobre técnica, programación o fatiga..."}
                              value={aiMode === 'chef' ? chefInput : bioInput} 
                              onChange={(e) => aiMode === 'chef' ? setChefInput(e.target.value) : setBioInput(e.target.value)} 
                              disabled={isTyping}
                           />
                           <button type="submit" disabled={isTyping || (aiMode === 'chef' && !chefInput.trim()) || (aiMode === 'biomechanic' && !bioInput.trim())} className={`px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all disabled:opacity-50 text-white shrink-0 ${aiMode === 'chef' ? 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_25px_rgba(234,88,12,0.4)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.4)]'}`}>
                              ENVIAR
                           </button>
                        </form>
                     </div>
                  </div>
              )}
           </>
        )}

        {/* ─── PESTAÑA RUTINA + BOTÓN DE PÁNICO Y GENERADOR PDF PREMIUM ─── */}
        {activeTab === "rutina" && (
          <div className="relative pb-24 max-w-[100vw] overflow-x-hidden md:max-w-6xl mx-auto"> 

            {/* 🔥 VISTA EXCLUSIVA PARA PLANES ESTÁTICOS / CALCULADORA 🔥 */}
            {isStaticPlan ? (
                <div className="bg-[#0a0a0c] border border-emerald-500/30 p-10 md:p-20 rounded-[3rem] text-center shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden my-10 max-w-4xl mx-auto animate-in zoom-in duration-500">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    {safePlanId.includes('calculadora') ? (
                        <>
                            <h2 className="text-4xl md:text-6xl font-black italic text-white mb-6 tracking-tighter uppercase relative z-10">JUNK VOLUME <span className="text-amber-500">KILLER</span></h2>
                            <p className="text-zinc-400 font-medium text-sm md:text-lg max-w-2xl mx-auto mb-10 relative z-10">Tu software de diagnóstico está listo. Ingresá a la herramienta interactiva para auditar tu rutina y descargar el Material de Rescate.</p>
                            
                            <Link href="/dashboard/producto/calculadora-volumen-basura" className="relative z-10 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-black px-12 py-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95">
                                🧮 INICIAR SOFTWARE DE DIAGNÓSTICO
                            </Link>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl md:text-6xl font-black italic text-white mb-6 tracking-tighter uppercase relative z-10">TU ESTRUCTURA ESTÁ <span className="text-emerald-500">LISTA</span></h2>
                            <p className="text-zinc-400 font-medium text-sm md:text-lg max-w-2xl mx-auto mb-10 relative z-10">Has adquirido el programa estático. El documento PDF oficial contiene toda la planificación y parámetros a seguir.</p>
                            
                            <button 
                                onClick={handleDownloadSecureMeso}
                                disabled={isDownloadingMeso}
                                className="relative z-10 inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-black px-12 py-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {isDownloadingMeso ? '🔐 ENCRIPTANDO DOCUMENTO...' : '📥 DESCARGAR PDF OFICIAL'}
                            </button>
                        </>
                    )}
</div>
            ) : (
            /* 🔥 VISTA DE RUTINA NORMAL PARA MENTORÍA ÉLITE 🔥 */
                <>
                  <div className="mb-8 bg-gradient-to-br from-amber-900/20 to-[#0a0a0c] p-8 md:p-10 rounded-[2.5rem] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div>
                              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Panel Activo
                              </p>
                              <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">
                                  Hoja de <span className="text-amber-500">Ruta</span>
                              </h2>
                              <p className="text-zinc-400 font-medium mt-2 max-w-lg text-sm md:text-base">Ejecución táctica programada. La intensidad no se negocia. Registrá tus marcas al terminar.</p>
                          </div>
                          
                          <div className="flex flex-col w-full md:w-auto gap-3">
                             <button 
                                 onClick={downloadPDF}
                                 disabled={generatingPDF || !hasRoutines}
                                 className="w-full justify-center bg-black hover:bg-zinc-900 text-white px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3 border border-zinc-700 hover:border-amber-500 transition-all disabled:opacity-50 shadow-md active:scale-95"
                             >
                                 {generatingPDF ? 'GENERANDO...' : '📄 EXPORTAR A PDF'}
                             </button>

                             {isElitePlan && (
                                 <button 
                                    onClick={() => setShowPanicModal(true)}
                                    className="w-full justify-center bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-500 px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-inner active:scale-95"
                                 >
                                    🚨 REPORTE DE EMERGENCIA
                                 </button>
                             )}
                          </div>
                      </div>
                  </div>

                  {/* MODAL BOTON DE PANICO */}
                  {showPanicModal && (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                         <div className="bg-[#0a0a0c] border border-red-900/50 p-8 md:p-10 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_80px_rgba(239,68,68,0.25)] relative overflow-hidden animate-in zoom-in duration-300">
                             <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                             <button onClick={() => setShowPanicModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white font-bold text-xl">✕</button>
                             
                             <h3 className="text-2xl md:text-3xl font-black italic text-red-500 uppercase tracking-tighter mb-2 flex items-center gap-3">🚨 Botón de Pánico</h3>
                             <p className="text-zinc-400 text-xs md:text-sm mb-8 font-medium leading-relaxed">Informe de inmediato la alteración logística o fisiológica para que la IA recalibre la sesión respetando el patrón motor.</p>
                             
                             {!panicResponse ? (
                                 <form onSubmit={handlePanicRequest} className="space-y-5 relative z-10">
                                     <div>
                                         <label className="text-[10px] md:text-xs font-black text-red-400 uppercase tracking-widest mb-2 block">Ejercicio a sustituir</label>
                                         <input type="text" required value={panicExercise} onChange={e=>setPanicExercise(e.target.value)} placeholder="Ej: Prensa a 45 grados" className="w-full bg-black border border-zinc-800 p-4 md:p-5 rounded-xl text-sm md:text-base text-white outline-none focus:border-red-500 transition-colors" />
                                     </div>
                                     <div>
                                         <label className="text-[10px] md:text-xs font-black text-red-400 uppercase tracking-widest mb-2 block">Motivo clínico o logístico</label>
                                         <input type="text" required value={panicProblem} onChange={e=>setPanicProblem(e.target.value)} placeholder="Ej: Presento molestia aguda en el tendón rotuliano..." className="w-full bg-black border border-zinc-800 p-4 md:p-5 rounded-xl text-sm md:text-base text-white outline-none focus:border-red-500 transition-colors" />
                                     </div>
                                     <button type="submit" disabled={panicLoading} className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] mt-4 disabled:opacity-50 active:scale-95">
                                         {panicLoading ? 'PROCESANDO ESTRUCTURA...' : 'SOLICITAR REEMPLAZO 🔄'}
                                     </button>
                                 </form>
                             ) : (
                                 <div className="space-y-6 animate-in zoom-in duration-300">
                                     <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl shadow-inner">
                                         <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Determinación del Sistema</p>
                                         <p className="text-red-50 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">{panicResponse}</p>
                                     </div>
                                     <button onClick={() => {setShowPanicModal(false); setPanicResponse(""); setPanicExercise(""); setPanicProblem("");}} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Comprendido. Retomando entrenamiento.</button>
                                 </div>
                             )}
                         </div>
                     </div>
                  )}

{/* ─── HERRAMIENTAS DE PRECISIÓN (ÉLITE) ─── */}
                  <div className="grid grid-cols-1 gap-6 md:gap-8 mb-8">
                     
                     {/* 🔥 THE JUNK VOLUME KILLER (HERRAMIENTA ÉLITE) 🔥 */}
                     <div className="bg-gradient-to-r from-red-950/40 to-black border border-red-500/30 p-6 md:p-8 rounded-[2rem] shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] pointer-events-none group-hover:bg-red-500/20 transition-all duration-700"></div>
                        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">🧮</div>
                            <div>
                                <h3 className="text-2xl font-black italic text-white tracking-tighter uppercase mb-1">Junk Volume <span className="text-red-500">Killer</span></h3>
                                <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Auditoría Quirúrgica de Volumen</p>
                            </div>
                        </div>
                        <Link href="/dashboard/producto/calculadora-volumen-basura" className="relative z-10 w-full md:w-auto bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 text-center flex items-center justify-center gap-2">
                            <span>INICIAR SOFTWARE</span> <span className="text-lg">→</span>
                        </Link>
                     </div>

                     {/* CALCULADORA DE CARGA */}
                     <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🧮</div>
                              <div>
                                 <h3 className="text-white font-black italic uppercase tracking-tighter text-xl md:text-2xl">Parámetros de Carga</h3>
                                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Calculadora de Intensidad</p>
                              </div>
                           </div>
                           {isElitePlan && (
                               <button onClick={handleGenerateWarmup} disabled={generatingWarmup} className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full sm:w-auto justify-center mt-4 sm:mt-0">
                                  {generatingWarmup ? 'Analizando...' : '🤖 Generar Warm-Up'}
                               </button>
                           )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                           <select value={calcLift} onChange={(e) => setCalcLift(e.target.value)} className="bg-[#050505] border border-zinc-800 text-zinc-300 text-sm md:text-base font-bold uppercase rounded-2xl px-5 py-5 outline-none focus:border-amber-500 flex-1 shadow-inner cursor-pointer appearance-none">
                              <option value="squat">Sentadilla</option>
                              <option value="bench">Press Banca</option>
                              <option value="deadlift">Peso Muerto</option>
                              <option value="dips">Fondos</option>
                              <option value="military">Militar</option>
                           </select>
                           <div className="relative w-full sm:w-32">
                              <input type="number" value={calcPercent} onChange={(e) => setCalcPercent(Number(e.target.value))} className="w-full h-full bg-[#050505] border border-zinc-800 text-white text-center text-2xl font-black rounded-2xl outline-none focus:border-amber-500 shadow-inner py-4 transition-colors" />
                              <span className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-500 font-bold text-sm">%</span>
                           </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-amber-600 to-amber-400 text-black px-8 py-6 rounded-2xl flex justify-between items-center shadow-[0_0_30px_rgba(245,158,11,0.3)] mt-auto border border-amber-300 relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                           <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] relative z-10">Carga a utilizar:</span>
                           <span className="text-4xl md:text-5xl font-black italic tracking-tighter relative z-10">{calculatedWeight} <span className="text-lg md:text-xl text-black/70 not-italic">KG</span></span>
                        </div>
                        
                        {warmupPlan && (
                            <div className="mt-8 p-6 bg-blue-950/40 border border-blue-500/30 rounded-2xl animate-in fade-in slide-in-from-top-4 shadow-xl">
                                <span className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-blue-500/20 pb-3">
                                   <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                   Protocolo de Aproximación
                                </span>
                                <p className="text-sm text-blue-50 font-medium leading-relaxed whitespace-pre-wrap">{warmupPlan}</p>
                            </div>
                        )}
                     </div>
                  </div>

                  {/* 🔥 CICLOS (Macrociclos y Mesociclos) */}
                  {(order.macrocycle || order.mesocycle || order.microcycle) && (
                    <div className="mb-8 bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] flex flex-col lg:flex-row gap-6 justify-between items-stretch shadow-xl relative overflow-hidden">
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                         {order.macrocycle && (
                           <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl shadow-inner hover:border-amber-500/30 transition-colors">
                              <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Macrociclo</p>
                              <p className="text-base md:text-lg font-bold text-white tracking-tight">{order.macrocycle}</p>
                           </div>
                         )}
                         {order.mesocycle && (
                           <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl shadow-inner hover:border-amber-500/30 transition-colors">
                              <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Mesociclo</p>
                              <p className="text-base md:text-lg font-bold text-white tracking-tight">{order.mesocycle}</p>
                           </div>
                         )}
                         {order.microcycle && (
                           <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-[20px]"></div>
                              <p className="text-[9px] md:text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 relative z-10">
                                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Microciclo Activo
                              </p>
                              <p className="text-lg md:text-xl font-black text-amber-400 tracking-tight relative z-10">{order.microcycle}</p>
                           </div>
                         )}
                      </div>
                    </div>
                  )}

                  {/* ✅ DIRECTRICES NUTRICIONALES */}
                  {(order.macro_calories || order.macro_protein || order.macro_carbs || order.macro_fats || order.macro_water || calculatedMacros) && (
                      <div className="mb-10 bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                          <h3 className="text-[10px] md:text-xs font-black italic text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                              <span className="text-2xl bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">🥩</span> 
                              Directrices Nutricionales del Coach
                          </h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5 relative z-10">
                              <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl shadow-inner">
                                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Calorías</p>
                                  <p className="text-xl md:text-2xl font-black text-white">{order.macro_calories || (calculatedMacros?.cals ? calculatedMacros.cals + ' kcal' : '-')}</p>
                              </div>
                              <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl shadow-inner">
                                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Proteína</p>
                                  <p className="text-xl md:text-2xl font-black text-white">{order.macro_protein || (calculatedMacros?.prot ? calculatedMacros.prot + 'g' : '-')}</p>
                              </div>
                              <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl shadow-inner">
                                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Carbohidratos</p>
                                  <p className="text-xl md:text-2xl font-black text-white">{order.macro_carbs || (calculatedMacros?.carbs ? calculatedMacros.carbs + 'g' : '-')}</p>
                              </div>
                              <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl shadow-inner">
                                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Grasas</p>
                                  <p className="text-xl md:text-2xl font-black text-white">{order.macro_fats || (calculatedMacros?.fats ? calculatedMacros.fats + 'g' : '-')}</p>
                              </div>
                              <div className="bg-[#050505] border border-white/5 p-5 rounded-2xl md:col-span-1 shadow-inner">
                                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Agua</p>
                                  <p className="text-xl md:text-2xl font-black text-blue-400 drop-shadow-md">{order.macro_water || (calculatedMacros?.water ? calculatedMacros.water + ' L' : '-')}</p>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* RUTINAS DIARIAS */}
                  {!hasRoutines ? (
                    <div className="bg-[#0a0a0c] border border-zinc-800/80 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl relative overflow-hidden mb-8 animate-in fade-in duration-500">
                        <h3 className="text-3xl md:text-5xl font-black italic text-white mb-12 tracking-tighter uppercase relative z-10">
                            Estado del <span className="text-amber-500">Sistema</span>
                        </h3>
                        
                        <div className="relative max-w-4xl mx-auto mb-16">
                            <div className="hidden md:block absolute top-8 left-12 right-12 h-2 bg-[#050505] z-0 rounded-full shadow-inner border border-zinc-800"></div>
                            <div className={`hidden md:block absolute top-8 left-12 h-2 z-0 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all duration-1000 ${order.status === 'paid' ? 'w-[60%] bg-amber-500' : 'w-[20%] bg-amber-500'}`}></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 relative z-10">
                                
                                <div className="flex flex-col items-center gap-4">
                                    {order.status === 'paid' ? (
                                        <>
                                           <div className="w-16 h-16 rounded-3xl bg-amber-500 text-black flex items-center justify-center font-black text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)]">✓</div>
                                           <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-400 mt-2">1. Pago Verificado</p>
                                        </>
                                    ) : (
                                        <>
                                           <div className="w-16 h-16 rounded-3xl bg-zinc-950 border-2 border-amber-500 text-amber-500 flex items-center justify-center font-black text-3xl animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.2)]">⏳</div>
                                           <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-400 mt-2">1. Validando Pago</p>
                                        </>
                                    )}
                                </div>

                                <div className={`flex flex-col items-center gap-4 ${order.status === 'paid' ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-3xl transition-all ${order.status === 'paid' ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-[#050505] border border-zinc-700 text-zinc-600'}`}>✓</div>
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-400 mt-2">2. Clínica Aprobada</p>
                                </div>

                                <div className={`flex flex-col items-center gap-4 ${order.status === 'paid' ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-3xl transition-all ${order.status === 'paid' ? 'bg-black border-2 border-amber-500 text-amber-500 animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-[#050505] border border-zinc-700 text-zinc-600'}`}>⚙️</div>
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white mt-2">3. Diseño en Proceso</p>
                                </div>

                                <div className="flex flex-col items-center gap-4 opacity-30">
                                    <div className="w-16 h-16 rounded-3xl bg-[#050505] border-2 border-zinc-800 text-zinc-600 flex items-center justify-center font-black text-3xl">🚀</div>
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500 mt-2">4. Plan Listo</p>
                                </div>
                            </div>
                        </div>

                        {order.status !== 'paid' && (
                            <p className="text-amber-500 text-xs md:text-sm font-bold mt-8 animate-pulse bg-amber-500/10 p-4 rounded-xl inline-block border border-amber-500/20">
                                El Coach está revisando tu transferencia. La Mentoría comenzará a diseñarse en breve.
                            </p>
                        )}
                    </div>
                  ) : (
                    <>
                       {logFeedback && (
                          <div className="mb-10 p-6 md:p-8 bg-gradient-to-r from-blue-950/60 to-[#0a0a0c] border-l-4 border-l-blue-500 border-y border-r border-zinc-800 rounded-r-3xl shadow-xl animate-in slide-in-from-left-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                              <span className="text-[10px] md:text-xs text-blue-400 font-black uppercase tracking-widest flex items-center gap-3 mb-3 relative z-10">
                                 <span className="text-2xl">🤖</span> Auditoría de Bitácora (Tujague AI)
                              </span>
                              <p className="text-sm md:text-base text-blue-50 font-medium leading-relaxed italic relative z-10">"{logFeedback}"</p>
                          </div>
                       )}

                       <div className="w-full relative">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
                            {days.map(day => {
                              if (!order[`routine_${day.id}`]) return null;
                              return (
                                <div key={day.id} className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl flex flex-col hover:border-amber-500/30 transition-colors group">
                                   <h3 className="text-2xl font-black italic text-amber-400 mb-6 uppercase tracking-tight drop-shadow-md group-hover:scale-105 transition-transform origin-left">{day.label}</h3>
                                   
                                   <div className="bg-[#050505] border border-zinc-800/80 rounded-2xl p-5 md:p-6 mb-8 shadow-inner flex-1">
                                       <div 
                                           className="text-zinc-200 font-medium text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words"
                                           style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                       >
                                           {order[`routine_${day.id}`]}
                                       </div>
                                   </div>

                                   <div className="mt-auto border-t border-zinc-800 pt-6">
                                      <p className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2 group-hover:text-amber-500 transition-colors"><span>📓</span> Registro Fisiológico de Sesión</p>
                                      <textarea 
                                         className="w-full bg-[#050505] border border-zinc-800 rounded-xl p-4 text-zinc-300 text-xs md:text-sm font-medium outline-none focus:border-amber-500/50 resize-none h-28 md:h-32 placeholder:text-zinc-700 custom-scrollbar whitespace-pre-wrap shadow-inner transition-colors" 
                                         placeholder="Ej: Sentadilla completada. RPE 8. Presencia de ligera fatiga sistémica..." 
                                         value={logs[day.id as keyof typeof logs]} 
                                         onChange={(e) => setLogs({...logs, [day.id]: e.target.value})} 
                                      />
                                   </div>
                                </div>
                              )
                            })}
                          </div>
                       </div>

                       {/* BOTÓN FLOTANTE DE GUARDADO */}
                       <div className="fixed bottom-24 md:bottom-10 left-0 w-full flex justify-center z-[45] pointer-events-none px-4">
                          <button 
                             onClick={handleSaveLogs} 
                             disabled={savingLogs} 
                             className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black px-8 md:px-14 py-4 md:py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 pointer-events-auto text-[10px] md:text-sm border-2 border-amber-200"
                          >
                             {savingLogs ? "SINCRONIZANDO..." : "💾 GUARDAR MARCAS DE HOY"}
                          </button>
                       </div>
                    </>
                  )}
                </>
            )}
          </div>
        )}

{/* ─── PESTAÑA BOVEDA TÉCNICA ─── */}
        {activeTab === "boveda" && (
           <>
             {!isElitePlan ? (
                 <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900/40 border border-red-900/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center h-[60vh] min-h-[400px]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 border border-red-500/20 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10 shadow-inner">🏛️</div>
                     <h3 className="text-3xl md:text-5xl font-black italic text-white mb-4 tracking-tighter relative z-10 uppercase">MÓDULO <span className="text-red-500">RESTRINGIDO</span></h3>
                     <p className="text-zinc-400 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">La Bóveda Técnica y los manuales de calibración biomecánica están reservados exclusivamente para atletas de la Mentoría Élite.</p>
                     <a href={whatsappUpsellUrl} target="_blank" className="relative z-10 inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 w-full sm:w-auto">
                         AGENDAR LLAMADA DE ADMISIÓN 📞
                     </a>
                 </div>
             ) : (
                <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
                   <div className="text-center mb-10">
                      <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">Bóveda Técnica <span className="text-amber-500">BII-Vintage</span></h2>
                      <p className="text-zinc-400 mt-4 text-sm md:text-base font-medium max-w-2xl mx-auto">Estudie rigurosamente el diseño de palancas y ejecución antes del abordaje práctico en el gimnasio.</p>
                   </div>

                   {/* 🔥 BANNER DEL KIT ACELERADOR VIP 🔥 */}
                   {(order?.has_kit || order?.wants_kit || order?.upsell_kit) && (
                       <div className="bg-gradient-to-r from-amber-900/40 to-[#0a0a0c] border border-amber-500/50 p-6 md:p-10 rounded-[2rem] shadow-[0_0_40px_rgba(245,158,11,0.2)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden mb-12 group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>
                           <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                               <div className="w-16 h-16 md:w-20 md:h-20 bg-black border border-amber-500/50 rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">📚</div>
                               <div className="text-left">
                                   <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-500 mb-1 block animate-pulse">Material Premium Desbloqueado</span>
                                   <h3 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter uppercase">Kit Acelerador BII-Vintage</h3>
                                   <p className="text-zinc-300 font-medium text-sm mt-1">Guía definitiva de nutrición, descansos y mentalidad.</p>
                               </div>
                           </div>
                           <button onClick={handleDownloadKit} className="relative z-10 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black px-8 py-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 whitespace-nowrap w-full md:w-auto border border-amber-200">
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
                         <div key={video.id} className="bg-[#050505] border border-zinc-800/80 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:border-amber-500/30 transition-all group">
                            <div className="p-6 md:p-8 border-b border-zinc-800 bg-[#0a0a0c]">
                               <h3 className="font-black italic uppercase text-lg md:text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">{video.name}</h3>
                            </div>
                            {video.url ? (
                               <div className="aspect-video w-full bg-black">
                                  <iframe width="100%" height="100%" src={video.url} title={video.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                               </div>
                            ) : (
                               <div className="aspect-video w-full bg-black flex flex-col items-center justify-center p-8 relative shadow-inner">
                                   <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-950 rounded-[2rem] flex items-center justify-center border border-zinc-800 mb-6 opacity-50 shadow-inner group-hover:scale-110 transition-transform"><span className="text-3xl">🔒</span></div>
                                   <h4 className="text-zinc-500 font-black tracking-widest text-[10px] md:text-xs uppercase text-center">Clínica Técnica en Producción</h4>
                                   <p className="text-zinc-600 text-[9px] md:text-[10px] mt-2 font-bold uppercase tracking-widest">Coach Luciano Tujague</p>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                </div>
             )}
           </>
        )}

{/* ─── PESTAÑA DE AUDITORÍA DE VIDEOS ─── */}
        {activeTab === "videos" && (
           <>
             {!canViewVideos ? (
                 <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900/40 border border-red-900/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center h-[60vh] min-h-[400px]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 border border-red-500/20 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10 shadow-inner">📹</div>
                     <h3 className="text-3xl md:text-5xl font-black italic text-white mb-4 tracking-tighter relative z-10 uppercase">MÓDULO <span className="text-red-500">RESTRINGIDO</span></h3>
                     <p className="text-zinc-400 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">Tu plan actual no incluye auditoría en video. Esta herramienta de precisión biomecánica es exclusiva para los atletas bajo Mentoría Élite.</p>
                     <a href={whatsappUpsellUrl} target="_blank" className="relative z-10 inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 w-full sm:w-auto">
                         AGENDAR LLAMADA DE ADMISIÓN 📞
                     </a>
                 </div>
             ) : (
                <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
                   <div className="space-y-16">
                      {/* VIDEOS PRINCIPALES */}
                      <div>
                         <div className="text-center md:text-left mb-10">
<h3 className="text-3xl md:text-4xl font-black italic text-amber-500 uppercase tracking-tighter drop-shadow-md">Auditoría <span className="text-white">Biomecánica</span></h3>
                            <p className="text-zinc-400 font-medium text-sm md:text-base mt-2">Módulo clínico de corrección. Aporte su ejecución para recibir el dictamen técnico del Head Coach.</p>
                         </div>
                         
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                           {mainLifts.map(lift => (
                              <div key={lift.id} className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl hover:border-amber-500/30 transition-colors group">
                                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-zinc-800/50 pb-6">
                                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{lift.label}</h3>
                                    {order[`video_${lift.id}`] 
                                        ? <span className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase border border-amber-500/30 shadow-inner w-full sm:w-auto text-center">Evidencia Cargada</span> 
                                        : <span className="bg-[#050505] border border-zinc-800 text-zinc-500 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase w-full sm:w-auto text-center">En Espera</span>
                                    }
                                 </div>

                                 <div className="mb-8 bg-[#050505] border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
                                    <div>
                                       <p className="text-xs md:text-sm text-zinc-300 font-bold mb-2 uppercase tracking-widest">Aportar Serie Efectiva</p>
                                       <p className="text-[10px] text-zinc-500 font-medium">Extensión: MP4/MOV (Máx 50MB)</p>
                                    </div>
                                    <label className={`cursor-pointer px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center shrink-0 w-full sm:w-auto shadow-md ${uploading === lift.id ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95'}`}>
                                       {uploading === lift.id ? 'TRANSMITIENDO...' : 'CARGAR VIDEO 📹'}
                                       <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, lift.id)} disabled={uploading === lift.id} />
                                    </label>
                                 </div>

                                 <div className="bg-amber-950/20 border border-amber-500/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-inner">
                                    <h4 className="flex items-center gap-3 text-amber-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4">
                                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Auditoría del Coach
                                    </h4>
                                    {order[`feedback_${lift.id}`] ? (
                                      <p className="text-amber-50 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{order[`feedback_${lift.id}`]}</p>
                                    ) : (
                                      <p className="text-amber-500/40 text-xs md:text-sm italic font-medium">Se requiere material visual para iniciar la evaluación técnica.</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                         </div>
                      </div>

                      {/* VIDEOS EXTRAS */}
                      <div className="pt-10 border-t border-white/5">
                         <div className="text-center md:text-left mb-10">
                            <h3 className="text-3xl md:text-4xl font-black italic text-zinc-400 uppercase tracking-tighter drop-shadow-md">Módulo de Accesorios</h3>
                            <p className="text-zinc-500 font-medium text-sm md:text-base mt-2">Aporte visual para variantes y máquinas.</p>
                         </div>
                         
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                           {extraLifts.map(lift => (
                              <div key={lift.id} className="bg-black border border-dashed border-zinc-800/80 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl hover:border-blue-500/30 transition-colors">
                                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-zinc-800/50 pb-6">
                                    <input 
                                       type="text"
                                       placeholder="Nomenclatura (Ej: Hack Squat)..."
                                       value={order[`name_${lift.id}`] || ''}
                                       onChange={(e) => handleUpdateExtraName(lift.id, e.target.value)}
                                       className="bg-transparent text-xl md:text-2xl font-black italic text-white uppercase outline-none placeholder:text-zinc-700 w-full sm:w-2/3 focus:text-blue-400 transition-colors"
                                    />
                                    {order[`video_${lift.id}`] 
                                        ? <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase border border-blue-500/30 shadow-inner w-full sm:w-auto text-center mt-4 sm:mt-0">Evidencia Cargada</span> 
                                        : <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase w-full sm:w-auto text-center mt-4 sm:mt-0">En Espera</span>
                                    }
                                 </div>

                                 <div className="mb-8 bg-zinc-900/40 border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
                                    <div>
                                       <p className="text-xs md:text-sm text-zinc-300 font-bold mb-2 uppercase tracking-widest">Aportar Ejecución</p>
                                       <p className="text-[10px] text-zinc-500 font-medium">Extensión: MP4/MOV (Máx 50MB)</p>
                                    </div>
                                    <label className={`cursor-pointer px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center shrink-0 w-full sm:w-auto shadow-md ${uploading === lift.id ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'}`}>
                                       {uploading === lift.id ? 'TRANSMITIENDO...' : 'CARGAR VIDEO 📹'}
                                       <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, lift.id)} disabled={uploading === lift.id} />
                                    </label>
                                 </div>

                                 <div className="bg-blue-950/20 border border-blue-500/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-inner">
                                    <h4 className="flex items-center gap-3 text-blue-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4">
                                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Auditoría del Coach
                                    </h4>
                                    {order[`feedback_${lift.id}`] ? (
                                      <p className="text-blue-50 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{order[`feedback_${lift.id}`]}</p>
                                    ) : (
                                      <p className="text-blue-500/40 text-xs md:text-sm italic font-medium">Complete la nomenclatura y aporte el material para obtener asistencia.</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                         </div>
                      </div>

                   </div>
                </div>
             )}
           </>
        )}

{/* ─── PESTAÑA RM Y TROFEOS ÉPICOS ─── */}
        {activeTab === "rm" && (
           <>
             {!canViewRMs ? (
                 <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900/40 border border-red-900/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center h-[60vh] min-h-[400px]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 border border-red-500/20 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10 shadow-inner">📈</div>
                     <h3 className="text-3xl md:text-5xl font-black italic text-white mb-4 tracking-tighter relative z-10 uppercase">MÓDULO <span className="text-red-500">RESTRINGIDO</span></h3>
                     <p className="text-zinc-400 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">El seguimiento biométrico de tus Marcas (RMs) y la red neuronal de análisis de proporciones pertenecen al sistema Élite.</p>
                     <a href={whatsappUpsellUrl} target="_blank" className="relative z-10 inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 w-full sm:w-auto">
                         POSTULARME A MENTORÍA ÉLITE 🚀
                     </a>
                 </div>
             ) : (
                <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-500">
                   <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 sm:p-10 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-amber-500/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -mr-20 -mt-20"></div>
                      
                      <h2 className="text-4xl md:text-6xl font-black italic text-center mb-10 md:mb-16 text-white relative z-10 tracking-tighter drop-shadow-md">
                        MÉTRICAS BASE DE <span className="text-amber-500 block sm:inline">1RM</span>
                      </h2>
                      
                      <div className="relative z-10 bg-[#050505] border border-zinc-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 mb-12 md:mb-16 shadow-inner">
                          <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-6">
                              <div className="text-center md:text-left">
                                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Rango Actual</p>
                                  <h3 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">{levelInfo.current}</h3>
                              </div>
                              <div className="text-center md:text-right">
                                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Próximo Rango</p>
                                  <p className="text-2xl md:text-3xl font-black italic text-zinc-300 uppercase tracking-tighter">{levelInfo.next}</p>
                              </div>
                          </div>

                          <div className="w-full bg-zinc-900 rounded-full h-4 md:h-6 mb-6 border border-zinc-800 relative overflow-hidden shadow-inner">
                              <div 
                                 className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-1000 ease-out relative"
                                 style={{ width: `${progressPercent}%` }}
                              >
                                 <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                              </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest gap-4">
                              <span className="text-zinc-400 bg-black/50 px-4 py-2 rounded-xl border border-zinc-800">{totalAbsoluto} KG Totales Absolutos</span>
                              {kgLeft > 0 ? (
                                  <span className="text-amber-400 bg-amber-500/10 px-5 py-2.5 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">Faltan {kgLeft} KG para ascender</span>
                              ) : (
                                  <span className="text-yellow-400 bg-yellow-500/10 px-5 py-2.5 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">Nivel Máximo Desbloqueado 👑</span>
                              )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12 md:mb-16 relative z-10">
                         {['squat', 'bench', 'deadlift', 'dips', 'military'].map(lift => {
                             const liftName = lift === 'squat' ? 'Sentadilla' : lift === 'bench' ? 'Press Banca' : lift === 'deadlift' ? 'Peso Muerto' : lift === 'dips' ? 'Fondos' : 'Militar';
                             return (
                                <div key={lift} className="bg-black/60 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-800 text-center relative focus-within:border-amber-500/50 transition-all hover:bg-zinc-900/40 shadow-inner group">
                                    <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 md:mb-6 group-hover:text-amber-500/80 transition-colors">{liftName}</p>
                                    <div className="relative inline-block w-full">
                                       <input 
                                          type="number"
                                          inputMode="numeric"
                                          value={rms[lift as keyof typeof rms] || ""} 
                                          onChange={e => setRms(prev => ({...prev, [lift]: e.target.value}))}
                                          className="bg-transparent text-center text-4xl md:text-5xl lg:text-6xl font-black text-white w-full outline-none focus:text-amber-400 transition-colors placeholder:text-zinc-800"
                                          placeholder="0"
                                       />
                                       <span className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-2 text-zinc-700 text-[10px] md:text-sm font-black">KG</span>
                                    </div>
                                </div>
                             );
                         })}
                      </div>

                      <button 
                        onClick={saveRMs}
                        disabled={savingRm}
                        className="relative z-10 w-full bg-gradient-to-r from-amber-500 to-amber-400 text-black py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:from-amber-400 hover:to-amber-300 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_10px_40px_rgba(245,158,11,0.3)] active:scale-95 border border-amber-200"
                      >
                        {savingRm ? 'SINCRONIZANDO CON BASE DE DATOS...' : 'CONFIRMAR NUEVAS MÉTRICAS ⚡'}
                      </button>

                      <div className="bg-gradient-to-r from-blue-950/40 to-[#0a0a0c] border border-blue-900/50 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden mt-12 md:mt-16 shadow-xl">
                         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                            <div>
                               <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase flex items-center gap-3 tracking-tight mb-2">
                                  <span className="text-3xl md:text-4xl drop-shadow-md">🤖</span> Análisis Estructural <span className="text-blue-500">Tujague AI</span>
                               </h3>
                               <p className="text-zinc-400 text-sm md:text-base font-medium max-w-xl">Detectá desbalances biomecánicos y puntos de estancamiento evaluando las proporciones de tus levantamientos actuales.</p>
                            </div>
                            <button
                               onClick={handleAnalyzeRMs}
                               disabled={rmAiLoading}
                               className="bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 flex-shrink-0 w-full sm:w-auto hover:scale-105 active:scale-95"
                            >
                               {rmAiLoading ? 'PROCESANDO RED NEURAL...' : 'AUDITAR MARCAS'}
                            </button>
                         </div>
                         
                         {rmAiFeedback && (
                            <div className="mt-8 bg-black/60 border border-blue-500/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] animate-in slide-in-from-top-4 shadow-inner">
                               <p className="text-[10px] md:text-xs text-blue-400 font-black uppercase tracking-widest mb-4 flex items-center gap-3 border-b border-blue-500/20 pb-3">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Reporte Biomecánico
                               </p>
                               <p className="text-sm md:text-base text-blue-50 font-medium leading-relaxed whitespace-pre-wrap">{rmAiFeedback}</p>
                            </div>
                         )}
                      </div>

                   </div>

                   <div className="bg-[#0a0a0c] border border-amber-900/40 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl transform-gpu">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none -translate-y-1/2 transform-gpu"></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8 text-left relative z-10">
                          <div>
                              <h3 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">Inventario de Logros <span className="text-amber-500 block sm:inline">Élite</span></h3>
                              <p className="text-zinc-400 text-xs md:text-sm mt-4 font-medium tracking-wide">Acumulado del trabajo de fuerza a largo plazo. TOTAL ABSOLUTO: <span className="text-amber-400 font-black text-xl md:text-2xl ml-1 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">{totalAbsoluto} KG</span></p>
                          </div>
                          <button 
                              onClick={shareTrophies}
                              className="bg-[#050505] hover:bg-amber-500 hover:text-black text-white border border-zinc-700 hover:border-amber-500 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto"
                          >
                              <span>Compartir Legado</span>
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.067 3.204.146 4.833 1.79 4.98 5.01.054 1.266.066 1.645.066 4.849 0 3.205-.012 3.584-.066 4.85-.147 3.22-1.776 4.864-4.98 5.01-1.266.054-1.646.066-4.85.066-3.204 0-3.584-.012-4.85-.066-3.204-.146-4.833-1.79-4.98-5.01-.054-1.266-.066-1.645-.066-4.85 0-3.205.012-3.584.066-4.85.147-3.22 1.776-4.864 4.98-5.01 1.266-.054 1.646-.066 4.85-.066m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.848-6.98 6.208-.058 1.28-.072 1.688-.072 4.948s.014 3.668.072 4.948c.2 4.358 2.618 6.008 6.98 6.208 1.281.058 1.689.072 4.947.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.848 6.979-6.208.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.004-6.979-6.209C15.668.014 15.259 0 12 0zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                          </button>
                      </div>

                      <div className="space-y-16 md:space-y-24 relative z-10">
                         {Object.entries(groupedTrophies).map(([category, items], index) => (
                            <div key={index} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                               <h4 className="text-amber-500 font-black tracking-[0.2em] text-xs md:text-sm uppercase mb-6 md:mb-8 border-b border-zinc-800/80 pb-4">
                                  {category}
                               </h4>
                               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6">
                                  {items.map(trophy => (
                                      <div key={trophy.id} className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-500 flex flex-col justify-between min-h-[140px] md:min-h-[160px] relative overflow-hidden ${trophy.unlocked ? 'bg-gradient-to-br from-amber-950/40 to-black border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-[1.02] hover:scale-105' : 'bg-black/40 border-zinc-800/80 opacity-60 grayscale'}`}>
                                          
                                          {trophy.unlocked && <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-[25px] pointer-events-none"></div>}
                                          
                                          <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                                             <span className={`text-4xl md:text-5xl drop-shadow-md ${trophy.unlocked ? 'animate-pulse' : ''}`}>{trophy.icon}</span>
                                             {trophy.unlocked ? (
                                                <span className="text-black font-black text-[10px] md:text-xs bg-amber-500 px-2.5 py-1 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.6)]">✓</span>
                                             ) : (
                                                <span className="text-zinc-600 text-[10px] md:text-xs bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">🔒</span>
                                             )}
                                          </div>
                                          <div className="relative z-10">
                                             <h4 className={`font-black italic uppercase text-[11px] md:text-[13px] tracking-tight leading-tight mb-1 md:mb-1.5 ${trophy.unlocked ? 'text-white' : 'text-zinc-500'}`}>{trophy.title}</h4>
                                             <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${trophy.unlocked ? 'text-amber-400' : 'text-zinc-600'}`}>{trophy.desc}</p>
                                          </div>
                                      </div>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                      <h3 className="text-2xl md:text-4xl font-black italic text-white mb-10 md:mb-12 text-center md:text-left drop-shadow-md">TRAYECTORIA DE <span className="text-amber-500 block sm:inline">FUERZA PROYECTADA</span></h3>
                      <div className="h-[300px] md:h-[400px] w-full bg-[#050505] p-4 md:p-6 rounded-[2rem] border border-zinc-800/80 shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', padding: '12px' }}
                               itemStyle={{ color: '#fff' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 'bold' }} iconType="circle" />
                            <Line type="monotone" dataKey="Sentadilla" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Banca" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="PesoMuerto" stroke="#ef4444" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Fondos" stroke="#10b981" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             )}
           </>
        )}

{/* ─── PESTAÑA CHECKIN ─── */}
        {activeTab === "checkin" && (
           <>
             {!canViewSNC ? (
                 <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900/40 border border-red-900/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center h-[60vh] min-h-[400px]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 border border-red-500/20 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10 shadow-inner">⚡</div>
                     <h3 className="text-3xl md:text-5xl font-black italic text-white mb-4 tracking-tighter relative z-10 uppercase">MÓDULO <span className="text-red-500">RESTRINGIDO</span></h3>
                     <p className="text-zinc-400 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">El análisis de fatiga sistémica (SNC) y la comunicación diaria de variables biológicas están habilitadas únicamente para la Mentoría Élite.</p>
                     <a href={whatsappUpsellUrl} target="_blank" className="relative z-10 inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 w-full sm:w-auto">
                         POSTULARME A MENTORÍA ÉLITE 🚀
                     </a>
                 </div>
             ) : (
                <div className="max-w-6xl mx-auto space-y-10 md:space-y-12 animate-in fade-in duration-500">
                   <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-amber-500/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -mr-20 -mt-20"></div>
                      
                      <div className="text-center mb-10 md:mb-14 relative z-10">
                         <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Métricas de Alto Rendimiento</span>
                         <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic text-white tracking-tighter uppercase mb-4 drop-shadow-md">AUDITORÍA DE <span className="text-amber-500 block sm:inline">RECUPERACIÓN</span></h2>
                         <p className="text-zinc-400 text-sm md:text-base font-medium max-w-2xl mx-auto">Datos fundamentales para el ajuste auto-rregulado (RPE) y el cálculo de volumen semanal. La IA y el Coach analizarán su estado biológico.</p>
                      </div>

                      <form onSubmit={handleSaveCheckin} className="space-y-6 md:space-y-8 relative z-10 max-w-4xl mx-auto">
                         
                         {/* PILAR 1: BIO-MARCADORES */}
                         <div className="bg-[#050505] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg group hover:border-amber-500/30 transition-colors">
                            <h3 className="text-amber-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>🧬</span> Pilar 1: Bio-Marcadores Diarios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-amber-500/50 transition-colors">
                                   <label className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block">Peso Corporal (KG)</label>
                                   <input 
                                      type="number" step="0.1" required
                                      value={checkin.weight} onChange={e => setCheckin({...checkin, weight: e.target.value})}
                                      className="w-full bg-transparent text-3xl md:text-4xl font-black text-white outline-none focus:text-amber-400 transition-colors placeholder:text-zinc-800"
                                      placeholder="Ej: 80.5"
                                   />
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-blue-500/50 transition-colors">
                                   <label className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block">Sueño Efectivo (Horas)</label>
                                   <input 
                                      type="number" step="0.5" required
                                      value={checkin.sleep} onChange={e => setCheckin({...checkin, sleep: e.target.value})}
                                      className="w-full bg-transparent text-3xl md:text-4xl font-black text-white outline-none focus:text-blue-400 transition-colors placeholder:text-zinc-800"
                                      placeholder="Ej: 7.5"
                                   />
                                </div>
                            </div>
                         </div>

                         {/* PILAR 2: METABOLISMO Y NUTRICIÓN */}
                         <div className="bg-[#050505] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg group hover:border-orange-500/30 transition-colors">
                            <h3 className="text-orange-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>🥩</span> Pilar 2: Metabolismo y Nutrición</h3>
                            
                            <div className="space-y-8">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                                    <div className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                      <span>Adherencia Nutricional (Semana)</span>
                                      <span className="text-orange-500 text-xl md:text-2xl font-black italic bg-orange-500/10 px-3 py-1 rounded-xl border border-orange-500/20">{checkin.adherence}%</span>
                                    </div>
                                    <input 
                                       type="range" min="0" max="100" step="5" required
                                       value={checkin.adherence} onChange={e => setCheckin({...checkin, adherence: e.target.value})}
                                       className="w-full accent-orange-500 h-2 bg-black rounded-full appearance-none cursor-pointer border border-zinc-800"
                                    />
                                    <div className="flex justify-between text-[9px] text-zinc-600 mt-3 font-black uppercase tracking-widest">
                                      <span>0% (Desastre)</span>
                                      <span>100% (Perfecto)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                        <div className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                          <span>Nivel de Hambre</span>
                                          <span className="text-white font-black">{checkin.hunger}/10</span>
                                        </div>
                                        <input type="range" min="1" max="10" required value={checkin.hunger} onChange={e => setCheckin({...checkin, hunger: e.target.value})} className="w-full accent-white h-1.5 bg-black rounded-full appearance-none cursor-pointer" />
                                        <div className="flex justify-between text-[8px] text-zinc-600 mt-2 font-bold uppercase"><span>Saciado</span><span>Hambriento</span></div>
                                    </div>
                                    
                                    <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                        <div className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                          <span>Energía General</span>
                                          <span className="text-yellow-400 font-black">{checkin.energy}/10</span>
                                        </div>
                                        <input type="range" min="1" max="10" required value={checkin.energy} onChange={e => setCheckin({...checkin, energy: e.target.value})} className="w-full accent-yellow-400 h-1.5 bg-black rounded-full appearance-none cursor-pointer" />
                                        <div className="flex justify-between text-[8px] text-zinc-600 mt-2 font-bold uppercase"><span>Agotado</span><span>Eléctrico</span></div>
                                    </div>
                                </div>
                            </div>
                         </div>

                         {/* PILAR 3: RENDIMIENTO Y FATIGA */}
                         <div className="bg-[#050505] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg group hover:border-red-500/30 transition-colors">
                            <h3 className="text-red-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>⚠️</span> Pilar 3: Fatiga del SNC y Articular</h3>
                            
                            <div className="space-y-8">
                                <div className="bg-zinc-900/50 border border-red-900/30 p-6 rounded-2xl hover:border-red-500/50 transition-all">
                                    <div className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                      <span>Estrés Sistémico General</span>
                                      <span className="text-red-500 text-xl md:text-2xl font-black italic bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20">{checkin.stress}/10</span>
                                    </div>
                                    <input type="range" min="1" max="10" required value={checkin.stress} onChange={e => setCheckin({...checkin, stress: e.target.value})} className="w-full accent-red-500 h-2 bg-black rounded-full appearance-none cursor-pointer border border-zinc-800" />
                                    <div className="flex justify-between text-[9px] text-zinc-600 mt-3 font-black uppercase tracking-widest"><span>1 (Calmado)</span><span>10 (Colapsado)</span></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                        <div className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                          <span>Recuperación Muscular</span>
                                          <span className="text-blue-400 font-black">{checkin.recovery}/10</span>
                                        </div>
                                        <input type="range" min="1" max="10" required value={checkin.recovery} onChange={e => setCheckin({...checkin, recovery: e.target.value})} className="w-full accent-blue-400 h-1.5 bg-black rounded-full appearance-none cursor-pointer" />
                                        <div className="flex justify-between text-[8px] text-zinc-600 mt-2 font-bold uppercase"><span>Destruido (DOMS)</span><span>Recuperado al 100%</span></div>
                                    </div>

                                    <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 block">Molestia Articular Aguda</label>
                                        <select value={checkin.joint_pain} onChange={e => setCheckin({...checkin, joint_pain: e.target.value})} className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-xs text-white outline-none focus:border-red-500 transition-colors">
                                            <option value="ninguno">Ninguno (Todo OK)</option>
                                            <option value="rodillas">Rodilla / Tendón Rotuliano</option>
                                            <option value="lumbares">Espalda Baja / Lumbares</option>
                                            <option value="hombros">Hombro / Manguito Rotador</option>
                                            <option value="codos">Codos / Tendinitis</option>
                                            <option value="muñecas">Muñecas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                         </div>

                         {/* PILAR 4: EJECUCIÓN */}
                         <div className="bg-[#050505] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg group hover:border-amber-500/30 transition-colors">
                            <h3 className="text-amber-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>⚔️</span> Pilar 4: Disciplina BII-Vintage</h3>
                            
                            <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm md:text-base font-black text-white uppercase tracking-tight mb-1">¿Alcanzaste el Fallo Muscular?</p>
                                    <p className="text-[10px] md:text-xs text-zinc-400 font-medium">¿Tus Top Sets llegaron al fallo real (RIR 0) con técnica estricta, o te guardaste repeticiones?</p>
                                </div>
                                
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" checked={checkin.hit_failure} onChange={(e) => setCheckin({...checkin, hit_failure: e.target.checked})} className="sr-only peer" />
                                    <div className="w-16 h-8 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                                    <span className={`ml-4 text-xs font-black uppercase tracking-widest ${checkin.hit_failure ? 'text-amber-500' : 'text-zinc-500'}`}>{checkin.hit_failure ? 'SÍ, FALLO REAL' : 'NO, ME GUARDÉ REPS'}</span>
                                </label>
                            </div>

                            <div className="mt-6 bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl focus-within:border-amber-500/50 transition-colors">
                               <label className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block">Registro Clínico Libre</label>
                               <textarea 
                                  value={checkin.notes} onChange={e => setCheckin({...checkin, notes: e.target.value})}
                                  placeholder="Anotaciones adicionales para el Coach. Ej: 'Sentí que la banca volaba esta semana', 'Tuve mucho trabajo y comí mal un día'..."
                                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm md:text-base font-medium text-zinc-300 outline-none resize-none h-24 md:h-32 placeholder:text-zinc-700 custom-scrollbar shadow-inner focus:border-amber-500"
                               />
                            </div>
                         </div>

                         <div className="pt-4 md:pt-6 pb-20">
                             <button 
                                type="submit"
                                disabled={savingCheckin}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 border border-amber-200"
                             >
                                {savingCheckin ? 'COMUNICANDO DATOS AL SISTEMA...' : 'ENVIAR REPORTE AL HEAD COACH 🚀'}
                             </button>
                         </div>

                         {/* 🔥 NUEVO: VEREDICTO DEL COACH EN TIEMPO REAL 🔥 */}
                         {(analyzingFatigue || fatigueVerdict) && (
                             <div className="mt-8 mb-4 bg-gradient-to-r from-amber-950/40 to-black border border-amber-500/30 p-6 md:p-8 rounded-[2rem] shadow-inner animate-in slide-in-from-top-4">
                                 <p className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                     {analyzingFatigue ? (
                                         <><span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span> El Coach IA está auditando tu SNC...</>
                                     ) : (
                                         <><span className="text-xl">⚡</span> Dictamen de Entrenamiento (Tujague AI)</>
                                     )}
                                 </p>
                                 {fatigueVerdict && (
                                     <p className="text-sm md:text-base text-amber-50 font-medium leading-relaxed whitespace-pre-wrap">
                                         {fatigueVerdict}
                                     </p>
                                 )}
                             </div>
                         )}
                         
                      </form>
                   </div>

                   {checkinHistory.length > 0 && (
                      <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 backdrop-blur-xl mb-24">
                         <h3 className="text-2xl md:text-4xl font-black italic text-white mb-10 md:mb-12 text-center md:text-left drop-shadow-md">Gráfico de <span className="text-amber-500 block sm:inline">Fatiga Semanal</span></h3>
                         
                         <div className="h-[300px] md:h-[400px] w-full bg-[#050505] p-4 md:p-6 rounded-[2rem] border border-zinc-800/80 shadow-inner">
                           <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={checkinHistory} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                               <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                               <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} dx={-10} />
                               <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} dx={10} />
                               
                               <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', padding: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                               <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 'bold' }} iconType="circle" />
                               
                               <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso Corporal (kg)" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                               <Line yAxisId="right" type="monotone" dataKey="stress" name="Nivel de Estrés (1-10)" stroke="#ef4444" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                               <Line yAxisId="right" type="monotone" dataKey="sleep" name="Horas de Sueño" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                             </LineChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                   )}
                </div>
             )}
           </>
        )}

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