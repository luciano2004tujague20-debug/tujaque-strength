"use client";

import { useState } from "react";

const PRODUCT_ID_DE_PRUEBA = "81e37c6c-e30a-4cd1-a1a1-64ec6728d023";

export default function CommerceTestPage() {
  const [loading, setLoading] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const handleComprar = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: [PRODUCT_ID_DE_PRUEBA],
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
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full rounded-2xl border p-8">
        <h1 className="text-2xl font-bold mb-4">Laboratorio secreto commerce</h1>
        <p className="mb-6">
          Esto prueba el nuevo checkout <code>commerce_*</code> sin tocar tu sistema viejo.
        </p>

        <button
          onClick={handleComprar}
          disabled={loading}
          className="px-5 py-3 rounded-lg border font-semibold"
        >
          {loading ? "Cargando..." : "Comprar producto de prueba ($100)"}
        </button>
      </div>
    </main>
  );
}