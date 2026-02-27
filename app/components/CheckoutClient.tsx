// app/components/CheckoutClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getConversions } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

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
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", 
    instagram: "",
    age: "",
    phone: "",
    experience: "intermedio",
    goal: "fuerza",
    injuries: "no",
    equipment: "gimnasio"
  });

  // ✅ ESTADOS PARA EL SISTEMA DE REFERIDOS (BII-AFFILIATES)
  const [referralCode, setReferralCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ code: string; percentage: number } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const handleValidateCode = async () => {
      if (!referralCode.trim()) return;
      setValidatingCode(true);
      setCodeError("");
      
      try {
          // Buscamos si el código pertenece a algún atleta activo en la base de datos
          const { data, error } = await supabase
              .from('orders')
              .select('id, customer_name')
              .eq('referral_code', referralCode.trim().toUpperCase())
              .single();

          // Códigos Maestros (Promociones que vos podés dar en Instagram)
          const masterCodes: Record<string, number> = { "BII10": 10, "PROMO15": 15, "TUJAGUE20": 20 };

          if (masterCodes[referralCode.trim().toUpperCase()]) {
              setDiscountApplied({ code: referralCode.trim().toUpperCase(), percentage: masterCodes[referralCode.trim().toUpperCase()] });
          } else if (data) {
              // Si el código es de un alumno, le damos 10% de descuento al nuevo
              setDiscountApplied({ code: referralCode.trim().toUpperCase(), percentage: 10 }); 
          } else {
              setCodeError("Código inválido o inexistente.");
              setDiscountApplied(null);
          }
      } catch (err) {
          setCodeError("Error de red al validar el código.");
      } finally {
          setValidatingCode(false);
      }
  };

  // ✅ LÓGICA DE PRECIOS DINÁMICOS
  const subtotal = selectedPlan.price + (extraVideo ? extraPrice : 0);
  const discountMultiplier = discountApplied ? (1 - discountApplied.percentage / 100) : 1;
  const totalAmount = Math.round(subtotal * discountMultiplier);
  const originalConversions = getConversions(subtotal);
  const conversions = getConversions(totalAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.age) {
      alert("Por favor, completá todos los campos obligatorios (*)");
      return;
    }

    if (formData.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 🚀 1. MAGIA: CREAR EL USUARIO EN SUPABASE Y LOGUEARLO
      const cleanEmail = formData.email.trim().toLowerCase();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: formData.password
      });
      
      // Si el email ya está registrado, simplemente le iniciamos sesión
      if (authError && authError.message.toLowerCase().includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: formData.password
          });
          if (signInError) {
              alert("Ese email ya tiene cuenta pero la contraseña es incorrecta. Si ya eras alumno, usá tu contraseña anterior.");
              setLoading(false);
              return;
          }
      } else if (authError) {
          throw new Error("No pudimos crear tu cuenta de acceso: " + authError.message);
      }

      // 🚀 2. CREAR LA ORDEN EN EL BACKEND
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
          email: cleanEmail,
          password: formData.password, 
          customerRef: formData.instagram.trim() || null, 
          extraVideo: extraVideo,
          referredBy: discountApplied?.code || null, // Mandamos el código al backend
          finalPrice: totalAmount, // Mandamos el precio rebajado
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

      // 🚀 3. REDIRIGIR
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.orderId) {
        router.push(`/order/${data.orderId}?email=${encodeURIComponent(cleanEmail)}`);
      }
      
    } catch (err: any) {
      console.error(err);
      alert("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-black/40 border-2 border-zinc-800/80 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-600 placeholder:font-medium";
  const labelClass = "block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest ml-1";
  const selectClass = "w-full bg-black/40 border-2 border-zinc-800/80 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer";

  return (
    <div className="grid lg:grid-cols-12 gap-12 text-left p-6 md:p-14 relative z-10">
      
      {/* ─── COLUMNA IZQUIERDA: FORMULARIO ─── */}
      <div className="lg:col-span-7 space-y-12">
        
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
                <label className={labelClass}>Email <span className="text-emerald-500">*</span></label>
                <input required type="email" className={inputClass} placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Creá una Contraseña <span className="text-emerald-500">*</span></label>
                <input required type="text" className={inputClass} placeholder="Para entrar a tu panel" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>WhatsApp (Soporte) <span className="text-emerald-500">*</span></label>
                <input required type="tel" className={inputClass} placeholder="+54 9 11..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                 <label className={labelClass}>Instagram (Opcional)</label>
                 <input className={inputClass} placeholder="@usuario" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
              </div>
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
            <button type="button" onClick={() => setPaymentMethod("mercadopago")} className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}>Mercado Pago</button>
            <button type="button" onClick={() => setPaymentMethod("transferencia")} className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}>Transferencia ARS</button>
            <button type="button" onClick={() => setPaymentMethod("crypto")} className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}>Cripto (USDT/BTC)</button>
            <button type="button" onClick={() => setPaymentMethod("usd")} className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'usd' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30'}`}>Dólar (INTL)</button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 min-h-[90px] flex items-center justify-center text-center backdrop-blur-sm transition-all duration-300">
             {paymentMethod === 'mercadopago' && <p className="text-sm font-medium text-zinc-300">Abonarás en pesos argentinos de forma segura a través de <span className="text-blue-400 font-bold">Mercado Pago</span>.</p>}
             
             {paymentMethod === 'transferencia' && <p className="text-sm font-medium text-zinc-300">Generá tu pedido para ver el <span className="text-emerald-400 font-bold">Alias/CBU</span> y transferir en pesos.</p>}
             
             {paymentMethod === 'crypto' && (
                 <p className="text-sm font-medium text-zinc-300">
                    Generá tu pedido para ver las billeteras y enviar <span className="font-mono text-emerald-400 font-bold">{conversions.usdt} USDT/USDC</span> o <span className="font-mono text-emerald-400 font-bold">{conversions.btc} BTC</span>.
                 </p>
             )}
             
             {paymentMethod === 'usd' && <p className="text-sm font-medium text-zinc-300">Generá tu pedido para ver los datos bancarios y transferir <span className="font-mono text-emerald-400 font-bold">U$D {conversions.usd}</span> (ACH o Local).</p>}
          </div>
          
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

      {/* ─── COLUMNA DERECHA: RESUMEN Y BOTÓN FINAL ─── */}
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
              <span className="text-white font-mono text-lg">
                {paymentMethod === 'usd' ? `U$D ${getConversions(selectedPlan.price).usd}` : 
                 paymentMethod === 'crypto' ? `${getConversions(selectedPlan.price).usdt} USDT` : 
                 `$${selectedPlan.price.toLocaleString()}`}
              </span>
            </div>
            {extraVideo && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-400 font-medium flex items-center gap-2">
                  <span className="bg-emerald-500/20 px-1.5 rounded font-black">+</span> Video Análisis
                </span>
                <span className="text-emerald-400 font-mono text-lg">
                  {paymentMethod === 'usd' ? `U$D ${getConversions(extraPrice).usd}` : 
                   paymentMethod === 'crypto' ? `${getConversions(extraPrice).usdt} USDT` : 
                   `+$${extraPrice.toLocaleString()}`}
                </span>
              </div>
            )}
          </div>

          {/* ✅ CÓDIGO DE DESCUENTO ESTABILIZADO VISUALMENTE */}
          <div className="mb-8 bg-black/40 border border-zinc-800 p-5 rounded-3xl">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">¿Código de Referido / Promoción?</label>
              <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                      type="text" 
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Ej: JUAN74"
                      className="w-full sm:flex-1 bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-zinc-600"
                      disabled={discountApplied !== null || validatingCode}
                  />
                  {!discountApplied ? (
                      <button 
                          type="button"
                          onClick={handleValidateCode}
                          disabled={validatingCode || !referralCode.trim()}
                          className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                      >
                          {validatingCode ? 'Validando...' : 'Aplicar Código'}
                      </button>
                  ) : (
                      <button 
                          type="button"
                          onClick={() => { setDiscountApplied(null); setReferralCode(""); }}
                          className="w-full sm:w-auto bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/20 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center whitespace-nowrap"
                      >
                          Quitar Descuento
                      </button>
                  )}
              </div>
              
              {codeError && <p className="text-red-500 text-[10px] font-bold mt-3 uppercase ml-1">{codeError}</p>}
              
              {discountApplied && (
                  <p className="text-emerald-400 text-xs font-black mt-4 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                      <span className="text-xl">✅</span> ¡CÓDIGO {discountApplied.code} APLICADO! (-{discountApplied.percentage}%)
                  </p>
              )}
          </div>

          <div className="flex justify-between items-end mb-10">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
               {paymentMethod === 'usd' ? 'Inversión Final (USD)' : 
                paymentMethod === 'crypto' ? 'Inversión Final (CRIPTO)' : 
                'Inversión Final (ARS)'}
            </span>
            <div className="text-right">
              {/* Mostramos el precio tachado si hay descuento */}
              {discountApplied && (
                  <div className="text-sm font-bold text-zinc-600 line-through mb-1">
                      {paymentMethod === 'usd' ? `U$D ${originalConversions.usd}` : 
                       paymentMethod === 'crypto' ? `${originalConversions.usdt} USDT` : 
                       `$${subtotal.toLocaleString()}`}
                  </div>
              )}
              
              <div className={`text-5xl font-black tracking-tighter ${discountApplied ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400'}`}>
                 {paymentMethod === 'usd' ? `U$D ${conversions.usd}` : 
                  paymentMethod === 'crypto' ? `${conversions.usdt}` : 
                  `$${totalAmount.toLocaleString()}`}
              </div>
              {paymentMethod === 'crypto' && (
                 <div className="text-xs font-mono font-bold text-zinc-500 mt-2">
                    o ₿ {conversions.btc} BTC
                 </div>
              )}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="relative w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 overflow-hidden group border border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-black bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95">
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>}
              {loading ? "PROCESANDO PEDIDO..." : paymentMethod === 'mercadopago' ? "IR A PAGAR DE FORMA SEGURA" : "GENERAR PEDIDO AHORA"}
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