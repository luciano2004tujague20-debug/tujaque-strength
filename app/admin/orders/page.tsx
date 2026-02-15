"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/`;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  // --- 1. APROBAR ORDEN (LÓGICA CORRECTA DE 3 NIVELES) ---
  const approveOrder = async (order: any) => {
    setProcessingId(order.id);
    
    // Validar en Base de Datos
    const { error } = await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);

    if (!error) {
      // Calcular vencimiento
      const isWeekly = order.plan_title.toLowerCase().includes("semanal");
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + (isWeekly ? 7 : 30));
      const expirationISO = expiration.toISOString().split('T')[0];

      // Crear/Actualizar Atleta
      await supabase.from("athletes").upsert({ 
        email: order.customer_email,
        full_name: order.customer_name,
        phone: order.customer_phone,
        plan_title: order.plan_title,
        expiration_date: expirationISO,
        status: 'active'
      }, { onConflict: 'email' });

      // --- LÓGICA DE WHATSAPP ---
      const cleanPhone = order.customer_phone?.replace(/\D/g, '') || "";
      const formattedDate = new Date(expirationISO).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      
      let detalle = "";
      const planName = order.plan_title || "";
      const isMensual = planName.toLowerCase().includes("mensual");

      if (isMensual) {
         // DEFINICIÓN DE AHORROS POR NIVEL
         let ahorro = "";
         let cuota = "";

         if (planName.includes("7 Días")) {
            ahorro = "$37.000"; 
            cuota = "$28.750";
         } else if (planName.includes("5-6")) {
            ahorro = "$28.000"; 
            cuota = "$25.000";
         } else {
            // Asumimos 3-4 Días (Fuerza Base)
            ahorro = "$27.000"; 
            cuota = "$21.250";
         }
         
         detalle = `\n\n🎁 *BENEFICIO POR PAGO MENSUAL:*\n• Tu semana bonificada quedó en: *$${cuota}*\n• Ahorro total por pago adelantado: *$${ahorro}*`;
      } else {
         // DEFINICIÓN DE PRECIO SEMANAL POR NIVEL
         let inversion = "";
         if (planName.includes("7 Días")) {
            inversion = "$38.000";
         } else if (planName.includes("5-6")) {
            inversion = "$32.000";
         } else {
            // Asumimos 3-4 Días
            inversion = "$28.000";
         }
         detalle = `\n\n📊 *DETALLE DE TU PLAN SEMANAL:*\n• Inversión de esta semana: *$${inversion}*\n• Este acceso es por 7 días corridos.`;
      }

      const message = `¡HOLA ${order.customer_name.toUpperCase()}! BIENVENIDO A TUJAQUE STRENGTH 🦾🦍\n\nTu pago del plan *${order.plan_title}* fue validado con éxito.${detalle}\n\n📍 *Dashboard:* https://tujaque-strength.vercel.app/dashboard\n📅 *Vencimiento de acceso:* ${formattedDate}\n\n⚠️ *IMPORTANTE:* Luciano dispone de hasta **48 horas hábiles** para cargar tu planificación personalizada en el Dashboard. ¡A darle con todo! 🔥`;
      
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      
      // Actualizar tabla visualmente
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "paid" } : o));
    }
    setProcessingId(null);
  };

  // --- 2. RECHAZAR ORDEN ---
  const rejectOrder = async (id: string, phone: string) => {
    if (!confirm("¿Seguro querés RECHAZAR este pago?")) return;
    setProcessingId(id);
    
    await supabase.from("orders").update({ status: "rejected" }).eq("id", id);
    
    const cleanPhone = phone?.replace(/\D/g, '') || "";
    const message = `Hola! Hubo un problema con tu comprobante de pago en Tujaque Strength ⚠️.\n\nPor favor, revisalo y volvé a subirlo o avisame por acá para solucionarlo.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "rejected" } : o));
    setProcessingId(null);
  };

  // --- 3. ELIMINAR ORDEN ---
  const deleteOrder = async (id: string) => {
    if (!confirm("¿Borrar esta orden permanentemente? No se puede deshacer.")) return;
    setProcessingId(id);
    
    await supabase.from("orders").delete().eq("id", id);
    
    setOrders(prev => prev.filter(o => o.id !== id));
    setProcessingId(null);
  };

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black italic animate-pulse">Sincronizando Ventas...</div>;

  return (
    <div className="animate-fade-in pb-20 px-4">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          Control de <span className="text-emerald-400">Ventas</span>
        </h1>
      </header>

      {/* AQUÍ ESTÁ EL FIX VISUAL: min-w-[1000px] para scroll horizontal */}
      <div className="admin-glass-card overflow-x-auto border border-white/5 rounded-[2rem] bg-black/20 backdrop-blur-md">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="border-b border-white/10 text-[9px] text-emerald-400 font-black tracking-[0.2em] uppercase">
              <th className="py-6 px-6 whitespace-nowrap">Fecha / Cliente</th>
              <th className="py-6 px-6 whitespace-nowrap">Plan</th>
              <th className="py-6 px-6 text-center whitespace-nowrap">Ticket</th>
              <th className="py-6 px-6 text-center whitespace-nowrap">Acciones</th>
              <th className="py-6 px-6 text-right whitespace-nowrap">Monto</th>
            </tr>
          </thead>
          <tbody className="text-sm text-white divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                {/* COLUMNA 1: CLIENTE */}
                <td className="py-6 px-6 whitespace-nowrap">
                  <p className="font-black text-lg italic">{order.customer_name}</p>
                  <p className="text-[10px] text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </td>
                
                {/* COLUMNA 2: PLAN */}
                <td className="py-6 px-6 whitespace-nowrap">
                   <span className="font-black italic text-[10px] text-white uppercase tracking-wider bg-zinc-800/50 px-3 py-1 rounded-lg border border-white/5">
                    {order.plan_title}
                  </span>
                </td>

                {/* COLUMNA 3: TICKET */}
                <td className="py-6 px-6 text-center whitespace-nowrap">
                  <a href={order.receipt_url ? (order.receipt_url.startsWith('http') ? order.receipt_url : `${storageUrl}${order.receipt_url}`) : '#'} target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-emerald-500 px-3 py-2 rounded-lg text-[9px] font-black border border-white/10 hover:text-black uppercase italic transition-all">
                    Ver Foto 📄
                  </a>
                </td>

                {/* COLUMNA 4: ACCIONES */}
                <td className="py-6 px-6 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2 items-center">
                    {order.status === "paid" ? (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20 italic tracking-widest uppercase">
                        ● Aprobado
                      </span>
                    ) : (
                      <>
                        <button onClick={() => approveOrder(order)} disabled={processingId === order.id} className="bg-emerald-500 hover:bg-emerald-400 text-black p-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20" title="Validar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </button>

                        <button onClick={() => rejectOrder(order.id, order.customer_phone)} disabled={processingId === order.id} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl border border-red-500/20 transition-all" title="Rechazar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </>
                    )}

                    <button onClick={() => deleteOrder(order.id)} disabled={processingId === order.id} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white p-2 rounded-xl transition-all ml-2" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  
                  {order.status === "rejected" && (
                    <p className="text-[8px] text-red-500 font-black uppercase mt-2 tracking-widest">Rechazado</p>
                  )}
                </td>

                {/* COLUMNA 5: MONTO */}
                <td className="py-6 px-6 text-right font-mono font-black text-emerald-400 text-lg italic tracking-tighter whitespace-nowrap">
                  ${(order.amount_ars || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}