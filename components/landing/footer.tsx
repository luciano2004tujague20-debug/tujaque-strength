import Link from "next/link";
import { Dumbbell } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="container-pad">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-black text-sm font-display text-foreground">
                TUJAQUE STRENGTH
              </div>
              <div className="text-xs text-muted-foreground">
                Coaching Profesional de Fuerza
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/legal/terms"
              className="hover:text-emerald-400 transition-colors"
            >
              Terminos y Condiciones
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-emerald-400 transition-colors"
            >
              Privacidad
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
          <p>2026 Tujaque Strength. Buenos Aires, Argentina.</p>
          <p className="mt-2">
            Servicio exclusivo para hombres mayores de 18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
}
