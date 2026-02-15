"use client";

import { useState } from "react";
import CheckoutClient from "./components/CheckoutClient";
import Link from "next/link";
import Image from "next/image";

// ─── CONFIGURACIÓN DE DATOS ───
const PRICING_MATRIX = {
  weekly: [
    {
      id: "weekly-3",
      title: "FUERZA BASE (3 DÍAS)",
      subtitle: "Test Drive / Introductorio",
      price: 18000,
      description: "Para quienes quieren probar la metodología bii-vintage sin compromiso. Sin seguimiento a largo plazo.",
      features: ["Rutina estática", "Foco: Técnica en SBD", "Sin ajustes semanales"],
      highlight: false,
    },
    {
      id: "weekly-5",
      title: "POWERBUILDING (5 DÍAS)",
      subtitle: "Semana de Choque",
      price: 32000,
      description: "Volumen extremo para romper estancamientos. Una experiencia intensa de 5 días sin seguimiento posterior.",
      features: ["Alta densidad", "Técnicas RIR/RPE", "Ideal para pruebas puntuales"],
      highlight: true,
    }
  ],
  monthly: [
    {
      id: "monthly-3",
      title: "FUERZA PRO (3 DÍAS)",
      subtitle: "Mesociclo de Progresión",
      price: 50000,
      description: "Aquí comienza el progreso real. Planificación estructurada con ajustes de carga semanales basados en tu rendimiento.",
      features: ["Ajustes semanales de carga", "Periodización Lineal", "Gestión de fatiga real"],
      highlight: false,
    },
    {
      id: "monthly-5",
      title: "ELITE TOTAL (5 DÍAS)",
      subtitle: "Máximo Rendimiento",
      price: 100000,
      description: "El plan definitivo. Gestión total de cargas y ajustes semanales garantizados para quienes priorizan el entrenamiento.",
      features: ["Ajustes en 24hs", "Tabla de RPE personalizada", "Optimización Bii-Vintage"],
      highlight: true,
    }
  ]
};

const EXTRA_VIDEO_PRICE = 15000;

