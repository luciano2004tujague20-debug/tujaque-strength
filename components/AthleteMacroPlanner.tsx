"use client";

const MONTHS_STRUCTURE = [
  { name: "Mes 1", weeks: [1, 2, 3, 4] },
  { name: "Mes 2", weeks: [5, 6, 7, 8] },
  { name: "Mes 3", weeks: [9, 10, 11, 12, 13] },
  { name: "Mes 4", weeks: [14, 15, 16, 17] },
  { name: "Mes 5", weeks: [18, 19, 20, 21] },
  { name: "Mes 6", weeks: [22, 23, 24, 25, 26] },
  { name: "Mes 7", weeks: [27, 28, 29, 30] },
  { name: "Mes 8", weeks: [31, 32, 33, 34] },
  { name: "Mes 9", weeks: [35, 36, 37, 38, 39] },
  { name: "Mes 10", weeks: [40, 41, 42, 43] },
  { name: "Mes 11", weeks: [44, 45, 46, 47] },
  { name: "Mes 12", weeks: [48, 49, 50, 51, 52] },
];

// 🔥 DEFINICIÓN ESTRICTA DE TIPOS (ESTO EVITA EL ERROR INTRINSIC ATTRIBUTES)
interface AthleteMacroPlannerProps {
    annualPlan: Record<number, any>;
    currentWeek: number;
    onWeekSelect?: (weekStr: number) => void;
}

export default function AthleteMacroPlanner({ annualPlan, currentWeek, onWeekSelect }: AthleteMacroPlannerProps) {
  
  return (
    <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
            <div>
                <h3 className="text-2xl font-black italic text-black uppercase tracking-tight">Proyección <span className="text-amber-500">Anual</span></h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Estructura BII-Vintage (52 Semanas)</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                <span className="text-[9px] text-amber-600 font-black uppercase tracking-widest block mb-0.5">Fase Activa</span>
                <span className="text-sm font-black text-amber-700">Semana {currentWeek || 1}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {MONTHS_STRUCTURE.map((month, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <h4 className="text-black font-black uppercase text-sm mb-3 border-b border-gray-200 pb-2">{month.name}</h4>
                    <div className="space-y-2">
                        {month.weeks.map(weekNum => {
                            const isCurrent = currentWeek === weekNum;
                            const hasPlan = annualPlan && annualPlan[weekNum];
                            
                            return (
                                <div 
                                    key={weekNum} 
                                    onClick={() => onWeekSelect && onWeekSelect(weekNum)}
                                    className={`cursor-pointer flex flex-col p-3 rounded-xl border transition-all hover:scale-[1.02] ${isCurrent ? 'bg-black border-black text-white shadow-md' : hasPlan ? 'bg-white border-amber-200 text-gray-800 hover:border-amber-400' : 'bg-white/50 border-gray-100 text-gray-400 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-amber-400' : 'text-gray-500'}`}>Semana {weekNum}</span>
                                        {hasPlan && !isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                                        {isCurrent && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase truncate ${isCurrent ? 'text-gray-300' : hasPlan ? 'text-amber-600' : 'text-gray-300'}`}>
                                        {hasPlan ? annualPlan[weekNum]?.phase || 'Fase Planificada' : 'Por Diseñar'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}