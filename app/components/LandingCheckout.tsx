"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";

/* TYPES (Sin tocar) */
type Plan = {
  id: string;
  code: string;
  name: string;
  cadence: "weekly" | "monthly";
  price_ars: number;
  benefits?: { includes?: string[] };
};

/* COMPONENT */
export default function LandingCheckout() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State (Sin tocar)
  const [selectedCode, setSelectedCode] = useState("");
  const [extraVideo, setExtraVideo] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [method, setMethod] = useState("mercado_pago");
  const [isAdult, setIsAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load Plans (Sin tocar)
  useEffect(() => {
    fetch("/api/plans")
      .then(res => res.json())
      .then(data => {
        if (data.plans) {
          setPlans(data.plans);
          if(data.plans.length > 0) setSelectedCode(data.plans[0].code);
        }
      })
      .catch(() => setErrorMsg("Error cargando planes"))
      .finally(() => setLoading(false));
  }, []);

  // Lógica de validación y totales (Sin tocar)
  const selectedPlan = useMemo(() => plans.find(p => p.code === selectedCode), [plans, selectedCode]);
  const total = (selectedPlan?.price_ars || 0) + (extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0);
  const isValid = selectedPlan && name.length > 2 && email.includes("@") && isAdult && terms && !submitting;

  // Submit (Sin tocar)
  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedCode,
          paymentMethod: method,
          name,
          email,
          customerRef: ref,
          extraVideo
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear orden");

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/order/${data.orderId}`);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-emerald-500 gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-xs font-bold tracking-widest uppercase">Cargando sistema seguro...</p>
    </div>
  );

  return (
    <div className="w-full bg-transparent text-zinc-100 font-sans md:p-10 p-4">
      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO (Ocupa 7 columnas) */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* 1. PLANES */}
          <section className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h2 className="flex items-center gap-3 text-white font-black mb-6 text-lg tracking-tight">
              <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">1</span>
              Confirmar Plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map(plan => (
                <div 
                  key={plan.code}
                  onClick={() => setSelectedCode(plan.code)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    selectedCode === plan.code 
                      ? "bg-emerald-900/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                      : "bg-black/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80"
                  }`}
                >
                  {selectedCode === plan.code && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-bl-full -mr-8 -mt-8"></div>
                  )}
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{plan.cadence === 'weekly' ? 'Semanal' : 'Mensual'}</p>
                  <p className="font-black text-white text-lg italic tracking-tight">{plan.name}</p>
                  <p className="text-emerald-400 font-bold mt-3 text-xl">${plan.price_ars.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. EXTRAS */}
          <section className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h2 className="flex items-center gap-3 text-white font-black mb-6 text-lg tracking-tight">
              <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">2</span>
              Potenciadores
            </h2>
            <div 
              onClick={() => setExtraVideo(!extraVideo)}
              className={`flex justify-between items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                extraVideo ? "bg-emerald-900/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-black/50 border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${extraVideo ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 bg-black"}`}>
                   {extraVideo && <svg className="w-4 h-4 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                   <p className="text-base font-bold text-white">Auditoría de Video Técnica</p>
                   <p className="text-xs text-zinc-500 font-medium mt-1">Revisión cuadro por cuadro de tus SBD</p>
                </div>
              </div>
              <p className="text-emerald-400 font-bold text-lg">+${EXTRA_VIDEO_PRICE_ARS.toLocaleString()}</p>
            </div>
          </section>

          {/* 3. PAGO (Con Iconos y mejor distribución) */}
          <section className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
             <h2 className="flex items-center gap-3 text-white font-black mb-6 text-lg tracking-tight">
               <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">3</span>
               Método de Pago
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               {/* Mercado Pago */}
               <button 
                 onClick={() => setMethod('mercado_pago')}
                 className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all duration-300 text-left ${
                   method === 'mercado_pago' ? "bg-[#009EE3]/10 border-[#009EE3] shadow-[0_0_20px_rgba(0,158,227,0.15)]" : "bg-black/50 border-zinc-800/50 hover:border-zinc-700"
                 }`}
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'mercado_pago' ? 'bg-[#009EE3] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.318 10.153a.586.586 0 00-.547-.384h-2.181a.584.584 0 00-.584.584v2.541a.584.584 0 01-.584.584H8.783a.584.584 0 01-.584-.584v-2.541a.584.584 0 00-.584-.584H5.435a.586.586 0 00-.547.384.588.588 0 00.16.638l5.127 5.126a1.168 1.168 0 001.65 0l5.127-5.126a.588.588 0 00.16-.638z"/></svg>
                 </div>
                 <div>
                    <p className={`font-bold text-sm ${method === 'mercado_pago' ? 'text-white' : 'text-zinc-300'}`}>Mercado Pago</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Tarjeta / Dinero MP</p>
                 </div>
               </button>

               {/* Transferencia */}
               <button 
                 onClick={() => setMethod('ars')}
                 className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all duration-300 text-left ${
                   method === 'ars' ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "bg-black/50 border-zinc-800/50 hover:border-zinc-700"
                 }`}
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'ars' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                 </div>
                 <div>
                    <p className={`font-bold text-sm ${method === 'ars' ? 'text-white' : 'text-zinc-300'}`}>Transferencia</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Alias / CBU</p>
                 </div>
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
               {/* USD */}
               <button onClick={() => setMethod('usd')} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all text-xs font-bold ${method === 'usd' ? "bg-zinc-100 text-black border-white" : "bg-black/50 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:text-white"}`}>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Pago en USD
               </button>
               {/* Crypto */}
               <button onClick={() => setMethod('crypto')} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all text-xs font-bold ${method === 'crypto' ? "bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]" : "bg-black/50 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:text-white"}`}>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.653 10.999c1.077-.32 1.831-.968 1.831-2.146 0-1.782-1.554-2.132-3.111-2.132H10.15V3h-1.63v3.721H7.234V3H5.603v3.721H3v1.611h1.564v9.336H3v1.611h1.603V23h1.63v-3.721h1.287V23h1.63v-3.721h3.766c2.043 0 3.518-.755 3.518-2.614 0-1.572-1.157-2.188-2.315-2.454zM10.15 8.331h2.903c.85 0 1.571.21 1.571 1.05 0 .841-.72 1.05-1.571 1.05H10.15V8.331zm3.267 9.336H10.15v-2.312h3.267c1.111 0 1.831.242 1.831 1.156 0 .914-.72 1.156-1.831 1.156z"/></svg>
                 Criptomonedas
               </button>
             </div>
          </section>

          {/* 4. DATOS */}
          <section className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm space-y-5">
             <h2 className="flex items-center gap-3 text-white font-black mb-6 text-lg tracking-tight">
               <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">4</span>
               Tus Datos
             </h2>
             
             <div className="space-y-4">
               <div className="relative">
                 <input value={name} onChange={e => setName(e.target.value)} placeholder=" " className="peer w-full bg-black/50 border-2 border-zinc-800/50 p-4 pt-6 rounded-xl text-white font-bold focus:border-emerald-500 outline-none transition-all placeholder-transparent" />
                 <label className="absolute left-4 top-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-emerald-500">Nombre Completo</label>
               </div>

               <div className="relative">
                 <input value={email} onChange={e => setEmail(e.target.value)} placeholder=" " type="email" className="peer w-full bg-black/50 border-2 border-zinc-800/50 p-4 pt-6 rounded-xl text-white font-bold focus:border-emerald-500 outline-none transition-all placeholder-transparent" />
                 <label className="absolute left-4 top-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-emerald-500">Correo Electrónico</label>
               </div>

               <div className="relative">
                 <input value={ref} onChange={e => setRef(e.target.value)} placeholder=" " className="peer w-full bg-black/50 border-2 border-zinc-800/50 p-4 pt-6 rounded-xl text-white font-bold focus:border-emerald-500 outline-none transition-all placeholder-transparent" />
                 <label className="absolute left-4 top-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-emerald-500">Usuario de Instagram (Opcional)</label>
               </div>
             </div>
             
             <div className="space-y-3 pt-4 border-t border-white/5">
               <label className="flex items-center gap-3 cursor-pointer group">
                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAdult ? 'bg-emerald-500 border-emerald-500' : 'bg-black border-zinc-700 group-hover:border-zinc-500'}`}>
                    {isAdult && <svg className="w-3.5 h-3.5 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </div>
                 <input type="checkbox" checked={isAdult} onChange={e => setIsAdult(e.target.checked)} className="hidden" />
                 <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Declaro ser mayor de 18 años.</span>
               </label>

               <label className="flex items-center gap-3 cursor-pointer group">
                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${terms ? 'bg-emerald-500 border-emerald-500' : 'bg-black border-zinc-700 group-hover:border-zinc-500'}`}>
                    {terms && <svg className="w-3.5 h-3.5 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </div>
                 <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="hidden" />
                 <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Acepto los términos y condiciones del servicio.</span>
               </label>
             </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (STICKY TICKET) (Ocupa 5 columnas) */}
        <div className="lg:col-span-5 relative">
          <div className="lg:sticky lg:top-32 bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            {/* Efecto visual de ticket de compra */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-700"></div>
            
            <h3 className="text-2xl font-black text-white mb-8 border-b border-zinc-800 pb-4 italic tracking-tight">RESUMEN <span className="text-emerald-500">DE ORDEN</span></h3>
            
            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-start text-sm border-b border-white/5 pb-4">
                 <div>
                    <p className="text-zinc-300 font-bold text-base mb-1">{selectedPlan?.name || "Selecciona un plan"}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Suscripción {selectedPlan?.cadence === 'weekly' ? 'Semanal' : 'Mensual'}</p>
                 </div>
                 <span className="text-white font-mono text-lg">${(selectedPlan?.price_ars || 0).toLocaleString()}</span>
               </div>
               
               {extraVideo && (
                 <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                   <div className="flex items-center gap-2">
                     <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded">+</span>
                     <span className="text-emerald-400 font-bold">Auditoría Técnica</span>
                   </div>
                   <span className="text-emerald-400 font-mono text-base">${EXTRA_VIDEO_PRICE_ARS.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="flex justify-between items-end mb-8 pt-4">
               <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total a pagar (ARS)</span>
               <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">${total.toLocaleString()}</span>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-400 text-xs font-bold">{errorMsg}</p>
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={!isValid}
              className={`relative w-full py-5 rounded-2xl font-black tracking-widest transition-all duration-300 overflow-hidden group ${
                isValid 
                ? "bg-emerald-500 text-black hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]" 
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <span className="relative z-10 text-xs uppercase">
                {submitting ? "PROCESANDO..." : method === 'mercado_pago' ? "IR A PAGAR CON MERCADO PAGO" : "CONFIRMAR ORDEN Y VER INSTRUCCIONES"}
              </span>
              {isValid && !submitting && (
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              )}
            </button>
            
            <p className="text-center mt-6 text-[10px] text-zinc-600 font-bold tracking-widest flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2H9v-2h2v-2H9V9h2V7h2v2h2v2h-2v2h2v2h-2v2h-2z"/></svg>
              ENCRIPTACIÓN SSL 256-BIT
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}