"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      router.refresh();
      router.push("/admin/orders");
    } catch (err: any) {
      setError("ACCESO DENEGADO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden rainmeter-bg">
      <div className="energy-flow absolute inset-0" />

      <div className="tech-grid absolute inset-0 opacity-10" />

      <div className="absolute top-10 left-10 flex items-center gap-2">
        <div className="status-indicator status-indicator-green" />
        <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">System Ready</span>
      </div>

      <div className="absolute top-10 right-10 text-xs text-zinc-600 font-mono">
        {new Date().toLocaleTimeString()}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-2xl shadow-emerald-900/30 animate-glow">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-2xl font-black mb-2 tracking-tight">TUJAQUE STRENGTH</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 uppercase tracking-widest">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Admin Control Panel</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 block mb-2">
                Email de Acceso
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="admin@tujaque.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 block mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                <div className="relative p-4 border border-red-500/30 rounded-xl bg-red-950/30 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full relative"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-2xl">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <span className={loading ? "opacity-0" : ""}>
                {loading ? "VALIDANDO..." : "INICIAR SESIÓN"}
              </span>
            </button>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-center text-zinc-600 font-mono">
                Secured Connection • 256-bit Encryption
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-zinc-600 hover:text-emerald-400 transition-colors">
            Volver al sitio principal
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-zinc-700 font-mono">
        Tujaque Strength v2.0 • Admin Portal
      </div>
    </div>
  );
}
