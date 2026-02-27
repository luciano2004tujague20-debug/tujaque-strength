"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Estados para la edición manual del código de referido
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState("");
  const [savingCode, setSavingCode] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(*)") 
      .eq("order_id", orderId)
      .single();

    if (error) {
        console.error("Error:", error);
    }
    
    if (data) {
        setOrder(data);
        setNewReferralCode(data.referral_code || ""); 
    }
    setLoading(false);
  }

  // --- FUNCIÓN 1: CAMBIAR ESTADO Y PAGAR COMISIONES ---
  async function updateStatus(newStatus: string) {
    if (!confirm(`¿Confirmás cambiar el estado a ${newStatus.toUpperCase()}?`)) return;
    
    setUpdating(true);
    
    try {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("order_id", orderId);

        if (error) throw error;

        // INYECCIÓN DE CRÉDITOS AUTOMÁTICA Y DINÁMICA
        if (newStatus === 'paid' && order.referred_by) {
            
            const montoPagado = Number(order.amount_ars) || 0;
            const COMISION_DINAMICA = Math.round(montoPagado * 0.10); 
            
            const { data: ambassador, error: embError } = await supabase
                .from("orders")
                .select("id, wallet_balance")
                .eq("referral_code", order.referred_by)
                .single();

            if (ambassador && !embError) {
                const currentBalance = Number(ambassador.wallet_balance || 0);
                const newBalance = currentBalance + COMISION_DINAMICA;

                await supabase
                    .from("orders")
                    .update({ wallet_balance: newBalance })
                    .eq("id", ambassador.id);
                
                alert(`✅ Pago aprobado. Se inyectaron $${COMISION_DINAMICA} (10%) a la billetera de ${order.referred_by}.`);
            } else {
                alert(`✅ Pago aprobado (El código ${order.referred_by} no es un alumno, no se pagan comisiones).`);
            }
        } else {
            alert(`✅ Orden actualizada a: ${newStatus.toUpperCase()}`);
        }

        setOrder({ ...order, status: newStatus });
    } catch (err: any) {
        alert("Error crítico al actualizar: " + err.message);
    } finally {
        setUpdating(false);
    }
  }

  // --- FUNCIÓN 2: ELIMINAR ORDEN ---
  async function deleteOrder() {
    const confirmDelete = confirm("⚠️ ¿ESTÁS SEGURO DE ELIMINAR ESTA ORDEN?\n\nEsta acción es irreversible. Se borrarán todos los datos, rutinas y pagos asociados.");
    
    if (!confirmDelete) return;

    setUpdating(true);
    const { error } = await supabase
        .from("orders")
        .delete()
        .eq("order_id", orderId);

    if (error) {
        alert("❌ Error al eliminar: " + error.message);
        setUpdating(false);
    } else {
        alert("🗑️ Orden eliminada correctamente.");
        router.push("/admin/orders"); 
    }
  }

  // Función para guardar el código de referido manualmente
  async function saveReferralCode() {
      if (!newReferralCode.trim()) {
          alert("El código no puede estar vacío.");
          return;
      }
      
      const cleanCode = newReferralCode.trim().toUpperCase();
      setSavingCode(true);

      try {
          const { error } = await supabase
              .from("orders")
              .update({ referral_code: cleanCode })
              .eq("order_id", orderId);

          if (error) throw error;

          setOrder({ ...order, referral_code: cleanCode });
          setIsEditingCode(false);
          alert("✅ Código de referido asignado con éxito.");
      } catch (err: any) {
          alert("Error al guardar el código. ¿Quizás ya existe? Detalles: " + err.message);
      } finally {
          setSavingCode(false);
      }
  }

  // Función para auto-generar un código al azar basado en el nombre
  function autoGenerateCode() {
      if (!order?.customer_name) return;
      const firstName = order.customer_name.split(' ')[0].toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewReferralCode(`${firstName}${randomNum}`);
  }

  const getReceiptUrl = (path: string) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${path}`;
  };

  // ✅ GENERADOR DEL MENSAJE DE WHATSAPP AUTOMÁTICO CORREGIDO Y PROFESIONAL
  const getWhatsAppApprovalLink = () => {
     if (!order?.onboarding_data?.phone) return "#";
     
     const rawPhone = order.onboarding_data.phone;
     // Limpiamos el número (sacamos espacios, guiones, símbolos +)
     let cleanPhone = rawPhone.replace(/\D/g, ''); 
     // Si el número en Argentina arranca con 0, lo sacamos, o si arranca con 15 lo acomodamos (logica básica)
     if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
     if (!cleanPhone.startsWith('54')) cleanPhone = `549${cleanPhone}`; 

     const clientName = order.customer_name.split(' ')[0];
     const planName = order.plans?.name || 'su plan de entrenamiento';
     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tujague.com';

     // Mensaje profesional, educado y sin caracteres que se rompan en la URL
     const message = `Estimado ${clientName},\n\nLe saluda el Head Coach Luciano Tujague.\n\nLe confirmo que su pago ha sido verificado con éxito y su acceso al programa *${planName}* se encuentra activo en nuestra base de datos.\n\nPor favor, ingrese a su Panel de Control y complete su Auditoría Clínica para que pueda iniciar el diseño de su estructura de entrenamiento:\n\n${siteUrl}/login\n\nQuedo a su disposición ante cualquier consulta técnica.`;
     
     return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse uppercase tracking-widest">Cargando Sistema...</div>;
  if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Orden no encontrada.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-8 pb-20 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-6">
                <Link href="/admin/orders" className="bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black w-12 h-12 flex items-center justify-center rounded-xl transition-all font-bold shadow-lg shrink-0">
                    ←
                </Link>
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                        Gestión de <span className="text-emerald-500">Pagos</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                        <p className="text-zinc-500 text-xs font-mono bg-zinc-900 px-2 py-1 rounded">ID: {order.order_id}</p>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                            order.status === 'paid' ? 'bg-emerald-500 text-black' : 
                            order.status === 'rejected' ? 'bg-red-500 text-white' : 
                            'bg-yellow-500 text-black'
                        }`}>
                            {order.status === 'paid' ? 'APROBADO' : order.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
                
                {/* DATOS CLIENTE */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem]">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            👤 Datos Personales
                        </h3>
                        
                        {/* BOTÓN RÁPIDO DE WHATSAPP PARA COMUNICACIÓN DIRECTA */}
                        {order.onboarding_data?.phone && (
                            <a 
                                href={`https://wa.me/${order.onboarding_data.phone.replace(/\D/g, '')}?text=Estimado%20${order.customer_name.split(' ')[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                                Escribir a Cliente
                            </a>
                        )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Nombre Completo</p>
                            <p className="text-xl font-bold text-white capitalize">{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Email (Acceso)</p>
                            <p className="text-sm font-mono text-zinc-300">{order.customer_email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Instagram</p>
                            <p className="text-sm font-bold text-white">{order.customer_instagram || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Contraseña</p>
                            <p className="text-sm font-mono text-zinc-400 bg-black/50 p-2 rounded inline-block">
                                {order.password || 'No asignada'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PANEL DE REFERIDOS (BII-AFFILIATES) */}
                <div className="bg-gradient-to-r from-emerald-950/30 to-black border border-emerald-900/50 p-8 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                    <h3 className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                        🤝 BII-Affiliates (Programa de Referidos)
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 relative z-10">
                        <div className="bg-black/60 p-4 rounded-xl border border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Código Propio</p>
                                {!isEditingCode && (
                                    <button onClick={() => setIsEditingCode(true)} className="text-[9px] text-emerald-500 hover:text-emerald-400 font-bold uppercase underline">
                                        Editar
                                    </button>
                                )}
                            </div>
                            
                            {isEditingCode ? (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={newReferralCode} 
                                            onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                                            placeholder="Ej: MARCOS20"
                                            className="w-full bg-zinc-900 border border-zinc-700 text-white font-mono text-sm p-2 rounded outline-none focus:border-emerald-500"
                                        />
                                        <button onClick={autoGenerateCode} className="text-xl" title="Generar Automático">🎲</button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveReferralCode} disabled={savingCode} className="flex-1 bg-emerald-500 text-black text-[9px] font-black uppercase py-2 rounded hover:bg-emerald-400">
                                            {savingCode ? '...' : 'Guardar'}
                                        </button>
                                        <button onClick={() => setIsEditingCode(false)} className="flex-1 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase py-2 rounded hover:text-white">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className={`text-lg font-mono font-black ${order.referral_code ? 'text-white' : 'text-zinc-600'}`}>
                                        {order.referral_code || 'SIN ASIGNAR'}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 font-bold mt-1">Se lo pasa a sus amigos</p>
                                </>
                            )}
                        </div>
                        
                        <div className="bg-black/60 p-4 rounded-xl border border-zinc-800">
                            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-2">Vino Referido Por</p>
                            <p className="text-sm font-mono font-bold text-orange-400 mt-1">{order.referred_by || 'ORGÁNICO (Nadie)'}</p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 shadow-inner">
                            <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mb-2">Billetera Virtual</p>
                            <p className="text-2xl font-black italic text-emerald-400 tracking-tighter">${Number(order.wallet_balance || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-500/60 font-bold mt-1 uppercase">Créditos ganados</p>
                        </div>
                    </div>
                </div>

                {/* FICHA TÉCNICA RÁPIDA (SOLO LECTURA) */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                    <h3 className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        📋 Resumen de Onboarding
                    </h3>
                    
                    {order.onboarding_data ? (
                        <div className="grid md:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">WhatsApp</p>
                                <a 
                                  href={`https://wa.me/${order.onboarding_data.phone?.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                >
                                  {order.onboarding_data.phone || '-'} ↗
                                </a>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Objetivo Principal</p>
                                <p className="text-white capitalize font-medium">{order.onboarding_data.goal || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Lesiones / Dolores</p>
                                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                                    <p className="text-sm text-zinc-200 font-medium">
                                        {order.onboarding_data.injuries || 'Ninguna declarada.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm italic">Este usuario no completó la ficha de onboarding.</p>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
                
                {/* ACCIONES FINANCIERAS */}
                <div className="bg-black border border-zinc-800 p-8 rounded-[2rem]">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-6">Administración</h3>
                    
                    <div className="mb-8">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Plan Seleccionado</p>
                        <p className="text-base font-bold text-white mb-4">{order.plans?.name || 'Plan Personalizado'}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Monto a Cobrar</p>
                        <p className="text-4xl font-black italic text-emerald-400">
                            ${Number(order.amount_ars).toLocaleString()} <span className="text-sm text-zinc-500 not-italic">ARS</span>
                        </p>
                        {order.referred_by && (
                           <p className="text-[10px] text-orange-400 font-bold uppercase mt-2">
                              (Precio incluye descuento por referido)
                           </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 mb-8">
                        <button 
                            onClick={() => updateStatus('paid')}
                            disabled={updating || order.status === 'paid'}
                            className={`py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                                order.status === 'paid' 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed' 
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02]'
                            }`}
                        >
                            {order.status === 'paid' ? '✓ Pago Aprobado' : '✅ Aprobar Pago'}
                        </button>
                        
                        <button 
                            onClick={() => updateStatus('rejected')}
                            disabled={updating || order.status === 'rejected'}
                            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
                        >
                            🚫 Rechazar
                        </button>
                    </div>

                    {/* BOTÓN DE ONBOARDING POR WHATSAPP (Solo se muestra si la orden está aprobada y el cliente dejó su número) */}
                    {order.status === 'paid' && order.onboarding_data?.phone && (
                        <div className="border-t border-zinc-800 pt-6 mb-8">
                            <a 
                                href={getWhatsAppApprovalLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] animate-pulse"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                                Avisar Aprobación (WhatsApp)
                            </a>
                        </div>
                    )}

                    <div className="border-t border-zinc-800 pt-6">
                        <button 
                            onClick={deleteOrder}
                            disabled={updating}
                            className="w-full bg-red-900/20 hover:bg-red-600 hover:text-white text-red-500 border border-red-900/40 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                        >
                            🗑️ Eliminar Orden Definitivamente
                        </button>
                    </div>
                </div>

                {/* COMPROBANTE ADJUNTO */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] flex flex-col">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-6 text-center">
                        Comprobante de Transferencia
                    </h3>
                    
                    <div className="bg-black rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden relative min-h-[300px]">
                        {order.receipt_url ? (
                            <>
                                <img 
                                    src={getReceiptUrl(order.receipt_url)!}
                                    alt="Comprobante de pago" 
                                    className="object-contain w-full h-full absolute inset-0"
                                />
                                <a 
                                    href={getReceiptUrl(order.receipt_url)!} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all"
                                >
                                    🔍 Ver Original
                                </a>
                            </>
                        ) : (
                            <div className="text-center p-6 opacity-50">
                                <span className="text-6xl block mb-4">📄</span>
                                <p className="text-sm font-bold text-zinc-400 uppercase">Sin comprobante subido</p>
                                <p className="text-[10px] text-zinc-600 mt-2">El cliente no subió foto todavía</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
}