"use client";

import { useState, useEffect, useRef } from "react";
import CheckoutClient from "./components/CheckoutClient";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// ─── COMPONENTE DE ANIMACIÓN AL HACER SCROLL ───
function RevealOnScroll({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 } 
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── CONFIGURACIÓN DE DATOS (CON MARKETING AUTÉNTICO) ───
const PRICING_MATRIX = {
  weekly: [
    {
      id: "semanal-3-4",
      title: "INICIO RÁPIDO (3-4 DÍAS)",
      subtitle: "Prueba Semanal / Adaptación",
      price: 20000,
      description: "Ideal para quienes quieren probar la metodología por primera vez o disponen de poco tiempo en la semana.",
      features: ["Rutina enfocada en básicos", "Foco: Técnica en SBD", "Sin ajustes de largo plazo"],
      highlight: false,
      idealFor: "Gente ocupada / Principiantes",
      actionLabel: "⚡ Ingreso Inmediato al Sistema"
    },
    {
      id: "semanal-5-6",
      title: "INTENSIVO (5-6 DÍAS)",
      subtitle: "Semana de Choque",
      price: 32000,
      description: "Una semana de alta frecuencia para evaluar tu capacidad de recuperación y técnica bajo fatiga.",
      features: ["Alta densidad de entrenamiento", "Técnicas RIR/RPE", "Ideal para atletas con experiencia"],
      highlight: true,
      idealFor: "Atletas intermedios serios",
      actionLabel: "🔥 Plan de Alta Demanda Actual"
    },
    {
      id: "semanal-7",
      title: "FULL SEMANA (7 DÍAS)",
      subtitle: "Máxima Exigencia",
      price: 38000,
      description: "Siete días de programación estricta. Para quienes no quieren dejar ni un solo día al azar.",
      features: ["Programación diaria", "Control de volumen total", "Máximo rendimiento semanal"],
      highlight: false,
      idealFor: "Alto volumen / Avanzados",
      actionLabel: "⚙️ Requiere Auditoría Previa"
    }
  ],
  monthly: [
    {
      id: "mensual-3-4",
      title: "MESOCICLO BASE (3-4 DÍAS)",
      subtitle: "Progreso Constante",
      price: 50000,
      description: "Planificación mensual estructurada. Ideal para combinar con otras actividades manteniendo el progreso en fuerza.",
      features: ["Ajustes semanales de carga", "Periodización Lineal", "🤖 Tujague AI (Soporte 24/7)"],
      highlight: false,
      idealFor: "Gente ocupada / 3-4 días",
      actionLabel: "🤖 Sistema Tujague AI Habilitado"
    },
    {
      id: "mensual-5-6",
      title: "PRO PERFORMANCE (5-6 DÍAS)",
      subtitle: "Evolución Real",
      price: 100000,
      description: "El estándar para el atleta serio. 4 semanas de progresión técnica y de cargas diseñada para resultados máximos.",
      features: ["Ajustes en 24hs", "Tabla de RPE personalizada", "🤖 Tujague AI (Análisis Biomecánico)"],
      highlight: true,
      idealFor: "Intermedio serio / 5-6 días",
      actionLabel: "⭐ El Plan Más Elegido Del Mes"
    },
    {
      id: "mensual-7",
      title: "ÉLITE TOTAL (7 DÍAS)",
      subtitle: "Planificación Maestra",
      price: 115000,
      description: "Programación avanzada de 4 semanas. Requiere máxima disciplina y capacidad de trabajo. No apto para principiantes.",
      features: ["Gestión total de variables", "Análisis de recuperación", "🤖 Tujague AI (Soporte Ilimitado)"],
      highlight: false,
      idealFor: "Alto volumen / NO Principiantes",
      actionLabel: "👑 Soporte Prioritario VIP"
    }
  ],
  // 🔥 NUEVA SECCIÓN: PROTOCOLOS ESTÁTICOS DE DOWNSELL 🔥
  static: [
    {
      id: "static-fuerza",
      title: "PROTOCOLO FUERZA BASE",
      subtitle: "4 Semanas (PDF / Panel)",
      price: 30000,
      description: "Enfoque 100% Neural. Diseñado matemáticamente para maximizar tu 1RM en los básicos (Sentadilla, Banca, Peso Muerto). Bajo volumen, altísima intensidad y descansos largos. Ideal para destruir estancamientos de fuerza.",
      features: ["Estructura exacta de progresión", "✗ Sin revisión de videos", "✗ Sin Tujague AI (Asistente Bloqueado)", "✗ Sin contacto con el Coach"],
      highlight: false,
      idealFor: "Estancados en Fuerza / Powerlifters",
      actionLabel: "🔒 MODO ESTUDIO INDEPENDIENTE"
    },
    {
      id: "static-hipertrofia",
      title: "MUTACIÓN HIPERTRÓFICA",
      subtitle: "4 Semanas (PDF / Panel)",
      price: 30000,
      description: "Enfoque en tensión mecánica y daño muscular. Alto volumen de trabajo, técnicas de intensidad (Drop sets, Rest-Pause) y rangos de hipertrofia (8-15 reps). Construcción de masa magra pura con estructura BII.",
      features: ["Selección óptima de accesorios", "✗ Sin revisión de videos", "✗ Sin Tujague AI (Asistente Bloqueado)", "✗ Sin contacto con el Coach"],
      highlight: false,
      idealFor: "Foco en estética / Bodybuilding",
      actionLabel: "🔒 MODO ESTUDIO INDEPENDIENTE"
    }
  ]
};

const EXTRA_VIDEO_PRICE = 15000;

// PREGUNTAS FRECUENTES (FAQ)
const FAQS = [
  { q: "¿Sirve si entreno solo 3 días a la semana?", a: "Absolutamente. La filosofía BII-Vintage se basa en entrenamientos breves, intensos e infrecuentes. Con 3 días bien programados podés ganar más fuerza que yendo 6 días a hacer volumen basura." },
  { q: "¿Cuánto tardás en armar mi programación?", a: "Una vez que completás tu Auditoría Inicial en el Dashboard, el plan estará listo en tu perfil entre 24 y 48 horas hábiles." },
  { q: "¿Necesito ser un atleta avanzado o tener experiencia?", a: "No. Si sos principiante el plan se enfocará 100% en construir tu técnica en los básicos (Sentadilla, Banca, Peso Muerto) antes de meter carga pesada." },
  { q: "¿Qué pasa si tengo una lesión previa?", a: "Adaptamos los ejercicios y la selección de variantes para no agravar ninguna molestia y fortalecer tu estructura en base a tu ficha clínica." },
  { q: "¿El sistema Tujague AI viene en todos los planes?", a: "No. El Asistente Inteligente (Tujague AI) es exclusivo para los atletas en planes MENSUALES VIP. Es tu soporte biomecánico 24/7."},
  { q: "¿Tienen programa de referidos o descuentos?", a: "Mantenemos un estándar clínico y no hacemos 'promociones' masivas para preservar la calidad del servicio. Sin embargo, nuestros atletas activos acceden a la Bóveda de Afiliados. Si un atleta del equipo te invita con su Código Privado, el sistema te aplicará un 15% de bonificación automática en tu ingreso."}
];

export default function Home() {
  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [addVideoReview, setAddVideoReview] = useState(false);
  const [topAthletes, setTopAthletes] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true); 
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 🤖 ESTADOS PARA EL BOT VENDEDOR
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<{role: string, content: string}[]>([
      { role: "assistant", content: "¡Bienvenido! Soy el Asesor Experto de Tujague Strength. ¿Querés que te explique cómo funciona la plataforma web o qué incluye cada plan?" }
  ]);
  const [botInput, setBotInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [pulseLive, setPulseLive] = useState(false);
  const botEndRef = useRef<HTMLDivElement>(null);

  // 🔥 ESTADOS PARA EL QUIZ DE RECOMENDACIÓN DE PLAN
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({ limitante: "", dias: "", nivel: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [recommendedPlan, setRecommendedPlan] = useState<any>(null);

  const currentPlans = isWeekly ? PRICING_MATRIX.weekly : PRICING_MATRIX.monthly;

  // ⭐⭐ SISTEMA DE AUTO-RECARGA EN TIEMPO REAL (WEBSOCKETS) Y BLINDAJE ⭐⭐
  const fetchTopAthletes = async () => {
    try {
        const { data, error } = await supabase
          .from('orders')
          .select('customer_name, rm_squat, rm_bench, rm_deadlift, rm_dips, rm_military')
          .eq('sub_status', 'active');
          
        if (error) throw error;
          
        if (data) {
           const ranked = data.map(athlete => {
              const sq = parseInt(athlete.rm_squat) || 0;
              const bp = parseInt(athlete.rm_bench) || 0;
              const dl = parseInt(athlete.rm_deadlift) || 0;
              const dp = parseInt(athlete.rm_dips) || 0;
              const mp = parseInt(athlete.rm_military) || 0;
              const total = sq + bp + dl + dp + mp;
              
              const nameParts = athlete.customer_name.split(' ');
              const safeName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length -1].charAt(0)}.` : nameParts[0];

              return { name: safeName, total, squat: sq, bench: bp, deadlift: dl, dips: dp, military: mp };
           })
           .filter(a => a.total > 0)
           .sort((a, b) => b.total - a.total)
           .slice(0, 5);

           setTopAthletes(ranked);
           
           setPulseLive(true);
           setTimeout(() => setPulseLive(false), 2000);
        }
    } catch (err) {
        console.error("Error al cargar atletas:", err);
    } finally {
        setLoadingLeaderboard(false); 
    }
  };

  useEffect(() => {
    fetchTopAthletes();

    const channel = supabase
      .channel('realtime-muro-fama')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('¡Récord detectado en la base de datos! Actualizando...');
          fetchTopAthletes();
        }
      )
      .subscribe();

    return () => {
       supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
      if (isBotOpen) {
          botEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
  }, [botMessages, isBotTyping, isBotOpen]);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToPricing = () => {
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔥 LÓGICA DEL TRIAGE CLÍNICO Y CARGA FALSA DE ALTO VALOR 🔥
  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisText("Cruzando datos biomecánicos...");
    
    setTimeout(() => setAnalysisText("Evaluando tolerancia del Sistema Nervioso Central..."), 800);
    setTimeout(() => setAnalysisText("Calculando requerimientos de recuperación..."), 1600);
    setTimeout(() => setAnalysisText("Generando dictamen clínico..."), 2400);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setQuizStep(4); 
    }, 3200);
  };

  const handleQuizAnswer = (field: string, value: string) => {
      const newAnswers = { ...quizAnswers, [field]: value };
      setQuizAnswers(newAnswers);
      
      if (quizStep === 3) {
          let planToRecommend = PRICING_MATRIX.monthly[0]; 
          if (newAnswers.dias === "alto" || newAnswers.dias === "medio") {
              if (newAnswers.nivel === "elite") {
                  planToRecommend = PRICING_MATRIX.monthly[2]; 
              } else {
                  planToRecommend = PRICING_MATRIX.monthly[1]; 
              }
          }
          setRecommendedPlan(planToRecommend);
          startAnalysis(); 
      } else {
          setQuizStep(quizStep + 1);
      }
  };

  const getDiagnosticText = () => {
    let diag = "";
    
    if (quizAnswers.dias === "bajo") diag += "Al entrenar solo 2-3 días, tu perfil exige un protocolo BII (Breve, Intenso, Infrecuente) de altísima tensión mecánica. Una rutina genérica te dejará en subentrenamiento total. ";
    if (quizAnswers.dias === "medio") diag += "Tu disponibilidad de 4 días es óptima, pero requiere una periodización exacta (Top Sets + Backoffs) para no quemar tu SNC a mitad de semana. ";
    if (quizAnswers.dias === "alto") diag += "¡ALERTA ROJA! Entrenar 5-6 días te pone en riesgo crítico de sobreentrenamiento y fatiga del SNC. Necesitas una gestión del volumen quirúrgica. ";

    if (quizAnswers.limitante === "lesiones") diag += "Además, al presentar molestias articulares, debemos eliminar los 'ejercicios basura' y transicionar inmediatamente a variantes de alta estabilidad externa y control excéntrico. ";
    if (quizAnswers.limitante === "estancamiento") diag += "Tu estancamiento actual es prueba de que has agotado tus adaptaciones de novato; necesitas programar fases de sobrecarga y descargas (Deloads) programadas de forma inteligente. ";
    
    diag += "\n\nCONCLUSIÓN CLÍNICA: La única vía segura y eficiente para tu biología actual es el Coaching BII-Vintage. Necesitas que evalúe tus videos, controle tu fatiga y ajuste tus cargas semana a semana.";
    
    return diag;
  };

  const handleAcceptRecommendation = () => {
      setIsWeekly(false); 
      handleSelectPlan(recommendedPlan);
  };

  const handleSendBotMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!botInput.trim()) return;

      const userMsg = botInput;
      setBotMessages(prev => [...prev, { role: "user", content: userMsg }]);
      setBotInput("");
      setIsBotTyping(true);

      try {
          const res = await fetch("/api/client/bot", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: userMsg })
          });
          
          const data = await res.json();
          if (data.reply) {
              setBotMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
          }
      } catch (error) {
          setBotMessages(prev => [...prev, { role: "assistant", content: "El sistema está saturado. Escribile directo al Coach por WhatsApp." }]);
      } finally {
          setIsBotTyping(false);
      }
  };

  const whatsappMessage = encodeURIComponent("Hola Coach, quiero aplicar para ingresar al equipo BII-Vintage y llevar mi fuerza al siguiente nivel. ¿Qué datos necesitas?");
  const whatsappUrl = `https://wa.me/5491123021760?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#050505] text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ─── FONDO ÉPICO ─── */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/hero.png" 
          alt="Background"
          fill
          className="object-cover opacity-15 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505] z-10"></div>
      </div>
      
      {/* ─── NAVBAR FLOTANTE ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-black italic tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
            TUJAGUE <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">STRENGTH</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* BOTÓN EXTRA PARA VOLVER AL INICIO */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hidden sm:flex text-zinc-400 hover:text-emerald-400 text-[10px] uppercase font-black tracking-widest transition-colors items-center gap-1">
               <span className="text-sm">🏠</span> Inicio
            </button>
            <Link href="/dashboard">
              <button className="px-5 sm:px-6 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95">
                Acceso Clientes
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── BOTONES FLOTANTES ─── */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 bg-emerald-500 p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-110 transition-transform active:scale-95 group border border-emerald-400"
      >
        <span className="absolute -top-12 right-0 bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hablá con Luciano
        </span>
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.097 0-4.142-.547-5.946-1.588L0 .057zm12.026-2.137c1.892 0 3.738-.503 5.339-1.455l.382-.227 3.97 1.041-1.059-3.869.25-.397c1.046-1.666 1.599-3.593 1.599-5.606 0-5.833-4.744-10.577-10.577-10.577-2.827 0-5.483 1.1-7.481 3.098s-3.098 4.654-3.098 7.481c0 2.013.553 3.94 1.599 5.606l.25.397-1.059 3.869 4.074-1.069.382.227c1.6.952 3.447 1.455 5.339 1.455z"/></svg>
      </a>

      <div className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-50">
         {!isBotOpen ? (
            <button 
               onClick={() => setIsBotOpen(true)}
               className="bg-zinc-900 border border-emerald-500/50 w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform flex items-center justify-center relative group backdrop-blur-md"
            >
               <span className="absolute -top-12 left-0 bg-zinc-900 border border-zinc-700 text-emerald-400 text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                  Consultas
               </span>
               <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-pulse"></span>
               <svg className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </button>
         ) : (
            <div className="bg-[#0a0a0c]/95 border border-zinc-800 w-[90vw] max-w-[380px] h-[500px] max-h-[75vh] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 backdrop-blur-xl">
               <div className="bg-zinc-900/80 border-b border-zinc-800 p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-2xl"></div>
                  <div className="flex items-center gap-3 relative z-10">
                     <span className="text-2xl drop-shadow-md">🤖</span>
                     <div>
                        <h4 className="font-black italic text-sm text-white leading-none">Asesor <span className="text-emerald-500">Comercial</span></h4>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Tujague Strength</span>
                     </div>
                  </div>
                  <button onClick={() => setIsBotOpen(false)} className="text-zinc-500 hover:text-white relative z-10 transition-colors text-xl p-1">✕</button>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/40">
                  {botMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[85%] shadow-md ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm border border-zinc-700/50' : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-50 rounded-tl-sm'}`}>
                           {msg.content}
                        </div>
                     </div>
                  ))}
                  {isBotTyping && (
                     <div className="flex flex-col items-start">
                        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 rounded-tl-sm flex items-center gap-1.5 shadow-md">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                        </div>
                     </div>
                  )}
                  <div ref={botEndRef} />
               </div>

               <form onSubmit={handleSendBotMessage} className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950/90 flex gap-2">
                  <input 
                     type="text" 
                     value={botInput}
                     onChange={(e) => setBotInput(e.target.value)}
                     placeholder="Escribe tu consulta aquí..."
                     className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 transition-colors shadow-inner"
                     disabled={isBotTyping}
                  />
                  <button 
                     type="submit" 
                     disabled={isBotTyping || !botInput.trim()}
                     className="bg-emerald-500 text-black w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-emerald-400 transition-all font-black text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                     ↑
                  </button>
               </form>
            </div>
         )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 p-4 z-[40] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-8">
         <button 
            onClick={scrollToPricing}
            className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2"
         >
            Elegir Mi Plan 🚀
         </button>
      </div>

      {/* ─── HERO SECTION ─── */}
      <RevealOnScroll delay={100}>
         <header className="relative z-10 pt-40 pb-20 sm:pt-48 sm:pb-32 md:pt-56 md:pb-40 text-center px-4 sm:px-6 overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-emerald-500/10 rounded-full blur-[100px] md:blur-[180px] pointer-events-none"></div>

           <span className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[11px] font-black tracking-[0.25em] backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
             <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
             EL MÉTODO BII-VINTAGE
           </span>
           
           <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black italic tracking-tighter leading-[1.05] sm:leading-[1.1] mb-6 sm:mb-8 text-white drop-shadow-2xl">
             FUERZA BRUTA, <br className="hidden sm:block md:hidden"/> SIN VIVIR EN EL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 inline-block pb-2">GIMNASIO.</span>
           </h1>

           <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-[90%] sm:max-w-2xl md:max-w-3xl mx-auto mb-10 sm:mb-14 leading-relaxed font-medium">
             Rompé el estancamiento. Dejá las rutinas genéricas de 6 días. Sumate al equipo y construí fuerza real dominando los básicos: <span className="text-white font-bold border-b border-emerald-500/50">Sentadilla, Banca, Peso Muerto, Fondos y Militar.</span>
           </p>
           
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto">
               <div className="w-full sm:w-auto text-center">
                   <Link 
                     href="/aplicar"
                     className="relative inline-flex items-center justify-center px-8 sm:px-12 py-5 sm:py-6 rounded-2xl sm:rounded-3xl bg-emerald-500 text-black font-black tracking-[0.15em] sm:tracking-widest text-xs sm:text-sm hover:bg-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all overflow-hidden group w-full"
                   >
                     <span className="relative z-10">APLICAR PARA EL EQUIPO</span>
                     <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                   </Link>
                   <p className="text-emerald-500/70 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-3 sm:mt-4">Te toma 2 min • Respuesta en 24hs</p>
               </div>
               
               <div className="w-full sm:w-auto text-center">
                   <button 
                     onClick={scrollToPricing}
                     className="px-8 sm:px-12 py-5 sm:py-6 rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-700 text-white font-black tracking-[0.15em] sm:tracking-widest text-xs sm:text-sm hover:bg-white hover:text-black hover:border-white transition-all w-full backdrop-blur-sm"
                   >
                     VER PLANES
                   </button>
                   <p className="text-zinc-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-3 sm:mt-4">Inicio Inmediato tras la Auditoría</p>
               </div>
           </div>

           <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mt-12 lg:mt-16 opacity-70">
              <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-zinc-300 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                 <span className="text-emerald-500 text-sm">✔</span> Soporte Directo y Personalizado
              </div>
              <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-zinc-300 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                 <span className="text-emerald-500 text-sm">✔</span> Corrección Biomecánica
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] lg:text-xs font-bold text-zinc-300 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                 <span className="text-emerald-500 text-sm">✔</span> Control de Fatiga Exacto
              </div>
           </div>
         </header>
      </RevealOnScroll>

      {/* ─── SECCIÓN: CÓMO FUNCIONA (BENTO GRID STYLE) ─── */}
      <section className="relative z-10 py-20 sm:py-32 bg-zinc-950 border-y border-white/5">
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
               <h2 className="text-center text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-12 sm:mb-20">El Proceso de Ingreso</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {[
                    { step: "1", title: "Elegí tu Plan", desc: "Seleccioná la frecuencia semanal y realizá el pago seguro. Recibís acceso al instante." },
                    { step: "2", title: "Auditoría Clínica", desc: "Completás tu historial médico y tus RMs actuales en el Dashboard Privado." },
                    { step: "3", title: "Entrenamiento BII", desc: "Recibís tu programación exacta. Entrenás, subís tus videos y ajustamos las cargas." }
                  ].map((item, i) => (
                     <div key={i} className={`relative z-10 bg-[#0a0a0c] border border-zinc-800/80 p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl hover:bg-zinc-900/80 hover:border-emerald-500/40 transition-all duration-500 flex flex-col ${i === 1 ? 'md:-translate-y-8' : ''}`}>
                        <span className="text-5xl sm:text-6xl font-black italic text-emerald-500/20 mb-6 block leading-none">{item.step}</span>
                        <h3 className="text-white font-black italic text-2xl sm:text-3xl tracking-tight mb-4 uppercase">{item.title}</h3>
                        <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed mt-auto">{item.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── EL MURO DE LA FAMA ─── */}
      <section className="relative z-10 py-24 sm:py-40 bg-[#050505] border-b border-white/5 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] sm:h-[800px] bg-emerald-500/5 blur-[150px] sm:blur-[200px] pointer-events-none"></div>
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
               <div className="text-center mb-12 sm:mb-20">
                  <span className={`bg-red-500/10 border border-red-500/30 text-red-500 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-6 inline-flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] ${pulseLive ? 'scale-110 shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'animate-pulse'}`}>
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></span> Datos en Vivo
                  </span>
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic text-white tracking-tighter uppercase mb-4 sm:mb-6 mt-2 drop-shadow-lg">
                      EL MURO DE LA <span className="text-emerald-500">FUERZA</span>
                  </h2>
                  <p className="text-zinc-400 text-sm sm:text-base font-medium px-4">Clasificación en tiempo real de la Fuerza Absoluta de la Tropa (Los 5 Básicos)</p>
               </div>

               {loadingLeaderboard ? (
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-20 text-center flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                     <span className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></span>
                     <p className="text-zinc-400 text-lg italic font-bold">Sincronizando con los servidores de BII-Vintage...</p>
                  </div>
               ) : topAthletes.length > 0 ? (
                  <div className="bg-black/60 border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.05)] backdrop-blur-2xl overflow-x-auto custom-scrollbar">
                     <div className="min-w-[800px] sm:min-w-[1000px]">
                         <div className="grid grid-cols-8 text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-500 px-6 pb-4 sm:pb-6 border-b border-zinc-800/80 mb-4 sm:mb-6">
                            <div className="col-span-2">Atleta Activo</div>
                            <div className="text-center">Sentadilla</div>
                            <div className="text-center">Banca</div>
                            <div className="text-center">P. Muerto</div>
                            <div className="text-center">Fondos</div>
                            <div className="text-center">Militar</div>
                            <div className="text-center text-emerald-400">Puntaje Total</div>
                         </div>
                         
                         <div className="space-y-3 sm:space-y-4">
                            {topAthletes.map((athlete, idx) => (
                               <div key={idx} className={`grid grid-cols-8 items-center p-4 sm:px-6 sm:py-6 rounded-2xl sm:rounded-3xl transition-all duration-500 ${idx === 0 ? 'bg-gradient-to-r from-emerald-950/40 to-[#0a0a0c] border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] scale-[1.01] z-10 relative' : idx === 1 ? 'bg-zinc-900/80 border border-zinc-700' : idx === 2 ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-black/40 border border-white/5 hover:border-zinc-700'}`}>
                                  <div className="col-span-2 flex items-center gap-4 sm:gap-5">
                                     <span className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-lg shadow-inner shrink-0 ${idx === 0 ? 'bg-emerald-500 text-black shadow-emerald-500' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {idx === 0 ? '👑' : `#${idx + 1}`}
                                     </span>
                                     <span className={`font-black italic uppercase tracking-tight truncate ${idx === 0 ? 'text-emerald-400 text-xl sm:text-3xl' : 'text-white text-lg sm:text-xl'}`}>{athlete.name}</span>
                                  </div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.squat} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.bench} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.deadlift} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.dips} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.military} kg</div>
                                  <div className={`text-center font-black ${idx === 0 ? 'text-emerald-400 text-2xl sm:text-4xl drop-shadow-md' : 'text-zinc-200 text-xl sm:text-2xl'}`}>
                                     {athlete.total} kg
                                  </div>
                               </div>
                            ))}
                         </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-sm shadow-inner">
                     <span className="text-6xl mb-2 drop-shadow-md">👑</span>
                     <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl md:text-3xl">AÚN NO HAY RÉCORDS REGISTRADOS</h3>
                     <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md mx-auto">Ingresá a tu Dashboard, registrá tus RMs y convertite en el primer líder histórico del muro BII-Vintage.</p>
                  </div>
               )}
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── SECCIÓN: EL PANEL Y TECNOLOGÍA (BENTO GRID MEJORADO) ─── */}
      <section className="relative z-10 py-24 sm:py-40 bg-zinc-950 border-b border-white/5 overflow-hidden">
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
               <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic mb-6 sm:mb-8 text-white tracking-tighter drop-shadow-lg">EL ECOSISTEMA <span className="text-emerald-500">DIGITAL</span></h2>
               <p className="text-zinc-400 mb-16 sm:mb-24 max-w-3xl mx-auto text-base sm:text-xl font-medium leading-relaxed px-4">Olvidate de los PDFs genéricos por correo. Al sumarte, ingresás a tu propio Dashboard Privado, una herramienta diseñada exclusivamente para el alto rendimiento.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {[
                    { icon: "📈", title: "Curva de Progreso", desc: "Tus RMs graficados automáticamente en tiempo real.", colSpan: "lg:col-span-2" },
                    { icon: "⚡", title: "Control SNC", desc: "Monitoreo diario de sueño, peso y nivel de estrés general.", colSpan: "lg:col-span-1" },
                    { icon: "🧠", title: "Auto-Regulación", desc: "Ajuste milimétrico de RPE y RIR.", colSpan: "lg:col-span-1" },
                    { icon: "📹", title: "Auditoría en Video", desc: "Devoluciones cuadro por cuadro del Coach directo en tu panel, para que no pierdas un solo kilo por mala técnica.", colSpan: "lg:col-span-4" }
                  ].map((feature, i) => (
                      <div key={i} className={`bg-[#0a0a0c] border border-zinc-800/80 p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] text-left hover:bg-zinc-900/60 hover:border-emerald-500/50 transition-all duration-500 shadow-xl group ${feature.colSpan}`}>
                          <div className="text-4xl sm:text-5xl mb-6 sm:mb-8 bg-black w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">{feature.icon}</div>
                          <h3 className="text-white font-black italic text-2xl sm:text-3xl uppercase tracking-tight mb-3 sm:mb-4">{feature.title}</h3>
                          <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">{feature.desc}</p>
                      </div>
                  ))}
               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── SECCIÓN ESTRELLA: TUJAGUE AI SYSTEM ─── */}
      <section className="relative z-10 py-24 sm:py-40 bg-black border-b border-white/5 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] sm:h-[800px] bg-blue-500/10 blur-[150px] sm:blur-[200px] pointer-events-none"></div>
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
               
               {/* TEXTO Y BENEFICIOS */}
               <div className="flex-1 text-center lg:text-left w-full">
                  <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-6 inline-block shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      Exclusivo Planes Mensuales VIP
                  </span>
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white mb-6 sm:mb-8 leading-none drop-shadow-md">
                      SOPORTE INTELIGENTE <span className="text-blue-500 block sm:inline">24/7</span>
                  </h2>
                  <p className="text-zinc-400 font-medium leading-relaxed mb-10 sm:mb-14 text-base sm:text-xl">
                      Nuestros planes mensuales incluyen acceso a <strong>Tujague AI</strong>. Un sistema de inteligencia artificial entrenado con mi metodología para resolver dudas estructurales, nutricionales y de biomecánica al instante.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto lg:mx-0 text-left">
                     <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-[2rem] hover:border-blue-500/30 transition-colors">
                        <span className="text-blue-500 text-3xl sm:text-4xl mb-4 sm:mb-6 block">⚙️</span>
                        <h4 className="text-white font-black text-lg sm:text-xl uppercase mb-2">Palancas y Torque</h4>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">Ajustes de Leg Drive y Bracing</p>
                     </div>
                     <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-[2rem] hover:border-blue-500/30 transition-colors">
                        <span className="text-blue-500 text-3xl sm:text-4xl mb-4 sm:mb-6 block">👨‍🍳</span>
                        <h4 className="text-white font-black text-lg sm:text-xl uppercase mb-2">Asesor Culinario</h4>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">Diseño nutricional a partir de tu inventario.</p>
                     </div>
                  </div>
               </div>

               {/* MOCKUP DEL CHAT */}
               <div className="flex-1 w-full max-w-md sm:max-w-xl mx-auto lg:mx-0">
                  <div className="bg-[#09090b] border border-blue-900/30 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden flex flex-col h-[500px] sm:h-[600px]">
                     
                     <div className="px-6 py-5 sm:py-6 border-b border-zinc-800/80 bg-zinc-900/80 flex justify-between items-center z-10 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg sm:text-2xl shadow-inner">🤖</div>
                           <div>
                              <p className="font-black text-white italic text-sm sm:text-lg tracking-tight">Tujague AI System</p>
                              <p className="text-[9px] sm:text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Sistema en línea
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex-1 p-4 sm:p-6 space-y-6 bg-gradient-to-b from-[#09090b] to-blue-950/10 flex flex-col justify-end">
                        <div className="ml-auto w-fit max-w-[90%] sm:max-w-[85%] animate-in slide-in-from-right-4 duration-500">
                           <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 text-right">Atleta</span>
                           <div className="bg-zinc-800 text-white p-4 sm:p-6 rounded-3xl rounded-tr-sm text-xs sm:text-sm font-medium border border-zinc-700 shadow-sm leading-relaxed">
                              Coach, al hacer Press de Banca siento que trabajo más el hombro que el pectoral. ¿Qué ajusto en el set-up?
                           </div>
                        </div>

                        <div className="mr-auto w-fit max-w-[95%] sm:max-w-[90%] animate-in slide-in-from-left-4 duration-500 delay-300">
                           <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1.5">Tujague AI</span>
                           <div className="bg-gradient-to-br from-blue-950/60 to-emerald-950/20 p-5 sm:p-6 rounded-3xl rounded-tl-sm text-xs sm:text-sm text-blue-50 border border-blue-500/30 shadow-md leading-relaxed">
                              <p className="mb-3">Analicemos la biomecánica de ese error clásico:</p>
                              <p className="mb-3"><strong>1. Retracción y Depresión:</strong> Debes juntar las escápulas y empujarlas hacia tus glúteos. Esto saca al deltoides anterior de la línea de fuego.</p>
                              <p><strong>2. Ángulo del Húmero:</strong> Cierra tus codos a un ángulo de 45°-60° respecto a tu torso para maximizar el torque en las fibras del pectoral.</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/50 flex gap-3 items-center backdrop-blur-md">
                        <div className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-black border border-zinc-800 flex items-center px-4 sm:px-5">
                           <span className="text-xs sm:text-sm text-zinc-600 font-medium">Escribe tu consulta técnica...</span>
                        </div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold opacity-50 text-xl">↑</div>
                     </div>

                  </div>
               </div>

            </div>
         </RevealOnScroll>
      </section>

      {/* ─── LA FILOSOFÍA ─── */}
      <section className="relative z-10 py-24 sm:py-32 bg-zinc-900/20 border-b border-white/5 backdrop-blur-xl">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16 sm:mb-20">
                 <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white mb-4 drop-shadow-md">NUESTRO <span className="text-emerald-500">CREDO</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { title: "Brief (Breve)", desc: "Entrenamientos cortos y directos al punto. Si puedes entrenar más de una hora a esta intensidad, no estás entrenando lo suficientemente duro." },
                  { title: "Intense (Intenso)", desc: "Series llevadas al verdadero límite (RIR 0). Técnica estricta bajo fatiga extrema. Aquí es donde ocurre el crecimiento." },
                  { title: "Infrequent (Infrecuente)", desc: "El músculo crece cuando descansas, no cuando levantas. Controlamos la frecuencia para evitar destrozar tu Sistema Nervioso Central." }
                ].map((item, i) => (
                  <div key={i} className="p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] bg-[#0a0a0c] border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-500 group shadow-lg">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black border border-zinc-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 text-emerald-500 font-black text-2xl sm:text-3xl italic tracking-tighter group-hover:scale-110 group-hover:border-emerald-500/50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                      {item.title.split(' ')[0]}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black italic mb-4 text-white uppercase tracking-tight">{item.title}</h3>
                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── EL ENTRENADOR ─── */}
      <section className="relative z-10 py-24 sm:py-40 px-4 sm:px-6 border-b border-white/5 overflow-hidden">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 sm:gap-16 md:gap-24">
             
             {/* TAMAÑO DE IMAGEN CONTROLADO PARA NOTEBOOKS */}
             <div className="relative group w-[280px] h-[380px] sm:w-[350px] sm:h-[450px] lg:w-[400px] lg:h-[500px] flex-shrink-0">
                <div className="absolute -inset-4 sm:-inset-6 bg-emerald-500/20 blur-[60px] sm:blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                   <Image src="/hero.png" alt="Luciano Tujague" fill className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                </div>
             </div>
             
             <div className="flex-1 text-center lg:text-left min-w-0 max-w-full">
               <span className="text-emerald-500 font-black tracking-[0.2em] text-[10px] sm:text-xs mb-6 inline-block uppercase border-b border-emerald-500/30 pb-2">Head Coach</span>
               
               <h2 className="text-5xl sm:text-7xl lg:text-[6rem] xl:text-[7rem] font-black mb-6 sm:mb-8 italic tracking-tighter text-white leading-[0.9] drop-shadow-md">
                   LUCIANO<br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 block mt-2">TUJAGUE</span>
               </h2>
               
               <div className="space-y-4 sm:space-y-6 text-zinc-400 text-base sm:text-lg lg:text-xl leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                   <p>Aplico la metodología <strong className="text-white">BII-VINTAGE</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica y la gestión absoluta de la fatiga.</p>
                   <p>Mi filosofía exige <strong className="text-white">tolerancia al dolor</strong>: priorizo la técnica impecable con excéntricas de hasta 6 segundos. No busco entretenerte; busco efectividad real.</p>
               </div>
               
               {/* RMs VERIFICADOS */}
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-10 sm:mt-14 max-w-4xl mx-auto lg:mx-0">
                 {[
                   { v: "+152 KG", l: "Squat" },
                   { v: "+110 KG", l: "Banca" },
                   { v: "+110 KG", l: "Deadlift" },
                   { v: "+60 KG", l: "Militar" },
                   { v: "+60 KG", l: "Fondos" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-zinc-900/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all group shadow-lg">
                      <p className="text-white font-black text-2xl sm:text-3xl italic leading-none group-hover:text-emerald-400 transition-colors drop-shadow-md">{stat.v}</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black tracking-widest mt-2 uppercase">{stat.l}</p>
                   </div>
                 ))}
               </div>
             </div>
             
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── EL BIG 5 ─── */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 bg-zinc-950 border-b border-white/5">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto">
               <div className="text-center mb-12 sm:mb-20">
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-md">PREDICAR CON EL <span className="text-emerald-500">EJEMPLO</span></h2>
                  <p className="text-zinc-500 mt-4 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Registros Oficiales de Levantamientos Base</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                 {[
                   { title: "Sentadilla (+152 KG)" },
                   { title: "Press de Banca (+110 KG)" },
                   { title: "Peso Muerto (+110 KG)" },
                   { title: "Press Militar (+60 KG)" },
                   { title: "Fondos Lastrados (+60 KG)" }
                 ].map((video, idx) => (
                     <div key={idx} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group relative shadow-xl hover:border-emerald-500/30 transition-colors">
                         <div className="aspect-video bg-zinc-900/50 flex flex-col items-center justify-center p-8 relative">
                             <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 opacity-50 shadow-inner group-hover:scale-110 transition-transform">
                                 <span className="text-2xl">🔒</span>
                             </div>
                             <h4 className="text-zinc-500 font-black tracking-widest text-[10px] sm:text-xs uppercase text-center">Video de Registro en Producción</h4>
                         </div>
                         
                         <div className="p-6 sm:p-8 border-t border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row justify-between items-center gap-4">
                             <p className="font-black italic text-white uppercase text-base sm:text-lg text-center sm:text-left">{video.title}</p>
                             <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm">
                                 Próximamente
                             </span>
                         </div>
                     </div>
                 ))}
               </div>
           </div>
        </RevealOnScroll>
      </section>

      {/* 🔥 SISTEMA DE TRIAGE CLÍNICO (QUIZ DE ALTO VALOR) 🔥 */}
      <section className="relative z-20 py-24 sm:py-40 px-4 sm:px-6 bg-[#050505] border-b border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-emerald-500/5 blur-[150px] pointer-events-none"></div>
        <RevealOnScroll>
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-5 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 inline-block animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  Evaluación Estructural
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white mb-6 drop-shadow-lg">
                 SISTEMA DE <span className="text-emerald-500 block sm:inline">TRIAGE</span>
              </h2>
              <p className="text-zinc-400 font-medium mb-10 sm:mb-14 max-w-xl mx-auto text-sm sm:text-base px-4">
                 El 90% de los atletas fracasa por una mala gestión de la fatiga. Respondé esta auditoría de 3 pasos y nuestro algoritmo determinará la dosis exacta de volumen que tu Sistema Nervioso Central necesita para mutar sin romperse.
              </p>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 sm:p-10 md:p-14 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative min-h-[350px] sm:min-h-[400px] flex flex-col justify-center text-left">
                 
                 {/* PASO 0: Inicio */}
                 {quizStep === 0 && (
                    <div className="animate-in fade-in zoom-in duration-300 text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl mx-auto mb-8 shadow-inner">
                            🔬
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight mb-8 sm:mb-10">Iniciar Auditoría</h3>
                        <button 
                            onClick={() => setQuizStep(1)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 sm:px-14 py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 w-full sm:w-auto"
                        >
                            Comenzar Test ⚡
                        </button>
                    </div>
                 )}

                 {/* PASO 1: Limitante */}
                 {quizStep === 1 && !isAnalyzing && (
                    <div className="animate-in slide-in-from-right-8 duration-300 w-full">
                        <div className="flex items-center gap-2 mb-6">
                           {[1, 2, 3].map(num => (
                              <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${quizStep >= num ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}></div>
                           ))}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight mb-8">1. ¿Cuál es tu limitante principal?</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Estancamiento Crónico", desc: "No logro subir mis marcas en básicos ni mi masa muscular.", value: "estancamiento" },
                                { label: "Dolor Articular", desc: "Me duelen las rodillas, lumbares u hombros al entrenar.", value: "lesiones" },
                                { label: "Falta de Tiempo", desc: "Entreno sin estructura porque vivo ocupado.", value: "tiempo" }
                            ].map((opt, idx) => (
                                <button 
                                   key={idx}
                                   onClick={() => handleQuizAnswer('limitante', opt.value)}
                                   className="w-full text-left bg-zinc-950 border border-zinc-800 hover:border-emerald-500 p-5 rounded-2xl transition-all group hover:bg-zinc-900 shadow-sm"
                                >
                                    <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-1 group-hover:text-emerald-400">{opt.label}</p>
                                    <p className="text-zinc-300 text-xs sm:text-sm font-medium">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}

                 {/* PASO 2: Experiencia/Nivel */}
                 {quizStep === 2 && !isAnalyzing && (
                    <div className="animate-in slide-in-from-right-8 duration-300 w-full">
                        <div className="flex items-center gap-2 mb-6">
                           {[1, 2, 3].map(num => (
                              <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${quizStep >= num ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}></div>
                           ))}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight mb-8">2. ¿Cuál es tu tolerancia al esfuerzo?</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Principiante", desc: "Me guardo repeticiones. Aún no conozco mi fallo muscular real.", value: "novato" },
                                { label: "Intermedio", desc: "Entreno duro, pero a veces mi técnica se rompe bajo carga.", value: "intermedio" },
                                { label: "Avanzado", desc: "Llego al fallo muscular absoluto (RIR 0) con técnica estricta.", value: "elite" }
                            ].map((opt, idx) => (
                                <button 
                                   key={idx}
                                   onClick={() => handleQuizAnswer('nivel', opt.value)}
                                   className="w-full text-left bg-zinc-950 border border-zinc-800 hover:border-emerald-500 p-5 rounded-2xl transition-all group hover:bg-zinc-900 shadow-sm"
                                >
                                    <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-1 group-hover:text-emerald-400">{opt.label}</p>
                                    <p className="text-zinc-300 text-xs sm:text-sm font-medium">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}

                 {/* PASO 3: Días */}
                 {quizStep === 3 && !isAnalyzing && (
                    <div className="animate-in slide-in-from-right-8 duration-300 w-full">
                        <div className="flex items-center gap-2 mb-6">
                           {[1, 2, 3].map(num => (
                              <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${quizStep >= num ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}></div>
                           ))}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight mb-8">3. ¿Cuántos días reales podés entrenar sin fallar?</h3>
                        <div className="space-y-3">
                            {[
                                { label: "2 a 3 Días", desc: "Baja frecuencia. Requiere una intensidad brutal.", value: "bajo" },
                                { label: "4 Días", desc: "Frecuencia estándar. La mejor para gestionar fatiga.", value: "medio" },
                                { label: "5 a 6 Días", desc: "Alto volumen. Zona de peligro para el Sistema Nervioso.", value: "alto" }
                            ].map((opt, idx) => (
                                <button 
                                   key={idx}
                                   onClick={() => handleQuizAnswer('dias', opt.value)}
                                   className="w-full text-left bg-zinc-950 border border-zinc-800 hover:border-emerald-500 p-5 rounded-2xl transition-all group hover:bg-zinc-900 shadow-sm"
                                >
                                    <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-1 group-hover:text-emerald-400">{opt.label}</p>
                                    <p className="text-zinc-300 text-xs sm:text-sm font-medium">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}

                 {/* PANTALLA DE CARGA FALSA */}
                 {isAnalyzing && (
                    <div className="text-center py-12 animate-in fade-in duration-300 w-full">
                        <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
                        <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm mb-2">Procesando Biometría...</h4>
                        <p className="text-zinc-500 text-xs font-mono">{analysisText}</p>
                    </div>
                 )}

                 {/* PASO 4: RESULTADO CLÍNICO Y CTA */}
                 {quizStep === 4 && recommendedPlan && (
                    <div className="animate-in zoom-in duration-500 w-full text-left">
                        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 md:p-8 mb-8 relative shadow-inner">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 rounded-l-2xl"></div>
                            <h4 className="text-emerald-400 font-black italic uppercase text-lg md:text-xl mb-4 tracking-tight flex items-center gap-2">
                               <span className="text-2xl">📋</span> Dictamen Estructural:
                            </h4>
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {getDiagnosticText()}
                            </p>
                        </div>

                        <div className="text-center bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl">
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">La solución para tu caso:</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight mb-6">
                                {recommendedPlan.title}
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                                <button 
                                   onClick={handleAcceptRecommendation}
                                   className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
                                >
                                    APLICAR AL PLAN 🚀
                                </button>
                                <button 
                                   onClick={() => { setQuizStep(0); setQuizAnswers({limitante: "", dias: "", nivel: ""}); }}
                                   className="w-full sm:w-auto bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-400 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Rehacer Test
                                </button>
                            </div>
                        </div>
                    </div>
                 )}

              </div>
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── PRICING SECTION (CORE VIP) ─── */}
      <section id="pricing-section" className="relative z-20 pt-24 sm:pt-40 pb-20 px-4 sm:px-6 bg-zinc-950/80 border-t border-white/5">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto text-center">
             <h2 className="text-5xl sm:text-6xl md:text-8xl font-black italic text-center mb-10 sm:mb-16 tracking-tighter drop-shadow-xl text-white">
               ELIGE TU <span className="text-emerald-500">CAMINO</span>
             </h2>
             
             <div className="inline-flex bg-[#0a0a0c] backdrop-blur-xl p-2 rounded-[2rem] border border-zinc-800 mb-16 sm:mb-24 shadow-2xl overflow-x-auto max-w-full">
               <button onClick={() => { setIsWeekly(true); setSelectedPlan(null); }} className={`px-10 sm:px-16 py-4 sm:py-5 rounded-3xl text-[10px] sm:text-sm font-black transition-all duration-300 tracking-[0.2em] uppercase whitespace-nowrap ${isWeekly ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>Planes Semanales</button>
               <button onClick={() => { setIsWeekly(false); setSelectedPlan(null); }} className={`px-10 sm:px-16 py-4 sm:py-5 rounded-3xl text-[10px] sm:text-sm font-black transition-all duration-300 tracking-[0.2em] uppercase whitespace-nowrap ${!isWeekly ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>Pases Mensuales</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-20 sm:mb-32">
               {currentPlans.map((plan) => (
                 <div 
                   key={plan.id} 
                   onClick={() => handleSelectPlan(plan)}
                   className={`p-8 sm:p-10 lg:p-12 cursor-pointer group transition-all duration-500 relative flex flex-col rounded-[2.5rem] sm:rounded-[3.5rem] border backdrop-blur-xl ${
                     selectedPlan?.id === plan.id 
                     ? 'bg-[#0a0a0c] border-emerald-500 scale-[1.03] shadow-[0_0_80px_rgba(16,185,129,0.25)] z-10' 
                     : 'bg-zinc-900/40 border-white/5 hover:border-emerald-500/40 hover:bg-zinc-900/80 shadow-xl'
                   }`}
                 >
                   {plan.highlight && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black text-[9px] sm:text-[10px] font-black px-6 sm:px-8 py-2 sm:py-2.5 rounded-full tracking-[0.2em] shadow-lg shadow-emerald-500/40 whitespace-nowrap">
                        LA MEJOR ELECCIÓN
                      </div>
                   )}
                   
                   <h3 className="text-3xl sm:text-4xl font-black italic mb-2 tracking-tighter text-white uppercase">{plan.title}</h3>
                   <p className="text-emerald-400 font-bold tracking-[0.2em] text-[9px] sm:text-[11px] mb-8 border-b border-zinc-800/80 pb-6 uppercase">{plan.subtitle}</p>
                   
                   <div className="text-5xl sm:text-6xl font-black mb-4 text-white tracking-tighter flex items-center justify-center">
                       <span className="text-2xl sm:text-3xl text-zinc-500 mr-2">$</span>
                       {plan.price.toLocaleString('es-AR')} 
                       <span className="text-sm sm:text-base text-zinc-500 font-bold ml-2 tracking-widest uppercase">/{isWeekly ? 'SEM' : 'MES'}</span>
                   </div>

                   {/* 🔥 MARKETING DE AUTORIDAD Y GRATIFICACIÓN 🔥 */}
                   <div className={`text-[10px] font-black uppercase tracking-widest mb-8 animate-pulse flex items-center justify-center gap-2 ${plan.highlight ? 'text-emerald-400' : 'text-blue-500'}`}>
                       <span className={`w-2 h-2 rounded-full ${plan.highlight ? 'bg-emerald-400' : 'bg-blue-500'}`}></span> {plan.actionLabel}
                   </div>
                   
                   <div className="bg-black/50 border border-zinc-800/80 p-5 rounded-3xl mb-8 sm:mb-10">
                       <p className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1.5">🎯 Perfil Ideal:</p>
                       <p className="text-sm sm:text-base text-zinc-300 font-bold">{plan.idealFor}</p>
                   </div>

                   <p className="text-zinc-400 mb-10 text-sm sm:text-base leading-relaxed flex-grow font-medium px-2">{plan.description}</p>
                   
                   <ul className="space-y-4 sm:space-y-5 mb-10 sm:mb-12 text-left bg-[#0a0a0c]/80 p-6 sm:p-8 rounded-[2rem] border border-white/5">
                     {plan.features.map((f, idx) => (
                       <li key={idx} className="flex items-start gap-4 text-zinc-300 font-medium text-sm sm:text-base">
                         <span className={`${f.includes('Tujague AI') ? 'text-blue-500' : 'text-emerald-500'} font-black mt-0.5 text-lg leading-none`}>✓</span>
                         <span className={f.includes('Tujague AI') ? 'text-blue-400 font-bold' : ''}>{f}</span>
                       </li>
                     ))}
                   </ul>

                   <button className={`w-full py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black tracking-[0.2em] text-[10px] sm:text-xs transition-all duration-300 uppercase ${
                     selectedPlan?.id === plan.id 
                     ? 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.4)]' 
                     : 'bg-white/5 text-zinc-400 group-hover:bg-white group-hover:text-black border border-white/5 group-hover:border-white'
                   }`}>
                     {selectedPlan?.id === plan.id ? 'PLAN SELECCIONADO' : 'ELEGIR ESTA ESTRUCTURA'}
                   </button>
                 </div>
               ))}
             </div>
             
             {/* CUADRO DE TRANSPARENCIA */}
             <div className="max-w-5xl mx-auto mb-16 sm:mb-24 bg-[#0a0a0c] border border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-14 md:p-20 relative overflow-hidden backdrop-blur-xl shadow-2xl text-left">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
                
                <h3 className="text-3xl sm:text-5xl md:text-6xl font-black italic text-center text-white mb-12 sm:mb-20 tracking-tighter uppercase drop-shadow-md">
                  Transparencia <span className="text-emerald-500">Total</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 md:gap-24 relative z-10">
                   <div className="space-y-6 sm:space-y-8">
                     <h4 className="text-emerald-500 font-black tracking-[0.2em] text-xs sm:text-sm uppercase flex items-center gap-4 border-b border-zinc-800 pb-4 sm:pb-6 mb-6 sm:mb-8">
                       <span className="bg-emerald-500/10 p-2.5 sm:p-3 rounded-2xl text-emerald-400 text-lg">✓</span> 
                       Lo que SÍ Incluye
                     </h4>
                     <ul className="space-y-5 sm:space-y-6">
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
                         <span className="text-emerald-500 font-bold mt-1 text-lg leading-none">•</span> Programación 100% personalizada en Dashboard web.
                       </li>
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
                         <span className="text-emerald-500 font-bold mt-1 text-lg leading-none">•</span> Correcciones técnicas vía video en el panel.
                       </li>
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
                         <span className="text-emerald-500 font-bold mt-1 text-lg leading-none">•</span> Acceso y contacto directo por WhatsApp 1 a 1.
                       </li>
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed bg-blue-950/20 p-4 rounded-2xl border border-blue-900/30">
                         <span className="text-blue-500 font-bold mt-1 text-lg leading-none">•</span> <strong className="text-blue-400">Tujague AI 24/7 (Solo Planes Mensuales).</strong>
                       </li>
                     </ul>
                   </div>

                   <div className="space-y-6 sm:space-y-8 relative">
                     <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-[1px] bg-zinc-800"></div>
                     <h4 className="text-red-500 font-black tracking-[0.2em] text-xs sm:text-sm uppercase flex items-center gap-4 border-b border-zinc-800 pb-4 sm:pb-6 mb-6 sm:mb-8">
                       <span className="bg-red-500/10 p-2.5 sm:p-3 rounded-2xl text-red-400 text-lg">✕</span> 
                       Lo que NO Incluye
                     </h4>
                     <ul className="space-y-5 sm:space-y-6">
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
                         <span className="text-red-500/70 font-bold mt-1 text-lg leading-none">•</span> Menús de alimentación cerrados (Pollo y arroz).
                       </li>
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
                         <span className="text-red-500/70 font-bold mt-1 text-lg leading-none">•</span> Consultas médicas o de rehabilitación.
                       </li>
                       <li className="flex items-start gap-4 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
                         <span className="text-red-500/70 font-bold mt-1 text-lg leading-none">•</span> Clases en vivo o entrenamientos presenciales.
                       </li>
                     </ul>
                   </div>
                </div>
             </div>

             {/* 🔥 CHECKOUT PARA PLANES VIP (CONDICIONAL) 🔥 */}
             {selectedPlan && !selectedPlan.id.startsWith('static') && (
               <div id="checkout-section" className="max-w-4xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-10 duration-500 px-4 sm:px-0">
                 <label className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-10 border cursor-pointer transition-all duration-300 rounded-[2rem] sm:rounded-[3rem] backdrop-blur-xl gap-6 sm:gap-0 ${addVideoReview ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.15)] scale-[1.02]' : 'bg-[#0a0a0c] border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50 shadow-xl'}`}>
                   <div className="flex items-start sm:items-center gap-5 sm:gap-8 text-left w-full sm:w-auto">
                     <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-300 border shadow-inner shrink-0 ${addVideoReview ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-zinc-700 bg-black text-zinc-600'}`}>
                       <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                       <h4 className={`font-black text-xl sm:text-3xl leading-none mb-2 sm:mb-3 italic tracking-tight ${addVideoReview ? 'text-white' : 'text-zinc-300'}`}>Auditoría Técnica Biomecánica</h4>
                       <p className={`text-[9px] sm:text-[11px] font-black tracking-[0.2em] uppercase ${addVideoReview ? 'text-emerald-400' : 'text-zinc-500'}`}>Análisis detallado de los 5 Básicos + Corrección de palancas.</p>
                     </div>
                   </div>
                   <div className="text-left sm:text-right pl-16 sm:pl-4 w-full sm:w-auto border-t sm:border-t-0 border-zinc-800/50 pt-4 sm:pt-0">
                       <span className={`text-2xl sm:text-4xl font-black block tracking-tighter italic ${addVideoReview ? 'text-white' : 'text-zinc-400'}`}>+ARS ${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                   </div>
                   <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
                 </label>
               </div>
             )}
           </div>
        </RevealOnScroll>
      </section>

      {/* 🔥 NUEVO: SECCIÓN DE DOWNSELL (PROTOCOLOS ESTÁTICOS) 🔥 */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 bg-[#020202] border-t border-zinc-800/50 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-zinc-900/20 blur-[100px] pointer-events-none"></div>
         <RevealOnScroll>
            <div className="max-w-6xl mx-auto relative z-10">
               <div className="text-center mb-16 sm:mb-20">
                  <span className="bg-zinc-900 border border-zinc-700 text-zinc-400 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">
                     ¿No cuentas con presupuesto para el Coaching VIP?
                  </span>
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter text-zinc-300 mb-6 drop-shadow-md">
                     LA BÓVEDA ESTÁTICA: <span className="text-white block sm:inline">PLANOS CRUDOS</span>
                  </h2>
                  <p className="text-zinc-500 font-medium max-w-2xl mx-auto text-sm sm:text-lg">
                     Adquirí las estructuras de 4 semanas exactas que uso con mis atletas. <br className="hidden sm:block"/> <strong className="text-red-500">ADVERTENCIA:</strong> Estos pases NO incluyen corrección de video, NO incluyen ajuste de fatiga, ni soporte de WhatsApp. Es modo 100% autodidacta.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-4xl mx-auto">
                  {PRICING_MATRIX.static.map((plan) => (
                     <div 
                        key={plan.id} 
                        onClick={() => handleSelectPlan(plan)}
                        className={`p-8 sm:p-10 rounded-[2rem] sm:rounded-[3rem] cursor-pointer group transition-all duration-300 border bg-black/60 backdrop-blur-md flex flex-col ${
                           selectedPlan?.id === plan.id 
                           ? 'border-white scale-[1.02] shadow-[0_0_50px_rgba(255,255,255,0.1)] z-10' 
                           : 'border-zinc-800 hover:border-zinc-500 shadow-xl'
                        }`}
                     >
                        <h3 className="text-2xl sm:text-3xl font-black italic mb-2 tracking-tighter text-zinc-300 uppercase">{plan.title}</h3>
                        <p className="text-zinc-500 font-bold tracking-[0.2em] text-[9px] sm:text-[11px] mb-6 border-b border-zinc-800/80 pb-6 uppercase">{plan.subtitle}</p>
                        
                        <div className="text-4xl sm:text-5xl font-black mb-4 text-white tracking-tighter flex items-center">
                           <span className="text-xl sm:text-2xl text-zinc-600 mr-2">$</span>
                           {plan.price.toLocaleString('es-AR')} 
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl mb-6">
                           <p className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">⚠️ Restricción Clínica:</p>
                           <p className="text-xs sm:text-sm text-zinc-400 font-bold">Solo para atletas experimentados que dominan el RPE.</p>
                        </div>

                        <p className="text-zinc-500 mb-8 text-sm leading-relaxed flex-grow">{plan.description}</p>
                        
                        <ul className="space-y-3 mb-8">
                           {plan.features.map((f, idx) => (
                           <li key={idx} className={`flex items-start gap-3 text-sm font-medium ${f.includes('✗') ? 'text-zinc-600' : 'text-zinc-300'}`}>
                              <span className="font-black mt-0.5">{f.includes('✗') ? '' : '✓'}</span>
                              <span>{f}</span>
                           </li>
                           ))}
                        </ul>

                        <button className={`w-full py-4 sm:py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] transition-all duration-300 uppercase border ${
                           selectedPlan?.id === plan.id 
                           ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                           : 'bg-transparent text-zinc-400 group-hover:bg-zinc-900 border-zinc-700 group-hover:border-zinc-500'
                        }`}>
                           {selectedPlan?.id === plan.id ? 'PLANO SELECCIONADO' : 'ADQUIRIR ESTRUCTURA'}
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── CHECKOUT SECTION GLOBAL ─── */}
      <section id="checkout-section" className="relative z-10 pt-20 sm:pt-32 pb-32 sm:pb-48 px-4 sm:px-6 bg-[#050505] border-t border-white/5 overflow-hidden">
        <RevealOnScroll>
           <div className="max-w-6xl mx-auto relative z-10">
             <div className="text-center mb-12 sm:mb-20">
               <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-4 lg:mb-6 inline-block">Último Paso</span>
               <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic mb-6 tracking-tighter text-white drop-shadow-md">FINALIZAR <span className="text-emerald-500">INSCRIPCIÓN</span></h2>
               <p className="text-zinc-400 text-sm sm:text-lg font-medium tracking-wide max-w-xl mx-auto">Completá tus datos para recibir acceso inmediato al panel de entrenamiento.</p>
             </div>
             
             {selectedPlan ? (
               <div className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden pb-12 lg:pb-0 backdrop-blur-2xl">
                 <div className={`absolute top-0 right-0 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 ${selectedPlan.id.startsWith('static') ? 'bg-white/5' : 'bg-emerald-500/10'}`}></div>
                 
                 <div className="p-4 sm:p-6 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center relative z-20">
                    <button 
                        onClick={() => { setSelectedPlan(null); scrollToPricing(); }} 
                        className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        ← Cancelar Selección
                    </button>
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-emerald-500 hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        🏠 Volver a la web Principal
                    </button>
                 </div>

                 {/* Pasamos addVideoReview como false forzosamente si es un plan estático */}
                 <CheckoutClient 
                    selectedPlan={selectedPlan} 
                    extraVideo={selectedPlan.id.startsWith('static') ? false : addVideoReview} 
                    extraPrice={EXTRA_VIDEO_PRICE} 
                 />
               </div>
             ) : (
               <div className="text-center p-12 sm:p-24 md:p-32 border-2 border-dashed border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] bg-white/[0.01] backdrop-blur-sm shadow-xl">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                 </div>
                 <p className="text-lg sm:text-2xl font-black text-zinc-500 italic tracking-tighter uppercase">
                   SELECCIONÁ UN PLAN ARRIBA PARA CONTINUAR
                 </p>
               </div>
             )}
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── PREGUNTAS FRECUENTES Y FOOTER HORIZONTAL EN NOTEBOOKS ─── */}
      <section className="relative z-10 py-24 lg:py-32 px-4 sm:px-6 bg-zinc-950 border-t border-white/5">
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto">
               
               {/* USO DE GRID DE 2 COLUMNAS EN NOTEBOOK PARA EL FAQ */}
               <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                  
                  <div className="lg:col-span-5 text-center lg:text-left sticky top-32">
                     <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white mb-4 drop-shadow-md">PREGUNTAS <span className="text-emerald-500 block">FRECUENTES</span></h2>
                     <p className="text-zinc-400 font-medium text-sm lg:text-base mb-8">Resolvé tus dudas antes de elegir tu plan de entrenamiento. La claridad es fundamental antes de comprometerse con el proceso.</p>
                     
                     <div className="hidden lg:flex items-center gap-4 bg-[#0a0a0c] p-6 rounded-2xl border border-zinc-800">
                        <span className="text-3xl">💬</span>
                        <div>
                           <p className="text-white font-bold text-sm">¿Tenés otra duda?</p>
                           <a href={whatsappUrl} target="_blank" className="text-emerald-500 text-xs font-black uppercase tracking-widest hover:text-emerald-400 transition-colors">Contactar al Coach</a>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4 lg:space-y-6">
                     {FAQS.map((faq, i) => (
                        <div key={i} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:border-emerald-500/30 shadow-lg">
                           <button 
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full px-6 lg:px-8 py-5 lg:py-6 text-left flex justify-between items-center focus:outline-none hover:bg-zinc-900/50 transition-colors"
                           >
                              <span className="font-black text-white italic tracking-tight text-sm lg:text-lg pr-6 leading-snug">{faq.q}</span>
                              <span className={`text-emerald-500 font-black text-lg lg:text-xl transition-transform duration-500 ${openFaq === i ? 'rotate-180 text-emerald-400' : ''}`}>
                                 ▼
                              </span>
                           </button>
                           <div className={`px-6 lg:px-8 overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-60 pb-6 lg:pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                              <p className="text-zinc-400 text-xs lg:text-sm leading-relaxed font-medium pt-4 lg:pt-6 border-t border-zinc-800/80">{faq.a}</p>
                           </div>
                        </div>
                     ))}
                  </div>

               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-50 pt-20 lg:pt-24 pb-28 lg:pb-20 border-t border-white/10 bg-[#050505] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-center md:text-left">
          
          <div className="space-y-4 lg:space-y-6">
             <Link href="/" className="font-black text-3xl italic text-white tracking-tighter hover:opacity-80 transition-opacity inline-block">
               TUJAGUE <span className="text-emerald-500">STRENGTH</span>
             </Link>
             <p className="text-zinc-500 text-xs lg:text-sm italic tracking-tight font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
               "Te doy las herramientas, vos ponés el esfuerzo. Biomecánica aplicada y entrenamiento de fuerza real."
             </p>
             <p className="text-zinc-600 text-[9px] lg:text-[10px] tracking-[0.3em] font-black uppercase mt-6 lg:mt-8 border-t border-zinc-800/50 pt-6">
               &copy; {new Date().getFullYear()} Luciano Tujague.
             </p>
          </div>

          <div className="flex flex-col gap-4 lg:gap-6 items-center md:items-start">
             <h4 className="text-emerald-500 font-black tracking-[0.2em] text-[10px] lg:text-xs border-b border-emerald-500/20 pb-2 lg:pb-3 uppercase">Contacto Directo</h4>
             <div className="flex flex-col gap-3 lg:gap-4 text-xs lg:text-sm font-bold text-white tracking-wide">
                <a href="mailto:luciano2004tujague20@gmail.com" className="hover:text-emerald-400 transition-colors flex items-center gap-3"><span className="text-lg">✉️</span> Email Oficial</a>
                <a href="https://instagram.com/tujague.strenght" target="_blank" className="hover:text-emerald-400 transition-colors flex items-center gap-3"><span className="text-lg">📱</span> Instagram</a>
                <a href={whatsappUrl} target="_blank" className="hover:text-emerald-400 transition-colors flex items-center gap-3"><span className="text-lg">💬</span> WhatsApp</a>
             </div>
          </div>

          <div className="flex flex-col gap-4 lg:gap-6 items-center md:items-start">
             <h4 className="text-emerald-500 font-black tracking-[0.2em] text-[10px] lg:text-xs border-b border-emerald-500/20 pb-2 lg:pb-3 uppercase">
               Enlaces Legales
             </h4>
             <div className="flex flex-col gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-black tracking-widest text-zinc-500">
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Términos y Condiciones</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Política de Privacidad</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Baja del Servicio</Link>
                <Link href="/admin/login" className="text-zinc-600 hover:text-emerald-500 transition-colors uppercase mt-4 lg:mt-6 bg-zinc-900 px-4 py-2 rounded-xl text-center inline-block">
                  Acceso Entrenador 🔒
                </Link>
             </div>
          </div>

        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
      `}} />
    </main>
  );
}