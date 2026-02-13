"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "all" | "awaiting_payment" | "under_review" | "paid" | "rejected";

function badge(s: string) {
  if (s === "awaiting_payment") return "Pendiente";
  if (s === "under_review") return "En revisión";
  if (s === "paid") return "Aprobada ✅";
  if (s === "rejected") return "Rechazada ❌";
  return s;
}

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("under_review");
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${encodeURIComponent(status)}&q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.status === 401) return router.push("/admin");
      if (!res.ok) throw new Error(json?.error || "No se pudieron cargar órdenes");
      setOrders(json.orders || []);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Órdenes</h1>
            <p className="mt-1 text-sm text-zinc-400">Revisá comprobantes y aprobá/rechazá pagos.</p>
          </div>
          <button onClick={logout} className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900/50">
            Salir
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3"
          >
            <option value="under_review">En revisión</option>
            <option value="awaiting_payment">Pendiente</option>
            <option value="paid">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="all">Todas</option>
          </select>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por Order ID o Email"
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 md:col-span-2"
          />

          <button
            onClick={load}
            disabled={loading}
            className="md:col-span-3 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Cargando…" : "Buscar / Actualizar"}
          </button>
        </div>

        {err && <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{err}</div>}

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
          <div className="grid grid-cols-12 gap-2 bg-zinc-900/50 px-4 py-3 text-xs text-zinc-400">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Estado</div>
          </div>

          {orders.map((o) => (
            <button
              key={o.order_id}
              onClick={() => router.push(`/admin/orders/${encodeURIComponent(o.order_id)}`)}
              className="grid w-full grid-cols-12 gap-2 border-t border-zinc-800 px-4 py-3 text-left hover:bg-zinc-900/40"
            >
              <div className="col-span-3 font-mono text-sm text-emerald-200">{o.order_id}</div>
              <div className="col-span-3 text-sm text-zinc-200">{o.customer_email}</div>
              <div className="col-span-2 text-sm text-zinc-200">{o.plans?.name || "-"}</div>
              <div className="col-span-2 text-sm font-semibold text-zinc-100">{formatARS(o.amount_ars || 0)}</div>
              <div className="col-span-2 text-sm text-zinc-200">{badge(o.status)}</div>
            </button>
          ))}

          {orders.length === 0 && (
            <div className="border-t border-zinc-800 px-4 py-6 text-sm text-zinc-400">No hay órdenes.</div>
          )}
        </div>
      </div>
    </main>
  );
}
