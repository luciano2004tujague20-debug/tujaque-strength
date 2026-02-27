"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; 

export default function RenewalSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("Procesando renovación del protocolo...");

  useEffect(() => {
    const processRenewal = async () => {
      if (!orderId) {
        setStatus("Error: No se encontró el ID de la cuenta.");
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }

      try {
        // Le sumamos 30 días a su cuenta a partir de HOY
        const today = new Date();
        const newExpiration = new Date(today);
        newExpiration.setDate(newExpiration.getDate() + 30);
        const expiresAtString = newExpiration.toISOString();

        // Actualizamos la base de datos para destrabar el cartel rojo
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
              sub_status: "active", // Por si estaba vencido
              expires_at: expiresAtString
          })
          .eq("id", orderId);

        if (updateError) throw updateError;

        setStatus("¡Renovación Exitosa! Se han añadido 30 días de acceso a tu panel.");
        
        // Lo mandamos al Dashboard después de 2.5 segundos
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);

      } catch (error) {
        console.error("Error al procesar renovación:", error);
        setStatus("Hubo una demora. Si el panel sigue bloqueado, contactá al Coach.");
        setTimeout(() => router.push("/dashboard"), 4000);
      }
    };

    processRenewal();
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="bg-zinc-900/60 border border-emerald-900/30 p-10 md:p-14 rounded-[3rem] text-center shadow-[0_0_80px_rgba(16,185,129,0.1)] relative z-10 max-w-lg w-full backdrop-blur-xl">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
          <span className="animate-pulse text-emerald-500 text-2xl">⚡</span>
        </div>
        
        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Extendiendo <span className="text-emerald-500">Membresía</span></h2>
        
        <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl mb-6">
           <p className="text-emerald-400 font-mono text-sm">{status}</p>
        </div>
        
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-6">
          Sincronizando base de datos central...
        </p>
      </div>
    </div>
  );
}