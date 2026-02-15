"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";
import Link from "next/link";

// --- PASO 1: EL CEREBRO DE PRECIOS Y CONVERSIÓN ---
const TASAS_CAMBIO = {
  dolar: 1200,      // 1 USD = 1200 ARS (Ajustalo según el blue/comisiones)
  btc: 85000000     // 1 BTC en ARS (Aproximado)
};

type Plan = {
  id: string;
  code: string;
  name: string;
  cadence: "weekly" | "monthly";
  days: number;
  price_ars: number;
  benefits: {
    includes?: string[];
    highlight?: string;
  };
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planCode = searchParams.get("plan");

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Nuevo estado para el teléfono
  const [customerRef, setCustomerRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ars" | "usd" | "crypto">("ars");
  const [extraVideo, setExtraVideo] = useState(false);
  const [confirmAdult, setConfirmAdult] = useState(false);
  const [acceptReqs, setAcceptReqs] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planCode) {
      router.push("/");
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/plans", { cache: "no-store" });
        const json = await res.json();
        const foundPlan = json.plans?.find((p: Plan) => p.code === planCode);

        if (!foundPlan) {
          router.push("/");
          return;
        }

        setPlan(foundPlan);
      } catch (e) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planCode, router]);

  const totalARS = useMemo(() => {
    if (!plan) return 0;
    return plan.price_ars + (extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0);
  }, [plan, extraVideo]);

  // --- LÓGICA DE CONVERSIÓN AUTOMÁTICA ---
  const totalConvertido = useMemo(() => {
    if (paymentMethod === "usd") return `U$D ${(totalARS / TASAS_CAMBIO.dolar).toFixed(2)}`;
    if (paymentMethod === "crypto") {
      const usdt = (totalARS / TASAS_CAMBIO.dolar).toFixed(2);
      const btc = (totalARS / TASAS_CAMBIO.btc).toFixed(8);
      return `${usdt} USDT o ₿ ${btc}`;
    }
    return formatARS(totalARS);
  }, [totalARS, paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!plan) return;
    if (!name.trim()) return setError("Ingresá tu nombre completo.");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError("Ingresá un email válido.");
    if (!phone.trim() || phone.length < 8) return setError("Ingresá un WhatsApp de contacto válido.");
    if (!confirmAdult) return setError("Debés confirmar que sos hombre mayor de 18 años.");
    if (!acceptReqs) return setError("Debés aceptar los requisitos mínimos.");

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: plan.code,
          paymentMethod,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          customerPhone: "54" + phone.replace(/\D/g, ''), // Guardamos limpio con el 54
          customerRef: customerRef.trim(),
          extraVideo,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error creando orden");

      const { orderId, paymentUrl } = json;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else if (orderId) {
        router.push(`/order/${orderId}?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (e: any) {
      setError(e.message || "Error al crear la orden. Intentá nuevamente.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">Cargando...</div>;
  if (!plan) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 -z-10 tech-grid opacity-10" />
      
      <nav className="border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container-pad h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            ← Volver a planes
          </Link>
          <div className="text-[10px] font-black tracking-[0.2em] text-emerald-500 uppercase italic">Tujaque Strength System</div>
        </div>
      </nav>

      <div className="container-pad py-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-8 animate-fade-in border-white/5">
              <h2 className="text-2xl font-black mb-6 italic">Tus Datos de <span className="text-emerald-400">Atleta</span></h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2 block ml-1">Nombre Completo</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="glass-input" placeholder="Juan Pérez" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2 block ml-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input" placeholder="tu@email.com" required />
                  </div>
                </div>

                {/* --- CAMPO DE TELÉFONO CON +54 FIJO --- */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-2 block ml-1">WhatsApp de contacto</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-zinc-900 text-zinc-500 font-bold text-sm">+54</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 bg-black border border-white/10 rounded-r-xl px-4 py-4 text-white outline-none focus:border-emerald-500 transition-all font-mono"
                      placeholder="9 11 2302 1760"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-4 block ml-1">Método de Pago</label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <button type="button" onClick={() => setPaymentMethod("ars")} className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === "ars" ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950/40"}`}>
                      <div className="text-sm font-bold mb-1">ARS</div>
                      <div className="text-[10px] text-zinc-500">Transferencia / MP</div>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("usd")} className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === "usd" ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950/40"}`}>
                      <div className="text-sm font-bold mb-1">USD INTL</div>
                      <div className="text-[10px] text-zinc-500">PayPal / Wise / Zelle</div>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("crypto")} className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === "crypto" ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950/40"}`}>
                      <div className="text-sm font-bold mb-1">CRYPTO</div>
                      <div className="text-[10px] text-zinc-500">USDT / BTC</div>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={confirmAdult} onChange={(e) => setConfirmAdult(e.target.checked)} className="mt-1 w-5 h-5 accent-emerald-500" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-100 transition-colors">Confirmo que soy hombre mayor de 18 años</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={acceptReqs} onChange={(e) => setAcceptReqs(e.target.checked)} className="mt-1 w-5 h-5 accent-emerald-500" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-100 transition-colors">Acepto los requisitos mínimos (Constancia y registro de cargas)</span>
                  </label>
                </div>

                {/* --- AVISO DE LAS 48 HORAS --- */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                  <p className="text-[10px] text-emerald-400 leading-relaxed font-medium italic">
                    ⚠️ <span className="font-black uppercase">Importante:</span> Una vez validado tu pago, Luciano Tujague dispone de hasta **48 horas hábiles** para cargar tu planificación personalizada en el Dashboard.
                  </p>
                </div>

                {error && <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs">{error}</div>}

                <button type="submit" disabled={submitting} className="btn-premium w-full py-5 text-sm tracking-[0.2em] font-black uppercase">
                  {submitting ? "PROCESANDO..." : "GENERAR ORDEN DE PAGO"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card p-8 sticky top-24 space-y-6 border-white/5">
              <h3 className="text-lg font-black italic tracking-tighter">Resumen de <span className="text-emerald-400">Inversión</span></h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Plan Seleccionado</div>
                  <div className="text-xl font-black italic text-white">{plan.name}</div>
                  <div className="text-xs text-zinc-500 italic">Frecuencia: {plan.days} días por semana</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Plan base</span>
                    <span className="font-bold">{formatARS(plan.price_ars)}</span>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-black/40 cursor-pointer hover:border-emerald-500/30 transition-all">
                    <input type="checkbox" checked={extraVideo} onChange={(e) => setExtraVideo(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                    <div className="flex-1 text-[10px] font-bold text-zinc-400 uppercase">Biomecánica Extra</div>
                    <div className="text-xs font-black text-emerald-400">+{formatARS(EXTRA_VIDEO_PRICE_ARS)}</div>
                  </label>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-sm font-black uppercase text-zinc-500 tracking-widest">Total a pagar</span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-400 italic tracking-tighter">{totalConvertido}</div>
                    {paymentMethod !== 'ars' && (
                      <div className="text-[10px] text-zinc-600 font-mono mt-1">Ref: {formatARS(totalARS)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 italic">Cargando Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}