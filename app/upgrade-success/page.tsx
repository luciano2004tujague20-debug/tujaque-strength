"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; 

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("Analizando cuenta y parámetros de suscripción...");

  useEffect(() => {
    const processUpgrade = async () => {
      if (!orderId) {
        setStatus("Error: No se encontró el ID de la cuenta.");
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }

      try {
        // 1. Buscamos la orden actual para ver qué plan semanal tenía y su fecha de vencimiento
        const { data: currentOrder, error: fetchError } = await supabase
            .from("orders")
            .select("plan_id, expires_at")
            .eq("id", orderId)
            .single();

        if (fetchError || !currentOrder) throw new Error("Orden no encontrada");

        // 2. Lógica de emparejamiento (Semanal -> Mensual)
        let newPlanId = "mensual-3-4"; // Por defecto
        let newPlanTitle = "Mesociclo Base (3-4 Días)";

        if (currentOrder.plan_id === "semanal-5-6") {
            newPlanId = "mensual-5-6";
            newPlanTitle = "Pro Performance (5-6 Días)";
        } else if (currentOrder.plan_id === "semanal-7") {
            newPlanId = "mensual-7";
            newPlanTitle = "Élite Total (7 Días)";
        }

        // 3. Lógica de Vencimiento (+30 días desde hoy)
        const today = new Date();
        const newExpiration = new Date(today);
        newExpiration.setDate(newExpiration.getDate() + 30);
        const expiresAtString = newExpiration.toISOString();

        setStatus(`Actualizando a ${newPlanTitle}...`);

        // 4. Actualizamos la base de datos
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
              plan_id: newPlanId, 
              plan_title: newPlanTitle,
              expires_at: expiresAtString // ✅ Le sumamos 1 mes entero
          })
          .eq("id", orderId);

        if (updateError) throw updateError;

        setStatus("¡Upgrade Exitoso! Tujague AI se ha encendido y tu plan se extendió 30 días.");
        
        // 5. Lo mandamos al Dashboard después de 2.5 segundos
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);

      } catch (error) {
        console.error("Error al procesar upgrade:", error);
        setStatus("Hubo una demora. Si la IA no se activa, contactá al Coach.");
        setTimeout(() => router.push("/dashboard"), 4000);
      }
    };

    processUpgrade();
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="bg-zinc-900/60 border border-blue-900/30 p-10 md:p-14 rounded-[3rem] text-center shadow-[0_0_80px_rgba(37,99,235,0.1)] relative z-10 max-w-lg w-full backdrop-blur-xl">
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
          <span className="animate-spin text-blue-500 text-2xl">🤖</span>
        </div>
        
        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Iniciando <span className="text-blue-500">Tujague AI</span></h2>
        
        <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl mb-6">
           <p className="text-blue-400 font-mono text-sm">{status}</p>
        </div>
        
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-6">
          Sincronizando con servidores centrales...
        </p>
      </div>
    </div>
  );
}