"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomLogin() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🆕 ESTADOS PARA ERRORES Y RECUPERACIÓN DE CLAVE
  const [errorMsg, setErrorMsg] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const router = useRouter();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg("");

  try {
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const sessionCheck = await supabase.auth.getSession();

    alert(
      JSON.stringify(
        {
          signInError: signInResult.error?.message ?? null,
          hasSessionAfterLogin: !!sessionCheck.data.session,
          sessionUserId: sessionCheck.data.session?.user?.id ?? null,
          sessionEmail: sessionCheck.data.session?.user?.email ?? null,
        },
        null,
        2
      )
    );

    if (signInResult.error) {
      setErrorMsg("Credenciales incorrectas. Verificá tu email y contraseña.");
      return;
    }

    // 👇 SOLO PARA TEST: no redirigir todavía
    return;
  } finally {
    setLoading(false);
  }
};

  // 🆕 FUNCIÓN PARA RECUPERAR CONTRASEÑA
  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg(
        "Escribí tu email en el casillero de arriba para recuperar la clave."
      );
      return;
    }

    setIsResetting(true);
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg(
        "Error al enviar el correo. Verificá que esté bien escrito."
      );
    } else {
      setResetSent(true);
    }
    setIsResetting(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      {/* ─── FONDO ÉPICO ─── */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 🔥 BOTÓN PARA VOLVER A LA WEB PRINCIPAL 🔥 */}
      <div className="absolute top-6 left-4 md:left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg backdrop-blur-md"
        >
          <span className="text-sm">🏠</span> Volver al Inicio
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl">
          <header className="text-center mb-10">
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-emerald-500 text-2xl font-black italic">
                T
              </span>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none">
              TUJAGUE
              <br />
              <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                STRENGTH
              </span>
            </h1>
            <p className="text-[9px] font-black text-zinc-500 tracking-[0.4em] uppercase mt-4">
              Protocolo de Acceso Elite
            </p>
          </header>

          {/* 🆕 MENSAJES DE ERROR O ÉXITO */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <span className="text-red-500 text-lg leading-none mt-0.5">
                ⚠️
              </span>
              <p className="text-xs font-bold text-red-200/80">{errorMsg}</p>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
              <span className="text-emerald-500 text-lg leading-none mt-0.5">
                ✓
              </span>
              <p className="text-xs font-bold text-emerald-200/80">
                Te enviamos un enlace de recuperación. Revisá tu bandeja de
                entrada (y el correo no deseado).
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Email del Atleta
              </label>
              <input
                type="email"
                placeholder="atleta@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-medium outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Contraseña
                </label>
                {/* 🆕 ENLACE DE RECUPERACIÓN */}
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResetting}
                  className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                >
                  {isResetting ? "Enviando..." : "¿Olvidaste tu clave?"}
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-medium outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-all placeholder:text-zinc-700 tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-black text-xs py-5 rounded-2xl tracking-[0.2em] uppercase hover:bg-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>INICIANDO...</span>
                </>
              ) : (
                "INICIAR SESIÓN 🦍"
              )}
            </button>
          </form>

          <footer className="mt-10 text-center border-t border-zinc-800 pt-8 space-y-6">
            {/* 🆕 ENLACE PARA APLICAR (VENTAS) */}
            <div className="bg-black/30 p-4 rounded-xl border border-zinc-800/50">
              <p className="text-xs text-zinc-400 font-medium mb-2">
                ¿Aún no sos parte del equipo?
              </p>
              <Link
                href="/"
                className="text-[10px] font-black text-white uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center justify-center gap-1"
              >
                Aplicar al Protocolo{" "}
                <span className="text-emerald-500">→</span>
              </Link>
            </div>

            <p className="text-[8px] font-black text-zinc-600 tracking-[0.3em] uppercase">
              Sistemas de Entrenamiento BII-Vintage
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}