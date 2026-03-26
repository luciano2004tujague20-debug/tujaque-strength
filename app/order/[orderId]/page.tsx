// app/order/[orderId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const TASAS = { dolar: 1200, btc: 85000000 };

const PAYMENT_CONFIG = {
  brubank: { title: "Brubank (Pesos ARS)", alias: "lucianotujague", cbu: "1430001713041213360019", holder: "Luciano Nicolas Tujague" },
  buenbit_local: { title: "Transferencia Local (USD)", bank: "Banco Industrial", cbu: "3220001812006401160021", alias: "BUENBIT.USD" },
  buenbit_ach: { title: "Dólar ACH (USA / Exterior)", routing: "101019644", account: "218050863270", bank: "Lead Bank", name: "LUCIANO NICOLAS TUJAGUE", address: "1801 Main St. Kansas City, MO 64108", type: "Checking" },
  crypto: {
    USDT: { address: "TUDciWxCLPZMGvCTAoHLUbUe2KLeDtdbgf", network: "TRC20 (Red Tron)" },
    USDC: { address: "0x099455826F2196607244A7102D5466Eb45413F15", network: "ERC20 / BSC (BEP20) / Polygon" },
    BTC: { address: "bc1q3w48qpn0xdtcy4fe370n3xsmk4hreve05nt8ek", network: "Bitcoin (Native SegWit)" }
  }
};

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter(); 
  const orderId = params.orderId as string; 
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [cryptoCoin, setCryptoCoin] = useState<"USDT" | "USDC" | "BTC">("USDT");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const { data, error } = await supabase.from("orders").select("*, plans(*)").eq("order_id", orderId).maybeSingle();
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
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      await supabase.from('orders').update({ status: 'verifying', receipt_url: fileName }).eq("order_id", orderId);
      setDone(true);
      
    } catch (error) {
      const msg = `Hola! Ya pagué la orden ${orderId} pero falló la subida automática. Te paso el comprobante.`;
      window.open(`https://wa.me/5491123021760?text=${encodeURIComponent(msg)}`, "_blank");
    } finally {
      setUploading(false);
    }
  };

  // GENERADOR DEL MENSAJE FORMAL PARA EL CLIENTE HACIA EL COACH
const getClientWhatsAppLink = () => {
      if (!order) return "#";
      const clientName = order.customer_name ? order.customer_name.split(' ')[0] : 'Atleta';
      const planName = order.plans?.name || 'su programa de entrenamiento';
      
      const message = `Estimado Coach Luciano.\n\nLe saluda ${clientName}.\nAcabo de finalizar la transferencia para el ingreso a ${planName} (ID de Orden: ${order.order_id}).\n\nMi correo de acceso a la plataforma es: ${order.customer_email}\n\nVoy a descargar la App Oficial para aguardar la verificación administrativa y dar inicio al protocolo.\n\nQuedo a su disposición.`;
      
      return `https://wa.me/5491123021760?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="min-h-screen bg-black text-emerald-500 flex items-center justify-center font-black italic animate-pulse uppercase tracking-tighter">Sincronizando Protocolo...</div>;
  if (!order) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4"><div className="text-red-500 font-black italic text-xl uppercase tracking-tighter">Orden no encontrada</div></div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans flex justify-center items-start pt-12 md:pt-24">
      <div className="max-w-3xl w-full space-y-6 relative z-10">
        
        {!done ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all bg-zinc-800">
                <span className="text-4xl font-bold text-zinc-600">!</span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase mt-4">Confirmar Pago</h1>
              <p className="text-zinc-500 text-xs font-mono tracking-widest">ORDEN #{order.order_id}</p>
            </div>

            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none"></div>
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-2">Monto exacto a enviar</p>
              <p className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tighter italic transition-all">{getConvertedAmount()}</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-center text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic border-b border-zinc-800 pb-2">Instrucciones de Pago</h3>

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
                </div>
              )}

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

            <div className="pt-10">
              <label className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-[2rem] tracking-[0.2em] text-xs uppercase transition-all cursor-pointer shadow-[0_10px_30px_rgba(16,185,129,0.2)] text-center active:scale-95">
                {uploading ? "PROCESANDO..." : "SUBIR COMPROBANTE 📄"}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*,.pdf" />
              </label>
              <p className="text-[10px] text-zinc-600 text-center mt-6 italic font-bold">
                Una vez enviado, recibirá sus credenciales de acceso.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <span className="text-4xl font-black text-black">✓</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-white">
               RECEPCIÓN <span className="text-emerald-500">CONFIRMADA</span>
            </h2>
            <p className="text-zinc-400 font-medium text-sm md:text-base max-w-lg mx-auto mb-10">
               Su comprobante ha sido registrado en la base de datos de Tujague Strength bajo el código de seguimiento <span className="text-white font-mono">#{order.order_id}</span>.
            </p>

            <div className="bg-black/60 border border-zinc-700/50 p-8 rounded-3xl max-w-md mx-auto mb-10 relative z-10 text-left">
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4 border-b border-zinc-800 pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sus Credenciales de Acceso
                </p>
                <div className="space-y-4">
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Usuario (Email)</p>
                        <p className="text-lg font-mono font-black text-white">{order.customer_email}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Contraseña</p>
                        <p className="text-sm font-mono font-bold text-zinc-400">La clave que ingresó en el formulario.</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800">
                    <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest">
                        ⚠️ Por favor, tome una captura de pantalla de esta información antes de continuar.
                    </p>
                </div>
            </div>

            <div className="max-w-md mx-auto space-y-4 relative z-10">
                <a 
                   href={getClientWhatsAppLink()}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black py-5 rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,211,102,0.3)] hover:-translate-y-1 active:scale-95"
                >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                   NOTIFICAR PAGO AL COACH
                </a>
<button 
                   onClick={() => router.push('/exito')} 
                   className="w-full bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all"
                >
                   Continuar para Descargar la App ➔
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}