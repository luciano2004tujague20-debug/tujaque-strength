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

  // Estado para MP
  const [payingMP, setPayingMP] = useState(false);

  useEffect(() => {
    const lastEmail = localStorage.getItem("ts_last_email") || "";
    if (lastEmail && !email) setEmail(lastEmail);
  }, [email]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payment-info", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) return;
        if (!cancelled) setPayInfo(json);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  async function loadOrder() {
    setLoadError(null);
    setUploadMsg(null);
    const e = email.trim().toLowerCase();
    if (!e) return setLoadError("Ingresá el email usado en la orden.");

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
    if (order.payment_method === "ars") return "Mercado Pago / Transferencia";
    if (order.payment_method === "usd") return "USD / Wire / ACH";
    return "Crypto";
  }, [order]);

  // Función para manejar pago con MP
  async function handleMercadoPago() {
    if (!order) return;
    setPayingMP(true);
    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.order_id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirigir a Mercado Pago
      } else {
        alert("Error generando pago: " + (data.error || "Desconocido"));
      }
    } catch (e) {
      alert("Error de conexión con Mercado Pago");
    } finally {
      setPayingMP(false);
    }
  }

  async function uploadReceipt() {
    setUploadMsg(null);
    setLoadError(null);
    if (!order) return setLoadError("Primero cargá la orden con tu email.");
    if (!email.trim()) return setLoadError("Falta email.");
    if (!file) return setLoadError("Elegí un archivo.");

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
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← Volver a planes</a>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h1 className="text-2xl font-bold">Tu orden</h1>
          <p className="mt-2 text-zinc-300">ID: <span className="font-mono font-semibold text-emerald-300">{orderId}</span></p>

          {!order && (
             <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">Email de la orden</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-emerald-500" placeholder="tu@email.com" />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={loadOrder} disabled={loading} className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60">
                    {loading ? "Cargando…" : "Ver mi orden"}
                  </button>
                </div>
             </div>
          )}
          
          {loadError && <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{loadError}</div>}

          {order && (
            <>
              {/* DETALLE ORDEN */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <p className="text-sm text-zinc-400">Plan</p>
                  <p className="mt-1 text-lg font-semibold">{order.plans?.name}</p>
                  <p className="mt-3 text-sm text-zinc-400">Total a Pagar</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-300">{formatARS(order.amount_ars)}</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <p className="text-sm text-zinc-400">Estado</p>
                  <p className={`mt-1 text-lg font-semibold ${order.status === 'paid' ? 'text-emerald-400' : 'text-white'}`}>
                    {badge(order.status)}
                  </p>
                  <p className="mt-3 text-sm text-zinc-400">Método</p>
                  <p className="mt-1 font-semibold">{methodLabel}</p>
                </div>
              </div>

              {/* SECCIÓN DE PAGO (SOLO SI NO ESTÁ PAGADA) */}
              {order.status !== 'paid' && (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                    <h2 className="text-lg font-bold mb-4">Realizar Pago</h2>

                    {/* OPCIÓN MERCADO PAGO AUTOMÁTICO */}
                    {order.payment_method === 'ars' && (
                        <div className="mb-8 p-5 rounded-xl bg-emerald-900/10 border border-emerald-500/30">
                            <h3 className="font-semibold text-emerald-100 mb-2">Opción Recomendada: Pago Automático</h3>
                            <p className="text-sm text-zinc-300 mb-4">Pagá con dinero en cuenta, tarjetas o efectivo. La aprobación es inmediata.</p>
                            
                            <button 
                                onClick={handleMercadoPago}
                                disabled={payingMP}
                                className="w-full py-4 bg-[#009EE3] hover:bg-[#008ED6] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2"
                            >
                                {payingMP ? (
                                    <span>Generando...</span>
                                ) : (
                                    <>
                                        <span>Pagar con Mercado Pago</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* DATOS MANUALES (SIEMPRE VISIBLES COMO ALTERNATIVA) */}
                    <details className="group">
                        <summary className="cursor-pointer text-zinc-400 hover:text-white text-sm font-medium flex items-center gap-2 select-none">
                            <span>Ver datos para transferencia manual / Crypto</span>
                            <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        
                        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm animate-in fade-in slide-in-from-top-2">
                            {order.payment_method === "ars" && (
                                <div className="grid gap-2 text-zinc-200">
                                    <p><span className="text-zinc-400">Alias:</span> <span className="font-mono text-white select-all">{payInfo?.ars?.alias || "-"}</span></p>
                                    <p><span className="text-zinc-400">CBU:</span> <span className="font-mono text-white select-all">{payInfo?.ars?.cbu || "-"}</span></p>
                                    <p><span className="text-zinc-400">Titular:</span> {payInfo?.ars?.holder || "-"}</p>
                                </div>
                            )}

                             {order.payment_method === "usd" && (
                                <div className="grid gap-2 text-zinc-200">
                                    <p><span className="text-zinc-400">Banco:</span> {payInfo?.usd?.bank || "-"}</p>
                                    <p><span className="text-zinc-400">Alias:</span> <span className="font-mono">{payInfo?.usd?.alias || "-"}</span></p>
                                    <p className="text-xs text-zinc-500 mt-2">Para datos ACH completos, contactanos.</p>
                                </div>
                             )}

                             {order.payment_method === "crypto" && (
                                <div className="grid gap-2 text-zinc-200">
                                    <p><span className="text-zinc-400">USDT (TRC20):</span> <span className="font-mono break-all text-xs select-all">{payInfo?.crypto?.usdt || "-"}</span></p>
                                </div>
                             )}
                        </div>
                    </details>
                  </div>
              )}

              {/* SUBIDA DE COMPROBANTE (SOLO SI NO ESTA PAGADO) */}
              {order.status !== 'paid' && (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                    <h2 className="text-lg font-bold">Subir comprobante (Solo manual)</h2>
                    <p className="mt-1 text-sm text-zinc-400">Si pagaste por Mercado Pago, no hace falta que subas nada.</p>

                    <div className="mt-5 grid gap-4">
                      <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none" placeholder="Referencia (opcional)" />
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3" />
                      
                      {uploadMsg && <div className="rounded-xl bg-emerald-950/30 p-4 text-emerald-200 border border-emerald-900/50">{uploadMsg}</div>}

                      <button type="button" disabled={uploading} onClick={uploadReceipt} className="rounded-xl bg-zinc-700 px-5 py-3 font-semibold text-white hover:bg-zinc-600 disabled:opacity-60">
                        {uploading ? "Subiendo…" : "Enviar comprobante manual"}
                      </button>
                    </div>
                  </div>
              )}

              {order.status === 'paid' && (
                  <div className="mt-6 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <h2 className="text-2xl font-bold text-emerald-400 mb-2">¡Todo listo! 🎉</h2>
                      <p className="text-zinc-300">Tu pago ya fue registrado. Recibirás tu plan en breve al email <strong>{email}</strong>.</p>
                  </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
