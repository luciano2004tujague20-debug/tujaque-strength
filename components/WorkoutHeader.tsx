// components/WorkoutHeader.tsx
"use client";

import { useRouter } from "next/navigation"; // Usamos useRouter de Next.js

interface WorkoutHeaderProps {
  macrocycle: string | undefined;
  mesocycle: string | undefined;
  week: number;
  totalWeeks: number;
  dayName: string;
  focus: string;
}

export default function WorkoutHeader({ macrocycle, mesocycle, week, totalWeeks, dayName, focus }: WorkoutHeaderProps) {
  const router = useRouter(); // Inicializamos el router

  return (
    <div className="bg-[#050505] border-b border-zinc-800/80 pt-10 pb-6 px-4 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        
        {/* 🔥 EL BOTÓN DE VOLVER ATRÁS 🔥 */}
        <button 
          onClick={() => router.back()} // Esto te lleva a la página anterior (el Dashboard)
          className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-white transition"
          aria-label="Volver atrás"
        >
          {/* Icono de Flecha Izquierda (puedes usar una imagen o un SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* Título y Detalles (Alineado con el botón) */}
        <div className="flex-1">
          <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1">
             Semana {week} de {totalWeeks} • {mesocycle}
          </p>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
            {dayName}: <span className="text-amber-500">{focus}</span>
          </h1>
        </div>

      </div>
    </div>
  );
}