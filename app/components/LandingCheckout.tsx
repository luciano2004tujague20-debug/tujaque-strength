"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Cadence = "weekly" | "monthly";
type PaymentMethod = "ars" | "usd" | "crypto";

type Plan = {
  id: string;
  code: string;
  name: string;
  days: number;
  cadence: Cadence;
  price_ars: number;
  benefits?: {
    includes?: string[];
    extras?: string[];
  };
};

const EXTRA_VIDEO_PRICE_ARS = 15000;

function formatARS(n: number) {
  // 18000 => $ 18.000
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function cadenceLabel(c: Cadence) {
  return c === "weekly" ? "Semanal" : "Mensual";
}

function methodLabel(m: PaymentMethod) {
  if (m === "ars") return "Transferencia ARS";
  if (m === "usd") return "Internacional (USD)";
  return "Cripto";
}

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LandingCheckout() {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string>("");

  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("ars");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [customerRef, setCustomerRef] = useState("");

  const [confirmAdult, setConfirmAdult] = useState(false);
  const [confirmReqs, setConfirmReqs] = useState(false);

  const [extraVideo, setExtraVideo] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Fetch plans
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingPlans(true);
        setPlansError("");
        const res = await fetch("/api/plans", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "No se pudieron cargar los planes.");
        const list: Plan[] = Array.isArray(json?.plans) ? json.plans : [];
        if (!alive) return;
        setPlans(list);

        // Default select: first weekly if exists, else first plan
        const first = list.find((p) => p.cadence === "weekly") ?? list[0];
        if (first) setSelectedPlanCode(first.code);
      } catch (e: any) {
        if (!alive) return;
        setPlansError(e?.message || "Error cargando planes.");
      } finally {
        if (!alive) return;
        setLoadingPlans(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode),
    [plans, selectedPlanCode]
  );

  const includes = useMemo(() => {
    const inc = selectedPlan?.benefits?.includes ?? [];
    return Array.isArray(inc) ? inc : [];
  }, [selectedPlan]);

  const totalARS = useMemo(() => {
    const base = selectedPlan?.price_ars ?? 0;
    return base + (extraVideo ? EXTRA_VIDEO_PRICE_ARS : 0);
  }, [selectedPlan, extraVideo]);

  // Validación
  const errors = useMemo(() => {
    const out: Record<string, string> = {};
    if (!selectedPlan) out.plan = "Elegí un plan.";
    if (!name.trim() || name.trim().length < 2) out.name = "Ingresá tu nombre (mínimo 2 letras).";
    if (!emailOk(email)) out.email = "Ingresá un email válido.";
    if (!confirmAdult) out.confirmAdult = "Debés confirmar que sos hombre +18.";
    if (!confirmReqs) out.confirmReqs = "Debés aceptar los requisitos mínimos.";
    return out;
  }, [selectedPlan, name, email, confirmAdult, confirmReqs]);

  const canSubmit = Object.keys(errors).length === 0 && !submitLoading;

  async function onSubmit() {
    setSubmitError("");
    if (!canSubmit) {
      setSubmitError("Revisá los campos marcados antes de continuar.");
      return;
    }

    try {
      setSubmitLoading(true);
      const payload = {
        planCode: selectedPlanCode,
        paymentMethod: method,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        customerRef: customerRef.trim(),
        extraVideo,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "No se pudo crear la orden.");

      // --- CAMBIO PARA MERCADO PAGO ---
      const { orderId, paymentUrl } = json;

      if (!orderId) throw new Error("Respuesta inválida: falta orderId.");

      // Si el servidor nos devolvió un link de pago (Mercado Pago), vamos ahí.
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        // Si no (ej: pagó con Transferencia Manual o USD), vamos a la página de orden interna
        router.push(`/order/${orderId}`);
      }

    } catch (e: any) {
      setSubmitError(e?.message || "Error inesperado.");
      setSubmitLoading(false); // Solo bajamos el loading si hubo error
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[20%] h-[520px] w-[520px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[10%] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-zinc-900/80">
        <div className="container-pad flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/50">
              <span className="text-emerald-300 font-black">TS</span>
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">Tujaque Strength</div>
              <div className="text-xs text-zinc-400">Coaching de entrenamiento — hombres +18</div>
            </div>
          </div>

          <a
            href="#checkout"
            className="btn btn-ghost hidden sm:inline-flex"
          >
            Elegir plan
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="container-pad py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
              Rutinas con progresión real, seguimiento y orden de pago simple.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-zinc-300">
              Elegí tu plan, generá la orden y subí el comprobante. Todo en una experiencia rápida,
              clara y optimizada para móvil.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#checkout" className="btn btn-primary">
                Empezar ahora
              </a>
              <a href="#faq" className="btn btn-ghost">
                Cómo funciona
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat title="Progresión" desc="Planificación de cargas y volumen" />
              <Stat title="Check-in" desc="Seguimiento según el plan" />
              <Stat title="Rápido" desc="Checkout sin fricción" />
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold text-emerald-300">Incluye</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-200">
              <li className="flex gap-2">
                <Dot /> Rutina alineada a hipertrofia + fuerza
              </li>
              <li className="flex gap-2">
                <Dot /> Claves técnicas por ejercicio
              </li>
              <li className="flex gap-2">
                <Dot /> Soporte WhatsApp (horarios)
              </li>
              <li className="flex gap-2">
                <Dot /> Ajustes según cadencia del plan
              </li>
            </ul>
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-300">
              Tip: En mensual se hacen ajustes semanales de cargas. La revisión técnica por video es un extra opcional.
            </div>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="container-pad pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          {/* Left column */}
          <div className="space-y-6">
            {/* Plans */}
            <div className="card p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Elegí tu plan</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Seleccioná un plan. Los beneficios vienen desde tu base (Supabase).
                  </p>
                </div>
                {loadingPlans ? (
                  <span className="text-xs text-zinc-400">Cargando…</span>
                ) : (
                  <span className="text-xs text-zinc-400">{plans.length} planes</span>
                )}
              </div>

              {plansError ? (
                <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200" role="alert">
                  {plansError}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {loadingPlans
                  ? Array.from({ length: 4 }).map((_, i) => <PlanSkeleton key={i} />)
                  : plans.map((p) => (
                      <PlanCard
                        key={p.id}
                        plan={p}
                        active={p.code === selectedPlanCode}
                        onClick={() => setSelectedPlanCode(p.code)}
                      />
                    ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h3 className="text-lg font-bold">Método de pago</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Elegí cómo vas a pagar. Luego de generar la orden, verás instrucciones específicas.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`tab ${method === "ars" ? "tab-active" : ""}`}
                  onClick={() => setMethod("ars")}
                >
                  ARS
                </button>
                <button
                  type="button"
                  className={`tab ${method === "usd" ? "tab-active" : ""}`}
                  onClick={() => setMethod("usd")}
                >
                  Internacional USD
                </button>
                <button
                  type="button"
                  className={`tab ${method === "crypto" ? "tab-active" : ""}`}
                  onClick={() => setMethod("crypto")}
                >
                  Cripto
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300">
                <span className="font-semibold text-zinc-100">Seleccionado:</span>{" "}
                {methodLabel(method)}
              </div>
            </div>

            {/* Form */}
            <div className="card p-6">
              <h3 className="text-lg font-bold">Tus datos</h3>
              <p className="mt-1 text-sm text-zinc-400">Usá un email real: se valida para ver la orden luego.</p>

              <div className="mt-5 grid gap-4">
                <Field
                  id="name"
                  label="Tu nombre"
                  value={name}
                  onChange={setName}
                  placeholder="Ej: Luciano"
                  error={errors.name}
                  autoComplete="name"
                />

                <Field
                  id="email"
                  label="Tu email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Ej: tu@email.com"
                  error={errors.email}
                  autoComplete="email"
                />

                <Field
                  id="ref"
                  label="Referencia (opcional)"
                  value={customerRef}
                  onChange={setCustomerRef}
                  placeholder="DNI / IG / etc"
                />

                <div className="mt-2 grid gap-3">
                  <CheckRow
                    checked={confirmAdult}
                    onChange={setConfirmAdult}
                    label="Confirmo que soy hombre +18."
                    error={errors.confirmAdult}
                  />
                  <CheckRow
                    checked={confirmReqs}
                    onChange={setConfirmReqs}
                    label="Acepto los requisitos mínimos (constancia, sueño, registro de cargas)."
                    error={errors.confirmReqs}
                  />
                </div>
              </div>
            </div>

            {/* Extra */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold">Revisión técnica por video (extra)</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Servicio adicional con costo. Se suma al total de la orden.
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-100">{formatARS(EXTRA_VIDEO_PRICE_ARS)}</div>
                  <div className="text-xs text-zinc-500">ARS</div>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
                <span className="text-sm text-zinc-200">Agregar revisión por video</span>
                <input
                  type="checkbox"
                  checked={extraVideo}
                  onChange={(e) => setExtraVideo(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Right column: Summary */}
          <div className="lg:sticky lg:top-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold">Resumen</h3>

              {!selectedPlan ? (
                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300">
                  Elegí un plan para ver el resumen.
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-zinc-400">Plan</div>
                      <div className="text-base font-bold">{selectedPlan.name}</div>
                      <div className="text-sm text-zinc-400">
                        {cadenceLabel(selectedPlan.cadence)} • {selectedPlan.days} días
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Total</div>
                      <div className="text-2xl font-extrabold text-emerald-300">
                        {formatARS(totalARS)}
                      </div>
                      <div className="text-xs text-zinc-500">ARS</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="text-sm font-semibold text-zinc-100">Incluye</div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-200">
                      {(includes.length ? includes : ["Rutina personalizada", "Seguimiento y soporte"]).map((x, i) => (
                        <li key={i} className="flex gap-2">
                          <Dot /> <span className="leading-relaxed">{x}</span>
                        </li>
                      ))}
                    </ul>

                    {extraVideo ? (
                      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                        + Extra: Revisión técnica por video ({formatARS(EXTRA_VIDEO_PRICE_ARS)})
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    {submitError ? (
                      <div className="mb-3 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200" role="alert">
                        {submitError}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="btn btn-primary w-full"
                      onClick={onSubmit}
                      disabled={!canSubmit}
                    >
                      {submitLoading ? "Generando orden…" : "Generar orden"}
                    </button>

                    <p className="mt-3 text-xs text-zinc-500">
                      Luego verás instrucciones de pago y podrás subir el comprobante.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div id="faq" className="mt-6 card p-6">
              <h4 className="text-sm font-bold">Cómo funciona</h4>
              <ol className="mt-3 space-y-2 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <span className="text-emerald-300 font-bold">1.</span> Elegís plan + método de pago.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300 font-bold">2.</span> Generás la orden (te da un ID).
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300 font-bold">3.</span> Pagás y subís comprobante.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300 font-bold">4.</span> En admin se aprueba/rechaza.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900/80 py-10">
        <div className="container-pad flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-400">
            © {new Date().getFullYear()} Tujaque Strength
          </div>
          <div className="text-xs text-zinc-500">
            Hecho para rendimiento alto en móvil. Sin imágenes pesadas.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- UI bits ---------- */

function Dot() {
  return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400/80" />;
}

function Stat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="text-sm font-bold text-zinc-100">{title}</div>
      <div className="mt-1 text-xs text-zinc-400">{desc}</div>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-800/70" />
      <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-zinc-800/50" />
      <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-zinc-800/60" />
    </div>
  );
}

function PlanCard({
  plan,
  active,
  onClick,
}: {
  plan: Plan;
  active: boolean;
  onClick: () => void;
}) {
  const inc = Array.isArray(plan?.benefits?.includes) ? plan.benefits!.includes! : [];
  const bullets = inc.slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left rounded-2xl border p-5 transition",
        "focus:outline-none focus:ring-4 focus:ring-emerald-500/15",
        active
          ? "border-emerald-400/60 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/45",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-bold">{plan.name}</div>
          <div className="mt-1 text-sm text-zinc-400">
            {cadenceLabel(plan.cadence)} • {plan.days} días
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold">{formatARS(plan.price_ars)}</div>
          <div className="text-xs text-zinc-500">ARS</div>
        </div>
      </div>

      {bullets.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-zinc-200">
          {bullets.map((x, i) => (
            <li key={i} className="flex gap-2">
              <Dot />
              <span className="leading-relaxed">{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 text-sm text-zinc-400">Incluye beneficios (desde tu DB).</div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={active ? "text-emerald-300 font-semibold" : "text-zinc-500"}>
          {active ? "Seleccionado ✓" : "Seleccionar"}
        </span>
      </div>
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}) {
  const errId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-zinc-200">
        {label}
      </label>
      <input
        id={id}
        className={`input mt-2 ${error ? "border-red-900/60 focus:border-red-400 focus:ring-red-500/15" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={errId}
      />
      {error ? (
        <p id={errId} className="mt-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 accent-emerald-500"
        />
        <span className="text-sm text-zinc-200">{label}</span>
      </label>
      {error ? <div className="mt-2 text-xs text-red-200">{error}</div> : null}
    </div>
  );
}