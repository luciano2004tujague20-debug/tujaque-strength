"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getConversions } from "@/lib/pricing";

interface CheckoutClientProps {
  // ✅ Importante: selectedPlan.id debe ser el "code" del plan (ej: "semanal-5-6")
  selectedPlan: { id: string; title: string; subtitle: string; price: number; };
  extraVideo: boolean;
  extraPrice: number;
}

type PaymentMethod = "mercadopago" | "transferencia" | "usd" | "crypto";

export default function CheckoutClient({ selectedPlan, extraVideo, extraPrice }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  
  // ─── NUEVO ESTADO PARA EL ONBOARDING ───
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagram: "",
    age: "",
    phone: "",
    experience: "intermedio", // valor por defecto
    goal: "fuerza",
    injuries: "no",
    equipment: "gimnasio"
  });

  const totalAmount = selectedPlan.price + (extraVideo ? extraPrice : 0);
  const conversions = getConversions(totalAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica: Verificamos que los campos obligatorios (*) estén llenos
    if (!formData.name || !formData.email || !formData.phone || !formData.age) {
      alert("Por favor, completá todos los campos obligatorios (*)");
      return;
    }

    setLoading(true);

    try {
      // 1. Mapeo de métodos para que coincidan con tu backend
      const methodMapping = {
        mercadopago: "mercado_pago",
        transferencia: "transfer_ars",
        crypto: "crypto",
        usd: "international_usd"
      };

      // 2. Llamada a tu API (/api/orders/route.ts)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ✅ ENVIAMOS EL CÓDIGO: Este valor debe coincidir con la columna 'code' en Supabase
          planCode: selectedPlan.id,       
          paymentMethod: methodMapping[paymentMethod],
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          customerRef: formData.instagram.trim() || null, 
          extraVideo: extraVideo,
          // ✅ NUEVO: Enviamos la ficha técnica del atleta
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

      // 3. Redirección automática
      if (data.paymentUrl) {
        // Redirección a Mercado Pago
        window.location.href = data.paymentUrl;
      } else if (data.orderId) {
        // Redirección a la página de éxito (Transferencia/Crypto/USD)
        router.push(`/order/${data.orderId}?email=${encodeURIComponent(formData.email.trim())}`);
      }
      
    } catch (err: any) {
      console.error(err);
      alert("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clases CSS reutilizables para mantener el código limpio
  const inputClass = "w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-600";
  const labelClass = "block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide";

  return (
    <div className="grid lg:grid-cols-2 gap-12 text-left">
      
      {/* ─── COLUMNA IZQUIERDA: FORMULARIO + PAGO ─── */}
      <div className="space-y-8">
        
        {/* SECCIÓN 1: PERFIL DE ATLETA (ONBOARDING) */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-emerald-500 text-black text-xs font-black px-2 py-1 rounded">PASO 1</span>
            <h3 className="text-xl font-black text-white italic tracking-tight">Ficha del Atleta</h3>
          </div>
          
          <div className="space-y-5">
            {/* Datos Personales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre Completo *</label>
                <input required className={inputClass} placeholder="Ej: Juan Pérez" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Edad *</label>
                <input required type="number" className={inputClass} placeholder="Ej: 24" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email *</label>
                <input required type="email" className={inputClass} placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp *</label>
                <input required type="tel" className={inputClass} placeholder="+54 9 11..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            
            <div>
               <label className={labelClass}>Instagram (Opcional)</label>
               <input className={inputClass} placeholder="@usuario" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
            </div>

            {/* Datos Entrenamiento (NUEVO) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
               <div>
                 <label className={labelClass}>Objetivo Principal</label>
                 <select className={inputClass} value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
                   <option value="fuerza">Fuerza (Powerlifting)</option>
                   <option value="hipertrofia">Hipertrofia (Estética)</option>
                   <option value="mixto">Híbrido (Powerbuilding)</option>
                 </select>
               </div>
               <div>
                 <label className={labelClass}>Nivel Experiencia</label>
                 <select className={inputClass} value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}>
                   <option value="principiante">Principiante</option>
                   <option value="intermedio">Intermedio</option>
                   <option value="avanzado">Avanzado</option>
                 </select>
               </div>
            </div>

            <div>
              <label className={labelClass}>¿Lesiones actuales o dolores?</label>
              <textarea 
                className={`${inputClass} h-20 resize-none`} 
                placeholder="No, ninguna / Sí, dolor en hombro izquierdo..." 
                value={formData.injuries} 
                onChange={e => setFormData({...formData, injuries: e.target.value})} 
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: MÉTODOS DE PAGO */}
        <section>
          <div className="flex items-center gap-3 mb-6 pt-6 border-t border-white/5">
            <span className="bg-emerald-500 text-black text-xs font-black px-2 py-1 rounded">PASO 2</span>
            <h3 className="text-xl font-black text-white italic tracking-tight">Método de Pago</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              type="button"
              onClick={() => setPaymentMethod("mercadopago")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Mercado Pago
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("transferencia")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Transferencia ARS
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("crypto")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Cripto (USDT/BTC)
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("usd")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'usd' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Dólar (INTL)
            </button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-inner min-h-[80px] flex items-center">
             {paymentMethod === 'mercadopago' && <p className="text-xs text-zinc-400 italic">Serás redirigido a Mercado Pago para abonar de forma automática.</p>}
             {paymentMethod === 'transferencia' && <p className="text-xs text-zinc-400 italic">Al confirmar, verás los datos para transferir pesos.</p>}
             {paymentMethod === 'crypto' && (
               <div className="text-xs text-zinc-400 space-y-1">
                 <p className="text-emerald-400 font-bold mb-1">Total aproximado:</p>
                 <p>USDT / USDC: <strong>{conversions.usdt}</strong></p>
                 <p>BTC: <strong>{conversions.btc}</strong></p>
               </div>
             )}
             {paymentMethod === 'usd' && <p className="text-xs text-zinc-400 italic">Total aproximado: <strong>U$D {conversions.usd}</strong> (PayPal/Zelle).</p>}
          </div>
          
          {/* Disclaimer Legal Pequeño */}
          <div className="text-[10px] text-zinc-600 italic mt-4 px-2">
            * Al continuar, aceptás que este es un servicio de pago único y declarás estar apto físicamente para realizar actividad física de alta intensidad.
          </div>
        </section>
      </div>

      {/* ─── COLUMNA DERECHA: RESUMEN (STICKY) ─── */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl h-fit shadow-2xl sticky top-24">
        <div className="mb-8">
          <h3 className="text-zinc-500 text-xs font-bold mb-2 uppercase tracking-widest">Tu Selección</h3>
          <p className="text-white font-black text-2xl tracking-tighter italic uppercase">{selectedPlan.title}</p>
          <p className="text-emerald-500 text-xs font-bold">{selectedPlan.subtitle}</p>
        </div>
        
        <div className="space-y-3 mb-8 border-y border-zinc-800 py-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400 font-medium">Costo del Plan</span>
            <span className="text-white font-mono">${selectedPlan.price.toLocaleString()}</span>
          </div>
          {extraVideo && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-medium">+ Revisión Biomecánica</span>
              <span className="text-emerald-400 font-mono">+${extraPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Inversión Final</span>
          <span className="text-4xl font-black text-white tracking-tighter">${totalAmount.toLocaleString()}</span>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-emerald-500 py-5 text-black font-black rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          {loading ? "Procesando..." : paymentMethod === 'mercadopago' ? "Ir a Pagar" : "Generar Pedido"}
        </button>
      </div>
    </div>
  );
}