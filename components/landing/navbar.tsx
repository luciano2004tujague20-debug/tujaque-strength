import Link from "next/link";
import { Dumbbell } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border">
      <div className="container-pad flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 transition-shadow group-hover:shadow-emerald-900/50">
            <Dumbbell className="h-5 w-5 text-zinc-950" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight font-display text-foreground">
              TUJAQUE STRENGTH
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Elite Coaching
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="#planes-semanales"
            className="hidden md:block text-xs font-semibold text-muted-foreground hover:text-emerald-400 transition-colors uppercase tracking-wider"
          >
            Planes
          </a>
          <a
            href="#como-funciona"
            className="hidden md:block text-xs font-semibold text-muted-foreground hover:text-emerald-400 transition-colors uppercase tracking-wider"
          >
            Proceso
          </a>
          <Link
            href="/admin/login"
            className="text-xs text-zinc-600 hover:text-emerald-400 transition-colors"
          >
            Staff
          </Link>
        </div>
      </div>
    </nav>
  );
}
