import React from 'react';
import FeatureCard from '@/components/FeatureCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TabCheckinProps {
  canViewSNC: boolean;
  whatsappUpsellUrl: string;
  handleRestrictedClick: (feature: string) => void;
  checkin: any;
  setCheckin: (val: any) => void;
  handleSaveCheckin: (e: React.FormEvent) => void;
  savingCheckin: boolean;
  analyzingFatigue: boolean;
  fatigueVerdict: string;
  checkinHistory: any[];
}

export default function TabCheckin({
  canViewSNC,
  whatsappUpsellUrl,
  handleRestrictedClick,
  checkin,
  setCheckin,
  handleSaveCheckin,
  savingCheckin,
  analyzingFatigue,
  fatigueVerdict,
  checkinHistory
}: TabCheckinProps) {
  return (
    <>
      {!canViewSNC ? (
        // 🔥 NUEVA VISTA DE CATÁLOGO PREMIUM BLOQUEADO (CHECK-IN) 🔥
        <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black italic text-black uppercase tracking-tighter">Recuperación <span className="text-amber-500">Premium</span></h2>
                <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">El análisis de fatiga sistémica (SNC) es exclusivo de la Mentoría Élite.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                <FeatureCard 
                    title="Auditoría SNC" 
                    description="Registra tu fatiga, sueño y estrés para adaptar el volumen de entrenamiento de forma inteligente." 
                    isLocked={true} 
                    onLockClick={() => handleRestrictedClick('Auditoría SNC')} 
                />
                <FeatureCard 
                    title="Coach IA de Recuperación" 
                    description="Veredicto clínico en tiempo real sobre tu estado biológico y disposición para entrenar." 
                    isLocked={true} 
                    onLockClick={() => handleRestrictedClick('Coach IA')} 
                />
                <FeatureCard 
                    title="Gráficas Biométricas" 
                    description="Historial detallado de estrés, sueño y peso para la toma de decisiones del microciclo." 
                    isLocked={true} 
                    onLockClick={() => handleRestrictedClick('Gráficas Biométricas')} 
                />
            </div>
            
            <div className="mt-12 text-center">
                <a href={whatsappUpsellUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-8 py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95">
                    POSTULARME A MENTORÍA ÉLITE 🚀
                </a>
            </div>
        </div>
      ) : (
        /* 🔥 SI ES ÉLITE, MOSTRAMOS EL FORMULARIO Y GRÁFICAS DE CHECK-IN 🔥 */
        <div className="max-w-6xl mx-auto space-y-10 md:space-y-12 animate-in fade-in duration-500">
           <div className="bg-white border border-gray-100 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-sm relative overflow-hidden">
              
              <div className="text-center mb-10 md:mb-14 relative z-10">
                 <span className="bg-amber-50 text-amber-600 border border-amber-200 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Métricas de Alto Rendimiento</span>
                 <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic text-black tracking-tighter uppercase mb-4">AUDITORÍA DE <span className="text-amber-500 block sm:inline">RECUPERACIÓN</span></h2>
                 <p className="text-gray-500 text-sm md:text-base font-medium max-w-2xl mx-auto">Datos fundamentales para el ajuste auto-rregulado (RPE) y el cálculo de volumen semanal. La IA y el Coach analizarán su estado biológico.</p>
              </div>

              <form onSubmit={handleSaveCheckin} className="space-y-6 md:space-y-8 relative z-10 max-w-4xl mx-auto pb-10">
                 {/* PILAR 1: BIO-MARCADORES */}
                 <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm group hover:border-amber-200 transition-colors">
                    <h3 className="text-amber-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><span>🧬</span> Pilar 1: Bio-Marcadores Diarios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl hover:border-amber-300 transition-colors">
                           <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest mb-3 block">Peso Corporal (KG)</label>
                           <input type="number" step="0.1" required value={checkin.weight} onChange={e => setCheckin({...checkin, weight: e.target.value})} className="w-full bg-transparent text-3xl md:text-4xl font-black text-black outline-none focus:text-amber-500 transition-colors placeholder:text-gray-300" placeholder="Ej: 80.5" />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl hover:border-blue-300 transition-colors">
                           <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest mb-3 block">Sueño Efectivo (Horas)</label>
                           <input type="number" step="0.5" required value={checkin.sleep} onChange={e => setCheckin({...checkin, sleep: e.target.value})} className="w-full bg-transparent text-3xl md:text-4xl font-black text-black outline-none focus:text-blue-500 transition-colors placeholder:text-gray-300" placeholder="Ej: 7.5" />
                        </div>
                    </div>
                 </div>

                 {/* PILAR 2: METABOLISMO Y NUTRICIÓN */}
                 <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm group hover:border-orange-200 transition-colors">
                    <h3 className="text-orange-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><span>🥩</span> Pilar 2: Metabolismo y Nutrición</h3>
                    <div className="space-y-8">
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                            <div className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest mb-4 flex justify-between items-center">
                              <span>Adherencia Nutricional (Semana)</span>
                              <span className="text-orange-600 text-xl md:text-2xl font-black italic bg-orange-100 px-3 py-1 rounded-xl border border-orange-200">{checkin.adherence}%</span>
                            </div>
                            <input type="range" min="0" max="100" step="5" required value={checkin.adherence} onChange={e => setCheckin({...checkin, adherence: e.target.value})} className="w-full accent-orange-500 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer border border-gray-300" />
                            <div className="flex justify-between text-[9px] text-gray-400 mt-3 font-black uppercase tracking-widest">
                              <span>0% (Desastre)</span>
                              <span>100% (Perfecto)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                                <div className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 flex justify-between items-center">
                                  <span>Nivel de Hambre</span>
                                  <span className="text-black font-black">{checkin.hunger}/10</span>
                                </div>
                                <input type="range" min="1" max="10" required value={checkin.hunger} onChange={e => setCheckin({...checkin, hunger: e.target.value})} className="w-full accent-black h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer" />
                                <div className="flex justify-between text-[8px] text-gray-400 mt-2 font-bold uppercase"><span>Saciado</span><span>Hambriento</span></div>
                            </div>
                            
                            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                                <div className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 flex justify-between items-center">
                                  <span>Energía General</span>
                                  <span className="text-amber-500 font-black">{checkin.energy}/10</span>
                                </div>
                                <input type="range" min="1" max="10" required value={checkin.energy} onChange={e => setCheckin({...checkin, energy: e.target.value})} className="w-full accent-amber-500 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer" />
                                <div className="flex justify-between text-[8px] text-gray-400 mt-2 font-bold uppercase"><span>Agotado</span><span>Eléctrico</span></div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* PILAR 3: RENDIMIENTO Y FATIGA */}
                 <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm group hover:border-red-200 transition-colors">
                    <h3 className="text-red-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><span>⚠️</span> Pilar 3: Fatiga del SNC y Articular</h3>
                    <div className="space-y-8">
                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl hover:border-red-200 transition-all">
                            <div className="text-[10px] md:text-xs font-black uppercase text-red-500 tracking-widest mb-4 flex justify-between items-center">
                              <span>Estrés Sistémico General</span>
                              <span className="text-red-600 text-xl md:text-2xl font-black italic bg-red-100 px-3 py-1 rounded-xl border border-red-200">{checkin.stress}/10</span>
                            </div>
                            <input type="range" min="1" max="10" required value={checkin.stress} onChange={e => setCheckin({...checkin, stress: e.target.value})} className="w-full accent-red-500 h-2 bg-white rounded-full appearance-none cursor-pointer border border-red-200" />
                            <div className="flex justify-between text-[9px] text-red-400 mt-3 font-black uppercase tracking-widest"><span>1 (Calmado)</span><span>10 (Colapsado)</span></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                                <div className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 flex justify-between items-center">
                                  <span>Recuperación Muscular</span>
                                  <span className="text-blue-500 font-black">{checkin.recovery}/10</span>
                                </div>
                                <input type="range" min="1" max="10" required value={checkin.recovery} onChange={e => setCheckin({...checkin, recovery: e.target.value})} className="w-full accent-blue-500 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer" />
                                <div className="flex justify-between text-[8px] text-gray-400 mt-2 font-bold uppercase"><span>Destruido (DOMS)</span><span>Recuperado al 100%</span></div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl">
                                <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Molestia Articular Aguda</label>
                                <select value={checkin.joint_pain} onChange={e => setCheckin({...checkin, joint_pain: e.target.value})} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs text-black font-bold outline-none focus:border-red-500 transition-colors shadow-sm">
                                    <option value="ninguno">Ninguno (Todo OK)</option>
                                    <option value="rodillas">Rodilla / Tendón Rotuliano</option>
                                    <option value="lumbares">Espalda Baja / Lumbares</option>
                                    <option value="hombros">Hombro / Manguito Rotador</option>
                                    <option value="codos">Codos / Tendinitis</option>
                                    <option value="muñecas">Muñecas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* PILAR 4: EJECUCIÓN */}
                 <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm group hover:border-amber-200 transition-colors">
                    <h3 className="text-amber-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><span>⚔️</span> Pilar 4: Disciplina BII-Vintage</h3>
                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <p className="text-sm md:text-base font-black text-black uppercase tracking-tight mb-1">¿Alcanzaste el Fallo Muscular?</p>
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium">¿Tus Top Sets llegaron al fallo real (RIR 0) con técnica estricta, o te guardaste repeticiones?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" checked={checkin.hit_failure} onChange={(e) => setCheckin({...checkin, hit_failure: e.target.checked})} className="sr-only peer" />
                            <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-amber-500 shadow-sm"></div>
                            <span className={`ml-4 text-xs font-black uppercase tracking-widest ${checkin.hit_failure ? 'text-amber-500' : 'text-gray-400'}`}>{checkin.hit_failure ? 'SÍ, FALLO REAL' : 'NO, ME GUARDÉ REPS'}</span>
                        </label>
                    </div>

                    <div className="mt-6 bg-gray-50 border border-gray-200 p-5 rounded-2xl focus-within:border-amber-400 transition-colors">
                       <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-widest mb-3 block">Registro Clínico Libre</label>
                       <textarea value={checkin.notes} onChange={e => setCheckin({...checkin, notes: e.target.value})} placeholder="Anotaciones adicionales para el Coach..." className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm md:text-base font-medium text-black outline-none resize-none h-24 md:h-32 placeholder:text-gray-400 custom-scrollbar shadow-sm focus:border-amber-400" />
                    </div>
                 </div>

                 <div className="pt-4 md:pt-6">
                     <button type="submit" disabled={savingCheckin} className="w-full bg-black hover:bg-zinc-800 text-white py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-md hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                        {savingCheckin ? 'COMUNICANDO DATOS AL SISTEMA...' : 'ENVIAR REPORTE AL HEAD COACH 🚀'}
                     </button>
                 </div>

                 {/* VEREDICTO DEL COACH EN TIEMPO REAL */}
                 {(analyzingFatigue || fatigueVerdict) && (
                     <div className="mt-8 mb-4 bg-amber-50 border border-amber-100 p-6 md:p-8 rounded-[2rem] shadow-sm animate-in slide-in-from-top-4">
                         <p className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                             {analyzingFatigue ? (
                                 <><span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span> El Coach IA está auditando tu SNC...</>
                             ) : (
                                 <><span className="text-xl">⚡</span> Dictamen de Entrenamiento (Tujague AI)</>
                             )}
                         </p>
                         {fatigueVerdict && (
                             <p className="text-sm md:text-base text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{fatigueVerdict}</p>
                         )}
                     </div>
                 )}
                 
              </form>
           </div>

           {/* GRÁFICO DE FATIGA SEMANAL */}
           {checkinHistory.length > 0 && (
              <div className="bg-white border border-gray-100 p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] shadow-sm animate-in fade-in zoom-in duration-500 mb-24">
                 <h3 className="text-2xl md:text-4xl font-black italic text-black mb-10 md:mb-12 text-center md:text-left">Gráfico de <span className="text-amber-500 block sm:inline">Fatiga Semanal</span></h3>
                 
                 <div className="h-[300px] md:h-[400px] w-full bg-white p-2 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-w-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={checkinHistory} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                       <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                       <YAxis yAxisId="left" stroke="#9ca3af" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} dx={-10} />
                       <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} domain={[0, 10]} dx={10} />
                       
                       <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '16px', padding: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }} />
                       <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 'bold', color: '#4b5563' }} iconType="circle" />
                       
                       <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                       <Line yAxisId="right" type="monotone" dataKey="stress" name="Estrés (1-10)" stroke="#ef4444" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                       <Line yAxisId="right" type="monotone" dataKey="sleep" name="Sueño (h)" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>
           )}
        </div>
      )}
    </>
  );
}