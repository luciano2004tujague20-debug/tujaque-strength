"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getConversions } from "@/lib/pricing";

interface CheckoutClientProps {
  selectedPlan: { id: string; title: string; subtitle: string; price: number; };
  extraVideo: boolean;
  extraPrice: number;
}

type PaymentMethod = "mercadopago" | "transferencia" | "usd" | "crypto";

export default function CheckoutClient({ selectedPlan, extraVideo, extraPrice }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  
  // ─── ESTADO INTACTO ───
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagram: "",
    age: "",
    phone: "",
    experience: "intermedio",
    goal: "fuerza",
    injuries: "no",
    equipment: "gimnasio"
  });

  const totalAmount = selectedPlan.price + (extraVideo ? extraPrice : 0);
  const conversions = getConversions(totalAmount);

  // ─── LÓGICA DE SUBMIT INTACTA ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.age) {
      alert("Por favor, completá todos los campos obligatorios (*)");
      return;
    }

    setLoading(true);

    try {
      const methodMapping = {
        mercadopago: "mercado_pago",
        transferencia: "transfer_ars",
        crypto: "crypto",
        usd: "international_usd"
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan.id,       
          paymentMethod: methodMapping[paymentMethod],
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          customerRef: formData.instagram.trim() || null, 
          extraVideo: extraVideo,
          onboardingData: {
            age: formData.age,
            phone: formData.phone,
            experience: formData.experience,
            goal: formData.goal,
            injuries: formData.injuries,
            equipment: formData.equipment
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la orden");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.orderId) {
        router.push(`/order/${data.orderId}?email=${encodeURIComponent(formData.email.trim())}`);
      }
      
    } catch (err: any) {
      console.error(err);
      alert("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── CLASES CSS MEJORADAS PARA DISEÑO ELITE ───
  const inputClass = "w-full bg-black/40 border-2 border-zinc-800/80 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-600 placeholder:font-medium";
  const labelClass = "block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest ml-1";
  const selectClass = "w-full bg-black/40 border-2 border-zinc-800/80 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer";

  return (
    <div className="grid lg:grid-cols-12 gap-12 text-left p-6 md:p-14 relative z-10">
      
      {/* ─── COLUMNA IZQUIERDA: FORMULARIO (7 Columnas) ─── */}
      <div className="lg:col-span-7 space-y-12">
        
        {/* SECCIÓN 1: PERFIL DE ATLETA */}
        <section>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] shrink-0">
              1
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Ficha del Atleta</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Datos de Onboarding Obligatorios</p>
            </div>
          </div>
          
          <div className="space-y-6 bg-zinc-900/30 p-6 md:p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre Completo <span className="text-emerald-500">*</span></label>
                <input required className={inputClass} placeholder="Ej: Juan Pérez" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Edad <span className="text-emerald-500">*</span></label>
                <input required type="number" className={inputClass} placeholder="Ej: 24" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Email (Para tu cuenta) <span className="text-emerald-500">*</span></label>
                <input required type="email" className={inputClass} placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp (Soporte) <span className="text-emerald-500">*</span></label>
                <input required type="tel" className={inputClass} placeholder="+54 9 11..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            
            <div>
               <label className={labelClass}>Instagram (Opcional - Para referencias)</label>
               <input className={inputClass} placeholder="@usuario" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
               <div className="relative">
                 <label className={labelClass}>Objetivo Principal</label>
                 <select className={selectClass} value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
                   <option value="fuerza">Fuerza (Powerlifting)</option>
                   <option value="hipertrofia">Hipertrofia (Estética)</option>
                   <option value="mixto">Híbrido (Powerbuilding)</option>
                 </select>
                 <div className="absolute right-4 top-[38px] pointer-events-none text-zinc-500">▼</div>
               </div>
               <div className="relative">
                 <label className={labelClass}>Nivel Experiencia</label>
                 <select className={selectClass} value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}>
                   <option value="principiante">Principiante</option>
                   <option value="intermedio">Intermedio</option>
                   <option value="avanzado">Avanzado</option>
                 </select>
                 <div className="absolute right-4 top-[38px] pointer-events-none text-zinc-500">▼</div>
               </div>
            </div>

            <div>
              <label className={labelClass}>¿Lesiones actuales o dolores?</label>
              <textarea 
                className={`${inputClass} h-24 resize-none`} 
                placeholder="Describí brevemente si tenés alguna molestia o lesión previa..." 
                value={formData.injuries} 
                onChange={e => setFormData({...formData, injuries: e.target.value})} 
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: MÉTODOS DE PAGO */}
        <section>
          <div className="flex items-center gap-5 mb-8 pt-8 border-t border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] shrink-0">
              2
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Método de Pago</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Seleccioná tu divisa</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setPaymentMethod("mercadopago")} 
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}
            >
              Mercado Pago
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("transferencia")} 
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}
            >
              Transferencia ARS
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("crypto")} 
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}
            >
              Cripto (USDT)
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("usd")} 
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'usd' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}
            >
              Dólar (INTL)
            </button>
          </div>

          {/* Cuadro de Información del Pago Seleccionado */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 min-h-[90px] flex items-center justify-center text-center backdrop-blur-sm">
             {paymentMethod === 'mercadopago' && <p className="text-sm font-medium text-zinc-300">Serás redirigido de forma segura a <span className="text-blue-400 font-bold">Mercado Pago</span> para abonar.</p>}
             {paymentMethod === 'transferencia' && <p className="text-sm font-medium text-zinc-300">Al confirmar, verás los datos del <span className="text-emerald-400 font-bold">Alias/CBU</span> para transferir pesos.</p>}
             {paymentMethod === 'crypto' && (
               <div className="text-sm text-zinc-300">
                 <p className="mb-2">Abonarás enviando a nuestra Billetera Virtual (Redes TRC20/BSC).</p>
                 <p className="font-mono text-emerald-400 font-bold text-lg">{conversions.usdt} USDT <span className="text-zinc-500 text-sm">/</span> {conversions.btc} BTC</p>
               </div>
             )}
             {paymentMethod === 'usd' && <p className="text-sm font-medium text-zinc-300">Abonarás un total de <span className="font-mono text-emerald-400 font-bold text-lg">U$D {conversions.usd}</span> (Instrucciones en el próximo paso).</p>}
          </div>
          
          {/* ✅ AVISO LEGAL REDISEÑADO: Ahora sí se lee y se ve muy profesional */}
          <div className="mt-8 bg-zinc-900/40 border border-zinc-700/50 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-black border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
               <span className="text-zinc-400 font-black text-xs italic">i</span>
            </div>
            <div>
               <strong className="text-white text-sm block mb-1 tracking-wide">Términos de Inscripción</strong>
               <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                 Al continuar, aceptás que este es un servicio de pago único y declarás estar apto físicamente para realizar actividad física de alta intensidad. No se realizan reembolsos por bajas anticipadas.
               </p>
            </div>
          </div>

        </section>
      </div>

      {/* ─── COLUMNA DERECHA: RESUMEN Y BOTÓN FINAL (5 Columnas) ─── */}
      <div className="lg:col-span-5 relative">
        <div className="bg-zinc-900/80 border border-white/5 p-8 md:p-10 rounded-[2.5rem] h-fit shadow-2xl sticky top-28 backdrop-blur-xl">
          
          <div className="mb-8">
            <h3 className="text-emerald-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em] border-b border-emerald-500/20 pb-2 inline-block">Tu Selección</h3>
            <p className="text-white font-black text-3xl tracking-tighter italic uppercase mt-2">{selectedPlan.title}</p>
            <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase mt-2">{selectedPlan.subtitle}</p>
          </div>
          
          <div className="space-y-4 mb-8 border-y border-zinc-800/80 py-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300 font-medium">Suscripción Base</span>
              <span className="text-white font-mono text-lg">${selectedPlan.price.toLocaleString()}</span>
            </div>
            {extraVideo && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-400 font-medium flex items-center gap-2">
                  <span className="bg-emerald-500/20 px-1.5 rounded font-black">+</span> Video Análisis
                </span>
                <span className="text-emerald-400 font-mono text-lg">+${extraPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mb-10">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Inversión Final (ARS)</span>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tighter">${totalAmount.toLocaleString()}</span>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="relative w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 overflow-hidden group border border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-black bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>}
              {loading ? "PROCESANDO PAGO..." : paymentMethod === 'mercadopago' ? "IR A PAGAR DE FORMA SEGURA" : "GENERAR PEDIDO AHORA"}
            </span>
            {!loading && <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
             <svg className="w-3 h-3 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2H9v-2h2v-2H9V9h2V7h2v2h2v2h-2v2h2v2h-2v2h-2z"/></svg>
             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Transacción 100% Segura y Encriptada</span>
          </div>
        </div>
      </div>

    </div>
  );
}