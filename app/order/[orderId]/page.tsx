"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PAYMENT_CONFIG = {
  brubank: { alias: "lucianotujague", cbu: "1430001713041213360019" },
  crypto: { usdt: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf" }
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

      alert("¡Comprobante subido! Ahora notificamos al admin.");
      window.location.reload();
    } catch (error) {
      console.log("Error subida (Bucket receipts puede no existir):", error);
      alert("No se pudo subir la imagen directo (verificá tu conexión). Pero avisamos por WhatsApp.");
    } finally {
      const msg = `Hola! Ya subí el comprobante de la orden ${orderId}. Revisalo por favor.`;
      window.open(`https://wa.me/5491123021760?text=${msg}`, "_blank");
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-emerald-500 flex items-center justify-center font-black animate-pulse">CARGANDO PEDIDO...</div>;
  if (!order) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-bold">Orden no encontrada.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans flex justify-center">
      <div className="max-w-2xl w-full space-y-8">
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Orden Generada</h1>
          <p className="text-zinc-400">Orden <span className="text-white font-mono font-bold">#{order.order_id}</span> pendiente de pago.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-end border-b border-zinc-800 pb-6 mb-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase">Total a Pagar</p>
              <p className="text-4xl font-black text-emerald-400 tracking-tighter">${order.amount_ars?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-500 uppercase">Método</p>
              {/* Mostramos el método bonito en pantalla */}
              <p className="font-bold uppercase text-emerald-500">
                {order.payment_method === 'mercado_pago' ? 'Mercado Pago' : 
                 order.payment_method === 'transfer_ars' ? 'Transferencia' : 
                 order.payment_method === 'crypto' ? 'Cripto' : order.payment_method}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-zinc-500">
              {order.status === 'verifying' ? "Comprobante Enviado - Verificando..." : "Realizá el pago y subí el comprobante"}
            </h3>

            {/* SI NO ES MERCADO PAGO, MOSTRAMOS DATOS DE TRANSFERENCIA/CRYPTO */}
            {order.payment_method !== 'mercado_pago' && (
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
                {order.payment_method === 'crypto' ? (
                  <div onClick={() => copyToClipboard(PAYMENT_CONFIG.crypto.usdt)} className="cursor-pointer break-all">
                    <p className="text-zinc-500 text-xs font-bold uppercase">USDT (TRC20)</p>
                    <p className="font-mono text-emerald-400 text-sm">{PAYMENT_CONFIG.crypto.usdt}</p>
                  </div>
                ) : (
                  <>
                    <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.cbu)} className="cursor-pointer">
                      <p className="text-zinc-500 text-xs font-bold uppercase">CBU</p>
                      <p className="font-mono text-white text-lg">{PAYMENT_CONFIG.brubank.cbu}</p>
                    </div>
                    <div onClick={() => copyToClipboard(PAYMENT_CONFIG.brubank.alias)} className="cursor-pointer">
                      <p className="text-zinc-500 text-xs font-bold uppercase">Alias</p>
                      <p className="font-mono text-white text-lg">{PAYMENT_CONFIG.brubank.alias}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* BOTÓN DE SUBIDA */}
            {order.payment_method !== 'mercado_pago' && order.status !== 'verifying' && (
              <div className="pt-4 border-t border-zinc-800">
                <label className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all text-center cursor-pointer">
                  {uploading ? "Subiendo..." : "Subir Comprobante / Informar Pago"}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
                <p className="text-[10px] text-zinc-500 text-center mt-2">Se notificará al administrador automáticamente.</p>
              </div>
            )}

            {/* BOTÓN DE MERCADO PAGO */}
            {order.payment_method === 'mercado_pago' && (
               <a href={`https://wa.me/5491123021760?text=Hola! Link de MP para orden ${order.order_id}`} className="block w-full bg-[#009EE3] text-white font-bold py-3 rounded-xl text-center">Solicitar Link MP</a>
            )}
          </div>
        </div>
        
        <button onClick={() => window.location.href = '/'} className="w-full text-zinc-500 text-xs font-bold uppercase hover:text-white">Volver al Inicio</button>
      </div>
    </div>
  );
}