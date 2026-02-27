"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Asegurate de que la ruta a supabase sea correcta

export default function UpsellSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("Procesando actualización del sistema...");

  useEffect(() => {
    const unlockModule = async () => {
      if (!orderId) {
        setStatus("Error: No se encontró el ID de la cuenta.");
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }

      try {
        // 1. Desbloqueamos el módulo de video en la base de datos
        const { error } = await supabase
          .from("orders")
          .update({ has_video_review: true })
          .eq("id", orderId); // Asumo que 'orderId' es el ID numérico interno de tu tabla (no el TS-1234)

        if (error) throw error;

        setStatus("¡Módulo Biomecánico Desbloqueado! Entrando al panel...");
        
        // 2. Lo mandamos al Dashboard después de 2 segundos para que vea el mensaje de éxito
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);

      } catch (error) {
        console.error("Error al desbloquear:", error);
        setStatus("Hubo una demora. Si el módulo no se activa, contactá al Coach.");
        setTimeout(() => router.push("/dashboard"), 4000);
      }
    };

    unlockModule();
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="bg-zinc-900/60 border border-zinc-800 p-10 md:p-14 rounded-[3rem] text-center shadow-2xl relative z-10 max-w-lg w-full backdrop-blur-xl">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
          <span className="animate-spin text-emerald-500 text-2xl">⚙️</span>
        </div>
        
        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Actualizando <span className="text-emerald-500">Credenciales</span></h2>
        
        <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl mb-6">
           <p className="text-emerald-400 font-mono text-sm">{status}</p>
        </div>
        
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-6">
          Por favor, no cierre esta ventana.
        </p>
      </div>
    </div>
  );
}