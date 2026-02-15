"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── TUS DATOS DE COBRO COMPLETOS (ACTUALIZADOS) ───
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

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const { data } = await supabase.from("orders").select("*").eq("order_id", orderId).single();
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado: " + text);
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
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      await supabase
        .from('orders')
        .update({ status: 'verifying' })
        .eq('order_id', orderId);

      alert("¡Comprobante subido correctamente!");
      window.location.reload();
      
    } catch (error) {
      console.log("Error subida:", error);
      const msg = `Hola! Ya pagué la orden ${orderId} pero no pude subir la foto. Te la paso por acá.`;
      window.open(`https://wa.me/5491123021760?text=${encodeURIComponent(msg)}`, "_blank");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-emerald-500 flex items-center justify-center font-black animate-pulse">Cargando orden...</div>;
  if (!order) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-bold">Orden no encontrada.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-3xl text-black font-bold">✓</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter">¡Orden Generada!</h1>
          <p className="text-zinc-400 text-sm">ID: <span className="text-white font-mono font-bold">#{order.order_id}</span></p>
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="bg-[#111] border border-zinc-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-end border-b border-zinc-800 pb-5 mb-5">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest">Total a Pagar</p>
              <p className="text-3xl font-black text-emerald-400 tracking-tighter">${order.amount_ars?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest">Estado</p>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === 'verifying' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-white'}`}>
                {order.status === 'verifying' ? 'Verificando' : 'Pendiente de Pago'}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-center text-xs font-bold tracking-widest text-zinc-500 italic">
              Datos para realizar el pago
            </h3>

            {/* ─── CASO 1: TRANSFERENCIA ARS ─── */}
            {order.payment_method === 'transfer_ars' && (
              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
                <p className="text-emerald-500 text-xs font-black text-center mb-2">{PAYMENT_CONFIG.brubank.title}</p>
                <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.alias)} className="cursor-pointer group flex justify-between items-center bg-black/50 p-3 rounded-lg border border-transparent hover:border-zinc-700">
                  <span className="text-zinc-500 text-xs font-bold ">Alias</span>
                  <span className="font-mono text-white group-hover:text-emerald-400 transition-colors">{PAYMENT_CONFIG.brubank.alias}</span>
                </div>
                <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.cbu)} className="cursor-pointer group flex justify-between items-center bg-black/50 p-3 rounded-lg border border-transparent hover:border-zinc-700">
                  <span className="text-zinc-500 text-xs font-bold ">CBU</span>
                  <span className="font-mono text-white text-xs md:text-sm group-hover:text-emerald-400 transition-colors break-all">{PAYMENT_CONFIG.brubank.cbu}</span>
                </div>
                <p className="text-[10px] text-zinc-600 text-center font-bold">Titular: {PAYMENT_CONFIG.brubank.holder}</p>
              </div>
            )}

            {/* ─── CASO 2: CRYPTO ─── */}
            {order.payment_method === 'crypto' && (
              <div className="space-y-3">
                {Object.entries(PAYMENT_CONFIG.crypto).map(([key, coin]) => (
                  <div key={key} onClick={() => copyToClipboard(coin.address)} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 cursor-pointer hover:border-emerald-500/50 transition-all group">
                    <div className="flex justify-between mb-1">
                      <span className="text-emerald-500 text-[10px] font-black ">{key.toUpperCase()} ({coin.network})</span>
                      <span className="text-[10px] text-zinc-600 group-hover:text-white">COPIAR</span>
                    </div>
                    <p className="font-mono text-xs text-zinc-300 break-all group-hover:text-white">{coin.address}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ─── CASO 3: DÓLAR INTERNACIONAL (LOCAL + ACH) ─── */}
            {(order.payment_method === 'international_usd' || order.payment_method === 'usd') && (
              <div className="space-y-4">
                {/* Opción Local */}
                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                  <p className="text-emerald-500 text-xs font-black mb-3">{PAYMENT_CONFIG.buenbit_local.title}</p>
                  <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_local.cbu)} className="cursor-pointer mb-2">
                    <p className="text-[10px] text-zinc-500 font-bold ">CBU</p>
                    <p className="font-mono text-sm text-white hover:text-emerald-400">{PAYMENT_CONFIG.buenbit_local.cbu}</p>
                  </div>
                  <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_local.alias)} className="cursor-pointer">
                    <p className="text-[10px] text-zinc-500 font-bold ">Alias</p>
                    <p className="font-mono text-sm text-white hover:text-emerald-400">{PAYMENT_CONFIG.buenbit_local.alias}</p>
                  </div>
                </div>

                {/* Opción ACH USA */}
                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                  <p className="text-emerald-500 text-xs font-black mb-3">{PAYMENT_CONFIG.buenbit_ach.title}</p>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_ach.routing)} className="cursor-pointer">
                      <p className="text-[10px] text-zinc-500 font-bold ">Routing (ACH)</p>
                      <p className="font-mono text-sm text-white hover:text-emerald-400">{PAYMENT_CONFIG.buenbit_ach.routing}</p>
                    </div>
                    <div onClick={() => copyToClipboard(PAYMENT_CONFIG.buenbit_ach.account)} className="cursor-pointer">
                      <p className="text-[10px] text-zinc-500 font-bold ">Account</p>
                      <p className="font-mono text-sm text-white hover:text-emerald-400">{PAYMENT_CONFIG.buenbit_ach.account}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-600 space-y-1">
                    <p>Banco: {PAYMENT_CONFIG.buenbit_ach.bank} ({PAYMENT_CONFIG.buenbit_ach.type})</p>
                    <p>Nombre: {PAYMENT_CONFIG.buenbit_ach.name}</p>
                    <p>Dirección: {PAYMENT_CONFIG.buenbit_ach.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── CASO 4: MERCADO PAGO ─── */}
            {(order.payment_method === 'mercado_pago' || order.payment_method === 'mercadopago') && (
               <div className="text-center space-y-4">
                 <p className="text-sm text-zinc-300">Si no se abrió la app automáticamente, usá este botón:</p>
                 <a href={`https://wa.me/5491123021760?text=Link MP orden ${order.order_id}`} className="block w-full bg-[#009EE3] hover:bg-[#008ED6] text-white font-black py-4 rounded-xl">Pedir Link Manualmente</a>
               </div>
            )}
          </div>
        </div>

        {/* BOTÓN SUBIR COMPROBANTE (Para todos MENOS MP) */}
        {order.payment_method !== 'mercado_pago' && order.payment_method !== 'mercadopago' && order.status !== 'verifying' && (
          <div className="bg-[#111] border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="text-xs font-bold tracking-widest text-zinc-500 mb-4 italic">Ya realicé el pago</h3>
            <label className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
              {uploading ? "Subiendo..." : "Subir Comprobante"}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*,.pdf" />
            </label>
          </div>
        )}
        
        <button onClick={() => window.location.href = '/'} className="w-full text-zinc-600 hover:text-white text-xs font-bold transition-colors py-4">Volver al Inicio</button>
      </div>
    </div>
  );
}
