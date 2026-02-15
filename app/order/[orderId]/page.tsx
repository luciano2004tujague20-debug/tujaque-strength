"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CEREBRO DE CONVERSIÓN (PASO 1) ---
const TASAS = {
  dolar: 1200,      // 1 USD = 1200 ARS
  btc: 85000000     // 1 BTC = 85M ARS
};

const PAYMENT_CONFIG = {
  brubank: {
    title: "Brubank (Pesos ARS)",
    alias: "lucianotujague",
    cbu: "1430001713041213360019",
    holder: "Luciano Nicolas Tujague"
  },
  buenbit_local: {
    title: "Dólar USD (Cuenta Local Argentina)",
    bank: "Banco Industrial",
    alias: "BUENBIT.USD",
    cbu: "3220001812006401160021"
  },
  buenbit_ach: {
    title: "Dólar USD (Cuenta Exterior - ACH USA)",
    bank: "Lead Bank",
    name: "LUCIANO NICOLAS TUJAGUE",
    routing: "101019644",
    account: "218050863270",
    type: "Checking",
    address: "1801 Main St. Kansas City, MO 64108"
  },
  crypto: {
    usdt: { address: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf", network: "TRON (TRC20)" },
    usdc: { address: "0x099455826F2196607244A7102D5466Eb45413F15", network: "Polygon / ERC20" },
    btc: { address: "bc1q3w48qpn0xdtcy4fe370n3xsmk4hreve05nt8ek", network: "Bitcoin Network" }
  }
};

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.orderId as string; 
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false); // Estado para mostrar éxito

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const { data } = await supabase.from("orders").select("*").eq("order_id", orderId).single();
      setOrder(data);
      setLoading(false);
      if (data?.status === 'verifying') setDone(true);
    };
    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles: " + text);
  };

  const getConvertedAmount = () => {
    if (!order) return "";
    const ars = order.amount_ars || 0;
    
    if (order.payment_method === 'crypto') {
      const usdt = (ars / TASAS.dolar).toFixed(2);
      const btc = (ars / TASAS.btc).toFixed(8);
      return `${usdt} USDT/USDC o ₿ ${btc}`;
    }
    if (order.payment_method === 'international_usd' || order.payment_method === 'usd') {
      return `U$D ${(ars / TASAS.dolar).toFixed(2)}`;
    }
    return `$${ars.toLocaleString()} ARS`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await supabase
        .from('orders')
        .update({ status: 'verifying', receipt_url: filePath })
        .eq("order_id", orderId);

      setDone(true);
      
    } catch (error) {
      console.log("Error subida:", error);
      const msg = `Hola! Ya pagué la orden ${orderId} pero no pude subir la foto. Te la paso por acá.`;
      window.open(`https://wa.me/5491123021760?text=${encodeURIComponent(msg)}`, "_blank");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-emerald-500 flex items-center justify-center font-black italic animate-pulse">Sincronizando Orden...</div>;
  if (!order) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-bold">Orden no encontrada.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2 mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all ${done ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-800'}`}>
            <span className={`text-4xl font-bold ${done ? 'text-black' : 'text-zinc-600'}`}>{done ? '✓' : '!'}</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase mt-4">
            {done ? '¡Comprobante Recibido!' : 'Confirmar Pago'}
          </h1>
          <p className="text-zinc-500 text-xs font-mono">ORDEN #{order.order_id}</p>
        </div>

        {!done ? (
          <>
            {/* RESUMEN DE CONVERSIÓN */}
            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8 shadow-2xl text-center">
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-2">Monto exacto a enviar</p>
              <p className="text-4xl font-black text-emerald-400 tracking-tighter italic">
                {getConvertedAmount()}
              </p>
              {order.payment_method !== 'transfer_ars' && (
                <p className="text-[10px] text-zinc-600 mt-4 font-bold">Referencia original: ${order.amount_ars?.toLocaleString()} ARS</p>
              )}
            </div>

            {/* DATOS DE COBRO */}
            <div className="space-y-4">
              <h3 className="text-center text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic">Datos de la cuenta</h3>

              {order.payment_method === 'transfer_ars' && (
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                  <p className="text-emerald-500 text-[10px] font-black text-center tracking-widest uppercase mb-4">{PAYMENT_CONFIG.brubank.title}</p>
                  <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.alias)} className="cursor-pointer group flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                    <span className="text-zinc-500 text-[10px] font-black uppercase">Alias</span>
                    <span className="font-mono text-white group-hover:text-emerald-400">{PAYMENT_CONFIG.brubank.alias}</span>
                  </div>
                  <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.cbu)} className="cursor-pointer group flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                    <span className="text-zinc-500 text-[10px] font-black uppercase">CBU</span>
                    <span className="font-mono text-white text-xs group-hover:text-emerald-400">{PAYMENT_CONFIG.brubank.cbu}</span>
                  </div>
                </div>
              )}

              {order.payment_method === 'crypto' && (
                <div className="space-y-3">
                  {Object.entries(PAYMENT_CONFIG.crypto).map(([key, coin]) => (
                    <div key={key} onClick={() => copyToClipboard(coin.address)} className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all group">
                      <div className="flex justify-between mb-2">
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{key} ({coin.network})</span>
                        <span className="text-[9px] text-zinc-600 group-hover:text-white font-black">COPIAR</span>
                      </div>
                      <p className="font-mono text-xs text-zinc-400 break-all group-hover:text-white">{coin.address}</p>
                    </div>
                  ))}
                </div>
              )}

              {(order.payment_method === 'international_usd' || order.payment_method === 'usd') && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <p className="text-emerald-500 text-[10px] font-black mb-4 uppercase tracking-widest">{PAYMENT_CONFIG.buenbit_ach.title}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_ach.routing)} className="cursor-pointer bg-black/30 p-3 rounded-lg border border-white/5">
                        <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Routing</p>
                        <p className="font-mono text-xs text-white">{PAYMENT_CONFIG.buenbit_ach.routing}</p>
                      </div>
                      <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_ach.account)} className="cursor-pointer bg-black/30 p-3 rounded-lg border border-white/5">
                        <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Account</p>
                        <p className="font-mono text-xs text-white">{PAYMENT_CONFIG.buenbit_ach.account}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-[9px] text-zinc-500 font-bold space-y-1 opacity-60 italic">
                      <p>BANK: {PAYMENT_CONFIG.buenbit_ach.bank}</p>
                      <p>NAME: {PAYMENT_CONFIG.buenbit_ach.name}</p>
                      <p>ADDRESS: {PAYMENT_CONFIG.buenbit_ach.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN SUBIR */}
            <div className="pt-10">
              <label className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-[2rem] tracking-[0.2em] text-xs uppercase transition-all cursor-pointer shadow-[0_10px_30px_rgba(16,185,129,0.2)] text-center active:scale-95">
                {uploading ? "PROCESANDO..." : "SUBIR COMPROBANTE 📄"}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*,.pdf" />
              </label>
              <p className="text-[10px] text-zinc-600 text-center mt-6 italic font-bold">
                Una vez enviado, el sistema notificará a Luciano para la validación.
              </p>
            </div>
          </>
        ) : (
          /* PANTALLA DE ÉXITO FINAL */
          <div className="glass-card p-10 text-center animate-fade-in border-emerald-500/20 bg-emerald-500/[0.02] rounded-[3rem]">
            <h2 className="text-3xl font-black italic mb-6">PROTOCOLO <span className="text-emerald-400">INICIADO</span></h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Tu ticket ha sido enviado correctamente. Luciano validará los datos y activará tu acceso al sistema.
            </p>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] mb-8">
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">Aviso de Entrega</p>
              <p className="text-sm text-zinc-200 italic leading-relaxed">
                Recordá que el armado de tu planificación personalizada tiene una demora de hasta **48 horas hábiles**. Recibirás un WhatsApp de confirmación cuando tu Dashboard esté listo.
              </p>
            </div>

            <button onClick={() => window.location.href = '/'} className="text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-white transition-colors">Volver al Inicio</button>
          </div>
        )}
      </div>
    </div>
  );
}