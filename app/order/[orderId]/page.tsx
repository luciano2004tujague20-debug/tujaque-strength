"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// ✅ USAMOS EL CLIENTE CENTRALIZADO (Paso 2)
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
  buenbit_ach: {
    title: "Dólar USD (ACH USA)",
    routing: "101019644",
    account: "218050863270",
    bank: "Lead Bank",
    name: "LUCIANO NICOLAS TUJAGUE",
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
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      // ✅ BÚSQUEDA ROBUSTA: Traemos la orden y los datos del plan vinculados
      // Esto funciona gracias al SQL que creamos para la Foreign Key
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
        // Si el estado es verificando o pagado, mostramos pantalla de éxito
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

    try {
      // Subida al Storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Actualizamos la orden en la base de datos
      await supabase
        .from('orders')
        .update({ status: 'verifying', receipt_url: fileName })
        .eq("order_id", orderId);

      setDone(true);
      
    } catch (error) {
      // Fallback a WhatsApp si falla la subida
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
      <div className="max-w-3xl w-full space-y-6">
        
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
            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8 shadow-2xl text-center">
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-2">Monto exacto a enviar</p>
              <p className="text-4xl font-black text-emerald-400 tracking-tighter italic">
                {getConvertedAmount()}
              </p>
              <p className="text-[10px] text-zinc-600 mt-4 font-bold uppercase tracking-widest italic opacity-50">
                Plan: {order.plans?.name || 'Cargando...'}
              </p>
            </div>

            {/* DATOS DE CUENTA */}
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
              {/* Aquí se pueden añadir bloques similares para crypto y usd */}
            </div>

            {/* BOTÓN SUBIR COMPROBANTE */}
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
          /* PANTALLA DE ÉXITO */
          <div className="p-10 text-center border border-emerald-500/20 bg-emerald-500/[0.02] rounded-[3rem]">
            <h2 className="text-3xl font-black italic mb-6 uppercase tracking-tighter">Protocolo <span className="text-emerald-400">Iniciado</span></h2>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] mb-8">
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3 italic">Aviso de Entrega</p>
              <p className="text-sm text-zinc-200 italic leading-relaxed font-medium">
                Tu ticket ha sido enviado correctamente. Recordá que el armado de tu planificación tiene una demora de hasta **48 horas hábiles**.
              </p>
            </div>
            <button onClick={() => window.location.href = '/'} className="text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-white transition-colors underline decoration-zinc-800 underline-offset-4">Volver al Inicio</button>
          </div>
        )}
      </div>
    </div>
  );
}