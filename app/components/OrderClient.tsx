"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentMethod = "mercado_pago" | "transfer_ars" | "international_usd" | "crypto" | string;

type OrderResponse = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_ref?: string | null;
  payment_method: PaymentMethod;
  amount_ars: number;
  status: "awaiting_payment" | "under_review" | "paid" | "rejected";
  created_at: string;
  plans?: {
    name: string;
  };
};

// ... (formatARS y badge se mantienen igual)
function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function badge(status: string) {
  switch (status) {
    case "awaiting_payment": return "Pendiente de pago";
    case "under_review": return "Comprobante enviado (en revisión)";
    case "paid": return "Aprobado ✅";
    case "rejected": return "Rechazado ❌";
    default: return status;
  }
}

export default function OrderClient({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [payInfo, setPayInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [payingMP, setPayingMP] = useState(false);

  useEffect(() => {
    const lastEmail = localStorage.getItem("ts_last_email") || "";
    if (lastEmail) setEmail(lastEmail);
  }, []);

  useEffect(() => {
    fetch("/api/payment-info").then(res => res.json()).then(data => setPayInfo(data)).catch(() => {});
  }, []);

  async function loadOrder() {
    setLoadError(null);
    const e = email.trim().toLowerCase();
    if (!e) return setLoadError("Ingresá tu email.");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}?email=${encodeURIComponent(e)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se encontró la orden");
      setOrder(json.order);
      localStorage.setItem("ts_last_email", e);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- CORRECCIÓN EN SUBIDA DE COMPROBANTE ---
  async function uploadReceipt() {
    if (!order) return alert("Cargá primero los datos de tu orden.");
    if (!file) return alert("Por favor, seleccioná una imagen del comprobante.");

    setUploading(true);
    setUploadMsg(null);

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

      if (!res.ok) throw new Error(json.error || "Error al subir");

      alert("✅ Comprobante enviado con éxito. Luciano lo revisará en breve.");
      setFile(null);
      setReference("");
      await loadOrder(); // Recargar para ver el cambio de estado
    } catch (err: any) {
      alert("⚠️ " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleMercadoPago() {
    if (!order) return;
    setPayingMP(true);
    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            orderId: order.order_id, 
            price: order.amount_ars, 
            title: "Pago de Plan" 
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Error con Mercado Pago");
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setPayingMP(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-4xl px-6 py-12">
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← Volver a planes</a>
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-10">
          <h1 className="text-2xl font-black italic uppercase">Tu <span className="text-emerald-500">Orden</span></h1>
          <p className="mt-2 text-zinc-400 font-mono text-xs">ID: {orderId}</p>

          {!order && (
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-emerald-500" placeholder="tu@email.com" />
              <button onClick={loadOrder} disabled={loading} className="rounded-xl bg-emerald-500 px-8 py-3 font-bold text-black disabled:opacity-50">
                {loading ? "Buscando..." : "Ver Estado"}
              </button>
            </div>
          )}

          {loadError && <p className="mt-4 text-red-400 text-xs font-bold">{loadError}</p>}

          {order && (
            <div className="mt-10 space-y-8 animate-fade-in">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-zinc-950/50 p-6 border border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Plan</p>
                  <p className="text-xl font-bold italic">{order.plans?.name || "Cargando plan..."}</p>
                  <p className="mt-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Inversión</p>
                  <p className="text-2xl font-black text-emerald-400">{formatARS(order.amount_ars)}</p>
                </div>
                <div className="rounded-2xl bg-zinc-950/50 p-6 border border-zinc-800 flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Estado</p>
                  <p className="text-lg font-bold text-white uppercase">{badge(order.status)}</p>
                </div>
              </div>

              {order.status !== 'paid' && (
                <div className="space-y-6">
                  {/* Mercado Pago */}
                  {(order.payment_method === 'mercado_pago' || order.payment_method === 'transfer_ars') && (
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                      <h3 className="font-bold mb-2">Pago Automático (MP)</h3>
                      <button onClick={handleMercadoPago} disabled={payingMP} className="w-full py-4 bg-[#009EE3] text-white font-bold rounded-xl shadow-lg shadow-blue-500/10">
                        {payingMP ? "Cargando..." : "Ir a Mercado Pago"}
                      </button>
                    </div>
                  )}

                  {/* Manual / Datos de Transferencia */}
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-black/20">
                    <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-emerald-500">Datos para Transferir</h3>
                    <div className="text-sm font-mono space-y-2 text-zinc-300">
                      {order.payment_method.includes('transfer') && (
                        <>
                          <p>CBU: {payInfo?.ars?.cbu}</p>
                          <p>Alias: {payInfo?.ars?.alias}</p>
                        </>
                      )}
                      {order.payment_method === 'crypto' && <p>USDT (TRC20): {payInfo?.crypto?.usdt}</p>}
                      {order.payment_method === 'international_usd' && <p>BuenBit: {payInfo?.usd?.alias}</p>}
                    </div>
                  </div>

                  {/* Subida */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/20">
                    <h3 className="font-bold mb-4">Subir Comprobante Manual</h3>
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300" />
                    <button onClick={uploadReceipt} disabled={uploading || !file} className="w-full py-3 bg-zinc-100 text-black font-black rounded-xl disabled:opacity-30">
                      {uploading ? "Subiendo..." : "Enviar Comprobante"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}