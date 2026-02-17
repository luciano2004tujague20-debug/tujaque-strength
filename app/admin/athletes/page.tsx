"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // ESTADOS PARA CREAR ATLETA MANUAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    email: "",
    plan: "Plan Personalizado"
  });

  useEffect(() => {
    fetchActiveAthletes();
  }, []);

  async function fetchActiveAthletes() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .eq("status", "paid") 
      .order("created_at", { ascending: false });

    if (!error) setAthletes(data || []);
    setLoading(false);
  }

  // --- CREAR ATLETA MANUALMENTE ---
  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    const tempId = `TS-${Date.now()}`; // Generamos ID manual
    
    // Insertamos directamente en ORDERS como PAGADO
    const { error } = await supabase.from("orders").insert({
        order_id: tempId,
        customer_name: newAthlete.name,
        customer_email: newAthlete.email,
        status: 'paid',
        payment_method: 'manual_admin',
        amount_ars: 0, // Precio simbólico o editable luego
        // Si tienes una tabla de planes, idealmente buscarías el ID, 
        // pero aquí guardamos la orden básica para que arranque.
    });

    if (error) {
        alert("Error al crear: " + error.message);
    } else {
        alert("Atleta creado correctamente.");
        setIsModalOpen(false);
        setNewAthlete({ name: "", email: "", plan: "Plan Personalizado" });
        fetchActiveAthletes(); // Recargar lista
    }
  }

  // --- ACTUALIZACIÓN DE DATOS ---
  async function updateField(orderId: string, field: string, value: string) {
    await supabase.from("orders").update({ [field]: value }).eq("order_id", orderId);
  }

  const filteredAthletes = athletes.filter(a =>
    a.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500 font-black italic animate-pulse">CARGANDO...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 px-6 font-sans text-white">
      
      <div className="max-w-7xl mx-auto pt-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
                    Gestión de <span className="text-emerald-500">Atletas</span>
                </h1>
                <p className="text-zinc-500 mt-2 text-sm">Base de datos unificada.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <input
                    type="text"
                    placeholder="Buscar atleta..."
                    className="w-full md:w-[300px] bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 outline-none focus:border-emerald-500 font-bold"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* BOTÓN RESTAURADO */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                    + Nuevo Atleta
                </button>
            </div>
        </header>

        {/* MODAL DE CREACIÓN */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 w-full max-w-md relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white font-bold">✕</button>
                    <h2 className="text-2xl font-black italic text-white mb-6">Alta <span className="text-emerald-500">Manual</span></h2>
                    <form onSubmit={handleCreateAthlete} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Nombre Completo</label>
                            <input type="text" required value={newAthlete.name} onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Email (Acceso)</label>
                            <input type="email" required value={newAthlete.email} onChange={(e) => setNewAthlete({...newAthlete, email: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
                        </div>
                        <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest mt-4">Crear Acceso</button>
                    </form>
                </div>
            </div>
        )}

        {/* LISTA DE ATLETAS */}
        <div className="space-y-8">
            {filteredAthletes.map((athlete) => {
            const isExpanded = expandedId === athlete.order_id;
            
            return (
                <section key={athlete.order_id} className="bg-[#09090b] border border-zinc-800 rounded-[2rem] overflow-hidden transition-all shadow-xl hover:border-zinc-700">
                
                <div className="p-8 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center bg-zinc-900/20">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center font-black text-2xl text-zinc-500">
                            {athlete.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tight">{athlete.customer_name}</h2>
                            <p className="text-zinc-500 font-mono text-xs mb-2">{athlete.customer_email}</p>
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black px-2 py-1 rounded uppercase">
                                {athlete.payment_method === 'manual_admin' ? 'Manual' : 'Web'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setExpandedId(isExpanded ? null : athlete.order_id)}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isExpanded ? 'bg-white text-black' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                    >
                        {isExpanded ? 'Cerrar' : 'Gestionar'}
                    </button>
                </div>

                {isExpanded && (
                    <div className="p-8 border-t border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* BIOMECÁNICA */}
                        <div className="mb-12">
                            <h3 className="text-lg font-black italic mb-6">📹 Biomecánica</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['squat', 'bench', 'deadlift', 'dips'].map((lift) => (
                                    <div key={lift} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-emerald-500 font-black uppercase text-xs tracking-widest">{lift}</span>
                                            {athlete[`video_${lift}`] && (
                                                <a href={athlete[`video_${lift}`]} target="_blank" className="text-[10px] text-blue-400 hover:underline">Ver Video ↗</a>
                                            )}
                                        </div>
                                        <textarea 
                                            placeholder={`Corrección para ${lift}...`}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 min-h-[100px] focus:border-emerald-500 outline-none resize-none"
                                            defaultValue={athlete[`feedback_${lift}`] || ''}
                                            onBlur={(e) => updateField(athlete.order_id, `feedback_${lift}`, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RUTINA */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black italic">📋 Programación</h3>
                                <button onClick={() => window.print()} className="text-zinc-500 hover:text-white text-xs font-bold uppercase">🖨️ PDF</button>
                            </div>
                            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map((day, index) => (
                                    <div key={day} className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase">Día {index + 1}</label>
                                        <textarea
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 outline-none focus:border-emerald-500 min-h-[200px]"
                                            defaultValue={athlete[`routine_${day}`] || ""}
                                            onBlur={(e) => updateField(athlete.order_id, `routine_${day}`, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                </section>
            );
            })}
        </div>
      </div>
    </div>
  );
}