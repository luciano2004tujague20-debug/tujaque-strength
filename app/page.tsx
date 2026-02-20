"use client";

import { useState } from "react";
import CheckoutClient from "./components/CheckoutClient";
import Link from "next/link";
import Image from "next/image";

// ─── CONFIGURACIÓN DE DATOS (MANTENIDA INTACTA) ───
const PRICING_MATRIX = {
  weekly: [
    {
      id: "semanal-3-4",
      title: "INICIO RÁPIDO (3-4 DÍAS)",
      subtitle: "Prueba Semanal / Adaptación",
      price: 20000,
      description: "Ideal para quienes quieren probar la metodología por primera vez o disponen de poco tiempo en la semana.",
      features: ["Rutina enfocada en básicos", "Foco: Técnica en SBD", "Sin ajustes de largo plazo"],
      highlight: false,
    },
    {
      id: "semanal-5-6",
      title: "INTENSIVO (5-6 DÍAS)",
      subtitle: "Semana de Choque",
      price: 32000,
      description: "Una semana de alta frecuencia para evaluar tu capacidad de recuperación y técnica bajo fatiga.",
      features: ["Alta densidad de entrenamiento", "Técnicas RIR/RPE", "Ideal para atletas con experiencia"],
      highlight: true,
    },
    {
      id: "semanal-7",
      title: "FULL SEMANA (7 DÍAS)",
      subtitle: "Máxima Exigencia",
      price: 38000,
      description: "Siete días de programación estricta. Para quienes no quieren dejar ni un solo día al azar.",
      features: ["Programación diaria", "Control de volumen total", "Máximo rendimiento semanal"],
      highlight: false,
    }
  ],
  monthly: [
    {
      id: "mensual-3-4",
      title: "MESOCICLO BASE (3-4 DÍAS)",
      subtitle: "Progreso Constante",
      price: 50000,
      description: "Planificación mensual estructurada. Ideal para combinar con otras actividades manteniendo el progreso en fuerza.",
      features: ["Ajustes semanales de carga", "Periodización Lineal", "Gestión de fatiga real"],
      highlight: false,
    },
    {
      id: "mensual-5-6",
      title: "PRO PERFORMANCE (5-6 DÍAS)",
      subtitle: "Evolución Real",
      price: 100000,
      description: "El estándar para el atleta serio. 4 semanas de progresión técnica y de cargas diseñada para resultados máximos.",
      features: ["Ajustes en 24hs", "Tabla de RPE personalizada", "Optimización Bii-Vintage"],
      highlight: true,
    },
    {
      id: "mensual-7",
      title: "ÉLITE TOTAL (7 DÍAS)",
      subtitle: "Planificación Maestra",
      price: 115000,
      description: "Programación avanzada de 4 semanas. Requiere máxima disciplina y capacidad de trabajo. No apto para principiantes.",
      features: ["Gestión total de variables", "Análisis de recuperación", "Soporte prioritario"],
      highlight: false,
    }
  ]
};

const EXTRA_VIDEO_PRICE = 15000;

