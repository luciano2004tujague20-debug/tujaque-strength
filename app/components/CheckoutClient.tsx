"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EXTRA_VIDEO_PRICE_ARS } from "@/lib/pricing";

type Plan = {
  id: string;
  code: string;
  name: string;
  days: number;
  cadence: "weekly" | "monthly";
  price_ars: number;
  active?: boolean;
  benefits?: {
    includes?: string[];
    [k: string]: any;
  };
};

type CheckoutClientProps = {
  selectedPlan?: Plan | null;
  hidePlanSelector?: boolean;
  initialExtraVideo?: boolean;
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function CheckoutClient({
  selectedPlan: selectedPlanProp,
  hidePlanSelector = false,
  initialExtraVideo = false,
}: CheckoutClientProps) {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(
    selectedPlanProp?.code ?? ""
  );

  const [paymentMethod, setPaymentMethod] = useState<"ars" | "usd" | "crypto">(
    "ars"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [customerRef, setCustomerRef] = useState("");
  const [confirmAdultMan, setConfirmAdultMan] = useState(false);
  const [acceptReq, setAcceptReq] = useState(false);
  const [extraVideo, setExtraVideo] = useState(initialExtraVideo);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlanProp) {
      setPlans([selectedPlanProp]);
      setSelectedPlanCode(selectedPlanProp.code);
      setLoadingPlans(false);
      setPlansError(null);
      return;
    }

    (async () => {
      setLoadingPlans(true);
      setPlansError(null);
      try {
        const res = await fetch("/api/plans", { cache: "no-store" });
        const json = await res.json();
        const fetchedPlans = Array.isArray(json.plans) ? json.plans : [];
        setPlans(fetchedPlans);
        if (fetchedPlans.length > 0) {
          setSelectedPlanCode(fetchedPlans[0].code);
        }
      } catch {
        setPlansError("No se pudieron cargar los planes.");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [selectedPlanProp]);

  useEffect(() => {
    setExtraVideo(initialExtraVideo);
  }, [initialExtraVideo]);

  const selectedPlan = useMemo(() => {
    if (selectedPlanProp) return selectedPlanProp;
    return plans.find((p) => p.code === selectedPlanCode);
  }, [plans, selectedPlanCode, selectedPlanProp]);

  const includes = useMemo(() => {
    const arr = selectedPlan?.benefits?.includes;
    return Array.isArray(arr) ? arr : [];
  }, [selectedPlan]);

  const extraArs = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;
  const totalArs = (selectedPlan?.price_ars ?? 0) + extraArs;

  async function createOrder() {
    setCreateError(null);

    if (!selectedPlan?.code) return setCreateError("Seleccioná un plan.");
    if (!name.trim()) return setCreateError("Ingresá tu nombre.");
    if (!email.trim()) return setCreateError("Ingresá tu email.");
    if (!confirmAdultMan)
      return setCreateError("Tenés que confirmar que sos hombre.");
    if (!acceptReq)
      return setCreateError("Tenés que aceptar los requisitos mínimos.");

    setCreating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan.code,
          paymentMethod,
          name: name.trim(),
          email: email.trim(),
          customerRef: customerRef.trim() || null,
          extraVideo,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Error creando orden.");
      }

      const orderId = json.orderId as string;
      router.push(`/order/${orderId}?email=${encodeURIComponent(email.trim())}`);
    } catch (e: any) {
      setCreateError(e.message || "Error creando orden.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="glass-card mx-auto max-w-3xl px-4 py-8">
      <h3 className="text-2xl font-black text-zinc-100">Checkout</h3>
      <p className="mt-2 text-zinc-400">
        Confirmá tus datos y generá tu orden de pago.
      </p>

      {loadingPlans && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-300">
          Cargando planes...
        </div>
      )}

      {plansError && (
        <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-red-200">
          {plansError}
        </div>
      )}

      {!loadingPlans && !plansError && (
        <>
          {!hidePlanSelector && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {plans.map((p) => {
                const active = p.code === selectedPlanCode;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanCode(p.code)}
                    className={[
                      "text-left rounded-2xl border p-5 transition",
                      active
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-zinc-100">{p.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {p.cadence === "weekly" ? "Semanal" : "Mensual"} • {p.days} días
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-zinc-100">{formatARS(p.price_ars)}</p>
                        <p className="text-xs text-zinc-400">ARS</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm font-semibold text-zinc-200">Método de pago</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["ars", "usd", "crypto"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm transition",
                    paymentMethod === m
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-900/60",
                  ].join(" ")}
                >
                  {m === "ars" ? "Transferencia ARS" : m === "usd" ? "Internacional (USD)" : "Cripto"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm font-semibold text-zinc-200">Tus datos</p>
            <div className="mt-4 grid gap-3">
              <input
                className="glass-input"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="glass-input"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="glass-input"
                placeholder="Referencia (opcional) — DNI / IG / etc"
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={confirmAdultMan}
                  onChange={(e) => setConfirmAdultMan(e.target.checked)}
                />
                <span>Confirmo que soy hombre.</span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={acceptReq}
                  onChange={(e) => setAcceptReq(e.target.checked)}
                />
                <span>Acepto los requisitos mínimos (constancia, sueño, registro de cargas).</span>
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={extraVideo}
                onChange={(e) => setExtraVideo(e.target.checked)}
              />
              <div className="flex-1">
                <p className="font-semibold text-zinc-100">Revisión técnica por video (extra)</p>
                <p className="text-sm text-zinc-400">
                  Enviás tu video y recibís correcciones y claves técnicas. Costo adicional.
                </p>
              </div>
              <div className="font-semibold text-zinc-100">{formatARS(EXTRA_VIDEO_PRICE_ARS)}</div>
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm font-semibold text-zinc-200">Resumen</p>
            <div className="mt-3">
              <p className="text-lg font-bold text-zinc-100">{selectedPlan?.name ?? "—"}</p>
              <p className="mt-1 text-zinc-300">
                Total: <span className="font-bold text-emerald-300">{formatARS(totalArs)}</span>
              </p>
              {includes.length > 0 && (
                <p className="mt-2 text-sm text-zinc-400">Incluye: {includes.join(" • ")}</p>
              )}
              {extraVideo && (
                <p className="mt-2 text-sm text-zinc-400">Servicio extra: Revisión técnica por video.</p>
              )}
            </div>

            {createError && (
              <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-red-200">
                {createError}
              </div>
            )}

            <button
              type="button"
              disabled={creating}
              onClick={createOrder}
              className="btn-primary mt-5 w-full"
            >
              {creating ? "Generando..." : "Generar orden"}
            </button>

            <p className="mt-3 text-xs text-zinc-500">
              Luego verás las instrucciones de pago y podrás subir el comprobante.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
