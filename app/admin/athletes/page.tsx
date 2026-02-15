"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    email: "",
    password: "", 
    plan: "Fuerza Pro (3-6 Días) Mensual" 
  });

  useEffect(() => {
    fetchActiveAthletes();
  }, []);

  async function fetchActiveAthletes() {
    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setAthletes(data || []);
    setLoading(false);
  }

  // --- WHATSAPP: COBRO DE DEUDA ---
  const sendDebtWhatsApp = (name: string, phone: string) => {
    if (!phone) return alert("Este atleta no tiene teléfono registrado.");
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `¡Hola ${name}! 👋 Soy Luciano. Vi que se venció tu acceso al dashboard de Tujaque Strength. 🦾\n\nTe escribo para saber si vas a renovar la programación para que no se te corte el acceso. ¡Cualquier duda avisame!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- WHATSAPP: CHAT DIRECTO ---
  const sendDirectWhatsApp = (phone: string) => {
    if (!phone) return alert("Sin teléfono.");
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  // --- ACTUALIZACIÓN DE DATOS (RUTINAS, FEEDBACK) ---
  async function updateField(id: string, field: string, value: string) {
    setUpdatingId(`${id}-${field}`);
    await supabase.from("athletes").update({ [field]: value }).eq("id", id);
    setUpdatingId(null);
  }

  // --- ALTA INSTANTÁNEA (SIN LAG) ---
  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    const athleteToCreate = { ...newAthlete };
    setIsModalOpen(false);
    
    // Optimistic Update
    const tempId = Math.random().toString();
    setAthletes(prev => [{ 
      id: tempId, 
      full_name: athleteToCreate.name, 
      email: athleteToCreate.email, 
      plan_title: athleteToCreate.plan,
      loading: true 
    }, ...prev]);

    setNewAthlete({ name: "", email: "", password: "", plan: "Fuerza Pro (3-6 Días) Mensual" });

    try {
      // Definición de precios para la API
      let price = 100000;
      if (athleteToCreate.plan.includes("3-6 Días Semanal")) price = 32000;
      if (athleteToCreate.plan.includes("3-6 Días Mensual")) price = 100000;
      if (athleteToCreate.plan.includes("7 Días Semanal")) price = 38000;
      if (athleteToCreate.plan.includes("7 Días Mensual")) price = 115000;

      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...athleteToCreate, price }), 
      });

      if (!response.ok) throw new Error();
      fetchActiveAthletes();
    } catch (error) {
      alert("Error al crear usuario. Reintentando...");
      fetchActiveAthletes();
    }
  }

  const filteredAthletes = athletes.filter(a =>
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black italic animate-pulse">Sincronizando Estación de Análisis...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 relative">
      
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter">
            Gestión de <span className="text-emerald-400">Atletas</span>
          </h1>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="mt-8 w-full md:w-[400px] bg-[#111113] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest outline-none focus:border-emerald-500 transition-all text-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black tracking-widest text-xs hover:scale-105 transition-all">+ Crear Nuevo Atleta</button>
      </header>

      {/* MODAL CON NUEVOS PLANES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0c0e] border border-emerald-500/30 rounded-[2rem] p-10 w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">✕</button>
            <h2 className="text-2xl font-black italic text-white mb-8 border-b border-white/10 pb-4">Alta <span className="text-emerald-500">Instantánea</span></h2>
            <form onSubmit={handleCreateAthlete} className="space-y-4">
              <input type="text" required placeholder="Nombre Completo" value={newAthlete.name} onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
              <input type="email" required placeholder="Email" value={newAthlete.email} onChange={(e) => setNewAthlete({...newAthlete, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
              <input type="text" required placeholder="Clave Provisoria" value={newAthlete.password} onChange={(e) => setNewAthlete({...newAthlete, password: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
              <select value={newAthlete.plan} onChange={(e) => setNewAthlete({...newAthlete, plan: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold">
                <option value="3-6 Días Semanal ($32k)">3-6 Días Semanal ($32.000)</option>
                <option value="3-6 Días Mensual ($100k)">3-6 Días Mensual ($100.000)</option>
                <option value="7 Días Semanal ($38k)">7 Días Semanal ($38.000)</option>
                <option value="7 Días Mensual ($115k)">7 Días Mensual ($115.000)</option>
              </select>
              <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest">Crear Atleta</button>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE ATLETAS */}
      <div className="space-y-16">
        {filteredAthletes.map((athlete) => {
          const isExpired = athlete.expiration_date && new Date(athlete.expiration_date) < new Date();
          
          return (
            <section key={athlete.id} className={`bg-[#0c0c0e] border rounded-[3rem] overflow-hidden shadow-2xl transition-all ${isExpired ? 'border-red-500/40 bg-red-500/[0.01]' : 'border-white/5'}`}>
              
              <div className="p-8 md:p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl font-black italic text-white tracking-tighter">{athlete.full_name}</h2>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black italic tracking-widest ${isExpired ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {isExpired ? '● VENCIDO' : '● ACTIVO'}
                    </span>
                  </div>
                  <p className="text-zinc-500 font-mono text-xs">{athlete.email}</p>
                  <div className="mt-4 flex gap-3">
                    <span className="bg-zinc-900 text-zinc-400 text-[9px] font-black px-3 py-1.5 rounded-lg border border-white/5 uppercase italic">
                      Vence: {athlete.expiration_date ? new Date(athlete.expiration_date).toLocaleDateString() : '---'}
                    </span>
                    <span className="bg-emerald-500/5 text-emerald-500 text-[9px] font-black px-3 py-1.5 rounded-lg border border-emerald-500/10 uppercase italic">
                      {athlete.plan_title}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="hidden md:flex gap-4 mr-6">
                    {[{ l: 'SQ', v: athlete.squat_1rm }, { l: 'BP', v: athlete.bench_1rm }, { l: 'DL', v: athlete.deadlift_1rm }].map(pr => (
                      <div key={pr.l} className="text-center">
                        <p className="text-[8px] font-black text-zinc-600 mb-1">{pr.l}</p>
                        <p className="text-xl font-black italic text-emerald-400">{pr.v || '0'}<span className="text-[10px] ml-0.5">k</span></p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {isExpired && (
                      <button onClick={() => sendDebtWhatsApp(athlete.full_name, athlete.phone)} className="bg-red-500 text-white px-6 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase">Cobrar</button>
                    )}
                    <button onClick={() => sendDirectWhatsApp(athlete.phone)} className="bg-white/5 text-zinc-400 px-6 py-2 rounded-xl font-black text-[10px] tracking-widest border border-white/10 hover:bg-emerald-500 hover:text-black transition-all uppercase italic">WhatsApp</button>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-[#111113]/30 grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase italic">Correcciones Técnicas</label>
                  <textarea
                    className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-6 text-sm text-zinc-300 outline-none focus:border-emerald-500/50 transition-all min-h-[180px] font-bold leading-relaxed italic"
                    defaultValue={athlete.biomechanic_feedback || ""}
                    onBlur={(e) => updateField(athlete.id, 'biomechanic_feedback', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map((day) => (
                    <div key={day} className="space-y-2">
                      <label className="text-[8px] font-black text-zinc-600 tracking-[0.2em] uppercase italic">Día {day.slice(1)}</label>
                      <textarea
                        className="w-full bg-black/60 border border-white/5 rounded-xl p-3 text-[10px] text-emerald-50 outline-none focus:border-emerald-500/50 min-h-[80px] font-mono"
                        placeholder="Rutina..."
                        defaultValue={athlete[`routine_${day}`] || ""}
                        onBlur={(e) => updateField(athlete.id, `routine_${day}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}