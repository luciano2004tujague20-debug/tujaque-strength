import Link from "next/link";
import { Check, Crown, Star } from "lucide-react";

export type Plan = {
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

export function PlanCard({ plan }: { plan: Plan }) {
  const isPopular = plan.benefits?.highlight === "popular";
  const isElite = plan.benefits?.highlight === "elite";
  const includes = plan.benefits?.includes || [];

  const cardClass = isElite
    ? "glass-card-elite"
    : isPopular
      ? "glass-card-elevated"
      : "glass-card glow-ring";

  return (
    <div className={`relative group p-6 md:p-8 ${cardClass} transition-transform duration-500 hover:-translate-y-1`}>
      {/* Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/30">
            <Star className="h-3 w-3" />
            Mas Elegido
          </div>
        </div>
      )}
      {isElite && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-lg"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
          >
            <Crown className="h-3 w-3" />
            Elite
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-black font-display text-foreground mb-1">
            {plan.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {plan.days} dias por semana
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-400 font-display">
            ${(plan.price_ars / 1000).toFixed(0)}K
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            ARS
          </div>
        </div>
      </div>

      {/* Ideal for */}
      {plan.benefits?.ideal_for && (
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {plan.benefits.ideal_for}
        </p>
      )}

      {/* Benefits list */}
      <ul className="space-y-3 mb-8">
        {includes.slice(0, 4).map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
            <div className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="h-3 w-3 text-emerald-400" />
            </div>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/checkout?plan=${plan.code}`}
        className={`block w-full text-center ${
          isElite
            ? "btn-premium"
            : isPopular
              ? "btn-primary"
              : "btn-secondary"
        }`}
      >
        ELEGIR PLAN
      </Link>
    </div>
  );
}
