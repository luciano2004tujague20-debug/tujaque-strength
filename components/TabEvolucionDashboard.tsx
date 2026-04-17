import React from 'react';
import FeatureCard from '@/components/FeatureCard';
import TabEvolucion from "@/components/dashboard/TabEvolucion"; // El componente que ya tenías
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TabEvolucionDashboardProps {
  canViewRMs: boolean;
  whatsappUpsellUrl: string;
  handleRestrictedClick: (feature: string) => void;
  order: any;
  checkin: any;
  checkinHistory: any[];
  rms: any;
  totalAbsoluto: number;
  rmAiLoading: boolean;
  rmAiFeedback: string;
  handleAnalyzeRMs: () => void;
  calcLift: string;
  setCalcLift: (val: string) => void;
  calcPercent: number;
  setCalcPercent: (val: number) => void;
  calculatedWeight: number;
  handleGenerateWarmup: () => void;
  generatingWarmup: boolean;
  warmupPlan: string;
  groupedTrophies: any;
  shareTrophies: () => void;
}

export default function TabEvolucionDashboard({
  canViewRMs, whatsappUpsellUrl, handleRestrictedClick, order, checkin, checkinHistory, rms,
  totalAbsoluto, rmAiLoading, rmAiFeedback, handleAnalyzeRMs, calcLift, setCalcLift,
  calcPercent, setCalcPercent, calculatedWeight, handleGenerateWarmup, generatingWarmup,
  warmupPlan, groupedTrophies, shareTrophies
}: TabEvolucionDashboardProps) {

  // 🔥 LÓGICA DE GRÁFICAS MOVIDA AQUÍ PARA LIMPIAR PAGE.TSX 🔥
  const initialWeight = Number(order?.body_weight) || 70;
  const currentWeight = Number(checkin?.weight) || initialWeight;
  const isCut = order?.goal === 'deficit' || order?.plan_title?.toLowerCase().includes('cut');
  const targetWeight = isCut ? initialWeight - 5 : initialWeight + 5;
  
  let progressPercent = Math.round(((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100);
  if (isNaN(progressPercent) || progressPercent < 0) progressPercent = 0;
  if (progressPercent > 100) progressPercent = 100;

  let weightChartData: any[] = [];
  if (checkinHistory && checkinHistory.length > 1) {
      weightChartData = checkinHistory.map((entry, index) => ({
          date: entry.created_at ? new Date(entry.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : `Semana ${index + 1}`,
          weight: Number(entry.weight) || initialWeight
      }));
  } else {
      const isGaining = targetWeight > initialWeight;
      const isCutting = targetWeight < initialWeight;
      let midWeight = initialWeight;
      if (isCutting) midWeight = initialWeight - ((initialWeight - currentWeight) * 0.5);
      else if (isGaining) midWeight = initialWeight + ((currentWeight - initialWeight) * 0.5);

      weightChartData = [
        { date: 'Día 1', weight: initialWeight },
        { date: 'Progreso', weight: Number(midWeight.toFixed(1)) },
        { date: 'Hoy', weight: currentWeight }
      ];
  }

  return (
    <>
      {!canViewRMs ? (
        // 🔥 VISTA DE CATÁLOGO PREMIUM BLOQUEADO (EVOLUCIÓN) 🔥
        <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black italic text-black uppercase tracking-tighter">Métricas <span className="text-amber-500">Premium</span></h2>
                <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">El seguimiento de métricas y análisis de proporciones pertenecen al sistema Élite.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                <FeatureCard 
                    title="Analítica de RMs (IA)" 
                    description="La IA evalúa tus levantamientos máximos para detectar debilidades estructurales." 
                    isLocked={true} 
                    onLockClick={() => handleRestrictedClick('Análisis Biomecánico de RMs')} 
                />
                <FeatureCard 
                    title="Protocolos de Aproximación" 
                    description="Genera series de calentamiento exactas basadas en tus porcentajes diarios." 
                    isLocked={true} 
                    onLockClick={() => handleRestrictedClick('Calculadora de Calentamiento')} 
                />
                <FeatureCard 
                    title="Sistema de Logros BII" 
                    description="Desbloquea medallas de élite al alcanzar marcas históricas de fuerza." 
                    isLocked={true} 
                    onLockClick={() => handleRestrictedClick('Trophies & Leaderboard')} 
                />
            </div>
            
            <div className="mt-12 text-center">
                <a href={whatsappUpsellUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-8 py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95">
                    POSTULARME A MENTORÍA ÉLITE 🚀
                </a>
            </div>
        </div>
      ) : (
        /* 🔥 SI ES ÉLITE, MOSTRAMOS EL DASHBOARD COMPLETO DE EVOLUCIÓN 🔥 */
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* SUB-MENÚ */}
            <div className="flex justify-center border-b border-gray-200 mb-8 pt-4">
                <button className="px-6 py-3 border-b-2 border-black font-bold text-black text-sm transition-all">Métricas</button>
                <button className="px-6 py-3 font-medium text-gray-400 hover:text-gray-600 text-sm transition-all">Fotos</button>
                <button className="px-6 py-3 font-medium text-gray-400 hover:text-gray-600 text-sm transition-all">Logros</button>
            </div>

            {/* GRÁFICA DE PROGRESO CORPORAL */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-black mb-6">Progreso</h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                        <YAxis domain={['auto', 'auto']} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `${value}kg`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#000', fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="weight" stroke="#1A1A1A" strokeWidth={3} dot={{ r: 5, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#1A1A1A' }} isAnimationActive={false} />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TARJETAS DE OBJETIVO Y CUMPLIMIENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-black mb-6">Objetivo</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Peso Inicial</span>
                            <span className="font-bold text-gray-800">{initialWeight} kg</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Peso Actual</span>
                            <span className="font-bold text-black">{currentWeight} kg</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-500 font-medium">Peso Objetivo</span>
                            <span className="font-black text-emerald-600">{targetWeight} kg</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-black mb-4 w-full text-center">Cumplimiento</h3>
                    <div className="relative w-32 h-32 mt-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1A1A1A" strokeWidth="10" strokeDasharray={`${progressPercent * 2.51} 251`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-black">{progressPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA DE RMS ORIGINAL */}
            <TabEvolucion rms={rms} />

            {/* ANÁLISIS DE LA IA (RMS) */}
            <div className="bg-blue-50 border border-blue-100 p-8 md:p-12 rounded-[2rem] relative overflow-hidden mt-10 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-black italic text-black uppercase flex items-center gap-3 tracking-tight mb-2">
                            <span className="text-3xl">🤖</span> Análisis Estructural <span className="text-blue-500">AI</span>
                        </h3>
                        <p className="text-gray-500 text-sm font-medium">Detectá desbalances evaluando las proporciones de tus levantamientos.</p>
                    </div>
                    <button
                        onClick={handleAnalyzeRMs}
                        disabled={rmAiLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 flex-shrink-0 w-full sm:w-auto active:scale-95"
                    >
                        {rmAiLoading ? 'PROCESANDO...' : 'AUDITAR MARCAS'}
                    </button>
                </div>
                
                {rmAiFeedback && (
                    <div className="mt-8 bg-white border border-blue-200 p-6 rounded-[1.5rem] animate-in slide-in-from-top-4 shadow-sm">
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-3 flex items-center gap-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Reporte Biomecánico
                        </p>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{rmAiFeedback}</p>
                    </div>
                )}
            </div>

            {/* CALCULADORA DE PORCENTAJES Y CALENTAMIENTO IA */}
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2rem] shadow-sm relative overflow-hidden mt-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h3 className="text-2xl font-black italic text-black uppercase tracking-tight flex items-center gap-3">
                            <span className="text-3xl">🔥</span> Calculadora de <span className="text-amber-500">Porcentajes</span>
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">Calculá tus series efectivas y generá un calentamiento específico con IA.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                        <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest mb-3 block">1. Movimiento</label>
                        <select value={calcLift} onChange={(e) => setCalcLift(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-black text-black uppercase tracking-widest outline-none focus:border-amber-500 shadow-sm">
                            <option value="squat">Sentadilla</option>
                            <option value="bench">Press Banca</option>
                            <option value="deadlift">Peso Muerto</option>
                            <option value="military">Press Militar</option>
                            <option value="dips">Fondos</option>
                        </select>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest block">2. Intensidad</label>
                            <span className="text-amber-600 font-black text-lg bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{calcPercent}%</span>
                        </div>
                        <input type="range" min="40" max="100" step="2.5" value={calcPercent} onChange={(e) => setCalcPercent(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer mt-2" />
                    </div>

                    <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex flex-col items-center justify-center shadow-md">
                        <span className="text-[10px] md:text-xs font-black uppercase text-zinc-400 tracking-widest mb-1">Carga a utilizar</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl md:text-5xl font-black text-white">{calculatedWeight}</span>
                            <span className="text-amber-500 font-black text-sm">KG</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleGenerateWarmup}
                    disabled={generatingWarmup || calculatedWeight === 0}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3"
                >
                    {generatingWarmup ? 'DISEÑANDO APROXIMACIÓN...' : '🤖 GENERAR PROTOCOLO DE CALENTAMIENTO AI'}
                </button>

                {warmupPlan && (
                    <div className="mt-8 bg-amber-50/50 border border-amber-200 p-6 md:p-8 rounded-[1.5rem] animate-in slide-in-from-top-4">
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> Protocolo de Aproximación
                        </p>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{warmupPlan}</p>
                    </div>
                )}
            </div>

            {/* TROFEOS (LOGROS) */}
            <div className="pt-16 mt-16 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-black italic text-black uppercase tracking-tighter">Logros <span className="text-amber-500">Élite</span></h3>
                        <p className="text-gray-500 text-xs mt-2 font-medium tracking-wide">TOTAL ABSOLUTO: <span className="text-amber-600 font-black text-lg ml-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">{totalAbsoluto} KG</span></p>
                    </div>
                    <button 
                        onClick={shareTrophies}
                        className="bg-black hover:bg-amber-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                        <span>Compartir Legado</span>
                    </button>
                </div>

                <div className="space-y-12">
                    {Object.entries(groupedTrophies).map(([category, items]: any, index) => (
                        <div key={index} className="animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <h4 className="text-amber-500 font-black tracking-[0.2em] text-xs uppercase mb-6 border-b border-gray-200 pb-3">{category}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {items.map((trophy: any) => (
                                    <div key={trophy.id} className={`p-5 rounded-[1.5rem] border transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden ${trophy.unlocked ? 'bg-white border-amber-200 shadow-sm scale-[1.02]' : 'bg-gray-50 border-gray-200 opacity-60 grayscale'}`}>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className={`text-4xl ${trophy.unlocked ? 'animate-pulse' : ''}`}>{trophy.icon}</span>
                                            {trophy.unlocked ? (
                                                <span className="text-white font-black text-[10px] bg-amber-500 px-2 py-0.5 rounded-sm">✓</span>
                                            ) : (
                                                <span className="text-gray-400 text-[10px] bg-gray-200 px-2 py-0.5 rounded-sm">🔒</span>
                                            )}
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className={`font-black italic uppercase text-[11px] tracking-tight leading-tight mb-1 ${trophy.unlocked ? 'text-black' : 'text-gray-500'}`}>{trophy.title}</h4>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${trophy.unlocked ? 'text-amber-600' : 'text-gray-400'}`}>{trophy.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </>
  );
}