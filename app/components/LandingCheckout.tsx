"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";

/* TYPES */
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
  
  // Form State
  const [selectedCode, setSelectedCode] = useState("");
  const [extraVideo, setExtraVideo] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  // Por defecto usamos mercado_pago si queremos que sea la opción principal
  const [method, setMethod] = useState("mercado_pago");
  const [isAdult, setIsAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load Plans
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

  const selectedPlan = useMemo(() => plans.find(p => p.code === selectedCode), [plans, selectedCode]);
  const total = (selectedPlan?.price_ars || 0) + (extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0);
  const isValid = selectedPlan && name.length > 2 && email.includes("@") && isAdult && terms && !submitting;

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

      // Si hay URL de pago (Mercado Pago), redirigimos allí
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Si es transferencia o crypto, vamos a la página de instrucciones
        router.push(`/order/${data.orderId}`);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500">Cargando sistema...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans p-6 pb-24">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 pt-10">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tujaque Strength <span className="text-emerald-500">v2.0</span></h1>
            <p className="text-zinc-500">Sistema de Coaching Profesional</p>
          </div>

          {/* 1. PLANES */}
          <section>
            <h2 className="text-emerald-500 font-bold mb-4 uppercase text-xs tracking-widest">01. Selecciona Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map(plan => (
                <div 
                  key={plan.code}
                  onClick={() => setSelectedCode(plan.code)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCode === plan.code 
                      ? "bg-zinc-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                      : "bg-black border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-xs text-zinc-500 uppercase font-bold">{plan.cadence === 'weekly' ? 'Semanal' : 'Mensual'}</p>
                  <p className="font-bold text-white">{plan.name}</p>
                  <p className="text-emerald-400 font-mono mt-2">${plan.price_ars.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. EXTRAS */}
          <section>
            <h2 className="text-emerald-500 font-bold mb-4 uppercase text-xs tracking-widest">02. Adicionales</h2>
            <div 
              onClick={() => setExtraVideo(!extraVideo)}
              className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer ${
                extraVideo ? "bg-emerald-900/10 border-emerald-500/50" : "bg-black border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${extraVideo ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                   {extraVideo && <span className="text-black font-bold text-xs">✓</span>}
                </div>
                <div>
                   <p className="text-sm font-bold text-white">Video Análisis Técnico</p>
                   <p className="text-xs text-zinc-500">Corrección detallada de levantamientos</p>
                </div>
              </div>
              <p className="text-emerald-400 font-mono text-sm">+${EXTRA_VIDEO_PRICE_ARS.toLocaleString()}</p>
            </div>
          </section>

          {/* 3. PAGO (Aquí agregamos el botón de MP) */}
          <section>
             <h2 className="text-emerald-500 font-bold mb-4 uppercase text-xs tracking-widest">03. Método de Pago</h2>
             <div className="flex flex-wrap gap-3">
               <button 
                 onClick={() => setMethod('mercado_pago')}
                 className={`px-4 py-3 rounded-lg text-xs font-bold border transition-all flex-1 ${
                   method === 'mercado_pago' ? "bg-blue-500/10 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                 }`}
               >
                 Mercado Pago (Automático)
               </button>
               <button 
                 onClick={() => setMethod('ars')}
                 className={`px-4 py-3 rounded-lg text-xs font-bold border transition-all flex-1 ${
                   method === 'ars' ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                 }`}
               >
                 Transferencia CBU
               </button>
             </div>
             <div className="flex gap-3 mt-3">
               <button onClick={() => setMethod('usd')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex-1 ${method === 'usd' ? "bg-zinc-800 border-white text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>USD</button>
               <button onClick={() => setMethod('crypto')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex-1 ${method === 'crypto' ? "bg-zinc-800 border-white text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>Cripto</button>
             </div>
          </section>

          {/* 4. DATOS */}
          <section className="space-y-4">
             <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest">04. Tus Datos</h2>
             <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre Completo" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white focus:border-emerald-500 outline-none" />
             <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white focus:border-emerald-500 outline-none" />
             <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Usuario Instagram (Opcional)" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white focus:border-emerald-500 outline-none" />
             
             <div className="space-y-2 pt-2">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" checked={isAdult} onChange={e => setIsAdult(e.target.checked)} className="accent-emerald-500" />
                 <span className="text-xs text-zinc-400">Soy mayor de 18 años.</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="accent-emerald-500" />
                 <span className="text-xs text-zinc-400">Acepto términos y condiciones.</span>
               </label>
             </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (STICKY) */}
        <div className="lg:h-fit lg:sticky lg:top-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">Resumen</h3>
            
            <div className="space-y-3 mb-6">
               <div className="flex justify-between text-sm">
                 <span className="text-zinc-400">{selectedPlan?.name || "Selecciona un plan"}</span>
                 <span className="text-white font-mono">${(selectedPlan?.price_ars || 0).toLocaleString()}</span>
               </div>
               {extraVideo && (
                 <div className="flex justify-between text-sm">
                   <span className="text-emerald-400">Video Análisis</span>
                   <span className="text-emerald-400 font-mono">${EXTRA_VIDEO_PRICE_ARS.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="flex justify-between items-end mb-8 pt-4 border-t border-zinc-800">
               <span className="text-zinc-400 font-bold">Total</span>
               <span className="text-3xl font-black text-white tracking-tight">${total.toLocaleString()}</span>
            </div>

            {errorMsg && <p className="text-red-500 text-xs text-center mb-4">{errorMsg}</p>}

            <button 
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
                isValid 
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20" 
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {submitting ? "Procesando..." : method === 'mercado_pago' ? "Ir a Pagar" : "Confirmar Orden"}
            </button>
            
          </div>
        </div>

      </div>
    </div>
  );
}