"use client";

import React from "react";

// ─── TIPOS ───
export type PricingPlan = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number; // 🔥 NUEVO: Para el precio tachado
  currency: "ARS" | "USD";
  description: string;
  features: string[];
  highlight?: boolean;
  idealFor?: string;
  actionLabel?: string;
  tier: "static" | "elite_3m" | "elite_6m" | "elite_12m"; 
};

// ─── ESCALERA DE VALOR HIGH-TICKET ───
const PLANS: PricingPlan[] = [
  // --- NIVEL 1: BÓVEDA ESTÁTICA (Mantiene su lógica original) ---
  {
    id: "static-fuerza",
    title: "Fuerza Base",
    subtitle: "4 SEMANAS • PLANO CRUDO",
    price: 35000,
    currency: "ARS",
    description: "Bloque estático para fuerza. Estructura pura BII-Vintage, sin soporte personalizado.",
    features: ["Estructura exacta BII", "Calculadoras de Carga", "✗ Sin revisión de videos", "✗ Sin Tujague AI", "✗ Sin contacto con el Coach"],
    idealFor: "Autodidactas / Bajo Presupuesto",
    actionLabel: "🔒 MODO INDEPENDIENTE",
    tier: "static",
  },
  {
    id: "static-hipertrofia",
    title: "Mutación",
    subtitle: "4 SEMANAS • PLANO CRUDO",
    price: 35000,
    currency: "ARS",
    description: "Bloque estático para hipertrofia. Volumen y técnicas de intensidad pre-armadas.",
    features: ["Selección de accesorios", "Calculadoras de Carga", "✗ Sin revisión de videos", "✗ Sin Tujague AI", "✗ Sin contacto con el Coach"],
    idealFor: "Estética y volumen al fallo",
    actionLabel: "🔒 MODO INDEPENDIENTE",
    tier: "static",
  },
  {
    id: "mesociclo-definicion-4-semanas",
    title: "Definición (Cut)",
    subtitle: "4 SEMANAS • PLANO CRUDO",
    price: 35000,
    currency: "ARS",
    description: "Bloque estático para definición. Protocolo para perder grasa reteniendo el 100% de fuerza.",
    features: ["Protocolo Déficit Calórico", "Calculadoras de Carga", "✗ Sin revisión de videos", "✗ Sin Tujague AI", "✗ Sin contacto con el Coach"],
    idealFor: "Pérdida de Grasa",
    actionLabel: "🔥 MODO INDEPENDIENTE",
    tier: "static",
  },

  // --- NIVEL 2: MENTORÍA ÉLITE (El Core del Negocio) ---
  {
    id: "elite-90-dias",
    title: "Élite 90 Días",
    subtitle: "ACCESO 3 MESES",
    price: 250,
    originalPrice: 450,
    currency: "USD",
    description: "El punto de entrada. Asegurá tu lugar y accedé a toda mi tecnología de programación y auditoría técnica.",
    features: [
      "🧠 Programación dinámica x Fatiga",
      "🤖 Tujague AI System (Biomecánica y Nutrición)",
      "📹 Corrección de Video Semanal en Dashboard",
      "✗ Sin soporte por WhatsApp",
      "✗ Sin videollamadas 1 a 1"
    ],
    idealFor: "Compromiso Inicial",
    actionLabel: "🚀 INICIAR 90 DÍAS",
    tier: "elite_3m",
  },
  {
    id: "elite-180-dias",
    title: "Élite 180 Días",
    subtitle: "ACCESO 6 MESES",
    price: 390,
    originalPrice: 800,
    currency: "USD",
    description: "Mi programa insignia. Tiempo suficiente para destrozar tus marcas genéticas, con línea directa a mi teléfono.",
    features: [
      "🧠 Programación dinámica x Fatiga",
      "🤖 Tujague AI System",
      "📹 Corrección de Video Prioritaria",
      "📱 Soporte directo por WhatsApp L-V",
      "⚡ 1 Clínica Biomecánica (Llamada Inicial)"
    ],
    highlight: true, // Esto hace que la caja brille y resalte
    idealFor: "El 80% de los Atletas (Máximo Valor)",
    actionLabel: "🔥 INICIAR 180 DÍAS",
    tier: "elite_6m",
  },
  {
    id: "leyenda-365-dias",
    title: "Leyenda BII",
    subtitle: "ACCESO 1 AÑO",
    price: 690,
    originalPrice: 1500,
    currency: "USD",
    description: "Para los que buscan mutar por completo o competir. El nivel más alto de cercanía y detalle técnico posible.",
    features: [
      "Todo lo incluido en Élite 180 Días",
      "📱 WhatsApp VIP (Respuesta en <12h)",
      "📹 Corrección de Video Inmediata",
      "⚡ 1 Videollamada de Ajuste MENSUAL",
      "👑 Prioridad Absoluta de Cupo"
    ],
    idealFor: "Competidores / Cambio Radical",
    actionLabel: "👑 CONVERTIRME EN LEYENDA",
    tier: "elite_12m",
  },
];

interface PricingV2Props {
  onSelectPlan: (plan: PricingPlan) => void;
}

