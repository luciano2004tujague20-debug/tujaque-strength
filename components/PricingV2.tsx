"use client";

import React from "react";

// ─── TIPOS (Solucionado el error de subtitle) ───
export type PricingPlan = {
  id: string;
  title: string;
  subtitle: string; // 🔥 Restaurado para compatibilidad con todo el JSX
  price: number;
  originalPrice?: number;
  installmentPriceARS?: number; // 🔥 Valor exacto de CADA cuota financiada
  currency: "ARS" | "USD";
  description: string;
  features: string[];
  highlight?: boolean;
  idealFor?: string;
  actionLabel?: string;
  tier: "static" | "elite_3m" | "elite_6m" | "elite_12m"; 
};

// 🔥 NUEVAS FUNCIONALIDADES (Tecnología Tujague, sacando lo viejo) 🔥
const baseEliteFeatures = [
  "Dashboard Web Privado de Alto Rendimiento.",
  "Programación dinámica auto-rregulada (RPE/RIR).",
  "Tujague AI: Asistente Biomecánico 24/7.",
  "Tujague AI: Nutricionista y Chef Inteligente.",
  "Auditoría de recuperación y fatiga (SNC).",
  "Bóveda Técnica (Librería de ejercicios BII).",
  "Kit Acelerador (Guías y Suplementación).",
  "Botón de Pánico (Recalibración por lesiones).",
  "Programa de Afiliados (Ganá tu cuota)."
];

// ─── ESCALERA DE VALOR HIGH-TICKET (Precios Mazza + Tecnología Tujague) ───
const PLANS: PricingPlan[] = [
  // --- NIVEL 1: BÓVEDA ESTÁTICA ---
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

  // --- NIVEL 2: MENTORÍA ÉLITE (Precios Competencia Directa Mazza) ---
  {
    id: "elite-90-dias",
    title: "Élite 90 Días",
    subtitle: "ACCESO 3 MESES", // 🔥 Mapeado de duration a subtitle
    price: 289999, // Igualado a Shark Warrior
    originalPrice: 379000,
    installmentPriceARS: 96666, 
    currency: "ARS",
    description: "El punto de entrada. Asegurá tu lugar y accedé a toda mi tecnología de programación y auditoría técnica.",
    features: [
      ...baseEliteFeatures,
      "Corrección técnica por video mensual.",
      "Soporte exclusivo vía plataforma."
    ],
    idealFor: "Compromiso Inicial",
    actionLabel: "🚀 UNITE AHORA",
    tier: "elite_3m",
  },
  {
    id: "elite-180-dias",
    title: "Élite 180 Días",
    subtitle: "ACCESO 6 MESES", // 🔥 Mapeado de duration a subtitle
    price: 499999, // Igualado a Shark Elite
    originalPrice: 779000,
    installmentPriceARS: 166666, 
    currency: "ARS",
    description: "Mi programa insignia. Tiempo suficiente para destrozar tus marcas genéticas, con línea directa a mi teléfono.",
    features: [
      ...baseEliteFeatures,
      "Corrección técnica por video prioritaria.",
      "Soporte directo por WhatsApp L-V.",
      "1 Clínica Biomecánica (Llamada Inicial)."
    ],
    highlight: true,
    idealFor: "El 80% de los Atletas (Máximo Valor)",
    actionLabel: "🔥 UNITE AHORA",
    tier: "elite_6m",
  },
  {
    id: "leyenda-365-dias",
    title: "Leyenda BII",
    subtitle: "ACCESO 1 AÑO", // 🔥 Mapeado de duration a subtitle
    price: 999999, // Igualado a Shark Legend
    originalPrice: 1499999,
    installmentPriceARS: 333333, 
    currency: "ARS",
    description: "Para los que buscan mutar por completo o competir. El nivel más alto de cercanía y detalle técnico posible.",
    features: [
      ...baseEliteFeatures,
      "Corrección técnica de video inmediata.",
      "WhatsApp VIP L-D 24/7.",
      "1 Videollamada de ajuste MENSUAL."
    ],
    idealFor: "Competidores / Cambio Radical",
    actionLabel: "👑 UNITE AHORA",
    tier: "elite_12m",
  },
];

interface PricingV2Props {
  onSelectPlan: (plan: PricingPlan) => void;
}

