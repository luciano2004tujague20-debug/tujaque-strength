"use client";

import Link from "next/link";

export default function ExitoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_60%)] pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 bg-[#0a0a0c] border border-emerald-900/30 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-2xl w-full text-center backdrop-blur-xl animate-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          ✅
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-md">
          OPERACIÓN <span className="text-emerald-500">EXITOSA</span>
        </h1>
        
        <p className="text-zinc-400 font-medium text-sm md:text-base mb-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          Tu pago/comprobante ha sido procesado. El Coach validará tu ingreso en breve. <br/><br/>
          <strong className="text-emerald-400">A partir de ahora, todo tu entrenamiento se gestionará exclusivamente desde la App Oficial.</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
          
          {/* Tarjeta ANDROID */}
          <div className="bg-[#050505] border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden group">
            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
              <span>🤖</span> Usuarios Android
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium mb-4">Descargá el archivo instalable e iniciá sesión en tu celular.</p>
            
            {/* El link apunta al archivo APK que vamos a poner en la carpeta public */}
            <a 
              href="/TujagueApp.apk" 
              download 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              📥 DESCARGAR APP (APK)
            </a>
          </div>

          {/* Tarjeta iPHONE */}
          <div className="bg-[#050505] border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
              <span>🍎</span> Usuarios iPhone
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium mb-4">No necesitás descargar nada. Instalá la Web-App en un toque.</p>
            
            <div className="bg-zinc-900 rounded-xl p-3 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
              1. Entrá a <span className="text-white">tujague.com/login</span> en Safari.<br/>
              2. Tocá el botón "Compartir" <span className="text-white text-lg">⍐</span>.<br/>
              3. Elegí <span className="text-white">"Agregar a Inicio"</span>.
            </div>
          </div>

        </div>

        <a 
          href="https://wa.me/5491123021760?text=Hola%20Coach,%20ya%20realicé%20el%20pago%20y%20descargué%20la%20App." 
          target="_blank" 
          className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          ¿Tuviste un problema? Soporte por WhatsApp
        </a>

      </div>
    </div>
  );
}