import React from 'react';

// 🔥 Agregamos whatsappUrl a las propiedades
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  whatsappUrl: string; 
}

export default function UpgradeModal({ isOpen, onClose, featureName, whatsappUrl }: UpgradeModalProps) {
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-amber-500/30 rounded-[2rem] shadow-2xl text-center">
        
        <div className="mb-4 text-amber-500">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">
          Acceso <span className="text-amber-500">Restringido</span>
        </h2>
        
        <p className="text-zinc-400 mb-8 font-medium">
          La función de <strong className="text-amber-400">{featureName}</strong> es exclusiva para los atletas de los programas Élite y Leyenda.
        </p>
        
        <div className="flex flex-col gap-3">
          {/* 🔥 EL BOTÓN AHORA REDIRIGE A TU WHATSAPP 🔥 */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl uppercase tracking-widest hover:bg-amber-400 transition-colors flex justify-center items-center"
          >
            Mejorar mi Plan 🚀
          </a>
          
          <button 
            onClick={onClose}
            className="w-full py-4 bg-transparent text-zinc-500 font-bold rounded-2xl hover:text-white transition-colors text-xs uppercase tracking-widest"
          >
            Volver al Inicio
          </button>
        </div>
        
      </div>
    </div>
  );
}