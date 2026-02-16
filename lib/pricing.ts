// lib/pricing.ts

export const USD_RATE = 1200; // Unificado con tu Checkout
export const BTC_PRICE_ARS = 85000000; // 1 BTC en Pesos
export const EXTRA_VIDEO_PRICE_ARS = 15000; // Valor de la revisión técnica

export const PLANS = {
  // PLANES MENSUALES
  "mensual-3-4": {
    id: "mensual-3-4",
    code: "mensual-3-4", // Agregamos 'code' para compatibilidad
    name: "Mensual - 3 a 4 días",
    price: 50000,
    price_ars: 50000,
    days: 4,
    description: "Plan mensual de entrenamiento para 3 a 4 días por semana.",
    duration: "month",
    cadence: "monthly"
  },
  "mensual-5-6": {
    id: "mensual-5-6",
    code: "mensual-5-6",
    name: "Mensual - 5 a 6 días",
    price: 100000,
    price_ars: 100000,
    days: 6,
    description: "Plan mensual de entrenamiento para 5 a 6 días por semana.",
    duration: "month",
    cadence: "monthly"
  },
  "mensual-7": {
    id: "mensual-7",
    code: "mensual-7",
    name: "Mensual - 7 días (Full)",
    price: 115000,
    price_ars: 115000,
    days: 7,
    description: "Máximo rendimiento. Planificación total para los 7 días.",
    duration: "month",
    cadence: "monthly"
  },
  // PLANES SEMANALES
  "semanal-3-4": {
    id: "semanal-3-4",
    code: "semanal-3-4",
    name: "Semanal - 3 a 4 días",
    price: 20000,
    price_ars: 20000,
    days: 4,
    description: "Prueba una semana de entrenamiento (3 a 4 días).",
    duration: "week",
    cadence: "weekly"
  },
  "semanal-5-6": {
    id: "semanal-5-6",
    code: "semanal-5-6",
    name: "Semanal - 5 a 6 días",
    price: 32000,
    price_ars: 32000,
    days: 6,
    description: "Prueba una semana de entrenamiento (5 a 6 días).",
    duration: "week",
    cadence: "weekly"
  },
  "semanal-7": {
    id: "semanal-7",
    code: "semanal-7",
    name: "Semanal - 7 días",
    price: 38000,
    price_ars: 38000,
    days: 7,
    description: "Una semana de entrenamiento intensivo de 7 días.",
    duration: "week",
    cadence: "weekly"
  }
};

export const getConversions = (priceInArs: number) => {
  const priceInUsd = priceInArs / USD_RATE;
  const priceInBtc = priceInArs / BTC_PRICE_ARS;
  
  return {
    ars: priceInArs,
    usd: priceInUsd.toFixed(2),
    usdt: priceInUsd.toFixed(2),
    btc: priceInBtc.toFixed(8)
  };
};