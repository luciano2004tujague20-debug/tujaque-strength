"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Plan = {
  code: string;
  name: string;
  days: number;
  cadence: "weekly" | "monthly" | string;
  price_ars?: number;
};

type Receipt = {
  id: string;
  order_id: string;
  email: string | null;
  reference: string | null;
  file_path: string | null;
  file_url?: string | null;
  created_at?: string | null;
};

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_ref?: string | null;
  payment_method: "ars" | "usd" | "crypto" | string;
  amount_ars: number;
  status: "awaiting_payment" | "paid" | "rejected" | string;
  created_at?: string | null;

  // 👇 Estos son los que te interesan:
  extra_video?: boolean | null;
  extra_video_price_ars?: number | null;

  plans?: Plan | null;
};

function formatARS(n: number) {
  try {
    return new Intl.NumberFormat("es-AR").format(n);
  } catch {
    return String(n);
  }
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status === "rejected"
        ? "bg-red-500/15 text-red-300 border-red-500/30"
        : "bg-amber-500/15 text-amber-300 border-amber-500/30";

  const label =
    status === "paid" ? "Pagada" : status === "rejected" ? "Rechazada" : "Pendiente";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${cls}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export default function AdminOrderDetailPage({ params }: { params: { orderId: string } }) {
  const orderId = params.orderId;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [actionLoading, setActionLoading] = useState<"paid" | "rejected" | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);

      setOrder(data?.order ?? null);
      setReceipts(Array.isArray(data?.receipts) ? data.receipts : []);
    } catch (e: any) {
      setErr(e?.message || "Error cargando la orden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ✅ Calculamos “extra video” aunque el backend no lo mande (fallback)
  const extra = useMemo(() => {
    if (!order) return { has: false, price: 0 };

    const explicitHas = order.extra_video === true || (order.extra_video_price_ars ?? 0) > 0;
    const planPrice = order.plans?.price_ars ?? 0;

    const inferredHas = !explicitHas && planPrice > 0 && order.amount_ars > planPrice;
    const has = explicitHas || inferredHas;

    const price =
      (order.extra_video_price_ars ?? 0) > 0
        ? (order.extra_video_price_ars as number)
        : has && planPrice > 0
          ? Math.max(0, order.amount_ars - planPrice)
          : 0;

    return { has, price };
  }, [order]);

  async function setStatus(nextStatus: "paid" | "rejected") {
    if (!order) return;

    setActionLoading(nextStatus);
    setErr(null);

    try {
      // OJO: este endpoint es el más común.
      // Si en tu proyecto se llama distinto, cambiás SOLO esta URL.
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);

      await load();
    } catch (e: any) {
      setErr(e?.message || "No se pudo actualizar el estado");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Link href="/admin/orders" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Volver a órdenes
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-100">Orden</h1>
          <div className="text-sm text-emerald-300">{orderId}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatus("paid")}
            disabled={actionLoading !== null}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {actionLoading === "paid" ? "Aprobando..." : "Aprobar"}
          </button>
          <button
            onClick={() => setStatus("rejected")}
            disabled={actionLoading !== null}
            className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200 ring-1 ring-red-500/30 hover:bg-red-500/20 disabled:opacity-50"
          >
            {actionLoading === "rejected" ? "Rechazando..." : "Rechazar"}
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-300">
          Cargando...
        </div>
      ) : !order ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-300">
          No se encontró la orden.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-zinc-400">Estado</div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Cliente</span>
                  <span className="text-zinc-100">{order.customer_name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Email</span>
                  <span className="text-zinc-100">{order.customer_email}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Referencia</span>
                  <span className="text-zinc-100">{order.customer_ref || "-"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Método</span>
                  <span className="text-zinc-100">{order.payment_method}</span>
                </div>

                <div className="mt-2 rounded-xl border border-zinc-800 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Total</span>
                    <span className="text-lg font-semibold text-emerald-300">
                      $ {formatARS(order.amount_ars)}
                    </span>
                  </div>

                  {/* ✅ ACÁ ESTÁ LO QUE PEDÍS */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Revisión técnica por video</span>
                    {extra.has ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                        Sí {extra.price > 0 ? `(+ $ ${formatARS(extra.price)})` : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/40 px-3 py-1 text-zinc-200">
                        No
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-3 text-sm text-zinc-400">Plan</div>
              <div className="text-lg font-semibold text-zinc-100">{order.plans?.name ?? "-"}</div>
              <div className="mt-2 text-sm text-zinc-300">
                {order.plans?.cadence === "weekly" ? "Semanal" : "Mensual"} • {order.plans?.days ?? "-"}{" "}
                días
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-black/20 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Precio plan</span>
                  <span className="text-zinc-100">
                    {order.plans?.price_ars ? `$ ${formatARS(order.plans.price_ars)}` : "-"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span className="text-zinc-400">Extra video</span>
                  <span className="text-zinc-100">{extra.has ? `$ ${formatARS(extra.price)}` : "-"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="mb-3 text-lg font-semibold text-zinc-100">Comprobantes</div>

            {receipts.length === 0 ? (
              <div className="text-sm text-zinc-400">No hay comprobantes.</div>
            ) : (
              <div className="space-y-3">
                {receipts.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="text-sm">
                      <div className="text-zinc-100">
                        {r.reference ? `Ref: ${r.reference}` : "Sin referencia"}
                      </div>
                      <div className="text-zinc-400">{r.created_at ? r.created_at : ""}</div>
                    </div>

                    {(r.file_url || r.file_path) && (
                      <a
                        className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
                        href={(r.file_url || "") as string}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver archivo
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
