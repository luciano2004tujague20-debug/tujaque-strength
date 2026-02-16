"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getConversions } from "@/lib/pricing";

interface CheckoutClientProps {
  selectedPlan: { id: string; title: string; subtitle: string; price: number; };
  extraVideo: boolean;
  extraPrice: number;
}

type PaymentMethod = "mercadopago" | "transferencia" | "usd" | "crypto";

export default function CheckoutClient({ selectedPlan, extraVideo, extraPrice }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [formData, setFormData] = useState({ name: "", email: "", instagram: "" });

  const totalAmount = selectedPlan.price + (extraVideo ? extraPrice : 0);
  const conversions = getConversions(totalAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Por favor, completá tu nombre y email.");
      return;
    }
    setLoading(true);

    try {
      // 1. Mapeo de métodos para que coincidan con tu backend
      const methodMapping = {
        mercadopago: "mercado_pago",
        transferencia: "transfer_ars",
        crypto: "crypto",
        usd: "international_usd"
      };

      // 2. Llamada a tu API (/api/orders/route.ts)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan.id,       // Coincide con planCode en el backend
          paymentMethod: methodMapping[paymentMethod],
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          customerRef: formData.instagram.trim() || null, // Instagram
          extraVideo: extraVideo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la orden");
      }

      // 3. Redirección automática
      if (data.paymentUrl) {
        // Si la API generó un link de Mercado Pago, vamos ahí
        window.location.href = data.paymentUrl;
      } else if (data.orderId) {
        // Si es otro método, vamos a la página de éxito/comprobante
        router.push(`/order/${data.orderId}?email=${encodeURIComponent(formData.email.trim())}`);
      }
      
    } catch (err: any) {
      console.error(err);
      alert("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 text-left">
      {/* SECCIÓN 1: DATOS */}
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-black text-white mb-6 italic tracking-tight">1. Tus Datos</h3>
          <div className="space-y-4">
            <input 
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all" 
              placeholder="Nombre Completo" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all" 
                placeholder="Email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              <input 
                className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all" 
                placeholder="Instagram (@)" 
                value={formData.instagram}
                onChange={e => setFormData({...formData, instagram: e.target.value})} 
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: MÉTODOS DE PAGO */}
        <section>
          <h3 className="text-xl font-black text-white mb-6 italic tracking-tight">2. Método de Pago</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              type="button"
              onClick={() => setPaymentMethod("mercadopago")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Mercado Pago
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("transferencia")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Transferencia ARS
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("crypto")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Cripto (USDT/BTC)
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod("usd")} 
              className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${paymentMethod === 'usd' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
              Dólar (INTL)
            </button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-inner min-h-[80px] flex items-center">
             {paymentMethod === 'mercadopago' && <p className="text-xs text-zinc-400 italic">Serás redirigido a Mercado Pago para abonar de forma automática.</p>}
             {paymentMethod === 'transferencia' && <p className="text-xs text-zinc-400 italic">Al confirmar, verás los datos para transferir pesos.</p>}
             {paymentMethod === 'crypto' && (
               <div className="text-xs text-zinc-400 space-y-1">
                 <p className="text-emerald-400 font-bold mb-1">Total aproximado:</p>
                 <p>USDT / USDC: <strong>{conversions.usdt}</strong></p>
                 <p>BTC: <strong>{conversions.btc}</strong></p>
               </div>
             )}
             {paymentMethod === 'usd' && <p className="text-xs text-zinc-400 italic">Total aproximado: <strong>U$D {conversions.usd}</strong> (PayPal/Zelle).</p>}
          </div>
        </section>
      </div>

      {/* COLUMNA RESUMEN */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl h-fit shadow-2xl sticky top-24">
        <div className="mb-8">
          <h3 className="text-zinc-500 text-xs font-bold mb-2 uppercase tracking-widest">Tu Selección</h3>
          <p className="text-white font-black text-2xl tracking-tighter italic uppercase">{selectedPlan.title}</p>
          <p className="text-emerald-500 text-xs font-bold">{selectedPlan.subtitle}</p>
        </div>
        
        <div className="space-y-3 mb-8 border-y border-zinc-800 py-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400 font-medium">Costo del Plan</span>
            <span className="text-white font-mono">${selectedPlan.price.toLocaleString()}</span>
          </div>
          {extraVideo && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-medium">+ Revisión Biomecánica</span>
              <span className="text-emerald-400 font-mono">+${extraPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Inversión Final</span>
          <span className="text-4xl font-black text-white tracking-tighter">${totalAmount.toLocaleString()}</span>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading || !formData.name || !formData.email}
          className="w-full bg-emerald-500 py-5 text-black font-black rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          {loading ? "Procesando..." : "Generar Orden de Pago"}
        </button>
      </div>
    </div>
  );
}