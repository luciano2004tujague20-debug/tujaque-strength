"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // MÉTRICAS CRM
  const [activeCount, setActiveCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [fatigueAlerts, setFatigueAlerts] = useState<any[]>([]);
  
  // ESTADOS DEL MODAL NUEVO ATLETA
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: "", email: "", password: "", planCode: ""
  });

  // 🤖 ESTADO DEL RADAR IA (RÁPIDO)
  const [radarReport, setRadarReport] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(false);

  // 🚁 ESTADOS DEL REPORTE DOMINICAL (PROFUNDO) -> RESTAURADO AL 100%
  const [showBoardReport, setShowBoardReport] = useState(false);
  const [boardReportContent, setBoardReportContent] = useState<string | null>(null);
  const [generatingBoardReport, setGeneratingBoardReport] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });

    const { data: plansData } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (ordersData) {
        setOrders(ordersData);
        calculateCRM(ordersData);
        runRadarAnalysis(ordersData);
    }
    
    if (plansData) {
        setPlans(plansData);
        if (plansData.length > 0) {
            setNewAthlete(prev => ({ ...prev, planCode: plansData[0].code }));
        }
    }
    setLoading(false);
  }

  // ✅ LÓGICA CRM EXTREMA: Retención, Carritos y Fatiga
  const calculateCRM = (allOrders: any[]) => {
      let actives = 0;
      let expiring: any[] = [];
      let abandoned: any[] = [];
      let fatigued: any[] = [];
      const today = new Date();

      allOrders.forEach(o => {
          if (o.status === 'paid' && o.sub_status === 'active') {
              actives++;
              if (o.expires_at) {
                  const expDate = new Date(o.expires_at);
                  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (diffDays <= 5 && diffDays >= 0) {
                      expiring.push({ ...o, daysLeft: diffDays });
                  }
              }
              
              if (o.checkin_history && o.checkin_history.length > 0) {
                  const lastCheckin = o.checkin_history[o.checkin_history.length - 1];
                  if (Number(lastCheckin.stress) >= 8 || Number(lastCheckin.sleep) <= 5) {
                      fatigued.push(o);
                  }
              }
          }

          if (o.status === 'awaiting_payment') {
              abandoned.push(o);
          }
      });
      
      expiring.sort((a, b) => a.daysLeft - b.daysLeft);
      setActiveCount(actives);
      setExpiringSoon(expiring);
      setAbandonedCarts(abandoned);
      setFatigueAlerts(fatigued);
  };

  const runRadarAnalysis = async (allOrders: any[]) => {
      setLoadingRadar(true);
      const activeAthletesSummary = allOrders
        .filter(o => o.status === 'paid' && o.sub_status === 'active')
        .map(o => {
           let sleep = 0, stress = 0, daysLeft = 999;
           if (o.checkin_history && o.checkin_history.length > 0) {
               const lastCheckin = o.checkin_history[o.checkin_history.length - 1];
               sleep = Number(lastCheckin.sleep); stress = Number(lastCheckin.stress);
           }
           if (o.expires_at) {
               const expDate = new Date(o.expires_at); const today = new Date();
               daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           }
           return { nombre: o.customer_name, sueno: sleep, estres: stress, diasRestantesPlan: daysLeft };
        });

      if (activeAthletesSummary.length === 0) {
          setRadarReport("No hay atletas activos para analizar hoy.");
          setLoadingRadar(false);
          return;
      }

      try {
          const res = await fetch('/api/admin/radar', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ athletesData: activeAthletesSummary })
          });
          const data = await res.json();
          if (data.result) setRadarReport(data.result);
      } catch (error) {
          setRadarReport("Fallo de conexión satelital con el Radar IA.");
      } finally {
          setLoadingRadar(false);
      }
  };

  // ✅ FUNCION ORIGINAL RESTAURADA: REPORTE DOMINICAL
  const generateBoardReport = async () => {
      setGeneratingBoardReport(true);
      setShowBoardReport(true);
      
      const detailedAthletes = orders
        .filter(o => o.status === 'paid')
        .map(o => {
           let sleep = 0, stress = 0, daysLeft = 999;
           if (o.checkin_history && o.checkin_history.length > 0) {
               const lastCheckin = o.checkin_history[o.checkin_history.length - 1];
               sleep = Number(lastCheckin.sleep); stress = Number(lastCheckin.stress);
           }
           if (o.expires_at) {
               const expDate = new Date(o.expires_at); const today = new Date();
               daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           }
           return { 
               nombre: o.customer_name, 
               RMs: { squat: o.rm_squat, bench: o.rm_bench, deadlift: o.rm_deadlift },
               fatiga: { sueno: sleep, estres: stress },
               estado: o.sub_status,
               diasRestantes: daysLeft,
               lesiones: o.medical_history
           };
        });

      try {
          const res = await fetch('/api/admin/board-report', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ athletesData: detailedAthletes })
          });
          const data = await res.json();
          if (data.result) setBoardReportContent(data.result);
      } catch (error) {
          setBoardReportContent("Error generando el informe ejecutivo.");
      } finally {
          setGeneratingBoardReport(false);
      }
  };

  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const selectedPlan = plans.find(p => p.code === newAthlete.planCode);
      const price = selectedPlan ? selectedPlan.price : 0;
      const res = await fetch("/api/admin/create-athlete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAthlete, price })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("✅ Atleta creado correctamente");
      setShowModal(false);
      setNewAthlete({ name: "", email: "", password: "", planCode: plans[0]?.code || "" });
      fetchData(); 
    } catch (error: any) { alert("❌ Error: " + error.message); } finally { setCreating(false); }
  }

  const totalRecaudado = orders.filter((o) => o.status === "paid").reduce((acc, curr) => acc + Number(curr.amount_ars), 0);

  // ✅ FUNCION ORIGINAL RESTAURADA: SEMÁFORO DE FATIGA
  const getFatigueStatus = (order: any) => {
     if (!order.checkin_history || order.checkin_history.length === 0) return { color: "bg-zinc-800", text: "Sin datos", pulse: false };
     const lastCheckin = order.checkin_history[order.checkin_history.length - 1];
     const sleep = Number(lastCheckin.sleep); const stress = Number(lastCheckin.stress);
     if (sleep < 6 || stress >= 8) return { color: "bg-red-500", text: "Crítico", pulse: true };
     if (sleep < 7 || stress >= 6) return { color: "bg-yellow-500", text: "Alerta", pulse: false };
     return { color: "bg-emerald-500", text: "Óptimo", pulse: false };
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans pb-20 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-7xl mx-auto px-4 md:px-0 mt-8">
        
        {/* HEADER PRINCIPAL RESTAURADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 bg-zinc-900/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
          <div>
            <Link href="/" className="text-emerald-500 text-[10px] font-black tracking-widest uppercase mb-2 flex items-center gap-1 hover:underline">
               &larr; Tujague Strength
            </Link>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-md">
              Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Órdenes</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium">Panel Maestro de Ingresos y Retención</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <button 
                onClick={generateBoardReport}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-black px-6 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg flex items-center gap-2"
            >
                <span>🚁</span> Reporte Dominical
            </button>

            <button 
                onClick={() => setShowModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95"
            >
                + Nuevo Atleta
            </button>

            <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 p-5 rounded-2xl text-right min-w-[200px] shadow-lg shadow-emerald-500/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 flex items-center justify-end gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Total Recaudado
                </p>
                <p className="text-3xl font-black italic text-white tracking-tight">${totalRecaudado.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ✅ DASHBOARD CRM: MATRIZ DE ALERTAS Y PERSECUCIÓN */}
        <div className="mb-10 space-y-6">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-300">Radar CRM de <span className="text-emerald-500">Conversión</span></h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                {/* PANEL 1: CARRITOS ABANDONADOS */}
                <div className="bg-gradient-to-r from-orange-950/30 to-black border border-orange-900/50 p-6 rounded-[2rem] shadow-lg">
                    <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                        <span>🛒</span> Carritos Abandonados ({abandonedCarts.length})
                    </h3>
                    {abandonedCarts.length > 0 ? (
                        <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                            {abandonedCarts.map((cart, idx) => {
                                const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://tu-pagina.com";
                                const wppText = `Hola ${cart.customer_name.split(' ')[0]}, el sistema de Tujague Strength me indicó que tu inscripción al protocolo quedó pausada. ¿Tuviste algún inconveniente con el medio de pago? Te dejo tu acceso directo para finalizar el alta: ${domain}/login`;
                                let cleanPhone = cart.customer_instagram?.replace(/[^0-9]/g, '') || ""; 
                                
                                return (
                                    <div key={idx} className="bg-black/60 border border-orange-500/20 p-3 rounded-xl flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                           <p className="text-xs font-black text-white uppercase truncate">{cart.customer_name}</p>
                                           <span className="text-[8px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">Pendiente</span>
                                        </div>
                                        <div className="flex gap-2">
                                           {/* ✅ CORRECCIÓN DEL ENLACE AL COMPROBANTE/PAGO */}
                                           <Link href={`/admin/orders/${cart.order_id}`} className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center">Pago</Link>
                                           <a href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}` : '#'} target={cleanPhone ? "_blank" : "_self"} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center ${cleanPhone ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                                               {cleanPhone ? '📲 Recuperar' : 'Sin Cel'}
                                           </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest text-center py-10 border border-dashed border-zinc-800 rounded-xl">No hay pagos pendientes.</p>
                    )}
                </div>

                {/* PANEL 2: PRÓXIMOS A VENCER */}
                <div className="bg-gradient-to-r from-red-950/20 to-black border border-red-900/30 p-6 rounded-[2rem] shadow-lg">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Vencimientos ({expiringSoon.length})
                    </h3>
                    {expiringSoon.length > 0 ? (
                        <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                            {expiringSoon.map((athlete, idx) => {
                                const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://tu-pagina.com";
                                const wppText = `Saludos. Te notifico que tu plan de entrenamiento caduca en ${athlete.daysLeft} días. Para no interrumpir la progresión del mesociclo, ingresa a tu panel y gestiona la renovación automática: ${domain}/login`;
                                let cleanPhone = athlete.customer_phone?.replace(/[^0-9]/g, '') || athlete.customer_instagram?.replace(/[^0-9]/g, '') || "";
                                
                                return (
                                    <div key={idx} className="bg-black/60 border border-red-500/20 p-3 rounded-xl flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                           <p className="text-xs font-black text-white uppercase truncate">{athlete.customer_name}</p>
                                           <span className="text-[8px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded">{athlete.daysLeft === 0 ? "HOY" : `${athlete.daysLeft} Días`}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* ✅ CORRECCIÓN DEL ENLACE AL COMPROBANTE/PAGO */}
                                            <Link href={`/admin/orders/${athlete.order_id}`} className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center">Ficha</Link>
                                            <a href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}` : '#'} target={cleanPhone ? "_blank" : "_self"} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center ${cleanPhone ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                                                {cleanPhone ? '📲 Cobrar' : 'Sin Cel'}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest text-center py-10 border border-dashed border-zinc-800 rounded-xl">Sin vencimientos cercanos.</p>
                    )}
                </div>

                {/* PANEL 3: ALERTAS DE FATIGA / SNC */}
                <div className="bg-gradient-to-r from-yellow-950/20 to-black border border-yellow-900/30 p-6 rounded-[2rem] shadow-lg">
                    <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-4 flex items-center gap-2">
                        <span>⚠️</span> Alertas SNC ({fatigueAlerts.length})
                    </h3>
                    {fatigueAlerts.length > 0 ? (
                        <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                            {fatigueAlerts.map((athlete, idx) => {
                                const wppText = `Atleta, el radar del sistema detectó niveles críticos de estrés/fatiga en tu último registro. ¿Cómo te venís sintiendo? Vamos a regular las cargas esta semana por precaución.`;
                                let cleanPhone = athlete.customer_phone?.replace(/[^0-9]/g, '') || athlete.customer_instagram?.replace(/[^0-9]/g, '') || "";
                                
                                return (
                                    <div key={idx} className="bg-black/60 border border-yellow-500/20 p-3 rounded-xl flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                           <p className="text-xs font-black text-white uppercase truncate">{athlete.customer_name}</p>
                                        </div>
                                        <a href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}` : '#'} target={cleanPhone ? "_blank" : "_self"} className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center ${cleanPhone ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                                            {cleanPhone ? '💬 Ajustar Cargas' : 'Sin Celular'}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest text-center py-10 border border-dashed border-zinc-800 rounded-xl">Tropa en estado óptimo.</p>
                    )}
                </div>
            </div>
        </div>

        {/* 🤖 CUADRO DEL RADAR IA (SNC) */}
        <div className="mb-8 bg-indigo-950/20 border border-indigo-500/30 p-6 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row gap-6 items-center shadow-lg">
           <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>
           
           <div className="shrink-0 flex flex-col items-center justify-center bg-black/50 p-4 rounded-2xl border border-indigo-500/20 w-32 h-32 relative z-10">
              <span className="text-4xl mb-2">📡</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 text-center leading-tight">Radar<br/>Tujague AI</span>
           </div>
           
           <div className="flex-1 relative z-10">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 border-b border-indigo-500/20 pb-2">
                 Flash de Fatiga Global
              </h3>
              {loadingRadar ? (
                 <div className="flex items-center gap-3">
                    <span className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                    </span>
                    <span className="text-xs font-bold text-indigo-400 italic">Analizando niveles de fatiga y SNC...</span>
                 </div>
              ) : (
                 <p className="text-xs text-indigo-100 font-medium leading-relaxed whitespace-pre-wrap">
                    {radarReport}
                 </p>
              )}
           </div>
        </div>

        {/* LISTA GENERAL DE ÓRDENES RESTAURADA CON FUNCIONES ORIGINALES */}
        <div className="grid gap-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Escaneando base de datos...</p>
             </div>
          ) : (
            orders.map((order) => {
              const status = getFatigueStatus(order);

              return (
                <Link 
                  key={order.id} 
                  href={`/admin/orders/${order.order_id}`} // ✅ AHORA SÍ LLEVA A LA ORDEN PARA APROBAR EL PAGO
                  className="group bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-3xl hover:border-emerald-500/40 hover:bg-zinc-800/80 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left">
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      order.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_#10b981]' : 
                      order.status === 'under_review' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_#3b82f6]' : 'bg-zinc-800 border-zinc-700'
                    }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          order.status === 'paid' ? 'bg-emerald-500' : 
                          order.status === 'under_review' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'
                        }`} />
                    </div>
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <p className="text-lg font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{order.customer_name}</p>
                        
                        <span className="flex items-center gap-1.5 bg-black px-2 py-1 rounded-md border border-zinc-800 shrink-0" title={`Estado SNC: ${status.text}`}>
                            <span className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`}></span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{status.text}</span>
                        </span>
                      </div>
                      
                      <p className="text-xs text-zinc-500 font-mono mt-1 bg-black/50 inline-block px-2 py-1 rounded-md border border-zinc-800">
                        ID: {order.order_id.slice(0,8)}... | {order.customer_email}
                      </p>
                    </div>
                  </div>

                  <div className="text-center w-full md:w-auto bg-black/30 px-6 py-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Plan Contratado</p>
                    <p className="text-sm font-bold text-zinc-200">{order.plans?.name || 'Plan Eliminado'}</p>
                  </div>

                  <div className="text-center md:text-right w-full md:w-auto flex flex-col items-center md:items-end">
                    <p className="text-3xl font-black text-white italic tracking-tighter">${Number(order.amount_ars).toLocaleString()}</p>
                    
                    <div className="flex gap-2 mt-2">
                       {order.is_onboarded && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Perfil OK</span>}
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                         order.status === 'under_review' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                       }`}>
                         {order.status.replace('_', ' ')}
                       </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* --- MODAL REPORTE DE DIRECTORIO (RESTAURADO) --- */}
      {showBoardReport && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-indigo-500/30 p-8 md:p-12 rounded-[3rem] w-full max-w-3xl shadow-[0_0_80px_rgba(79,70,229,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>

                <div className="flex justify-between items-center mb-8 relative z-10 border-b border-zinc-800/50 pb-6">
                   <div>
                      <h2 className="text-3xl font-black italic uppercase text-white flex items-center gap-3">
                         <span className="text-4xl">🚁</span> Reporte de <span className="text-indigo-400">Directorio</span>
                      </h2>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Análisis Global de la Tropa (SNC & Ventas)</p>
                   </div>
                   <button onClick={() => setShowBoardReport(false)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-4">
                   {generatingBoardReport ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-6">
                         <span className="text-6xl animate-bounce">📡</span>
                         <p className="text-indigo-400 font-black tracking-widest uppercase text-sm animate-pulse">Escaneando RMs y Fatiga de todos los atletas...</p>
                      </div>
                   ) : (
                      <div className="text-sm text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap bg-black/40 p-8 rounded-3xl border border-zinc-800/80 shadow-inner">
                         {boardReportContent}
                      </div>
                   )}
                </div>
                
                <div className="pt-6 border-t border-zinc-800/50 mt-4 relative z-10">
                   <button onClick={() => setShowBoardReport(false)} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest border border-zinc-700 transition-all">
                      CERRAR INFORME
                   </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL NUEVO ATLETA (RESTAURADO) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none -mr-10 -mt-10"></div>
                <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800">✕</button>

                <h2 className="text-3xl font-black italic uppercase text-white mb-2">Nuevo <span className="text-emerald-500">Atleta</span></h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8">Creación de ficha y acceso</p>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5 relative z-10">
                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Nombre Completo</label>
                        <input required type="text" className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700" placeholder="Ej: Juan Perez" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Email (Acceso Atleta)</label>
                        <input required type="email" className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700" placeholder="usuario@email.com" value={newAthlete.email} onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Contraseña</label>
                        <input required type="text" className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700" placeholder="Clave para el atleta" value={newAthlete.password} onChange={e => setNewAthlete({...newAthlete, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Plan a Asignar</label>
                        <div className="relative">
                          <select className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all" value={newAthlete.planCode} onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}>
                              {plans.map(plan => (<option key={plan.id} value={plan.code} className="bg-zinc-900">{plan.name} - ${plan.price.toLocaleString()}</option>))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                        </div>
                    </div>
                    <button type="submit" disabled={creating} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all mt-6 disabled:opacity-50">
                        {creating ? "AUTORIZANDO..." : "CREAR FICHA Y ACCESO"}
                    </button>
                </form>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 10px; }
      `}} />
    </div>
  );
}