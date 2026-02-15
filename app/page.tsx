"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CheckoutClient from "@/app/components/CheckoutClient";

type Cadence = "weekly" | "monthly";

type Plan = {
  id: string;
  code: string;
  name: string;
  days: number;
  cadence: Cadence;
  price_ars: number;
  benefits?: {
    includes?: string[];
  };
};

const COPY_BY_PLAN: Record<string, { title: string; description: string }> = {
  "weekly-3": {
    title: "3 Días — Fuerza Base",
    description: "Ideal para probar el sistema.",
  },
  "weekly-5": {
    title: "5 Días — Powerbuilding",
    description: "Volumen alto, pago flexible.",
  },
  "monthly-3": {
    title: "3 Días — Fuerza Híbrida Pro",
    description: "Ciclo de mesociclo completo.",
  },
  "monthly-5": {
    title: "5 Días — Elite Powerbuilding",
    description: "La experiencia total (Peaking + Hipertrofia).",
  },
};

const FALLBACK_PRICES: Record<string, number> = {
  "weekly-3": 18000,
  "weekly-5": 32000,
  "monthly-3": 50000,
  "monthly-5": 100000,
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function HomePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cadence, setCadence] = useState<Cadence>("weekly");
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [extraVideo, setExtraVideo] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const checkoutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/plans", { cache: "no-store" });
        const json = await res.json();
        const fetchedPlans = (Array.isArray(json.plans) ? json.plans : []) as Plan[];
        setPlans(fetchedPlans);

        const firstWeeklyPlan = fetchedPlans.find((p) => p.cadence === "weekly" && p.days === 3);
        if (firstWeeklyPlan) setSelectedPlanCode(firstWeeklyPlan.code);
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  const plansByCadence = useMemo(
    () => plans.filter((p) => p.cadence === cadence).sort((a, b) => a.days - b.days),
    [plans, cadence]
  );

  useEffect(() => {
    const stillVisible = plansByCadence.some((p) => p.code === selectedPlanCode);
    if (!stillVisible && plansByCadence[0]) {
      setSelectedPlanCode(plansByCadence[0].code);
    }
  }, [plansByCadence, selectedPlanCode]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode) ?? null,
    [plans, selectedPlanCode]
  );

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanCode(plan.code);
    checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div className="aurora-bg" />
      <div className="tech-grid pointer-events-none fixed inset-0 -z-10 opacity-30" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Tujaque Strength</p>
            <p className="text-sm text-zinc-400">Programación de fuerza para hombres +18</p>
          </div>
          <a href="#precios" className="btn-primary px-4 py-2 text-sm">
            Ver Planes
          </a>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-24" aria-labelledby="hero-title">
        <article className="glass-card space-y-6 p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Sistema Tujaque Strength</p>
          <h1 id="hero-title" className="text-4xl font-black leading-tight md:text-6xl">
            Forjando Fuerza Real.
          </h1>
          <p className="max-w-3xl text-lg text-zinc-300 md:text-xl">
            Programación de fuerza y estética para hombres +18. Sin humo, solo hierro.
          </p>
          <a href="#precios" className="btn-premium inline-flex">
            Ver Planes
          </a>
        </article>
      </section>

      <section id="matriz" className="mx-auto w-full max-w-6xl px-6 py-16" aria-labelledby="matriz-title">
        <header className="mb-10 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Diferenciación Técnica</p>
          <h2 id="matriz-title" className="text-3xl font-black md:text-4xl">
            La Matriz de Entrenamiento
          </h2>
          <p className="max-w-3xl text-zinc-300">
            Antes de hablar de precios, elegí tu camino según tu objetivo y tu disponibilidad real.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="glass-card p-6">
            <h3 className="text-2xl font-bold">Camino A (3 Días - Eficiencia)</h3>
            <p className="mt-4 text-zinc-300">
              Fuerza Base con intensidad alta. Ideal si tenés poco tiempo, pero querés mover muchos kilos en los
              básicos: Squat, Bench y Deadlift.
            </p>
          </article>

          <article className="glass-card p-6">
            <h3 className="text-2xl font-bold">Camino B (5 Días - Estética/Volumen)</h3>
            <p className="mt-4 text-zinc-300">
              Powerbuilding real. Más días de entrenamiento significa más accesorios, más bombeo y foco fuerte en
              hipertrofia y corrección de puntos débiles.
            </p>
          </article>
        </div>
      </section>

      <section id="precios" className="mx-auto w-full max-w-6xl px-6 py-16" aria-labelledby="precios-title">
        <header className="mb-10 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">El Core del Negocio</p>
          <h2 id="precios-title" className="text-3xl font-black md:text-4xl">
            Elegí tu inversión
          </h2>
          <p className="max-w-3xl text-zinc-300">Alterná entre modalidad semanal o mensual y activá tu plan hoy.</p>
        </header>

        <div className="glass-card p-6">
          <div className="mx-auto mb-8 grid w-full max-w-sm grid-cols-2 rounded-xl border border-white/10 bg-zinc-900/70 p-1">
            <button
              type="button"
              onClick={() => setCadence("weekly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                cadence === "weekly" ? "bg-emerald-500 text-zinc-950" : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setCadence("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                cadence === "monthly" ? "bg-emerald-500 text-zinc-950" : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              Mensual
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {plansByCadence.map((plan) => {
              const key = `${plan.cadence}-${plan.days}`;
              const copy = COPY_BY_PLAN[key];
              const price = plan.price_ars || FALLBACK_PRICES[key] || 0;
              const isActive = selectedPlanCode === plan.code;

              return (
                <article
                  key={plan.code}
                  className={`rounded-xl border p-6 transition ${
                    isActive
                      ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                      : "border-white/10 bg-zinc-900/50 hover:border-emerald-400/40"
                  }`}
                >
                  <h3 className="text-xl font-bold">{copy?.title ?? plan.name}</h3>
                  <p className="mt-2 text-3xl font-black text-emerald-400">{formatARS(price)}</p>
                  <p className="mt-3 text-zinc-300">{copy?.description ?? "Programación inteligente para progresar."}</p>
                  <button type="button" onClick={() => handleSelectPlan(plan)} className="btn-secondary mt-5 w-full">
                    Elegir este plan
                  </button>
                </article>
              );
            })}
          </div>

          {loadingPlans && <p className="mt-6 text-sm text-zinc-400">Cargando planes reales desde la API...</p>}

          <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/60 p-5">
            <label htmlFor="extra-tecnica" className="flex cursor-pointer items-start gap-3">
              <input
                id="extra-tecnica"
                type="checkbox"
                checked={extraVideo}
                onChange={(e) => setExtraVideo(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500"
              />
              <span>
                <span className="block text-sm font-semibold text-zinc-100">Revisión de Técnica por Video (+$5.000)</span>
                <span className="block text-sm text-zinc-400">Servicio opcional para análisis técnico de tus levantamientos.</span>
              </span>
            </label>
          </div>

          <div ref={checkoutRef} className="mt-8">
            <CheckoutClient
              selectedPlan={selectedPlan}
              hidePlanSelector
              initialExtraVideo={extraVideo}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16" aria-labelledby="coach-title">
        <article className="glass-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Autoridad</p>
          <h2 id="coach-title" className="mt-3 text-3xl font-black md:text-4xl">
            Luciano (Tujaque Strength)
          </h2>
          <p className="mt-4 max-w-4xl text-zinc-300">
            Entrenador especializado en fuerza. Mi objetivo no es entretenerte, es hacerte fuerte. No hago coaching 1
            a 1 de niñera; te doy las herramientas profesionales para que entrenes como un atleta.
          </p>
        </article>
      </section>

      <footer className="border-t border-white/10 bg-zinc-950/80">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
          <section>
            <h2 className="text-lg font-bold">Footer & Contacto</h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-zinc-300">
              <Link href="/legal/terms" className="hover:text-emerald-300">
                Términos y Condiciones
              </Link>
              <Link href="/legal/privacy" className="hover:text-emerald-300">
                Política de Privacidad
              </Link>
            </nav>
          </section>

          <section>
            <h2 className="text-lg font-bold">Contacto</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>WhatsApp: +54 9 XXX XXX XXXX</li>
              <li>Email: contacto@tujaquestrength.com</li>
              <li>Instagram: @tujaquestrength</li>
            </ul>
          </section>
        </div>
      </footer>
    </main>
  );
}
