"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIGURACIÓN DE SUPABASE ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── TUS DATOS DE COBRO ───
const PAYMENT_CONFIG = {
  brubank: {
    alias: "lucianotujague",
    cbu: "1430001713041213360019",
    holder: "Luciano Nicolas Tujague"
  },
  buenbit_local: {
    title: "Buenbit USD (Cuenta Local)",
    bank: "Banco Industrial",
    alias: "BUENBIT.USD",
    cbu: "3220001812006401160021"
  },
  buenbit_ach: {
    title: "Buenbit USD (Cuenta Exterior ACH)",
    bank: "Lead Bank",
    name: "LUCIANO NICOLAS TUJAGUE",
    routing: "101019644",
    account: "218050863270",
    type: "Checking",
    address: "1801 Main St. Kansas City, MO 64108"
  },
  crypto: {
    btc: "bc1q3w48qpn0xdtcy4fe370n3xsmk4hreve05nt8ek",
    usdt: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf",
    usdc: "0x099455826F2196607244A7102D5466Eb45413F15"
  }
};

interface CheckoutClientProps {
  selectedPlan: {
    id: string;     
    title: string;
    subtitle: string;
    price: number;
  };
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("¡Copiado al portapapeles!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);

    const orderId = `TS-${Math.floor(100000000 + Math.random() * 900000000)}`;

    try {
      // 1. TRADUCIR MÉTODO DE PAGO AL FORMATO EXACTO DE LA BASE DE DATOS
      let dbPaymentMethod = "";
      switch (paymentMethod) {
        case "mercadopago": dbPaymentMethod = "mercado_pago"; break;
        case "transferencia": dbPaymentMethod = "transfer_ars"; break;
        case "usd": dbPaymentMethod = "international_usd"; break;
        case "crypto": dbPaymentMethod = "crypto"; break;
        default: dbPaymentMethod = "mercado_pago";
      }

      // 2. BUSCAR ID REAL (UUID) DEL PLAN
      const { data: realPlan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('code', selectedPlan.id)
        .single();

      if (planError || !realPlan) {
        throw new Error("No se encontró el plan en la base de datos.");
      }

      // 3. INSERTAR LA ORDEN CON LOS DATOS CORRECTOS
      const { error: supabaseError } = await supabase.from("orders").insert([
        {
          order_id: orderId,
          customer_name: formData.name.trim(),
          customer_email: formData.email.trim(),
          customer_ref: formData.instagram.trim() || null,
          plan_id: realPlan.id, 
          amount_ars: totalAmount,
          status: "awaiting_payment", // <--- ESTADO CORRECTO PARA TU DB
          payment_method: dbPaymentMethod, // <--- NOMBRE EXACTO (mercado_pago, transfer_ars, etc.)
          extra_video: extraVideo
        }
      ]);

      if (supabaseError) throw new Error(supabaseError.message);

      // 4. REDIRIGIR
      router.push(`/order/${orderId}?email=${encodeURIComponent(formData.email.trim())}`);
      
    } catch (err: any) {
      console.error("Error detallado:", err);
      alert("Error: " + (err.message || "No se pudo crear la orden"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 text-left">
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-black text-white mb-6 uppercase italic tracking-tight">1. Tus Datos</h3>
          <div className="space-y-4">
            <input 
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all" 
              placeholder="Nombre Completo" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-4">
              <input className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Instagram (@)" onChange={e => setFormData({...formData, instagram: e.target.value})} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black text-white mb-6 uppercase italic tracking-tight">2. Método de Pago</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => setPaymentMethod("mercadopago")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Mercado Pago</button>
            <button onClick={() => setPaymentMethod("transferencia")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Transferencia</button>
            <button onClick={() => setPaymentMethod("crypto")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Cripto (-10%)</button>
            <button onClick={() => setPaymentMethod("usd")} className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${paymentMethod === 'usd' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Dólar (Intl)</button>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-inner">
            {paymentMethod === 'transferencia' && (
              <div className="space-y-4">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Brubank ARS</p>
                <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.cbu)} className="group cursor-pointer">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">CBU</span>
                  <span className="text-white font-mono text-sm group-hover:text-emerald-400 break-all">{PAYMENT_CONFIG.brubank.cbu}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'crypto' && (
               <div className="space-y-4">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Redes Soportadas</p>
                <div onClick={() => copyToClipboard(PAYMENT_CONFIG.crypto.usdt)} className="group cursor-pointer">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">USDT (TRC20)</span>
                  <span className="text-white font-mono text-[11px] group-hover:text-emerald-400 break-all">{PAYMENT_CONFIG.crypto.usdt}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'usd' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Opción Local USD</p>
                  <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_local.cbu)} className="group cursor-pointer">
                    <span className="text-zinc-500 text-[10px] block uppercase font-bold">CBU</span>
                    <span className="text-white font-mono text-xs group-hover:text-emerald-400 break-all">{PAYMENT_CONFIG.buenbit_local.cbu}</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-xs text-zinc-400 italic mt-4">
              {paymentMethod === 'mercadopago' 
                ? "Serás redirigido para completar el pago." 
                : "Al continuar se generará tu orden y podrás ver los datos completos para transferir."}
            </p>
          </div>
        </section>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl h-fit shadow-2xl">
        <div className="mb-8">
          <h3 className="text-zinc-500 text-xs font-bold uppercase mb-2">Resumen de Plan</h3>
          <p className="text-white font-black text-2xl tracking-tighter uppercase italic">{selectedPlan.title}</p>
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
          <span className="text-4xl font-black text-white tracking-tighter">
            ${totalAmount.toLocaleString()}
          </span>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading || !formData.name || !formData.email}
          className="w-full bg-emerald-500 py-5 text-black font-black uppercase rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "PROCESANDO..." : "GENERAR PEDIDO"}
        </button>
      </div>
    </div>
  );
}