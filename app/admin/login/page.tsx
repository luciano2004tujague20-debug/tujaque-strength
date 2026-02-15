"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import AnimatedBackground from "@/app/components/AnimatedBackground";

// Inicialización directa para máxima estabilidad
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert("Acceso denegado: " + error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/admin/orders");
        router.refresh();
      }
    } catch (err) {
      alert("Error inesperado en el inicio de sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Fondo Animado de Partículas Interactivas */}
      <AnimatedBackground />
      
      {/* Capa de contraste sutil */}
      <div className="admin-overlay" />

      <div className="admin-glass-card animate-fade-in">
        <h2 className="text-3xl font-black text-white text-center mb-10 tracking-tighter italic uppercase">
          Tujaque <span className="text-emerald-400">Admin</span>
        </h2>

        <form onSubmit={handleLogin} className="space-y-2">
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email" 
              className="admin-input-line"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="admin-input-line"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/50 mb-8 px-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" className="rounded-sm border-white/20 bg-white/10" />
              Recordarme
            </label>
            <Link href="/" className="hover:text-white transition-colors underline">Volver al sitio</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="admin-btn disabled:opacity-50"
          >
            {loading ? "VALIDANDO..." : "INGRESAR AL PANEL"}
          </button>

          <p className="text-center text-[10px] text-white/20 mt-10 uppercase tracking-[0.3em]">
            Tujaque Strength v2.0
          </p>
        </form>
      </div>
    </div>
  );
}