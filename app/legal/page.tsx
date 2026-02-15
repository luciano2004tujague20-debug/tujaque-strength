"use client";

import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white p-6 md:p-20 font-sans">
      <Link href="/">
        <button className="mb-10 text-emerald-500 font-black  tracking-widest text-xs hover:underline">
          ← Volver al Inicio
        </button>
      </Link>
      
      <div className="max-w-3xl mx-auto space-y-16">
        <section>
          <h1 className="text-4xl font-black italic  mb-8 text-emerald-500">Términos y Condiciones</h1>
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
            <p><strong>1. Responsabilidad Física:</strong> El usuario reconoce que la práctica de levantamiento de pesas (Powerlifting/Bodybuilding) conlleva riesgos físicos. Tujaque Strength no se hace responsable por lesiones derivadas de una mala ejecución técnica fuera de la supervisión directa.</p>
            <p><strong>2. Pagos y Reembolsos:</strong> Todos los planes (Semanales y Mensuales) son servicios digitales no reembolsables una vez que se ha enviado la planificación o se ha dado acceso al Dashboard.</p>
            <p><strong>3. Propiedad Intelectual:</strong> Las rutinas y el contenido del Dashboard son propiedad de Luciano Tujague y no pueden ser revendidos ni distribuidos.</p>
          </div>
        </section>

        <section>
          <h1 className="text-4xl font-black italic  mb-8 text-emerald-500">Política de Privacidad</h1>
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
            <p><strong>1. Datos Recopilados:</strong> Solo almacenamos tu email y nombre para gestionar el acceso al sistema. Los videos subidos son utilizados únicamente para el análisis biomecánico y son privados entre el coach y el atleta.</p>
            <p><strong>2. Uso de la Información:</strong> No compartimos ni vendemos tus datos a terceros. Tu información de contacto se usa exclusivamente para comunicaciones relacionadas con tu entrenamiento.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
