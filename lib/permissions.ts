export type ProductType = 'STATIC' | 'ELITE' | 'UNKNOWN';
export type TrainingFrequency = '3-4' | '5-6' | '7' | 'N/A';

export interface AccessLevel {
  canViewMetrics: boolean;
  canLogSession: boolean;
  videoUploadLimit: number; // 0, 1, o 999 (ilimitado)
  hasSNCAnalysis: boolean;
  canUseTujagueAI: boolean;
  isTimeRestricted: boolean;
}

export interface PlanResolution {
  productType: ProductType;
  trainingFrequency: TrainingFrequency;
  accessLevel: AccessLevel;
}

// 1. CONFIGURACIÓN BASE DE PERMISOS (Solo el nuevo modelo High-Ticket)
const PERMISSIONS_MATRIX: Record<ProductType, AccessLevel> = {
  STATIC: {
    canViewMetrics: false,
    canLogSession: false,
    videoUploadLimit: 0,
    hasSNCAnalysis: false,
    canUseTujagueAI: false,
    isTimeRestricted: false,
  },
  ELITE: {
    canViewMetrics: true,
    canLogSession: true,
    videoUploadLimit: 999, // Representa ilimitado
    hasSNCAnalysis: true,
    canUseTujagueAI: true,
    isTimeRestricted: false,
  },
  UNKNOWN: {
    canViewMetrics: false,
    canLogSession: false,
    videoUploadLimit: 0,
    hasSNCAnalysis: false,
    canUseTujagueAI: false,
    isTimeRestricted: false,
  },
};

// 2. FUNCIÓN PRINCIPAL DE RESOLUCIÓN PURIFICADA
export function resolvePlan(planId: string | null | undefined, planTitle?: string): PlanResolution {
  // Si no hay ID, bloqueamos todo por seguridad
  if (!planId) {
    return {
      productType: 'UNKNOWN',
      trainingFrequency: 'N/A',
      accessLevel: { ...PERMISSIONS_MATRIX.UNKNOWN },
    };
  }

  const normalizedId = planId.toLowerCase().trim();

  // --- DETERMINAR TIPO DE PRODUCTO (Modelo Nuevo Estricto) ---
  let productType: ProductType = 'UNKNOWN';

  if (normalizedId === 'programa-elite-12-semanas') {
    productType = 'ELITE';
  } else if (
    normalizedId.startsWith('static') ||
    normalizedId.includes('definicion') ||
    normalizedId.includes('calculadora') ||
    normalizedId.includes('especializacion') ||
    normalizedId.includes('mesociclo-') ||
    (planTitle && planTitle.toLowerCase().includes('mutación')) ||
    (planTitle && planTitle.toLowerCase().includes('fuerza base'))
  ) {
    productType = 'STATIC';
  }

  // --- DETERMINAR FRECUENCIA ---
  let trainingFrequency: TrainingFrequency = 'N/A';

  if (productType === 'ELITE') {
    trainingFrequency = '5-6'; // Por defecto la Mentoría Élite exige disciplina alta
  } else if (productType === 'STATIC') {
    trainingFrequency = '3-4'; // Frecuencia estándar para los estáticos
  }

  return {
    productType,
    trainingFrequency,
    accessLevel: { ...PERMISSIONS_MATRIX[productType] },
  };
}