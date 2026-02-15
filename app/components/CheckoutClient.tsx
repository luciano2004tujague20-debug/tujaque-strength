"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIGURACIÓN SUPABASE ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── DATOS DE COBRO ───
const PAYMENT_CONFIG = {
  brubank: { alias: "lucianotujague", cbu: "1430001713041213360019" },
  crypto: { usdt: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf", usdc: "0x099455826F2196607244A7102D5466Eb45413F15", btc: "bc1q3w48qpn0xdtcy4fe370n3xsmk4hreve05nt8ek" },
  buenbit_local: { cbu: "3220001812006401160021", alias: "BUENBIT.USD" },
  buenbit_ach: { routing: "101019644", account: "218050863270", bank: "Lead Bank", address: "1801 Main St. Kansas City, MO 64108" }
};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);

    const orderId = `TS-${Math.floor(100000000 + Math.random() * 900000000)}`;

    try {
      // 1. TRADUCIR MÉTODO
      let dbPaymentMethod = "";
      switch (paymentMethod) {
        case "mercadopago": dbPaymentMethod = "mercado_pago"; break;
        case "transferencia": dbPaymentMethod = "transfer_ars"; break;
        case "usd": dbPaymentMethod = "international_usd"; break;
        case "crypto": dbPaymentMethod = "crypto"; break;
        default: dbPaymentMethod = "mercado_pago";
      }

      // 2. BUSCAR PLAN ID
      const { data: realPlan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('code', selectedPlan.id)
        .single();

      if (planError || !realPlan) throw new Error("Plan no encontrado");

      // 3. GUARDAR ORDEN EN SUPABASE
      const { error: supabaseError } = await supabase.from("orders").insert([
        {
          order_id: orderId,
          customer_name: formData.name.trim(),
          customer_email: formData.email.trim(),
          customer_ref: formData.instagram.trim() || null,
          plan_id: realPlan.id, 
          amount_ars: totalAmount,
          status: "awaiting_payment",
          payment_method: dbPaymentMethod,
          extra_video: extraVideo
        }
      ]);

      if (supabaseError) throw new Error(supabaseError.message);

      // 4. LÓGICA DE REDIRECCIÓN SEGÚN MÉTODO
      if (paymentMethod === "mercadopago") {
        
        // 🔹 ACÁ ESTÁ EL CAMBIO: Apuntamos a tu ruta existente
        const mpRes = await fetch("/api/mp/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Plan ${selectedPlan.title}`,
            price: totalAmount,
            orderId: orderId
          })
        });
        
        const mpData = await mpRes.json();
        if (mpData.url) {
          // REDIRECCIÓN AUTOMÁTICA A MERCADO PAGO
          window.location.href = mpData.url;
          return; 
        } else {
          throw new Error("No se pudo generar el link de Mercado Pago");
        }
      } 
      
      // Si NO es Mercado Pago, vamos a la página de detalle
      router.push(`/order/${orderId}?email=${encodeURIComponent(formData.email.trim())}`);
      
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Ocurrió un error"));
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 text-left">
      {/* SECCIÓN 1: DATOS */}
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-black text-white mb-6 uppercase italic tracking-tight">1. Tus Datos</h3>
          <div className="space-y-4">
            <input className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Nombre Completo" onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Instagram (@)" onChange={e => setFormData({...formData, instagram: e.target.value})} />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: PAGO */}
        <section>
          <h3 className="text-xl font-black text-white mb-6 uppercase italic tracking-tight">2. Método de Pago</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => setPaymentMethod("mercadopago")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Mercado Pago</button>
            <button onClick={() => setPaymentMethod("transferencia")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Transferencia</button>
            <button onClick={() => setPaymentMethod("crypto")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Cripto (-10%)</button>
            <button onClick={() => setPaymentMethod("usd")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'usd' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Dólar (Intl)</button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-inner">
             {paymentMethod === 'mercadopago' && <p className="text-xs text-zinc-400 italic">Te redirigiremos a Mercado Pago para abonar de forma segura.</p>}
             {paymentMethod === 'transferencia' && <p className="text-xs text-zinc-400 italic">Te daremos el CBU y Alias al confirmar el pedido.</p>}
             {paymentMethod === 'crypto' && <p className="text-xs text-zinc-400 italic">Te daremos las direcciones USDT/BTC al confirmar el pedido.</p>}
          </div>
        </section>
      </div>

      {/* RESUMEN Y BOTÓN */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl h-fit shadow-2xl">
        <div className="mb-8">
          <h3 className="text-zinc-500 text-xs font-bold mb-2">Resumen de Plan</h3>
          <p className="text-white font-black text-2xl tracking-tighter italic">{selectedPlan.title}</p>
          <p className="text-emerald-500 text-xs font-bold">{selectedPlan.subtitle}</p>
        </div>
        
        <div className="space-y-3 mb-8 border-y border-zinc-800 py-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400 font-medium">Subtotal</span>
            <span className="text-white font-mono">${selectedPlan.price.toLocaleString()}</span>
          </div>
          {extraVideo && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-medium">+ Revisión Técnica</span>
              <span className="text-emerald-400 font-mono">+${extraPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-zinc-500 text-xs font-bold uppercase">Total Final</span>
          <span className="text-4xl font-black text-white tracking-tighter">${totalAmount.toLocaleString()}</span>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading || !formData.name || !formData.email}
          className="w-full bg-emerald-500 py-5 text-black font-black uppercase rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "PROCESANDO..." : paymentMethod === 'mercadopago' ? "IR A MERCADO PAGO" : "GENERAR PEDIDO"}
        </button>
      </div>
    </div>
  );
}