export default function Home() {
  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [addVideoReview, setAddVideoReview] = useState(false);

  const currentPlans = isWeekly ? PRICING_MATRIX.weekly : PRICING_MATRIX.monthly;

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#09090b] text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ─── FONDO ÉPICO (A COLOR) ─── */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/hero.png" 
          alt="Background"
          fill
          className="object-cover opacity-30" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-[#09090b]/90 to-[#09090b] z-10"></div>
      </div>
      
      <div className="fixed inset-0 tech-grid opacity-10 pointer-events-none z-0"></div>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-4 md:py-6 backdrop-blur-md border-b border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-lg md:text-xl font-black italic tracking-tighter uppercase">
            Tujaque <span className="text-emerald-500">Strength</span>
          </div>
          <Link href="/login">
            <button className="bg-white/5 border border-white/10 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
              Acceso Clientes
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── BOTÓN WHATSAPP FLOTANTE ─── */}
      <a 
        href="https://wa.me/5491123021760" 
        target="_blank" 
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-110 transition-transform active:scale-95 group border border-emerald-400/50"
      >
        <span className="absolute -top-10 right-0 bg-white text-black text-[10px] font-bold px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          ¿Dudas? Hablá con Luciano
        </span>
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.097 0-4.142-.547-5.946-1.588L0 .057zm12.026-2.137c1.892 0 3.738-.503 5.339-1.455l.382-.227 3.97 1.041-1.059-3.869.25-.397c1.046-1.666 1.599-3.593 1.599-5.606 0-5.833-4.744-10.577-10.577-10.577-2.827 0-5.483 1.1-7.481 3.098s-3.098 4.654-3.098 7.481c0 2.013.553 3.94 1.599 5.606l.25.397-1.059 3.869 4.074-1.069.382.227c1.6.952 3.447 1.455 5.339 1.455z"/></svg>
      </a>

      {/* ─── HERO SECTION ─── */}
      <header className="relative z-10 pt-40 pb-20 text-center px-4">
        <span className="inline-block mb-6 px-4 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
          Solo para Hombres
        </span>
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8 text-white drop-shadow-2xl">
          Tujaque <br className="md:hidden"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Strength</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-md">
          Control total sobre el hierro. Sin humo, solo ciencia aplicada, <span className="text-white font-bold">biomecánica</span> y esfuerzo real.
        </p>
        <button 
          onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1"
        >
          VER PLANES AHORA
        </button>
      </header>

      {/* ─── SECCIÓN: FILTRADO ─── */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-red-950/10 border border-red-500/20 rounded-3xl p-8 md:p-12">
          <h2 className="text-red-500 font-black text-xl uppercase italic mb-6 tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-red-500 rounded-full"></span>
            Este programa NO es para vos si:
          </h2>
          <ul className="space-y-4 text-zinc-300 font-medium text-sm md:text-base">
            <li className="flex items-center gap-3"><span className="text-red-500 font-black">✕</span> Buscás rutinas milagrosas sin esfuerzo real.</li>
            <li className="flex items-center gap-3"><span className="text-red-500 font-black">✕</span> Priorizás el ego por sobre la técnica impecable.</li>
            <li className="flex items-center gap-3"><span className="text-red-500 font-black">✕</span> No tolerás el dolor de una serie al fallo real.</li>
          </ul>
        </div>
      </section>

      {/* ─── SECCIÓN: EL ENTRENADOR ─── */}
      <section className="relative z-10 py-24 px-4 bg-emerald-950/5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="relative group w-[280px] h-[380px] md:w-[350px] md:h-[450px]">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
             <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <Image src="/hero.png" alt="Luciano Tujague" fill className="object-cover" />
             </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <span className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-2 block">Head Coach</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 italic">Luciano <span className="text-emerald-500">Tujague</span></h2>
            <div className="space-y-4 text-zinc-300 text-lg leading-relaxed">
               <p>Aplico la metodología <strong>bii-vintage</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica de la sentadilla y la gestión de la fatiga.</p>
               <p>Mi filosofía exige <strong>tolerancia al dolor</strong>: priorizo la técnica impecable con excéntricas de hasta 6 segundos. No busco entretenerte; busco efectividad mediante <strong>RPE y RIR</strong>.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
               {[
                 { v: "152 KG", l: "Squat" },
                 { v: "110 KG", l: "Banca" },
                 { v: "110 KG", l: "Deadlift" },
                 { v: "+60 KG", l: "Fondos" }
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
                    <p className="text-emerald-400 font-black text-2xl italic leading-none">{stat.v}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{stat.l}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing-section" className="relative z-20 py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic text-center mb-12 tracking-tighter">
            TU <span className="text-emerald-500">INVERSIÓN</span>
          </h2>
          
          <div className="inline-flex bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-zinc-800 mb-16 shadow-xl">
            <button onClick={() => { setIsWeekly(true); setSelectedPlan(null); }} className={`px-8 py-3 rounded-lg text-xs md:text-sm font-black uppercase transition-all tracking-widest ${isWeekly ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Semanal</button>
            <button onClick={() => { setIsWeekly(false); setSelectedPlan(null); }} className={`px-8 py-3 rounded-lg text-xs md:text-sm font-black uppercase transition-all tracking-widest ${!isWeekly ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Mensual</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {currentPlans.map((plan) => (
              <div 
                key={plan.id} 
                onClick={() => handleSelectPlan(plan)}
                className={`p-8 md:p-12 cursor-pointer group transition-all duration-300 relative flex flex-col rounded-[2.5rem] border-2 backdrop-blur-sm ${
                  selectedPlan?.id === plan.id 
                  ? 'bg-emerald-900/10 border-emerald-500 scale-[1.02] shadow-[0_0_50px_rgba(16,185,129,0.2)]' 
                  : 'bg-[#0c0c0e]/80 border-white/5 hover:border-emerald-500/40 hover:scale-[1.01]'
                }`}
              >
                {plan.highlight && (
                   <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl rounded-tr-2xl tracking-widest">
                     Recomendado
                   </div>
                )}
                <h3 className="text-2xl md:text-3xl font-black italic mb-2 uppercase tracking-tighter text-white">{plan.title}</h3>
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-6 border-b border-white/5 pb-4">{plan.subtitle}</p>
                <div className="text-4xl md:text-5xl font-black mb-6 text-white">
                    ${plan.price.toLocaleString('es-AR')} 
                    <span className="text-sm text-zinc-500 font-bold ml-1">/{isWeekly ? 'sem' : 'mes'}</span>
                </div>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed flex-grow font-medium">{plan.description}</p>
                <ul className="space-y-4 mb-10 text-left">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-zinc-300 font-medium text-xs md:text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center min-w-[20px]">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                    selectedPlan?.id === plan.id 
                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white'
                  }`}>
                  {selectedPlan?.id === plan.id ? 'PLAN SELECCIONADO' : 'ELEGIR ESTE PLAN'}
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="max-w-xl mx-auto mb-24 animate-fade-in">
              <label className={`flex items-center justify-between p-6 border-2 cursor-pointer transition-all rounded-3xl backdrop-blur-md ${addVideoReview ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors border ${addVideoReview ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-black/40'}`}>
                    {addVideoReview && <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-lg leading-none mb-1 text-white">Auditoría Técnica Biomecánica</h4>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Análisis detallado SBD + Corrección de palancas.</p>
                  </div>
                </div>
                <div className="text-right">
                    <span className="text-lg md:text-xl font-black text-white block">+${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                </div>
                <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* ─── CHECKOUT SECTION ─── */}
      <section id="checkout-section" className="relative z-10 py-24 px-4 bg-black/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-4">FINALIZAR <span className="text-emerald-500">INSCRIPCIÓN</span></h2>
            <p className="text-zinc-400 text-sm font-medium">Completá tus datos para recibir acceso inmediato al panel.</p>
          </div>
          {selectedPlan ? (
            <div className="bg-[#0c0c0e] p-6 md:p-12 border border-emerald-500/30 rounded-[2rem] shadow-2xl">
              <CheckoutClient selectedPlan={selectedPlan} extraVideo={addVideoReview} extraPrice={EXTRA_VIDEO_PRICE} />
            </div>
          ) : (
            <div className="text-center p-12 md:p-16 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5">
              <p className="text-lg font-bold text-zinc-500 uppercase italic tracking-widest">▲ Seleccioná un plan arriba para continuar</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER BLINDADO (CAPA SUPERIOR) ─── */}
      <footer className="relative z-50 py-16 border-t border-white/10 bg-[#09090b] px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10 text-center md:text-left">
          
          {/* 1. LOGO Y COPYRIGHT */}
          <div className="space-y-4 max-w-xs">
             <h3 className="font-black text-2xl italic uppercase text-white tracking-tighter">
               Tujaque <span className="text-emerald-500">Strength</span>
             </h3>
             <p className="text-zinc-500 text-xs italic tracking-tight font-medium">
               "Te doy las herramientas, vos ponés el esfuerzo. Biomecánica aplicada y entrenamiento de fuerza real."
             </p>
             <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold">
               &copy; {new Date().getFullYear()} Luciano Tujague.
             </p>
          </div>

          {/* 2. CONTACTO DIRECTO (VISIBILIDAD FORZADA) */}
          <div className="flex flex-col gap-4">
             <h4 className="text-emerald-500 font-black uppercase tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block md:block">
               Contacto Directo
             </h4>
             <div className="flex flex-col gap-3 text-sm font-bold text-white uppercase tracking-wide">
                <a 
                  href="mailto:luciano2004tujague20@gmail.com" 
                  className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center justify-center md:justify-start gap-2"
                >
                  <span className="text-emerald-500">✉</span> Email Oficial
                </a>
                <a 
                  href="https://instagram.com/tujaquestrength" 
                  target="_blank" 
                  className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center justify-center md:justify-start gap-2"
                >
                  <span className="text-emerald-500">Instagram</span>
                </a>
                <a 
                  href="https://wa.me/5491123021760" 
                  target="_blank" 
                  className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center justify-center md:justify-start gap-2"
                >
                  <span className="text-emerald-500">WhatsApp</span>
                </a>
             </div>
          </div>

          {/* 3. LEGALES */}
          <div className="flex flex-col gap-4">
             <h4 className="text-emerald-500 font-black uppercase tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block md:block">
               Legales
             </h4>
             <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
               <Link href="/legal" className="hover:text-white transition-colors">
                 Términos y Condiciones
               </Link>
               <Link href="/legal" className="hover:text-white transition-colors">
                 Política de Privacidad
               </Link>
             </div>
          </div>

        </div>
      </footer>
    </main>
  );
}
