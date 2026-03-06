"use client";
import React, { useState } from 'react';

export default function PricingV2({ onSelectPlan }: { onSelectPlan?: (plan: any) => void }) {
  // El sistema recuerda qué opción seleccionó el usuario en cada una de las 3 cajas
  const [mesoOption, setMesoOption] = useState("mesociclo-fuerza");
  const [sprintOption, setSprintOption] = useState("semanal-5-6");
  const [eliteOption, setEliteOption] = useState("mensual-5-6");

  // Diccionarios con los datos exactos de tu base de datos
  const planesMesociclo: Record<string, any> = {
    "mesociclo-fuerza": { id: "mesociclo-fuerza", title: "Mesociclo Fuerza", subtitle: "Para el atleta independiente", price: 30000 },
    "mesociclo-hipertrofia": { id: "mesociclo-hipertrofia", title: "Mesociclo Hipertrofia", subtitle: "Para el atleta independiente", price: 30000 }
  };

  const planesSprint: Record<string, any> = {
    "semanal-3-4": { id: "semanal-3-4", title: "Sprint (3 a 4 días)", subtitle: "Diagnóstico Técnico (7 Días)", price: 20000 },
    "semanal-5-6": { id: "semanal-5-6", title: "Sprint (5 a 6 días)", subtitle: "Diagnóstico Técnico (7 Días)", price: 32000 },
    "semanal-7": { id: "semanal-7", title: "Sprint (7 días Full)", subtitle: "Diagnóstico Técnico (7 Días)", price: 38000 }
  };

  const planesElite: Record<string, any> = {
    "mensual-3-4": { id: "mensual-3-4", title: "Coaching (3 a 4 días)", subtitle: "El Ecosistema Élite", price: 50000 },
    "mensual-5-6": { id: "mensual-5-6", title: "Coaching (5 a 6 días)", subtitle: "El Ecosistema Élite", price: 100000 },
    "mensual-7": { id: "mensual-7", title: "Coaching (7 días Full)", subtitle: "El Ecosistema Élite", price: 115000 }
  };

  return (
    <section id="pricing-section" className="relative z-0 py-20 bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            No vendemos rutinas.<br className="hidden md:block" /> Forjamos Atletas.
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Entrenamiento basado en intensidad, control biomecánico y el Método BII-Vintage. Elige tu nivel de compromiso y entra al sistema.
          </p>
        </div>

        {/* LAS 3 CAJAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Caja 1: Mesociclo */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col transition-all hover:border-neutral-600">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Mesociclo Estático</h3>
            <p className="text-emerald-500 text-sm font-semibold uppercase mb-6">Para el atleta independiente</p>
            <p className="text-neutral-400 text-sm mb-8 flex-grow">
              Diseñado para quienes ya tienen una base técnica sólida y saben autogestionar su recuperación. 4 semanas de programación BII-Vintage pura. Tú pones el trabajo, nosotros la estructura.
            </p>
            <ul className="space-y-4 mb-8 text-sm text-neutral-300">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> 4 semanas de programación (PDF)</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> Pautas estrictas de ejecución y RPE</li>
              <li className="flex items-start text-neutral-500"><span className="mr-2">✕</span> Sin acceso a métricas ni soporte</li>
            </ul>
            
            <div className="mb-4 mt-auto">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Elegí tu enfoque:</label>
              <select 
                value={mesoOption}
                onChange={(e) => setMesoOption(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none cursor-pointer"
              >
                <option value="mesociclo-fuerza">Fuerza Absoluta ($30.000)</option>
                <option value="mesociclo-hipertrofia">Hipertrofia Estética ($30.000)</option>
              </select>
            </div>

            <button 
              onClick={() => onSelectPlan && onSelectPlan(planesMesociclo[mesoOption])}
              className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest bg-neutral-800 hover:bg-neutral-700 transition-colors">
              Obtener Mesociclo
            </button>
          </div>

          {/* Caja 2: Sprint */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col transition-all hover:border-neutral-600">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Sprint de Calibración</h3>
            <p className="text-emerald-500 text-sm font-semibold uppercase mb-6">Diagnóstico Técnico (7 Días)</p>
            <p className="text-neutral-400 text-sm mb-8 flex-grow">
              Si tus marcas no suben o sientes molestias bajo la barra, el problema es mecánico. Registra tus cargas y recibe una auditoría de video exacta de tu levantamiento principal.
            </p>
            <ul className="space-y-4 mb-8 text-sm text-neutral-300">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> 7 días de acceso al Dashboard</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> 1 Auditoría de video (Revisión clave)</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> Registro de métricas de sesión</li>
            </ul>
            
            <div className="mb-4 mt-auto">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Días de entrenamiento:</label>
              <select 
                value={sprintOption}
                onChange={(e) => setSprintOption(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none cursor-pointer"
              >
                <option value="semanal-3-4">3 a 4 días ($20.000)</option>
                <option value="semanal-5-6">5 a 6 días ($32.000)</option>
                <option value="semanal-7">7 días Full ($38.000)</option>
              </select>
            </div>

            <button 
              onClick={() => onSelectPlan && onSelectPlan(planesSprint[sprintOption])}
              className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest bg-neutral-800 hover:bg-neutral-700 transition-colors">
              Iniciar Sprint
            </button>
          </div>

          {/* Caja 3: Élite (Destacada) */}
          <div className="bg-neutral-900 border-2 border-emerald-500 rounded-2xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(16,185,129,0.15)] transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              Recomendado
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Coaching Mensual</h3>
            <p className="text-emerald-400 text-sm font-semibold uppercase mb-6">El Ecosistema Élite</p>
            <p className="text-neutral-300 text-sm mb-8 flex-grow">
              Delegación absoluta. Rutinas ajustadas semana a semana según tu fatiga central (SNC), auditoría técnica continua y el respaldo de Tujague AI para afinar tu rendimiento.
            </p>
            <ul className="space-y-4 mb-8 text-sm text-neutral-200">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> Programación dinámica semanal</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> Análisis profundo de fatiga (SNC)</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> Auditoría de video continua + IA</li>
            </ul>

            <div className="mb-4 mt-auto">
              <label className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-2 block">Días de entrenamiento:</label>
              <select 
                value={eliteOption}
                onChange={(e) => setEliteOption(e.target.value)}
                className="w-full bg-neutral-950 border border-emerald-500/50 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none cursor-pointer"
              >
                <option value="mensual-3-4">3 a 4 días ($50.000)</option>
                <option value="mensual-5-6">5 a 6 días ($100.000)</option>
                <option value="mensual-7">7 días Full ($115.000)</option>
              </select>
            </div>

            <button 
              onClick={() => onSelectPlan && onSelectPlan(planesElite[eliteOption])}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Entrar al Sistema Élite
            </button>
          </div>

        </div>

        {/* TABLA COMPARATIVA */}
        <div className="max-w-4xl mx-auto overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="py-4 px-4 text-neutral-400 font-medium text-sm w-1/3">Características</th>
                <th className="py-4 px-4 text-center font-bold text-sm w-1/5">Mesociclo<br/><span className="text-neutral-500 font-normal text-xs">(4 Semanas)</span></th>
                <th className="py-4 px-4 text-center font-bold text-sm w-1/5">Sprint<br/><span className="text-neutral-500 font-normal text-xs">(7 Días)</span></th>
                <th className="py-4 px-4 text-center text-emerald-500 font-bold text-sm w-1/5">Élite<br/><span className="text-emerald-700 font-normal text-xs">(Mensual)</span></th>
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-300">
              <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                <td className="py-4 px-4 pr-8 whitespace-nowrap">Programación BII-Vintage</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Estática (PDF)</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Dinámica (1 Sem)</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Dinámica (Semanal)</td>
              </tr>
              <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                <td className="py-4 px-4 pr-8 whitespace-nowrap">Acceso al Dashboard App</td>
                <td className="py-4 px-4 text-center text-neutral-600">✕</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Básico</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Total</td>
              </tr>
              <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                <td className="py-4 px-4 pr-8 whitespace-nowrap">Auditoría Técnica (Video)</td>
                <td className="py-4 px-4 text-center text-neutral-600">✕</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">1 Revisión</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Continua</td>
              </tr>
              <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                <td className="py-4 px-4 pr-8 whitespace-nowrap">Análisis Fisiológico</td>
                <td className="py-4 px-4 text-center text-neutral-600">✕</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Cargas base</td>
                <td className="py-4 px-4 text-center whitespace-nowrap">Fatiga Central (SNC)</td>
              </tr>
              <tr className="hover:bg-neutral-900/50">
                <td className="py-4 px-4 pr-8 whitespace-nowrap">Tujague AI & Soporte Directo</td>
                <td className="py-4 px-4 text-center text-neutral-600">✕</td>
                <td className="py-4 px-4 text-center text-neutral-600">✕</td>
                <td className="py-4 px-4 text-center text-emerald-500">✓</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}