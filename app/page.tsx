"use client";

import React, { useState, useEffect, useRef } from "react";
import CheckoutClient from "./components/CheckoutClient";
import PricingV2, { PricingPlan } from "@/components/PricingV2";
import Link from "next/link";
import Image from "next/image";

// ============================================================================
// 🚀 MOTOR GRÁFICO LIGERO: REVEAL ON SCROLL MULTI-DIRECCIONAL (GPU ACELERADO)
// ============================================================================
type RevealType = "up" | "left" | "right" | "pop";

function Reveal({ children, delay = 0, type = "up", className = "", threshold = 0.15 }: { children: React.ReactNode, delay?: number, type?: RevealType, className?: string, threshold?: number }) {
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
      { threshold } 
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const baseClasses = "transition-all duration-700 ease-out will-change-transform will-change-opacity transform-gpu";
  
  const getHiddenState = (t: RevealType) => {
    switch (t) {
      case "up": return "opacity-0 translate-y-12";
      case "left": return "opacity-0 -translate-x-12";
      case "right": return "opacity-0 translate-x-12";
      case "pop": return "opacity-0 scale-50";
      default: return "opacity-0 translate-y-12";
    }
  };

  const getVisibleState = (t: RevealType) => {
    switch (t) {
      case "up": return "opacity-100 translate-y-0";
      case "left": return "opacity-100 translate-x-0";
      case "right": return "opacity-100 translate-x-0";
      case "pop": return "opacity-100 scale-100 transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"; // Spring nativo
      default: return "opacity-100 translate-y-0";
    }
  };

  return (
    <div 
      ref={ref} 
      className={`${baseClasses} ${isVisible ? getVisibleState(type) : getHiddenState(type)} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 🚀 MOTOR GRÁFICO LIGERO: CONTADOR MATEMÁTICO AL HACER SCROLL
// ============================================================================
function AnimatedCounter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const duration = 1500;
          const incrementTime = 30;
          const steps = Math.ceil(duration / incrementTime);
          const increment = end / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setDisplayValue(end);
              clearInterval(timer);
            } else {
              setDisplayValue(Math.ceil(start));
            }
          }, incrementTime);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

// 🔥 FAQS OPTIMIZADAS (ENFOQUE NEUROLÓGICO Y BIOMECÁNICO) 🔥
const FAQS = [
  { q: "¿Por qué hacemos tanto énfasis en el Sistema Nervioso Central (SNC)?", a: "El músculo es solo el motor, el SNC es quien lo enciende. Las rutinas genéricas de 6 días de alto volumen fríen tu sistema nervioso antes de que el músculo pueda recuperarse. Al entrenar con la frecuencia BII-Vintage, le damos a tu cerebro el tiempo exacto para 'resetearse', permitiéndote reclutar el 100% de tus fibras musculares más grandes en la siguiente sesión sin estancarte." },
  { q: "¿Por qué el mínimo de la Mentoría son 3 meses y no se cobra mensual?", a: "Ni tu sistema nervioso ni tu tejido muscular construyen adaptaciones reales en 4 semanas. El modelo mensual invita a rendirse a la primera molestia. Al comprometerte 90, 180 o 365 días, filtrás tus propias excusas y nos das el tiempo clínico necesario para reestructurar tu biomecánica." },
  { q: "¿Qué diferencia el plan de 6 Meses del de 3 Meses?", a: "El software (Dashboard y Tujague AI) es exactamente el mismo. La diferencia es mi tiempo personal. En el plan de 6 meses (El más elegido) se te habilita una línea directa a mi WhatsApp de Lunes a Viernes para correcciones técnicas urgentes, además de una Clínica Biomecánica por videollamada al inicio." },
  { q: "¿Sirve si entreno 3 días a la semana o en un Home Gym?", a: "Es el escenario ideal. El método mutante se basa en estímulos breves, infrecuentes y de intensidad absoluta. Crecés cuando tu SNC descansa en tu casa, no sumando horas en el gimnasio. Si tenés una barra, discos y un rack, es suficiente para forzar el crecimiento." },
  { q: "¿Necesito ser un atleta avanzado para aplicar a la Mentoría?", a: "No. De hecho, si sos principiante es una ventaja: evitamos que construyas vicios técnicos y patrones de movimiento defectuosos desde cero. Nos enfocamos 100% en tu torque y conexión mente-músculo antes de meter carga pesada." }
];

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  const navRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeCard, setActiveCard] = useState<number>(-1);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          if (navRef.current) {
            const intensity = Math.min(scrollY / 400, 0.98); 
            navRef.current.style.backgroundColor = `rgba(5, 5, 5, ${intensity})`;
            navRef.current.style.borderBottom = `1px solid rgba(255, 255, 255, ${intensity * 0.1})`;
            const padding = intensity > 0.5 ? '0.5rem' : '1.5rem';
            navRef.current.style.paddingTop = padding;
            navRef.current.style.paddingBottom = padding;
            navRef.current.style.boxShadow = intensity > 0.5 ? '0 10px 30px rgba(245,158,11,0.05)' : 'none';
          }

          if (timelineRef.current && timelineLineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const startOffset = windowHeight / 2; 
            
            const pixelsScrolled = startOffset - rect.top;
            
            let progress = (pixelsScrolled / rect.height) * 100;
            progress = Math.max(0, Math.min(100, progress));
            timelineLineRef.current.style.height = `${progress}%`;

            let currentActive = -1;
            cardsRef.current.forEach((card, index) => {
              if (card && pixelsScrolled >= card.offsetTop + 20) {
                currentActive = index;
              }
            });
            
            if (currentActive !== activeCard) {
                setActiveCard(currentActive);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCard]); 

  // 🔥 Bot mode CLOSER
  const [botMessages, setBotMessages] = useState<{role: string, content: string}[]>([
      { role: "assistant", content: "¡Fiera! Soy el Setter de la plataforma. ¿Estás buscando el Protocolo BII de 12 semanas o querés aplicar para la Mentoría Élite con Tujague? Contame tu estancamiento y te diagnostico." }
  ]);
  const [botInput, setBotInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const botEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isBotOpen) botEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages, isBotTyping, isBotOpen]);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      const checkout = document.getElementById("checkout-final");
      if (checkout) checkout.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const scrollToPricing = () => {
    const pricing = document.getElementById("cajas-nuevas");
    if (pricing) pricing.scrollIntoView({ behavior: "smooth", block: "start" });
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
          if (data.reply) setBotMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } catch (error) {
          setBotMessages(prev => [...prev, { role: "assistant", content: "El sistema está saturado. Escribile directo al Coach por WhatsApp." }]);
      } finally {
          setIsBotTyping(false);
      }
  };

  const whatsappUrl = `https://wa.me/5491123021760?text=${encodeURIComponent("Hola Coach, quiero aplicar para ingresar al equipo BII-Vintage y llevar mi fuerza al siguiente nivel.")}`;

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#000000] text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* ─── FONDO ÉPICO ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/hero.png" alt="Background" fill className="object-cover opacity-[0.08] hidden md:block transform-gpu" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/95 via-[#000000]/95 to-[#000000] z-10 transform-gpu"></div>
      </div>
      
      {/* ─── NAVBAR FLOTANTE OPTIMIZADO ─── */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform-gpu" style={{ backgroundColor: 'transparent', padding: '1.5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-black italic tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
            TUJAGUE <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">STRENGTH</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hidden sm:flex text-zinc-400 hover:text-amber-400 text-[10px] uppercase font-black tracking-widest transition-colors items-center gap-1">
               <span className="text-sm">🏠</span> Inicio
            </button>
          </div>
        </div>
      </nav>

      {/* ─── BOTÓN FLOTANTE ÚNICO: BOT DE IA ─── */}
      <div className="fixed bottom-6 left-4 md:left-6 z-[100] transform-gpu mobile-vibrate">
         {!isBotOpen ? (
            <button onClick={() => setIsBotOpen(true)} className="bg-[#0a0a0c] border border-amber-500/50 w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform flex items-center justify-center relative group backdrop-blur-md">
               <span className="absolute -top-12 left-0 bg-[#0a0a0c] border border-zinc-800 text-amber-400 text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                 Consultas
               </span>
               <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-500 border-2 border-zinc-900 rounded-full animate-pulse"></span>
               <svg className="w-8 h-8 sm:w-9 sm:h-9 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </button>
         ) : (
            <div className="bg-[#0a0a0c]/95 border border-zinc-800 w-[90vw] max-w-[380px] h-[500px] max-h-[75vh] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-bot-open backdrop-blur-xl transform-gpu origin-bottom-left">
               <div className="bg-zinc-900/80 border-b border-zinc-800 p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/10 blur-2xl transform-gpu"></div>
                  <div className="flex items-center gap-3 relative z-10"><span className="text-2xl drop-shadow-md">🤖</span><div><h4 className="font-black italic text-sm text-white leading-none">Asesor <span className="text-amber-500">Comercial</span></h4><span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Tujague Strength</span></div></div>
                  <button onClick={() => setIsBotOpen(false)} className="text-zinc-500 hover:text-white relative z-10 transition-colors text-xl p-1">✕</button>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/40">
                  {botMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-message-in`}>
                        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[85%] shadow-md ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm border border-zinc-700/50' : 'bg-amber-950/40 border border-amber-500/30 text-amber-50 rounded-tl-sm'}`}>
                           {msg.content}
                        </div>
                     </div>
                  ))}
                  {isBotTyping && (
                     <div className="flex flex-col items-start">
                        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 rounded-tl-sm flex items-center gap-1.5 shadow-md">
                           <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                           <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                        </div>
                     </div>
                  )}
                  <div ref={botEndRef} />
               </div>

               <form onSubmit={handleSendBotMessage} className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950/90 flex gap-2">
                  <input type="text" value={botInput} onChange={(e) => setBotInput(e.target.value)} placeholder="Escribe tu consulta aquí..." className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-xs sm:text-sm text-white outline-none focus:border-amber-500 transition-colors shadow-inner" disabled={isBotTyping} />
                  <button type="submit" disabled={isBotTyping || !botInput.trim()} className="bg-amber-500 text-black w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-amber-400 transition-all font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95">↑</button>
               </form>
            </div>
         )}
      </div>

      {/* ========================================================= */}
      {/* 1. HERO SECTION: EL GANCHO CLOSER (DOLOR + DIAGNÓSTICO)   */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-4 transform-gpu border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_50%)] pointer-events-none transform-gpu"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center mt-10 md:mt-20">
          
          <Reveal type="up" delay={100}>
            <span className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> EL MÉTODO BII-VINTAGE
            </span>
          </Reveal>

          <Reveal type="up" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black italic text-white uppercase tracking-tighter drop-shadow-lg leading-tight sm:leading-[0.95] mb-8 py-2">
              DEJÁ DE FREÍR TU SISTEMA NERVIOSO. DESTRABÁ TU <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)] block sm:inline">FUERZA REAL.</span>
            </h1>
          </Reveal>

          <Reveal type="up" delay={300}>
            <p className="text-zinc-400 text-sm sm:text-base md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
              El 90% fracasa porque el "volumen basura" de los gimnasios tradicionales atrofia su conexión neuronal. Dejá de ser un espectador, dominá tu recuperación y construí músculo real entrenando menos días, pero con intensidad absoluta.
            </p>
          </Reveal>

          <Reveal type="up" delay={400} className="w-full sm:w-auto">
            <div className="flex flex-col items-center gap-2">
