"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";
import Link from "next/link";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!plan) return;
    if (!name.trim()) return setError("Ingresá tu nombre completo.");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError("Ingresá un email válido.");
    if (!confirmAdult) return setError("Debés confirmar que sos hombre mayor de 18 años.");
    if (!acceptReqs) return setError("Debés aceptar los requisitos mínimos para comenzar.");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!plan) return null;

  const includes = plan.benefits?.includes || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 -z-10 tech-grid opacity-10" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <nav className="border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl">
        <div className="container-pad h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a planes
          </Link>
          <div className="text-xs text-zinc-600 font-mono">Checkout Seguro</div>
        </div>
      </nav>

      <div className="container-pad py-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-black mb-6">Tus Datos</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-zinc-400  tracking-wider ml-1 block mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400  tracking-wider ml-1 block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input"
                    placeholder="tu@email.com"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-2 ml-1">
                    Usá un email real. Te enviaremos tu programa a esta dirección.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400  tracking-wider ml-1 block mb-2">
                    Referencia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customerRef}
                    onChange={(e) => setCustomerRef(e.target.value)}
                    className="glass-input"
                    placeholder="Instagram, DNI, etc."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400  tracking-wider ml-1 block mb-4">
                    Método de Pago
                  </label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ars")}
                      className={`p-4 rounded-xl border transition-all ${
                        paymentMethod === "ars"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-sm font-bold mb-1">ARS</div>
                      <div className="text-xs text-zinc-500">Transferencia / MP</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("usd")}
                      className={`p-4 rounded-xl border transition-all ${
                        paymentMethod === "usd"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-sm font-bold mb-1">USD</div>
                      <div className="text-xs text-zinc-500">Internacional</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("crypto")}
                      className={`p-4 rounded-xl border transition-all ${
                        paymentMethod === "crypto"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-sm font-bold mb-1">Cripto</div>
                      <div className="text-xs text-zinc-500">USDT/USDC</div>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={confirmAdult}
                      onChange={(e) => setConfirmAdult(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-emerald-500"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      Confirmo que soy hombre mayor de 18 años
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptReqs}
                      onChange={(e) => setAcceptReqs(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-emerald-500"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      Acepto los requisitos mínimos: constancia, sueño adecuado y registro de cargas
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-premium w-full"
                >
                  {submitting ? "GENERANDO ORDEN..." : "CONTINUAR AL PAGO"}
                </button>

                <p className="text-xs text-zinc-600 text-center">
                  Al continuar, aceptás nuestros{" "}
                  <Link href="/legal/terms" className="text-emerald-400 hover:underline">
                    Términos y Condiciones
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-6 space-y-6">
              <div>
                <h3 className="text-lg font-black mb-4">Resumen de Compra</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Plan Seleccionado</div>
                    <div className="text-xl font-bold">{plan.name}</div>
                    <div className="text-sm text-zinc-500">{plan.days} días por semana</div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm text-zinc-400">Plan base</span>
                      <span className="font-bold">{formatARS(plan.price_ars)}</span>
                    </div>

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 cursor-pointer hover:border-emerald-500/30 transition-all">
                      <input
                        type="checkbox"
                        checked={extraVideo}
                        onChange={(e) => setExtraVideo(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold mb-1">Revisión Técnica por Video</div>
                        <div className="text-xs text-zinc-500">Análisis detallado de tu técnica</div>
                      </div>
                      <div className="text-sm font-bold text-emerald-400">
                        +{formatARS(EXTRA_VIDEO_PRICE_ARS)}
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-black text-emerald-400">{formatARS(totalARS)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {includes.length > 0 && (
                <div className="pt-6 border-t border-zinc-800">
                  <div className="text-sm font-bold text-zinc-400 mb-3">Incluye</div>
                  <ul className="space-y-2">
                    {includes.slice(0, 4).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Cargando checkout...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
