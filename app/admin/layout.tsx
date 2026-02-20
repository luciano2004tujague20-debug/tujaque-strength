"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. EXCEPCIÓN PARA EL LOGIN
  if (pathname === "/admin/login" || pathname === "/admin") {
    return <>{children}</>;
  }

  // 2. DISEÑO PARA EL PANEL SEGURO (Nivel Élite)
  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Luces Ambientales (Fondo Profesional) */}
      <div className="fixed top-0 left-[15%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none z-0"></div>

      {/* Contenedor de la Barra Lateral con efecto Cristalizado */}
      <div className="relative z-20 shadow-[10px_0_50px_rgba(0,0,0,0.5)] border-r border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <AdminSidebar />
      </div>

      {/* Contenido Principal con mejor espaciado y scroll */}
      <main className="flex-1 relative z-10 overflow-y-auto h-screen scroll-smooth">
        
        {/* Topbar decorativa VIP para el Admin */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-end items-center shadow-sm">
            <div className="flex items-center gap-4 hover:bg-white/5 p-2 rounded-xl transition-colors cursor-default">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Luciano Tujague</p>
                 <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Head Coach (Admin)</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                LT
              </div>
            </div>
        </header>

        {/* Aquí se inyectan tus páginas (Órdenes, Atletas, etc) */}
        <div className="p-6 md:p-10 lg:p-12">
          {children} 
        </div>
      </main>
    </div>
  );
}