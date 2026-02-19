"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // ✅ EL GOLPE MAESTRO: Forzamos la creación de la cookie en el cliente
        document.cookie = "ts_admin_session=true; path=/; max-age=604800; samesite=lax";
        
        // 🚨 Redirección forzada sin caché
        window.location.href = `/admin/orders?t=${Date.now()}`;
      } else {
        alert("❌ ACCESO DENEGADO: Contraseña incorrecta");
        setLoading(false);
      }
    } catch (error) {
      alert("❌ Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm bg-zinc-900/80 border border-white/10 p-10 rounded-[2rem] backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic text-white tracking-tighter">
            ADMIN <span className="text-emerald-500">ACCESS</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2">Sistema de Control Elite</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Credencial de Acceso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-white text-center font-bold tracking-widest outline-none focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
              placeholder="••••••••••••"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando..." : "Desbloquear"}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[9px] text-zinc-600 font-mono">ID: TUJAQUE-SECURE-V1</p>
        </div>
      </div>
    </div>
  );
}