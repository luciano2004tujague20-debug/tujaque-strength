"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminAthletesPage() {
  const supabase = createClient();
  const [athletes, setAthletes] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ name: "", email: "", password: "", planCode: "" });

  const [selectedMedicalAthlete, setSelectedMedicalAthlete] = useState<any>(null);

  // 🔥 ESTADOS PARA EL MEGÁFONO GLOBAL 🔥
  const [showMegaphone, setShowMegaphone] = useState(false);
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [sendingGlobal, setSendingGlobal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: athletesData } = await supabase.from("orders").select("*, plans(name)").eq("status", "paid").order("created_at", { ascending: false });
    const { data: plansData } = await supabase.from("plans").select("*").order("price", { ascending: true });

    if (athletesData) setAthletes(athletesData);
    if (plansData) {
        setPlans(plansData);
        if (plansData.length > 0) setNewAthlete(prev => ({ ...prev, planCode: plansData[0].code }));
    }
    setLoading(false);
  }

  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const selectedPlan = plans.find(p => p.code === newAthlete.planCode);
      const price = selectedPlan ? selectedPlan.price : 0;

      const res = await fetch("/api/admin/create-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAthlete, price })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("✅ Atleta creado correctamente");
      setShowModal(false);
      setNewAthlete({ name: "", email: "", password: "", planCode: plans[0]?.code || "" });
      fetchData(); 
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmDelete = confirm(`¿Estás seguro de ELIMINAR a ${name}?\n\nSe borrará su acceso, rutinas y datos de pago. Esta acción no se puede deshacer.`);
    if (confirmDelete) {
        const { error } = await supabase.from('orders').delete().eq('order_id', id);
        if (error) alert("❌ Error al borrar: " + error.message);
        else { alert("🗑️ Atleta eliminado."); fetchData(); }
    }
  }

  // 🔥 FUNCIÓN MEGÁFONO GLOBAL 🔥
  const handleSendGlobalMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!window.confirm("ATENCIÓN: Esta alerta sonará en el celular de TODOS los atletas. ¿Proceder?")) return;
    setSendingGlobal(true);
    try {
        const { error } = await supabase.from('notifications').insert([{ title: globalTitle, message: globalMessage, is_global: true, user_id: null }]);
        if (error) throw error;
        alert("📢 ¡MEGÁFONO GLOBAL DISPARADO!");
        setGlobalTitle(""); setGlobalMessage(""); setShowMegaphone(false);
    } catch (err: any) {
        alert("❌ Error: " + err.message);
    } finally {
        setSendingGlobal(false);
    }
  };

  // 🚦 SEMÁFOROS IA (Adaptados al diseño claro)
  const getAthleteStatus = (athlete: any) => {
      if (athlete.expires_at) {
          const expDate = new Date(athlete.expires_at);
          const today = new Date();
          const daysLeft = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          
          if (daysLeft <= 3 || athlete.sub_status === 'vencido') {
              return { color: 'border-red-200 bg-red-50 hover:border-red-300', dot: 'bg-red-500', text: athlete.sub_status === 'vencido' ? 'VENCIDO' : `VENCE EN ${daysLeft} DÍAS`, textCol: 'text-red-600', badge: 'bg-red-100 text-red-600 border-red-200' };
          }
      }

      if (athlete.checkin_history && athlete.checkin_history.length > 0) {
          const lastCheckin = athlete.checkin_history[athlete.checkin_history.length - 1];
          if (Number(lastCheckin.stress) >= 8 || Number(lastCheckin.sleep) <= 5) {
              return { color: 'border-orange-200 bg-orange-50 hover:border-orange-300', dot: 'bg-orange-500', text: 'ALERTA FATIGA', textCol: 'text-orange-600', badge: 'bg-orange-100 text-orange-600 border-orange-200' };
          }
      }

      return { color: 'border-gray-200 bg-white hover:border-gray-300 shadow-sm', dot: 'bg-emerald-500', text: 'ACTIVO', textCol: 'text-gray-800', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#1A1A1A] font-sans pb-10 flex relative overflow-hidden selection:bg-amber-500 selection:text-white">      
      {/* Fondo Glow VIP Light */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className={`max-w-7xl mx-auto w-full transition-all duration-300 relative z-10 ${selectedMedicalAthlete ? 'lg:w-2/3 pr-6' : 'w-full'}`}>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm mt-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black drop-shadow-sm">
              Plantel de <span className="text-amber-500">Atletas</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Gestión de entrenamientos y credenciales activas</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/admin/orders" className="text-gray-500 hover:text-black uppercase tracking-widest text-xs font-bold transition-colors">
              Ir a Órdenes 💸
            </Link>
            
            {/* 🚀 BOTÓN DEL MEGÁFONO GLOBAL 🚀 */}
            <button 
                onClick={() => setShowMegaphone(true)}
                className="bg-black hover:bg-zinc-800 text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
                <span className="text-base">📢</span> Aviso Global
            </button>

            <button 
                onClick={() => setShowModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md active:scale-95"
            >
                + Nuevo Atleta
            </button>
          </div>
        </div>

        {/* LISTA DE ATLETAS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-4 md:px-0">
          {loading ? (
             <div className="xl:col-span-2 flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
             </div>
          ) : athletes.length === 0 ? (
             <div className="xl:col-span-2 text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                <p className="text-gray-400 font-bold uppercase tracking-widest">No hay atletas activos todavía.</p>
             </div>
          ) : (
            athletes.map((athlete) => {
              const status = getAthleteStatus(athlete);

              return (
                <div key={athlete.id} className={`p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all duration-300 border ${status.color}`}>
                  {/* INFO DEL ATLETA */}
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-amber-500 font-black text-2xl shadow-sm relative shrink-0">
                      {athlete.customer_name.charAt(0).toUpperCase()}
                      {/* PUNTITO DEL SEMÁFORO */}
                      <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${status.dot} ${status.dot !== 'bg-emerald-500' ? 'animate-pulse' : ''}`}></span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-base md:text-lg font-black uppercase tracking-tight flex items-center gap-2 truncate ${status.textCol}`}>
                         {athlete.customer_name}
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border shrink-0 ${status.badge}`}>
                            {status.text}
                         </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">{athlete.customer_email}</span>
                          <span className="text-[9px] font-black tracking-widest text-amber-600 uppercase px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100">{athlete.plans?.name || 'Personalizado'}</span>
                      </div>
                      {athlete.password && (
                          <p className="text-[9px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                            <span className="font-bold">🔑 Clave:</span> <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{athlete.password}</span>
                          </p>
                      )}
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto border-t border-gray-100 sm:border-none pt-4 sm:pt-0 shrink-0">
                     <button 
                        onClick={() => setSelectedMedicalAthlete(selectedMedicalAthlete?.id === athlete.id ? null : athlete)}
                        className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center border shadow-sm ${selectedMedicalAthlete?.id === athlete.id ? 'bg-amber-500 border-amber-400 text-white' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'}`}
                     >
                        Ficha 🔬
                     </button>
                     
                     <Link 
                        href={`/admin/athletes/${athlete.order_id}`}
                        className="flex-1 sm:flex-none bg-black hover:bg-zinc-800 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center shadow-sm"
                     >
                        Admin ⚙️
                     </Link>

                     <button 
                        onClick={() => handleDelete(athlete.order_id, athlete.customer_name)}
                        className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 px-4 py-3 rounded-xl transition-all border border-gray-200 hover:border-red-200 shadow-sm"
                        title="Eliminar Atleta"
                     >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 🔥 PANEL LATERAL MÉDICO (TORRE DE CONTROL - CLEAN) 🔥 */}
      {selectedMedicalAthlete && (
         <div className="hidden lg:block w-1/3 bg-white border-l border-gray-200 fixed right-0 top-0 bottom-0 overflow-y-auto p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-40 animate-in slide-in-from-right-8 custom-scrollbar">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
               <div>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Auditoría Clínica</p>
                  <h2 className="text-2xl font-black italic text-black uppercase tracking-tight">{selectedMedicalAthlete.customer_name}</h2>
               </div>
               <button onClick={() => setSelectedMedicalAthlete(null)} className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-black transition-colors shadow-sm">✕</button>
            </div>

            {!selectedMedicalAthlete.is_onboarded ? (
               <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-3xl text-center">
                  <span className="text-4xl mb-4 block opacity-50 drop-shadow-sm">📋</span>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">El atleta aún no ha completado su Ficha Clínica en el Dashboard.</p>
               </div>
            ) : (
               <div className="space-y-8">
                  {/* SECCIÓN 1: BIOMETRÍA Y LOGÍSTICA */}
                  <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><span>👤</span> Perfil Biométrico</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Edad</p>
                           <p className="text-black font-black text-lg">{selectedMedicalAthlete.age || '-'} a</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Peso Corp.</p>
                           <p className="text-black font-black text-lg">{selectedMedicalAthlete.body_weight || '-'} kg</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Altura</p>
                           <p className="text-black font-black text-lg">{selectedMedicalAthlete.height || '-'} cm</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Nivel</p>
                           <p className="text-black font-black capitalize text-sm mt-1 truncate">{selectedMedicalAthlete.experience || '-'}</p>
                        </div>
                     </div>
                  </div>

                  {/* SECCIÓN 2: HISTORIAL CLÍNICO (LESIONES) */}
                  <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2"><span>🚨</span> Historial de Lesiones</h3>
                     <p className="text-xs text-gray-800 font-medium leading-relaxed bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                        {selectedMedicalAthlete.medical_history || 'Ninguna anomalía estructural declarada.'}
                     </p>
                  </div>

                  {/* SECCIÓN 3: CONTROL SNC */}
                  <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2"><span>⚡</span> Último Check-In (SNC)</h3>
                     {selectedMedicalAthlete.checkin_history && selectedMedicalAthlete.checkin_history.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                           <div className="bg-white p-3 rounded-xl border border-amber-100 text-center shadow-sm">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Peso Hoy</p>
                              <p className="text-black font-black">{selectedMedicalAthlete.checkin_weight || '-'} kg</p>
                           </div>
                           <div className="bg-white p-3 rounded-xl border border-amber-100 text-center shadow-sm">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Sueño</p>
                              <p className={`font-black ${Number(selectedMedicalAthlete.checkin_sleep) < 6 ? 'text-red-500' : 'text-amber-600'}`}>{selectedMedicalAthlete.checkin_sleep || '-'} hrs</p>
                           </div>
                           <div className="bg-white p-3 rounded-xl border border-amber-100 text-center shadow-sm">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Estrés</p>
                              <p className={`font-black ${Number(selectedMedicalAthlete.checkin_stress) > 7 ? 'text-red-500' : 'text-amber-600'}`}>{selectedMedicalAthlete.checkin_stress || '-'}/10</p>
                           </div>
                           {selectedMedicalAthlete.checkin_notes && (
                              <div className="col-span-3 mt-2 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                 <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-2">Nota del Atleta</p>
                                 <p className="text-xs text-gray-600 italic">"{selectedMedicalAthlete.checkin_notes}"</p>
                              </div>
                           )}
                        </div>
                     ) : (
                        <p className="text-xs text-gray-500 italic font-medium">Aún no hay registros de fatiga.</p>
                     )}
                  </div>

                  {/* SECCIÓN 4: MARCAS ESTRUCTURALES (1RM) */}
                  <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><span>📈</span> Marcas Verificadas (1RM)</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Sentadilla</span>
                           <span className="text-black font-mono font-black">{selectedMedicalAthlete.rm_squat || 0} kg</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Banca</span>
                           <span className="text-black font-mono font-black">{selectedMedicalAthlete.rm_bench || 0} kg</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">P. Muerto</span>
                           <span className="text-black font-mono font-black">{selectedMedicalAthlete.rm_deadlift || 0} kg</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Militar</span>
                           <span className="text-black font-mono font-black">{selectedMedicalAthlete.rm_military || 0} kg</span>
                        </div>
                     </div>
                  </div>

               </div>
            )}
         </div>
      )}

      {/* --- MODALES (NUEVO ATLETA Y MEGÁFONO GLOBAL) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
                <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-black hover:text-white text-gray-500 rounded-full transition-colors font-bold">✕</button>

                <h2 className="text-3xl font-black italic uppercase text-black mb-2 tracking-tighter">Alta <span className="text-amber-500">Manual</span></h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Crear nuevo acceso directo</p>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5 relative z-10">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block ml-1">Nombre Completo</label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-black font-bold text-sm focus:border-amber-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: Luciano Tujague" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block ml-1">Email (Acceso)</label>
                        <input required type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-black font-bold text-sm focus:border-amber-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="usuario@email.com" value={newAthlete.email} onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block ml-1">Contraseña</label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-black font-bold text-sm focus:border-amber-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Clave para el atleta" value={newAthlete.password} onChange={e => setNewAthlete({...newAthlete, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block ml-1">Plan a Asignar</label>
                        <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-black font-bold text-sm focus:border-amber-500 outline-none appearance-none cursor-pointer transition-all" value={newAthlete.planCode} onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}>
                            {plans.map(plan => (<option key={plan.id} value={plan.code}>{plan.name} - ${plan.price.toLocaleString()}</option>))}
                        </select>
                    </div>

                    <button type="submit" disabled={creating} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all mt-6 disabled:opacity-50 active:scale-95">
                        {creating ? "CREANDO ACCESO..." : "CREAR FICHA"}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* 🚀 MODAL DEL MEGÁFONO GLOBAL 🚀 */}
      {showMegaphone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in slide-in-from-top-8 duration-300">
                <button onClick={() => setShowMegaphone(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 rounded-full transition-colors font-bold">✕</button>

                <h2 className="text-3xl font-black italic uppercase text-black mb-2 tracking-tighter">Aviso <span className="text-red-500">Global</span></h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Esta alerta le llegará a TODO tu plantel.</p>
                
                <form onSubmit={handleSendGlobalMessage} className="space-y-5 relative z-10">
                    <div>
                        <label className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2 flex ml-1 items-center gap-1"><span className="text-sm">📢</span> Título de la Alerta</label>
                        <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-black font-bold text-sm focus:border-red-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: ¡Nuevo Mesociclo Disponible!" value={globalTitle} onChange={e => setGlobalTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2 flex ml-1 items-center gap-1"><span className="text-sm">📝</span> Cuerpo del Mensaje</label>
                        <textarea required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-800 font-medium text-sm focus:border-red-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 h-32 resize-none custom-scrollbar" placeholder="Escribí el comunicado detallado acá..." value={globalMessage} onChange={e => setGlobalMessage(e.target.value)} />
                    </div>

                    <button type="submit" disabled={sendingGlobal} className="w-full bg-black hover:bg-zinc-800 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all mt-6 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                        {sendingGlobal ? "TRANSMITIENDO..." : "🚀 DISPARAR SEÑAL A TODOS"}
                    </button>
                </form>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.8); }
      `}} />
    </div>
  );
}