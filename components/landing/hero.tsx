import { ChevronDown, Zap, Users } from "lucide-react";

export function Hero() {
  return (
    <header className="relative pt-28 md:pt-40 pb-20 px-6 overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/8 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-pad relative">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              Sistema de Entrenamiento Profesional
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.9] font-display text-balance text-foreground">
            FUERZA QUE{" "}
            <span className="gradient-text">SE MIDE</span>
            <br />
            EN KILOS
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            Programacion de Powerlifting para hombres que entrenan en serio.
            Sentadilla, Banca y Peso Muerto con progresion real.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#planes-semanales" className="btn-premium animate-glow">
              Ver Planes
            </a>
            <a href="#como-funciona" className="btn-ghost">
              <span className="flex items-center gap-2 justify-center">
                Como Funciona
                <ChevronDown className="h-4 w-4" />
              </span>
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="status-indicator status-indicator-green" />
              <span>Sistema Activo</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500/60" />
              <span>+100 atletas</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
