import Link from "next/link";

export default function HomePage() {
  // Estos son tus planes actuales. Podés cambiar los precios o nombres aquí mismo.
  const plans = [
    { 
      name: "Plan Fuerza Base", 
      desc: "Ideal para principiantes. 3 días de entrenamiento.",
      price: 18000, 
      code: "semanal-3",
      popular: false
    },
    { 
      name: "Powerlifting Pro", 
      desc: "Frecuencia de 5 días. Optimización de marcas.",
      price: 32000, 
      code: "semanal-5",
      popular: true 
    },
    { 
      name: "Personalizado +", 
      desc: "Coaching 1 a 1 con seguimiento diario.",
      price: 47000, 
      code: "personalizado",
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* NAVEGACIÓN */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <span className="font-black text-2xl tracking-tighter text-emerald-500 uppercase">
            Tujaque Strength
          </span>
          <Link href="/admin/login" className="text-[10px] font-bold tracking-widest text-gray-500 hover:text-emerald-400 transition-colors uppercase border border-white/10 px-4 py-2 rounded-full">
            Staff Access
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
            FORJANDO <span className="text-emerald-500 italic">FUERZA</span> REAL.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Coaching de entrenamiento de fuerza diseñado para hombres +18 que buscan llevar su sentadilla, banca y muerto al siguiente nivel.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a href="#planes" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/20">
              Ver Planes
            </a>
            <div className="text-gray-500 text-sm font-mono">+100 clientes transformados</div>
          </div>
        </div>
      </header>

      {/* SECCIÓN DE PLANES */}
      <main id="planes" className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">ELEGÍ TU SISTEMA</h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.code} 
              className={`relative bg-[#0a0a0a] border ${plan.popular ? 'border-emerald-500' : 'border-white/10'} p-8 rounded-[2.5rem] flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-900/10 transition-all group`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                  Más Elegido
                </span>
              )}

              <div>
                <h3 className="font-bold text-2xl mb-2 text-white uppercase tracking-tight">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-white">${plan.price.toLocaleString('es-AR')}</span>
                  <span className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">/ Mes</span>
                </div>
              </div>

              <Link 
                href={`/order?plan=${plan.code}&price=${plan.price}&name=${encodeURIComponent(plan.name)}`}
                className={`block w-full text-center font-black py-5 rounded-2xl transition-all active:scale-[0.98] ${
                  plan.popular 
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                EMPEZAR AHORA
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-20 px-6 text-center">
        <p className="text-gray-600 text-sm font-mono uppercase tracking-[0.3em]">
          Tujaque Strength © 2026 — Buenos Aires
        </p>
      </footer>
    </div>
  );
  // fix deploy 2
}