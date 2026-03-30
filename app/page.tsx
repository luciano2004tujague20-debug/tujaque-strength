"use client";

import React, { useState, useEffect, useRef } from "react";
import CheckoutClient from "./components/CheckoutClient";
import PricingV2, { PricingPlan } from "@/components/PricingV2";
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
      className={`transition-all duration-700 ease-out will-change-transform transform-gpu ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const FAQS = [
  { q: "¿Por qué el mínimo de la Mentoría son 3 meses y no se cobra mensual?", a: "Nadie construye fuerza real ni hipertrofia en 4 semanas. El modelo de suscripción mensual invita a rendirse a la primera molestia. Al comprometerte 90, 180 o 365 días, filtrás tus propias excusas. Si solo querés probar, tenés la Bóveda Estática." },
  { q: "¿Qué diferencia el plan de 6 Meses del de 3 Meses?", a: "El software (Dashboard y Tujague AI) es exactamente el mismo. La diferencia es mi tiempo personal. En el plan de 6 meses (El más elegido) se te habilita una línea directa a mi WhatsApp de Lunes a Viernes para dudas rápidas y correcciones urgentes, además de una Clínica Biomecánica por videollamada al inicio." },
  { q: "¿Sirve si entreno 3 días a la semana o en un Home Gym?", a: "Es lo ideal. El BII-Vintage se basa en entrenamientos breves, infrecuentes y de intensidad absoluta. Crecés cuando descansás, no sumando horas en el gimnasio. Si tenés una barra, discos y un rack, podés mutar." },
  { q: "¿Necesito ser un atleta avanzado para aplicar a la Mentoría?", a: "No. De hecho, si sos principiante es mejor, porque evitamos que construyas vicios técnicos desde cero. Nos enfocamos 100% en tu técnica y torque antes de meter carga pesada." },
  { q: "¿Cómo funcionan los pagos en Pesos, Dólares o Cripto?", a: "El precio oficial está anclado en Dólares, pero podés pagar en Pesos Argentinos (ARS) a través de Mercado Pago (Tarjetas o Saldo) al tipo de cambio del día. También aceptamos pagos internacionales vía Stripe y transferencias directas en Criptomonedas (USDT/BTC)." }
];

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  
  const [topAthletes, setTopAthletes] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true); 
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  // 🔥 REFERENCIAS OPTIMIZADAS (CERO LAG) 🔥
  const navRef = useRef<HTMLElement>(null);
  
  // 🔥 CEREBRO DE LA LÍNEA DE TIEMPO (COLISIÓN PERFECTA) 🔥
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
          
          // 1. Efecto Navbar
          if (navRef.current) {
            const intensity = Math.min(scrollY / 400, 0.98); 
            navRef.current.style.backgroundColor = `rgba(5, 5, 5, ${intensity})`;
            navRef.current.style.borderBottom = `1px solid rgba(255, 255, 255, ${intensity * 0.1})`;
            const padding = intensity > 0.5 ? '0.5rem' : '1.5rem';
            navRef.current.style.paddingTop = padding;
            navRef.current.style.paddingBottom = padding;
            navRef.current.style.boxShadow = intensity > 0.5 ? '0 10px 30px rgba(245,158,11,0.05)' : 'none';
          }

          // 2. Línea de Tiempo con Sincronización Píxel por Píxel
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
              if (card) {
                if (pixelsScrolled >= card.offsetTop + 20) {
                  currentActive = index;
                }
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

  const [botMessages, setBotMessages] = useState<{role: string, content: string}[]>([
      { role: "assistant", content: "¡Bienvenido! Soy el Asesor Experto de Tujague Strength. ¿Querés que te explique cómo funciona la plataforma web o qué incluye la Mentoría VIP?" }
  ]);
  const [botInput, setBotInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [pulseLive, setPulseLive] = useState(false);
  const botEndRef = useRef<HTMLDivElement>(null);

  const fetchTopAthletes = async () => {
    try {
        const { data, error } = await supabase
          .from('orders')
          .select('customer_name, rm_squat, rm_bench, rm_deadlift, rm_dips, rm_military')
          .eq('sub_status', 'active');
          
        if (error) throw error;
          
        if (data) {
           const ranked = data.map((athlete: any) => {
              const sq = parseInt(athlete.rm_squat) || 0;
              const bp = parseInt(athlete.rm_bench) || 0;
              const dl = parseInt(athlete.rm_deadlift) || 0;
              const dp = parseInt(athlete.rm_dips) || 0;
              const mp = parseInt(athlete.rm_military) || 0;
              const total = sq + bp + dl + dp + mp;
              
              const nameParts = athlete.customer_name.split(' ');
              const safeName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length -1].charAt(0)}.` : nameParts[0];

              return { name: safeName, total, squat: sq, bench: bp, deadlift: dl, dips: dp, military: mp };
           }).filter(a => a.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

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
    const channel = supabase.channel('realtime-muro-fama')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
          fetchTopAthletes();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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
    <main className="min-h-screen relative overflow-x-hidden bg-[#000000] text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* ─── FONDO ÉPICO ─── */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/hero.png" 
          alt="Background"
          fill
          className="object-cover opacity-[0.08] hidden md:block transform-gpu"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/95 via-[#000000]/95 to-[#000000] z-10 transform-gpu"></div>
      </div>
      
      {/* ─── NAVBAR FLOTANTE OPTIMIZADO ─── */}
      <nav 
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform-gpu"
        style={{ backgroundColor: 'transparent', padding: '1.5rem 0' }}
      >
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

      {/* ─── BOTONES FLOTANTES ─── */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        className="fixed bottom-24 md:bottom-6 right-4 md:right-8 z-[100] bg-amber-500 p-4 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-110 transition-transform active:scale-95 group border border-amber-400 transform-gpu"
      >
        <span className="absolute -top-12 right-0 bg-[#0a0a0c] border border-zinc-800 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hablá con Luciano
        </span>
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.097 0-4.142-.547-5.946-1.588L0 .057zm12.026-2.137c1.892 0 3.738-.503 5.339-1.455l.382-.227 3.97 1.041-1.059-3.869.25-.397c1.046-1.666 1.599-3.593 1.599-5.606 0-5.833-4.744-10.577-10.577-10.577-2.827 0-5.483 1.1-7.481 3.098s-3.098 4.654-3.098 7.481c0 2.013.553 3.94 1.599 5.606l.25.397-1.059 3.869 4.074-1.069.382.227c1.6.952 3.447 1.455 5.339 1.455z"/></svg>
      </a>

      <div className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[100] transform-gpu">
         {!isBotOpen ? (
            <button 
               onClick={() => setIsBotOpen(true)}
               className="bg-[#0a0a0c] border border-amber-500/50 w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform flex items-center justify-center relative group backdrop-blur-md"
            >
               <span className="absolute -top-12 left-0 bg-[#0a0a0c] border border-zinc-800 text-amber-400 text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                 Consultas
               </span>
               <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-500 border-2 border-zinc-900 rounded-full animate-pulse"></span>
               <svg className="w-8 h-8 sm:w-9 sm:h-9 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </button>
         ) : (
            <div className="bg-[#0a0a0c]/95 border border-zinc-800 w-[90vw] max-w-[380px] h-[500px] max-h-[75vh] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 backdrop-blur-xl transform-gpu">
               <div className="bg-zinc-900/80 border-b border-zinc-800 p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/10 blur-2xl transform-gpu"></div>
                  <div className="flex items-center gap-3 relative z-10">
                     <span className="text-2xl drop-shadow-md">🤖</span>
                     <div>
                        <h4 className="font-black italic text-sm text-white leading-none">Asesor <span className="text-amber-500">Comercial</span></h4>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Tujague Strength</span>
                     </div>
                  </div>
                  <button onClick={() => setIsBotOpen(false)} className="text-zinc-500 hover:text-white relative z-10 transition-colors text-xl p-1">✕</button>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/40">
                  {botMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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
                  <input 
                     type="text" 
                     value={botInput}
                     onChange={(e) => setBotInput(e.target.value)}
                     placeholder="Escribe tu consulta aquí..."
                     className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-xs sm:text-sm text-white outline-none focus:border-amber-500 transition-colors shadow-inner"
                     disabled={isBotTyping}
                  />
                  <button 
                     type="submit" 
                     disabled={isBotTyping || !botInput.trim()}
                     className="bg-amber-500 text-black w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-amber-400 transition-all font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
                  >
                     ↑
                  </button>
               </form>
            </div>
         )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#000000]/95 backdrop-blur-xl border-t border-white/10 p-4 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-8 transform-gpu">
         <button 
            onClick={scrollToPricing}
            className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2"
         >
            Aplicar Ahora 🚀
         </button>
      </div>

      {/* ========================================================= */}
      {/* 1. HERO SECTION (GANCHO MENTAL)                           */}
      {/* ========================================================= */}
      <RevealOnScroll delay={100}>
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden transform-gpu">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_50%)] pointer-events-none transform-gpu"></div>

          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center mt-10 md:mt-20">
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> EL MÉTODO BII-VINTAGE
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-black italic text-white uppercase tracking-tighter drop-shadow-lg leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              FORJÁ UN FÍSICO BRUTAL Y UNA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">MENTE INQUEBRANTABLE.</span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              El 90% fracasa por exceso de volumen basura y debilidad mental. Dejá de ser un espectador, dominá tu sistema nervioso y destrabá tu fuerza genética entrenando menos días, pero con intensidad real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <button 
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black px-10 py-5 md:py-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(245,158,11,0.4)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border border-amber-200"
              >
                INICIAR MI TRANSFORMACIÓN <span className="text-lg">➔</span>
              </button>
              
              <button 
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-[#0a0a0c]/80 hover:bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-white px-10 py-5 md:py-6 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center backdrop-blur-md"
              >
                VER ESTRUCTURAS BII
              </button>
            </div>

          </div>
        </section>
      </RevealOnScroll>

      {/* ========================================================= */}
      {/* 1.5 MURO DE LA FAMA (Datos Reales)                        */}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 sm:py-32 bg-[#000000] border-b border-white/5 overflow-hidden transform-gpu">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_60%)] pointer-events-none transform-gpu"></div>
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
               <div className="text-center mb-12 sm:mb-20">
                  <span className={`bg-red-500/10 border border-red-500/30 text-red-500 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-6 inline-flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] ${pulseLive ? 'scale-110 shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'animate-pulse'}`}>
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></span> Datos en Vivo
                  </span>
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic text-white tracking-tighter uppercase mb-4 sm:mb-6 mt-2 drop-shadow-lg">
                      EL MURO DE LA <span className="text-amber-500">FUERZA</span>
                  </h2>
                  <p className="text-zinc-400 text-sm sm:text-base font-medium px-4">Clasificación en tiempo real de la Fuerza Absoluta de la Tropa (Los 5 Básicos)</p>
               </div>

               {loadingLeaderboard ? (
                  <div className="bg-[#0a0a0c] border border-zinc-800 rounded-[3rem] p-20 text-center flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                     <span className="w-12 h-12 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin"></span>
                     <p className="text-zinc-400 text-lg italic font-bold">Sincronizando con los servidores de BII-Vintage...</p>
                  </div>
               ) : topAthletes.length > 0 ? (
                  <div className="bg-[#0a0a0c]/80 border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.05)] backdrop-blur-2xl overflow-x-auto custom-scrollbar">
                     <div className="min-w-[800px] sm:min-w-[1000px]">
                         <div className="grid grid-cols-8 text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-500 px-6 pb-4 sm:pb-6 border-b border-zinc-800/80 mb-4 sm:mb-6">
                            <div className="col-span-2">Atleta Activo</div>
                            <div className="text-center">Sentadilla</div>
                            <div className="text-center">Banca</div>
                            <div className="text-center">P. Muerto</div>
                            <div className="text-center">Fondos</div>
                            <div className="text-center">Militar</div>
                            <div className="text-center text-amber-400">Puntaje Total</div>
                         </div>
                         
                         <div className="space-y-3 sm:space-y-4">
                            {topAthletes.map((athlete, idx) => (
                               <div key={idx} className={`grid grid-cols-8 items-center p-4 sm:px-6 sm:py-6 rounded-2xl sm:rounded-3xl transition-all duration-500 animate-in slide-in-from-bottom-${idx*4} ${idx === 0 ? 'bg-gradient-to-r from-amber-950/40 to-[#0a0a0c] border border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)] scale-[1.01] z-10 relative' : idx === 1 ? 'bg-zinc-900/80 border border-zinc-700' : idx === 2 ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-black/40 border border-white/5 hover:border-zinc-700'}`}>
                                  <div className="col-span-2 flex items-center gap-4 sm:gap-5">
                                     <span className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-lg shadow-inner shrink-0 ${idx === 0 ? 'bg-amber-500 text-black shadow-amber-500' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-[#0a0a0c] border border-zinc-800 text-zinc-400'}`}>
                                        {idx === 0 ? '👑' : `#${idx + 1}`}
                                     </span>
                                     <span className={`font-black italic uppercase tracking-tight truncate ${idx === 0 ? 'text-amber-400 text-xl sm:text-3xl' : 'text-white text-lg sm:text-xl'}`}>{athlete.name}</span>
                                  </div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.squat} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.bench} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.deadlift} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.dips} kg</div>
                                  <div className="text-center text-zinc-400 font-mono text-sm sm:text-lg">{athlete.military} kg</div>
                                  <div className={`text-center font-black ${idx === 0 ? 'text-amber-400 text-2xl sm:text-4xl drop-shadow-md' : 'text-zinc-200 text-xl sm:text-2xl'}`}>
                                     {athlete.total} kg
                                  </div>
                               </div>
                            ))}
                         </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-[#0a0a0c] border border-zinc-800 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-sm shadow-inner">
                     <span className="text-6xl mb-2 drop-shadow-md">👑</span>
                     <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl md:text-3xl">AÚN NO HAY RÉCORDS REGISTRADOS</h3>
                     <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md mx-auto">Ingresá a tu Dashboard, registrá tus RMs y convertite en el primer líder histórico del muro BII-Vintage.</p>
                  </div>
               )}
            </div>
         </RevealOnScroll>
      </section>

      {/* ========================================================= */}
      {/* 2. EL LEGADO Y LA METODOLOGÍA (TIMELINE DINÁMICA PERFECTA)*/}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 overflow-hidden bg-[#050505] border-b border-white/5 transform-gpu">
        <RevealOnScroll>
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-4">
                 EL CAMINO DEL <span className="text-amber-500">MUTANTE</span>
               </h2>
               <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl mx-auto uppercase tracking-widest">
                 De la frustración genética a la maestría biomecánica.
               </p>
            </div>

            {/* 🔥 CONTENEDOR DE LA LÍNEA DE TIEMPO 🔥 */}
            <div ref={timelineRef} className="relative max-w-5xl mx-auto mb-32 pb-10">
              
              {/* LÍNEA GRIS (FONDO) */}
              <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-1 bg-zinc-900 md:-translate-x-1/2 rounded-full"></div>
              
              {/* LÍNEA DE FUEGO (SE LLENA EXACTO AL BAJAR) */}
              <div 
                ref={timelineLineRef} 
                className="absolute left-[24px] md:left-1/2 top-0 w-1 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-500 md:-translate-x-1/2 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)] transition-all duration-75 ease-out z-0" 
                style={{ height: '0%' }}
              ></div>

              {/* HITO 1 */}
              <div ref={(el) => { cardsRef.current[0] = el; }} className="relative flex flex-col md:flex-row items-center justify-between mb-16 group">
                 <div className={`absolute left-[24px] md:left-1/2 w-6 h-6 border-4 rounded-full md:-translate-x-1/2 transition-all duration-300 z-10 mt-6 md:mt-0 ${activeCard >= 0 ? 'border-amber-500 bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-125' : 'bg-[#050505] border-zinc-700'}`}></div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-0 md:text-right md:pr-12 pt-4 md:pt-0">
                    <span className={`font-black text-xs uppercase tracking-widest block mb-2 transition-colors duration-300 ${activeCard >= 0 ? 'text-amber-500' : 'text-zinc-500'}`}>01. La Frustración</span>
                    <h3 className={`text-2xl font-black italic uppercase mb-4 transition-colors duration-300 ${activeCard >= 0 ? 'text-white' : 'text-zinc-400'}`}>EL INFIERNO DE LOS 6 AÑOS PERDIDOS</h3>
                 </div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-12 mt-2 md:mt-0">
                    <div className={`border p-6 sm:p-8 rounded-[2rem] transition-all duration-500 ${activeCard >= 0 ? 'border-amber-500/50 bg-zinc-900 shadow-[0_10px_30px_rgba(245,158,11,0.15)] scale-[1.02]' : 'bg-[#0a0a0c] border-zinc-800 shadow-sm'}`}>
                       <p className={`text-sm leading-relaxed transition-colors duration-300 ${activeCard >= 0 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                         Empecé a los 15, flaco y sin rumbo. Creí que "más era mejor" y entrenaba 6 días a la semana, hasta 4 horas por día, comiendo cualquier cosa y sin técnica. Estuve 6 años estancado en el mismo físico, cansado e ignorante. Perdí mi juventud adivinando, hasta que casi toqué fondo.
                       </p>
                    </div>
                 </div>
              </div>

              {/* HITO 2 */}
              <div ref={(el) => { cardsRef.current[1] = el; }} className="relative flex flex-col md:flex-row-reverse items-center justify-between mb-16 group">
                 <div className={`absolute left-[24px] md:left-1/2 w-6 h-6 border-4 rounded-full md:-translate-x-1/2 transition-all duration-300 z-10 mt-6 md:mt-0 ${activeCard >= 1 ? 'border-amber-500 bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-125' : 'bg-[#050505] border-zinc-700'}`}></div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-12 pt-4 md:pt-0 text-left">
                    <span className={`font-black text-xs uppercase tracking-widest block mb-2 transition-colors duration-300 ${activeCard >= 1 ? 'text-amber-500' : 'text-zinc-500'}`}>02. El Hallazgo</span>
                    <h3 className={`text-2xl font-black italic uppercase mb-4 transition-colors duration-300 ${activeCard >= 1 ? 'text-white' : 'text-zinc-400'}`}>EL DESPERTAR DEL HIGH INTENSITY</h3>
                 </div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-0 md:pr-12 mt-2 md:mt-0">
                    <div className={`border p-6 sm:p-8 rounded-[2rem] transition-all duration-500 ${activeCard >= 1 ? 'border-amber-500/80 bg-gradient-to-br from-zinc-900 to-[#0a0a0c] shadow-[0_10px_40px_rgba(245,158,11,0.2)] scale-[1.02]' : 'bg-[#0a0a0c] border-zinc-800 shadow-sm'}`}>
                       <p className={`text-sm leading-relaxed font-medium transition-colors duration-300 ${activeCard >= 1 ? 'text-amber-50' : 'text-zinc-500'}`}>
                         Reflexioné: ¿Por qué entrenar como un culturista con química si yo soy natural y tengo que trabajar? Descubrí y adapté el Heavy Duty a la era moderna. Prioricé técnica, tempos quirúrgicos y llevé cada serie al RIR 0. El avance fue abismal: salté a <span className="font-bold text-amber-400">152kg en sentadilla</span> y <span className="font-bold text-amber-400">+60kg en fondos</span>. Descubrí el verdadero poder de la intensidad.
                       </p>
                    </div>
                 </div>
              </div>

              {/* HITO 3 */}
              <div ref={(el) => { cardsRef.current[2] = el; }} className="relative flex flex-col md:flex-row items-center justify-between mb-16 group">
                 <div className={`absolute left-[24px] md:left-1/2 w-6 h-6 border-4 rounded-full md:-translate-x-1/2 transition-all duration-300 z-10 mt-6 md:mt-0 ${activeCard >= 2 ? 'border-amber-500 bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-125' : 'bg-[#050505] border-zinc-700'}`}></div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-0 md:text-right md:pr-12 pt-4 md:pt-0">
                    <span className={`font-black text-xs uppercase tracking-widest block mb-2 transition-colors duration-300 ${activeCard >= 2 ? 'text-amber-500' : 'text-zinc-500'}`}>03. El Sistema</span>
                    <h3 className={`text-2xl font-black italic uppercase mb-4 transition-colors duration-300 ${activeCard >= 2 ? 'text-white' : 'text-zinc-400'}`}>RESULTADOS GARANTIZADOS</h3>
                 </div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-12 mt-2 md:mt-0">
                    <div className={`border p-6 sm:p-8 rounded-[2rem] transition-all duration-500 ${activeCard >= 2 ? 'border-amber-500/50 bg-zinc-900 shadow-[0_10px_30px_rgba(245,158,11,0.15)] scale-[1.02]' : 'bg-[#0a0a0c] border-zinc-800 shadow-sm'}`}>
                       <p className={`text-sm leading-relaxed transition-colors duration-300 ${activeCard >= 2 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                         Creé Tujague Strength para salvarte de años de perder el tiempo con rutinas inútiles. Te enseño a priorizar la conexión mente-músculo y la técnica sobre la carga. En mis entrenamientos vas a sufrir dolor verdadero, pero te garantizo que va a valer la pena. Dejá de adivinar y empezá a mutar.
                       </p>
                    </div>
                 </div>
              </div>

              {/* HITO 4: EL COACH Y TUS RMS */}
              <div ref={(el) => { cardsRef.current[3] = el; }} className="relative flex flex-col md:flex-row items-center justify-between group mt-24">
                 <div className={`absolute left-[24px] md:left-1/2 w-8 h-8 border-4 rounded-full md:-translate-x-1/2 transition-all duration-500 z-10 flex items-center justify-center mt-6 md:mt-0 ${activeCard >= 3 ? 'border-amber-500 bg-[#050505] shadow-[0_0_40px_rgba(245,158,11,1)] scale-125' : 'bg-[#050505] border-zinc-700'}`}>
                   <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeCard >= 3 ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'}`}></div>
                 </div>
                 
                 <div className="w-full md:w-5/12 pl-16 md:pl-0 md:pr-12 pt-4 md:pt-0 flex justify-center md:justify-end">
                    <div className={`relative w-[280px] h-[380px] sm:w-[350px] sm:h-[450px] flex-shrink-0 transition-all duration-700 ${activeCard >= 3 ? 'scale-[1.02]' : 'scale-95 opacity-50 grayscale'}`}>
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
                    <div className={`text-left min-w-0 max-w-full transition-all duration-700 ${activeCard >= 3 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-8'}`}>
                      <span className="text-amber-500 font-black tracking-[0.2em] text-[10px] sm:text-xs mb-4 inline-block uppercase border-b border-amber-500/30 pb-2">Resultados Innegables</span>
                      
                      <h2 className="text-4xl sm:text-5xl font-black mb-6 italic tracking-tighter text-white leading-[0.9] drop-shadow-md">
                         SOPORTA EL<br/>
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-700 block mt-2">DOLOR.</span>
                      </h2>
                      
                      <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium mb-8">
                        Aplico la metodología <strong className="text-white">BII-VINTAGE</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica y la gestión absoluta de la fatiga.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {[
                          { v: "+152 KG", l: "Squat" },
                          { v: "+110 KG", l: "Banca" },
                          { v: "+100 KG", l: "Deadlift" },
                          { v: "+60 KG", l: "Militar" }
                        ].map((stat, i) => (
                          <div key={i} className={`p-4 rounded-2xl border transition-all duration-500 shadow-sm ${activeCard >= 3 ? 'bg-[#0a0a0c] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#050505] border-zinc-800'}`}>
                             <p className={`font-black text-2xl italic leading-none drop-shadow-md transition-colors duration-500 ${activeCard >= 3 ? 'text-amber-500' : 'text-zinc-600'}`}>{stat.v}</p>
                             <p className="text-[9px] text-zinc-500 font-black tracking-widest mt-1 uppercase">{stat.l}</p>
                          </div>
                        ))}
                        <div className={`p-4 rounded-2xl border transition-all duration-500 shadow-sm col-span-2 text-center ${activeCard >= 3 ? 'bg-[#0a0a0c] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#050505] border-zinc-800'}`}>
                           <p className={`font-black text-2xl italic leading-none drop-shadow-md transition-colors duration-500 ${activeCard >= 3 ? 'text-amber-500' : 'text-zinc-600'}`}>+60 KG</p>
                           <p className="text-[9px] text-zinc-500 font-black tracking-widest mt-1 uppercase">Fondos (Rumbo a 100kg)</p>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

            </div>

          </div>
        </RevealOnScroll>
      </section>

      {/* ========================================================= */}
      {/* 5. TUJAGUE AI SYSTEM                                      */}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 sm:py-32 bg-[#020202] border-b border-white/5 overflow-hidden transform-gpu">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_50%)] pointer-events-none transform-gpu"></div>
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
               
               <div className="flex-1 text-center lg:text-left w-full">
                  <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-6 inline-block shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      Exclusivo Programa Élite
                  </span>
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter text-white mb-6 sm:mb-8 leading-none drop-shadow-md">
                      SOPORTE INTELIGENTE <span className="text-blue-500 block sm:inline">24/7</span>
                  </h2>
                  <p className="text-zinc-400 font-medium leading-relaxed mb-10 sm:mb-14 text-base sm:text-xl">
                      Nuestra Mentoría incluye acceso a <strong>Tujague AI</strong>. Un sistema de inteligencia artificial entrenado con mi metodología para resolver dudas estructurales, nutricionales y de biomecánica al instante.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto lg:mx-0 text-left">
                     <div className="bg-[#0a0a0c] border border-zinc-800 p-6 sm:p-8 rounded-[2rem] hover:border-blue-500/30 transition-colors">
                        <span className="text-blue-500 text-3xl sm:text-4xl mb-4 sm:mb-6 block">⚙️</span>
                        <h4 className="text-white font-black text-lg sm:text-xl uppercase mb-2">Palancas y Torque</h4>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">Ajustes de Leg Drive y Bracing</p>
                     </div>
                     <div className="bg-[#0a0a0c] border border-zinc-800 p-6 sm:p-8 rounded-[2rem] hover:border-blue-500/30 transition-colors">
                        <span className="text-blue-500 text-3xl sm:text-4xl mb-4 sm:mb-6 block">👨‍🍳</span>
                        <h4 className="text-white font-black text-lg sm:text-xl uppercase mb-2">Asesor Culinario</h4>
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">Diseño nutricional a partir de tu inventario.</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
                  <div className="bg-[#050505] border border-blue-900/30 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden flex flex-col h-[450px] sm:h-[600px] w-full">
                     <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-zinc-800/80 bg-[#0a0a0c] flex justify-between items-center z-10 backdrop-blur-md">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                           <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg sm:text-2xl shadow-inner">🤖</div>
                           <div className="min-w-0">
                              <p className="font-black text-white italic text-sm sm:text-lg tracking-tight truncate">Tujague AI System</p>
                              <p className="text-[8px] sm:text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1 truncate">
                                 <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500 animate-pulse"></span> Sistema en línea
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-[#050505] to-blue-950/10 flex flex-col justify-end overflow-hidden">
                        <div className="ml-auto w-[90%] sm:w-[85%] animate-in slide-in-from-right-4 duration-500">
                           <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 text-right">Atleta</span>
                           <div className="bg-zinc-800 text-white p-4 rounded-2xl rounded-tr-sm text-xs font-medium border border-zinc-700 shadow-sm leading-relaxed break-words">
                              Coach, al hacer Press de Banca siento que trabajo más el hombro que el pectoral. ¿Qué ajusto?
                           </div>
                        </div>

                        <div className="mr-auto w-[90%] sm:w-[90%] animate-in slide-in-from-left-4 duration-500 delay-300">
                           <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1.5">Tujague AI</span>
                           <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/20 p-4 rounded-2xl rounded-tl-sm text-xs text-blue-50 border border-blue-500/30 shadow-md leading-relaxed break-words">
                              <p className="mb-2"><strong>1. Retracción:</strong> Junta las escápulas y empújalas hacia tus glúteos.</p>
                              <p><strong>2. Ángulo:</strong> Cierra tus codos a 45° para maximizar el torque en el pectoral.</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-3 sm:p-5 border-t border-zinc-800 bg-[#0a0a0c] flex gap-2 sm:gap-3 items-center backdrop-blur-md">
                        <div className="flex-1 h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-black border border-zinc-800 flex items-center px-3 sm:px-5 min-w-0">
                           <span className="text-[10px] sm:text-sm text-zinc-600 font-medium truncate">Escribe tu consulta...</span>
                        </div>
                        <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold opacity-50 text-lg sm:text-xl">↑</div>
                     </div>
                  </div>
               </div>

            </div>
         </RevealOnScroll>
      </section>

{/* ========================================================= */}
      {/* 4. EL MANIFIESTO Y LA APP ÉLITE (ZOOM ÉLITE SHARK)        */}
      {/* ========================================================= */}
      <RevealOnScroll>
        <section className="bg-[#000000] py-24 sm:py-32 relative overflow-hidden border-b border-white/5">
            {/* Fondo resplandor naranja */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[700px] lg:w-[1000px] xl:w-[1200px] h-[400px] md:h-[700px] lg:h-[1000px] xl:h-[1200px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none transform-gpu z-0"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                
                {/* 🔥 4.A EL MANIFIESTO ÉLITE (AUTORIDAD) 🔥 */}
                <div className="border border-amber-500/20 bg-gradient-to-b from-amber-900/20 to-[#0a0a0c] p-8 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)] backdrop-blur-sm mb-20 max-w-4xl w-full">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
                    <h3 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter mb-4 mt-2 drop-shadow-lg text-balance leading-[0.95]">
                        ¿Por qué no hay planes de <span className="text-amber-500">1 MES?</span>
                    </h3>
                    <p className="text-zinc-300 font-medium text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6 text-balance">
                        Porque en 30 días no vas a lograr una transformación real. Esto no es para "probar". Es para quienes decidieron que no hay vuelta atrás. Si buscás un cambio verdadero para tu vida y tu físico, este es el lugar.
                    </p>
                </div>

                {/* 🔥 4.B LA VISUALIZACIÓN VISUAÉLITE 3D (ZOOM SHARK) 🔥 */}
                <div className="relative w-full mb-32 flex justify-center py-20 lg:py-32 z-10 overflow-visible">
                    
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] z-0 transform-gpu"></div>
                    
                    {/* CONTENEDOR DEL CELULAR (ZOOM MASIVO APROBADO: w-[300px] Mobile / lg:w-[70vw] PC) */}
                    <div className="relative z-10 w-[300px] md:w-[350px] lg:w-[70vw] lg:max-w-[1200px] mx-auto transform-gpu" style={{ animation: 'floatPhone 6s ease-in-out infinite' }}>
                        
                        <img 
                            src="/dashboard-analysis.png" 
                            alt="App BII-VINTAGE™" 
                            className="w-full h-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-20" 
                        />

                        {/* ESTEROIDE 2: Widgets Flotantes YA RECEPTIVOS Y SEPARADOS */}

                        {/* Widget 1: Tracking RMs (Arriba Izquierda) */}
                        {/* 👇 Mobile: top-[10%] -left-8 (SEPARADO) / PC: lg:top-[15%] lg:-left-24 (COSTADO) 👇 */}
                        <div className="absolute top-[10%] lg:top-[15%] -left-8 md:-left-16 lg:-left-24 z-30 bg-black/60 backdrop-blur-md border border-amber-500/30 p-1.5 md:p-4 rounded-xl lg:rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.15)] w-max transform-gpu origin-top-right scale-[0.7] md:scale-90 lg:scale-100" style={{ animation: 'floatWidget1 5s ease-in-out infinite 0.2s' }}>
                            <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-6 h-6 md:w-10 md:h-10 xl:w-11 xl:h-11 rounded-full bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-500 text-xs md:text-lg shrink-0">⚡</div>
                                <div className="min-w-0 text-left">
                                    <p className="text-[9px] md:text-[11px] lg:text-sm font-black text-amber-400 uppercase tracking-widest leading-none mb-1 lg:mb-2 truncate">Cálculo Preciso</p>
                                    <p className="text-white text-[9px] md:text-sm lg:text-xl font-bold leading-none truncate italic uppercase">Tracking de RMs</p>
                                </div>
                            </div>
                        </div>

                        {/* Widget 2: IA Integrada (Medio Derecha) */}
                        {/* 👇 Mobile: top-[40%] -right-8 (SEPARADO) / PC: lg:top-[45%] lg:-right-32 (COSTADO) 👇 */}
                        <div className="absolute top-[40%] lg:top-[45%] -right-8 md:-right-16 lg:-right-32 z-30 bg-black/60 backdrop-blur-md border border-zinc-700 p-1.5 md:p-4 rounded-xl lg:rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] w-max transform-gpu origin-top-right scale-[0.7] md:scale-90 lg:scale-100" style={{ animation: 'floatWidget2 7s ease-in-out infinite 0.5s' }}>
                            <div className="flex items-center gap-2 lg:gap-3 text-right">
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[11px] lg:text-sm font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lg:mb-2">Tujague AI v2.1</p>
                                    <p className="text-white text-[9px] md:text-sm lg:text-xl font-bold leading-none truncate italic uppercase">IA Integrada 24/7</p>
                                </div>
                                <div className="w-6 h-6 md:w-10 md:h-10 xl:w-11 xl:h-11 rounded-full bg-zinc-800 border border-zinc-700 text-white text-xs md:text-lg shrink-0">🧠</div>
                            </div>
                        </div>

                        {/* Widget 3: Live Sync (Abajo Izquierda) */}
                        {/* 👇 Mobile: -bottom-[5%] -left-4 (SEPARADO) / PC: lg:bottom-[20%] lg:-left-20 (COSTADO) 👇 */}
                        <div className="absolute -bottom-[5%] lg:bottom-[20%] -left-4 md:-left-8 lg:-left-20 z-30 bg-black/80 backdrop-blur-md border border-emerald-500/30 p-1.5 lg:p-3 rounded-xl lg:rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.1)] w-max scale-[0.75] md:scale-90 lg:scale-100 transform-gpu" style={{ animation: 'floatWidget3 6s ease-in-out infinite 1s' }}>
                            <div className="flex items-center gap-2 lg:gap-3">
                                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                                </span>
                                <p className="text-white text-[9px] md:text-sm font-black uppercase tracking-widest leading-none mt-0.5 lg:mt-1 truncate">SINCRONIZADO</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 🔥 4.C TÍTULOS Y DESCRIPCIÓN 📝 */}
                <div className="relative z-20 flex flex-col items-center w-full px-2">
                    <div className="border border-zinc-700/80 rounded-[2rem] px-8 md:px-16 py-3 mb-6 md:mb-8 bg-black/60 backdrop-blur-sm">
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            TODO EN UNA SOLA <span className="text-white">APLICACIÓN</span>
                        </span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-lg text-balance leading-[0.95]">
                        Suscripción a la <span className="text-amber-500 block sm:inline">APP BII-VINTAGE™</span>
                    </h2>
                    
                    <p className="text-zinc-400 max-w-3xl text-sm md:text-base font-medium leading-relaxed text-balance">
                        BII-Vintage™ es mucho más que un simple plan de entrenamiento. Es un sistema de transformación total que combina entrenamiento físico, nutrición aplicada y mentalidad de alto rendimiento.
                    </p>
                </div>

            </div>
        </section>
      </RevealOnScroll>

      {/* ========================================================= */}
      {/* 7. LA NUEVA OFERTA (PRECIOS UNIFICADOS)                   */}
      {/* ========================================================= */}
      <RevealOnScroll>
        <PricingV2 onSelectPlan={handleSelectPlan} />
      </RevealOnScroll>

      {/* ========================================================= */}
      {/* 8. CHECKOUT GLOBAL                                        */}
      {/* ========================================================= */}
      <section id="checkout-final" className="relative z-10 pt-20 sm:pt-32 pb-32 sm:pb-48 px-4 sm:px-6 bg-[#000000] border-t border-white/5 overflow-hidden">
        <RevealOnScroll>
           <div className="max-w-6xl mx-auto relative z-10">
             <div className="text-center mb-12 sm:mb-20">
               <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-4 lg:mb-6 inline-block">Último Paso</span>
               <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic mb-6 tracking-tighter text-white drop-shadow-md">FINALIZAR <span className="text-amber-500">INSCRIPCIÓN</span></h2>
               <p className="text-zinc-400 text-sm sm:text-lg font-medium tracking-wide max-w-xl mx-auto">Completá tus datos para recibir acceso inmediato al material o panel de entrenamiento.</p>
             </div>
             
             {selectedPlan ? (
               <div className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden pb-12 lg:pb-0 backdrop-blur-2xl">
                 <div className={`absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none -mr-40 -mt-40 transform-gpu ${selectedPlan?.id.startsWith('static') || selectedPlan?.id.startsWith('mesociclo') ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_60%)]' : 'bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_60%)]'}`}></div>
                 
                 <div className="p-4 sm:p-6 bg-[#050505] border-b border-zinc-800 flex justify-between items-center relative z-20">
                    <button 
                        onClick={() => { setSelectedPlan(null); scrollToPricing(); }} 
                        className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        ← Cancelar Selección
                    </button>
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-amber-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        🏠 Volver al Inicio
                    </button>
                 </div>

                 <CheckoutClient 
                    selectedPlan={selectedPlan} 
                    extraVideo={false} 
                    extraPrice={0}
                 />
               </div>
             ) : (
               <div className="text-center p-12 sm:p-24 md:p-32 border-2 border-dashed border-zinc-800/80 rounded-[2.5rem] sm:rounded-[4rem] bg-[#0a0a0c] shadow-sm">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#050505] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-zinc-800">
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

      {/* ========================================================= */}
      {/* 9. PREGUNTAS FRECUENTES Y FOOTER                          */}
      {/* ========================================================= */}
      <section className="relative z-10 py-24 lg:py-32 px-4 sm:px-6 bg-[#050505] border-t border-white/5">
         <RevealOnScroll>
            <div className="max-w-7xl mx-auto">
               <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                  
                  <div className="lg:col-span-5 text-center lg:text-left sticky top-32">
                     <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white mb-4 drop-shadow-md">PREGUNTAS <span className="text-amber-500 block">FRECUENTES</span></h2>
                     <p className="text-zinc-400 font-medium text-sm lg:text-base mb-8">Resolvé tus dudas antes de aplicar. La claridad es fundamental antes de comprometerse con el proceso.</p>
                     
                     <div className="hidden lg:flex items-center gap-4 bg-[#0a0a0c] p-6 rounded-2xl border border-zinc-800">
                        <span className="text-3xl">💬</span>
                        <div>
                           <p className="text-white font-bold text-sm">¿Tenés otra duda?</p>
                           <a href={whatsappUrl} target="_blank" className="text-amber-500 text-xs font-black uppercase tracking-widest hover:text-amber-400 transition-colors">Contactar al Coach</a>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4 lg:space-y-6">
                     {FAQS.map((faq, i) => (
                        <div key={i} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:border-amber-500/30 shadow-sm">
                           <button 
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full px-6 lg:px-8 py-5 lg:py-6 text-left flex justify-between items-center focus:outline-none hover:bg-[#050505] transition-colors"
                           >
                              <span className="font-black text-white italic tracking-tight text-sm lg:text-lg pr-6 leading-snug">{faq.q}</span>
                              <span className={`text-amber-500 font-black text-lg lg:text-xl transition-transform duration-500 ${openFaq === i ? 'rotate-180 text-amber-400' : ''}`}>
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
      <footer className="relative z-50 pt-20 lg:pt-24 pb-28 lg:pb-20 border-t border-white/10 bg-[#000000] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-center md:text-left">
          
          <div className="space-y-4 lg:space-y-6">
             <Link href="/" className="font-black text-3xl italic text-white tracking-tighter hover:opacity-80 transition-opacity inline-block">
               TUJAGUE <span className="text-amber-500">STRENGTH</span>
             </Link>
             <p className="text-zinc-500 text-xs lg:text-sm italic tracking-tight font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
               "Te doy las herramientas, vos ponés el esfuerzo. Biomecánica aplicada y entrenamiento de fuerza real."
             </p>
             <p className="text-zinc-600 text-[9px] lg:text-[10px] tracking-[0.3em] font-black uppercase mt-6 lg:mt-8 border-t border-zinc-800/50 pt-6">
               &copy; {new Date().getFullYear()} Luciano Tujague.
             </p>
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
             <h4 className="text-amber-500 font-black tracking-[0.2em] text-[10px] lg:text-xs border-b border-amber-500/20 pb-2 lg:pb-3 uppercase">
                Enlaces Legales
             </h4>
             <div className="flex flex-col gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-black tracking-widest text-zinc-500">
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Términos y Condiciones</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Política de Privacidad</Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">Baja del Servicio</Link>
                <Link href="/admin/login" className="text-zinc-600 hover:text-amber-500 transition-colors uppercase mt-4 lg:mt-6 bg-[#0a0a0c] px-4 py-2 rounded-xl text-center inline-block border border-zinc-800">
                  Acceso Entrenador 🔒
                </Link>
             </div>
          </div>

        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.8); }
        
        /* 🔥 KEYFRAMES DE LEVITACIÓN ASINCRÓNICA 🔥 */
        @keyframes floatPhone { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes floatWidget1 { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
        @keyframes floatWidget2 { 0%, 100% { transform: translateY(0px) rotate(2deg); } 50% { transform: translateY(-15px) rotate(-1deg); } }
        @keyframes floatWidget3 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}} />
    </main>
  );
}