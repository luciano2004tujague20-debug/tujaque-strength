"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from "next/link";

export default function DashboardAtleta() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("rutina");
  
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingRm, setSavingRm] = useState(false);
  
  const [rms, setRms] = useState({ squat: "", bench: "", deadlift: "", dips: "", military: "" });

  const [savingCheckin, setSavingCheckin] = useState(false);
  
  // 🔥 ESTADO DEL SUPER CHECK-IN (NIVEL ÉLITE) 🔥
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
  
  const [loadingUpsell, setLoadingUpsell] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [loadingRenewal, setLoadingRenewal] = useState(false); 

  const [isMonthlyPlan, setIsMonthlyPlan] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const [onboardingData, setOnboardingData] = useState({
      age: "", body_weight: "", height: "", experience: "intermedio", goal: "fuerza",
      equipment: "gimnasio", medical_history: "", training_days: "3",
      rm_squat: "", rm_bench: "", rm_deadlift: "", rm_dips: "", rm_military: ""
  });

  const [calcLift, setCalcLift] = useState("squat");
  const [calcPercent, setCalcPercent] = useState(80);

  const [logs, setLogs] = useState({ d1: "", d2: "", d3: "", d4: "", d5: "", d6: "", d7: "" });
  const [savingLogs, setSavingLogs] = useState(false);

  const [time, setTime] = useState(180); 
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [fatigueStatus, setFatigueStatus] = useState<any>(null);
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

  const pdfRef = useRef<HTMLDivElement>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [rmAiLoading, setRmAiLoading] = useState(false);
  const [rmAiFeedback, setRmAiFeedback] = useState("");

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        const currentOrder = orders[0];
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
        
        // 🔥 CARGAR DATOS PREVIOS DEL SUPER CHECK-IN 🔥
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
        
        setIsOnboarded(currentOrder.is_onboarded === true);

        const planId = currentOrder.plan_id || "";
        const planTitle = (currentOrder.plan_title || "").toLowerCase();
        
        const isMonthly = planId.includes('mensual') || planTitle.includes('mesociclo') || planTitle.includes('performance') || planTitle.includes('élite') || planTitle.includes('elite');
        setIsMonthlyPlan(isMonthly);

        if (isMonthly && currentOrder.checkin_history && currentOrder.checkin_history.length > 0) {
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
          const finalMedical = isBeginner 
              ? `[ATLETA PRINCIPIANTE] - ${onboardingData.medical_history}` 
              : onboardingData.medical_history;

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
          alert("✅ Auditoría completada con éxito. Bienvenido al sistema BII-Vintage.");
          setIsOnboarded(true); 
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
         if (isMonthlyPlan && allLogsText.length > 15) {
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

  // 🔥 NUEVA LÓGICA DE GUARDADO DEL SÚPER CHECK-IN 🔥
  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCheckin(true);
    
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
    } catch (error: any) {
       alert("Error: " + error.message);
    } finally {
       setSavingCheckin(false);
    }
  };

  const handleBuyUpsell = async () => {
    setLoadingUpsell(true);
    try {
        const res = await fetch("/api/checkout-upsell", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id, email: user.email })
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
        setLoadingUpsell(false);
    }
  };

  const handleUpgradeToMonthly = async () => {
    setLoadingUpgrade(true);
    try {
        const currentPlanId = order?.plan_id || "";
        const currentPlanTitle = order?.plan_title || "";

        const res = await fetch("/api/checkout-upgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               orderId: order.id, 
               email: user.email,
               currentPlanId: currentPlanId,
               currentPlanTitle: currentPlanTitle
            })
        });
        const data = await res.json();
        if (data.initPoint) {
            window.location.href = data.initPoint; 
        } else {
            alert(data.error || "Error de conexión con la pasarela financiera.");
        }
    } catch (error) {
        alert("Error de red.");
    } finally {
        setLoadingUpgrade(false);
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

  // 🔥 NUEVO GENERADOR DE PDF A4 PREMIUM 🔥
  const downloadPDF = async () => {
      if (!pdfRef.current) return;
      setGeneratingPDF(true);

      try {
          const html2pdf = (await import('html2pdf.js')).default;
          
          pdfRef.current.classList.add('exporting-pdf-mode');

          const opt = {
              margin:       0.4,
              filename:     `Tujague_Strength_${order?.customer_name?.replace(/\s+/g, '_') || 'Plan'}.pdf`,
              image:        { type: 'jpeg' as const, quality: 1 }, 
              html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
              jsPDF:        { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
          };
          
          await html2pdf().set(opt).from(pdfRef.current).save();
          
          if (pdfRef.current) {
              pdfRef.current.classList.remove('exporting-pdf-mode');
          }
      } catch (error) {
          console.error("Error generando PDF:", error);
          alert("Ocurrió un error al generar el documento.");
          if (pdfRef.current) pdfRef.current.classList.remove('exporting-pdf-mode');
      } finally {
          setGeneratingPDF(false);
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
          const res = await fetch('/api/assistant/elite', {
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

  // 🔥 LÓGICA DEL SCORE DE ADHERENCIA 🔥
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

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-black animate-pulse tracking-widest uppercase text-sm">Inicializando Panel de Control...</div>;

  if (!order) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
       <h2 className="text-3xl md:text-5xl font-black italic mb-4">SUSCRIPCIÓN NO DETECTADA</h2>
       <p className="text-zinc-500 mb-8 max-w-md mx-auto">No se encontraron planes activos asociados a este perfil. Por favor, verifique su estado administrativo.</p>
       <div className="flex flex-col sm:flex-row gap-4">
         <Link href="/" className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black tracking-widest uppercase hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">Adquirir Acceso</Link>
         <button onClick={handleLogout} className="border border-zinc-700 text-zinc-300 px-8 py-4 rounded-xl font-black tracking-widest uppercase hover:bg-zinc-800 transition-colors">Finalizar Sesión</button>
       </div>
    </div>
  );

  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 md:p-12 font-sans selection:bg-emerald-500 selection:text-black overflow-y-auto">
        <div className="w-full max-w-7xl mb-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-xl border border-white/5 text-xs font-black uppercase tracking-widest shadow-md">
               <span className="text-sm">🏠</span> Volver a la Web
            </Link>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Cerrar Sesión</button>
        </div>

        <div className="max-w-5xl w-full bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-14 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_80px_rgba(16,185,129,0.05)] relative overflow-hidden my-auto animate-in fade-in zoom-in duration-500">
            
           <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-10 md:-mr-20 -mt-10 md:-mt-20"></div>
           <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -ml-10 md:-ml-20 -mb-10 md:-mb-20"></div>

           <div className="text-center mb-8 md:mb-12 relative z-10 border-b border-zinc-800/50 pb-8">
               <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                   Paso Obligatorio
               </span>
               <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase mb-4 text-white">
                   Auditoría <span className="text-emerald-500">Clínica</span> Inicial
               </h2>
               <p className="text-zinc-400 font-medium text-sm md:text-base max-w-2xl mx-auto px-4">
                  Necesitamos configurar tu perfil biomecánico y fisiológico en el sistema para que el Coach pueda estructurar tu mesociclo con precisión milimétrica.
               </p>
           </div>

           <form onSubmit={handleSaveOnboarding} className="space-y-6 md:space-y-10 relative z-10">
              
              <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                  <h3 className="text-emerald-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3">1. Perfil Biométrico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Edad</label>
                          <input required type="number" value={onboardingData.age || ""} onChange={(e) => setOnboardingData({...onboardingData, age: e.target.value})} placeholder="Ej: 25" className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors shadow-inner" />
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Peso Corporal (KG)</label>
                          <input required type="number" step="0.1" value={onboardingData.body_weight || ""} onChange={(e) => setOnboardingData({...onboardingData, body_weight: e.target.value})} placeholder="Ej: 80.5" className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors shadow-inner" />
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Estatura (CM)</label>
                          <input required type="number" value={onboardingData.height || ""} onChange={(e) => setOnboardingData({...onboardingData, height: e.target.value})} placeholder="Ej: 178" className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors shadow-inner" />
                      </div>
                  </div>
              </div>

              <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                  <h3 className="text-emerald-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3">2. Logística de Entrenamiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Objetivo Principal</label>
                          <select value={onboardingData.goal || "fuerza"} onChange={(e) => setOnboardingData({...onboardingData, goal: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none shadow-inner">
                              <option value="fuerza">Fuerza Absoluta (Powerlifting)</option>
                              <option value="hipertrofia">Hipertrofia Estética</option>
                              <option value="hibrido">Híbrido (Powerbuilding)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Nivel de Experiencia</label>
                          <select value={onboardingData.experience || "intermedio"} onChange={(e) => setOnboardingData({...onboardingData, experience: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none shadow-inner">
                              <option value="principiante">Principiante (Menos de 1 año)</option>
                              <option value="intermedio">Intermedio (1 a 3 años)</option>
                              <option value="avanzado">Avanzado (+3 años)</option>
                          </select>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Días Disponibles a la Semana</label>
                          <select value={onboardingData.training_days || "3"} onChange={(e) => setOnboardingData({...onboardingData, training_days: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none shadow-inner">
                              <option value="3">3 Días</option>
                              <option value="4">4 Días</option>
                              <option value="5">5 Días</option>
                              <option value="6">6 Días</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Equipamiento Disponible</label>
                          <select value={onboardingData.equipment || "gimnasio"} onChange={(e) => setOnboardingData({...onboardingData, equipment: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none shadow-inner">
                              <option value="gimnasio">Gimnasio Comercial Completo</option>
                              <option value="home_gym">Home Gym (Barra, discos, rack, banco)</option>
                              <option value="limitado">Equipamiento Limitado (Mancuernas/Máquinas)</option>
                          </select>
                      </div>
                  </div>
              </div>

              <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                  <h3 className="text-emerald-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3">3. Historial de Lesiones</h3>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold">Detalle de dolores crónicos o lesiones previas</label>
                  <textarea 
                     value={onboardingData.medical_history || ""}
                     onChange={(e) => setOnboardingData({...onboardingData, medical_history: e.target.value})}
                     placeholder="Ej: Dolor lumbar crónico al pasar paralelo en sentadilla, molestia en manguito rotador derecho..."
                     className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-sm font-medium outline-none focus:border-emerald-500 transition-colors resize-none h-32 md:h-24 placeholder:text-zinc-600 shadow-inner"
                  />
              </div>

              <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                     <h3 className="text-emerald-500 font-black text-[10px] md:text-xs uppercase tracking-widest">
                        4. Marcas de Referencia (1RM)
                     </h3>
                     <label className="flex items-center gap-2 cursor-pointer bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-emerald-500 transition-all w-full sm:w-auto justify-center sm:justify-start">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Soy Principiante Total</span>
                        <input type="checkbox" checked={isBeginner} onChange={() => setIsBeginner(!isBeginner)} className="accent-emerald-500 w-4 h-4" />
                     </label>
                  </div>
                  
                  {!isBeginner ? (
                      <div className="animate-in slide-in-from-top-4 duration-500">
                          <p className="text-zinc-400 text-xs md:text-sm mb-6 font-medium">Ingresa tus pesos máximos estimados a 1 repetición en kilogramos. Si no los sabes exactos, pon un aproximado.</p>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                             <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 text-center font-bold">Sentadilla</label>
                                <input required={!isBeginner} type="number" placeholder="0" value={onboardingData.rm_squat || ""} onChange={e => setOnboardingData({...onboardingData, rm_squat: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 md:p-5 text-center text-white font-black text-2xl md:text-3xl outline-none focus:border-emerald-500 transition-colors shadow-inner"/>
                             </div>
                             <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 text-center font-bold">Press Banca</label>
                                <input required={!isBeginner} type="number" placeholder="0" value={onboardingData.rm_bench || ""} onChange={e => setOnboardingData({...onboardingData, rm_bench: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 md:p-5 text-center text-white font-black text-2xl md:text-3xl outline-none focus:border-emerald-500 transition-colors shadow-inner"/>
                             </div>
                             <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 text-center font-bold">Peso Muerto</label>
                                <input required={!isBeginner} type="number" placeholder="0" value={onboardingData.rm_deadlift || ""} onChange={e => setOnboardingData({...onboardingData, rm_deadlift: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 md:p-5 text-center text-white font-black text-2xl md:text-3xl outline-none focus:border-emerald-500 transition-colors shadow-inner"/>
                             </div>
                             <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 text-center font-bold">P. Militar</label>
                                <input required={!isBeginner} type="number" placeholder="0" value={onboardingData.rm_military || ""} onChange={e => setOnboardingData({...onboardingData, rm_military: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 md:p-5 text-center text-white font-black text-2xl md:text-3xl outline-none focus:border-emerald-500 transition-colors shadow-inner"/>
                             </div>
                             <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-2 text-center font-bold">Fondos (+KG)</label>
                                <input required={!isBeginner} type="number" placeholder="0" value={onboardingData.rm_dips || ""} onChange={e => setOnboardingData({...onboardingData, rm_dips: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 md:p-5 text-center text-white font-black text-2xl md:text-3xl outline-none focus:border-emerald-500 transition-colors shadow-inner"/>
                             </div>
                          </div>
                      </div>
                  ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-2xl text-center">
                          <span className="text-3xl mb-3 block">🛡️</span>
                          <p className="text-emerald-400 font-bold text-sm">El sistema diseñará una fase de adaptación para construir tu fuerza base desde cero. No necesitas ingresar RMs previos.</p>
                      </div>
                  )}
              </div>

              <div className="pt-8">
                  <button 
                     type="submit"
                     disabled={savingOnboarding}
                     className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-6 md:py-8 rounded-[2rem] font-black text-sm md:text-base uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
                  >
                     {savingOnboarding ? 'Sincronizando Base de Datos...' : 'GUARDAR FICHA CLÍNICA E INGRESAR AL PANEL'}
                  </button>
              </div>
           </form>
        </div>
      </main>
    );
  }

  const balance = Number(order?.wallet_balance || 0);
  const precioPlanAtleta = Number(order?.amount_ars) > 0 ? Number(order?.amount_ars) : 50000;
  const affiliateProgress = Math.min(100, (balance / precioPlanAtleta) * 100);
  const isFreeMonthSecured = balance >= precioPlanAtleta;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ─── HEADER BÁSICO CON NAVEGACIÓN Y SCORE DE ADHERENCIA ─── */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 md:mb-12 gap-6 bg-[#0a0a0c] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl">
        <div className="w-full lg:w-auto">
          <div className="flex justify-between items-center w-full mb-4">
              <Link href="/" className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border border-emerald-500/20 shadow-md">
                <span className="text-sm">🏠</span> Volver a la Web Principal
              </Link>
              <button onClick={handleLogout} className="text-[10px] font-black tracking-widest uppercase text-zinc-500 hover:text-white transition-colors lg:hidden">
                Cerrar Sesión
              </button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-md mt-2">
            SISTEMA <span className="text-emerald-500">OPERATIVO</span>
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

      {/* DASHBOARD GAMIFICADO BII-AFFILIATES */}
      {order.referral_code && (
          <div className="mb-10 bg-gradient-to-br from-zinc-900/80 to-black border border-emerald-900/30 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
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
                          Si un prospecto usa tu código, él recibe un <strong className="text-emerald-500">15% de bonificación</strong> en su ingreso, y el sistema inyecta el <strong className="text-emerald-500">20% del valor de su plan</strong> directo en tu Billetera Virtual. Traé 5 personas y tu mesociclo te sale $0.
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
                                  🎉 ¡Felicidades, Atleta! El sistema tiene fondos suficientes para que tu próxima renovación cueste exactamente $0.
                              </p>
                          ) : (
                              <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest text-center">
                                  Faltan <span className="text-white">${(precioPlanAtleta - balance).toLocaleString()}</span> de saldo para financiar el próximo mes al 100%.
                              </p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* USO DE BILLETERA EN ALERTA DE RENOVACIÓN */}
      {daysLeft !== null && daysLeft <= 3 && (
         <div className="mb-10 bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/50 p-6 md:p-8 rounded-[2rem] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
               <span className="text-5xl md:text-6xl animate-bounce">⚠️</span>
               <div>
                  <h3 className="text-white font-black italic text-xl md:text-2xl tracking-tighter uppercase">Plan próximo a caducar ({daysLeft} días)</h3>
                  <p className="text-red-200/80 text-sm md:text-base font-medium mt-1">Evite interrupciones en su mesociclo procesando la renovación.</p>
               </div>
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-auto">
               {order.wallet_balance > 0 && (
                  <label className="flex items-center gap-3 bg-red-950/60 border border-red-500/40 p-4 rounded-2xl cursor-pointer hover:bg-red-900/80 transition-all shadow-inner">
                     <input type="checkbox" checked={useWalletBalance} onChange={(e) => setUseWalletBalance(e.target.checked)} className="w-5 h-5 accent-red-500 cursor-pointer" />
                     <div>
                        <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest">Usar mis ${Number(order.wallet_balance).toLocaleString()} de Billetera</p>
                     </div>
                  </label>
               )}
               <button 
                  onClick={handleRenewPlan} 
                  disabled={loadingRenewal}
                  className="w-full lg:w-auto bg-red-500 hover:bg-red-400 text-black px-10 py-5 rounded-2xl font-black tracking-[0.2em] text-xs md:text-sm uppercase transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] whitespace-nowrap disabled:opacity-50 active:scale-95"
               >
                  {loadingRenewal ? 'PROCESANDO...' : 'GESTIONAR RENOVACIÓN'}
               </button>
            </div>
         </div>
      )}

      {/* 🔥 NAVEGACIÓN DE TABS (SCROLL HORIZONTAL EN MÓVIL) 🔥 */}
      <div className="flex overflow-x-auto gap-3 md:gap-4 mb-10 border-b border-zinc-800 pb-4 custom-scrollbar whitespace-nowrap">
        <button onClick={() => setActiveTab("rutina")} className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black tracking-widest transition-all uppercase shrink-0 ${activeTab === "rutina" ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Protocolo</button>
        <button onClick={() => setActiveTab("videos")} className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black tracking-widest transition-all uppercase shrink-0 ${activeTab === "videos" ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Auditoría 📹</button>
        <button onClick={() => setActiveTab("boveda")} className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black tracking-widest transition-all uppercase shrink-0 ${activeTab === "boveda" ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Bóveda Clínica 🏛️</button>
        <button onClick={() => setActiveTab("rm")} className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black tracking-widest transition-all uppercase shrink-0 ${activeTab === "rm" ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Métricas 📈</button>
        <button onClick={() => setActiveTab("checkin")} className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black tracking-widest transition-all uppercase shrink-0 ${activeTab === "checkin" ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>Control SNC ⚡</button>
        
        {/* Espaciador para separar la IA en PC */}
        <div className="hidden lg:block flex-1"></div>
        
        <button onClick={() => setActiveTab("asistente")} className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black tracking-widest transition-all uppercase shrink-0 flex items-center gap-2 ${activeTab === "asistente" ? "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-500" : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 border border-blue-900/50 animate-pulse"}`}><span className="text-base md:text-lg">🤖</span> Tujague AI {isMonthlyPlan ? "" : "🔒"}</button>
      </div>

      <div className="animate-in fade-in duration-500">
        
        {/* ─── PANTALLA ASISTENTE IA (BIOMECÁNICO Y NUTRICIONAL) ─── */}
        {activeTab === "asistente" && (
           <>
             {!isMonthlyPlan ? (
                 <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900/40 border border-blue-900/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center h-[60vh] min-h-[400px]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 border border-blue-500/20 rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 md:mb-8 relative z-10 shadow-inner">🤖</div>
                     <h3 className="text-3xl md:text-5xl font-black italic text-white mb-4 tracking-tighter relative z-10 uppercase">SISTEMA <span className="text-blue-500">RESTRINGIDO</span></h3>
                     <p className="text-zinc-400 font-medium max-w-xl mx-auto mb-10 text-sm md:text-lg relative z-10 leading-relaxed px-4">La tecnología de soporte biomecánico y análisis nutricional de Tujague AI es exclusiva para usuarios con suscripciones de Nivel Mensual.</p>
                     <button onClick={handleUpgradeToMonthly} disabled={loadingUpgrade} className="relative z-10 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 w-full sm:w-auto">
                         {loadingUpgrade ? "INICIANDO PASARELA..." : "ACTUALIZAR A PASE MENSUAL"}
                     </button>
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

                             {/* ✅ BOTÓN GIGANTE GENERADOR DE MENÚ */}
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

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6 bg-[#0a0a0c] p-6 rounded-[2rem] border border-white/5 shadow-lg">
                <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight">Documento de Trabajo</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                   <button 
                       onClick={downloadPDF}
                       disabled={generatingPDF || !hasRoutines}
                       className="flex-1 sm:flex-none justify-center bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 border border-zinc-700 transition-all disabled:opacity-50 shadow-md"
                   >
                       {generatingPDF ? 'Generando...' : '📄 Exportar a PDF Premium'}
                   </button>

                   {isMonthlyPlan && (
                       <button 
                          onClick={() => setShowPanicModal(true)}
                          className="flex-1 sm:flex-none justify-center bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse"
                       >
                          🚨 Soporte Inmediato
                       </button>
                   )}
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

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
               <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center shadow-xl relative overflow-hidden text-center">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-3xl border mb-6 transition-all shadow-inner ${isTimerActive ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>⏱️</div>
                  <h3 className="text-white font-black italic uppercase tracking-tighter text-xl md:text-2xl mb-2">Recuperación Neural</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">Descanso entre series efectivas</p>
                  
                  <div className="flex gap-3 w-full bg-black p-2 rounded-2xl border border-zinc-800 mb-8">
                     <button onClick={() => resetTimer(180)} className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all ${time === 180 && !isTimerActive ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>3 MIN</button>
                     <button onClick={() => resetTimer(240)} className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all ${time === 240 && !isTimerActive ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>4 MIN</button>
                     <button onClick={() => resetTimer(300)} className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all ${time === 300 && !isTimerActive ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>5 MIN</button>
                  </div>
                  
                  <div className="bg-black border border-zinc-800 py-6 rounded-2xl w-full text-center shadow-inner mb-8">
                     <span className={`font-mono text-6xl md:text-7xl font-black tracking-tighter ${isTimerActive ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'text-white'}`}>{formatTime(time)}</span>
                  </div>
                  
                  <button onClick={toggleTimer} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all shadow-lg border border-transparent active:scale-95 ${isTimerActive ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`}>
                     {isTimerActive ? 'Suspender Reloj' : time === 0 ? 'Restablecer' : 'Iniciar Temporizador'}
                  </button>
               </div>

               <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-3xl shadow-inner">🧮</div>
                        <div>
                           <h3 className="text-white font-black italic uppercase tracking-tighter text-xl md:text-2xl">Parámetros de Carga</h3>
                           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Calculadora de Intensidad</p>
                        </div>
                     </div>
                     {isMonthlyPlan && (
                         <button onClick={handleGenerateWarmup} disabled={generatingWarmup} className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.15)] w-full sm:w-auto justify-center mt-4 sm:mt-0">
                            {generatingWarmup ? 'Analizando...' : '🤖 Generar Warm-Up'}
                         </button>
                     )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                     <select value={calcLift} onChange={(e) => setCalcLift(e.target.value)} className="bg-black border border-zinc-800 text-zinc-300 text-sm md:text-base font-bold uppercase rounded-2xl px-5 py-5 outline-none focus:border-emerald-500 flex-1 shadow-inner">
                        <option value="squat">Sentadilla</option>
                        <option value="bench">Press Banca</option>
                        <option value="deadlift">Peso Muerto</option>
                        <option value="dips">Fondos</option>
                        <option value="military">Militar</option>
                     </select>
                     <div className="relative w-full sm:w-32">
                        <input type="number" value={calcPercent} onChange={(e) => setCalcPercent(Number(e.target.value))} className="w-full h-full bg-black border border-zinc-800 text-white text-center text-2xl font-black rounded-2xl outline-none focus:border-emerald-500 shadow-inner py-4" />
                        <span className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-500 font-bold text-sm">%</span>
                     </div>
                  </div>
                  
                  <div className="bg-emerald-500 text-black px-8 py-6 rounded-2xl flex justify-between items-center shadow-[0_0_30px_rgba(16,185,129,0.3)] mt-auto border border-emerald-400">
                     <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Carga a utilizar:</span>
                     <span className="text-4xl md:text-5xl font-black italic tracking-tighter">{calculatedWeight} <span className="text-lg md:text-xl text-black/70 not-italic">KG</span></span>
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

            {(order.macrocycle || order.mesocycle || order.microcycle) && (
              <div className="mb-8 bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] flex flex-col lg:flex-row gap-6 justify-between items-stretch shadow-xl relative overflow-hidden">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                   {order.macrocycle && (
                     <div className="bg-black/60 border border-white/5 p-5 rounded-2xl shadow-inner">
                        <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Macrociclo</p>
                        <p className="text-base md:text-lg font-bold text-white tracking-tight">{order.macrocycle}</p>
                     </div>
                   )}
                   {order.mesocycle && (
                     <div className="bg-black/60 border border-white/5 p-5 rounded-2xl shadow-inner">
                        <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Mesociclo</p>
                        <p className="text-base md:text-lg font-bold text-white tracking-tight">{order.mesocycle}</p>
                     </div>
                   )}
                   {order.microcycle && (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-[20px]"></div>
                        <p className="text-[9px] md:text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 relative z-10">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Microciclo Activo
                        </p>
                        <p className="text-lg md:text-xl font-black text-emerald-400 tracking-tight relative z-10">{order.microcycle}</p>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* ✅ DIRECTRICES NUTRICIONALES COMPLETAS */}
            {(order.macro_calories || order.macro_protein || order.macro_carbs || order.macro_fats || order.macro_water || calculatedMacros) && (
                <div className="mb-10 bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    <h3 className="text-[10px] md:text-xs font-black italic text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                        <span className="text-2xl bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">🥩</span> 
                        Directrices Nutricionales del Coach
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5 relative z-10">
                        <div className="bg-black/60 border border-white/5 p-5 rounded-2xl shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Calorías</p>
                            <p className="text-xl md:text-2xl font-black text-white">{order.macro_calories || (calculatedMacros?.cals ? calculatedMacros.cals + ' kcal' : '-')}</p>
                        </div>
                        <div className="bg-black/60 border border-white/5 p-5 rounded-2xl shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Proteína</p>
                            <p className="text-xl md:text-2xl font-black text-white">{order.macro_protein || (calculatedMacros?.prot ? calculatedMacros.prot + 'g' : '-')}</p>
                        </div>
                        <div className="bg-black/60 border border-white/5 p-5 rounded-2xl shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Carbohidratos</p>
                            <p className="text-xl md:text-2xl font-black text-white">{order.macro_carbs || (calculatedMacros?.carbs ? calculatedMacros.carbs + 'g' : '-')}</p>
                        </div>
                        <div className="bg-black/60 border border-white/5 p-5 rounded-2xl shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Grasas</p>
                            <p className="text-xl md:text-2xl font-black text-white">{order.macro_fats || (calculatedMacros?.fats ? calculatedMacros.fats + 'g' : '-')}</p>
                        </div>
                        <div className="bg-black/60 border border-white/5 p-5 rounded-2xl md:col-span-1 shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Agua</p>
                            <p className="text-xl md:text-2xl font-black text-blue-400 drop-shadow-md">{order.macro_water || (calculatedMacros?.water ? calculatedMacros.water + ' L' : '-')}</p>
                        </div>
                    </div>
                </div>
            )}

            {!hasRoutines ? (
              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl relative overflow-hidden mb-8 animate-in fade-in duration-500">
                  <h3 className="text-3xl md:text-5xl font-black italic text-white mb-12 tracking-tighter uppercase relative z-10">
                      Estado del <span className="text-emerald-500">Sistema</span>
                  </h3>
                  
                  <div className="relative max-w-4xl mx-auto mb-16">
                      <div className="hidden md:block absolute top-8 left-12 right-12 h-2 bg-zinc-900 z-0 rounded-full shadow-inner"></div>
                      <div className={`hidden md:block absolute top-8 left-12 h-2 z-0 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-1000 ${order.status === 'paid' ? 'w-[60%] bg-emerald-500' : 'w-[20%] bg-amber-500'}`}></div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 relative z-10">
                          
                          <div className="flex flex-col items-center gap-4">
                              {order.status === 'paid' ? (
                                  <>
                                     <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-black flex items-center justify-center font-black text-3xl shadow-[0_0_30px_rgba(16,185,129,0.5)]">✓</div>
                                     <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 mt-2">1. Pago Verificado</p>
                                  </>
                              ) : (
                                  <>
                                     <div className="w-16 h-16 rounded-3xl bg-zinc-950 border-2 border-amber-500 text-amber-500 flex items-center justify-center font-black text-3xl animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.2)]">⏳</div>
                                     <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-400 mt-2">1. Validando Pago</p>
                                  </>
                              )}
                          </div>

                          <div className={`flex flex-col items-center gap-4 ${order.status === 'paid' ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-3xl transition-all ${order.status === 'paid' ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 border border-zinc-700 text-zinc-600'}`}>✓</div>
                              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 mt-2">2. Clínica Aprobada</p>
                          </div>

                          <div className={`flex flex-col items-center gap-4 ${order.status === 'paid' ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-3xl transition-all ${order.status === 'paid' ? 'bg-black border-2 border-emerald-500 text-emerald-500 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-zinc-900 border border-zinc-700 text-zinc-600'}`}>⚙️</div>
                              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white mt-2">3. Diseño en Proceso</p>
                          </div>

                          <div className="flex flex-col items-center gap-4 opacity-30">
                              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border-2 border-zinc-800 text-zinc-600 flex items-center justify-center font-black text-3xl">🚀</div>
                              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500 mt-2">4. Plan Listo</p>
                          </div>
                      </div>
                  </div>

                  {order.status !== 'paid' && (
                      <p className="text-amber-500 text-xs md:text-sm font-bold mt-8 animate-pulse bg-amber-500/10 p-4 rounded-xl inline-block border border-amber-500/20">
                          El Coach está revisando tu transferencia. La rutina comenzará a diseñarse en breve.
                      </p>
                  )}
              </div>
            ) : (
              <>
                 {logFeedback && (
                    <div className="mb-10 p-6 md:p-8 bg-gradient-to-r from-blue-950/60 to-[#0a0a0c] border-l-4 border-l-blue-500 border-y border-r border-zinc-800 rounded-r-3xl shadow-xl animate-in slide-in-from-left-4 relative overflow-hidden screen-only">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                        <span className="text-[10px] md:text-xs text-blue-400 font-black uppercase tracking-widest flex items-center gap-3 mb-3 relative z-10">
                           <span className="text-2xl">🤖</span> Auditoría de Bitácora (Tujague AI)
                        </span>
                        <p className="text-sm md:text-base text-blue-50 font-medium leading-relaxed italic relative z-10">"{logFeedback}"</p>
                    </div>
                 )}

                 {/* 🔥 SISTEMA DE RENDERIZADO DUAL (PANTALLA VS PDF) 🔥 */}
                 <div ref={pdfRef} className="w-full relative">
                    
                    {/* 👉 1. VISTA DE PANTALLA NORMAL (DASHBOARD) */}
                    <div className="screen-only grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {days.map(day => {
                        if (!order[`routine_${day.id}`]) return null;
                        return (
                          <div key={day.id} className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl flex flex-col hover:border-emerald-500/30 transition-colors">
                             <h3 className="text-2xl font-black italic text-emerald-400 mb-6 uppercase tracking-tight drop-shadow-md">{day.label}</h3>
                             
                             <div className="bg-black border border-zinc-800/80 rounded-2xl p-5 md:p-6 mb-8 shadow-inner flex-1">
                                 <div 
                                     className="text-zinc-200 font-medium text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words"
                                     style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                 >
                                     {order[`routine_${day.id}`]}
                                 </div>
                             </div>

                             <div className="mt-auto border-t border-zinc-800 pt-6 pdf-exclude">
                                <p className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><span>📓</span> Registro Fisiológico de Sesión</p>
                                <textarea 
                                   className="w-full bg-black border border-zinc-700/80 rounded-xl p-4 text-zinc-300 text-xs md:text-sm font-medium outline-none focus:border-emerald-500/50 resize-none h-28 md:h-32 placeholder:text-zinc-700 custom-scrollbar whitespace-pre-wrap shadow-inner" 
                                   placeholder="Ej: Sentadilla completada. RPE 8. Presencia de ligera fatiga sistémica..." 
                                   value={logs[day.id as keyof typeof logs]} 
                                   onChange={(e) => setLogs({...logs, [day.id]: e.target.value})} 
                                 />
                             </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* 👉 2. VISTA DE IMPRESIÓN PDF A4 PREMIUM (OCULTA EN PANTALLA) */}
                    <div className="print-only text-black bg-white w-full mx-auto" style={{ display: 'none', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                       
                       {/* PÁGINA 1: PORTADA */}
                       <div style={{ pageBreakAfter: 'always', padding: '40px' }} className="min-h-[297mm] flex flex-col relative box-border">
                          <div className="flex justify-between border-b-2 border-black pb-4 mb-16">
                              <span className="font-black text-lg tracking-widest">TUJAGUE STRENGTH</span>
                              <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">Protocolo Oficial BII-Vintage</span>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                              <h1 className="text-6xl font-black italic mb-6 tracking-tighter uppercase text-black">TUJAGUE STRENGTH</h1>
                              <h2 className="text-xl text-gray-800 font-bold mb-16 max-w-lg leading-relaxed uppercase tracking-widest">Documento de Trabajo Clínico y Registro de Sobrecarga</h2>
                              
                              <table className="w-full max-w-2xl border-2 border-black text-left text-sm uppercase">
                                 <tbody>
                                    <tr className="border-b-2 border-black">
                                       <td className="border-r-2 border-black p-5 font-bold w-1/2 bg-gray-100">
                                          ATLETA: <span className="font-black block mt-2 text-lg">{order.customer_name}</span>
                                       </td>
                                       <td className="p-5 font-bold w-1/2 bg-gray-100">
                                          INICIO (fecha): <span className="font-black block mt-2 text-lg text-gray-400">__ / __ / 202_</span>
                                       </td>
                                    </tr>
                                    <tr className="border-b-2 border-black">
                                       <td className="border-r-2 border-black p-5 font-bold">
                                          PESO (kg): <span className="font-black block mt-2 text-lg">{checkin.weight || order.body_weight || '____'}</span>
                                       </td>
                                       <td className="p-5 font-bold">
                                          OBJETIVO: <span className="font-black block mt-2 text-lg">{order.goal?.toUpperCase() || 'FUERZA / HIPERTROFIA'}</span>
                                       </td>
                                    </tr>
                                    <tr>
                                       <td className="border-r-2 border-black p-5 font-bold h-24 align-top">
                                          SUEÑO PROMEDIO (h): <span className="font-black block mt-2 text-lg text-gray-400">______</span>
                                       </td>
                                       <td className="p-5 font-bold h-24 align-top">
                                          NOTAS Y LESIONES: 
                                          <span className="font-medium normal-case block mt-2 text-xs text-gray-600 line-clamp-3">
                                             {order.medical_history || 'Sin observaciones.'}
                                          </span>
                                       </td>
                                    </tr>
                                 </tbody>
                              </table>
                          </div>

                          <div className="absolute bottom-10 left-10 right-10 flex justify-between border-t-2 border-black pt-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
                              <span>Metodología: Intensidad Máxima + Control Motor</span>
                              <span>Página 1</span>
                          </div>
                       </div>

                       {/* PÁGINA 2: CÓMO USAR ESTA PLANTILLA */}
                       <div style={{ pageBreakAfter: 'always', padding: '40px' }} className="min-h-[297mm] flex flex-col relative box-border">
                          <div className="flex justify-between border-b-2 border-black pb-4 mb-10">
                              <span className="font-black text-lg tracking-widest">TUJAGUE STRENGTH</span>
                              <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">Manual de Ejecución</span>
                          </div>
                          
                          <div className="flex-1">
                              <h3 className="text-2xl font-black uppercase mb-4 bg-black text-white inline-block px-4 py-2">Reglas del Sistema BII-Vintage</h3>
                              <p className="text-sm font-medium leading-relaxed mb-8 text-gray-800">
                                 Este documento contiene la estructura exacta de tu mesociclo. El objetivo es aplicar la <strong>sobrecarga progresiva</strong> a lo largo de 4 semanas. Completa los casilleros de "Real ___kg" con lapicera en cada sesión. Si el RPE o el tempo se rompen, ajusta la carga.
                              </p>

                              <h4 className="font-black uppercase border-b-2 border-gray-300 pb-2 mb-4">Glosario Técnico y Escalas</h4>
                              <table className="w-full border border-gray-300 mb-8 text-sm text-left">
                                 <tbody>
                                    <tr className="border-b border-gray-300">
                                       <td className="p-3 font-bold w-1/3 bg-gray-100 border-r border-gray-300">Escala RPE / RIR</td>
                                       <td className="p-3"><strong>RPE 7:</strong> 3 reps en reserva. <strong>RPE 8:</strong> 2 reps en reserva. <strong>RPE 9:</strong> 1 rep en reserva. <strong>RPE 10:</strong> Fallo absoluto (0 reps).</td>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                       <td className="p-3 font-bold w-1/3 bg-gray-100 border-r border-gray-300">Lectura de Tempo (Ej: 4-1-X-1)</td>
                                       <td className="p-3">4s de Bajada (Excéntrica) | 1s Pausa Abajo | X (Subida Explosiva) | 1s Pausa Arriba apretando.</td>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                       <td className="p-3 font-bold w-1/3 bg-gray-100 border-r border-gray-300">Rest-Pause (Pausa Descanso)</td>
                                       <td className="p-3">Haces una serie fuerte sin fallar, descansas 20-25 segundos exactos, y sacas reps extra hasta el RPE indicado.</td>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                       <td className="p-3 font-bold w-1/3 bg-gray-100 border-r border-gray-300">Drop Set (Serie Descendente)</td>
                                       <td className="p-3">Haces una serie fuerte, bajas el peso un 10-20% rápido, y haces otra serie sin llegar al fallo.</td>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                       <td className="p-3 font-bold w-1/3 bg-gray-100 border-r border-gray-300">Myo-reps</td>
                                       <td className="p-3">1 serie de "activación" (cerca del límite) → descansos cortos de 15s → mini-series de 4-5 reps hasta el tope.</td>
                                    </tr>
                                    <tr>
                                       <td className="p-3 font-bold w-1/3 bg-gray-100 border-r border-gray-300">Cluster Sets</td>
                                       <td className="p-3">Divides la serie en pequeños bloques (ej. 3 reps + 3 reps) con micropausas de 20s en el medio.</td>
                                    </tr>
                                 </tbody>
                              </table>

                              <h4 className="font-black uppercase border-b-2 border-gray-300 pb-2 mb-4">Protocolo "Día Malo" (Manejo de Fatiga)</h4>
                              <ul className="list-disc pl-5 mb-8 text-sm font-medium space-y-2">
                                 <li><strong>Nivel 1 (Leve):</strong> Bajá un 5% la carga programada y cumplí los reps/tempo a la perfección.</li>
                                 <li><strong>Nivel 2 (Moderado):</strong> Bajá un 10%. Hacé solo el Top Set + 1 Back-off. Eliminá técnicas de intensidad.</li>
                                 <li><strong>Nivel 3 (Alto / Dolor):</strong> Todo a RPE 6-7 (muy suave) o cortá el ejercicio que genera molestias articulares agudas.</li>
                              </ul>
                          </div>

                          <div className="absolute bottom-10 left-10 right-10 flex justify-between border-t-2 border-black pt-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
                              <span>Lee detenidamente antes de iniciar la semana 1</span>
                              <span>Página 2</span>
                          </div>
                       </div>

                       {/* PÁGINAS DE RUTINAS (FLUJO CONTINUO) */}
                       <div style={{ padding: '40px' }}>
                          <div className="flex justify-between border-b-4 border-black pb-4 mb-10">
                              <span className="font-black text-xl tracking-widest">HOJAS DE REGISTRO DIARIO</span>
                              <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">Complete con lapicera en el gimnasio</span>
                          </div>

                          {days.map(day => {
                             if (!order[`routine_${day.id}`]) return null;
                             return (
                                <div key={day.id} style={{ pageBreakInside: 'avoid', marginBottom: '60px' }} className="border-4 border-black rounded-xl overflow-hidden shadow-sm">
                                   <div className="bg-black text-white p-4 flex justify-between items-center">
                                      <span className="text-2xl font-black uppercase tracking-widest">{day.label}</span>
                                      <span className="text-xs font-bold bg-white text-black px-3 py-1 rounded-full uppercase tracking-widest">Bloque Activo</span>
                                   </div>
                                   <div className="p-6 whitespace-pre-wrap text-sm md:text-base font-bold leading-loose text-gray-900" style={{ fontFamily: 'monospace' }}>
                                      {order[`routine_${day.id}`]}
                                   </div>
                                </div>
                             )
                          })}
                       </div>

                    </div>
                 </div>

                 {/* BOTÓN FLOTANTE ESTILIZADO (SOLO EN PANTALLA) */}
                 <div className="screen-only fixed bottom-6 md:bottom-10 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
                    <button 
                       onClick={handleSaveLogs} 
                       disabled={savingLogs} 
                       className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 md:px-14 py-5 md:py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_10px_50px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 pointer-events-auto text-xs md:text-sm border border-emerald-400"
                    >
                       {savingLogs ? "Sincronizando Base de Datos..." : "💾 ALMACENAR DATOS DE SESIÓN"}
                    </button>
                 </div>
              </>
            )}
          </div>
        )}

        {/* ─── PESTAÑA BOVEDA TÉCNICA ─── */}
        {activeTab === "boveda" && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
             <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">Bóveda Técnica <span className="text-emerald-500">BII-Vintage</span></h2>
                <p className="text-zinc-400 mt-4 text-sm md:text-base font-medium max-w-2xl mx-auto">Estudie rigurosamente el diseño de palancas y ejecución antes del abordaje práctico en el gimnasio.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {[
                  { id: 'squat', name: 'Sentadilla (Squat)', url: '' }, 
                  { id: 'bench', name: 'Press Banca (Bench)', url: '' },
                  { id: 'deadlift', name: 'Peso Muerto (Deadlift)', url: '' },
                  { id: 'military', name: 'Press Militar (OHP)', url: '' },
                  { id: 'dips', name: 'Fondos (Dips)', url: '' }
                ].map(video => (
                   <div key={video.id} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-shadow">
                      <div className="p-6 md:p-8 border-b border-zinc-800 bg-black/40">
                         <h3 className="font-black italic uppercase text-lg md:text-xl text-white tracking-tight">{video.name}</h3>
                      </div>
                      
                      {video.url ? (
                         <div className="aspect-video w-full bg-black">
                            <iframe width="100%" height="100%" src={video.url} title={video.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                         </div>
                      ) : (
                         <div className="aspect-video w-full bg-black flex flex-col items-center justify-center p-8 relative shadow-inner">
                             <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-zinc-800 mb-6 opacity-50 shadow-inner">
                                 <span className="text-3xl">🔒</span>
                             </div>
                             <h4 className="text-zinc-500 font-black tracking-widest text-[10px] md:text-xs uppercase text-center">Clínica Técnica en Producción</h4>
                             <p className="text-zinc-600 text-[9px] md:text-[10px] mt-2 font-bold uppercase tracking-widest">Coach Luciano Tujague</p>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* ─── PESTAÑA DE AUDITORÍA DE VIDEOS ─── */}
        {activeTab === "videos" && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            {!order.has_video_review ? (
                <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-red-500/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>
                    
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-black rounded-full flex items-center justify-center border border-zinc-800 mx-auto mb-8 relative z-10 shadow-inner">
                        <span className="text-4xl md:text-5xl opacity-50">🔒</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black italic mb-6 tracking-tighter text-white relative z-10 uppercase drop-shadow-md">
                        MÓDULO <span className="text-red-500">RESTRINGIDO</span>
                    </h2>
                    <p className="text-zinc-400 font-medium max-w-2xl mx-auto mb-12 text-sm md:text-lg relative z-10 leading-relaxed px-4">
                        Su suscripción actual omite la Auditoría Técnica Biomecánica. Esta es la herramienta indispensable para eludir estancamientos mecánicos estructurales bajo cargas máximas.
                    </p>
                    
                    <div className="bg-black/60 border border-zinc-800 p-6 md:p-10 rounded-3xl max-w-lg mx-auto mb-12 text-left relative z-10 shadow-lg">
                        <p className="text-[10px] md:text-xs text-zinc-500 font-black tracking-widest uppercase mb-6 border-b border-zinc-800/50 pb-3">Beneficios del Sistema:</p>
                        <ul className="space-y-4 md:space-y-5">
                            <li className="flex items-start gap-4 text-sm md:text-base text-zinc-300 font-medium"><span className="text-emerald-500 font-black">✓</span> Auditoría clínica de patrones motores.</li>
                            <li className="flex items-start gap-4 text-sm md:text-base text-zinc-300 font-medium"><span className="text-emerald-500 font-black">✓</span> Calibración de palancas y tensión estructural.</li>
                            <li className="flex items-start gap-4 text-sm md:text-base text-zinc-300 font-medium"><span className="text-emerald-500 font-black">✓</span> Intervención directa del Head Coach en la base de datos.</li>
                        </ul>
                    </div>

                    <button 
                       onClick={handleBuyUpsell}
                       disabled={loadingUpsell}
                       className="relative z-10 inline-flex items-center justify-center bg-emerald-500 text-black px-10 md:px-14 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] disabled:opacity-50 hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        {loadingUpsell ? 'ESTABLECIENDO CONEXIÓN FINANCIERA...' : 'DESBLOQUEAR MÓDULO POR ARS $15.000'}
                    </button>
                </div>
            ) : (
              <div className="space-y-16">
                
                {/* VIDEOS PRINCIPALES */}
                <div>
                   <div className="text-center md:text-left mb-10">
                      <h3 className="text-3xl md:text-4xl font-black italic text-emerald-500 uppercase tracking-tighter drop-shadow-md">El Core BII-Vintage</h3>
                      <p className="text-zinc-400 font-medium text-sm md:text-base mt-2">Aporte visual para la calibración del Big 5.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                     {mainLifts.map(lift => (
                        <div key={lift.id} className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl hover:border-emerald-500/30 transition-colors">
                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-zinc-800/50 pb-6">
                              <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{lift.label}</h3>
                              {order[`video_${lift.id}`] 
                                  ? <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase border border-emerald-500/30 shadow-inner w-full sm:w-auto text-center">Evidencia Cargada</span> 
                                  : <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase w-full sm:w-auto text-center">En Espera</span>
                              }
                           </div>

                           <div className="mb-8 bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
                              <div>
                                 <p className="text-xs md:text-sm text-zinc-300 font-bold mb-2 uppercase tracking-widest">Aportar Serie Efectiva</p>
                                 <p className="text-[10px] text-zinc-500 font-medium">Extensión: MP4/MOV (Máx 50MB)</p>
                              </div>
                              <label className={`cursor-pointer px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center shrink-0 w-full sm:w-auto shadow-md ${uploading === lift.id ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95'}`}>
                                 {uploading === lift.id ? 'TRANSMITIENDO...' : 'CARGAR VIDEO 📹'}
                                 <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, lift.id)} disabled={uploading === lift.id} />
                              </label>
                           </div>

                           <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-inner">
                              <h4 className="flex items-center gap-3 text-emerald-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Auditoría del Coach
                              </h4>
                              {order[`feedback_${lift.id}`] ? (
                                <p className="text-emerald-50 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{order[`feedback_${lift.id}`]}</p>
                              ) : (
                                <p className="text-emerald-500/40 text-xs md:text-sm italic font-medium">Se requiere material visual para iniciar la evaluación técnica.</p>
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
            )}
          </div>
        )}

        {/* ─── PESTAÑA RM Y TROFEOS ÉPICOS (52 MEDALLAS) ─── */}
        {activeTab === "rm" && (
          <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-500">
            
            {/* PANEL DE REGISTRO DE RM */}
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 sm:p-10 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl">
               <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -mr-20 -mt-20"></div>
               
               <h2 className="text-4xl md:text-6xl font-black italic text-center mb-10 md:mb-16 text-white relative z-10 tracking-tighter drop-shadow-md">
                  MÉTRICAS BASE DE <span className="text-emerald-500 block sm:inline">1RM</span>
               </h2>
               
               {/* 🎮 SISTEMA DE NIVELES Y GAMIFICACIÓN */}
               <div className="relative z-10 bg-black/60 border border-zinc-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 mb-12 md:mb-16 shadow-inner">
                   <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-6">
                       <div className="text-center md:text-left">
                           <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Rango Actual</p>
                           <h3 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">{levelInfo.current}</h3>
                       </div>
                       <div className="text-center md:text-right">
                           <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Próximo Rango</p>
                           <p className="text-2xl md:text-3xl font-black italic text-zinc-300 uppercase tracking-tighter">{levelInfo.next}</p>
                       </div>
                   </div>

                   <div className="w-full bg-zinc-900 rounded-full h-4 md:h-6 mb-6 border border-zinc-800 relative overflow-hidden shadow-inner">
                       <div 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative"
                          style={{ width: `${progressPercent}%` }}
                       >
                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                       </div>
                   </div>

                   <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest gap-4">
                       <span className="text-zinc-400 bg-black/50 px-4 py-2 rounded-xl border border-zinc-800">{totalAbsoluto} KG Totales Absolutos</span>
                       {kgLeft > 0 ? (
                           <span className="text-emerald-400 bg-emerald-500/10 px-5 py-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">Faltan {kgLeft} KG para ascender</span>
                       ) : (
                           <span className="text-yellow-400 bg-yellow-500/10 px-5 py-2.5 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">Nivel Máximo Desbloqueado 👑</span>
                       )}
                   </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12 md:mb-16 relative z-10">
                  {[
                    { id: 'squat', name: 'Sentadilla' },
                    { id: 'bench', name: 'Press Banca' },
                    { id: 'deadlift', name: 'Peso Muerto' },
                    { id: 'dips', name: 'Fondos' },
                    { id: 'military', name: 'Militar' }
                  ].map(lift => (
                     <div key={lift.id} className="bg-black/60 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-800 text-center relative focus-within:border-emerald-500/50 transition-all hover:bg-zinc-900/40 shadow-inner group">
                         <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 md:mb-6 group-hover:text-emerald-500/50 transition-colors">{lift.name}</p>
                         <div className="relative inline-block w-full">
                            <input 
                               type="number"
                               inputMode="numeric"
                               value={rms[lift.id as keyof typeof rms] || ""} 
                               onChange={e => setRms(prev => ({...prev, [lift.id]: e.target.value}))}
                               className="bg-transparent text-center text-4xl md:text-5xl lg:text-6xl font-black text-white w-full outline-none focus:text-emerald-400 transition-colors placeholder:text-zinc-800"
                               placeholder="0"
                            />
                            <span className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-2 text-zinc-700 text-[10px] md:text-sm font-black">KG</span>
                         </div>
                     </div>
                  ))}
               </div>

               <button 
                 onClick={saveRMs}
                 disabled={savingRm}
                 className="relative z-10 w-full bg-emerald-500 text-black py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_10px_40px_rgba(16,185,129,0.3)] active:scale-95"
               >
                 {savingRm ? 'SINCRONIZANDO CON BASE DE DATOS...' : 'CONFIRMAR NUEVAS MÉTRICAS ⚡'}
               </button>

               {/* 🔥 IA DE RM - ANÁLISIS DE PROPORCIONES 🔥 */}
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

            {/* MURO DE TROFEOS HARDCORE (52 MEDALLAS) */}
            <div className="bg-[#0a0a0c] border border-emerald-900/40 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl">
               <div className="absolute top-0 left-0 w-full h-[500px] md:h-[800px] bg-emerald-500/5 blur-[120px] md:blur-[180px] pointer-events-none -translate-y-1/2"></div>
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8 text-left relative z-10">
                   <div>
                       <h3 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">Inventario de Logros <span className="text-emerald-500 block sm:inline">Élite</span></h3>
                       <p className="text-zinc-400 text-xs md:text-sm mt-4 font-medium tracking-wide">Acumulado del trabajo de fuerza a largo plazo. TOTAL ABSOLUTO: <span className="text-emerald-400 font-black text-xl md:text-2xl ml-1 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{totalAbsoluto} KG</span></p>
                   </div>
                   <button 
                       onClick={shareTrophies}
                       className="bg-zinc-900 hover:bg-emerald-500 hover:text-black text-white border border-zinc-700 hover:border-emerald-500 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto"
                   >
                       <span>Compartir Legado</span>
                       <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.067 3.204.146 4.833 1.79 4.98 5.01.054 1.266.066 1.645.066 4.849 0 3.205-.012 3.584-.066 4.85-.147 3.22-1.776 4.864-4.98 5.01-1.266.054-1.646.066-4.85.066-3.204 0-3.584-.012-4.85-.066-3.204-.146-4.833-1.79-4.98-5.01-.054-1.266-.066-1.645-.066-4.85 0-3.205.012-3.584.066-4.85.147-3.22 1.776-4.864 4.98-5.01 1.266-.054 1.646-.066 4.85-.066m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.848-6.98 6.208-.058 1.28-.072 1.688-.072 4.948s.014 3.668.072 4.948c.2 4.358 2.618 6.008 6.98 6.208 1.281.058 1.689.072 4.947.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.848 6.979-6.208.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.004-6.979-6.209C15.668.014 15.259 0 12 0zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                   </button>
               </div>

               <div className="space-y-16 md:space-y-24 relative z-10">
                  {Object.entries(groupedTrophies).map(([category, items], index) => (
                     <div key={index} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                        <h4 className="text-emerald-500 font-black tracking-[0.2em] text-xs md:text-sm uppercase mb-6 md:mb-8 border-b border-zinc-800/80 pb-4">
                           {category}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6">
                           {items.map(trophy => (
                               <div key={trophy.id} className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-500 flex flex-col justify-between min-h-[140px] md:min-h-[160px] relative overflow-hidden ${trophy.unlocked ? 'bg-gradient-to-br from-emerald-950/40 to-black border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02] hover:scale-105' : 'bg-black/40 border-zinc-800/80 opacity-60 grayscale'}`}>
                                   
                                   {trophy.unlocked && <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-[25px] pointer-events-none"></div>}
                                   
                                   <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                                      <span className={`text-4xl md:text-5xl drop-shadow-md ${trophy.unlocked ? 'animate-pulse' : ''}`}>{trophy.icon}</span>
                                      {trophy.unlocked ? (
                                         <span className="text-black font-black text-[10px] md:text-xs bg-emerald-500 px-2.5 py-1 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.6)]">✓</span>
                                      ) : (
                                         <span className="text-zinc-600 text-[10px] md:text-xs bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">🔒</span>
                                      )}
                                   </div>
                                   <div className="relative z-10">
                                      <h4 className={`font-black italic uppercase text-[11px] md:text-[13px] tracking-tight leading-tight mb-1 md:mb-1.5 ${trophy.unlocked ? 'text-white' : 'text-zinc-500'}`}>{trophy.title}</h4>
                                      <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${trophy.unlocked ? 'text-emerald-400' : 'text-zinc-600'}`}>{trophy.desc}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
               <h3 className="text-2xl md:text-4xl font-black italic text-white mb-10 md:mb-12 text-center md:text-left drop-shadow-md">TRAYECTORIA DE <span className="text-emerald-500 block sm:inline">FUERZA PROYECTADA</span></h3>
               <div className="h-[300px] md:h-[400px] w-full bg-black/40 p-4 md:p-6 rounded-[2rem] border border-zinc-800/80 shadow-inner">
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
                     <Line type="monotone" dataKey="Sentadilla" stroke="#10b981" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                     <Line type="monotone" dataKey="Banca" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                     <Line type="monotone" dataKey="PesoMuerto" stroke="#ef4444" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                     <Line type="monotone" dataKey="Fondos" stroke="#eab308" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* ─── PESTAÑA CHECKIN (SÚPER CHECK-IN NIVEL DIOS) ─── */}
        {activeTab === "checkin" && (
           <div className="max-w-6xl mx-auto space-y-10 md:space-y-12 animate-in fade-in duration-500">
              
              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl">
                 <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -mr-20 -mt-20"></div>
                 
                 <div className="text-center mb-10 md:mb-14 relative z-10">
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Métricas de Alto Rendimiento</span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic text-white tracking-tighter uppercase mb-4 drop-shadow-md">AUDITORÍA DE <span className="text-emerald-500 block sm:inline">RECUPERACIÓN</span></h2>
                    <p className="text-zinc-400 text-sm md:text-base font-medium max-w-2xl mx-auto">Datos fundamentales para el ajuste auto-rregulado (RPE) y el cálculo de volumen semanal. La IA y el Coach analizarán su estado biológico.</p>
                 </div>

                 <form onSubmit={handleSaveCheckin} className="space-y-6 md:space-y-8 relative z-10 max-w-4xl mx-auto">
                    
                    {/* PILAR 1: BIO-MARCADORES */}
                    <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg">
                       <h3 className="text-emerald-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>🧬</span> Pilar 1: Bio-Marcadores Diarios</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-emerald-500/50 transition-colors group">
                              <label className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block group-hover:text-emerald-500 transition-colors">Peso Corporal (KG)</label>
                              <input 
                                 type="number" step="0.1" required
                                 value={checkin.weight} onChange={e => setCheckin({...checkin, weight: e.target.value})}
                                 className="w-full bg-transparent text-3xl md:text-4xl font-black text-white outline-none focus:text-emerald-400 transition-colors placeholder:text-zinc-800"
                                 placeholder="Ej: 80.5"
                              />
                           </div>
                           <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-blue-500/50 transition-colors group">
                              <label className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block group-hover:text-blue-500 transition-colors">Sueño Efectivo (Horas)</label>
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
                    <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg">
                       <h3 className="text-orange-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>🥩</span> Pilar 2: Metabolismo y Nutrición</h3>
                       
                       <div className="space-y-8">
                           {/* Adherencia (1-100) */}
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
                               {/* Hambre */}
                               <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                   <div className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                     <span>Nivel de Hambre</span>
                                     <span className="text-white font-black">{checkin.hunger}/10</span>
                                   </div>
                                   <input type="range" min="1" max="10" required value={checkin.hunger} onChange={e => setCheckin({...checkin, hunger: e.target.value})} className="w-full accent-white h-1.5 bg-black rounded-full appearance-none cursor-pointer" />
                                   <div className="flex justify-between text-[8px] text-zinc-600 mt-2 font-bold uppercase"><span>Saciado</span><span>Hambriento</span></div>
                               </div>
                               
                               {/* Energía */}
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
                    <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg">
                       <h3 className="text-red-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>⚠️</span> Pilar 3: Fatiga del SNC y Articular</h3>
                       
                       <div className="space-y-8">
                           {/* Estrés */}
                           <div className="bg-zinc-900/50 border border-red-900/30 p-6 rounded-2xl hover:border-red-500/50 transition-all">
                               <div className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                 <span>Estrés Sistémico General</span>
                                 <span className="text-red-500 text-xl md:text-2xl font-black italic bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20">{checkin.stress}/10</span>
                               </div>
                               <input type="range" min="1" max="10" required value={checkin.stress} onChange={e => setCheckin({...checkin, stress: e.target.value})} className="w-full accent-red-500 h-2 bg-black rounded-full appearance-none cursor-pointer border border-zinc-800" />
                               <div className="flex justify-between text-[9px] text-zinc-600 mt-3 font-black uppercase tracking-widest"><span>1 (Calmado)</span><span>10 (Colapsado)</span></div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Recuperación Muscular */}
                               <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                                   <div className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex justify-between items-center">
                                     <span>Recuperación Muscular</span>
                                     <span className="text-blue-400 font-black">{checkin.recovery}/10</span>
                                   </div>
                                   <input type="range" min="1" max="10" required value={checkin.recovery} onChange={e => setCheckin({...checkin, recovery: e.target.value})} className="w-full accent-blue-400 h-1.5 bg-black rounded-full appearance-none cursor-pointer" />
                                   <div className="flex justify-between text-[8px] text-zinc-600 mt-2 font-bold uppercase"><span>Destruido (DOMS)</span><span>Recuperado al 100%</span></div>
                               </div>

                               {/* Dolor Articular */}
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

                    {/* PILAR 4: EJECUCIÓN (RIR 0) */}
                    <div className="bg-black/40 border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-lg">
                       <h3 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2"><span>⚔️</span> Pilar 4: Disciplina BII-Vintage</h3>
                       
                       <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                           <div>
                               <p className="text-sm md:text-base font-black text-white uppercase tracking-tight mb-1">¿Alcanzaste el Fallo Muscular?</p>
                               <p className="text-[10px] md:text-xs text-zinc-400 font-medium">¿Tus Top Sets llegaron al fallo real (RIR 0) con técnica estricta, o te guardaste repeticiones?</p>
                           </div>
                           
                           {/* iOS Toggle Switch */}
                           <label className="relative inline-flex items-center cursor-pointer shrink-0">
                               <input type="checkbox" checked={checkin.hit_failure} onChange={(e) => setCheckin({...checkin, hit_failure: e.target.checked})} className="sr-only peer" />
                               <div className="w-16 h-8 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                               <span className={`ml-4 text-xs font-black uppercase tracking-widest ${checkin.hit_failure ? 'text-emerald-500' : 'text-zinc-500'}`}>{checkin.hit_failure ? 'SÍ, FALLO REAL' : 'NO, ME GUARDÉ REPS'}</span>
                           </label>
                       </div>

                       <div className="mt-6 bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl focus-within:border-emerald-500/50 transition-colors">
                          <label className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block">Registro Clínico Libre</label>
                          <textarea 
                             value={checkin.notes} onChange={e => setCheckin({...checkin, notes: e.target.value})}
                             placeholder="Anotaciones adicionales para el Coach. Ej: 'Sentí que la banca volaba esta semana', 'Tuve mucho trabajo y comí mal un día'..."
                             className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm md:text-base font-medium text-zinc-300 outline-none resize-none h-24 md:h-32 placeholder:text-zinc-700 custom-scrollbar shadow-inner focus:border-emerald-500"
                          />
                       </div>
                    </div>

                    <div className="pt-4 md:pt-6">
                        <button 
                           type="submit"
                           disabled={savingCheckin}
                           className="w-full bg-emerald-500 text-black py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_10px_40px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-3"
                        >
                           {savingCheckin ? 'COMUNICANDO DATOS AL SISTEMA...' : 'ENVIAR REPORTE AL HEAD COACH 🚀'}
                        </button>
                    </div>
                 </form>
              </div>

              {checkinHistory.length > 0 && (
                 <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 backdrop-blur-xl">
                    <h3 className="text-2xl md:text-4xl font-black italic text-white mb-10 md:mb-12 text-center md:text-left drop-shadow-md">Gráfico de <span className="text-emerald-500 block sm:inline">Fatiga Semanal</span></h3>
                    
                    <div className="h-[300px] md:h-[400px] w-full bg-black/40 p-4 md:p-6 rounded-[2rem] border border-zinc-800/80 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={checkinHistory} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                          <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} dx={-10} />
                          <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} dx={10} />
                          
                          <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', padding: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 'bold' }} iconType="circle" />
                          
                          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso Corporal (kg)" stroke="#10b981" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="stress" name="Nivel de Estrés (1-10)" stroke="#ef4444" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="sleep" name="Horas de Sueño" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              )}

           </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
        
        .whitespace-pre-wrap { white-space: pre-wrap !important; }

        /* Ajuste específico para esconder la scrollbar nativa en las pestañas móviles pero permitir scroll */
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

        /* Colores específicos para cada slider */
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

        /* 🔥 CSS EXCLUSIVO PARA QUE EL PDF SALGA BLANCO, PERFECTO E IMPRIMIBLE 🔥 */
        .print-only { display: none; }
        
        .exporting-pdf-mode .screen-only { 
            display: none !important; 
        }
        
        .exporting-pdf-mode .print-only { 
            display: block !important; 
        }

        .exporting-pdf-mode {
            background-color: #ffffff !important;
            color: #000000 !important;
        }
        
        .exporting-pdf-mode * {
            color: #000000 !important; 
        }
        
        .exporting-pdf-mode .pdf-exclude {
            display: none !important;
        }
      `}} />
    </div>
  );
}