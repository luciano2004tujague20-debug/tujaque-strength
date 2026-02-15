"use client";

import { useState } from "react";
import CheckoutClient from "./components/CheckoutClient";
import Link from "next/link";
import Image from "next/image";

// ─── CONFIGURACIÓN DE DATOS (Actualizada) ───
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
    // Timeout para asegurar que la UI responda antes del scroll
    setTimeout(() => {
      document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#09090b]">
      {/* tech-grid con pointer-events-none para no bloquear clics */}
      <div className="fixed inset-0 tech-grid opacity-30 pointer-events-none z-0"></div>
      
      {/* ─── BOTÓN WHATSAPP FLOTANTE ─── */}
      <a 
        href="https://wa.me/5491123021760" 
        target="_blank" 
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 p-4 rounded-full shadow-2xl shadow-emerald-500/20 hover:scale-110 transition-transform active:scale-95 group"
      >
        <span className="absolute -top-10 right-0 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">¿Dudas? Hablá con Luciano</span>
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.097 0-4.142-.547-5.946-1.588L0 .057zm12.026-2.137c1.892 0 3.738-.503 5.339-1.455l.382-.227 3.97 1.041-1.059-3.869.25-.397c1.046-1.666 1.599-3.593 1.599-5.606 0-5.833-4.744-10.577-10.577-10.577-2.827 0-5.483 1.1-7.481 3.098s-3.098 4.654-3.098 7.481c0 2.013.553 3.94 1.599 5.606l.25.397-1.059 3.869 4.074-1.069.382.227c1.6.952 3.447 1.455 5.339 1.455z"/></svg>
      </a>

      {/* ─── HERO SECTION ─── */}
      <header className="relative z-10 pt-32 pb-20 text-center px-4">
        <span className="badge mb-8 uppercase tracking-widest">Solo para Hombres</span>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8 uppercase">
          Tujaque <br className="md:hidden"/> <span className="text-gradient">Strength</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Control total sobre el hierro. Sin humo, solo ciencia aplicada y esfuerzo real.
        </p>
        <button 
          onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary"
        >
          VER PLANES AHORA
        </button>
      </header>

      {/* ─── SECCIÓN: FILTRADO (PARA QUIÉN NO ES) ─── */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto glass-card p-8 border-red-500/20 bg-red-500/5">
          <h2 className="text-red-500 font-black text-xl uppercase italic mb-6 tracking-tight">Este programa NO es para vos si:</h2>
          <ul className="space-y-4 text-zinc-400 font-medium text-sm md:text-base">
            <li className="flex items-center gap-3">✖ Buscás rutinas milagrosas sin esfuerzo real.</li>
            <li className="flex items-center gap-3">✖ Priorizás el ego por sobre la técnica impecable.</li>
            <li className="flex items-center gap-3">✖ No tolerás el dolor de una serie al fallo real.</li>
          </ul>
        </div>
      </section>

      {/* ─── SECCIÓN: EL ENTRENADOR ─── */}
      <section className="relative z-10 py-24 px-4 bg-emerald-950/5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="relative group w-[280px] h-[380px] md:w-[350px] md:h-[450px]">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-[60px] rounded-full opacity-50"></div>
             <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/10 glass-card">
                <Image src="/luciano-coach.png" alt="Luciano Tujague" fill className="object-cover" priority />
             </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <span className="badge mb-6">Fundador</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-6">Luciano <span className="text-emerald-400">Tujague</span></h2>
            <div className="space-y-4 text-zinc-300 text-lg leading-relaxed">
               <p>Aplico la metodología <strong>bii-vintage</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica de la sentadilla y la gestión de la fatiga.</p>
               <p>Mi filosofía exige <strong>tolerancia al dolor</strong>: priorizo la técnica impecable con excéntricas de hasta 6 segundos y concéntricas explosivas. No busco entretenerte; busco efectividad mediante <strong>RPE y RIR</strong>.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
               {[
                 { v: "152 KG", l: "Squat" },
                 { v: "110 KG", l: "Banca" },
                 { v: "110 KG", l: "Deadlift" },
                 { v: "+60 KG", l: "Fondos" }
               ].map((stat, i) => (
                 <div key={i} className="glass-card p-4 border-emerald-500/20">
                    <p className="text-emerald-400 font-black text-2xl italic leading-none">{stat.v}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{stat.l}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION corregido ─── */}
      <section id="pricing-section" className="relative z-20 py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="section-title text-emerald-400 mb-12">TU INVERSIÓN</h2>
          
          <div className="inline-flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 mb-16">
            <button onClick={() => { setIsWeekly(true); setSelectedPlan(null); }} className={`px-8 py-3 rounded-lg text-sm font-bold uppercase transition-all ${isWeekly ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}>Semanal</button>
            <button onClick={() => { setIsWeekly(false); setSelectedPlan(null); }} className={`px-8 py-3 rounded-lg text-sm font-bold uppercase transition-all ${!isWeekly ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}>Mensual</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {currentPlans.map((plan) => (
              <div 
                key={plan.id} 
                onClick={() => handleSelectPlan(plan)}
                className={`p-8 md:p-12 cursor-pointer group transition-all duration-300 relative flex flex-col rounded-3xl border-2 ${
                  selectedPlan?.id === plan.id 
                  ? 'bg-emerald-500/10 border-emerald-500 scale-[1.02] shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
                  : 'glass-card border-white/5 hover:border-emerald-500/40 hover:scale-[1.01]'
                }`}
              >
                <h3 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">{plan.title}</h3>
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-6">{plan.subtitle}</p>
                <div className="text-5xl font-black mb-6">${plan.price.toLocaleString('es-AR')} <span className="text-sm text-zinc-500 font-bold">/{isWeekly ? 'sem' : 'mes'}</span></div>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed flex-grow">{plan.description}</p>
                
                <ul className="space-y-4 mb-10 text-left">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-zinc-300 font-medium text-xs">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> {f}
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                    selectedPlan?.id === plan.id 
                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/5 text-white group-hover:bg-white/10'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'SELECCIONADO' : 'ELEGIR PLAN'}
                </button>
              </div>
            ))}
          </div>

          {/* AUDITORÍA TÉCNICA BIOMECÁNICA */}
          {selectedPlan && (
            <div className="max-w-xl mx-auto mb-24 animate-fade-in">
              <label className="flex items-center justify-between p-6 glass-card border-emerald-500/30 cursor-pointer hover:bg-emerald-500/10 transition-all rounded-3xl">
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors ${addVideoReview ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                    {addVideoReview && <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-none mb-2">Auditoría Técnica Biomecánica</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Análisis detallado de los 3 básicos (SBD) + Corrección de palancas.</p>
                  </div>
                </div>
                <span className="text-xl font-black text-emerald-400">+${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="relative z-10 py-24 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl font-black uppercase italic mb-12">Preguntas <span className="text-emerald-400">Frecuentes</span></h2>
          <div className="space-y-4">
            {[
              { q: "¿Qué equipo necesito?", a: "Acceso a rack de sentadillas, barra y discos olímpicos. Sin rack no hay programa." },
              { q: "¿Cuál es la diferencia entre Semanal y Mensual?", a: "Semanal es testeo estático. Mensual incluye ajustes de carga semanales basados en tu RPE/RIR real." },
              { q: "¿Cómo recibo mi auditoría?", a: "Me enviás tus videos y recibís un análisis biomecánico detallado de tu trayectoria y palancas." }
            ].map((faq, i) => (
              <details key={i} className="glass-card group transition-all">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none font-bold uppercase text-sm tracking-tight">
                  {faq.q} <span className="text-emerald-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-zinc-400 text-sm border-t border-white/5 pt-4">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CHECKOUT SECTION ─── */}
      <section id="checkout-section" className="relative z-10 py-24 px-4 bg-black/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">FINALIZAR INSCRIPCIÓN</h2>
            <p className="text-muted-foreground">Completá tus datos para recibir acceso al panel de atletas.</p>
          </div>
          {selectedPlan ? (
            <div className="glass-card p-8 md:p-16 border-emerald-500/20">
              <CheckoutClient selectedPlan={selectedPlan} extraVideo={addVideoReview} extraPrice={EXTRA_VIDEO_PRICE} />
            </div>
          ) : (
            <div className="text-center p-16 glass-card opacity-40 border-dashed border-2">
              <p className="text-xl font-bold text-zinc-500 uppercase italic tracking-widest">Seleccioná un plan para continuar</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 py-12 text-center border-t border-zinc-800/50 bg-black/60 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-left">
             <h3 className="font-black text-xl italic uppercase mb-1 text-emerald-400 tracking-tighter">Tujaque Strength</h3>
             <p className="text-zinc-500 text-xs italic tracking-tight">"Te doy las herramientas, vos ponés el esfuerzo."</p>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} Luciano Tujague.</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Términos</Link>
            <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}