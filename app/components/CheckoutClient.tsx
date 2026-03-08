"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getConversions } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// ⚙️ PANEL MASTER DE CONFIGURACIÓN DEL COACH ⚙️
// ============================================================================

// 🔥 ACTUALIZADO: AHORA DA UN 15% OFF AL NUEVO ATLETA 🔥
const DESCUENTO_POR_REFERIDO = 15;

// SUS CÓDIGOS PROPIOS (No le regalan saldo a nadie, solo hacen descuento)
const MIS_CODIGOS_PROPIOS: Record<string, number> = {
  BII10: 10,
  PROMO15: 15,
  TUJAGUE20: 20,
};
// ============================================================================

interface CheckoutClientProps {
  selectedPlan: { id: string; title: string; subtitle: string; price: number };
  extraVideo: boolean;
  extraPrice: number;
}

type PaymentMethod = "mercadopago" | "transferencia" | "usd" | "crypto";

export default function CheckoutClient({
  selectedPlan,
  extraVideo,
  extraPrice,
}: CheckoutClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mercadopago");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    instagram: "",
    age: "0",
    phone: "",
    experience: "intermedio",
    goal: "fuerza",
    injuries: "no",
    equipment: "gimnasio",
  });

  const [referralCode, setReferralCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{
    code: string;
    percentage: number;
  } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const abandonIdRef = useRef<string | null>(null);

  // 🔥 CANDADO DE SEGURIDAD: Bloquear UpSells si es un plan estático
  const isStaticPlan = selectedPlan.id.startsWith("static");
  const finalExtraVideo = isStaticPlan ? false : extraVideo;

  const captureAbandon = async () => {
    if (!formData.email && !formData.phone) return;

    try {
      if (abandonIdRef.current) {
        await supabase
          .from("abandoned_checkouts")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          })
          .eq("id", abandonIdRef.current);
      } else {
        const { data, error } = await supabase
          .from("abandoned_checkouts")
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              plan_title: selectedPlan.title,
              plan_price: selectedPlan.price,
            },
          ])
          .select()
          .single();

        if (data && !error) {
          abandonIdRef.current = data.id;
        }
      }
    } catch (err) {
      console.error("Error silencioso capturando lead", err);
    }
  };

  // 🔥 SISTEMA ANTI-FRAUDE Y VALIDACIÓN DE CÓDIGOS 🔥
  const handleValidateCode = async () => {
    if (!referralCode.trim()) return;
    if (!formData.email.trim()) {
      setCodeError("Debes escribir tu Email primero para usar un código.");
      return;
    }

    setValidatingCode(true);
    setCodeError("");
    const cleanCodeToTest = referralCode.trim().toUpperCase();
    const cleanEmailToTest = formData.email.trim().toLowerCase();

    try {
      // 1. Verificar si es un código personal del Coach
      if (MIS_CODIGOS_PROPIOS[cleanCodeToTest]) {
        setDiscountApplied({
          code: cleanCodeToTest,
          percentage: MIS_CODIGOS_PROPIOS[cleanCodeToTest],
        });
        setValidatingCode(false);
        return;
      }

      // 2. Si no es del Coach, buscar en la Base de Datos a ver si es de un alumno
      const { data: atletaDueño } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email")
        .eq("referral_code", cleanCodeToTest)
        .single();

      if (atletaDueño) {
        // BARRERA ANTI-TRAMPAS
        if (atletaDueño.customer_email.toLowerCase() === cleanEmailToTest) {
          setCodeError(
            "🚫 Fraude detectado: No puedes utilizar tu propio código de afiliado."
          );
          setDiscountApplied(null);
        } else {
          setDiscountApplied({
            code: cleanCodeToTest,
            percentage: DESCUENTO_POR_REFERIDO,
          });
        }
      } else {
        setCodeError("El código ingresado es inválido o no existe.");
        setDiscountApplied(null);
      }
    } catch (err) {
      setCodeError("Error de red al validar el código. Intenta de nuevo.");
    } finally {
      setValidatingCode(false);
    }
  };

  // Cálculo matemático del total
  const subtotal = selectedPlan.price + (finalExtraVideo ? extraPrice : 0);
  const discountMultiplier = discountApplied
    ? 1 - discountApplied.percentage / 100
    : 1;
  const totalAmount = Math.round(subtotal * discountMultiplier);

  // 🔥 SALVAVIDAS PARA VERCEL
  const originalConversions = (getConversions as any)(subtotal);
  const conversions = (getConversions as any)(totalAmount);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      alert("Por favor, completá todos los campos obligatorios (*)");
      return;
    }

    if (formData.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();

      // 1. Creación o inicio de sesión en Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(), // Importante guardar el nombre para el PDF
          }
        }
      });

      if (authError && authError.message.toLowerCase().includes("already registered")) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password,
        });

        if (signInError) {
          alert("Ese email ya tiene cuenta pero la contraseña es incorrecta. Si ya eras alumno, usá tu contraseña anterior.");
          setLoading(false);
          return;
        }
      } else if (authError) {
        throw new Error("No pudimos crear tu cuenta de acceso: " + authError.message);
      }

      // 2. Mapeo de métodos de pago
      const methodMapping = {
        mercadopago: "mercado_pago",
        transferencia: "transfer_ars",
        crypto: "crypto",
        usd: "international_usd",
      };

      // 🔥 ACÁ ESTÁ LA MAGIA: DECIDIMOS A QUÉ MOTOR MANDAR LA ORDEN 🔥
      if (isStaticPlan) {
        // ----------------------------------------------------
        // MOTOR NUEVO (PRODUCTOS DIGITALES - MESOCICLOS PDF)
        // ----------------------------------------------------
        
        // Ajustamos el ID para que coincida con el "slug" de nuestra base de datos commerce_products
        let productSlug = "";
        if (selectedPlan.id === "static-fuerza") productSlug = "mesociclo-fuerza-4-semanas";
        if (selectedPlan.id === "static-hipertrofia") productSlug = "mesociclo-hipertrofia-4-semanas";

        const response = await fetch('/api/commerce/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Error al iniciar checkout');
        
        if (abandonIdRef.current) {
          await supabase.from("abandoned_checkouts").delete().eq("id", abandonIdRef.current);
        }

        // Redirigir a Mercado Pago
        if (data.init_point) {
          window.location.href = data.init_point;
        }

      } else {
        // ----------------------------------------------------
        // MOTOR VIEJO (SUSCRIPCIONES Y COACHING)
        // ----------------------------------------------------
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
            extraVideo: finalExtraVideo,
            referredBy: discountApplied?.code || null,
            finalPrice: totalAmount,
            onboardingData: {
              age: formData.age,
              phone: formData.phone,
              experience: formData.experience,
              goal: formData.goal,
              injuries: formData.injuries,
              equipment: formData.equipment,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error al procesar la orden");

        if (abandonIdRef.current) {
          await supabase.from("abandoned_checkouts").delete().eq("id", abandonIdRef.current);
        }

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else if (data.orderId) {
          router.push(`/order/${data.orderId}?email=${encodeURIComponent(cleanEmail)}`);
        }
      }

    } catch (err: any) {
      console.error(err);
      alert("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-black/40 border-2 border-zinc-800/80 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-600 placeholder:font-medium";
  const labelClass =
    "block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest ml-1";

  return (
    <div className="grid lg:grid-cols-12 gap-12 text-left p-6 md:p-14 relative z-10">
      <div className="lg:col-span-7 space-y-12">
        <section>
          <div className="flex items-center gap-5 mb-8">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-xl shadow-lg shrink-0 ${
                isStaticPlan
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              }`}
            >
              1
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">
                Ficha de Acceso
              </h3>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
                  isStaticPlan ? "text-zinc-400" : "text-emerald-500"
                }`}
              >
                Creación de cuenta privada
              </p>
            </div>
          </div>

          <div className="space-y-6 bg-zinc-900/30 p-6 md:p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={labelClass}>
                  Nombre Completo <span className="text-emerald-500">*</span>
                </label>
                <input
                  required
                  className={inputClass}
                  placeholder="Ej: Juan Pérez"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onBlur={captureAbandon}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  Email <span className="text-emerald-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  className={inputClass}
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onBlur={captureAbandon}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Creá una Contraseña <span className="text-emerald-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  placeholder="Para entrar a tu panel"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  WhatsApp (Soporte) <span className="text-emerald-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  className={inputClass}
                  placeholder="+54 9 11..."
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  onBlur={captureAbandon}
                />
              </div>
              <div>
                <label className={labelClass}>Instagram (Opcional)</label>
                <input
                  className={inputClass}
                  placeholder="@usuario"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                />
              </div>
            </div>

            <div
              className={`p-4 border rounded-xl mt-4 text-center ${
                isStaticPlan
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-emerald-500/10 border-emerald-500/20"
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isStaticPlan ? "text-zinc-500" : "text-emerald-400"
                }`}
              >
                {isStaticPlan
                  ? "Obtendrás acceso automático al Dashboard al confirmar el pago."
                  : "Al completar el pago accederás a la auditoría clínica profunda."}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-5 mb-8 pt-8 border-t border-white/5">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-xl shadow-lg shrink-0 ${
                isStaticPlan
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              }`}
            >
              2
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">
                Método de Pago
              </h3>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
                  isStaticPlan ? "text-zinc-400" : "text-emerald-500"
                }`}
              >
                Seleccioná tu divisa
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod("mercadopago")}
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                paymentMethod === "mercadopago"
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30"
              }`}
            >
              Mercado Pago
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("transferencia")}
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                paymentMethod === "transferencia"
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30"
              }`}
            >
              Transferencia ARS
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("crypto")}
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                paymentMethod === "crypto"
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30"
              }`}
            >
              Cripto (USDT/BTC)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("usd")}
              className={`p-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                paymentMethod === "usd"
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 bg-black/30"
              }`}
            >
              Dólar (INTL)
            </button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 min-h-[90px] flex items-center justify-center text-center backdrop-blur-sm transition-all duration-300">
            {paymentMethod === "mercadopago" && (
              <p className="text-sm font-medium text-zinc-300">
                Abonarás en pesos argentinos de forma segura a través de{" "}
                <span className="text-blue-400 font-bold">Mercado Pago</span>.
              </p>
            )}
            {paymentMethod === "transferencia" && (
              <p className="text-sm font-medium text-zinc-300">
                Generá tu pedido para ver el{" "}
                <span className="text-emerald-400 font-bold">Alias/CBU</span> y
                transferir en pesos.
              </p>
            )}
            {paymentMethod === "crypto" && (
              <p className="text-sm font-medium text-zinc-300">
                Generá tu pedido para ver las billeteras y enviar{" "}
                <span className="font-mono text-emerald-400 font-bold">
                  {conversions.usdt} USDT/USDC
                </span>{" "}
                o{" "}
                <span className="font-mono text-emerald-400 font-bold">
                  {conversions.btc} BTC
                </span>
                .
              </p>
            )}
            {paymentMethod === "usd" && (
              <p className="text-sm font-medium text-zinc-300">
                Generá tu pedido para ver los datos bancarios y transferir{" "}
                <span className="font-mono text-emerald-400 font-bold">
                  U$D {conversions.usd}
                </span>{" "}
                (ACH o Local).
              </p>
            )}
          </div>

          <div className="mt-8 bg-zinc-900/40 border border-zinc-700/50 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-black border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
              <span className="text-zinc-400 font-black text-xs italic">i</span>
            </div>
            <div>
              <strong className="text-white text-sm block mb-1 tracking-wide">
                Términos de Inscripción
              </strong>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Al continuar, aceptás que este es un servicio de pago único y
                declarás estar apto físicamente. No se realizan reembolsos por
                bajas anticipadas.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-5 relative">
        <div className="bg-zinc-900/80 border border-white/5 p-8 md:p-10 rounded-[2.5rem] h-fit shadow-2xl sticky top-28 backdrop-blur-xl">
          <div className="mb-8">
            <h3
              className={`text-[10px] font-black mb-2 uppercase tracking-[0.2em] border-b pb-2 inline-block ${
                isStaticPlan
                  ? "text-white border-white/20"
                  : "text-emerald-500 border-emerald-500/20"
              }`}
            >
              Tu Selección
            </h3>
            <p className="text-white font-black text-3xl tracking-tighter italic uppercase mt-2">
              {selectedPlan.title}
            </p>
            <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase mt-2">
              {selectedPlan.subtitle}
            </p>
          </div>

          <div className="space-y-4 mb-8 border-y border-zinc-800/80 py-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300 font-medium">
                Suscripción Base
              </span>
              <span className="text-white font-mono text-lg">
                {paymentMethod === "usd"
                  ? `U$D ${getConversions(selectedPlan.price).usd}`
                  : paymentMethod === "crypto"
                  ? `${getConversions(selectedPlan.price).usdt} USDT`
                  : `$${selectedPlan.price.toLocaleString()}`}
              </span>
            </div>
            {finalExtraVideo && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-400 font-medium flex items-center gap-2">
                  <span className="bg-emerald-500/20 px-1.5 rounded font-black">
                    +
                  </span>
                  Video Análisis
                </span>
                <span className="text-emerald-400 font-mono text-lg">
                  {paymentMethod === "usd"
                    ? `U$D ${getConversions(extraPrice).usd}`
                    : paymentMethod === "crypto"
                    ? `${getConversions(extraPrice).usdt} USDT`
                    : `+$${extraPrice.toLocaleString()}`}
                </span>
              </div>
            )}
          </div>

          <div
            className={`mb-8 bg-black/40 border p-5 rounded-3xl transition-all ${
              codeError ? "border-red-500/50" : "border-zinc-800"
            }`}
          >
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">
              ¿Código de Referido / Promoción?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={referralCode}
                onChange={(e) =>
                  setReferralCode(e.target.value.toUpperCase())
                }
                placeholder="Ej: JUAN74 o TUJAGUE20"
                className="w-full sm:flex-1 bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-zinc-600"
                disabled={discountApplied !== null || validatingCode}
              />
              {!discountApplied ? (
                <button
                  type="button"
                  onClick={handleValidateCode}
                  disabled={
                    validatingCode ||
                    !referralCode.trim() ||
                    !formData.email.trim()
                  }
                  className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                >
                  {validatingCode ? "Validando..." : "Aplicar Código"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDiscountApplied(null);
                    setReferralCode("");
                  }}
                  className="w-full sm:w-auto bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/20 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center whitespace-nowrap"
                >
                  Quitar
                </button>
              )}
            </div>
            {codeError && (
              <p className="text-red-500 text-[10px] font-bold mt-3 uppercase ml-1">
                {codeError}
              </p>
            )}
            {discountApplied && (
              <p className="text-emerald-400 text-xs font-black mt-4 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                <span className="text-xl">✅</span> ¡CÓDIGO APLICADO! (-
                {discountApplied.percentage}%)
              </p>
            )}
          </div>

          <div className="flex justify-between items-end mb-10">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              Inversión Final
            </span>
            <div className="text-right">
              {discountApplied && (
                <div className="text-sm font-bold text-zinc-600 line-through mb-1">
                  {paymentMethod === "usd"
                    ? `U$D ${originalConversions.usd}`
                    : paymentMethod === "crypto"
                    ? `${originalConversions.usdt} USDT`
                    : `$${subtotal.toLocaleString()}`}
                </div>
              )}
              <div
                className={`text-5xl font-black tracking-tighter ${
                  discountApplied
                    ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400"
                }`}
              >
                {paymentMethod === "usd"
                  ? `U$D ${conversions.usd}`
                  : paymentMethod === "crypto"
                  ? `${conversions.usdt}`
                  : `$${totalAmount.toLocaleString()}`}
              </div>
              {paymentMethod === "crypto" && (
                <div className="text-xs font-mono font-bold text-zinc-500 mt-2">
                  o ₿ {conversions.btc} BTC
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`relative w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 overflow-hidden group border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
              isStaticPlan
                ? "bg-white hover:bg-zinc-200 text-black shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_40px_rgba(16,185,129,0.3)]"
            } active:scale-95`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              )}
              {loading
                ? "PROCESANDO PEDIDO..."
                : paymentMethod === "mercadopago"
                ? "IR A PAGAR DE FORMA SEGURA"
                : "GENERAR PEDIDO AHORA"}
            </span>
            {!loading && (
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}