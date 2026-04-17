"use client";

import React from "react";

// ─── TIPOS ───
export type PricingPlan = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  installmentPriceARS?: number;
  currency: "ARS" | "USD";
  description: string;
  features: string[];
  highlight?: boolean;
  idealFor?: string;
  actionLabel?: string;
  tier: "static" | "elite_3m" | "elite_6m" | "elite_12m"; 
};

// 🔥 MEJORA: Características base con enfoque en el SNC y Biomecánica
const baseEliteFeatures = [
  "Dashboard Web Privado de Alto Rendimiento.",
  "Programación dinámica auto-rregulada (RPE/RIR).",
  "Tujague AI: Asistente Biomecánico y de Torque.",
  "Tujague AI: Diseño Nutricional para el SNC.",
  "Auditoría clínica de recuperación y fatiga central.",
  "Bóveda Técnica (Librería de ejercicios BII).",
  "Kit Acelerador (Guías y Suplementación).",
  "Botón de Pánico (Recalibración por molestias).",
  "Programa de Afiliados (Ganá tu cuota)."
];

// ─── ESCALERA DE VALOR HIGH-TICKET ───
const PLANS: PricingPlan[] = [
  // 🔥 NIVEL 1: BÓVEDA ESTÁTICA UNIFICADA (12 Semanas) 🔥
  {
    id: "static-12-semanas",
    title: "Bóveda Completa",
    subtitle: "12 SEMANAS • PLAN MAESTRO",
    price: 69000,
    originalPrice: 105000, 
    currency: "ARS",
    description: "El paquete definitivo. Llevate los bloques de Fuerza, Hipertrofia y Definición unificados en un solo Mega-PDF para iniciar la adaptación de tu SNC.",
    features: [
      "Fase 1: Fuerza Base y Adaptación Neuronal", 
      "Fase 2: Mutación Hipertrófica y Torque", 
      "Fase 3: Definición / Cut sin perder RMs",
      "✓ Todo el conocimiento técnico y estructural", 
      "✓ Ejecución 100% autónoma (Sin soporte 1 a 1)", 
      "✓ Valor real del paquete: $105.000 ARS"
    ],
    idealFor: "Autodidactas / Presupuesto Ajustado",
    actionLabel: "🔒 DESBLOQUEAR BÓVEDA HOY",
    tier: "static",
  },

  // --- NIVEL 2: MENTORÍA ÉLITE ---
  {
    id: "elite-90-dias",
    title: "Élite 90 Días",
    subtitle: "ACCESO 3 MESES",
    price: 289999,
    originalPrice: 379000,
    installmentPriceARS: 96666, 
    currency: "ARS",
    description: "El punto de entrada. Asegurá tu lugar y accedé a toda mi tecnología para resetear tu sistema nervioso y destrabar tus marcas.",
    features: [
      ...baseEliteFeatures,
      "Corrección técnica por video mensual.",
      "Soporte exclusivo vía plataforma."
    ],
    idealFor: "Compromiso Inicial y Reset Neuronal",
    actionLabel: "⚡ INICIAR RESET NEURONAL",
    tier: "elite_3m",
  },
  {
    id: "elite-180-dias",
    title: "Élite 180 Días",
    subtitle: "ACCESO 6 MESES",
    price: 499999,
    originalPrice: 779000,
    installmentPriceARS: 166666, 
    currency: "ARS",
    description: "Mi programa insignia. Tiempo clínico suficiente para destrozar tu límite genético y reprogramar tu biomecánica, con línea directa a mi teléfono.",
    features: [
      ...baseEliteFeatures,
      "Corrección técnica por video prioritaria.",
      "Soporte directo por WhatsApp L-V.",
      "1 Clínica Biomecánica (Llamada Inicial)."
    ],
    highlight: true,
    idealFor: "El 80% de los Atletas (Adaptación Total)",
    actionLabel: "🔥 RESERVAR CUPO ÉLITE",
    tier: "elite_6m",
  },
  {
    id: "leyenda-365-dias",
    title: "Leyenda BII",
    subtitle: "ACCESO 1 AÑO",
    price: 999999,
    originalPrice: 1499999,
    installmentPriceARS: 333333, 
    currency: "ARS",
    description: "Para quienes buscan mutar por completo o competir. El nivel más alto de control sobre tu fatiga central y detalle técnico posible.",
    features: [
      ...baseEliteFeatures,
      "Corrección técnica de video inmediata.",
      "WhatsApp VIP L-D 24/7.",
      "1 Videollamada de ajuste MENSUAL."
    ],
    idealFor: "Competidores / Mutación Definitiva",
    actionLabel: "👑 MUTACIÓN DEFINITIVA",
    tier: "elite_12m",
  },
];

