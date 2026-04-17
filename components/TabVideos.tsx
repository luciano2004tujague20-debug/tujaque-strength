import React from 'react';
import FeatureCard from '@/components/FeatureCard';

interface TabVideosProps {
  canViewVideos: boolean;
  whatsappUpsellUrl: string;
  handleRestrictedClick: (featureName: string) => void;
  mainLifts: { id: string; label: string }[];
  extraLifts: { id: string; label: string }[];
  order: any;
  uploading: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, liftId: string) => void;
  handleUpdateExtraName: (liftId: string, value: string) => void;
}

export default function TabVideos({
  canViewVideos,
  whatsappUpsellUrl,
  handleRestrictedClick,
  mainLifts,
  extraLifts,
  order,
  uploading,
  handleFileUpload,
  handleUpdateExtraName
}: TabVideosProps) {
  return (
    <>
      {!canViewVideos ? (
        // 🔥 VISTA DE CATÁLOGO PREMIUM BLOQUEADO (VIDEOS) 🔥
        <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black italic text-black uppercase tracking-tighter">
              Herramientas <span className="text-amber-500">Premium</span>
            </h2>
            <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">
              Visualiza las funciones de alto rendimiento disponibles en el Plan Élite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
            <FeatureCard
              title="Tujague AI Biomecánica"
              description="Sube tus videos y nuestra IA corregirá tu técnica de levantamiento al instante."
              isLocked={true}
              onLockClick={() => handleRestrictedClick('Auditoría Biomecánica')}
            />
            <FeatureCard
              title="Soporte Directo 24/7"
              description="Contacto prioritario con el Coach por WhatsApp para ajustes en tiempo real."
              isLocked={true}
              onLockClick={() => handleRestrictedClick('Soporte Élite')}
            />
            <FeatureCard
              title="Ojo de Halcón (SNC)"
              description="El algoritmo evalúa tu descanso diario para evitar el sobreentrenamiento."
              isLocked={true}
              onLockClick={() => handleRestrictedClick('Módulo Clínico de Recuperación')}
            />
          </div>

          <div className="mt-12 text-center">
            <a
              href={whatsappUpsellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-8 py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95"
            >
              POSTULARME A MENTORÍA ÉLITE 🚀
            </a>
          </div>
        </div>
      ) : (
        /* 🔥 SI ES ÉLITE, LE MOSTRAMOS SU AUDITORÍA DE VIDEOS NORMAL 🔥 */
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
          <div className="space-y-16">
            {/* VIDEOS PRINCIPALES */}
            <div>
              <div className="text-center md:text-left mb-10">
                <h3 className="text-3xl md:text-4xl font-black italic text-amber-500 uppercase tracking-tighter drop-shadow-sm">
                  Auditoría <span className="text-black">Biomecánica</span>
                </h3>
                <p className="text-gray-500 font-medium text-sm md:text-base mt-2">
                  Módulo clínico de corrección. Aporte su ejecución para recibir el dictamen técnico del Head Coach.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                {mainLifts.map((lift) => (
                  <div key={lift.id} className="bg-white border border-gray-100 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm hover:border-amber-200 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                      <h3 className="text-2xl font-black italic text-black uppercase tracking-tight">{lift.label}</h3>
                      {order[`video_${lift.id}`] ? (
                        <span className="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase border border-amber-200 shadow-sm w-full sm:w-auto text-center">
                          Evidencia Cargada
                        </span>
                      ) : (
                        <span className="bg-gray-50 border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase w-full sm:w-auto text-center">
                          En Espera
                        </span>
                      )}
                    </div>

                    <div className="mb-8 bg-gray-50 border border-gray-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                      <div>
                        <p className="text-xs md:text-sm text-gray-800 font-bold mb-2 uppercase tracking-widest">Aportar Serie Efectiva</p>
                        <p className="text-[10px] text-gray-400 font-medium">Extensión: MP4/MOV (Máx 50MB)</p>
                      </div>
                      <label
                        className={`cursor-pointer px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center shrink-0 w-full sm:w-auto shadow-sm border ${
                          uploading === lift.id
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-black border-black text-white hover:bg-gray-900 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {uploading === lift.id ? 'TRANSMITIENDO...' : 'CARGAR VIDEO 📹'}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, lift.id)} disabled={uploading === lift.id} />
                      </label>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
                      <h4 className="flex items-center gap-3 text-amber-600 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Auditoría del Coach
                      </h4>
                      {order[`feedback_${lift.id}`] ? (
                        <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{order[`feedback_${lift.id}`]}</p>
                      ) : (
                        <p className="text-amber-600/60 text-xs md:text-sm italic font-medium">Se requiere material visual para iniciar la evaluación técnica.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIDEOS EXTRAS */}
            <div className="pt-10 border-t border-gray-200">
              <div className="text-center md:text-left mb-10">
                <h3 className="text-3xl md:text-4xl font-black italic text-gray-400 uppercase tracking-tighter drop-shadow-sm">
                  Módulo de <span className="text-black">Accesorios</span>
                </h3>
                <p className="text-gray-500 font-medium text-sm md:text-base mt-2">Aporte visual para variantes y máquinas.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                {extraLifts.map((lift) => (
                  <div key={lift.id} className="bg-white border border-dashed border-gray-200 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                      <input
                        type="text"
                        placeholder="Nomenclatura (Ej: Hack Squat)..."
                        value={order[`name_${lift.id}`] || ''}
                        onChange={(e) => handleUpdateExtraName(lift.id, e.target.value)}
                        className="bg-transparent text-xl md:text-2xl font-black italic text-black uppercase outline-none placeholder:text-gray-300 w-full sm:w-2/3 focus:text-blue-500 transition-colors"
                      />
                      {order[`video_${lift.id}`] ? (
                        <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase border border-blue-200 shadow-sm w-full sm:w-auto text-center mt-4 sm:mt-0">
                          Evidencia Cargada
                        </span>
                      ) : (
                        <span className="bg-gray-50 border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase w-full sm:w-auto text-center mt-4 sm:mt-0">
                          En Espera
                        </span>
                      )}
                    </div>

                    <div className="mb-8 bg-gray-50 border border-gray-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                      <div>
                        <p className="text-xs md:text-sm text-gray-800 font-bold mb-2 uppercase tracking-widest">Aportar Ejecución</p>
                        <p className="text-[10px] text-gray-400 font-medium">Extensión: MP4/MOV (Máx 50MB)</p>
                      </div>
                      <label
                        className={`cursor-pointer px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center shrink-0 w-full sm:w-auto shadow-sm border ${
                          uploading === lift.id
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {uploading === lift.id ? 'TRANSMITIENDO...' : 'CARGAR VIDEO 📹'}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, lift.id)} disabled={uploading === lift.id} />
                      </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
                      <h4 className="flex items-center gap-3 text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Auditoría del Coach
                      </h4>
                      {order[`feedback_${lift.id}`] ? (
                        <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{order[`feedback_${lift.id}`]}</p>
                      ) : (
                        <p className="text-blue-600/60 text-xs md:text-sm italic font-medium">Complete la nomenclatura y aporte el material para obtener asistencia.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}