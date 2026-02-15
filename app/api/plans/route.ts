import { NextResponse } from 'next/server';

export async function GET() {
  const plans = [
    // ─── NIVEL 1: FUERZA BASE (3-4 DÍAS) ───
    {
      id: "fb_weekly",
      code: "fb_weekly",
      name: "Fuerza Base (3-4 Días) - Semanal",
      cadence: "weekly",
      days: 4,
      price_ars: 28000,
      benefits: {
        includes: ["Rutina de 3 a 4 días", "Corrección en 24hs", "Soporte vía WhatsApp"],
        highlight: "Ideal para empezar"
      }
    },
    {
      id: "fb_monthly",
      code: "fb_monthly",
      name: "Fuerza Base (3-4 Días) - Mensual",
      cadence: "monthly",
      days: 4,
      price_ars: 85000,
      benefits: {
        includes: ["Rutina de 3 a 4 días", "Ahorrás $27.000", "Planificación a largo plazo"],
        highlight: "Ahorro del 25%"
      }
    },

    // ─── NIVEL 2: POWERBUILDING (5-6 DÍAS) ───
    {
      id: "pb_weekly",
      code: "pb_weekly",
      name: "Powerbuilding (5-6 Días) - Semanal",
      cadence: "weekly",
      days: 6,
      price_ars: 32000,
      benefits: {
        includes: ["Rutina de 5 a 6 días", "Enfoque Estético/Fuerza", "Gestión de Fatiga"],
        highlight: "El más elegido"
      }
    },
    {
      id: "pb_monthly",
      code: "pb_monthly",
      name: "Powerbuilding (5-6 Días) - Mensual",
      cadence: "monthly",
      days: 6,
      price_ars: 100000,
      benefits: {
        includes: ["Rutina de 5 a 6 días", "Ahorrás $28.000", "Ciclo de Mesociclo Completo"],
        highlight: "Ahorro del 22%"
      }
    },

    // ─── NIVEL 3: ELITE FULL (7 DÍAS) ───
    {
      id: "elite_weekly",
      code: "elite_weekly",
      name: "Elite Full (7 Días) - Semanal",
      cadence: "weekly",
      days: 7,
      price_ars: 38000,
      benefits: {
        includes: ["Entrenamiento Diario", "Máxima precisión de carga", "Monitoreo diario"],
        highlight: "Alto Rendimiento"
      }
    },
    {
      id: "elite_monthly",
      code: "elite_monthly",
      name: "Elite Full (7 Días) - Mensual",
      cadence: "monthly",
      days: 7,
      price_ars: 115000,
      benefits: {
        includes: ["Entrenamiento Diario", "Ahorrás $37.000", "Planificación Competitiva"],
        highlight: "Ahorro del 24%"
      }
    }
  ];

  return NextResponse.json({ plans });
}