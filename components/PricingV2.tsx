"use client";

import React, { useMemo, useState } from "react";

// ─── TIPOS ───
export type PricingPlan = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
  idealFor?: string;
  actionLabel?: string;
};

type TabType = "weekly" | "monthly" | "static";

type PricingMatrix = Record<TabType, PricingPlan[]>;

// ─── DATA HARDCODEADA (Mantenida intacta) ───
const PRICING_MATRIX: PricingMatrix = {
  weekly: [
    {
      id: "semanal-3-4",
      title: "Inicio Rápido",
      subtitle: "3-4 DÍAS • ADAPTACIÓN",
      price: 25000,
      description:
        "Entrada al sistema para calibrar técnica y carga sin humo. Ideal para tu primer sprint.",
      features: ["Dashboard activo por 7 días", "Registro de métricas", "1 Auditoría de video clínica"],
      highlight: false,
      idealFor: "Ocupados / Primer contacto",
      actionLabel: "⚡ Ingreso Inmediato",
    },
    {
      id: "semanal-5-6",
      title: "Intensivo",
      subtitle: "5-6 DÍAS • CHOQUE",
      price: 37000,
      description: "Alta frecuencia para medir recuperación y técnica bajo fatiga severa.",
      features: ["Dashboard activo por 7 días", "Registro de métricas", "1 Auditoría de video clínica"],
      highlight: true,
      idealFor: "Intermedios serios",
      actionLabel: "🔥 Más Elegido",
    },
    {
      id: "semanal-7",
      title: "Full Semana",
      subtitle: "7 DÍAS • MÁXIMA EXIGENCIA",
      price: 45000,
      description: "Para los que entrenan todos los días y exigen una estructura estricta.",
      features: ["Dashboard activo por 7 días", "Registro de métricas", "1 Auditoría de video clínica"],
      highlight: false,
      idealFor: "Avanzados / Alto volumen",
      actionLabel: "⚙️ Requiere Disciplina",
    },
  ],
  monthly: [
    {
      id: "mensual-3-4",
      title: "Mesociclo Base",
      subtitle: "3-4 DÍAS • CONSTANCIA",
      price: 60000,
      description: "Programación mensual con ajustes semanales para progresar sin quemarte el SNC.",
      features: ["Programación dinámica", "Control de fatiga diario", "🤖 Tujague AI 24/7"],
      highlight: false,
      idealFor: "Progreso estable a largo plazo",
      actionLabel: "🤖 AI Habilitada",
    },
    {
      id: "mensual-5-6",
      title: "Pro Performance",
      subtitle: "5-6 DÍAS • EVOLUCIÓN",
      price: 115000,
      description: "El estándar del atleta: volumen óptimo, corrección técnica y ajustes continuos.",
      features: ["Programación dinámica", "Control de fatiga diario", "🤖 Tujague AI 24/7", "Correcciones en Video"],
      highlight: true,
      idealFor: "Atletas comprometidos",
      actionLabel: "⭐ Plan Recomendado VIP",
    },
    {
      id: "mensual-7",
      title: "Élite Total",
      subtitle: "7 DÍAS • MAESTRÍA",
      price: 135000,
      description: "Máxima exigencia, máxima estructura. Definitivamente no apto para principiantes.",
      features: ["Programación dinámica", "Control de fatiga diario", "🤖 Tujague AI 24/7", "Monitoreo Diario Estricto"],
      highlight: false,
      idealFor: "Competidores / Élite",
      actionLabel: "👑 Nivel Máximo",
    },
  ],
  static: [
    {
      id: "static-fuerza",
      title: "Fuerza Base",
      subtitle: "4 SEMANAS • PLANO CRUDO",
      price: 35000,
      description:
        "Bloque estático para fuerza. Estructura pura BII-Vintage, sin soporte personalizado.",
      features: ["Estructura exacta BII", "✗ Sin revisión de videos", "✗ Sin Tujague AI", "✗ Sin contacto con el Coach"],
      highlight: false,
      idealFor: "Autodidactas enfocados en fuerza",
      actionLabel: "🔒 Modo Independiente",
    },
    {
      id: "static-hipertrofia",
      title: "Mutación",
      subtitle: "4 SEMANAS • PLANO CRUDO",
      price: 35000,
      description:
        "Bloque estático para hipertrofia. Volumen y técnicas de intensidad pre-armadas.",
      features: ["Selección de accesorios", "✗ Sin revisión de videos", "✗ Sin Tujague AI", "✗ Sin contacto con el Coach"],
      highlight: false,
      idealFor: "Autodidactas enfocados en estética",
      actionLabel: "🔒 Modo Independiente",
    },
  ],
};

