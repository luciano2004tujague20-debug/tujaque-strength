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
  const [showPassword, setShowPassword] = useState(false); // 🆕 EL OJITO

  // ESTADOS PARA ERRORES Y RECUPERACIÓN DE CLAVE
  const [errorMsg, setErrorMsg] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg("Credenciales incorrectas. Verificá tu email y contraseña.");
        return;
      }

      if (email === "luciano2004tujague20@gmail.com") {
        document.cookie =
          "ts_admin_session=true; path=/; max-age=604800; samesite=lax";
        window.location.href = "/admin/athletes";
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN PARA RECUPERAR CONTRASEÑA
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
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-white">
      
      {/* 🔥 BOTÓN PARA VOLVER A LA WEB PRINCIPAL 🔥 */}
      <div className="absolute top-6 left-4 md:left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
        >
          <span className="text-sm">🏠</span> Volver al Inicio
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500 mt-12">
        <div className="bg-white border border-gray-200 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
          <header className="text-center mb-10">
            <div className="w-16 h-16 bg-black border border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="text-white text-3xl font-black italic">
                T
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black italic tracking-tighter leading-none">
              TUJAGUE
              <br />
              <span className="text-gray-400">
                STRENGTH
              </span>
            </h1>
            <p className="text-[9px] font-black text-amber-500 tracking-[0.4em] uppercase mt-4 bg-amber-50 py-1.5 px-3 rounded-md inline-block border border-amber-100">
              Terminal de Acceso
            </p>
          </header>

          {/* 🆕 MENSAJES DE ERROR O ÉXITO NATIVOS */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in shake">
              <span className="text-red-500 text-lg leading-none mt-0.5">⚠️</span>
              <p className="text-xs font-bold text-red-600">{errorMsg}</p>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-in fade-in">
              <span className="text-emerald-500 text-lg leading-none mt-0.5">✓</span>
              <p className="text-xs font-bold text-emerald-700">
                Te enviamos un enlace de recuperación. Revisá tu bandeja de entrada (y el correo no deseado).
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Email del Atleta
              </label>
              <input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="atleta@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm text-black font-bold outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-gray-400 shadow-inner"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Contraseña
                </label>
                {/* 🆕 ENLACE DE RECUPERACIÓN */}
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResetting}
                  className="text-[10px] font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                >
                  {isResetting ? "Enviando..." : "¿Olvidaste tu clave?"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 pr-12 text-sm text-black font-bold outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-gray-400 tracking-widest shadow-inner"
                  required
                />
                {/* BOTÓN DEL OJITO */}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-black text-xs py-5 rounded-2xl tracking-[0.2em] uppercase hover:bg-gray-900 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>AUTENTICANDO...</span>
                </>
              ) : (
                "ACCEDER AL PANEL ➔"
              )}
            </button>
          </form>

          <footer className="mt-8 text-center pt-6 space-y-6">
            {/* 🆕 ENLACE PARA APLICAR (VENTAS) */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-3">
                ¿Aún no tenés tu estructura base?
              </p>
              <Link
                href="/"
                className="text-[10px] font-black text-black uppercase tracking-widest hover:text-amber-600 transition-colors flex items-center justify-center gap-1 bg-white border border-gray-200 py-3 rounded-xl shadow-sm active:scale-95"
              >
                Aplicar a la Mentoría <span className="text-amber-500">→</span>
              </Link>
            </div>

            <p className="text-[8px] font-black text-gray-400 tracking-[0.3em] uppercase">
              Sistemas de Entrenamiento BII-Vintage
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}