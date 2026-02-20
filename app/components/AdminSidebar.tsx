"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const links = [
    { name: "Ventas / Órdenes", href: "/admin/orders", icon: "💰" },
    { name: "Gestión de Atletas", href: "/admin/athletes", icon: "🦍" },
    { name: "Plantillas BII", href: "/admin/templates", icon: "📝" },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 flex-col sticky top-0 h-screen hidden md:flex">
      <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <h2 className="text-2xl font-black italic tracking-tighter text-white">
          TUJAGUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 block text-[10px] not-italic tracking-[0.4em] mt-1">ADMIN CONTROL</span>
        </h2>
      </div>
      
      <nav className="flex-1 p-6 space-y-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-xs tracking-widest transition-all duration-300 relative overflow-hidden ${
                isActive 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              )}
              <span className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                {link.icon}
              </span> 
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Indicador de Estado del Sistema */}
      <div className="p-6 border-t border-white/5">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
           <div className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
           </div>
           <div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest">Sistemas OK</p>
             <p className="text-[8px] text-zinc-500 font-mono mt-0.5">V 2.0.1 - SECURE</p>
           </div>
        </div>
      </div>
    </aside>
  );
}