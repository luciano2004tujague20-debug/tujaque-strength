import { ClipboardList, CreditCard, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepData {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: StepData[] = [
  {
    number: "01",
    title: "Elegis tu Plan",
    description:
      "Seleccionas entre planes semanales o mensuales segun tu objetivo y disponibilidad de entrenamiento.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Realizas el Pago",
    description:
      "Transferencia, Mercado Pago o Cripto. Subis el comprobante y validamos tu orden en minutos.",
    icon: CreditCard,
  },
  {
    number: "03",
    title: "Recibis tu Programa",
    description:
      "Dentro de 48hs tenes tu rutina personalizada y comenzas a entrenar con seguimiento segun tu plan.",
    icon: Rocket,
  },
];

function Step({ step }: { step: StepData }) {
  const Icon = step.icon;

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Number watermark */}
      <div className="text-[5rem] font-black font-display text-emerald-500/[0.07] leading-none select-none pointer-events-none absolute -top-4">
        {step.number}
      </div>

      {/* Icon */}
      <div className="relative z-10 mb-6 flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <Icon className="h-6 w-6 text-emerald-400" />
      </div>

      <h4 className="text-lg font-bold text-foreground mb-2 font-display">
        {step.title}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
        {step.description}
      </p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 md:py-28 px-6 bg-zinc-950/60">
      <div className="container-pad max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title mb-3 font-display">COMO FUNCIONA</h2>
          <p className="section-subtitle mx-auto">
            Proceso simple y directo. De la orden al entrenamiento en menos de 48
            horas.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step) => (
            <Step key={step.number} step={step} />
          ))}
        </div>

        {/* Connector line (desktop only) */}
        <div className="hidden md:block relative -mt-[11.5rem] mx-auto max-w-lg">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