// ─── COMPONENTE PRINCIPAL ───
interface PricingV2Props {
  onSelectPlan: (plan: PricingPlan) => void;
  defaultTab?: TabType;
}

export default function PricingV2({ onSelectPlan, defaultTab = "monthly" }: PricingV2Props) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const currentPlans = useMemo(() => PRICING_MATRIX[activeTab], [activeTab]);

  // Recomendación automática: highlight o del medio
  const handleRecommendPlan = () => {
    const plans = PRICING_MATRIX[activeTab];
    const recommended = plans.find((p) => p.highlight) || plans[Math.floor(plans.length / 2)] || plans[0];
    if (recommended) onSelectPlan(recommended);
  };

  const scrollToGrid = () => {
    const grid = document.getElementById("pricing-grid-top");
    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="pricing-grid-top" className="w-full relative z-20 pt-16 sm:pt-20 pb-24 px-4 sm:px-6 bg-[#020202]">
      <div className="max-w-7xl mx-auto text-center">
        {/* HEADER */}
        <div className="mb-10 sm:mb-14">
          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            Catálogo de Estructuras
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic text-white tracking-tighter drop-shadow-md">
            ELEGÍ TU <span className="text-emerald-500">CAMINO</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-medium mt-4 max-w-3xl mx-auto">
            Elegí por frecuencia, presupuesto y nivel de soporte. Acá no hay “planes genéricos”: hay estructura.
          </p>
        </div>

        {/* TABS */}
        <div className="inline-flex flex-col sm:flex-row bg-[#0a0a0c] sm:backdrop-blur-xl p-2 rounded-3xl sm:rounded-[2rem] border border-zinc-800 mb-10 sm:mb-16 shadow-2xl w-full sm:w-auto">
          {[
            { id: "weekly", label: "Semanales" },
            { id: "monthly", label: "Mensuales VIP" },
            { id: "static", label: "Estáticos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              aria-label={`Ver planes ${tab.label}`}
              className={`px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-[11px] sm:text-xs font-black transition-all duration-300 tracking-[0.2em] uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full sm:w-auto ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GRID DE PLANS */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mx-auto mb-20 ${
            currentPlans.length === 2 ? "max-w-4xl" : "max-w-7xl"
          }`}
        >
          {currentPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border backdrop-blur-md text-left transition-all duration-500 group ${
                plan.highlight
                  ? "bg-[#0a0a0c] border-emerald-500 hover:shadow-[0_20px_60px_rgba(16,185,129,0.2)] md:-translate-y-4"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/80 hover:shadow-2xl"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black text-[9px] sm:text-[10px] font-black px-6 py-2 rounded-full tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.5)] whitespace-nowrap z-10 border border-emerald-300">
                  RECOMENDADO POR EL COACH
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tight mb-1">
                  {plan.title}
                </h3>
                <p className="text-emerald-500 font-bold tracking-[0.2em] text-[9px] sm:text-[10px] uppercase">
                  {plan.subtitle}
                </p>
              </div>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-xl sm:text-2xl font-black text-zinc-500 mb-1">$</span>
                <span className="text-4xl sm:text-5xl font-black italic text-white tracking-tighter leading-none">
                  {plan.price.toLocaleString("es-AR")}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-500 tracking-widest uppercase mb-1">
                  /{activeTab === "weekly" ? "SEM" : activeTab === "monthly" ? "MES" : "ÚNICO"}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-black/50 border border-zinc-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-6 self-start">
                <span className={`w-2 h-2 rounded-full ${plan.highlight ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
                {plan.actionLabel}
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-6">{plan.description}</p>

              <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl mb-8">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">
                  🎯 Ideal para:
                </p>
                <p className="text-xs sm:text-sm text-zinc-200 font-bold">{plan.idealFor}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => {
                  const isNegative = feature.includes("✗");
                  const clean = feature.replace("✗ ", "");
                  const isAI = clean.toLowerCase().includes("tujague ai");
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`font-black mt-0.5 text-sm ${isNegative ? "text-red-500/70" : "text-emerald-500"}`}>
                        {isNegative ? "✕" : "✓"}
                      </span>
                      <span
                        className={[
                          "text-sm font-medium",
                          isNegative ? "text-zinc-600" : "text-zinc-300",
                          isAI ? "text-blue-400 font-bold" : "",
                        ].join(" ")}
                      >
                        {clean}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={() => onSelectPlan(plan)}
                aria-label={`Seleccionar plan ${plan.title}`}
                className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] sm:text-xs transition-all duration-300 uppercase flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 ${
                  plan.highlight
                    ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                    : "bg-zinc-900 border border-zinc-700 text-white hover:bg-white hover:text-black hover:border-white"
                }`}
              >
                Elegir este Plan
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <p className="text-[9px] sm:text-[10px] text-zinc-500 font-medium text-center uppercase tracking-widest mt-4">
                {activeTab === "static" ? "Descarga Inmediata" : "Respuesta en 24-48hs • Sin Humo"}
              </p>
            </div>
          ))}
        </div>

        {/* =====================================================================
            🚀 SECCIÓN DE CONVERSIÓN (MARKETING)
            ===================================================================== */}
        <div className="max-w-7xl mx-auto space-y-20 sm:space-y-24 mt-10 sm:mt-16 border-t border-zinc-800/50 pt-16 sm:pt-20">
          {/* 1) TABLA COMPARATIVA */}
          <div className="text-left">
            <h3 className="text-3xl sm:text-4xl font-black italic text-white tracking-tighter uppercase mb-2">
              Comparativa de <span className="text-emerald-500">Sistemas</span>
            </h3>
            <p className="text-zinc-400 text-sm mb-8 font-medium">
              Entendé exactamente qué nivel de soporte se adapta a tu presupuesto y disciplina.
            </p>

            {/* FIX CLIP: sin badge con -top. Todo dentro del header. */}
            <div className="overflow-x-auto overflow-y-visible pb-4 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="align-bottom">
                    <th className="p-4 border-b border-zinc-800 font-black text-xs text-zinc-500 uppercase tracking-widest w-1/3">
                      Características
                    </th>

                    <th className="p-4 border-b border-zinc-800 font-black text-xs text-zinc-400 uppercase tracking-widest text-center w-1/5">
                      Semanales
                    </th>

                    <th className="p-4 border-b-2 border-emerald-500 bg-emerald-950/20 font-black text-xs text-center w-1/5 rounded-t-xl">
                      <div className="flex flex-col items-center justify-end gap-2">
                        <span className="bg-emerald-500 text-black text-[8px] px-3 py-1 rounded-full font-black tracking-widest whitespace-nowrap shadow-[0_0_18px_rgba(16,185,129,0.35)]">
                          MEJOR VALOR
                        </span>
                        <span className="text-emerald-400 uppercase tracking-widest">Mensuales VIP</span>
                      </div>
                    </th>

                    <th className="p-4 border-b border-zinc-800 font-black text-xs text-zinc-600 uppercase tracking-widest text-center w-1/5">
                      Estáticos
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm font-medium">
                  {[
                    { f: "Acceso a Dashboard Web", s: true, m: true, e: true },
                    { f: "Programación Dinámica (Evolutiva)", s: false, m: true, e: false },
                    { f: "Control de Fatiga (SNC)", s: true, m: true, e: false },
                    { f: "Tujague AI 24/7", s: false, m: true, e: false },
                    { f: "Corrección Técnica en Video", s: "1 Sesión", m: "ILIMITADO", e: false },
                    { f: "Soporte WhatsApp 1 a 1", s: false, m: true, e: false },
                    { f: "Entrega / Acceso", s: "24-48 hs", m: "24-48 hs", e: "Inmediato" },
                    { f: "Tipo de Inversión", s: "Renovable 7d", m: "Renovable 30d", e: "Pago Único" },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-zinc-900/30 transition-colors border-b border-zinc-800/50 last:border-0"
                    >
                      <td className="p-4 text-zinc-300">{row.f}</td>

                      <td className="p-4 text-center text-zinc-400">
                        {typeof row.s === "boolean" ? (
                          row.s ? (
                            <span className="text-emerald-500 font-bold">✓</span>
                          ) : (
                            <span className="text-red-500/50 font-bold">✕</span>
                          )
                        ) : (
                          <span className="text-zinc-300 font-bold text-xs">{row.s}</span>
                        )}
                      </td>

                      <td className="p-4 text-center bg-emerald-950/10 border-x border-emerald-900/20">
                        {typeof row.m === "boolean" ? (
                          row.m ? (
                            <span className="text-emerald-400 font-black text-lg">✓</span>
                          ) : (
                            <span className="text-red-500/50 font-bold">✕</span>
                          )
                        ) : (
                          <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">
                            {row.m}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center text-zinc-600">
                        {typeof row.e === "boolean" ? (
                          row.e ? (
                            <span className="text-emerald-500/50 font-bold">✓</span>
                          ) : (
                            <span className="text-zinc-700 font-bold">✕</span>
                          )
                        ) : (
                          <span className="text-zinc-500 font-bold text-xs">{row.e}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-4">
              Tip: VIP = ajustes + soporte + AI. Estáticos = “mapa” sin acompañamiento.
            </p>
          </div>

          {/* 2) Por qué VIP + Mini guía */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 text-left">
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0a0a0c] to-zinc-900/40 p-8 sm:p-10 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />
              <h4 className="text-2xl font-black italic uppercase text-white mb-6 tracking-tight relative z-10">
                Por qué el <span className="text-emerald-500">VIP funciona</span>
              </h4>
              <ul className="space-y-5 relative z-10">
                {[
                  {
                    t: "Ajustes semanales, no adivinanza",
                    d: "La carga se calibra según lo que hiciste hoy, no según un Excel genérico.",
                  },
                  {
                    t: "Control de fatiga preciso",
                    d: "Progresá sin freír articulaciones ni el SNC.",
                  },
                  {
                    t: "Corrección técnica severa",
                    d: "Una mala palanca te cuesta kilos. Se corrige rápido o te estancás.",
                  },
                  {
                    t: "AI + Coach",
                    d: "Soporte continuo: dudas técnicas/nutri/biomecánica sin quedarte a ciegas.",
                  },
                ].map((x, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-sm text-zinc-300 font-medium">
                    <span className="text-emerald-500 font-black text-lg mt-[-2px]">⚡</span>
                    <span>
                      <strong>{x.t}:</strong> {x.d}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <h4 className="text-2xl font-black italic uppercase text-white mb-6 tracking-tight">
                Mini-Guía: <span className="text-zinc-400">Tu Objetivo Exacto</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: "📈",
                    t: "Quiero subir marcas brutas",
                    d: "Periodización + técnica pesada.",
                    s: "👉 Sugerido: Pro o Élite",
                  },
                  {
                    icon: "🦍",
                    t: "Quiero mutar (Hipertrofia)",
                    d: "Volumen + fallo real (RIR 0) con control.",
                    s: "👉 Sugerido: Pro o Mutación",
                  },
                  {
                    icon: "⏱️",
                    t: "Tengo poco tiempo",
                    d: "3 días bien hechos > 6 días de volumen basura.",
                    s: "👉 Sugerido: Mesociclo Base",
                  },
                  {
                    icon: "🐺",
                    t: "Soy autodidacta",
                    d: "Querés el mapa, sin acompañamiento.",
                    s: "👉 Sugerido: Estáticos (PDF)",
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0a0a0c] border border-zinc-800 p-6 rounded-[1.5rem] hover:border-emerald-500/50 transition-colors"
                  >
                    <span className="text-2xl block mb-3">{card.icon}</span>
                    <p className="font-black text-white uppercase text-sm mb-1">{card.t}</p>
                    <p className="text-xs text-zinc-400 font-medium mb-3">{card.d}</p>
                    <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">{card.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3) Transparencia */}
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] text-center max-w-4xl mx-auto shadow-inner">
            <span className="text-3xl block mb-4 opacity-80">⚖️</span>
            <h4 className="text-lg font-black uppercase text-white tracking-widest mb-3">
              Transparencia Operativa
            </h4>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto">
              <strong>Sin humo:</strong> no mandamos PDFs random por correo. Todo opera en tu Dashboard.{" "}
              <br className="hidden sm:block" />
              Estáticos = modo autodidacta sin soporte. VIP = ajustes + control + corrección.
              <br className="hidden sm:block" />
              VIP demora <span className="text-emerald-400 font-bold">24 a 48hs hábiles</span> tras tu alta clínica.
              Estáticos = <span className="text-emerald-400 font-bold">acceso inmediato</span>.
            </p>
          </div>

          {/* 4) CTA Final */}
          <div className="text-center bg-[#0a0a0c] border border-emerald-900/50 p-10 sm:p-16 rounded-[3rem] shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] bg-emerald-500/10 blur-[90px] pointer-events-none" />
            <h3 className="text-4xl sm:text-5xl font-black italic text-white uppercase tracking-tighter mb-4 relative z-10">
              ¿Listo para entrenar en serio?
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base font-medium mb-10 relative z-10">
              El progreso real exige una estructura que no negocia excusas.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto relative z-10">
              <button
                onClick={scrollToGrid}
                aria-label="Volver arriba para elegir plan"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
              >
                Elegir Mi Plan Ahora
              </button>

              <button
                onClick={handleRecommendPlan}
                aria-label="Seleccionar plan recomendado"
                className="w-full sm:w-auto bg-transparent border border-zinc-700 hover:border-emerald-500 text-zinc-300 hover:text-emerald-400 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Recomiéndame Uno
              </button>
            </div>

            <p className="text-[10px] sm:text-xs text-zinc-500 font-black uppercase tracking-widest mt-8 relative z-10 opacity-70">
              Sin humo. Sin volumen basura. Progreso medible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}