export default function Home() {
  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [addVideoReview, setAddVideoReview] = useState(false);

  const currentPlans = isWeekly ? PRICING_MATRIX.weekly : PRICING_MATRIX.monthly;

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Mensaje predeterminado para WhatsApp
  const whatsappMessage = encodeURIComponent("Hola Coach, quiero aplicar para ingresar al equipo BII-Vintage y llevar mi fuerza al siguiente nivel. ¿Qué datos necesitas?");
  const whatsappUrl = `https://wa.me/5491123021760?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#050505] text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ─── FONDO ÉPICO ─── */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/hero.png" 
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505] z-10"></div>
      </div>
      
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none z-0"></div>

      {/* ─── NAVBAR FLOTANTE ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black italic tracking-tighter">
            TUJAGUE <span className="text-emerald-500">STRENGTH</span>
          </div>
          <Link href="/dashboard">
            <button className="px-6 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              Acceso Atletas
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── BOTÓN WHATSAPP FLOTANTE ─── */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-110 transition-transform active:scale-95 group border border-emerald-400/50"
      >
        <span className="absolute -top-10 right-0 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          ¿Dudas? Hablá con Luciano
        </span>
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.48 5.228 3.48 8.404c0 6.556-5.332 11.888-11.888 11.888-2.097 0-4.142-.547-5.946-1.588L0 .057zm12.026-2.137c1.892 0 3.738-.503 5.339-1.455l.382-.227 3.97 1.041-1.059-3.869.25-.397c1.046-1.666 1.599-3.593 1.599-5.606 0-5.833-4.744-10.577-10.577-10.577-2.827 0-5.483 1.1-7.481 3.098s-3.098 4.654-3.098 7.481c0 2.013.553 3.94 1.599 5.606l.25.397-1.059 3.869 4.074-1.069.382.227c1.6.952 3.447 1.455 5.339 1.455z"/></svg>
      </a>

      {/* ─── HERO SECTION (VIDRIERA ÉLITE) ─── */}
      <header className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-40 text-center px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

        <span className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-[0.2em] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          EL MÉTODO BII-VINTAGE
        </span>
        
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[1.1] mb-6 text-white drop-shadow-2xl">
          FUERZA BRUTA, <br className="md:hidden"/> SIN VIVIR EN EL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 inline-block pb-2">GIMNASIO.</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Rompé el estancamiento. Dejá las rutinas genéricas de 6 días. Sumate al equipo y construí fuerza real dominando los 4 básicos: <span className="text-white font-bold border-b border-emerald-500/50">Sentadilla, Banca, Peso Muerto y Fondos.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a 
              href={whatsappUrl}
              target="_blank"
              className="relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-emerald-500 text-black font-black tracking-widest text-xs hover:bg-emerald-400 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10">APLICAR PARA EL EQUIPO</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </a>
            
            <button 
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-black tracking-widest text-xs hover:bg-zinc-800 transition-all w-full sm:w-auto"
            >
              VER PLANES
            </button>
        </div>

        {/* Badges de confianza */}
        <div className="flex flex-wrap justify-center gap-6 mt-16 opacity-60">
           <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">✔</span> Cupos Mensuales Limitados</div>
           <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">✔</span> Corrección Biomecánica</div>
           <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">✔</span> Control de Fatiga Exacto</div>
        </div>
      </header>

      {/* ─── SECCIÓN: EL PANEL (MOSTRANDO EL "JUGUETE") ─── */}
      <section className="relative z-10 py-24 bg-black border-y border-white/5 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black italic mb-4 text-white tracking-tighter">TECNOLOGÍA AL SERVICIO DE <span className="text-emerald-500">TU RM</span></h2>
            <p className="text-zinc-400 mb-16 max-w-2xl mx-auto">No te envío un PDF por correo. Al sumarte al equipo, recibís acceso a tu propio Dashboard Privado, diseñado para atletas serios.</p>
            
            <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: "📈", title: "Curva de Progreso", desc: "Gráfico interactivo de tus levantamientos." },
                  { icon: "⚡", title: "Control de Fatiga", desc: "Monitoreo diario de sueño, peso y estrés." },
                  { icon: "📹", title: "Auditoría en Video", desc: "Devoluciones cuadro por cuadro del Coach." },
                  { icon: "🧠", title: "Ajuste de RPE", desc: "Cargas calculadas según tu rendimiento diario." }
                ].map((feature, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl text-left hover:border-emerald-500/50 transition-colors">
                        <div className="text-4xl mb-6">{feature.icon}</div>
                        <h3 className="text-white font-black italic text-lg uppercase tracking-tight mb-2">{feature.title}</h3>
                        <p className="text-zinc-500 text-xs font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* ─── LA FILOSOFÍA BII-VINTAGE ─── */}
      <section className="relative z-10 py-24 bg-zinc-900/20 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Brief (Breve)", desc: "Entrenamientos cortos y directos al punto. Si puedes entrenar más de una hora a esta intensidad, no estás entrenando lo suficientemente duro." },
            { title: "Intense (Intenso)", desc: "Series llevadas al verdadero límite (RIR 0). Técnica estricta bajo fatiga extrema. Aquí es donde ocurre el crecimiento." },
            { title: "Infrequent (Infrecuente)", desc: "El músculo crece cuando descansas, no cuando levantas. Controlamos la frecuencia para evitar destrozar tu Sistema Nervioso Central." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-800/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 font-black text-xl italic tracking-tighter group-hover:scale-110 group-hover:border-emerald-500/50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                {item.title.split(' ')[0]}
              </div>
              <h3 className="text-2xl font-black italic mb-3 text-white">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECCIÓN: EL ENTRENADOR Y LOS LEVANTAMIENTOS ─── */}
      <section className="relative z-10 py-32 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          
          <div className="relative group w-[300px] h-[400px] md:w-[450px] md:h-[550px]">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-[80px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
             <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                <Image src="/hero.png" alt="Luciano Tujague" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
             </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <span className="text-emerald-500 font-black tracking-widest text-xs mb-4 inline-block uppercase border-b border-emerald-500/30 pb-2">Head Coach</span>
            <h2 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter text-white">LUCIANO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700">TUJAGUE</span></h2>
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed font-medium">
                <p>Aplico la metodología <strong className="text-white">BII-VINTAGE</strong> para maximizar el rendimiento en básicos, enfocándome en la biomecánica y la gestión absoluta de la fatiga.</p>
                <p>Mi filosofía exige <strong className="text-white">tolerancia al dolor</strong>: priorizo la técnica impecable con excéntricas de hasta 6 segundos. No busco entretenerte; busco efectividad real.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
               {[
                 { v: "152 KG", l: "Squat" },
                 { v: "110 KG", l: "Banca" },
                 { v: "110 KG", l: "Deadlift" },
                 { v: "+60 KG", l: "Fondos" }
               ].map((stat, i) => (
                 <div key={i} className="bg-zinc-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all group">
                    <p className="text-white font-black text-3xl italic leading-none group-hover:text-emerald-400 transition-colors drop-shadow-md">{stat.v}</p>
                    <p className="text-[10px] text-zinc-500 font-black tracking-widest mt-2 uppercase">{stat.l}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 🆕 SECCIÓN DE VIDEOS "EL BIG 4" PREPARADA ─── */}
      <section className="relative z-10 py-32 px-4 bg-black border-b border-white/5">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white">PREDICAR CON EL <span className="text-emerald-500">EJEMPLO</span></h2>
               <p className="text-zinc-500 mt-4 font-medium uppercase tracking-widest text-xs">Registros Oficiales de Levantamientos Base</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               {[
                 { title: "Sentadilla (152 KG)", state: "pending" },
                 { title: "Press de Banca (110 KG)", state: "pending" },
                 { title: "Peso Muerto (110 KG)", state: "pending" },
                 { title: "Fondos Lastrados (+60 KG)", state: "pending" }
               ].map((video, idx) => (
                   <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden group relative">
                       {/* CONTENEDOR DEL VIDEO (Actualmente con Placeholder) */}
                       <div className="aspect-video bg-zinc-950 flex flex-col items-center justify-center p-8 relative">
                           <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4 opacity-50">
                               <span className="text-2xl">🔒</span>
                           </div>
                           <h4 className="text-zinc-600 font-black tracking-widest text-xs uppercase text-center">Video de Registro en Producción</h4>
                           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
                       </div>
                       
                       <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                           <p className="font-black italic text-white uppercase text-xl">{video.title}</p>
                           <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                               Próximamente
                           </span>
                       </div>
                   </div>
               ))}
            </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing-section" className="relative z-20 py-32 px-4 bg-zinc-950/80 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black italic text-center mb-12 tracking-tighter drop-shadow-xl">
            ELIGE TU <span className="text-emerald-500">CAMINO</span>
          </h2>
          
          <div className="inline-flex bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-800 mb-20 shadow-2xl">
            <button onClick={() => { setIsWeekly(true); setSelectedPlan(null); }} className={`px-12 py-4 rounded-xl text-xs md:text-sm font-black transition-all duration-300 tracking-widest ${isWeekly ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white'}`}>SEMANAL</button>
            <button onClick={() => { setIsWeekly(false); setSelectedPlan(null); }} className={`px-12 py-4 rounded-xl text-xs md:text-sm font-black transition-all duration-300 tracking-widest ${!isWeekly ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white'}`}>MENSUAL</button>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto mb-24">
            {currentPlans.map((plan) => (
              <div 
                key={plan.id} 
                onClick={() => handleSelectPlan(plan)}
                className={`p-8 md:p-10 cursor-pointer group transition-all duration-500 relative flex flex-col rounded-[2.5rem] border backdrop-blur-xl ${
                  selectedPlan?.id === plan.id 
                  ? 'bg-zinc-900/90 border-emerald-500 scale-[1.03] shadow-[0_0_60px_rgba(16,185,129,0.2)] z-10' 
                  : 'bg-zinc-900/40 border-white/5 hover:border-emerald-500/40 hover:bg-zinc-900/70'
                }`}
              >
                {plan.highlight && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black text-[10px] font-black px-6 py-2 rounded-full tracking-widest shadow-lg shadow-emerald-500/30">
                     MÁS ELEGIDO
                   </div>
                )}
                <h3 className="text-3xl font-black italic mb-2 tracking-tighter text-white">{plan.title}</h3>
                <p className="text-emerald-400 font-bold tracking-widest text-[10px] mb-8 border-b border-white/10 pb-4 uppercase">{plan.subtitle}</p>
                <div className="text-4xl md:text-5xl font-black mb-8 text-white tracking-tight flex items-center justify-center">
                    <span className="text-2xl text-zinc-500 mr-1">$</span>
                    {plan.price.toLocaleString('es-AR')} 
                    <span className="text-sm text-zinc-500 font-bold ml-2 tracking-wide align-bottom">/{isWeekly ? 'SEM' : 'MES'}</span>
                </div>
                <p className="text-zinc-400 mb-10 text-sm leading-relaxed flex-grow font-medium">{plan.description}</p>
                <ul className="space-y-4 mb-10 text-left bg-black/20 p-6 rounded-2xl border border-white/5">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-zinc-300 font-medium text-xs md:text-sm">
                      <span className="text-emerald-500 font-black mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] transition-all duration-300 uppercase ${
                  selectedPlan?.id === plan.id 
                  ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-zinc-400 group-hover:bg-white group-hover:text-black'
                }`}>
                  {selectedPlan?.id === plan.id ? 'PLAN SELECCIONADO' : 'ELEGIR ESTE PLAN'}
                </button>
              </div>
            ))}
          </div>
          
          {/* SECCIÓN "DETALLE PRO": LO QUE SÍ / LO QUE NO */}
          <div className="max-w-4xl mx-auto mb-20 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden backdrop-blur-xl shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
             
             <h3 className="text-3xl font-black italic text-center text-white mb-12 tracking-tighter">TRANSPARENCIA <span className="text-emerald-500">TOTAL</span></h3>
             
             <div className="grid md:grid-cols-2 gap-12 md:gap-20">
                <div className="space-y-6 text-left">
                  <h4 className="text-emerald-500 font-black tracking-widest text-sm uppercase flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
                    <span className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">✓</span> Lo que SÍ Incluye
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span> Programación 100% personalizada en Dashboard.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span> Correcciones técnicas vía video.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span> Soporte directo por WhatsApp.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span> Directrices de rendimiento (Agua y Macros).
                    </li>
                  </ul>
                </div>

                <div className="space-y-6 text-left relative">
                  <div className="hidden md:block absolute -left-10 top-0 bottom-0 w-[1px] bg-white/5"></div>
                  <h4 className="text-red-500 font-black tracking-widest text-sm uppercase flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
                    <span className="bg-red-500/10 p-2 rounded-lg text-red-400">✕</span> Lo que NO Incluye
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                      <span className="text-red-500/70 font-bold mt-0.5">•</span> Menús de alimentación cerrados (Pollo y arroz).
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                      <span className="text-red-500/70 font-bold mt-0.5">•</span> Respuestas instantáneas 24/7.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
                      <span className="text-red-500/70 font-bold mt-0.5">•</span> Consultas médicas o de rehabilitación.
                    </li>
                  </ul>
                </div>
             </div>
          </div>

          {selectedPlan && (
            <div className="max-w-3xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-10 duration-500">
              <label className={`flex items-center justify-between p-8 md:p-10 border cursor-pointer transition-all duration-300 rounded-[2.5rem] backdrop-blur-xl ${addVideoReview ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.15)] scale-[1.02]' : 'bg-zinc-900/50 border-white/10 hover:border-white/20 hover:bg-zinc-800/50'}`}>
                <div className="flex items-center gap-6 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-inner ${addVideoReview ? 'bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/50' : 'border-zinc-700 bg-black/50 text-transparent'}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-xl md:text-2xl leading-none mb-2 text-white italic">Auditoría Técnica Biomecánica</h4>
                    <p className="text-[10px] md:text-xs text-emerald-400 font-bold tracking-widest uppercase mt-2">Análisis detallado de los 4 Básicos + Corrección de palancas.</p>
                  </div>
                </div>
                <div className="text-right pl-4">
                    <span className="text-3xl font-black text-white block tracking-tight">+${EXTRA_VIDEO_PRICE.toLocaleString()}</span>
                </div>
                <input type="checkbox" className="hidden" checked={addVideoReview} onChange={(e) => setAddVideoReview(e.target.checked)}/>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* ─── CHECKOUT SECTION (MANTENIDO INTACTO) ─── */}
      <section id="checkout-section" className="relative z-10 py-32 px-4 bg-black border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black italic mb-6 tracking-tighter text-white">FINALIZAR <span className="text-emerald-500">INSCRIPCIÓN</span></h2>
            <p className="text-zinc-400 text-base font-medium tracking-wide">Completá tus datos para recibir acceso inmediato al panel de entrenamiento.</p>
          </div>
          {selectedPlan ? (
            <div className="bg-[#09090b] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
              {/* Aquí se inyecta tu componente actual LandingCheckout sin alterar su lógica */}
              <CheckoutClient selectedPlan={selectedPlan} extraVideo={addVideoReview} extraPrice={EXTRA_VIDEO_PRICE} />
            </div>
          ) : (
            <div className="text-center p-24 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-white/[0.01] backdrop-blur-sm">
              <p className="text-xl font-bold text-zinc-500 italic tracking-widest flex flex-col items-center gap-4">
                <svg className="w-12 h-12 text-zinc-700 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                SELECCIONÁ UN PLAN ARRIBA PARA CONTINUAR
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER CON LEGALES (RECUPERADO Y MANTENIDO INTACTO) ─── */}
      <footer className="relative z-50 py-20 border-t border-white/10 bg-[#09090b] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left">
          
          <div className="space-y-4 max-w-xs">
             <h3 className="font-black text-2xl italic text-white tracking-tighter">
               TUJAGUE <span className="text-emerald-500">STRENGTH</span>
             </h3>
             <p className="text-zinc-500 text-xs italic tracking-tight font-medium leading-relaxed">
               "Te doy las herramientas, vos ponés el esfuerzo. Biomecánica aplicada y entrenamiento de fuerza real."
             </p>
             <p className="text-zinc-600 text-[10px] tracking-[0.3em] font-bold uppercase mt-6">
               &copy; {new Date().getFullYear()} Luciano Tujague.
             </p>
          </div>

          <div className="flex flex-col gap-4">
             <h4 className="text-emerald-500 font-black tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block uppercase">Contacto Directo</h4>
             <div className="flex flex-col gap-3 text-sm font-bold text-white tracking-wide">
                <a href="mailto:luciano2004tujague20@gmail.com" className="hover:text-emerald-400 transition-colors">Email Oficial</a>
                <a href="https://instagram.com/tujague.strenght" target="_blank" className="hover:text-emerald-400 transition-colors">Instagram</a>
                <a href={whatsappUrl} target="_blank" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <h4 className="text-emerald-500 font-black tracking-widest text-xs border-b border-emerald-500/20 pb-2 inline-block uppercase">
               Marco Legal
             </h4>
             <div className="flex flex-col gap-3 text-[10px] font-black tracking-widest text-zinc-500">
                <Link href="/legal" className="hover:text-white transition-colors uppercase">
                  Términos y Condiciones
                </Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">
                  Política de Privacidad
                </Link>
                <Link href="/legal" className="hover:text-white transition-colors uppercase">
                  Baja del Servicio
                </Link>
             </div>
          </div>

        </div>
      </footer>
    </main>
  );
}