import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
    ideal_for?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let plans: Plan[] = [];

  if (supabaseAdmin) {
    const { data: allPlans } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("active", true)
      .order("price_ars", { ascending: true });

    plans = (allPlans as Plan[]) || [];
  }

  const weeklyPlans = plans.filter((p) => p.cadence === "weekly");
  const monthlyPlans = plans.filter((p) => p.cadence === "monthly");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 -z-10 tech-grid opacity-20" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="container-pad flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-emerald-900/30">
              TS
            </div>
            <div>
              <div className="text-sm font-black tracking-tight">TUJAQUE STRENGTH</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Elite Strength Coaching</div>
            </div>
          </div>
          <Link href="/admin/login" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
            Staff
          </Link>
        </div>
      </nav>

      <header className="relative pt-32 md:pt-40 pb-20 px-6">
        <div className="container-pad">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Sistema de Entrenamiento Profesional
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.95]">
              FUERZA QUE <span className="gradient-text">SE MIDE</span> EN KILOS
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Programación de Powerlifting para hombres que entrenan en serio. Sentadilla, Banca y Peso Muerto con progresión real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planes-semanales" className="btn-premium">
                Ver Planes
              </a>
              <a href="#como-funciona" className="btn-ghost">
                Cómo Funciona
              </a>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="status-indicator status-indicator-green" />
                <span>Sistema Activo</span>
              </div>
              <div>+100 atletas</div>
            </div>
          </div>
        </div>
      </header>

      <section id="planes-semanales" className="py-20 px-6">
        <div className="container-pad">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="section-title mb-3">PLANES SEMANALES</h2>
            <p className="section-subtitle mx-auto">
              Programación con ajustes cada 7 días. Ideal para comenzar o mantener progresión constante.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {weeklyPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section id="planes-mensuales" className="py-20 px-6 bg-zinc-950/50">
        <div className="container-pad">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="section-title mb-3">PLANES MENSUALES</h2>
            <p className="section-subtitle mx-auto">
              Periodización de 30 días con seguimiento intensivo. Para atletas que compiten o buscan máximo rendimiento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {monthlyPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section id="extra-video" className="py-20 px-6">
        <div className="container-pad max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-xl shadow-emerald-900/30">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-4">Revisión Técnica por Video</h3>
            <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
              Servicio extra opcional. Enviás tu video de Sentadilla, Banca o Peso Muerto y recibís un análisis detallado con correcciones específicas.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-bold">Costo adicional:</span>
              <span className="text-2xl font-black text-white">$15.000</span>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Podés agregar este servicio al momento de contratar cualquier plan.
            </p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 px-6 bg-zinc-950/50">
        <div className="container-pad max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">CÓMO FUNCIONA</h2>
            <p className="section-subtitle mx-auto">
              Proceso simple y directo. De la orden al entrenamiento en menos de 48 horas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="01"
              title="Elegís tu Plan"
              desc="Seleccionás entre planes semanales o mensuales según tu objetivo y disponibilidad de entrenamiento."
            />
            <Step
              number="02"
              title="Realizás el Pago"
              desc="Transferencia, Mercado Pago o Cripto. Subís el comprobante y validamos tu orden en minutos."
            />
            <Step
              number="03"
              title="Recibís tu Programa"
              desc="Dentro de 48hs tenés tu rutina personalizada y comenzás a entrenar con seguimiento según tu plan."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="container-pad">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="font-black text-lg mb-1">TUJAQUE STRENGTH</div>
              <div className="text-sm text-zinc-500">Coaching Profesional de Fuerza</div>
            </div>

            <div className="flex gap-6 text-sm text-zinc-400">
              <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">
                Privacidad
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
            <p>2026 Tujaque Strength. Buenos Aires, Argentina.</p>
            <p className="mt-2">Servicio exclusivo para hombres mayores de 18 años.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const isPopular = plan.benefits?.highlight === "popular";
  const isElite = plan.benefits?.highlight === "elite";
  const includes = plan.benefits?.includes || [];

  return (
    <div className={`relative group ${isElite ? "plan-card-elite" : isPopular ? "plan-card-popular" : "plan-card"}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-popular">
          Más Elegido
        </div>
      )}

      {isElite && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-elite">
          Elite
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
          <p className="text-sm text-zinc-400">{plan.days} días por semana</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-400">
            ${(plan.price_ars / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">ARS</div>
        </div>
      </div>

      {plan.benefits?.ideal_for && (
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          {plan.benefits.ideal_for}
        </p>
      )}

      <ul className="space-y-3 mb-8">
        {includes.slice(0, 4).map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/checkout?plan=${plan.code}`}
        className={isElite ? "btn-premium w-full text-center" : isPopular ? "btn-primary w-full" : "btn-secondary w-full text-center"}
      >
        ELEGIR PLAN
      </Link>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="relative">
      <div className="text-6xl font-black text-emerald-500/10 mb-4">{number}</div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