export default function PricingV2({ onSelectPlan }: PricingV2Props) {
  
  const staticPlans = PLANS.filter(p => p.tier === "static");
  const elitePlans = PLANS.filter(p => p.tier !== "static");

  return (
    <section id="cajas-nuevas" className="w-full relative z-20 pt-16 pb-24 px-4 sm:px-6 bg-[#000000] border-t border-zinc-800/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_60%)] pointer-events-none transform-gpu"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER PRINCIPAL */}
        <div className="text-center mb-16">
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            Aplicación Abierta
          </span>
          <h2 className="text-4xl md:text-7xl font-black italic text-white tracking-tighter uppercase drop-shadow-md">
            ELEGÍ TU <span className="text-amber-500">COMPROMISO</span>
          </h2>
        </div>

        {/* ─── BLOQUE 1: MENTORÍA ÉLITE (LOS 3 PLANES HIGH TICKET) ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Mentoría <span className="text-amber-500">Élite</span></h3>
            <div className="h-px bg-zinc-800/80 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {elitePlans.map((plan) => (
              <div key={plan.id} className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group ${plan.highlight ? "bg-gradient-to-b from-zinc-900 to-[#0a0a0c] border-amber-500 shadow-[0_20px_60px_rgba(245,158,11,0.15)] md:-translate-y-4 z-10" : "bg-[#050505] border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50 hover:shadow-2xl"}`}>
                
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black px-5 py-2 rounded-full tracking-[0.2em] z-10 shadow-[0_0_20px_rgba(245,158,11,0.5)] whitespace-nowrap">
                    EL MEJOR VALOR
                  </div>
                )}
                
                <div className="mb-6 text-center">
                  <p className={`${plan.highlight ? 'text-amber-500' : 'text-zinc-500'} font-black tracking-[0.2em] text-[10px] uppercase mb-2`}>{plan.subtitle}</p>
                  <h3 className={`text-3xl font-black italic uppercase tracking-tight ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.title}</h3>
                </div>
                
                {/* PRECIOS CON ANCLAJE (TACHADO) */}
                <div className="mb-8 text-center flex flex-col items-center border-b border-zinc-800/80 pb-8">
                  {plan.originalPrice && (
                     <div className="text-zinc-500 font-bold text-sm mb-1 flex items-center gap-2">
                        <span>Valor Oficial:</span>
                        <span className="line-through decoration-red-500/50 decoration-2">USD ${plan.originalPrice}</span>
                     </div>
                  )}
                  <div className="flex items-start justify-center gap-1 mb-2">
                    <span className={`text-2xl font-black mt-2 ${plan.highlight ? 'text-amber-500' : 'text-zinc-400'}`}>USD $</span>
                    <span className={`text-6xl font-black italic tracking-tighter leading-none ${plan.highlight ? 'text-amber-500 drop-shadow-md' : 'text-white'}`}>{plan.price}</span>
                  </div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2 bg-zinc-900 px-3 py-1 rounded-full">
                    Pago Único • Multiplica x Tipo de Cambio para ARS
                  </p>
                </div>

                <div className="bg-black/50 border border-zinc-800/80 p-4 rounded-2xl mb-8 flex items-center gap-3">
                  <span className="text-2xl">{plan.tier === "elite_12m" ? "👑" : "🎯"}</span>
                  <div>
                    <p className="text-[9px] font-black text-amber-500/70 uppercase tracking-[0.2em]">Perfil Ideal</p>
                    <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">{plan.idealFor}</p>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-8 text-center min-h-[60px]">{plan.description}</p>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => {
                    const isNegative = feature.includes("✗");
                    const clean = feature.replace("✗ ", "");
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <span className={`font-black mt-0.5 text-base ${isNegative ? "text-red-500/50" : "text-amber-500"}`}>{isNegative ? "✕" : "✓"}</span>
                        <span className={`text-xs font-bold leading-relaxed ${isNegative ? "text-zinc-600 line-through decoration-zinc-800" : (plan.highlight ? "text-white" : "text-zinc-300")}`}>{clean}</span>
                      </li>
                    );
                  })}
                </ul>

                <button onClick={() => onSelectPlan(plan)} className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] text-[11px] uppercase transition-all active:scale-95 flex justify-center items-center gap-2 ${plan.highlight ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02]" : "bg-zinc-100 hover:bg-white text-black shadow-lg"}`}>
                  {plan.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 🔥 BARRA DE CONFIANZA Y ESCASEZ 🔥 */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-[#050505] border border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-inner">
             <div className="flex items-center gap-3 mb-4 md:mb-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <p className="text-white font-bold text-xs sm:text-sm tracking-widest uppercase">
                  Alerta de Ingreso: <span className="text-zinc-400 font-medium">Solo 5 cupos disponibles activos.</span>
                </p>
             </div>
             
             <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
                <span className="text-lg md:text-xl" title="Mercado Pago">🤝</span>
                <span className="text-lg md:text-xl" title="Tarjetas Globales">💳</span>
                <span className="text-lg md:text-xl" title="Criptomonedas (USDT/BTC)">₿</span>
                <div className="h-4 w-px bg-zinc-700"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Checkout Encriptado</span>
             </div>
          </div>

        {/* ─── BLOQUE 2: BÓVEDA ESTÁTICA (OFERTA LOW-TICKET) ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-black italic text-zinc-500 uppercase tracking-tighter">Bóveda <span className="text-zinc-300">Estática</span></h3>
            <div className="h-px bg-zinc-800/80 flex-grow"></div>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 items-stretch pb-6 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
            {staticPlans.map((plan) => (
              <div key={plan.id} className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 flex-shrink-0 snap-center relative flex flex-col p-8 rounded-[2.5rem] border bg-[#050505] border-zinc-800 hover:border-zinc-500 transition-all duration-500 group">
                <div className="mb-6">
                  <h3 className="text-xl font-black italic text-zinc-300 uppercase tracking-tight mb-1">{plan.title}</h3>
                  <p className="text-zinc-600 font-bold tracking-[0.2em] text-[9px] uppercase">{plan.subtitle}</p>
                </div>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-xl font-black text-zinc-600 mb-1">{plan.currency === "USD" ? "USD $" : "ARS $"}</span>
                  <span className="text-4xl font-black italic text-zinc-200 tracking-tighter leading-none">{plan.price.toLocaleString("es-AR")}</span>
                </div>
                <div className="bg-black border border-zinc-800/80 p-3 rounded-xl mb-6">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">🎯 Ideal para:</p>
                  <p className="text-xs text-zinc-400 font-bold">{plan.idealFor}</p>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium mb-6 min-h-[60px]">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => {
                    const isNegative = feature.includes("✗");
                    const clean = feature.replace("✗ ", "");
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`font-black mt-[1px] text-sm ${isNegative ? "text-zinc-800" : "text-zinc-500"}`}>{isNegative ? "✕" : "✓"}</span>
                        <span className={`text-[11px] font-medium ${isNegative ? "text-zinc-700" : "text-zinc-400"}`}>{clean}</span>
                      </li>
                    );
                  })}
                </ul>
                <button onClick={() => onSelectPlan(plan)} className="w-full py-4 rounded-xl font-black tracking-widest text-[10px] uppercase transition-all active:scale-95 bg-transparent text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-500">
                  {plan.actionLabel}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 md:hidden">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">← Deslizá para ver más →</span>
          </div>
        </div>

        {/* ─── TABLA COMPARATIVA ACTUALIZADA ─── */}
        <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 sm:p-12 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black italic text-white uppercase mb-2 tracking-tighter">Comparativa de <span className="text-amber-500">Accesos</span></h3>
            <p className="text-zinc-400 text-sm font-medium">Analizá qué nivel de soporte necesitás para mutar de verdad.</p>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 align-bottom">
                  <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-1/4">Armamento</th>
                  <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center w-1/5">Estáticos (PDF)</th>
                  <th className="p-4 text-[10px] font-black text-white uppercase tracking-widest text-center w-1/5">Élite (3 Meses)</th>
                  <th className="p-4 text-[10px] font-black text-amber-500 uppercase tracking-widest text-center w-1/5 bg-amber-950/10 rounded-t-2xl border-b-2 border-amber-500">Élite (6 Meses)</th>
                  <th className="p-4 text-[10px] font-black text-amber-300 uppercase tracking-widest text-center w-1/5">Leyenda (1 Año)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {[
                  { f: "Dashboard Web Privado", s: "✓ Calculadoras", m3: "✓ Acceso Total", m6: "✓ Acceso Total", m12: "✓ Acceso Total" },
                  { f: "IA (Tujague AI System)", s: "✕", m3: "✓ Ilimitado", m6: "✓ Ilimitado", m12: "✓ Ilimitado" },
                  { f: "Auditoría en Video", s: "✕", m3: "✓ Mensual", m6: "✓ Prioritaria", m12: "✓ Inmediata (<12hs)" },
                  { f: "Contacto WhatsApp", s: "✕", m3: "✕ (Solo Plataforma)", m6: "✓ Directo L-V", m12: "✓ VIP 24/7" },
                  { f: "Videollamadas 1 a 1", s: "✕", m3: "✕", m6: "✓ 1 Sesión Inicial", m12: "✓ 1 Sesión Mensual" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors text-xs">
                    <td className="p-4 text-zinc-300 font-bold">{row.f}</td>
                    <td className="p-4 text-center text-zinc-500">{row.s.includes('✓') ? <span className="text-zinc-400">{row.s}</span> : <span className="text-red-900 font-bold">✕</span>}</td>
                    <td className="p-4 text-center text-white">{row.m3.includes('✓') ? <span className="text-white">{row.m3}</span> : <span className="text-red-900 font-bold">✕</span>}</td>
                    <td className="p-4 text-center text-amber-400 font-bold bg-amber-950/10 border-x border-amber-900/20">{row.m6.includes('✓') ? <span className="text-amber-500">{row.m6}</span> : <span className="text-red-900 font-bold">✕</span>}</td>
                    <td className="p-4 text-center text-amber-200">{row.m12.includes('✓') ? <span className="text-amber-300">{row.m12}</span> : <span className="text-red-900 font-bold">✕</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}