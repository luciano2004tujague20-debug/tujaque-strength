"use client";

import { useState } from "react";

const PRODUCT_STRENGTH_ID = "90cd7759-49ae-45fd-86f7-3e2707b31df7";
const PRODUCT_HYPERTROPHY_ID = "edec6c3a-59dd-40a6-a445-450df94c710c";

export default function CommerceRealPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuy = async (productId: string) => {
    setLoading(productId);

    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: [productId],
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error en checkout");
        return;
      }

      if (data.alreadyPaid) {
        alert("Esta orden ya fue pagada.");
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }

      alert("Respuesta inesperada: " + JSON.stringify(data));
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">
          Compra real commerce
        </p>

        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-8">
          Mesociclos Reales
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-[2rem] p-8">
            <h2 className="text-2xl font-black italic mb-3">
              Mesociclo Fuerza 4 Semanas
            </h2>
            <p className="text-zinc-400 mb-6">
              Compra real del producto conectado al entitlement
              <span className="text-emerald-400 font-bold">
                {" "}STATIC_STRENGTH_MESO_ACCESS
              </span>.
            </p>

            <button
              onClick={() => handleBuy(PRODUCT_STRENGTH_ID)}
              disabled={loading !== null}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {loading === PRODUCT_STRENGTH_ID ? "Procesando..." : "Comprar Fuerza"}
            </button>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/50 rounded-[2rem] p-8">
            <h2 className="text-2xl font-black italic mb-3">
              Mesociclo Hipertrofia 4 Semanas
            </h2>
            <p className="text-zinc-400 mb-6">
              Compra real del producto conectado al entitlement
              <span className="text-emerald-400 font-bold">
                {" "}STATIC_HYPERTROPHY_MESO_ACCESS
              </span>.
            </p>

            <button
              onClick={() => handleBuy(PRODUCT_HYPERTROPHY_ID)}
              disabled={loading !== null}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {loading === PRODUCT_HYPERTROPHY_ID ? "Procesando..." : "Comprar Hipertrofia"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}