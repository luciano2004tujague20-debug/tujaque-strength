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
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl hidden md:flex flex-col sticky top-0 h-screen">
      <div className="p-8 border-b border-white/5">
        <h2 className="text-xl font-black uppercase italic tracking-tighter">
          TUJAQUE <span className="text-emerald-400 block text-[10px] not-italic tracking-[0.3em]">ADMIN</span>
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
              pathname === link.href ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{link.icon}</span> {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}