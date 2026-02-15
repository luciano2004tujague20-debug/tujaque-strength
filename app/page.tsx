"use client";

import { useState } from "react";
import CheckoutClient from "./components/CheckoutClient";
import Link from "next/link";

// ─── DATOS FIJOS (Para que no falle) ───
const PRICING_MATRIX = {
  weekly: [
    {
      id: "weekly-3",
      title: "FUERZA BASE",
      subtitle: "Eficiencia (3 Días)",
      price: 18000,
      description: "Ideal para probar el sistema con bajo presupuesto y alta intensidad.",
      features: ["Frecuencia: 3 Días/Semana", "Foco: Básicos (SBD)", "Recuperación Optimizada"],
      highlight: false,
    },
    {
      id: "weekly-5",
      title: "POWERBUILDING",
      subtitle: "Volumen (5 Días)",
      price: 32000,
      description: "Para quien busca estética y entrenar duro pagando por semana.",
      features: ["Frecuencia: 5 Días/Semana", "Foco: Hipertrofia", "Split Push-Pull-Legs"],
      highlight: true,
    }
  ],
  monthly: [
    {
      id: "monthly-3",
      title: "FUERZA PRO",
      subtitle: "Rendimiento (3 Días)",
      price: 50000,
      description: "Ciclo completo de mesociclo. Progresión lineal y picos de fuerza.",
      features: ["Planificación Mensual", "Periodización Ondulatoria", "Comunidad Premium"],
      highlight: false,
    },
    {
      id: "monthly-5",
      title: "ELITE TOTAL",
      subtitle: "Experiencia Completa (5 Días)",
      price: 100000,
      description: "Especialización total. Bloques de Peaking + Hipertrofia.",
      features: ["Planificación Avanzada", "Peaking para 1RM", "Soporte Prioritario"],
      highlight: true,
    }
  ]
};

const EXTRA_VIDEO_PRICE = 5000;

