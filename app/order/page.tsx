"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>}>
      <OrderForm />
    </Suspense>
  );
}

function OrderForm() {
  const searchParams = useSearchParams();
  const planName = searchParams.get("name") || "Plan Seleccionado";
  const price = searchParams.get("price") || "0";
  const planCode = searchParams.get("plan");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    customerRef: "",
    extraVideo: false,
    paymentMethod: "mercado_pago" as any
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode, ...formData }),
      });
      const data = await res.json();
      if (data.paymentUrl) window.location.href = data.paymentUrl;
      else if (data.orderId) router.push(`/order/${data.orderId}/payment`);
    } catch (error) {
      alert("Error al procesar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 flex justify-center items-center font-sans">
      <div className="w-full max-w-lg">
        
        {/* Resumen del Plan */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
          <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Estás comprando</p>
          <h1 className="text-2xl font-bold text-white mb-2">{planName}</h1>
          <div className="text-3xl font-bold text-emerald-400">${Number(price).toLocaleString('es-AR')} <span className="text-sm text-gray-500 font-normal">/mes</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Datos Personales */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre Completo"
              required
              className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-4 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Tu Email"
              required
              className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-4 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Instagram o WhatsApp (para contactarte)"
              className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-4 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-gray-600"
              onChange={(e) => setFormData({ ...formData, customerRef: e.target.value })}
            />
          </div>

          {/* Selector de Pago */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Método de Pago</label>
            <div className="relative">
              <select 
                className="w-full bg-[#0a0a0a] border border-gray-800 text-white p-4 rounded-xl appearance-none cursor-pointer hover:border-emerald-500 transition-colors"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="mercado_pago">🇦🇷 Mercado Pago (Tarjetas/Débito)</option>
                <option value="transfer_ars">🏦 Transferencia ARS (BruBank)</option>
                <option value="crypto">🪙 Crypto (USDT - Tron)</option>
                <option value="international_usd">🌎 Internacional (PayPal/Zelle)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>

          {/* Upsell Video - Estilo Tarjeta */}
          <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.extraVideo ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-800 hover:border-gray-700 bg-[#0a0a0a]'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.extraVideo ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                {formData.extraVideo && <span className="text-white text-sm">✓</span>}
              </div>
              <input
                type="checkbox"
                className="hidden"
                onChange={(e) => setFormData({ ...formData, extraVideo: e.target.checked })}
              />
              <div className="flex-1">
                <p className="font-bold text-sm text-white">Revisión Técnica en Video</p>
                <p className="text-xs text-gray-400">Te grabo un video corrigiendo tu técnica.</p>
              </div>
              <span className="text-emerald-400 font-bold text-sm">+$15.000</span>
            </div>
          </label>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-lg"
          >
            {loading ? "Procesando..." : `Pagar $${(Number(price) + (formData.extraVideo ? 15000 : 0)).toLocaleString('es-AR')}`}
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            Pago seguro y encriptado. Acceso inmediato al enviar comprobante.
          </p>
        </form>
      </div>
    </div>
  );
}