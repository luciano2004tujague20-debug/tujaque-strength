"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentMethod = "ars" | "usd" | "crypto";

type OrderResponse = {
  order: {
    id: string;
    order_id: string;
    customer_name: string;
    customer_email: string;
    customer_ref?: string | null;
    payment_method: PaymentMethod;
    amount_ars: number;
    status: "awaiting_payment" | "under_review" | "paid" | "rejected";
    created_at: string;
    plans: {
      code: string;
      name: string;
      cadence: "weekly" | "monthly";
      days: number;
      price_ars: number;
      benefits: any;
    };
  };
};

type PaymentInfo = {
  ars: { alias?: string; cbu?: string; holder?: string };
  usd: {
    cbu?: string;
    alias?: string;
    bank?: string;
    ach?: {
      name?: string;
      routing?: string;
      account?: string;
      type?: string;
      bank?: string;
      address?: string;
    };
  };
  crypto: { btc?: string; usdt?: string; usdc?: string };
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function badge(status: string) {
  switch (status) {
    case "awaiting_payment":
      return "Pendiente de pago";
    case "under_review":
      return "Comprobante enviado (en revisión)";
    case "paid":
      return "Aprobado ✅";
    case "rejected":
      return "Rechazado ❌";
    default:
      return status;
  }
}

export default function OrderClient({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [order, setOrder] = useState<OrderResponse["order"] | null>(null);
  const [payInfo, setPayInfo] = useState<PaymentInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  useEffect(() => {
    const lastEmail = localStorage.getItem("ts_last_email") || "";
    if (lastEmail && !email) setEmail(lastEmail);
  }, [email]);

  useEffect(() => {
    // cargar info de pago una vez
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payment-info", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) return;
        if (!cancelled) setPayInfo(json);
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadOrder() {
    setLoadError(null);
    setUploadMsg(null);

    const e = email.trim().toLowerCase();
    if (!e) {
      setLoadError("Ingresá el email usado en la orden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}?email=${encodeURIComponent(e)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No pude cargar la orden");
      setOrder(json.order);
      localStorage.setItem("ts_last_email", e);
    } catch (err: any) {
      setOrder(null);
      setLoadError(err?.message || "Error cargando orden");
    } finally {
      setLoading(false);
    }
  }

  const methodLabel = useMemo(() => {
    if (!order) return "";
    if (order.payment_method === "ars") return "Transferencia ARS";
    if (order.payment_method === "usd") return "USD / Wire / ACH";
    return "Crypto";
  }, [order]);

  async function uploadReceipt() {
    setUploadMsg(null);
    setLoadError(null);

    if (!order) return setLoadError("Primero cargá la orden con tu email.");
    if (!email.trim()) return setLoadError("Falta email.");
    if (!file) return setLoadError("Elegí un archivo (PNG/JPG/WEBP/PDF).");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("email", email.trim().toLowerCase());
      fd.append("reference", reference.trim());
      fd.append("file", file);

      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/receipt`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No pude subir el comprobante");

      setUploadMsg("✅ Comprobante enviado. Estado: en revisión.");
      setFile(null);
      setReference("");
      await loadOrder();
    } catch (err: any) {
      setUploadMsg(null);
      setLoadError(err?.message || "Error subiendo comprobante");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-4xl px-6 py-12">
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Volver a planes
        </a>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h1 className="text-2xl font-bold">Tu orden</h1>
          <p className="mt-2 text-zinc-300">
            ID: <span className="font-mono font-semibold text-emerald-300">{orderId}</span>
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-300">Email (el mismo que usaste al crear la orden)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="test@mail.com"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={loadOrder}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {loading ? "Cargando…" : "Ver mi orden"}
              </button>
            </div>
          </div>

          {loadError && (
            <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">
              {loadError}
            </div>
          )}

          {order && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <p className="text-sm text-zinc-400">Plan</p>
                  <p className="mt-1 text-lg font-semibold">{order.plans?.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {order.plans?.cadence === "weekly" ? "Semanal" : "Mensual"} • {order.plans?.days} días
                  </p>
                  <p className="mt-3 text-sm text-zinc-400">Total</p>
                  <p className="mt-1 text-xl font-bold text-emerald-300">{formatARS(order.amount_ars)}</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <p className="text-sm text-zinc-400">Estado</p>
                  <p className="mt-1 text-lg font-semibold">{badge(order.status)}</p>
                  <p className="mt-3 text-sm text-zinc-400">Método</p>
                  <p className="mt-1 font-semibold">{methodLabel}</p>

                  <div className="mt-4 text-xs text-zinc-500">
                    Recordatorio: Solo hombres • Requisitos mínimos: constancia, sueño, registro de cargas.
                  </div>
                </div>
              </div>

              {/* INSTRUCCIONES DE PAGO */}
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h2 className="text-lg font-bold">Instrucciones de pago</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Realizá el pago y luego subí el comprobante (PNG/JPG/WEBP/PDF).
                </p>

                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm">
                  <p className="text-zinc-300">
                    Monto: <span className="font-semibold text-emerald-300">{formatARS(order.amount_ars)}</span>
                  </p>

                  {order.payment_method === "ars" && (
                    <div className="mt-4 grid gap-2 text-zinc-200">
                      <p><span className="text-zinc-400">Alias:</span> <span className="font-mono">{payInfo?.ars?.alias || "-"}</span></p>
                      <p><span className="text-zinc-400">CBU:</span> <span className="font-mono">{payInfo?.ars?.cbu || "-"}</span></p>
                      <p><span className="text-zinc-400">Titular:</span> {payInfo?.ars?.holder || "-"}</p>
                    </div>
                  )}

                  {order.payment_method === "usd" && (
                    <div className="mt-4 grid gap-2 text-zinc-200">
                      <p><span className="text-zinc-400">Banco:</span> {payInfo?.usd?.bank || "-"}</p>
                      <p><span className="text-zinc-400">Alias:</span> <span className="font-mono">{payInfo?.usd?.alias || "-"}</span></p>
                      <p><span className="text-zinc-400">CBU:</span> <span className="font-mono">{payInfo?.usd?.cbu || "-"}</span></p>

                      <details className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950/20 p-3">
                        <summary className="cursor-pointer select-none text-zinc-200">
                          Ver datos ACH/Wire
                        </summary>
                        <div className="mt-3 grid gap-2 text-zinc-200">
                          <p><span className="text-zinc-400">Nombre:</span> {payInfo?.usd?.ach?.name || "-"}</p>
                          <p><span className="text-zinc-400">Routing:</span> <span className="font-mono">{payInfo?.usd?.ach?.routing || "-"}</span></p>
                          <p><span className="text-zinc-400">Account:</span> <span className="font-mono">{payInfo?.usd?.ach?.account || "-"}</span></p>
                          <p><span className="text-zinc-400">Type:</span> {payInfo?.usd?.ach?.type || "-"}</p>
                          <p><span className="text-zinc-400">Bank:</span> {payInfo?.usd?.ach?.bank || "-"}</p>
                          <p><span className="text-zinc-400">Address:</span> {payInfo?.usd?.ach?.address || "-"}</p>
                        </div>
                      </details>

                      <p className="mt-3 text-xs text-zinc-500">
                        Si pagás en USD, enviá el equivalente al momento del pago (tipo de cambio del día).
                      </p>
                    </div>
                  )}

                  {order.payment_method === "crypto" && (
                    <div className="mt-4 grid gap-2 text-zinc-200">
                      <p><span className="text-zinc-400">BTC:</span> <span className="font-mono break-all">{payInfo?.crypto?.btc || "-"}</span></p>
                      <p><span className="text-zinc-400">USDT:</span> <span className="font-mono break-all">{payInfo?.crypto?.usdt || "-"}</span></p>
                      <p><span className="text-zinc-400">USDC:</span> <span className="font-mono break-all">{payInfo?.crypto?.usdc || "-"}</span></p>
                    </div>
                  )}
                </div>
              </div>

              {/* SUBIR COMPROBANTE */}
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h2 className="text-lg font-bold">Subir comprobante</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Subí el comprobante para que se revise tu pago. (Max 8MB)
                </p>

                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="text-sm text-zinc-300">Referencia (opcional)</label>
                    <input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-emerald-500"
                      placeholder="Ej: Pago 11/02 14:40 AR"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-300">Archivo</label>
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3"
                    />
                    {file && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Seleccionado: <span className="font-mono">{file.name}</span>
                      </p>
                    )}
                  </div>

                  {uploadMsg && (
                    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-emerald-200">
                      {uploadMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={uploadReceipt}
                    className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {uploading ? "Subiendo…" : "Enviar comprobante"}
                  </button>

                  <p className="text-xs text-zinc-500">
                    Consejo: guardá tu ID de orden y tu email para volver más tarde.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
