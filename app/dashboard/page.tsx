"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AthleteDashboard() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [activeDay, setActiveDay] = useState('d1');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("ts_client_email");
    if (savedEmail) {
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

    // ✅ LÓGICA DE ADMIN CORREGIDA
    // Si sos vos, te fabricamos la llave secreta en el navegador y te mandamos al panel
    if (cleanEmail === "luciano2004tujague20@gmail.com" && password === "Qb42hpGbB2AlTBXnD3g42004") {
        document.cookie = "ts_admin_session=true; path=/; max-age=604800; samesite=lax";
        window.location.href = "/admin/orders";
        return;
    }

    // ✅ LÓGICA DE ATLETA: Si no es admin, busca su plan
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
        setErr("No encontramos un plan activo para este email.");
      }
    } catch (err) {
      console.error(err);
      setErr("Error de conexión al sistema.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black italic animate-pulse uppercase tracking-tighter">
      AUTENTICANDO...
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            Tujaque <span className="text-emerald-500">Strength</span>
          </h2>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Acceso Sistema</p>
            
            <input
              type="email"
              placeholder="GMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-center text-white text-sm focus:border-emerald-500 outline-none transition-all"
            />

            <input
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-center text-white text-sm focus:border-emerald-500 outline-none transition-all"
            />

            {err && (
              <p className="text-red-500 text-[10px] font-black uppercase italic animate-pulse">
                ⚠️ {err}
              </p>
            )}

            <button 
              onClick={handleLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] uppercase tracking-widest text-xs"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-10">
       <div className="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
          <div className="flex justify-between items-start">
             <div>
                <h1 className="text-3xl font-black italic uppercase">Hola, <span className="text-emerald-500">{order.customer_name}</span></h1>
                <p className="text-zinc-500 text-xs mt-2 uppercase font-bold tracking-widest">Plan: {order.plans?.name}</p>
             </div>
             <button 
                onClick={() => { localStorage.removeItem("ts_client_email"); setOrder(null); }} 
                className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all tracking-[0.2em] underline underline-offset-4"
              >
                Cerrar Sesión
              </button>
          </div>
          
          <div className="mt-10 p-6 bg-black rounded-2xl border border-zinc-800 min-h-[300px]">
             <p className="text-zinc-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {order[`routine_${activeDay}`] || "No hay rutina cargada para este día."}
             </p>
          </div>
       </div>
    </main>
  );
}