export default function Home() {
  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [addVideoReview, setAddVideoReview] = useState(false);

  const currentPlans = isWeekly ? PRICING_MATRIX.weekly : PRICING_MATRIX.monthly;

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 tech-grid opacity-30 pointer-events-none z-0"></div>
      
      {/* ─── HERO SECTION ─── */}
      <header className="relative z-10 pt-32 pb-20 text-center px-4">
        <span className="badge mb-8">Solo para Hombres +18</span>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
          FORJANDO <br className="md:hidden"/> <span className="text-gradient">FUERZA REAL.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Programación de fuerza y estética. Sin humo, solo hierro. Elegí tu camino: Eficiencia o Volumen.
        </p>
        <button 
          onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary"
        >
          VER PLANES AHORA
        </button>
      </header>

      {/* ─── MATRIZ DE ENTRENAMIENTO ─── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">LA MATRIZ DE ENTRENAMIENTO</h2>
            <p className="text-muted-foreground">Entendé la diferencia técnica antes de elegir.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-10">
              <h3 className="text-2xl font-black text-white mb-4">🔥 Camino A: Eficiencia (3 Días)</h3>
              <p className="text-zinc-400">Intensidad alta en movimientos compuestos (SBD). Ideal para Fuerza Base y recuperación óptima.</p>
            </div>
            <div className="glass-card p-10">
              <h3 className="text-2xl font-black text-white mb-4">🦍 Camino B: Powerbuilding (5 Días)</h3>
              <p className="text-zinc-400">Fusión de Powerlifting + Culturismo. Más volumen para hipertrofia y corrección de puntos débiles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing-section" className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">ELEGÍ TU INVERSIÓN</h2>
            
            {/* Toggle */}
            <div className="inline-flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 mb-12">
              <button onClick={() => setIsWeekly(true)} className={`px-8 py-3 rounded-lg text-sm font-bold uppercase transition-all ${isWeekly ? 'bg-primary text-primary-foreground shadow-lg' : 'text-zinc-400 hover:text-white'}`}>Semanal</button>
              <button onClick={() => setIsWeekly(false)} className={`px-8 py-3 rounded-lg text-sm font-bold uppercase transition-all ${!isWeekly ? 'bg-primary text-primary-foreground shadow-lg' : 'text-zinc-400 hover:text-white'}`}>Mensual</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {currentPlans.map((plan) => (
              <div key={plan.id} className={`p-8 md:p-12 cursor-pointer group ${plan.highlight ? 'glass-card-highlight' : 'glass-card'}`} onClick={() => handleSelectPlan(plan)}>
                {plan.highlight && <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-xl uppercase">Más Popular</span>}
                <h3 className="text-3xl font-black italic mb-2">{plan.title}</h3>
                <p className="text-primary font-bold uppercase tracking-wider text-sm mb-6">{plan.subtitle}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black">${plan.price.toLocaleString('es-AR')}</span>
                  <span className="text-zinc-500 font-bold">/{isWeekly ? 'sem' : 'mes'}</span>
                </div>
                <p className="text-zinc-400 mb-8 min-h-[3rem]">{plan.description}</p>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-zinc-300 font-medium">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all ${selectedPlan?.id === plan.id ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                  {selectedPlan?.id === plan.id ? 'Seleccionado' : 'Elegir Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Extra Video */}
          {selectedPlan && (
            <div className="max-w-xl mx-auto mb-24 animate-float">
              <label className="flex items-center justify-between p-6 glass-card border-primary/30 cursor-pointer hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${addVideoReview ? 'bg-primary border-primary' : 'border-zinc-600'}`}>
                    {addVideoReview && <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Incluir Revisión de Técnica</h4>
                    <p className="text-sm text-muted-foreground">Análisis detallado de tus videos.</p>
                  </div>
                </div>
                <span className="text-xl font-black text-primary">+${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* ─── CHECKOUT SECTION ─── */}
      <section id="checkout-section" className="relative z-10 py-24 px-4 bg-black/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">FINALIZAR INSCRIPCIÓN</h2>
            <p className="text-muted-foreground">Completá tus datos para recibir el acceso.</p>
          </div>
          {selectedPlan ? (
            <div className="glass-card p-8 md:p-16 border-primary/20">
              <CheckoutClient selectedPlan={selectedPlan} extraVideo={addVideoReview} extraPrice={EXTRA_VIDEO_PRICE} />
            </div>
          ) : (
            <div className="text-center p-16 glass-card opacity-60 border-dashed border-2">
              <p className="text-xl font-bold text-zinc-500 uppercase">Seleccioná un plan arriba para continuar</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── BIO & FOOTER ─── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="badge mb-4">El Entrenador</span>
            <h2 className="text-4xl font-black mb-6">LUCIANO <br/><span className="text-primary">(TUJAGUE STRENGTH)</span></h2>
            <p className="text-lg text-muted-foreground mb-6">Especializado en fuerza. Mi objetivo no es entretenerte, es hacerte fuerte.</p>
            <p className="text-xl font-bold italic text-white border-l-4 border-primary pl-6 py-2">"No hago coaching 1 a 1 de niñera; te doy las herramientas profesionales para que entrenes como un atleta."</p>
          </div>
          <div className="glass-card p-10">
             <h3 className="text-xl font-bold uppercase mb-6">Contacto Directo</h3>
             <ul className="space-y-4 text-zinc-400">
               <li><strong className="text-white">Instagram:</strong> @tujaquestrength</li>
               <li><strong className="text-white">Email:</strong> contacto@tujaque.com</li>
               <li><strong className="text-white">WhatsApp:</strong> +54 9 11 2302-1760</li>
             </ul>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center border-t border-zinc-800/50 bg-black/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-zinc-500 text-sm">&copy; {new Date().getFullYear()} Tujaque Strength. Hombres +18.</p>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-wider">
            <Link href="/legal/terms" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}