"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function CustomLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("ERROR: Credenciales no válidas para el protocolo BII.");
    } else {
      // Lógica de redirección inteligente
      if (email === "luciano2004tujague20@gmail.com") {
        router.push("/admin/athletes"); // Te manda a tu centro de mando
      } else {
        router.push("/dashboard"); // Manda al atleta a su rutina
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Fondo estético con grilla tecnológica */}
      <div className="fixed inset-0 tech-grid opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl">
          
          <header className="text-center mb-12">
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              TUJAQUE<br/>
              <span className="text-emerald-400">STRENGTH</span>
            </h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-4">Protocolo de Acceso Elite</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2">Email del Atleta</label>
              <input 
                type="email" 
                placeholder="atleta@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-black uppercase text-xs py-5 rounded-2xl hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] mt-4"
            >
              {loading ? "VERIFICANDO..." : "INICIAR SESIÓN 🦍"}
            </button>
          </form>

          <footer className="mt-12 text-center border-t border-white/5 pt-8">
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              Sistemas de Entrenamiento BII-Vintage
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}