interface PricingV2Props {
  onSelectPlan: (plan: PricingPlan) => void;
}

const SharkCheck = () => (
  <div className="w-[18px] h-[18px] bg-[#ff4500] rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const PaymentLogos = () => (
  <div className="flex flex-col items-center justify-center mt-6 pt-6 border-t border-zinc-800/80">
    <div className="flex items-center gap-3 opacity-50 grayscale mb-3">
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
    {/* Micro-copy Closer: Filtro de Riesgo */}
    <p className="text-[9px] text-zinc-500 font-bold text-center uppercase tracking-widest px-2">
      Transacción 100% encriptada. El único riesgo que corrés es comprar esto y no ejecutar.
    </p>
  </div>
);

export default function PricingV2({ onSelectPlan }: PricingV2Props) {
  const staticPlan = PLANS.find(p => p.tier === "static");
  const elitePlans = PLANS.filter(p => p.tier !== "static");

  return (
    <section id="cajas-nuevas" className="w-full relative z-20 pt-16 pb-24 px-4 sm:px-6 bg-[#0a0a0a] border-t border-zinc-800/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle,rgba(255,69,0,0.05)_0%,transparent_60%)] pointer-events-none transform-gpu"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER PRINCIPAL */}
        <div className="text-center mb-16">
          <span className="bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-[0_0_15px_rgba(255,69,0,0.1)]">
            Aplicación Abierta
          </span>
          <h2 className="text-4xl md:text-7xl font-black italic text-white tracking-tighter uppercase drop-shadow-md">
            ELEGÍ TU <span className="text-[#ff4500]">COMPROMISO</span>
          </h2>
        </div>

        {/* ─── BLOQUE 1: MENTORÍA ÉLITE ─── */}
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
                
                <div className="mb-8 text-center flex flex-col items-center border-b border-zinc-800/80 pb-8">
                  {plan.originalPrice && (
                     <div className="text-red-500/80 font-black text-lg line-through mb-1">
                       ${plan.originalPrice.toLocaleString('es-AR')}
                     </div>
                  )}
                  <div className="text-white font-black text-5xl tracking-tighter mb-3 flex items-start justify-center gap-1">
                    <span className="text-2xl mt-1">$</span>
                    {plan.price.toLocaleString('es-AR')}
                  </div>

                  {plan.installmentPriceARS ? (
                      <div className="text-zinc-100 font-bold text-sm md:text-base uppercase tracking-wide bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                        O 3 cuotas de <span className="text-[#ff4500]">${plan.installmentPriceARS.toLocaleString('es-AR')}</span>
                      </div>
                  ) : (
                      <div className="text-zinc-500 font-bold text-xs uppercase tracking-wide mt-2">
                        Pago único al contado
                      </div>
                  )}

                  {/* EFECTO CAFÉ (Trivialización del Precio) para el plan estrella */}
                  {plan.tier === "elite_6m" && (
                    <div className="mt-4 text-zinc-400 font-bold text-[10px] uppercase tracking-wider leading-relaxed max-w-[90%] mx-auto bg-zinc-950 px-3 py-2 rounded border border-zinc-800">
                      Menos de $2.800 por día.<br/>Lo que te gastás en un café o un alfajor, invertido en transformar tu biomecánica.
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
        
        {/* BARRA DE CONFIANZA - ÚNICA Y CORREGIDA */}
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

        {/* ─── BLOQUE 2: BÓVEDA ESTÁTICA ─── */}
        {staticPlan && (
          <div className="mb-20 mt-20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px bg-zinc-800/80 flex-grow"></div>
              <h3 className="text-xl md:text-2xl font-black italic text-zinc-500 uppercase tracking-tighter text-center">Bóveda <span className="text-zinc-300">Estática</span> (PDFs)</h3>
              <div className="h-px bg-zinc-800/80 flex-grow"></div>
            </div>
            
            <div className="relative flex flex-col p-8 md:p-10 rounded-[20px] border bg-[#111] border-zinc-800 hover:border-zinc-600 transition-all duration-500 shadow-2xl hover:-translate-y-1">
              
              <div className="absolute -top-4 right-6 bg-zinc-900 border border-zinc-700 text-emerald-400 text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest z-10 flex items-center gap-1.5 shadow-md">
                <span className="animate-pulse">⚡</span> DESCARGA INMEDIATA
              </div>

              <div className="mb-6 text-center mt-2">
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-white">{staticPlan.title}</h3>
                <p className="text-zinc-400 font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-700 inline-block">{staticPlan.subtitle}</p>
              </div>

              <div className="flex flex-col items-center justify-center mb-8 border-b border-zinc-800 pb-8">
                  {staticPlan.originalPrice && (
                     <div className="flex flex-col items-center mb-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Valor real del paquete</span>
                        <div className="text-red-500/60 font-black text-2xl line-through decoration-2 decoration-red-500/50">
                          ${staticPlan.originalPrice.toLocaleString('es-AR')}
                        </div>
                     </div>
                  )}
                  <div className="flex items-end gap-1.5 mt-2">
                    <span className="text-3xl font-black text-zinc-400 mb-1.5">$</span>
                    <span className="text-6xl md:text-7xl font-black italic text-white tracking-tighter leading-none">{staticPlan.price.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-md">
                     <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Ahorrás $36.000 ARS HOY</p>
                  </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-8 text-center px-4">{staticPlan.description}</p>
              
              <ul className="space-y-4 mb-10 border-t border-zinc-800 pt-8 px-4 md:px-10">
                {staticPlan.features.map((feature, idx) => {
                  const isNegative = feature.includes("✗");
                  const clean = feature.replace("✗ ", "");
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`font-black mt-0.5 text-base shrink-0 ${isNegative ? "text-red-900" : "text-emerald-500"}`}>{isNegative ? "✕" : "✓"}</span>
                      <span className={`text-sm font-medium leading-relaxed ${isNegative ? "text-zinc-600 line-through decoration-zinc-800" : "text-zinc-300"}`}>{clean}</span>
                    </li>
                  );
                })}
              </ul>

              <button onClick={() => onSelectPlan(staticPlan)} className="w-full py-5 rounded-xl font-black tracking-widest text-xs md:text-sm uppercase transition-all active:scale-95 bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {staticPlan.actionLabel}
              </button>
            </div>
          </div>
        )}

        {/* ─── TABLA COMPARATIVA CON LÓGICA BIOMECÁNICA ─── */}
        <div className="bg-[#111] border border-zinc-800/80 p-8 sm:p-14 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md max-w-6xl mx-auto relative">
          <div className="mb-10 text-center sm:text-left border-b border-zinc-800 pb-8">
            <h3 className="text-2xl sm:text-3xl font-black italic text-white uppercase mb-3 tracking-tighter leading-none">Comparativa de <span className="text-[#ff4500]">Tecnología Clínica Tujague BII</span></h3>
            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-wide">Analizá qué nivel de armamento técnico necesitás para proteger tu SNC y mutar.</p>
          </div>
          
          <div className="absolute right-0 top-1/3 bottom-0 w-8 bg-gradient-to-l from-[#111] to-transparent pointer-events-none md:hidden z-10"></div>
          
          <div className="overflow-x-auto custom-scrollbar pb-5 relative">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-zinc-800 align-bottom">
                  <th className="p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-1/4 border-r border-zinc-800/50">Armamento Técnico</th>
                  <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center w-1/5 bg-zinc-950 rounded-t-xl">Programa 12 Semanas (PDF)</th>
                  <th className="p-5 text-[10px] font-black text-white uppercase tracking-widest text-center w-1/5">Élite (3 Meses)</th>
                  <th className="p-4 text-[11px] font-black text-[#ff4500] uppercase tracking-widest text-center w-1/5 bg-[#ff4500]/10 rounded-t-2xl border-b-4 border-[#ff4500]">Élite (6 Meses)</th>
                  <th className="p-5 text-[10px] font-black text-amber-300 uppercase tracking-widest text-center w-1/5">Leyenda (1 Año)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {[
                  { f: "Estructura BII-Vintage y Gestión de Fatiga", s: "✓ PDF Unificado", m3: "✓ Dashboard Inteligente", m6: "✓ Dashboard Inteligente", m12: "✓ Dashboard Inteligente" },
                  { f: "Ojo de Halcón (Métrica de Sobrecarga SNC)", s: "✕", m3: "✓ Acceso Total", m6: "✓ Acceso Total", m12: "✓ Acceso VIP" },
                  { f: "Tujague AI (Corrección Biomecánica)", s: "✕", m3: "✓ Ilimitado", m6: "✓ Ilimitado", m12: "✓ Ilimitado (Prioridad)" },
                  { f: "Tujague AI (Chef y Combustible Neuronal)", s: "✕", m3: "✓ Ilimitado", m6: "✓ Ilimitado", m12: "✓ Ilimitado (Prioridad)" },
                  { f: "Auditoría Técnica por Video", s: "✕", m3: "✓ Mensual", m6: "✓ Prioritaria", m12: "✓ Inmediata (<12hs)" },
                  { f: "Soporte Directo con el Coach", s: "✕", m3: "✕ (Solo Web)", m6: "✓ WhatsApp L-V", m12: "✓ WhatsApp VIP 24/7" },
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