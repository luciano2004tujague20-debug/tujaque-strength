// app/page.tsx
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

// ─── CONFIGURACIÓN DE DATOS ───
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
  { q: "¿El sistema Tujague AI viene en todos los planes?", a: "No. El Asistente Inteligente (Tujague AI) es exclusivo para los atletas en planes MENSUALES. Es tu soporte biomecánico 24/7."}
];

export default function Home() {
  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [addVideoReview, setAddVideoReview] = useState(false);
  const [topAthletes, setTopAthletes] = useState<any[]>([]);
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

  const currentPlans = isWeekly ? PRICING_MATRIX.weekly : PRICING_MATRIX.monthly;

  // ⭐⭐ SISTEMA DE AUTO-RECARGA EN TIEMPO REAL (WEBSOCKETS) ⭐⭐
  const fetchTopAthletes = async () => {
    const { data } = await supabase
      .from('orders')
      .select('customer_name, rm_squat, rm_bench, rm_deadlift, rm_dips, rm_military')
      .eq('sub_status', 'active');
      
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
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505] z-10"></div>
      </div>
      
      {/* ─── NAVBAR FLOTANTE ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-black italic tracking-tighter hover:opacity-80 transition-opacity">
            TUJAGUE <span className="text-emerald-500">STRENGTH</span>
          </Link>
          <Link href="/dashboard">
            <button className="px-6 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              Acceso Clientes
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── BOTONES FLOTANTES ─── */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 bg-emerald-500 p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-110 transition-transform active:scale-95 group border border-emerald-400/50"
      >
        <span className="absolute -top-10 right-0 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hablá con Luciano
        </span>
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.097 0-4.142-.547-5.946-1.588L0 .057zm12.026-2.137c1.892 0 3.738-.503 5.339-1.455l.382-.227 3.97 1.041-1.059-3.869.25-.397c1.046-1.666 1.599-3.593 1.599-5.606 0-5.833-4.744-10.577-10.577-10.577-2.827 0-5.483 1.1-7.481 3.098s-3.098 4.654-3.098 7.481c0 2.013.553 3.94 1.599 5.606l.25.397-1.059 3.869 4.074-1.069.382.227c1.6.952 3.447 1.455 5.339 1.455z"/></svg>
      </a>

      <div className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-50">
         {!isBotOpen ? (
            <button 
               onClick={() => setIsBotOpen(true)}
               className="bg-zinc-900 border border-emerald-500/50 w-16 h-16 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform flex items-center justify-center relative group"
            >
               <span className="absolute -top-10 left-0 bg-zinc-900 border border-zinc-800 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                  Consultas
               </span>
               <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-pulse"></span>
               <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </button>
         ) : (
            <div className="bg-[#0a0a0c] border border-zinc-800 w-[320px] md:w-[380px] h-[500px] max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
               <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
                  <div className="flex items-center gap-3 relative z-10">
                     <span className="text-2xl">🤖</span>
                     <div>
                        <h4 className="font-black italic text-sm text-white leading-none">Asesor <span className="text-emerald-500">Comercial</span></h4>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Tujague Strength</span>
                     </div>
                  </div>
                  <button onClick={() => setIsBotOpen(false)} className="text-zinc-500 hover:text-white relative z-10 transition-colors text-lg">✕</button>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/50">
                  {botMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm' : 'bg-emerald-950/30 border border-emerald-500/20 text-zinc-300 rounded-tl-sm'}`}>
                           {msg.content}
                        </div>
                     </div>
                  ))}
                  {isBotTyping && (
                     <div className="flex flex-col items-start">
                        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 rounded-tl-sm flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                        </div>
                     </div>
                  )}
                  <div ref={botEndRef} />
               </div>

               <form onSubmit={handleSendBotMessage} className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2">
                  <input 
                     type="text" 
                     value={botInput}
                     onChange={(e) => setBotInput(e.target.value)}
                     placeholder="Preguntame sobre los planes..."
                     className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                     disabled={isBotTyping}
                  />
                  <button 
                     type="submit" 
                     disabled={isBotTyping || !botInput.trim()}
                     className="bg-emerald-500 text-black w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-emerald-400 transition-colors font-bold"
                  >
                     ↑
                  </button>
               </form>
            </div>
         )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 p-4 z-[40] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
         <button 
            onClick={scrollToPricing}
            className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2"
         >
            Elegir Mi Plan 🚀
         </button>
      </div>

      {/* ─── HERO SECTION ─── */}
      <RevealOnScroll delay={100}>
         <header className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-40 text-center px-4 overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

           <span className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-[0.2em] backdrop-blur-md">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
             EL MÉTODO BII-VINTAGE
           </span>
           
           <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[1.1] mb-6 text-white drop-shadow-2xl">
             FUERZA BRUTA, <br className="md:hidden"/> SIN VIVIR EN EL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 inline-block pb-2">GIMNASIO.</span>
           </h1>

           <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
             Rompé el estancamiento. Dejá las rutinas genéricas de 6 días. Sumate al equipo y construí fuerza real dominando los básicos: <span className="text-white font-bold border-b border-emerald-500/50">Sentadilla, Banca, Peso Muerto, Fondos y Militar.</span>
           </p>
           
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
               <div className="w-full sm:w-auto text-center">
                   <a 
                     href={whatsappUrl}
                     target="_blank"
                     className="relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-emerald-500 text-black font-black tracking-widest text-xs hover:bg-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all overflow-hidden group w-full"
                   >
                     <span className="relative z-10">APLICAR PARA EL EQUIPO</span>
                     <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                   </a>
                   <p className="text-emerald-500/60 font-bold text-[10px] uppercase tracking-widest mt-3">Te toma 2 min • Respuesta en 24hs</p>
               </div>
               
               <div className="w-full sm:w-auto text-center">
                   <button 
                     onClick={scrollToPricing}
                     className="px-10 py-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-black tracking-widest text-xs hover:bg-zinc-800 transition-all w-full"
                   >
                     VER PLANES
                   </button>
                   <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-3">Cupos Mensuales Limitados</p>
               </div>
           </div>

           <div className="flex flex-wrap justify-center gap-6 mt-16 opacity-60">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">✔</span> Cupos Mensuales Limitados</div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">✔</span> Corrección Biomecánica</div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">✔</span> Control de Fatiga Exacto</div>
           </div>
         </header>
      </RevealOnScroll>

      {/* ─── SECCIÓN: CÓMO FUNCIONA (BENTO GRID STYLE) ─── */}
      <section className="relative z-10 py-24 bg-zinc-950 border-y border-white/5">
         <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-6">
               <h2 className="text-center text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-16">El Proceso de Ingreso</h2>
               
               <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { step: "1", title: "Elegí tu Plan", desc: "Seleccioná la frecuencia semanal y realizá el pago seguro. Recibís acceso al instante." },
                    { step: "2", title: "Auditoría Clínica", desc: "Completás tu historial médico y tus RMs actuales en el Dashboard Privado." },
                    { step: "3", title: "Entrenamiento BII", desc: "Recibís tu programación exacta. Entrenás, subís tus videos y ajustamos las cargas." }
                  ].map((item, i) => (
                     <div key={i} className={`relative z-10 bg-black/40 border border-zinc-800/80 p-10 rounded-[2.5rem] shadow-xl hover:bg-zinc-900/50 hover:border-emerald-500/30 transition-all duration-500 flex flex-col ${i === 1 ? 'md:-translate-y-8' : ''}`}>
                        <span className="text-5xl font-black italic text-emerald-500/20 mb-4 block leading-none">{item.step}</span>
                        <h3 className="text-white font-black italic text-2xl tracking-tight mb-4 uppercase">{item.title}</h3>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed mt-auto">{item.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── EL MURO DE LA FAMA ─── */}
      <section className="relative z-10 py-32 bg-[#050505] border-b border-white/5 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-emerald-500/5 blur-[150px] pointer-events-none"></div>
         <RevealOnScroll>
            <div className="max-w-6xl mx-auto px-6 relative z-10">
               <div className="text-center mb-16">
                  <span className={`bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 inline-flex items-center gap-2 transition-all duration-300 ${pulseLive ? 'scale-110 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'animate-pulse'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Datos en Vivo
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter uppercase mb-4 mt-2">
                     EL MURO DE LA <span className="text-emerald-500">FUERZA</span>
                  </h2>
                  <p className="text-zinc-400 text-sm font-medium">Clasificación en tiempo real de la Fuerza Absoluta de la Tropa (Los 5 Básicos)</p>
               </div>

               {topAthletes.length > 0 ? (
                  <div className="bg-black/80 border border-zinc-800 rounded-[2.5rem] p-4 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.05)] backdrop-blur-xl overflow-x-auto custom-scrollbar">
                     <div className="min-w-[800px]">
                         <div className="grid grid-cols-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 pb-4 border-b border-zinc-800/50 mb-6">
                            <div className="col-span-2">Atleta Activo</div>
                            <div className="text-center">Sentadilla</div>
                            <div className="text-center">Banca</div>
                            <div className="text-center">P. Muerto</div>
                            <div className="text-center">Fondos</div>
                            <div className="text-center">Militar</div>
                            <div className="text-center text-emerald-400">Puntaje Total</div>
                         </div>
                         
                         <div className="space-y-4">
                            {topAthletes.map((athlete, idx) => (
                               <div key={idx} className={`grid grid-cols-8 items-center p-4 md:px-6 md:py-6 rounded-2xl transition-all duration-500 ${idx === 0 ? 'bg-gradient-to-r from-emerald-950/40 to-black border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02] z-10 relative' : idx === 1 ? 'bg-zinc-900/80 border border-zinc-700' : idx === 2 ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-zinc-900/30 border border-transparent hover:border-zinc-700'}`}>
                                  <div className="col-span-2 flex items-center gap-4">
                                     <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${idx === 0 ? 'bg-emerald-500 text-black shadow-emerald-500' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {idx === 0 ? '👑' : `#${idx + 1}`}
                                     </span>
                                     <span className={`font-black italic uppercase tracking-tight ${idx === 0 ? 'text-emerald-400 text-2xl' : 'text-white text-xl'}`}>{athlete.name}</span>
                                  </div>
                                  <div className="text-center text-zinc-400 font-mono text-base">{athlete.squat} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-base">{athlete.bench} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-base">{athlete.deadlift} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-base">{athlete.dips} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-base">{athlete.military} kg</div>
                                  <div className={`text-center font-black text-xl ${idx === 0 ? 'text-emerald-400 text-3xl drop-shadow-md' : 'text-zinc-200'}`}>
                                     {athlete.total} kg
                                  </div>
                               </div>
                            ))}
                         </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center gap-4">
                     <span className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></span>
                     <p className="text-zinc-500 italic font-bold">Sincronizando con los servidores de BII-Vintage...</p>
                  </div>
               )}
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── SECCIÓN: EL PANEL Y TECNOLOGÍA (BENTO GRID MEJORADO) ─── */}
      <section className="relative z-10 py-32 bg-zinc-950 border-b border-white/5 overflow-hidden">
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-6 text-center">
               <h2 className="text-4xl md:text-6xl font-black italic mb-6 text-white tracking-tighter">EL ECOSISTEMA <span className="text-emerald-500">DIGITAL</span></h2>
               <p className="text-zinc-400 mb-16 max-w-2xl mx-auto text-lg">Olvidate de los PDFs genéricos por correo. Al sumarte, ingresás a tu propio Dashboard Privado, una herramienta diseñada exclusivamente para el alto rendimiento.</p>
               
               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: "📈", title: "Curva de Progreso", desc: "Tus RMs graficados automáticamente en tiempo real.", colSpan: "lg:col-span-2" },
                    { icon: "⚡", title: "Control SNC", desc: "Monitoreo diario de sueño, peso y nivel de estrés general.", colSpan: "lg:col-span-1" },
                    { icon: "🧠", title: "Auto-Regulación", desc: "Ajuste milimétrico de RPE y RIR.", colSpan: "lg:col-span-1" },
                    { icon: "📹", title: "Auditoría en Video", desc: "Devoluciones cuadro por cuadro del Coach directo en tu panel, para que no pierdas un solo kilo por mala técnica.", colSpan: "lg:col-span-4" }
                  ].map((feature, i) => (
                      <div key={i} className={`bg-black/60 border border-zinc-800/80 p-10 rounded-[2.5rem] text-left hover:bg-zinc-900/40 hover:border-emerald-500/40 transition-all duration-500 ${feature.colSpan}`}>
                          <div className="text-4xl mb-6 bg-zinc-900 w-16 h-16 flex items-center justify-center rounded-2xl border border-zinc-800">{feature.icon}</div>
                          <h3 className="text-white font-black italic text-2xl uppercase tracking-tight mb-3">{feature.title}</h3>
                          <p className="text-zinc-400 text-sm font-medium leading-relaxed">{feature.desc}</p>
                      </div>
                  ))}
               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── SECCIÓN ESTRELLA: TUJAGUE AI SYSTEM ─── */}
      <section className="relative z-10 py-32 bg-black border-b border-white/5 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[700px] bg-blue-500/10 blur-[150px] pointer-events-none"></div>
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
               
               {/* TEXTO Y BENEFICIOS */}
               <div className="flex-1 text-center lg:text-left">
                  <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 inline-block shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      Exclusivo Planes Mensuales
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-6 leading-none">
                      SOPORTE INTELIGENTE <span className="text-blue-500">24/7</span>
                  </h2>
                  <p className="text-zinc-400 font-medium leading-relaxed mb-12 text-lg">
                      Nuestros planes mensuales incluyen acceso a <strong>Tujague AI</strong>. Un sistema de inteligencia artificial entrenado con mi metodología para resolver dudas estructurales, nutricionales y de biomecánica al instante.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0 text-left">
                     <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                        <span className="text-blue-500 text-3xl mb-4 block">⚙️</span>
                        <h4 className="text-white font-black text-base uppercase mb-2">Palancas y Torque</h4>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Ajustes de Leg Drive y Bracing</p>
                     </div>
                     <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                        <span className="text-blue-500 text-3xl mb-4 block">👨‍🍳</span>
                        <h4 className="text-white font-black text-base uppercase mb-2">Asesor Culinario</h4>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Diseño nutricional a partir de tu inventario.</p>
                     </div>
                  </div>
               </div>

               {/* MOCKUP DEL CHAT */}
               <div className="flex-1 w-full max-w-xl mx-auto lg:mx-0 hidden lg:block">
                  <div className="bg-[#09090b] border border-blue-900/30 rounded-[3rem] shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden flex flex-col h-[550px]">
                     
                     <div className="px-6 py-6 border-b border-zinc-800/80 bg-zinc-900/80 flex justify-between items-center z-10 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">🤖</div>
                           <div>
                              <p className="font-black text-white italic text-base tracking-tight">Tujague AI System</p>
                              <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Sistema en línea
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex-1 p-6 space-y-6 bg-gradient-to-b from-[#09090b] to-blue-950/10 flex flex-col justify-end">
                        <div className="ml-auto w-fit max-w-[85%]">
                           <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 text-right">Atleta</span>
                           <div className="bg-zinc-800 text-white p-5 rounded-3xl rounded-tr-sm text-sm font-medium border border-zinc-700 shadow-sm leading-relaxed">
                              Coach, al hacer Press de Banca siento que trabajo más el hombro que el pectoral. ¿Qué ajusto en el set-up?
                           </div>
                        </div>

                        <div className="mr-auto w-fit max-w-[90%]">
                           <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1.5">Tujague AI</span>
                           <div className="bg-gradient-to-br from-blue-950/60 to-emerald-950/20 p-6 rounded-3xl rounded-tl-sm text-sm text-blue-50 border border-blue-500/30 shadow-md leading-relaxed">
                              <p className="mb-3">Analicemos la biomecánica de ese error clásico:</p>
                              <p className="mb-3"><strong>1. Retracción y Depresión:</strong> Debes juntar las escápulas y empujarlas hacia tus glúteos. Esto saca al deltoides anterior de la línea de fuego.</p>
                              <p><strong>2. Ángulo del Húmero:</strong> Cierra tus codos a un ángulo de 45°-60° respecto a tu torso para maximizar el torque en las fibras del pectoral.</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-5 border-t border-zinc-800 bg-zinc-900/50 flex gap-3 items-center">
                        <div className="flex-1 h-12 rounded-xl bg-black border border-zinc-800 flex items-center px-5">
                           <span className="text-sm text-zinc-600 font-medium">Escribe tu consulta técnica...</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold opacity-50">↑</div>
                     </div>

                  </div>
               </div>

            </div>
         </RevealOnScroll>
      </section>

      {/* ─── LA FILOSOFÍA ─── */}
      <section className="relative z-10 py-32 bg-zinc-900/20 border-b border-white/5 backdrop-blur-xl">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-4">NUESTRO <span className="text-emerald-500">CREDO</span></h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "Brief (Breve)", desc: "Entrenamientos cortos y directos al punto. Si puedes entrenar más de una hora a esta intensidad, no estás entrenando lo suficientemente duro." },
                  { title: "Intense (Intenso)", desc: "Series llevadas al verdadero límite (RIR 0). Técnica estricta bajo fatiga extrema. Aquí es donde ocurre el crecimiento." },
                  { title: "Infrequent (Infrecuente)", desc: "El músculo crece cuando descansas, no cuando levantas. Controlamos la frecuencia para evitar destrozar tu Sistema Nervioso Central." }
                ].map((item, i) => (
                  <div key={i} className="p-10 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-500 group">
                    <div className="w-16 h-16 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 font-black text-2xl italic tracking-tighter group-hover:scale-110 group-hover:border-emerald-500/50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                      {item.title.split(' ')[0]}
                    </div>
                    <h3 className="text-3xl font-black italic mb-4 text-white uppercase">{item.title}</h3>
                    <p className="text-zinc-400 text-base leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── EL ENTRENADOR ─── */}
      <section className="relative z-10 py-32 px-4 border-b border-white/5 overflow-hidden">
        <RevealOnScroll>
           <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 md:gap-20">
             
             <div className="relative group w-[300px] h-[400px] md:w-[450px] md:h-[550px] flex-shrink-0">
                <div className="absolute -inset-4 bg-emerald-500/20 blur-[80px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                   <Image src="/hero.png" alt="Luciano Tujague" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
                </div>
             </div>
             
             <div className="flex-1 text-center lg:text-left min-w-0 max-w-full">
               <span className="text-emerald-500 font-black tracking-widest text-xs mb-6 inline-block uppercase border-b border-emerald-500/30 pb-2">Head Coach</span>
               
               <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[6rem] font-black mb-8 italic tracking-tighter text-white leading-none">
                   LUCIANO<br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 block mt-2">TUJAGUE</span>
               </h2>
               
               <div className="space-y-6 text-zinc-400 text-lg leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                   <p>Aplico la metodología <strong className="text-white">BII-VINTAGE</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica y la gestión absoluta de la fatiga.</p>
                   <p>Mi filosofía exige <strong className="text-white">tolerancia al dolor</strong>: priorizo la técnica impecable con excéntricas de hasta 6 segundos. No busco entretenerte; busco efectividad real.</p>
               </div>
               
               {/* ✅ TUS RMs VERIFICADOS (Todos con el símbolo +) */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-12 max-w-4xl mx-auto lg:mx-0">
                 {[
                   { v: "+152 KG", l: "Squat" },
                   { v: "+110 KG", l: "Banca" },
                   { v: "+110 KG", l: "Deadlift" },
                   { v: "+60 KG", l: "Militar" },
                   { v: "+60 KG", l: "Fondos" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-zinc-900/50 backdrop-blur-md p-5 rounded-3xl border border-white/5 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all group">
                      <p className="text-white font-black text-3xl italic leading-none group-hover:text-emerald-400 transition-colors drop-shadow-md">{stat.v}</p>
                      <p className="text-[10px] text-zinc-500 font-black tracking-widest mt-2 uppercase">{stat.l}</p>
                   </div>
                 ))}
               </div>
             </div>
             
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── EL BIG 5 ─── */}
      <section className="relative z-10 py-32 px-4 bg-zinc-950 border-b border-white/5">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white">PREDICAR CON EL <span className="text-emerald-500">EJEMPLO</span></h2>
                  <p className="text-zinc-500 mt-4 font-medium uppercase tracking-widest text-xs">Registros Oficiales de Levantamientos Base</p>
               </div>
               
               {/* ✅ VIDEOS MODIFICADOS (Todos con el símbolo +) */}
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { title: "Sentadilla (+152 KG)" },
                   { title: "Press de Banca (+110 KG)" },
                   { title: "Peso Muerto (+110 KG)" },
                   { title: "Press Militar (+60 KG)" },
                   { title: "Fondos Lastrados (+60 KG)" }
                 ].map((video, idx) => (
                     <div key={idx} className="bg-black border border-zinc-800 rounded-[2.5rem] overflow-hidden group relative shadow-xl">
                         <div className="aspect-video bg-zinc-900/50 flex flex-col items-center justify-center p-8 relative">
                             <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800 mb-4 opacity-50">
                                 <span className="text-2xl">🔒</span>
                             </div>
                             <h4 className="text-zinc-600 font-black tracking-widest text-xs uppercase text-center">Video de Registro en Producción</h4>
                         </div>
                         
                         <div className="p-6 md:p-8 border-t border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row justify-between items-center gap-4">
                             <p className="font-black italic text-white uppercase text-lg text-center md:text-left">{video.title}</p>
                             <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0">
                                 Próximamente
                             </span>
                         </div>
                     </div>
                 ))}
               </div>
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing-section" className="relative z-20 pt-32 pb-16 px-4 bg-zinc-950/80 border-t border-white/5">
        <RevealOnScroll>
           <div className="max-w-7xl mx-auto text-center">
             <h2 className="text-5xl md:text-7xl font-black italic text-center mb-12 tracking-tighter drop-shadow-xl text-white">
               ELIGE TU <span className="text-emerald-500">CAMINO</span>
             </h2>
             
             <div className="inline-flex bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-800 mb-20 shadow-2xl">
               <button onClick={() => { setIsWeekly(true); setSelectedPlan(null); }} className={`px-12 py-4 rounded-xl text-xs md:text-sm font-black transition-all duration-300 tracking-widest ${isWeekly ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white'}`}>SEMANAL</button>
               <button onClick={() => { setIsWeekly(false); setSelectedPlan(null); }} className={`px-12 py-4 rounded-xl text-xs md:text-sm font-black transition-all duration-300 tracking-widest ${!isWeekly ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white'}`}>MENSUAL</button>
             </div>

             <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto mb-24">
               {currentPlans.map((plan) => (
                 <div 
                   key={plan.id} 
                   onClick={() => handleSelectPlan(plan)}
                   className={`p-8 md:p-10 cursor-pointer group transition-all duration-500 relative flex flex-col rounded-[3rem] border backdrop-blur-xl ${
                     selectedPlan?.id === plan.id 
                     ? 'bg-zinc-900/90 border-emerald-500 scale-[1.03] shadow-[0_0_60px_rgba(16,185,129,0.2)] z-10' 
                     : 'bg-zinc-900/40 border-white/5 hover:border-emerald-500/40 hover:bg-zinc-900/70'
                   }`}
                 >
                   {plan.highlight && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black text-[10px] font-black px-6 py-2 rounded-full tracking-widest shadow-lg shadow-emerald-500/30">
                        MÁS ELEGIDO
                      </div>
                   )}
                   
                   <h3 className="text-3xl font-black italic mb-2 tracking-tighter text-white">{plan.title}</h3>
                   <p className="text-emerald-400 font-bold tracking-widest text-[10px] mb-8 border-b border-white/10 pb-4 uppercase">{plan.subtitle}</p>
                   
                   <div className="text-4xl md:text-5xl font-black mb-8 text-white tracking-tight flex items-center justify-center">
                       <span className="text-2xl text-zinc-500 mr-1">ARS $</span>
                       {plan.price.toLocaleString('es-AR')} 
                       <span className="text-sm text-zinc-500 font-bold ml-2 tracking-wide align-bottom">/{isWeekly ? 'SEM' : 'MES'}</span>
                   </div>
                   
                   <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl mb-8">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">🎯 Ideal para:</p>
                       <p className="text-sm text-zinc-300 font-bold">{plan.idealFor}</p>
                   </div>

                   <p className="text-zinc-400 mb-10 text-sm leading-relaxed flex-grow font-medium">{plan.description}</p>
                   
                   <ul className="space-y-4 mb-10 text-left bg-black/40 p-6 rounded-3xl border border-white/5">
                     {plan.features.map((f, idx) => (
                       <li key={idx} className="flex items-start gap-4 text-zinc-300 font-medium text-sm">
                         <span className={`${f.includes('Tujague AI') ? 'text-blue-500' : 'text-emerald-500'} font-black mt-0.5`}>✓</span>
                         <span className={f.includes('Tujague AI') ? 'text-blue-400 font-bold' : ''}>{f}</span>
                       </li>
                     ))}
                   </ul>

                   <button className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] transition-all duration-300 uppercase ${
                     selectedPlan?.id === plan.id 
                     ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                     : 'bg-white/5 text-zinc-400 group-hover:bg-white group-hover:text-black'
                   }`}>
                     {selectedPlan?.id === plan.id ? 'PLAN SELECCIONADO' : 'ELEGIR ESTE PLAN'}
                   </button>
                 </div>
               ))}
             </div>
             
             {/* CUADRO DE TRANSPARENCIA */}
             <div className="max-w-4xl mx-auto mb-20 bg-zinc-900/60 border border-white/5 rounded-[3rem] p-10 md:p-16 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
                
                <h3 className="text-3xl md:text-4xl font-black italic text-center text-white mb-12 tracking-tighter">TRANSPARENCIA <span className="text-emerald-500">TOTAL</span></h3>
                
                <div className="grid md:grid-cols-2 gap-12 md:gap-20">
                   <div className="space-y-6 text-left">
                     <h4 className="text-emerald-500 font-black tracking-widest text-sm uppercase flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                       <span className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">✓</span> Lo que SÍ Incluye
                     </h4>
                     <ul className="space-y-5">
                       <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                         <span className="text-emerald-500 font-bold mt-0.5">•</span> Programación 100% personalizada en Dashboard web.
                       </li>
                       <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                         <span className="text-emerald-500 font-bold mt-0.5">•</span> Correcciones técnicas vía video en el panel.
                       </li>
                       <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                         <span className="text-emerald-500 font-bold mt-0.5">•</span> Acceso y contacto directo por WhatsApp 1 a 1.
                       </li>
                       <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                         <span className="text-blue-500 font-black mt-0.5">•</span> <strong>Tujague AI 24/7 (Solo Planes Mensuales).</strong>
                       </li>
                     </ul>
                   </div>

                   <div className="space-y-6 text-left relative">
                     <div className="hidden md:block absolute -left-10 top-0 bottom-0 w-[1px] bg-white/5"></div>
                     <h4 className="text-red-500 font-black tracking-widest text-sm uppercase flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                       <span className="bg-red-500/10 p-2 rounded-xl text-red-400">✕</span> Lo que NO Incluye
                     </h4>
                     <ul className="space-y-5">
                       <li className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                         <span className="text-red-500/70 font-bold mt-0.5">•</span> Menús de alimentación cerrados (Pollo y arroz).
                       </li>
                       <li className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                         <span className="text-red-500/70 font-bold mt-0.5">•</span> Consultas médicas o de rehabilitación.
                       </li>
                       <li className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                         <span className="text-red-500/70 font-bold mt-0.5">•</span> Clases en vivo o entrenamientos presenciales.
                       </li>
                     </ul>
                   </div>
                </div>
             </div>

             {selectedPlan && (
               <div className="max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
                 <label className={`flex items-center justify-between p-8 md:p-10 border cursor-pointer transition-all duration-300 rounded-[3rem] backdrop-blur-xl ${addVideoReview ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.15)] scale-[1.02]' : 'bg-zinc-900/50 border-white/10 hover:border-white/20 hover:bg-zinc-800/50'}`}>
                   <div className="flex items-center gap-6 text-left">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-inner shrink-0 ${addVideoReview ? 'bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/50' : 'border-zinc-700 bg-black/50 text-transparent'}`}>
                       <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                       <h4 className="font-black text-xl md:text-2xl leading-none mb-2 text-white italic">Auditoría Técnica Biomecánica</h4>
                       <p className="text-[10px] md:text-xs text-emerald-400 font-bold tracking-widest uppercase mt-2">Análisis detallado de los 5 Básicos + Corrección de palancas.</p>
                     </div>
                   </div>
                   <div className="text-right pl-4 hidden sm:block">
                       <span className="text-3xl font-black text-white block tracking-tight">+ARS ${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                   </div>
                   <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
                 </label>
               </div>
             )}
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── CHECKOUT SECTION ─── */}
      <section id="checkout-section" className="relative z-10 pt-16 pb-32 px-4 bg-black border-t border-white/5">
        <RevealOnScroll>
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-5xl md:text-6xl font-black italic mb-6 tracking-tighter text-white">FINALIZAR <span className="text-emerald-500">INSCRIPCIÓN</span></h2>
               <p className="text-zinc-400 text-lg font-medium tracking-wide">Completá tus datos para recibir acceso inmediato al panel de entrenamiento.</p>
             </div>
             {selectedPlan ? (
               <div className="bg-[#09090b] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden pb-16 md:pb-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                 <CheckoutClient selectedPlan={selectedPlan} extraVideo={addVideoReview} extraPrice={EXTRA_VIDEO_PRICE} />
               </div>
             ) : (
               <div className="text-center p-24 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-white/[0.01] backdrop-blur-sm pb-24 md:pb-24">
                 <p className="text-xl font-bold text-zinc-500 italic tracking-widest flex flex-col items-center gap-4">
                   <svg className="w-12 h-12 text-zinc-700 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                   SELECCIONÁ UN PLAN ARRIBA PARA CONTINUAR
                 </p>
               </div>
             )}
           </div>
        </RevealOnScroll>
      </section>

      {/* ─── PREGUNTAS FRECUENTES (FAQ) MOVIDAS AL FINAL ─── */}
      <section className="relative z-10 py-24 px-4 bg-zinc-950 border-t border-white/5">
         <RevealOnScroll>
            <div className="max-w-4xl mx-auto">
               <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white mb-4">PREGUNTAS <span className="text-emerald-500">FRECUENTES</span></h2>
                  <p className="text-zinc-400 font-medium text-sm">Resolvé tus dudas antes de elegir tu plan de entrenamiento.</p>
               </div>

               <div className="space-y-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="bg-black border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300">
                        <button 
                           onClick={() => setOpenFaq(openFaq === i ? null : i)}
                           className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-zinc-900/50 transition-colors"
                        >
                           <span className="font-black text-white italic tracking-tight text-base pr-4">{faq.q}</span>
                           <span className={`text-emerald-500 font-bold text-lg transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                              ▼
                           </span>
                        </button>
                        <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <p className="text-zinc-400 text-sm leading-relaxed font-medium pt-2 border-t border-zinc-800">{faq.a}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </RevealOnScroll>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-50 pt-20 pb-28 md:pb-20 border-t border-white/10 bg-[#09090b] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left">
          
          <div className="space-y-4 max-w-xs">
             <Link href="/" className="font-black text-2xl italic text-white tracking-tighter hover:opacity-80 transition-opacity">
               TUJAGUE <span className="text-emerald-500">STRENGTH</span>
             </Link>
             <p className="text-zinc-500 text-xs italic tracking-tight font-medium leading-relaxed">
               "Te doy las herramientas, vos ponés el esfuerzo. Biomecánica aplicada y entrenamiento de fuerza real."
             </p>
             <p className="text-zinc-600 text-[10px] tracking-[0.3em] font-bold uppercase mt-6">
               &copy; {new Date().getFullYear()} Luciano Tujague.
             </p>
          </div>

          <div className="flex flex-col gap-4">
             <h4 className="text-emerald-500 font-black tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block uppercase">Contacto Directo</h4>
             <div className="flex flex-col gap-3 text-sm font-bold text-white tracking-wide">
                <a href="mailto:luciano2004tujague20@gmail.com" className="hover:text-emerald-400 transition-colors">Email Oficial</a>
                <a href="https://instagram.com/tujague.strenght" target="_blank" className="hover:text-emerald-400 transition-colors">Instagram</a>
                <a href={whatsappUrl} target="_blank" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <h4 className="text-emerald-500 font-black tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block uppercase">
               Enlaces
             </h4>
             <div className="flex flex-col gap-3 text-[10px] font-black tracking-widest text-zinc-500">
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Términos y Condiciones</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Política de Privacidad</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Baja del Servicio</Link>
                <Link href="/admin/login" className="hover:text-emerald-500 transition-colors uppercase mt-4">
                  Acceso Entrenador 🔒
                </Link>
             </div>
          </div>

        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
      `}} />
    </main>
  );
}