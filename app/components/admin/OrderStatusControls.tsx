"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusControls({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: 'paid' | 'rejected') => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus === 'paid' ? 'PAGADO' : 'RECHAZADO'}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Error actualizando");
      router.refresh();
    } catch (error) {
      alert("Error al actualizar la orden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => updateStatus('paid')}
        disabled={loading || currentStatus === 'paid'}
        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
      >
        {loading ? "Procesando..." : "✅ Aprobar Pago"}
      </button>

      <button
        onClick={() => updateStatus('rejected')}
        disabled={loading || currentStatus === 'rejected'}
        className="flex-1 bg-red-900/50 hover:bg-red-900 border border-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 font-bold py-3 rounded-lg transition-all"
      >
        {loading ? "Procesando..." : "❌ Rechazar"}
      </button>
    </div>
  );
}
