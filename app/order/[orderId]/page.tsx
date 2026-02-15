"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DATOS DE PAGO
const PAYMENT_CONFIG = {
  brubank: {
    alias: "lucianotujague",
    cbu: "1430001713041213360019",
    holder: "Luciano Nicolas Tujague"
  },
  crypto: {
    usdt: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf"
  }
};

export default function OrderStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const orderId = params.orderId as string; 
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Buscar la orden en Supabase al cargar
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      console.log("Buscando orden:", orderId);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error) {
        console.error("Error buscando orden:", error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado: " + text);
  };

  if (loading) return <div className="min-h-screen bg-black text-emerald-500 flex items-center justify-center font-black animate-pulse">CARGANDO PEDIDO...</div>;

  if (!order) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-bold">No se encontró el pedido #{orderId}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans flex justify-center">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* ENCABEZADO DE ÉXITO */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">¡Pedido Generado!</h1>
          <p className="text-zinc-400">Tu orden <span className="text-white font-mono font-bold">#{order.order_id}</span> está pendiente de pago.</p>
        </div>

        {/* TARJETA DE RESUMEN */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-end border-b border-zinc-800 pb-6 mb-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase">Total a Pagar</p>
              {/* ACÁ LEEMOS LA COLUMNA CORRECTA 'amount_ars' */}
              <p className="text-4xl font-black text-emerald-400 tracking-tighter">${order.amount_ars?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-500 uppercase">Cliente</p>
              <p className="font-bold">{order.customer_name}</p>
            </div>
          </div>

          {/* ZONA DE PAGO */}
          <div className="space-y-6">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-zinc-500">Instrucciones de Pago</h3>

            {/* MERCADO PAGO */}
            {order.payment_method === 'mercadopago' && (
              <div className="text-center space-y-4">
                <p className="text-zinc-300">Para completar tu pago con tarjeta o dinero en cuenta, contactanos para enviarte el link de pago personalizado.</p>
                <a 
                  href={`https://wa.me/5491123021760?text=Hola! Quiero pagar mi orden ${order.order_id} de $${order.amount_ars} con Mercado Pago.`}
                  target="_blank"
                  className="block w-full bg-[#009EE3] hover:bg-[#008ED6] text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all"
                >
                  Solicitar Link de MP
                </a>
              </div>
            )}

            {/* TRANSFERENCIA */}
            {(order.payment_method === 'transferencia' || order.payment_method === 'ars') && (
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.cbu)}>
                  <span className="text-zinc-500 text-xs font-bold uppercase">CBU (Tocar para copiar)</span>
                  <span className="font-mono text-emerald-400 text-sm group-hover:text-white transition-colors">{PAYMENT_CONFIG.brubank.cbu}</span>
                </div>
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.alias)}>
                  <span className="text-zinc-500 text-xs font-bold uppercase">Alias</span>
                  <span className="font-mono text-white text-sm group-hover:text-emerald-400 transition-colors">{PAYMENT_CONFIG.brubank.alias}</span>
                </div>
                <div className="pt-4 border-t border-zinc-800 text-center">
                  <a 
                    href={`https://wa.me/5491123021760?text=Hola! Ya transferí por la orden ${order.order_id}.`}
                    target="_blank"
                    className="inline-block text-emerald-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Enviar Comprobante por WhatsApp →
                  </a>
                </div>
              </div>
            )}

            {/* CRYPTO */}
            {order.payment_method === 'crypto' && (
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4 text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase">USDT (Red Tron / TRC20)</p>
                <div 
                  onClick={() => copyToClipboard(PAYMENT_CONFIG.crypto.usdt)}
                  className="bg-black border border-emerald-900/30 p-4 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors break-all"
                >
                  <p className="font-mono text-xs text-emerald-400">{PAYMENT_CONFIG.crypto.usdt}</p>
                </div>
                <p className="text-[10px] text-zinc-600">Tocá la dirección para copiar</p>
              </div>
            )}

          </div>
        </div>

        <button 
          onClick={() => window.location.href = '/'}
          className="w-full text-zinc-500 text-xs font-bold uppercase hover:text-white transition-colors"
        >
          Volver al Inicio
        </button>

      </div>
    </div>
  );
}