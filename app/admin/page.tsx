"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { }

      if (!res.ok) throw new Error(json?.error || "Contraseña incorrecta");
      
      router.push("/admin/orders");
    } catch (e: any) {
      setErr(e?.message || "Error al ingresar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[2.5rem] border border-zinc-800 bg-zinc-900/30 p-10 shadow-2xl text-center">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
          Tujague <span className="text-emerald-500">Strength</span>
        </h2>
        
        <div className="mt-8 space-y-6">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            Acceso Admin
          </p>

          <input
            type="password"
            className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-center text-white text-sm focus:border-emerald-500 outline-none transition-all font-medium"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />

          {err && (
            <p className="text-red-500 text-xs font-bold uppercase italic">{err}</p>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] uppercase tracking-widest text-xs"
          >
            {loading ? "Entrando..." : "Ingresar al Panel"}
          </button>
        </div>
      </div>
    </main>
  );
}