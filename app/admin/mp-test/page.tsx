"use client";

import { useState } from "react";

type ApiResult = { url?: string; initPoint?: string; [k: string]: any };

export default function MpTestPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(""); // para renewal / create-preference (opcional)
  const [title, setTitle] = useState("");   // opcional
  const [useWallet, setUseWallet] = useState(false); // renewal

  const [loading, setLoading] = useState<string>("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string>("");

  const run = async (label: string, path: string, payload: any) => {
    setLoading(label);
    setError("");
    setResult(null);

    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Error ${res.status} en ${path}`);
      }

      setResult(data);
      return data;
    } catch (e: any) {
      setError(e?.message || "Error desconocido");
      throw e;
    } finally {
      setLoading("");
    }
  };

  // 🔥 1) Compra genérica: /api/mp/create-preference
  const handleCreatePreference = async () => {
    if (!orderId.trim()) return setError("Poné un orderId (ORD-... o número).");

    const payload: any = { orderId: orderId.trim() };
    if (planId.trim()) payload.planId = planId.trim();
    if (title.trim()) payload.title = title.trim();

    await run("create-preference", "/api/mp/create-preference", payload);
  };

  // 🔥 2) Renovación: /api/checkout-renewal
  const handleRenewal = async () => {
    if (!orderId.trim()) return setError("Poné orderId.");
    if (!email.trim()) return setError("Poné email.");
    if (!planId.trim()) return setError("Para renovar necesitás planId (ej: mensual-3-4).");

    await run("checkout-renewal", "/api/checkout-renewal", {
      orderId: orderId.trim(),
      email: email.trim(),
      planId: planId.trim(),
      useWallet,
    });
  };

  // 🔥 3) Upsell: /api/checkout-upsell
  const handleUpsell = async () => {
    if (!orderId.trim()) return setError("Poné orderId.");
    if (!email.trim()) return setError("Poné email.");

    await run("checkout-upsell", "/api/checkout-upsell", {
      orderId: orderId.trim(),
      email: email.trim(),
    });
  };

  // 🔥 4) Upgrade: tu proyecto tiene un typo posible (ckeckout-upgrade)
  // Este botón prueba primero /api/ckeckout-upgrade y si no existe prueba /api/checkout-upgrade
  const handleUpgrade = async () => {
    if (!email.trim()) return setError("Poné email.");
    // orderId es opcional según tu código (pero si lo tenés, mejor)
    const payload = { email: email.trim(), orderId: orderId.trim() || undefined };

    try {
      await run("ckeckout-upgrade", "/api/ckeckout-upgrade", payload);
    } catch {
      // fallback si el archivo en realidad está bien escrito
      await run("checkout-upgrade", "/api/checkout-upgrade", payload);
    }
  };

  const link = result?.url || result?.initPoint;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Admin · Payments Test
        </h1>
        <p className="text-neutral-400 mt-2">
          Esto genera links de pago y prueba endpoints. No “cobra” hasta que alguien pague en MP.
        </p>

        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Order ID
              </label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder='Ej: ORD-171234... o 57'
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-neutral-500 mt-2">
                Si es numérico → busca por <b>id</b>. Si es “ORD-…” → busca por <b>order_id</b>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@gmail.com"
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-neutral-500 mt-2">
                Renewal / Upsell / Upgrade lo necesitan sí o sí.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Plan ID (opcional / requerido para renovación)
              </label>
              <input
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                placeholder="Ej: mensual-3-4"
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-neutral-500 mt-2">
                Create-preference: opcional. Renewal: obligatorio.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Title (opcional)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Compra Plan Mensual"
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-neutral-300 select-none">
            <input
              type="checkbox"
              checked={useWallet}
              onChange={(e) => setUseWallet(e.target.checked)}
              className="accent-emerald-500"
            />
            Usar billetera (solo para Renovación)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCreatePreference}
              disabled={!!loading}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl disabled:opacity-50"
            >
              {loading === "create-preference" ? "CREANDO..." : "1) Create-Preference"}
            </button>

            <button
              onClick={handleRenewal}
              disabled={!!loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl disabled:opacity-50"
            >
              {loading === "checkout-renewal" ? "CREANDO..." : "2) Renewal"}
            </button>

            <button
              onClick={handleUpgrade}
              disabled={!!loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl disabled:opacity-50"
            >
              {loading === "ckeckout-upgrade" || loading === "checkout-upgrade"
                ? "CREANDO..."
                : "3) Upgrade"}
            </button>

            <button
              onClick={handleUpsell}
              disabled={!!loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl disabled:opacity-50"
            >
              {loading === "checkout-upsell" ? "CREANDO..." : "4) Upsell Video"}
            </button>
          </div>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4 text-sm">
              ❌ {error}
            </div>
          ) : null}

          {result ? (
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                Respuesta
              </div>

              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-black text-xs uppercase tracking-widest"
                >
                  ABRIR LINK ↗
                </a>
              ) : (
                <div className="text-yellow-200 text-sm">
                  ⚠️ No vino url/initPoint. Mirá el JSON.
                </div>
              )}

              <pre className="text-xs text-neutral-300 overflow-auto bg-black/40 border border-neutral-800 rounded-xl p-4">
{JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>

        <div className="mt-6 text-neutral-500 text-xs">
          Si Upsell te tira 404: te falta el plan <b>upsell-video</b> en la tabla <b>plans</b> (code exacto).
        </div>
      </div>
    </div>
  );
}