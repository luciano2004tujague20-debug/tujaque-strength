import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white p-6 md:p-20 relative overflow-hidden">
      {/* Grilla de fondo para mantener la estética */}
      <div className="fixed inset-0 tech-grid opacity-20 pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 border-white/10 relative z-10 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-black mb-8 text-emerald-400 uppercase italic tracking-tighter">
          Términos y <span className="text-white">Condiciones</span>
        </h1>
        
        <div className="space-y-8 text-zinc-400 text-sm md:text-base leading-relaxed">
          <section className="border-l-2 border-emerald-500/30 pl-6">
            <h2 className="text-white font-bold uppercase tracking-widest mb-3">1. Alcance del Coaching</h2>
            <p>Tujaque Strength, liderado por Luciano Tujague, provee servicios de programación de entrenamiento especializado en fuerza y estética.</p>
            <p className="mt-2 text-emerald-400/80 italic">Los planes semanales son de carácter introductorio y no incluyen seguimiento de progresión lineal, reservado exclusivamente para los planes mensuales.</p>
          </section>

          <section className="border-l-2 border-emerald-500/30 pl-6">
            <h2 className="text-white font-bold uppercase tracking-widest mb-3">2. Exención de Responsabilidad</h2>
            <p>Nuestra metodología utiliza técnicas de alta intensidad, control de excéntricas de hasta 6 segundos y gestión de esfuerzo mediante RPE/RIR. El usuario declara estar apto físicamente y asume el riesgo total de lesiones derivadas de la ejecución de estos movimientos.</p>
          </section>

          <section className="border-l-2 border-emerald-500/30 pl-6">
            <h2 className="text-white font-bold uppercase tracking-widest mb-3">3. Política de Pagos</h2>
            <p>Al ser productos digitales descargables, no se realizan reembolsos bajo ninguna circunstancia una vez otorgado el acceso. Las correcciones técnicas por video son un servicio adicional facturado aparte.</p>
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