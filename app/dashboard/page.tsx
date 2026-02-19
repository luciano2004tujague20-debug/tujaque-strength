"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AthleteDashboard() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [activeDay, setActiveDay] = useState('d1'); // Mantengo tus días
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("ts_client_email");
    if (savedEmail && savedEmail !== "luciano2004tujague20@gmail.com") {
        setEmail(savedEmail);
        fetchPlayerData(savedEmail);
    } else {
        setLoading(false);
    }
  }, []);

  async function handleLogin() {
    setErr(null); 
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === "luciano2004tujague20@gmail.com") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (res.ok) {
          localStorage.setItem("ts_client_email", cleanEmail);
          window.location.href = "/admin/orders";
          return;
        } else {
          setErr("Contraseña de administrador incorrecta.");
        }
      } catch (e) {
        setErr("Error de conexión.");
      }
      setLoading(false);
      return;
    }

    await fetchPlayerData(cleanEmail);
  }

  async function fetchPlayerData(emailToSearch: string) {
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', emailToSearch)
        .eq('status', 'paid')
        .maybeSingle();
        
      if (orderData) {
        const { data: planData } = await supabase
          .from('plans')
          .select('name')
          .eq('code', orderData.plan_id)
          .single();

        setOrder({ ...orderData, plans: planData });
        localStorage.setItem("ts_client_email", emailToSearch);
      } else {
        setErr("No se encontró un plan para este email.");
      }
    } catch (err) {
      setErr("Error de base de datos.");
    } finally {
      setLoading(false);
    }
  }

  // --- DISEÑO DE LA PÁGINA ---

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black italic animate-pulse uppercase">
      AUTENTICANDO...
    </div>
  );

  // Pantalla de Login (Si no hay orden cargada)
  if (!order) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            Tujaque <span className="text-emerald-500">Strength</span>
          </h2>
          <div className="space-y-4">
            <input type="email" placeholder="GMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-center text-white text-sm focus:border-emerald-500 outline-none transition-all" />
            <input type="password" placeholder="CONTRASEÑA" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-center text-white text-sm focus:border-emerald-500 outline-none transition-all" />
            {err && <p className="text-red-500 text-[10px] font-black uppercase italic animate-pulse">⚠️ {err}</p>}
            <button onClick={handleLogin} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs">Ingresar</button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- TU DISEÑO ORIGINAL DE RUTINAS (Recuperado) ---
  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
       <div className="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
          <div className="flex justify-between items-start">
             <div>
                <h1 className="text-3xl font-black italic uppercase">Hola, <span className="text-emerald-500">{order.customer_name}</span></h1>
                <p className="text-zinc-500 text-xs mt-2 uppercase font-bold tracking-widest">Plan: {order.plans?.name}</p>
             </div>
             <button 
                onClick={() => { localStorage.removeItem("ts_client_email"); setOrder(null); }} 
                className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all underline"
              >
                Cerrar Sesión
              </button>
          </div>

          {/* Selector de días que tenías originalmente */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
            {['d1', 'd2', 'd3', 'd4', 'd5'].map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeDay === day ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}
              >
                Día {day.replace('d', '')}
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-6 bg-black rounded-2xl border border-zinc-800 min-h-[300px]">
             <p className="text-zinc-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {order[`routine_${activeDay}`] || "No hay rutina cargada para este día."}
             </p>
          </div>
       </div>
    </main>
  );
}