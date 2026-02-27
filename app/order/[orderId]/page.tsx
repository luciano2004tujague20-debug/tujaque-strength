"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// --- CEREBRO DE CONVERSIÓN ---
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
    title: "Transferencia Local (USD)",
    bank: "Banco Industrial",
    cbu: "3220001812006401160021",
    alias: "BUENBIT.USD"
  },
  buenbit_ach: {
    title: "Dólar ACH (USA / Exterior)",
    routing: "101019644",
    account: "218050863270",
    bank: "Lead Bank",
    name: "LUCIANO NICOLAS TUJAGUE",
    address: "1801 Main St. Kansas City, MO 64108",
    type: "Checking"
  },
  crypto: {
    USDT: { address: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf", network: "TRC20 (Red Tron)" },
    USDC: { address: "0x099455826F2196607244A7102D5466Eb45413F15", network: "ERC20 / BSC (BEP20) / Polygon" },
    BTC: { address: "bc1q3w48qpn0xdtcy4fe370n3xsmk4hreve05nt8ek", network: "Bitcoin (Native SegWit)" }
  }
};

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter(); // 🆕 Agregamos el router para mandarlo al dashboard
  const orderId = params.orderId as string; 
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  // Estados para Cripto
  const [cryptoCoin, setCryptoCoin] = useState<"USDT" | "USDC" | "BTC">("USDT");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*, plans(*)")
        .eq("order_id", orderId)
        .maybeSingle();

      if (error) {
        console.error("🔥 Error de conexión a Supabase:", error.message);
      }

      if (data) {
        setOrder(data);
        if (data.status === 'verifying' || data.status === 'paid') setDone(true);
      }
      setLoading(false);
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
      if (cryptoCoin === 'BTC') return `₿ ${(ars / TASAS.btc).toFixed(8)}`;
      return `${(ars / TASAS.dolar).toFixed(2)} ${cryptoCoin}`;
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

    try {
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      await supabase
        .from('orders')
        .update({ status: 'verifying', receipt_url: fileName })
        .eq("order_id", orderId);

      setDone(true);
      
    } catch (error) {
      const msg = `Hola! Ya pagué la orden ${orderId} pero falló la subida automática. Te paso el comprobante.`;
      window.open(`https://wa.me/5491123021760?text=${encodeURIComponent(msg)}`, "_blank");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-emerald-500 flex items-center justify-center font-black italic animate-pulse uppercase tracking-tighter">Sincronizando Protocolo...</div>;
  
  if (!order) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
      <div className="text-red-500 font-black italic text-xl uppercase tracking-tighter">Orden no encontrada</div>
      <p className="text-zinc-600 text-xs font-mono">ID: {orderId}</p>
      <button onClick={() => window.location.href = '/'} className="text-zinc-500 text-[10px] uppercase font-bold hover:text-white transition-colors underline underline-offset-4 decoration-zinc-800">Volver al inicio</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans flex justify-center">
      <div className="max-w-3xl w-full space-y-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center space-y-2 mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all ${done ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-800'}`}>
            <span className={`text-4xl font-bold ${done ? 'text-black' : 'text-zinc-600'}`}>{done ? '✓' : '!'}</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase mt-4">
            {done ? '¡Comprobante Recibido!' : 'Confirmar Pago'}
          </h1>
          <p className="text-zinc-500 text-xs font-mono tracking-widest">ORDEN #{order.order_id}</p>
        </div>

        {!done ? (
          <>
            {/* MONTO A ENVIAR */}
            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none"></div>
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-2">Monto exacto a enviar</p>
              <p className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tighter italic transition-all">
                {getConvertedAmount()}
              </p>
              <p className="text-[10px] text-zinc-600 mt-4 font-bold uppercase tracking-widest italic opacity-50">
                Plan: {order.plans?.name || 'Membresía Atleta'}
              </p>
            </div>

            {/* DATOS DE CUENTA */}
            <div className="space-y-6">
              <h3 className="text-center text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic border-b border-zinc-800 pb-2">Instrucciones de Pago</h3>

              {/* OPCIÓN 1: ARS */}
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

              {/* OPCIÓN 2: USD (LOCAL + ACH) */}
              {(order.payment_method === 'international_usd' || order.payment_method === 'usd') && (
                <div className="space-y-4">
                   <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                      <p className="text-emerald-500 text-[10px] font-black text-center tracking-widest uppercase mb-4 border-b border-zinc-800 pb-2">{PAYMENT_CONFIG.buenbit_local.title}</p>
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs font-mono text-zinc-300"><span className="text-zinc-500 font-sans font-bold">Banco</span><span>{PAYMENT_CONFIG.buenbit_local.bank}</span></div>
                         <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_local.alias)} className="cursor-pointer group flex justify-between text-xs font-mono text-zinc-300 hover:text-emerald-400"><span className="text-zinc-500 font-sans font-bold">Alias</span><span>{PAYMENT_CONFIG.buenbit_local.alias}</span></div>
                         <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_local.cbu)} className="cursor-pointer group flex justify-between text-xs font-mono text-zinc-300 hover:text-emerald-400"><span className="text-zinc-500 font-sans font-bold">CBU</span><span>{PAYMENT_CONFIG.buenbit_local.cbu}</span></div>
                      </div>
                   </div>

                   <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                      <p className="text-emerald-500 text-[10px] font-black text-center tracking-widest uppercase mb-4 border-b border-zinc-800 pb-2">{PAYMENT_CONFIG.buenbit_ach.title}</p>
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs font-mono text-zinc-300"><span className="text-zinc-500 font-sans font-bold">Name</span><span>{PAYMENT_CONFIG.buenbit_ach.name}</span></div>
                         <div className="flex justify-between text-xs font-mono text-zinc-300"><span className="text-zinc-500 font-sans font-bold">Bank</span><span>{PAYMENT_CONFIG.buenbit_ach.bank}</span></div>
                         <div className="flex justify-between text-xs font-mono text-zinc-300"><span className="text-zinc-500 font-sans font-bold">Type</span><span>{PAYMENT_CONFIG.buenbit_ach.type}</span></div>
                         <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_ach.routing)} className="cursor-pointer group flex justify-between text-xs font-mono text-zinc-300 hover:text-emerald-400"><span className="text-zinc-500 font-sans font-bold">Routing</span><span>{PAYMENT_CONFIG.buenbit_ach.routing}</span></div>
                         <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_ach.account)} className="cursor-pointer group flex justify-between text-xs font-mono text-zinc-300 hover:text-emerald-400"><span className="text-zinc-500 font-sans font-bold">Account</span><span>{PAYMENT_CONFIG.buenbit_ach.account}</span></div>
                         <div className="text-[10px] font-mono text-zinc-500 text-right mt-2">{PAYMENT_CONFIG.buenbit_ach.address}</div>
                      </div>
                   </div>
                </div>
              )}

              {/* OPCIÓN 3: CRYPTO */}
              {order.payment_method === 'crypto' && (
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
                   <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 items-start">
                      <span className="text-red-500 text-xl">⚠️</span>
                      <p className="text-[10px] text-red-200/80 uppercase tracking-widest font-black leading-relaxed">
                         Si enviás por otra red que no sea la indicada, el dinero se perderá.
                      </p>
                   </div>
                   
                   <div>
                       <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 text-center">1. Seleccioná tu Moneda</label>
                       <div className="flex gap-2">
                          {['USDT', 'USDC', 'BTC'].map(coin => (
                             <button 
                                key={coin} type="button" 
                                // @ts-ignore
                                onClick={() => setCryptoCoin(coin)}
                                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border ${cryptoCoin === coin ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/50 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                             >{coin}</button>
                          ))}
                       </div>
                   </div>

                   <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">2. Red Obligatoria</p>
                      <p className="text-sm font-black text-emerald-400 tracking-widest uppercase text-center">{PAYMENT_CONFIG.crypto[cryptoCoin].network}</p>
                   </div>

                   <div onClick={() => copyToClipboard(PAYMENT_CONFIG.crypto[cryptoCoin].address)} className="cursor-pointer group flex flex-col items-center bg-black/50 p-5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all text-center">
                      <span className="text-zinc-500 text-[10px] font-black uppercase mb-2 group-hover:text-emerald-500">3. Toca para copiar Wallet</span>
                      <span className="font-mono text-white text-[10px] md:text-xs break-all">{PAYMENT_CONFIG.crypto[cryptoCoin].address}</span>
                   </div>
                </div>
              )}

            </div>

            {/* BOTÓN SUBIR COMPROBANTE */}
            <div className="pt-10">
              <label className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-[2rem] tracking-[0.2em] text-xs uppercase transition-all cursor-pointer shadow-[0_10px_30px_rgba(16,185,129,0.2)] text-center active:scale-95">
                {uploading ? "PROCESANDO..." : "SUBIR COMPROBANTE 📄"}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*,.pdf" />
              </label>
              <p className="text-[10px] text-zinc-600 text-center mt-6 italic font-bold">
                Una vez enviado, el sistema te redirigirá a tu Dashboard Privado.
              </p>
            </div>
          </>
        ) : (
          /* ✅ PANTALLA DE ÉXITO NUEVA (REDIRECCIÓN AL DASHBOARD) */
          <div className="p-10 text-center border border-emerald-500/20 bg-emerald-500/[0.02] rounded-[3rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-black italic mb-6 uppercase tracking-tighter text-white">
               Comprobante <span className="text-emerald-400">Enviado</span>
            </h2>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] mb-8">
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 italic">Paso Final</p>
              <p className="text-sm text-zinc-300 italic leading-relaxed font-medium">
                Tu pago está siendo verificado por el Coach. Podés entrar a tu panel ahora mismo para completar tu ficha clínica mientras esperás la aprobación.
              </p>
            </div>
            
            <button 
               onClick={() => router.push('/dashboard')} 
               className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-[2rem] uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95 text-xs"
            >
               ENTRAR A MI PANEL PRIVADO 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}