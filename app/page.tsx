"use client";

import { useState } from "react";
import CheckoutClient from "./components/CheckoutClient";
import Link from "next/link";
import Image from "next/image";

// ─── CONFIGURACIÓN DE DATOS (MANTENIDA INTACTA) ───
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
    },
    {
      id: "semanal-5-6",
      title: "INTENSIVO (5-6 DÍAS)",
      subtitle: "Semana de Choque",
      price: 32000,
      description: "Una semana de alta frecuencia para evaluar tu capacidad de recuperación y técnica bajo fatiga.",
      features: ["Alta densidad de entrenamiento", "Técnicas RIR/RPE", "Ideal para atletas con experiencia"],
      highlight: true,
    },
    {
      id: "semanal-7",
      title: "FULL SEMANA (7 DÍAS)",
      subtitle: "Máxima Exigencia",
      price: 38000,
      description: "Siete días de programación estricta. Para quienes no quieren dejar ni un solo día al azar.",
      features: ["Programación diaria", "Control de volumen total", "Máximo rendimiento semanal"],
      highlight: false,
    }
  ],
  monthly: [
    {
      id: "mensual-3-4",
      title: "MESOCICLO BASE (3-4 DÍAS)",
      subtitle: "Progreso Constante",
      price: 50000,
      description: "Planificación mensual estructurada. Ideal para combinar con otras actividades manteniendo el progreso en fuerza.",
      features: ["Ajustes semanales de carga", "Periodización Lineal", "Gestión de fatiga real"],
      highlight: false,
    },
    {
      id: "mensual-5-6",
      title: "PRO PERFORMANCE (5-6 DÍAS)",
      subtitle: "Evolución Real",
      price: 100000,
      description: "El estándar para el atleta serio. 4 semanas de progresión técnica y de cargas diseñada para resultados máximos.",
      features: ["Ajustes en 24hs", "Tabla de RPE personalizada", "Optimización Bii-Vintage"],
      highlight: true,
    },
    {
      id: "mensual-7",
      title: "ÉLITE TOTAL (7 DÍAS)",
      subtitle: "Planificación Maestra",
      price: 115000,
      description: "Programación avanzada de 4 semanas. Requiere máxima disciplina y capacidad de trabajo. No apto para principiantes.",
      features: ["Gestión total de variables", "Análisis de recuperación", "Soporte prioritario"],
      highlight: false,
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
      
      {/* ─── FONDO ÉPICO ─── */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/hero.png" 
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/90 via-[#09090b]/95 to-[#09090b] z-10"></div>
      </div>
      
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none z-0"></div>

      {/* ─── NAVBAR FLOTANTE ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black italic tracking-tighter">
            TUJAQUE <span className="text-emerald-500">STRENGTH</span>
          </div>
          <Link href="/dashboard">
            <button className="px-6 py-2 rounded-full border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
              Acceso Atletas
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
      <header className="relative z-10 pt-40 pb-20 md:pt-60 md:pb-40 text-center px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <span className="inline-block mb-8 px-4 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-[0.2em] backdrop-blur-md">
          PROGRAMACIÓN DE ELITE
        </span>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8 text-white drop-shadow-2xl">
          ELEVA TU <br className="md:hidden"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700">ESTÁNDAR</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Dejá de adivinar en el gimnasio. Accedé a una planificación profesional basada en <span className="text-white font-bold">biomecánica</span>, gestión de carga y resultados reales.
        </p>
        <button 
          onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black tracking-widest text-xs hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all"
        >
          VER PLANES DISPONIBLES
        </button>
      </header>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section className="relative z-10 py-20 bg-zinc-900/30 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "100% Individual", desc: "Nada de rutinas genéricas. Ajustamos volumen e intensidad según tu capacidad de recuperación." },
            { title: "Análisis de Video", desc: "Subí tus levantamientos y recibí correcciones biomecánicas detalladas cuadro por cuadro." },
            { title: "Gestión de Cargas", desc: "Calculamos tu 1RM estimado y progresamos semana a semana para evitar estancamientos." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-black/40 border border-zinc-800 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 text-emerald-500 font-black text-xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                {i + 1}
              </div>
              <h3 className="text-xl font-black italic mb-3 text-white">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECCIÓN: EL ENTRENADOR ─── */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="relative group w-[280px] h-[380px] md:w-[400px] md:h-[500px]">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
             <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                <Image src="/hero.png" alt="Luciano Tujague" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            {/* CORREGIDO AQUÍ (Línea 180): Se eliminó "block" para dejar solo "inline-block" */}
            <span className="text-emerald-500 font-black tracking-widest text-xs mb-4 inline-block uppercase border-b border-emerald-500/20 pb-2">Head Coach</span>
            
            <h2 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter text-white">LUCIANO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-800">TUJAGUE</span></h2>
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed font-medium">
                <p>Aplico la metodología <strong>BII-VINTAGE</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica de la sentadilla y la gestión de la fatiga.</p>
                <p>Mi filosofía exige <strong>tolerancia al dolor</strong>: priorizo la técnica impecable con excéntricas de hasta 6 segundos. No busco entretenerte; busco efectividad mediante <strong>RPE y RIR</strong>.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
               {[
                 { v: "152 KG", l: "Squat" },
                 { v: "110 KG", l: "Banca" },
                 { v: "110 KG", l: "Deadlift" },
                 { v: "+60 KG", l: "Fondos" }
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors group">
                    <p className="text-white font-black text-2xl italic leading-none group-hover:text-emerald-400 transition-colors">{stat.v}</p>
                    <p className="text-[10px] text-zinc-500 font-black tracking-widest mt-2 uppercase">{stat.l}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing-section" className="relative z-20 py-24 px-4 bg-black/40">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black italic text-center mb-12 tracking-tighter">
            ELIGE TU <span className="text-emerald-500">CAMINO</span>
          </h2>
          
          <div className="inline-flex bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 mb-16 shadow-2xl">
            <button onClick={() => { setIsWeekly(true); setSelectedPlan(null); }} className={`px-10 py-4 rounded-xl text-xs md:text-sm font-black transition-all tracking-widest ${isWeekly ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>SEMANAL</button>
            <button onClick={() => { setIsWeekly(false); setSelectedPlan(null); }} className={`px-10 py-4 rounded-xl text-xs md:text-sm font-black transition-all tracking-widest ${!isWeekly ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>MENSUAL</button>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto mb-20">
            {currentPlans.map((plan) => (
              <div 
                key={plan.id} 
                onClick={() => handleSelectPlan(plan)}
                className={`p-8 md:p-10 cursor-pointer group transition-all duration-300 relative flex flex-col rounded-[2.5rem] border backdrop-blur-sm ${
                  selectedPlan?.id === plan.id 
                  ? 'bg-zinc-900/80 border-emerald-500 scale-[1.03] shadow-[0_0_60px_rgba(16,185,129,0.15)] z-10' 
                  : 'bg-[#0c0c0e]/80 border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/50'
                }`}
              >
                {plan.highlight && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-[10px] font-black px-6 py-2 rounded-full tracking-widest shadow-lg shadow-emerald-500/20">
                     MÁS ELEGIDO
                   </div>
                )}
                <h3 className="text-2xl font-black italic mb-2 tracking-tighter text-white">{plan.title}</h3>
                <p className="text-emerald-400 font-bold tracking-widest text-[10px] mb-8 border-b border-white/5 pb-4 uppercase">{plan.subtitle}</p>
                <div className="text-4xl md:text-5xl font-black mb-8 text-white tracking-tight">
                    ${plan.price.toLocaleString('es-AR')} 
                    <span className="text-xs text-zinc-500 font-bold ml-2 tracking-wide align-middle">/{isWeekly ? 'SEM' : 'MES'}</span>
                </div>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed flex-grow font-medium">{plan.description}</p>
                <ul className="space-y-4 mb-10 text-left">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-zinc-300 font-medium text-xs md:text-sm">
                      <span className="text-emerald-500 font-black">✔</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-5 rounded-xl font-black tracking-[0.2em] text-[10px] transition-all uppercase ${
                  selectedPlan?.id === plan.id 
                  ? 'bg-emerald-500 text-black shadow-lg' 
                  : 'bg-white/5 text-zinc-400 group-hover:bg-white group-hover:text-black'
                }`}>
                  {selectedPlan?.id === plan.id ? 'PLAN SELECCIONADO' : 'ELEGIR ESTE PLAN'}
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="max-w-2xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <label className={`flex items-center justify-between p-8 border cursor-pointer transition-all rounded-[2rem] backdrop-blur-md ${addVideoReview ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-zinc-900/50 border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center gap-6 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${addVideoReview ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700 bg-black/40 text-transparent'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-lg md:text-xl leading-none mb-2 text-white italic">Auditoría Técnica Biomecánica</h4>
                    <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Análisis detallado SBD + Corrección de palancas.</p>
                  </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-white block tracking-tight">+${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                </div>
                <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* ─── CHECKOUT SECTION ─── */}
      <section id="checkout-section" className="relative z-10 py-32 px-4 bg-black/80 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black italic mb-6 tracking-tighter text-white">FINALIZAR <span className="text-emerald-500">INSCRIPCIÓN</span></h2>
            <p className="text-zinc-400 text-sm font-medium tracking-wide">Completá tus datos para recibir acceso inmediato al panel de entrenamiento.</p>
          </div>
          {selectedPlan ? (
            <div className="bg-[#0c0c0e] p-8 md:p-14 border border-emerald-500/20 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16"></div>
              <CheckoutClient selectedPlan={selectedPlan} extraVideo={addVideoReview} extraPrice={EXTRA_VIDEO_PRICE} />
            </div>
          ) : (
            <div className="text-center p-20 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-white/[0.02]">
              <p className="text-xl font-bold text-zinc-600 italic tracking-widest">▲ SELECCIONÁ UN PLAN ARRIBA PARA CONTINUAR</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER CON LEGALES (CORREGIDO) ─── */}
      <footer className="relative z-50 py-20 border-t border-white/10 bg-[#09090b] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left">
          
          <div className="space-y-4 max-w-xs">
             <h3 className="font-black text-2xl italic text-white tracking-tighter">
               TUJAQUE <span className="text-emerald-500">STRENGTH</span>
             </h3>
             <p className="text-zinc-500 text-xs italic tracking-tight font-medium leading-relaxed">
               "Te doy las herramientas, vos ponés el esfuerzo. Biomecánica aplicada y entrenamiento de fuerza real."
             </p>
             <p className="text-zinc-600 text-[10px] tracking-[0.3em] font-bold uppercase mt-6">
               &copy; {new Date().getFullYear()} Luciano Tujague.
             </p>
          </div>

          <div className="flex flex-col gap-4">
             {/* CORREGIDO: Se eliminó "md:block" */}
             <h4 className="text-emerald-500 font-black tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block uppercase">Contacto Directo</h4>
             <div className="flex flex-col gap-3 text-sm font-bold text-white tracking-wide">
                <a href="mailto:luciano2004tujague20@gmail.com" className="hover:text-emerald-400 transition-colors">Email Oficial</a>
                <a href="https://instagram.com/tujaquestrength" target="_blank" className="hover:text-emerald-400 transition-colors">Instagram</a>
                <a href="https://wa.me/5491123021760" target="_blank" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             {/* CORREGIDO: Se eliminó "md:block" */}
             <h4 className="text-emerald-500 font-black tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block uppercase">
               Marco Legal
             </h4>
             <div className="flex flex-col gap-3 text-[10px] font-black tracking-widest text-zinc-500">
                <Link href="/legal" className="hover:text-white transition-colors uppercase">
                  Términos y Condiciones
                </Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">
                  Política de Privacidad
                </Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">
                  Baja del Servicio
                </Link>
             </div>
          </div>

        </div>
      </footer>
    </main>
  );
}