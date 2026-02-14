"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicializamos cliente rápido para subir la foto (usando tus variables públicas)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PaymentInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 1. Cargar la orden al entrar
  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, plans(name)")
        .eq("order_id", params.orderId)
        .single();

      if (error) {
        alert("Orden no encontrada");
        return;
      }
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [params.orderId]);

  // 2. Función para subir el comprobante
  const handlePaymentReport = async () => {
    if (!file) return alert("Por favor, adjuntá el comprobante.");
    setUploading(true);

    try {
      // A. Subir imagen al Bucket 'receipts'
      const fileExt = file.name.split(".").pop();
      const fileName = `${params.orderId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // B. Obtener URL pública (opcional, o guardar path)
      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      // C. Guardar referencia en tabla 'receipts' (o actualizar orden)
      // Para simplificar, actualizamos la orden con una nota o estado
      // Lo ideal es tener una tabla 'receipts', pero aquí actualizamos metadata
      
      // Vamos a crear un registro en una tabla simple de recibos si tenés, 
      // o simplemente avisar que se subió. Asumimos que tenés tabla 'receipts' 
      // O vamos a actualizar el estado a "reviewing"
      
       await supabase.from("receipts").insert({
         order_id: order.id,
         file_path: publicUrl,
         original_name: file.name
       });

      alert("¡Comprobante enviado! Te avisaremos cuando se apruebe.");
      router.push("/"); // Volver al inicio o a una página de 'Gracias'
    } catch (error: any) {
      console.error(error);
      alert("Error subiendo el archivo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-white text-center p-10">Cargando datos...</div>;

  // 3. Renderizar los datos según el método
  const renderInstructions = () => {
    switch (order.payment_method) {
      case "transfer_ars":
        return (
          <div className="bg-[#111] p-6 rounded-xl border border-emerald-500/30">
            <h3 className="text-emerald-400 font-bold mb-4 uppercase text-sm tracking-wider">Datos Bancarios (ARS)</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p><span className="text-gray-500 block text-xs">Banco:</span> BRUBANK</p>
              <p><span className="text-gray-500 block text-xs">Titular:</span> LUCIANO NICOLAS TUJAGUE</p>
              <div className="bg-black p-3 rounded border border-gray-800 flex justify-between items-center">
                <div>
                  <span className="text-gray-500 block text-xs">CBU:</span>
                  <span className="font-mono text-white select-all">0000003100000000000000</span> 
                  {/* ↑ REEMPLAZAR CON TU CBU REAL */}
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-gray-800 flex justify-between items-center">
                <div>
                  <span className="text-gray-500 block text-xs">Alias:</span>
                  <span className="font-bold text-white select-all">TUJAQUE.STRENGTH.MP</span> 
                  {/* ↑ REEMPLAZAR CON TU ALIAS REAL */}
                </div>
              </div>
            </div>
          </div>
        );

      case "crypto":
        return (
          <div className="bg-[#111] p-6 rounded-xl border border-emerald-500/30">
            <h3 className="text-emerald-400 font-bold mb-4 uppercase text-sm tracking-wider">Datos Crypto (USDT)</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded text-xs text-center">
                ⚠️ Enviar solo por la red <strong>TRC20 (Tron)</strong>
              </div>
              <div className="bg-black p-3 rounded border border-gray-800">
                <span className="text-gray-500 block text-xs mb-1">Dirección USDT (TRC20):</span>
                <p className="font-mono text-xs text-white break-all select-all">
                  TXjxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                  {/* ↑ REEMPLAZAR CON TU ADDRESS DE BINANCE/WALLET */}
                </p>
              </div>
            </div>
          </div>
        );

      case "international_usd":
        return (
          <div className="bg-[#111] p-6 rounded-xl border border-emerald-500/30">
            <h3 className="text-emerald-400 font-bold mb-4 uppercase text-sm tracking-wider">Pago Internacional (USD)</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>Podés pagar vía <strong>PayPal</strong> o <strong>Zelle</strong>.</p>
              <div className="bg-black p-3 rounded border border-gray-800">
                <span className="text-gray-500 block text-xs">Email / Usuario:</span>
                <span className="font-bold text-white select-all">pagos@tujaque.com</span>
                {/* ↑ REEMPLAZAR CON TU EMAIL DE PAYPAL */}
              </div>
            </div>
          </div>
        );

      default:
        return <p>Método no reconocido.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center mt-10">
          <div className="inline-block p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-4 text-3xl">
            🏦
          </div>
          <h1 className="text-2xl font-bold">Instrucciones de Pago</h1>
          <p className="text-gray-400 text-sm mt-2">
            Orden #{order.order_id} • Total: <span className="text-emerald-400 font-bold">${order.amount_ars?.toLocaleString()}</span>
          </p>
        </div>

        {/* Dynamic Instructions */}
        {renderInstructions()}

        {/* Upload Section */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Confirmar Pago</h3>
          <p className="text-xs text-gray-500 mb-4">
            Una vez realizada la transferencia, subí una captura del comprobante aquí para que aprobemos tu plan.
          </p>
          
          <input 
            type="file" 
            accept="image/*, application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 mb-4"
          />

          <button
            onClick={handlePaymentReport}
            disabled={uploading || !file}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
          >
            {uploading ? "Subiendo..." : "Enviar Comprobante"}
          </button>
        </div>

      </div>
    </div>
  );
}