<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
  {/* Botón Principal (Va al Checkout) */}
  <button onClick={scrollToPricing} className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 text-black px-10 py-5 md:py-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(245,158,11,0.4)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border border-amber-200 relative overflow-hidden shimmer-effect transition-all duration-300 group hover:shadow-[0_15px_50px_rgba(245,158,11,0.6)]">
    QUIERO MUTAR HOY <span className="text-lg group-hover:translate-x-1 transition-transform">➔</span>
  </button>
  
  {/* Botón Secundario (Hace scroll hacia la explicación del método) */}
  <button onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })} className="w-full sm:w-auto bg-[#0a0a0c]/80 hover:bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-white px-10 py-5 md:py-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center backdrop-blur-md active:scale-95">
    VER ESTRUCTURAS BII
  </button>
</div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-4 font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Atención: Solo 15 cupos mensuales para soporte de IA.
              </p>
            </div>
          </Reveal>

          <Reveal type="up" delay={600} className="w-full max-w-4xl mx-auto mt-16 md:mt-24">
            <h2 className="text-2xl md:text-4xl font-black italic text-center mb-8 font-serif uppercase tracking-tight leading-tight text-zinc-300 px-2">
              MIRA LA AUDITORÍA ANTES DE QUE <br className="hidden md:block" />
              <span className="text-amber-500">CIERREN LOS CUPOS</span>
            </h2>
            <div className="w-full aspect-video bg-[#0a0a0c] border-2 border-zinc-800 hover:border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex items-center justify-center overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-amber-900/20 opacity-80"></div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500 rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(245,158,11,0.5)] group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 bg-gradient-to-t from-black to-transparent text-left">
                 <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Tujague_Protocolo_Mutacion.mp4</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. PARA QUIÉN ES (EL DOLOR NEUROLÓGICO Y MUSCULAR)          */}
      {/* ========================================================= */}
      <section className="py-24 px-4 max-w-5xl mx-auto border-b border-white/5 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          <Reveal type="left" delay={100} className="bg-[#0a0a0c] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group hover:border-amber-900/50 transition-colors shadow-sm hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full -z-10 group-hover:bg-amber-500/10 transition-colors"></div>
            <h3 className="text-sm font-black text-amber-500 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-4">Esta transmisión es para ti si:</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-amber-500 shrink-0">■</span> Estás sufriendo un estancamiento crónico en tus levantamientos hace meses.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-amber-500 shrink-0">■</span> Entrenás 5 o 6 días por semana y tu Sistema Nervioso Central (SNC) está completamente frito.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-amber-500 shrink-0">■</span> Quieres una estructura clínica, biomecánica y sin conjeturas.</li>
            </ul>
          </Reveal>

          <Reveal type="right" delay={200} className="bg-[#0a0a0c] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors shadow-sm hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-bl-full -z-10 group-hover:bg-amber-400/10 transition-colors"></div>
            <h3 className="text-sm font-black text-amber-400 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-4">En el programa descubrirás:</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-amber-400 shrink-0">▶</span> Por qué el "volumen basura" atrofia la señal enviada desde tu cerebro al músculo.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-amber-400 shrink-0">▶</span> Cómo la auto-regulación (RPE/RIR) hackea tu recuperación neuronal.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-amber-400 shrink-0">▶</span> El algoritmo exacto de progresión de cargas para mutar sin lesionarte.</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. EL LEGADO (TIMELINE DINÁMICA CON CONTADORES)           */}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 overflow-hidden bg-[#050505] border-b border-white/5 transform-gpu">
        <Reveal type="up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-4">
                 EL CAMINO DEL <span className="text-amber-500">MUTANTE</span>
               </h2>
               <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl mx-auto uppercase tracking-widest">De la frustración genética a la maestría biomecánica.</p>
            </div>

            <div ref={timelineRef} className="relative max-w-5xl mx-auto mb-32 pb-10">
              <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-1 bg-zinc-900 md:-translate-x-1/2 rounded-full"></div>
              <div ref={timelineLineRef} className="absolute left-[24px] md:left-1/2 top-0 w-1 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-500 md:-translate-x-1/2 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)] transition-all duration-75 ease-out z-0" style={{ height: '0%' }}></div>

              {[
                { num: "01. La Frustración", title: "EL INFIERNO DE LOS 6 AÑOS PERDIDOS", desc: "Empecé a los 15, flaco y sin rumbo. Creí que 'más era mejor' y entrenaba 6 días a la semana, hasta 4 horas por día. Destrocé mi sistema nervioso. Estuve 6 años estancado, adivinando y frustrándome.", right: false },
                { num: "02. El Hallazgo", title: "EL DESPERTAR DE LA INTENSIDAD", desc: "Descubrí el Heavy Duty y entendí cómo el cerebro dicta el reclutamiento muscular. Prioricé técnica, tempos y reduje la frecuencia. Al dejar que mi SNC sanara, el avance fue abismal: salté a 152kg en sentadilla.", right: true },
                { num: "03. El Sistema", title: "RESULTADOS CLÍNICOS", desc: "Creé Tujague Strength para salvarte de perder tu juventud en el gimnasio. Te enseño a gestionar la fatiga central y a conectar tu mente con la fascia muscular. Vas a experimentar intensidad real, y va a valer la pena.", right: false }
              ].map((item, idx) => (
                <div key={idx} ref={(el) => { cardsRef.current[idx] = el; }} className={`relative flex flex-col md:flex-row ${item.right ? 'md:flex-row-reverse' : ''} items-center justify-between mb-16 group`}>
                   <div className={`absolute left-[24px] md:left-1/2 w-6 h-6 border-4 rounded-full md:-translate-x-1/2 transition-all duration-300 z-10 mt-6 md:mt-0 ${activeCard >= idx ? 'border-amber-500 bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-125' : 'bg-[#050505] border-zinc-700'}`}></div>
                   <div className={`w-full md:w-5/12 pl-16 pt-4 md:pt-0 ${item.right ? 'md:pl-12 text-left' : 'md:pl-0 md:text-right md:pr-12'}`}>
                      <span className={`font-black text-xs uppercase tracking-widest block mb-2 transition-colors duration-300 ${activeCard >= idx ? 'text-amber-500' : 'text-zinc-500'}`}>{item.num}</span>
                      <h3 className={`text-2xl font-black italic uppercase mb-4 transition-colors duration-300 ${activeCard >= idx ? 'text-white' : 'text-zinc-400'}`}>{item.title}</h3>
                   </div>
                   <div className={`w-full md:w-5/12 pl-16 mt-2 md:mt-0 ${item.right ? 'md:pl-0 md:pr-12' : 'md:pl-12'}`}>
                      <div className={`border p-6 sm:p-8 rounded-[2rem] transition-all duration-500 ${activeCard >= idx ? 'border-amber-500/50 bg-zinc-900 shadow-[0_10px_30px_rgba(245,158,11,0.15)] scale-[1.02]' : 'bg-[#0a0a0c] border-zinc-800 shadow-sm'}`}>
                         <p className={`text-sm leading-relaxed transition-colors duration-300 ${activeCard >= idx ? 'text-zinc-300' : 'text-zinc-500'}`}>{item.desc}</p>
                      </div>
                   </div>
                </div>
              ))}

              <div ref={(el) => { cardsRef.current[3] = el; }} className="relative flex flex-col md:flex-row items-center justify-between group mt-24">
                 <div className={`absolute left-[24px] md:left-1/2 w-8 h-8 border-4 rounded-full md:-translate-x-1/2 transition-all duration-500 z-10 flex items-center justify-center mt-6 md:mt-0 ${activeCard >= 3 ? 'border-amber-500 bg-[#050505] shadow-[0_0_40px_rgba(245,158,11,1)] scale-125' : 'bg-[#050505] border-zinc-700'}`}>
                   <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeCard >= 3 ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'}`}></div>
                 </div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-0 md:pr-12 pt-4 md:pt-0 flex justify-center md:justify-end">
                    <div className={`relative w-[280px] h-[380px] sm:w-[350px] sm:h-[450px] flex-shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${activeCard >= 3 ? 'scale-[1.02] opacity-100' : 'scale-[1.1] opacity-0 grayscale'}`}>
                      <div className={`absolute -inset-10 bg-[radial-gradient(circle,rgba(245,158,11,0.2)_0%,transparent_60%)] transition-opacity duration-700 transform-gpu ${activeCard >= 3 ? 'opacity-100' : 'opacity-0'}`}></div>
                      <div className={`relative w-full h-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border transition-colors duration-500 ${activeCard >= 3 ? 'border-amber-500/30 shadow-2xl shadow-amber-500/20' : 'border-zinc-800'}`}>
                         <Image src="/hero.png" alt="Luciano Tujague" fill className="object-cover" />
                         <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                            <span className="font-black text-amber-500 tracking-widest uppercase text-[10px]">Head Coach</span>
                            <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Luciano Tujague</h3>
                         </div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-12 mt-8 md:mt-0">
                    <div className={`text-left min-w-0 max-w-full transition-all duration-700 ${activeCard >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                      <span className="text-amber-500 font-black tracking-[0.2em] text-[10px] sm:text-xs mb-4 inline-block uppercase border-b border-amber-500/30 pb-2">Resultados Innegables</span>
                      <h2 className="text-4xl sm:text-5xl font-black mb-6 italic tracking-tighter text-white leading-[0.9] drop-shadow-md">
                         SOPORTA EL<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 block mt-2">DOLOR.</span>
                      </h2>
                      <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium mb-8">
                        Aplico la metodología <strong className="text-white">BII-VINTAGE</strong> para maximizar el rendimiento en básicos, enfocándome en el torque articular y en mantener la frescura de tu sistema nervioso central.
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {[ { v: 152, l: "Squat KG" }, { v: 110, l: "Banca KG" }, { v: 100, l: "Deadlift KG" }, { v: 60, l: "Militar KG" } ].map((stat, i) => (
                          <div key={i} className={`p-4 rounded-2xl border transition-all duration-500 shadow-sm ${activeCard >= 3 ? 'bg-[#0a0a0c] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#050505] border-zinc-800'}`}>
                             <p className={`font-black text-2xl italic leading-none drop-shadow-md transition-colors duration-500 ${activeCard >= 3 ? 'text-amber-500' : 'text-zinc-600'}`}>
                               +<AnimatedCounter value={stat.v} />
                             </p>
                             <p className="text-[9px] text-zinc-500 font-black tracking-widest mt-1 uppercase">{stat.l}</p>
                          </div>
                        ))}
                        <div className={`p-4 rounded-2xl border transition-all duration-500 shadow-sm col-span-2 text-center ${activeCard >= 3 ? 'bg-[#0a0a0c] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#050505] border-zinc-800'}`}>
                           <p className={`font-black text-2xl italic leading-none drop-shadow-md transition-colors duration-500 ${activeCard >= 3 ? 'text-amber-500' : 'text-zinc-600'}`}>
                             +<AnimatedCounter value={60} /> KG
                           </p>
                           <p className="text-[9px] text-zinc-500 font-black tracking-widest mt-1 uppercase">Fondos (Rumbo a 100kg)</p>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ========================================================= */}
      {/* 4. RESULTADOS RÁPIDOS Y EVIDENCIA VISUAL                  */}
      {/* ========================================================= */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-b border-white/5 overflow-hidden">
        <Reveal type="up">
          <h2 className="text-2xl md:text-4xl font-black italic text-center mb-12 uppercase tracking-tighter text-zinc-100">
            Evidencia <span className="text-amber-500">Biomecánica</span>. Cero Excusas.
          </h2>
        </Reveal>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Reveal type="left" delay={100} className="bg-[#111] p-4 rounded-3xl border border-zinc-800 group">
            <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-zinc-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(245,158,11,0.1)_0%,_transparent_70%)]"></div>
              <p className="text-zinc-700 font-black uppercase text-xs tracking-widest text-center px-4">[Espacio para foto del Atleta Antes / Después]</p>
            </div>
            <div className="px-2">
              <h4 className="text-white font-black uppercase text-lg mb-1">Lucas M. <span className="text-amber-500 text-sm">- Transformación a 12 semanas</span></h4>
              <p className="text-zinc-400 text-sm font-medium">"Mi composición corporal cambió por completo. Al dejar descansar mi SNC los días off, la hipertrofia fue brutal. Bajé de 22% a 14% de grasa rompiendo RMs en Peso Muerto."</p>
            </div>
          </Reveal>

          <Reveal type="right" delay={200} className="bg-[#111] p-4 rounded-3xl border border-zinc-800 group hover:border-amber-500/30 transition-colors">
            <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-zinc-800 cursor-pointer">
              <div className="w-16 h-16 bg-black/50 border border-zinc-700 rounded-full flex items-center justify-center z-10 backdrop-blur-sm group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <p className="absolute bottom-4 left-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">▶ Video Testimonio</p>
            </div>
            <div className="px-2">
              <h4 className="text-white font-black uppercase text-lg mb-1">Santiago P. <span className="text-amber-400 text-sm">- Mentoría Élite</span></h4>
              <p className="text-zinc-400 text-sm font-medium">"Tener a Tujague corrigiendo mi biomecánica en la plataforma cambió mi reclutamiento de fibras. Entender cómo alinear la articulación antes de empujar no tiene precio."</p>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "Marcos R.", lv: "Atleta Intermedio", tag: "Reset Neuronal", d: "\"Estuve estancado en 80kg durante 8 meses. Apliqué el RPE que enseña Tujague y mi SNC se reseteó. Hoy tiro 95kg a 4 repeticiones como si nada. Brutal.\"" },
            { n: "Tomás L.", lv: "Powerbuilder", tag: "-4% Grasa Corporal", d: "\"Hice la Fase Cut del programa y no solo mantuve mi fuerza bruta en Sentadilla, sino que al no sobreentrenar mi sistema nervioso, conservé todo el músculo.\"" },
            { n: "Javier F.", lv: "Principiante Avanzado", tag: "Estructura Total", d: "\"El beneficio es mental. Entrar al gym sabiendo exactamente el tonelaje que dictan las calculadoras IA te quita la ansiedad y evita que hagas volumen basura.\"" }
          ].map((test, idx) => (
            <Reveal type="up" delay={idx * 150} key={idx} className="bg-[#0a0a0c] border border-zinc-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
                <div>
                  <p className="font-bold text-white uppercase text-sm">{test.n}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{test.lv}</p>
                </div>
                <span className="bg-amber-900/20 text-amber-500 font-black text-xs px-2 py-1 rounded border border-amber-900/30">{test.tag}</span>
              </div>
              <p className="text-zinc-400 text-sm italic">{test.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. BENEFICIOS Y RESULTADOS (CASCADA POP CON ENFOQUE SNC)  */}
      {/* ========================================================= */}
      <section className="py-20 px-4 max-w-5xl mx-auto border-b border-white/5">
        <Reveal type="up">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-black tracking-widest text-xs uppercase mb-3">La Mutación Esperada</p>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Tu Fisiología <span className="text-amber-500">Hackeada</span></h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "RESET NEURONAL ABSOLUTO", desc: "El músculo crece cuando descansas, pero tu SNC es quien manda la señal de crecimiento. Optimizamos la frecuencia para que tu cerebro esté 100% fresco al enfrentar la barra.", icon: "⚡" },
            { title: "DOMINIO ABSOLUTO DEL RPE/RIR", desc: "Aprenderás a leer tu sistema nervioso en tiempo real para saber cuándo debes ir al fallo y cuándo guardar repeticiones para no freír tu recuperación.", icon: "🧠" },
            { title: "SOBRECARGA PROGRESIVA CLÍNICA", desc: "Se acabó el adivinar los pesos. Las calculadoras de nuestra plataforma dictan el tonelaje biomecánico exacto para forzar tu adaptación.", icon: "📈" },
            { title: "BLINDAJE ARTICULAR Y TORQUE", desc: "Protocolos de corrección postural y selección biomecánica de accesorios BII para que entrenes hiper pesado sin destrozarte tendones ni ligamentos.", icon: "🛡️" },
            { title: "HIPERTROFIA DENSA Y MIOFIBRILAR", desc: "Construimos músculo funcional que mueve cargas extremas y duraderas. Despedite de la falsa hipertrofia sarcoplasmática (puro bombeo temporal).", icon: "🧱" },
            { title: "LIBERTAD DIETÉTICA ESTRATÉGICA", desc: "Tujague AI te estructura los macronutrientes, permitiendo flexibilidad sin descuidar el combustible que tu sistema nervioso exige para recuperarse.", icon: "🥩" }
          ].map((item, index) => (
            <Reveal type="up" delay={index * 100} key={index} className="bg-gradient-to-b from-[#0f0f0f] to-[#050505] p-6 rounded-2xl border border-zinc-800/80 hover:border-amber-500/30 transition-all duration-300">
              <Reveal type="pop" delay={(index * 100) + 300} className="text-3xl mb-4 bg-zinc-900 w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-800 origin-center">{item.icon}</Reveal>
              <h3 className="text-white font-black uppercase tracking-wide text-sm mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. TUJAGUE AI SYSTEM E INTERFAZ ÉLITE                     */}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 sm:py-32 bg-[#020202] border-b border-white/5 overflow-hidden transform-gpu">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_50%)] pointer-events-none transform-gpu"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
            <Reveal type="left" className="flex-1 text-center lg:text-left w-full">
               <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-6 inline-block shadow-[0_0_20px_rgba(59,130,246,0.2)]">Exclusivo Programa Élite</span>
               <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white mb-6 sm:mb-8 leading-none drop-shadow-md">SOPORTE INTELIGENTE <span className="text-blue-500 block sm:inline">24/7</span></h2>
               <p className="text-zinc-400 font-medium leading-relaxed mb-10 sm:mb-14 text-base sm:text-xl">Nuestra Mentoría incluye acceso a <strong>Tujague AI</strong>. Un sistema de inteligencia artificial entrenado con mi metodología para resolver dudas de torque, biomecánica y gestión de la fatiga al instante.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto lg:mx-0 text-left">
                  <div className="bg-[#0a0a0c] border border-zinc-800 p-6 sm:p-8 rounded-[2rem] hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300">
                     <span className="text-blue-500 text-3xl sm:text-4xl mb-4 sm:mb-6 block animate-pulse">⚙️</span>
                     <h4 className="text-white font-black text-lg sm:text-xl uppercase mb-2">Palancas y Torque</h4>
                     <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">Alineación articular y reclutamiento neuronal.</p>
                  </div>
                  <div className="bg-[#0a0a0c] border border-zinc-800 p-6 sm:p-8 rounded-[2rem] hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300">
                     <span className="text-blue-500 text-3xl sm:text-4xl mb-4 sm:mb-6 block">👨‍🍳</span>
                     <h4 className="text-white font-black text-lg sm:text-xl uppercase mb-2">Asesor Culinario</h4>
                     <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">Diseño de macros a partir de tu inventario.</p>
                  </div>
               </div>
            </Reveal>

            <Reveal type="right" delay={200} className="flex-1 w-full max-w-md mx-auto lg:mx-0">
               <div className="bg-[#050505] border border-blue-900/30 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden flex flex-col h-[450px] sm:h-[600px] w-full group hover:shadow-[0_0_100px_rgba(37,99,235,0.2)] transition-shadow duration-500">
                  <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-zinc-800/80 bg-[#0a0a0c] flex justify-between items-center z-10 backdrop-blur-md">
                     <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg sm:text-2xl shadow-inner group-hover:bg-blue-500/30 transition-colors duration-500">🤖</div>
                        <div className="min-w-0">
                           <p className="font-black text-white italic text-sm sm:text-lg tracking-tight truncate">Tujague AI System</p>
                           <p className="text-[8px] sm:text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500 animate-pulse"></span> Sistema en línea
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-[#050505] to-blue-950/10 flex flex-col justify-end overflow-hidden">
                     <div className="ml-auto w-[90%] sm:w-[85%] animate-message-in">
                        <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 text-right">Atleta</span>
                        <div className="bg-zinc-800 text-white p-4 rounded-2xl rounded-tr-sm text-xs font-medium border border-zinc-700 shadow-sm leading-relaxed break-words">Coach, al hacer Press de Banca siento que trabajo más el hombro anterior. ¿El SNC no activa el pecho?</div>
                     </div>
                     <div className="mr-auto w-[90%] sm:w-[90%] animate-message-in" style={{ animationDelay: '0.5s' }}>
                        <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1.5">Tujague AI</span>
                        <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/20 p-4 rounded-2xl rounded-tl-sm text-xs text-blue-50 border border-blue-500/30 shadow-md leading-relaxed break-words">
                           <p className="mb-2"><strong>1. Fallo Biomecánico:</strong> Si no hay retracción escapular, la orden neuronal recluta los deltoides para proteger la articulación.</p>
                           <p><strong>2. Ajuste de Torque:</strong> Deprime escápulas, cierra codos a 45° y clava los pies al piso (Leg Drive). El SNC disparará directo al pectoral.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </Reveal>
         </div>
      </section>

      {/* ========================================================= */}
      {/* 7. MANIFIESTO Y ZOOM SHARK                                */}
      {/* ========================================================= */}
      <section className="bg-[#000000] py-24 sm:py-32 relative overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[700px] lg:w-[1000px] xl:w-[1200px] h-[400px] md:h-[700px] lg:h-[1000px] xl:h-[1200px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none transform-gpu z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            
            <Reveal type="up" className="border border-amber-500/20 bg-gradient-to-b from-amber-900/20 to-[#0a0a0c] p-8 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)] backdrop-blur-sm mb-20 max-w-4xl w-full">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
                <h3 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter mb-4 mt-2 drop-shadow-lg text-balance leading-[0.95]">
                    ¿Por qué no hay planes de <span className="text-amber-500">1 MES?</span>
                </h3>
                <p className="text-zinc-300 font-medium text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6 text-balance">
                    Porque en 30 días no vas a lograr que tu Sistema Nervioso ni tus fibras musculares generen adaptaciones reales. El cuerpo es una máquina biológica, no se engaña con soluciones de "4 semanas". Esto es para quienes buscan reestructurar su fisiología sin excusas.
                </p>
            </Reveal>

            <Reveal type="up" delay={200} className="relative w-full mb-32 flex justify-center py-20 lg:py-32 z-10 overflow-visible">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] z-0 transform-gpu"></div>
                
                <div className="relative z-10 w-[300px] md:w-[350px] lg:w-[70vw] lg:max-w-[1200px] mx-auto transform-gpu" style={{ animation: 'floatPhone 6s ease-in-out infinite' }}>
                    <img src="/dashboard-analysis.png" alt="App BII-VINTAGE™" className="w-full h-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-20" />
                    
                    <div className="absolute top-[10%] lg:top-[15%] -left-8 md:-left-16 lg:-left-24 z-30 bg-black/60 backdrop-blur-md border border-amber-500/30 p-1.5 md:p-4 rounded-xl lg:rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.15)] w-max transform-gpu origin-top-right scale-[0.7] md:scale-90 lg:scale-100" style={{ animation: 'floatWidget1 5s ease-in-out infinite 0.2s' }}>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-6 h-6 md:w-10 md:h-10 xl:w-11 xl:h-11 rounded-full bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-500 text-xs md:text-lg shrink-0">⚡</div>
                            <div className="min-w-0 text-left">
                                <p className="text-[9px] md:text-[11px] lg:text-sm font-black text-amber-400 uppercase tracking-widest leading-none mb-1 lg:mb-2 truncate">Fatiga Gestionada</p>
                                <p className="text-white text-[9px] md:text-sm lg:text-xl font-bold leading-none truncate italic uppercase">Cálculo de RMs</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-[40%] lg:top-[45%] -right-8 md:-right-16 lg:-right-32 z-30 bg-black/60 backdrop-blur-md border border-zinc-700 p-1.5 md:p-4 rounded-xl lg:rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] w-max transform-gpu origin-top-right scale-[0.7] md:scale-90 lg:scale-100" style={{ animation: 'floatWidget2 7s ease-in-out infinite 0.5s' }}>
                        <div className="flex items-center gap-2 lg:gap-3 text-right">
                            <div className="min-w-0">
                                <p className="text-[9px] md:text-[11px] lg:text-sm font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lg:mb-2">Auditor Biomecánico</p>
                                <p className="text-white text-[9px] md:text-sm lg:text-xl font-bold leading-none truncate italic uppercase">IA Integrada 24/7</p>
                            </div>
                            <div className="w-6 h-6 md:w-10 md:h-10 xl:w-11 xl:h-11 rounded-full bg-zinc-800 border border-zinc-700 text-white text-xs md:text-lg shrink-0">🧠</div>
                        </div>
                    </div>

                    <div className="absolute -bottom-[5%] lg:bottom-[20%] -left-4 md:-left-8 lg:-left-20 z-30 bg-black/80 backdrop-blur-md border border-emerald-500/30 p-1.5 lg:p-3 rounded-xl lg:rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.1)] w-max scale-[0.75] md:scale-90 lg:scale-100 transform-gpu" style={{ animation: 'floatWidget3 6s ease-in-out infinite 1s' }}>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                            </span>
                            <p className="text-white text-[9px] md:text-sm font-black uppercase tracking-widest leading-none mt-0.5 lg:mt-1 truncate">SNC EN ESTADO ÓPTIMO</p>
                        </div>
                    </div>
                </div>
            </Reveal>

            <Reveal type="up" className="relative z-20 flex flex-col items-center w-full px-2">
                <div className="border border-zinc-700/80 rounded-[2rem] px-8 md:px-16 py-3 mb-6 md:mb-8 bg-black/60 backdrop-blur-sm">
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">TODO EN UNA SOLA <span className="text-white">APLICACIÓN</span></span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-lg text-balance leading-[0.95]">
                    Suscripción a la <span className="text-amber-500 block sm:inline">APP BII-VINTAGE™</span>
                </h2>
            </Reveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. EL ARSENAL COMPLETO (LA OFERTA Y VALUE STACK)          */}
      {/* ========================================================= */}
      <section className="py-24 px-4 max-w-6xl mx-auto border-b border-zinc-900/50 overflow-hidden">
        <div className="text-center mb-16">
          <Reveal type="up"><h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">El Arsenal <span className="text-amber-500">Completo</span></h2></Reveal>
          <Reveal type="up" delay={100}><p className="text-zinc-400 mt-4 max-w-2xl mx-auto text-sm">No es solo un PDF. Es un ecosistema de software y biometría diseñado para que tu cerebro y tu músculo sincronicen. (Valor Total: <span className="line-through text-zinc-600">$810 USD</span> - Hoy a una fracción).</p></Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Reveal type="left" className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl">
            <h3 className="text-amber-500 font-black tracking-widest text-xs uppercase mb-6 border-b border-zinc-800 pb-4">El Núcleo Estructural</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0 font-black border border-amber-900/30">✓</div>
                <div className="w-full">
                  <h4 className="text-white font-black uppercase text-sm mb-1 flex items-center flex-wrap gap-2">
                    Estructura Base BII (PDF 12 Semanas)
                    <span className="text-[9px] bg-green-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">Valor: $150 USD</span>
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed mt-1">El manual fundacional con las 3 fases exactas para adaptar tus tendones, reclutar masa y no freír tu sistema nervioso central.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0 font-black border border-amber-900/30">✓</div>
                <div className="w-full">
                  <h4 className="text-white font-black uppercase text-sm mb-1 flex items-center flex-wrap gap-2">
                    Mentoría Élite
                    <span className="text-[9px] bg-green-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">Valor: $300 USD</span>
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed mt-1">Acompañamiento, programación de fatiga y evolución de tu rutina más allá del ciclo inicial para garantizar una mutación perpetua.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0 font-black border border-amber-900/30">✓</div>
                <div className="w-full">
                  <h4 className="text-white font-black uppercase text-sm mb-1 flex items-center flex-wrap gap-2">
                    Calculadoras & Bóveda Biomecánica
                    <span className="text-[9px] bg-green-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">Valor: $90 USD</span>
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed mt-1">Algoritmos de tonelaje para calcular la intensidad exacta en la barra y videos privados demostrando la ejecución sin riesgo articular.</p>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal type="right" delay={200} className="bg-[#111] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <h3 className="text-amber-400 font-black tracking-widest text-xs uppercase mb-6 border-b border-zinc-800 pb-4">Tecnología de Recuperación</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-400 flex items-center justify-center shrink-0 font-black border border-amber-900/30">✦</div>
                <div className="w-full">
                  <h4 className="text-white font-black uppercase text-sm mb-1 flex items-center flex-wrap gap-2">
                    Manual RPE/RIR Neuronal
                    <span className="text-[9px] bg-green-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">Valor: $100 USD</span>
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed mt-1">La clave de la metodología. Aprende a calibrar tu esfuerzo en base a la percepción de tu SNC para nunca ir a un fallo destructivo y lesivo.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-400 flex items-center justify-center shrink-0 font-black border border-amber-900/30">✦</div>
                <div className="w-full">
                  <h4 className="text-white font-black uppercase text-sm mb-1 flex items-center flex-wrap gap-2">
                    Kit de Suplementación Clínica
                    <span className="text-[9px] bg-green-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">Valor: $50 USD</span>
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed mt-1">Descartá el marketing: Solo lo que tiene respaldo científico real para hidratar tu célula y optimizar el disparo neuromuscular.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-amber-900/20 text-amber-400 flex items-center justify-center shrink-0 font-black border border-amber-900/30">✦</div>
                <div className="w-full">
                  <h4 className="text-white font-black uppercase text-sm mb-1 flex items-center flex-wrap gap-2">
                    Botón de Pánico (Ajuste Articular)
                    <span className="text-[9px] bg-green-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">Valor: $120 USD</span>
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed mt-1">Protocolos paramétricos de reemplazo de ejercicios si presentás molestias tendinosas para no interrumpir la progresión de cargas.</p>
                </div>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. COMPARATIVA Y FILTRO NEUROLÓGICO (CLOSER MODE)           */}
      {/* ========================================================= */}
      <section className="py-20 px-4 max-w-5xl mx-auto border-b border-white/5 overflow-hidden">
        <Reveal type="up"><h2 className="text-3xl md:text-4xl font-black italic text-center mb-12 uppercase tracking-tighter text-white">La Verdad sobre el <span className="text-amber-500">Estancamiento</span></h2></Reveal>
        
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <Reveal type="left" className="bg-[#111] border border-zinc-800 p-8 rounded-3xl opacity-80">
            <h3 className="text-zinc-500 font-black tracking-widest text-sm uppercase mb-6 text-center">Entrenamiento Genérico (El Problema)</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-zinc-500 text-sm font-medium"><span className="text-red-900 font-black">✕</span> Entrenar al fallo todos los días friendo el Sistema Nervioso Central (SNC) por completo.</li>
              <li className="flex items-start gap-3 text-zinc-500 text-sm font-medium"><span className="text-red-900 font-black">✕</span> Realizar 20 series por músculo de "volumen basura" que no genera estrés mecánico real, solo inflamación.</li>
              <li className="flex items-start gap-3 text-zinc-500 text-sm font-medium"><span className="text-red-900 font-black">✕</span> Cambiar la rutina semanalmente ignorando la sobrecarga progresiva y el principio de adaptación.</li>
            </ul>
          </Reveal>

          <Reveal type="right" delay={200} className="bg-gradient-to-b from-[#1a1005] to-[#0a0a0a] border border-amber-900/50 p-8 rounded-3xl relative shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full"></div>
            <h3 className="text-amber-500 font-black tracking-widest text-sm uppercase mb-6 text-center">Tecnología Clínica Tujague (La Solución)</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><span className="text-amber-500 font-black">✓</span> Gestión milimétrica de la fatiga neuronal (RPE) para que el músculo crezca mientras el SNC se reinicia.</li>
              <li className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><span className="text-amber-500 font-black">✓</span> Selección biomecánica de ejercicios BII y aumento matemático de las cargas semana a semana.</li>
              <li className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><span className="text-amber-500 font-black">✓</span> Estructura predictiva: tu cerebro dominará el movimiento, permitiéndote reclutar el 100% de tus fibras.</li>
            </ul>
          </Reveal>
        </div>

        <Reveal type="up" className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 bg-[#080808] p-8 md:p-12 rounded-[2.5rem] border border-zinc-900">
          <div>
            <h3 className="text-white font-black uppercase tracking-tight text-xl mb-6 border-b border-zinc-800 pb-4">Aplica si cumples esto:</h3>
            <ul className="space-y-4 text-sm text-zinc-400 font-medium">
              <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Tienes al menos 6 meses entrenando básicos.</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Entiendes que el progreso requiere registro de cargas.</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Buscas un cambio en tu sistema neuromuscular que perdure, no una bomba pasajera.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-zinc-600 font-black uppercase tracking-tight text-xl mb-6 border-b border-zinc-800 pb-4">Cierra esta página si:</h3>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li className="flex items-center gap-2"><span className="text-red-900">✕</span> Buscas atajos, rutinas mágicas o crees que hacer 30 series por músculo te hace más hombre.</li>
              <li className="flex items-center gap-2"><span className="text-red-900">✕</span> Tu ego de gimnasio te impide bajar los pesos de la barra para corregir tu biomecánica desastrosa.</li>
              <li className="flex items-center gap-2"><span className="text-red-900">✕</span> Vas a comprar la Bóveda para dejar el PDF tirado en tu carpeta de descargas sin ir a sudar bajo la barra. Esto es solo para los que ejecutan.</li>
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ========================================================= */}
      {/* 10. PRECIOS Y CHECKOUT                                    */}
      {/* ========================================================= */}
      <Reveal type="up">
        <PricingV2 onSelectPlan={handleSelectPlan} />
      </Reveal>

      <section id="checkout-final" className="relative z-10 pt-20 sm:pt-32 pb-32 sm:pb-48 px-4 sm:px-6 bg-[#000000] border-t border-white/5 overflow-hidden">
        <Reveal type="up" className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-4 lg:mb-6 inline-block">Último Paso</span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic mb-6 tracking-tighter text-white drop-shadow-md">FINALIZAR <span className="text-amber-500">INSCRIPCIÓN</span></h2>
            <p className="text-zinc-400 text-sm sm:text-lg font-medium tracking-wide max-w-xl mx-auto">Completá tus datos para recibir acceso inmediato al panel de entrenamiento biomecánico.</p>
          </div>
          
          {selectedPlan ? (
            <div className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden pb-12 lg:pb-0 backdrop-blur-2xl animate-fade-in-scale">
              <div className={`absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none -mr-40 -mt-40 transform-gpu ${selectedPlan?.id.startsWith('static') || selectedPlan?.id.startsWith('mesociclo') ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_60%)]' : 'bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_60%)]'}`}></div>
              
              <div className="p-4 sm:p-6 bg-[#050505] border-b border-zinc-800 flex justify-between items-center relative z-20">
                 <button onClick={() => { setSelectedPlan(null); scrollToPricing(); }} className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">← Cancelar Selección</button>
                 <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-amber-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">🏠 Volver al Inicio</button>
              </div>

              <CheckoutClient selectedPlan={selectedPlan} extraVideo={false} extraPrice={0} />
            </div>
          ) : (
            <div className="text-center p-12 sm:p-24 md:p-32 border-2 border-dashed border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] bg-[#0a0a0c] shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#050505] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-zinc-800">
                 <svg className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </div>
              <p className="text-lg sm:text-2xl font-black text-zinc-500 italic tracking-tighter uppercase">SELECCIONÁ UN PLAN ARRIBA PARA CONTINUAR</p>
            </div>
          )}
        </Reveal>
      </section>

      {/* ========================================================= */}
      {/* 11. PREGUNTAS FRECUENTES Y FOOTER                         */}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 lg:py-32 px-4 sm:px-6 bg-[#050505] border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
               <Reveal type="left" className="lg:col-span-5 text-center lg:text-left sticky top-32">
                  <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white mb-4 drop-shadow-md">PREGUNTAS <span className="text-amber-500 block">FRECUENTES</span></h2>
                  <p className="text-zinc-400 font-medium text-sm lg:text-base mb-8">Resolvé tus dudas antes de aplicar. La disciplina requiere que la mente entienda la base científica del proceso.</p>
                  
                  <div className="hidden lg:flex items-center gap-4 bg-[#0a0a0c] p-6 rounded-2xl border border-zinc-800">
                     <span className="text-3xl">💬</span>
                     <div>
                        <p className="text-white font-bold text-sm">¿Tenés otra duda sobre biomecánica o el programa?</p>
                        <a href={whatsappUrl} target="_blank" className="text-amber-500 text-xs font-black uppercase tracking-widest hover:text-amber-400 transition-colors">Contactar al Coach</a>
                     </div>
                  </div>
               </Reveal>

               <div className="lg:col-span-7 space-y-4 lg:space-y-6">
                  {FAQS.map((faq, i) => (
                     <Reveal type="up" delay={i * 100} key={i} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:border-amber-500/30 shadow-sm">
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 lg:px-8 py-5 lg:py-6 text-left flex justify-between items-center focus:outline-none hover:bg-[#050505] transition-colors">
                           <span className="font-black text-white italic tracking-tight text-sm lg:text-lg pr-6 leading-snug">{faq.q}</span>
                           <span className={`text-amber-500 font-black text-lg lg:text-xl transition-transform duration-500 ${openFaq === i ? 'rotate-180 text-amber-400' : ''}`}>▼</span>
                        </button>
                        <div className={`px-6 lg:px-8 overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-60 pb-6 lg:pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <p className="text-zinc-400 text-xs lg:text-sm leading-relaxed font-medium pt-4 lg:pt-6 border-t border-zinc-800/80">{faq.a}</p>
                        </div>
                     </Reveal>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-50 pt-20 lg:pt-24 pb-28 lg:pb-20 border-t border-white/10 bg-[#000000] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-center md:text-left">
          <div className="space-y-4 lg:space-y-6">
             <Link href="/" className="font-black text-3xl italic text-white tracking-tighter hover:opacity-80 transition-opacity inline-block">TUJAGUE <span className="text-amber-500">STRENGTH</span></Link>
             <p className="text-zinc-500 text-xs lg:text-sm italic tracking-tight font-medium leading-relaxed max-w-sm mx-auto md:mx-0">"La fatiga oculta el progreso. Optimizamos tu SNC, aplicamos biomecánica de élite y revelamos tu fuerza real."</p>
             <p className="text-zinc-600 text-[9px] lg:text-[10px] tracking-[0.3em] font-black uppercase mt-6 lg:mt-8 border-t border-zinc-800/50 pt-6">&copy; {new Date().getFullYear()} Luciano Tujague.</p>
          </div>
          <div className="flex flex-col gap-4 lg:gap-6 items-center md:items-start">
             <h4 className="text-amber-500 font-black tracking-[0.2em] text-[10px] lg:text-xs border-b border-amber-500/20 pb-2 lg:pb-3 uppercase">Contacto Directo</h4>
             <div className="flex flex-col gap-3 lg:gap-4 text-xs lg:text-sm font-bold text-white tracking-wide">
                <a href="mailto:luciano2004tujague20@gmail.com" className="hover:text-amber-400 transition-colors flex items-center gap-3"><span className="text-lg">✉️</span> Email Oficial</a>
                <a href="https://www.instagram.com/tujague.luciano/" target="_blank" className="hover:text-amber-400 transition-colors flex items-center gap-3"><span className="text-lg">📱</span> Instagram</a>
                <a href={whatsappUrl} target="_blank" className="hover:text-amber-400 transition-colors flex items-center gap-3"><span className="text-lg">💬</span> WhatsApp</a>
             </div>
          </div>
          <div className="flex flex-col gap-4 lg:gap-6 items-center md:items-start">
             <h4 className="text-amber-500 font-black tracking-[0.2em] text-[10px] lg:text-xs border-b border-amber-500/20 pb-2 lg:pb-3 uppercase">Enlaces Legales</h4>
             <div className="flex flex-col gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-black tracking-widest text-zinc-500">
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Términos y Condiciones</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Política de Privacidad</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Baja del Servicio</Link>
                <Link href="/admin/login" className="text-zinc-600 hover:text-amber-500 transition-colors uppercase mt-4 lg:mt-6 bg-[#0a0a0c] px-4 py-2 rounded-xl text-center inline-block border border-zinc-800">Acceso Entrenador 🔒</Link>
             </div>
          </div>
        </div>
      </footer>

      {/* ─── ESTILOS CSS PUROS (Para Shimmer, Vibración y Entradas) ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.8); }
        
        @keyframes floatPhone { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes floatWidget1 { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
        @keyframes floatWidget2 { 0%, 100% { transform: translateY(0px) rotate(2deg); } 50% { transform: translateY(-15px) rotate(-1deg); } }
        @keyframes floatWidget3 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }

        /* Efecto Shimmer para botones principales */
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }

        /* Vibración del Botón Flotante en Móviles (Cada 5 segs) */
        @keyframes pulseMobile {
          0%, 100% { transform: scale(1); }
          5% { transform: scale(1.05); }
          10% { transform: scale(0.95); }
          15% { transform: scale(1.02); }
          20% { transform: scale(1); }
        }
        @media (max-width: 768px) {
          .mobile-vibrate { animation: pulseMobile 5s infinite; }
        }

        /* Animaciones exclusivas del Bot */
        @keyframes botOpen {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bot-open { animation: botOpen 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes messageIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-message-in { animation: messageIn 0.3s ease-out forwards; }

        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fadeInScale 0.5s ease-out forwards; }
      `}} />
    </main>
  );
}