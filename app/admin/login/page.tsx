"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Limpiamos errores previos

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Redirección directa al panel de control principal del Admin
        // Forzamos la creación de la cookie y recargamos para asegurar el acceso
        document.cookie = "ts_admin_session=true; path=/; max-age=604800; samesite=lax";
        window.location.href = "/admin/athletes";
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Contraseña incorrecta. Acceso denegado.");
        setPassword(""); // Limpiamos el input para intentar de nuevo
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Fondo Cyberpunk Sutil */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm bg-zinc-900/80 border border-white/10 p-10 rounded-[2rem] backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic text-white tracking-tighter">
            ADMIN <span className="text-emerald-500">ACCESS</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2">
            Sistema de Control Elite
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Credencial de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700/50 rounded-xl px-4 py-4 text-white text-center font-bold tracking-[0.3em] outline-none focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all placeholder:tracking-normal placeholder:text-zinc-700"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {/* Mensaje de Error Visual */}
          {errorMsg && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              ⚠️ {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? "VERIFICANDO..." : "DESBLOQUEAR"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-[9px] text-zinc-600 font-mono tracking-widest">
            ID: TUJAGUE-SECURE-V2
          </p>
        </div>
      </div>
    </div>
  );
}