import React from 'react';

// Definimos las propiedades que necesita la tarjeta para funcionar
interface FeatureCardProps {
  title: string;           // El nombre de la herramienta (Ej: "Tujague AI")
  description: string;     // Para qué sirve la herramienta
  isLocked: boolean;       // Verdadero si el usuario es de la Bóveda, Falso si es Premium
  onLockClick: () => void; // La acción de abrir el modal si está bloqueado
}

export default function FeatureCard({ title, description, isLocked, onLockClick }: FeatureCardProps) {
  return (
    // Contenedor principal de la tarjeta
    <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-start transition-all hover:border-zinc-700">
      
      {/* Textos de la tarjeta */}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-4">{description}</p>
      
      {/* Botón visual de ingreso (queda debajo del candado si está bloqueado) */}
      <button className="mt-auto px-6 py-2 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition-colors">
        Ingresar
      </button>

      {/* 🔥 MAGIA CONDICIONAL: El escudo de seguridad */}
      {/* Si isLocked es 'true', React dibuja esta capa extra encima de la tarjeta */}
      {isLocked && (
        <div 
          onClick={onLockClick} // Al hacer clic aquí, avisamos al Dashboard que abra el Modal
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group"
        >
          {/* Círculo decorativo con el ícono del candado */}
          <div className="bg-zinc-900 p-3 rounded-full border border-emerald-500/50 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      )}
      
    </div>
  );
}