import React from 'react';
import FeatureCard from '@/components/FeatureCard';
import AthleteNutritionDashboard from '@/components/dashboard/nutrition/AthleteNutritionDashboard';

// 1. Definimos qué datos necesita recibir esta pestaña para funcionar
interface TabNutricionProps {
  isElitePlan: boolean;
  whatsappUpsellUrl: string;
  handleRestrictedClick: (featureName: string) => void;
  userId: string | undefined;
}

export default function TabNutricion({ isElitePlan, whatsappUpsellUrl, handleRestrictedClick, userId }: TabNutricionProps) {
  return (
    <>
      {!isElitePlan ? (
          // 🔥 VISTA DE CATÁLOGO PREMIUM BLOQUEADO (NUTRICIÓN) 🔥
          <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
              <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-black italic text-black uppercase tracking-tighter">Nutrición <span className="text-amber-500">Premium</span></h2>
                  <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">El diseño clínico de macronutrientes es exclusivo de la Mentoría Élite.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                  <FeatureCard 
                      title="Calculadora Macro Dinámica" 
                      description="Ajuste exacto de calorías y macros según tu progreso y peso semanal."
                      isLocked={true}
                      onLockClick={() => handleRestrictedClick('Calculadora Nutricional')}
                  />
                  <FeatureCard 
                      title="Tujague AI Chef" 
                      description="Nuestra IA te arma comidas en segundos con los ingredientes que tienes en tu cocina."
                      isLocked={true}
                      onLockClick={() => handleRestrictedClick('Asistente Culinario IA')}
                  />
                  <FeatureCard 
                      title="Auditoría Metabólica" 
                      description="Control de adherencia y ajustes estratégicos para romper estancamientos."
                      isLocked={true}
                      onLockClick={() => handleRestrictedClick('Auditoría Nutricional')}
                  />
              </div>

              <div className="mt-12 text-center">
                  <a href={whatsappUpsellUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-8 py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95">
                      POSTULARME A MENTORÍA ÉLITE 🚀
                  </a>
              </div>
          </div>
      ) : (
          /* SI ES ÉLITE, LE MOSTRAMOS EL DASHBOARD DE NUTRICIÓN NORMAL */
          <div className="animate-in fade-in duration-500">
              <AthleteNutritionDashboard userId={userId} />
          </div>
      )}
    </>
  );
}