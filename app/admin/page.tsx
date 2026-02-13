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
try { json = JSON.parse(text); } catch { /* era HTML */ }

if (!res.ok) throw new Error(json?.error || text.slice(0, 120));
      router.push("/admin/orders");
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-2 text-sm text-zinc-400">Ingresá tu contraseña.</p>

        <input
          type="password"
          className="mt-5 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-emerald-500"
          placeholder="ADMIN_PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && (
          <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-red-200">
            {err}
          </div>
        )}

        <button
          onClick={login}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </main>
  );
}