// Icono de Check estilo Shark (Cuadrado naranja)
const SharkCheck = () => (
  <div className="w-[18px] h-[18px] bg-[#ff4500] rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

// Logos de pago de confianza
const PaymentLogos = () => (
  <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-zinc-800/80 opacity-50 grayscale">
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      <span className="text-[8px] uppercase tracking-widest font-black leading-tight">Compra<br/>Segura</span>
    </div>
    <div className="flex items-center gap-1.5 ml-2">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      <span className="text-[8px] uppercase tracking-widest font-black leading-tight">Información<br/>Protegida</span>
    </div>
    <div className="h-4 w-px bg-zinc-700 mx-1"></div>
    <span className="font-black italic text-xs">VISA</span>
    <span className="font-black italic text-xs">MC</span>
    <span className="font-black italic text-xs">MP</span>
  </div>
);

export default function PricingV2({ onSelectPlan }: PricingV2Props) {
  
  const staticPlans = PLANS.filter(p => p.tier === "static");
  const elitePlans = PLANS.filter(p => p.tier !== "static");

  return (
    <section id="cajas-nuevas" className="w-full relative z-20 pt-16 pb-24 px-4 sm:px-6 bg-[#0a0a0a] border-t border-zinc-800/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle,rgba(255,69,0,0.05)_0%,transparent_60%)] pointer-events-none transform-gpu"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER PRINCIPAL (Restaurado) */}
        <div className="text-center mb-16">
          <span className="bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-[0_0_15px_rgba(255,69,0,0.1)]">
            Aplicación Abierta
          </span>
          <h2 className="text-4xl md:text-7xl font-black italic text-white tracking-tighter uppercase drop-shadow-md">
            ELEGÍ TU <span className="text-[#ff4500]">COMPROMISO</span>
          </h2>
        </div>

        {/* ─── BLOQUE 1: MENTORÍA ÉLITE (Precios Competencia + Diseño Shark) ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Mentoría <span className="text-[#ff4500]">Élite</span> High-Ticket</h3>
            <div className="h-px bg-zinc-800/80 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {elitePlans.map((plan) => (
              <div key={plan.id} className={`relative flex flex-col p-8 rounded-[20px] border transition-all duration-300 group ${plan.highlight ? "bg-[#141414] border-[#ff4500] shadow-[0_20px_60px_rgba(255,69,0,0.15)] md:-translate-y-4 z-10" : "bg-[#111111] border-zinc-800 hover:border-zinc-600 hover:shadow-2xl"}`}>
                
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#222] border border-[#ff4500] text-amber-500 text-[9px] font-black px-5 py-2 rounded-full tracking-[0.2em] z-10 shadow-[0_0_20px_rgba(255,69,0,0.5)] whitespace-nowrap">
                    MÁS ELEGIDO
                  </div>
                )}
                
                <div className="mb-6 text-center">
                  <h3 className={`text-3xl font-black uppercase tracking-tight text-[#ff4500] mb-2`}>{plan.title}</h3>
                  <p className="text-zinc-300 font-black tracking-widest text-[10px] uppercase">{plan.subtitle}</p>
                </div>
                
                {/* 🔥 ESTRATEGIA HIGH-TICKET DUAL VISUAL 🔥 */}
                <div className="mb-8 text-center flex flex-col items-center border-b border-zinc-800/80 pb-8">
                  
                  {/* El Anclaje (El precio falso gigante y tachado) */}
                  {plan.originalPrice && (
                     <div className="text-red-500/80 font-black text-lg line-through mb-1">
                        ${plan.originalPrice.toLocaleString('es-AR')}
                     </div>
                  )}

                  {/* El Precio Total Real al Contado */}
                  <div className="text-white font-black text-5xl tracking-tighter mb-3 flex items-start justify-center gap-1">
                    <span className="text-2xl mt-1">$</span>
                    {plan.price.toLocaleString('es-AR')}
                  </div>

                  {/* EL GOLPE VISUAL: La cuota financiada al estilo Shark */}
                  {plan.installmentPriceARS ? (
                      <div className="text-zinc-100 font-bold text-sm md:text-base uppercase tracking-wide bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                        O 3 cuotas de <span className="text-[#ff4500]">${plan.installmentPriceARS.toLocaleString('es-AR')}</span>
                      </div>
                  ) : (
                      <div className="text-zinc-500 font-bold text-xs uppercase tracking-wide mt-2">
                        Pago único al contado
                      </div>
                  )}
                </div>

                <div className="bg-black/50 border border-zinc-800/80 p-4 rounded-2xl mb-8 flex items-center gap-3 relative z-10">
                  <span className="text-2xl">{plan.tier === "elite_12m" ? "👑" : "🎯"}</span>
                  <div>
                    <p className="text-[9px] font-black text-[#ff4500]/70 uppercase tracking-[0.2em]">Perfil Ideal</p>
                    <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">{plan.idealFor}</p>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-8 text-center min-h-[60px] relative z-10">{plan.description}</p>
                
                <ul className="space-y-4 mb-10 flex-grow relative z-10">
                  {plan.features.map((feature, idx) => {
                    const isNegative = feature.includes("✗");
                    const clean = feature.replace("✗ ", "");
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        {isNegative ? (
                            <span className="font-black mt-0.5 text-base text-zinc-700">✕</span>
                        ) : (
                            <SharkCheck />
                        )}
                        <span className={`text-xs md:text-sm font-medium leading-relaxed ${isNegative ? "text-zinc-600 line-through decoration-zinc-800" : "text-zinc-300"}`}>{clean}</span>
                      </li>
                    );
                  })}
                </ul>

                <button onClick={() => onSelectPlan(plan)} className={`w-full py-5 rounded-xl font-black tracking-[0.1em] text-sm uppercase transition-all relative z-10 active:scale-95 flex justify-center items-center gap-2 ${plan.highlight ? "bg-gradient-to-r from-[#ff5e00] to-[#ff4500] hover:from-[#ff4500] hover:to-[#e63e00] text-white shadow-[0_5px_20px_rgba(255,69,0,0.3)] hover:scale-[1.02]" : "bg-zinc-800 hover:bg-zinc-700 text-white shadow-lg"}`}>
                  {plan.actionLabel}
                </button>

                <PaymentLogos />
              </div>
            ))}
          </div>
        </div>
        
        {/* 🔥 BARRA DE CONFIANZA Y ESCASEZ (Restaurada Totalmente) 🔥 */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-[#111] border border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-inner animate-in fade-in duration-500">
             <div className="flex items-center gap-3 mb-4 md:mb-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <p className="text-white font-black text-xs sm:text-sm tracking-widest uppercase flex flex-col sm:flex-row sm:gap-2">
                  <span>Alerta de Cupo Absoluto:</span>
                  <span className="text-red-400 font-bold bg-red-500/10 px-2 rounded">Solo quedan 5 lugares activos esta semana.</span>
                </p>
             </div>
             
             <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default border-l border-zinc-800 pl-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Checkout Seguro:</span>
                <span className="text-lg md:text-xl" title="Mercado Pago">🤝💳</span>
                <span className="text-lg md:text-xl" title="Criptomonedas">₿⚡</span>
             </div>
          </div>

        {/* ─── BLOQUE 2: BÓVEDA ESTÁTICA (Restaurado Completo) ─── */}
        <div className="mb-20 mt-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
            <h3 className="text-2xl font-black italic text-zinc-500 uppercase tracking-tighter">Bóveda <span className="text-zinc-300">Estática</span> Vintage BII</h3>
            <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest">(Planos PDF - Sin Soporte Técnico)</span>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 items-stretch pb-6 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
            {staticPlans.map((plan) => (
              <div key={plan.id} className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 flex-shrink-0 snap-center relative flex flex-col p-8 rounded-[20px] border bg-[#111] border-zinc-800 hover:border-zinc-500 transition-all duration-500 group shadow-lg hover:-translate-y-1">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1 text-zinc-400">{plan.title}</h3>
                  <p className="text-zinc-600 font-bold tracking-[0.2em] text-[9px] uppercase bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 inline-block">{plan.subtitle}</p>
                </div>
                <div className="flex flex-col items-center justify-center mb-7 border-b border-zinc-800 pb-7">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Pago Único (PDF)</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-2xl font-black text-zinc-600 mb-1.5">$</span>
                      <span className="text-5xl font-black italic text-white tracking-tighter leading-none">{plan.price.toLocaleString("es-AR")}</span>
                      <span className="text-zinc-700 font-bold text-xs self-end mb-1">ARS</span>
                    </div>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium mb-7 text-center min-h-[60px]">{plan.description}</p>
                <ul className="space-y-3 mb-10 flex-grow border-t border-zinc-800 pt-7">
                  {plan.features.map((feature, idx) => {
                    const isNegative = feature.includes("✗");
                    const clean = feature.replace("✗ ", "");
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`font-black mt-[1px] text-sm shrink-0 ${isNegative ? "text-red-900" : "text-zinc-600"}`}>{isNegative ? "✕" : "✓"}</span>
                        <span className={`text-[12px] md:text-xs font-medium leading-relaxed ${isNegative ? "text-zinc-700" : "text-zinc-400"}`}>{clean}</span>
                      </li>
                    );
                  })}
                </ul>
                <button onClick={() => onSelectPlan(plan)} className="w-full py-4 rounded-xl font-black tracking-widest text-[11px] uppercase transition-all active:scale-95 bg-black border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 shadow-md">
                  {plan.actionLabel}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 md:hidden">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest animate-pulse">← Deslizá para ver todos →</span>
          </div>
        </div>

        {/* ─── TABLA COMPARATIVA DE TECNOLOGÍA (Restaurada y Actualizada a Tujague) ─── */}
        <div className="bg-[#111] border border-zinc-800/80 p-8 sm:p-14 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md max-w-6xl mx-auto">
          <div className="mb-10 text-center sm:text-left border-b border-zinc-800 pb-8">
            <h3 className="text-2xl sm:text-3xl font-black italic text-white uppercase mb-3 tracking-tighter leading-none">Comparativa de <span className="text-[#ff4500]">Tecnología Clínica Tujague BII</span></h3>
            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-wide">Analizá qué nivel de armamento técnico necesitás para tu mutación radical.</p>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar pb-5">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-zinc-800 align-bottom">
                  <th className="p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-1/4 border-r border-zinc-800/50">Armamento Técnico</th>
                  <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center w-1/5 bg-zinc-950 rounded-t-xl">Estáticos (Low-Ticket)</th>
                  <th className="p-5 text-[10px] font-black text-white uppercase tracking-widest text-center w-1/5">Élite (3 Meses)</th>
                  <th className="p-4 text-[11px] font-black text-[#ff4500] uppercase tracking-widest text-center w-1/5 bg-[#ff4500]/10 rounded-t-2xl border-b-4 border-[#ff4500]">Élite (6 Meses)</th>
                  <th className="p-5 text-[10px] font-black text-amber-300 uppercase tracking-widest text-center w-1/5">Leyenda (1 Año)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {[
                  { f: "Dashboard Web de Atleta", s: "✓ Calculadoras", m3: "✓ Acceso Total", m6: "✓ Acceso Total", m12: "✓ Acceso VIP" },
                  { f: "Tujague AI (Biomecánica y Nutrición)", s: "✕", m3: "✓ Ilimitado", m6: "✓ Ilimitado", m12: "✓ Ilimitado (Prioridad)" },
                  { f: "Auditoría Clínica por Video", s: "✕", m3: "✓ Mensual", m6: "✓ Prioritaria", m12: "✓ Inmediata (<12hs)" },
                  { f: "Soporte Directo con Coach", s: "✕", m3: "✕ (Solo Web)", m6: "✓ WhatsApp L-V", m12: "✓ WhatsApp VIP 24/7" },
                  { f: "Videollamada de Calibración", s: "✕", m3: "✕", m6: "✓ 1 Sesión Inicial", m12: "✓ 1 Sesión Mensual" },
                  { f: "Auditoría SNC (Fatiga/RPE)", s: "✓ (Lógica PDF)", m3: "✓ (Dinámica)", m6: "✓ (Dinámica Prioritaria)", m12: "✓ (Dinámica Total)" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/40 transition-colors text-xs md:text-sm">
                    <td className="p-5 text-zinc-300 font-bold border-r border-zinc-800/50">{row.f}</td>
                    <td className="p-5 text-center text-zinc-500 bg-zinc-950/50">{row.s.includes('✓') ? <span className="text-zinc-400">{row.s}</span> : <span className="text-red-900 font-black">✕</span>}</td>
                    <td className="p-5 text-center text-white">{row.m3.includes('✓') ? <span className="text-white">{row.m3}</span> : <span className="text-red-900 font-black">✕</span>}</td>
                    <td className="p-4 text-center text-[#ff4500] font-black bg-[#ff4500]/10 border-x border-[#ff4500]/20">{row.m6.includes('✓') ? <span className="text-[#ff4500] font-black">{row.m6}</span> : <span className="text-red-900 font-black">✕</span>}</td>
                    <td className="p-5 text-center text-amber-200">{row.m12.includes('✓') ? <span className="text-amber-300">{row.m12}</span> : <span className="text-red-900 font-black">✕</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}} />
    </section>
  );
}