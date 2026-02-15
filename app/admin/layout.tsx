import React from "react";
import AdminSidebar from "../components/AdminSidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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