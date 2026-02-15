import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white p-6 md:p-20 relative overflow-hidden">
      <div className="fixed inset-0 tech-grid opacity-20 pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 border-white/10 relative z-10 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-black mb-8 text-emerald-400 uppercase italic tracking-tighter">
          Política de <span className="text-white">Privacidad</span>
        </h1>
        
        <div className="space-y-8 text-zinc-400 text-sm md:text-base leading-relaxed">
          <section className="border-l-2 border-emerald-500/30 pl-6">
            <h2 className="text-white font-bold uppercase tracking-widest mb-3">1. Datos Recopilados</h2>
            <p>Solicitamos únicamente nombre, email y comprobante de pago para procesar tu inscripción y enviarte tu rutina personalizada de forma segura.</p>
          </section>

          <section className="border-l-2 border-emerald-500/30 pl-6">
            <h2 className="text-white font-bold uppercase tracking-widest mb-3">2. Uso y Contacto</h2>
            <p>Tu información se utiliza para la entrega de planes y el contacto directo vía WhatsApp o Email con el fin de realizar ajustes de carga y soporte técnico.</p>
          </section>

          <section className="border-l-2 border-emerald-500/30 pl-6">
            <h2 className="text-white font-bold uppercase tracking-widest mb-3">3. Seguridad</h2>
            <p>Los datos se almacenan de forma segura en la infraestructura de Supabase y Vercel, cumpliendo con los estándares de encriptación actuales para proteger tu identidad y transacciones.</p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5">
          <Link href="/" className="text-emerald-400 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">
            ← Volver a Tujaque Strength
          </Link>
        </div>
      </div>
    </main>
  );
}