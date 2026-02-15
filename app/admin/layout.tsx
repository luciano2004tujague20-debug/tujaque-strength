"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 
import AdminSidebar from "../components/AdminSidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ⚠️ TU EMAIL DE ADMIN (La llave maestra)
  // Verificá que este sea exactamente el mail con el que iniciás sesión
  const ADMIN_EMAIL = "luciano2004tujague20@gmail.com";

  useEffect(() => {
    async function checkAdmin() {
      // 1. Le preguntamos a Supabase quién está intentando entrar
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Si no hay usuario o el mail no coincide, lo mandamos al dashboard de clientes
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/dashboard"); 
      } else {
        // 3. Si sos vos, abrimos la puerta
        setAuthorized(true);
      }
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  // Pantalla de carga mientras verificamos quién sos
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-emerald-500 font-black italic animate-pulse tracking-widest">
          Verificando credenciales de Coach...
        </div>
      </div>
    );
  }

  // Si no está autorizado, no mostramos nada (el router ya lo sacó de acá)
  if (!authorized) return null;

  // SI SOS VOS, CARGAMOS EL DISEÑO QUE YA TENÍAS
  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Esto se queda FIJO a la izquierda */}
      <AdminSidebar />

      {/* Esto es lo que CAMBIA (tus órdenes, atletas, etc.) */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="fixed inset-0 tech-grid opacity-10 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-10 text-white">
          {children} 
        </div>
      </main>
    </div>
  );
}