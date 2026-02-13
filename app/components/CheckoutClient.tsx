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

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function CheckoutClient() {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");

  const [paymentMethod, setPaymentMethod] = useState<"ars" | "usd" | "crypto">(
    "ars"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [customerRef, setCustomerRef] = useState("");

  // Checkboxes del cliente
  const [confirmAdultMan, setConfirmAdultMan] = useState(false);
  const [acceptReq, setAcceptReq] = useState(false);

  // ✅ EXTRA VIDEO
  const [extraVideo, setExtraVideo] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingPlans(true);
      setPlansError(null);
      try {
        const res = await fetch("/api/plans", { cache: "no-store" });
        const json = await res.json();
        setPlans(Array.isArray(json.plans) ? json.plans : []);
        // seleccionar primero por defecto
        if (Array.isArray(json.plans) && json.plans.length > 0) {
          setSelectedPlanCode(json.plans[0].code);
        }
      } catch (e: any) {
        setPlansError("No se pudieron cargar los planes.");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode),
    [plans, selectedPlanCode]
  );

  const includes = useMemo(() => {
    const arr = selectedPlan?.benefits?.includes;
    return Array.isArray(arr) ? arr : [];
  }, [selectedPlan]);

  const extraArs = extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0;
  const totalArs = (selectedPlan?.price_ars ?? 0) + extraArs;

  async function createOrder() {
    setCreateError(null);

    if (!selectedPlanCode) return setCreateError("Seleccioná un plan.");
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
          planCode: selectedPlanCode,
          paymentMethod,
          name: name.trim(),
          email: email.trim(),
          customerRef: customerRef.trim() || null,

          // ✅ EXTRA
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-100">Elegí tu plan</h1>
      <p className="mt-2 text-zinc-400">
        Seleccioná plan + método de pago y generá tu orden.
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
          {/* Planes */}
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
                      <p className="text-lg font-semibold text-zinc-100">
                        {p.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {p.cadence === "weekly" ? "Semanal" : "Mensual"} •{" "}
                        {p.days} días
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-zinc-100">
                        {formatARS(p.price_ars)}
                      </p>
                      <p className="text-xs text-zinc-400">ARS</p>
                    </div>
                  </div>

                  {Array.isArray(p.benefits?.includes) &&
                    p.benefits!.includes!.length > 0 && (
                      <ul className="mt-4 grid gap-2 text-sm text-zinc-300">
                        {p.benefits!.includes!.slice(0, 4).map((x, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                </button>
              );
            })}
          </div>

          {/* Método de pago */}
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm font-semibold text-zinc-200">
              Método de pago
            </p>
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
                  {m === "ars"
                    ? "Transferencia ARS"
                    : m === "usd"
                    ? "Internacional (USD)"
                    : "Cripto"}
                </button>
              ))}
            </div>
          </div>

          {/* Datos */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm font-semibold text-zinc-200">Tus datos</p>

            <div className="mt-4 grid gap-3">
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-zinc-100 outline-none"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-zinc-100 outline-none"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-zinc-100 outline-none"
                placeholder="Referencia (opcional) — DNI / IG / etc"
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={confirmAdultMan}
                  onChange={(e) => setConfirmAdultMan(e.target.checked)}
                />
                <span>Confirmo que soy hombre.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={acceptReq}
                  onChange={(e) => setAcceptReq(e.target.checked)}
                />
                <span>
                  Acepto los requisitos mínimos (constancia, sueño, registro de
                  cargas).
                </span>
              </label>
            </div>
          </div>

          {/* ✅ EXTRA VIDEO */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={extraVideo}
                onChange={(e) => setExtraVideo(e.target.checked)}
              />
              <div className="flex-1">
                <p className="font-semibold text-zinc-100">
                  Revisión técnica por video (extra)
                </p>
                <p className="text-sm text-zinc-400">
                  Enviás tu video y recibís correcciones y claves técnicas. Costo
                  adicional.
                </p>
              </div>
              <div className="font-semibold text-zinc-100">
                {formatARS(EXTRA_VIDEO_PRICE_ARS)}
              </div>
            </label>
          </div>

          {/* Resumen */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm font-semibold text-zinc-200">Resumen</p>

            <div className="mt-3">
              <p className="text-lg font-bold text-zinc-100">
                {selectedPlan?.name ?? "—"}
              </p>

              <p className="mt-1 text-zinc-300">
                Total:{" "}
                <span className="font-bold text-emerald-300">
                  {formatARS(totalArs)}
                </span>
              </p>

              {includes.length > 0 && (
                <p className="mt-2 text-sm text-zinc-400">
                  Incluye: {includes.join(" • ")}
                </p>
              )}

              {extraVideo && (
                <p className="mt-2 text-sm text-zinc-400">
                  Servicio extra: Revisión técnica por video.
                </p>
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
              className="mt-5 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
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
