export type ProductType = 'STATIC' | 'SPRINT' | 'MONTHLY' | 'UNKNOWN';
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

// 1. CONFIGURACIÓN BASE DE PERMISOS
const PERMISSIONS_MATRIX: Record<ProductType, AccessLevel> = {
  STATIC: {
    canViewMetrics: false,
    canLogSession: false,
    videoUploadLimit: 0,
    hasSNCAnalysis: false,
    canUseTujagueAI: false,
    isTimeRestricted: false,
  },
  SPRINT: {
    canViewMetrics: true,
    canLogSession: true,
    videoUploadLimit: 1,
    hasSNCAnalysis: false,
    canUseTujagueAI: false,
    isTimeRestricted: true,
  },
  MONTHLY: {
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

// 2. DICCIONARIO DE ALIAS
const LEGACY_MAP: Record<string, string> = {
  mesociclo_base: 'mensual-3-4',
  pro_performance: 'mensual-5-6',
  elite_total: 'mensual-7',
  // 'mesociclo_mensual' se maneja dinámicamente abajo
};

// 3. FUNCIÓN PRINCIPAL DE RESOLUCIÓN
export function resolvePlan(planId: string | null | undefined, planTitle?: string): PlanResolution {
  // Si no hay ID, bloqueamos todo por seguridad
  if (!planId) {
    return {
      productType: 'UNKNOWN',
      trainingFrequency: 'N/A',
      accessLevel: { ...PERMISSIONS_MATRIX.UNKNOWN },
    };
  }

  let normalizedId = planId.toLowerCase().trim();

  // Redirigir IDs viejos a los nuevos equivalentes
  if (LEGACY_MAP[normalizedId]) {
    normalizedId = LEGACY_MAP[normalizedId];
  }

  // --- DETERMINAR TIPO DE PRODUCTO ---
  let productType: ProductType = 'UNKNOWN';

  if (normalizedId.startsWith('static')) {
    productType = 'STATIC';
  } else if (normalizedId.startsWith('semanal')) {
    productType = 'SPRINT';
  } else if (normalizedId.startsWith('mensual') || normalizedId === 'mesociclo_mensual') {
    productType = 'MONTHLY';
  }

  // --- DETERMINAR FRECUENCIA (aislada de los permisos) ---
  let trainingFrequency: TrainingFrequency = 'N/A';

  if (normalizedId.includes('3-4')) {
    trainingFrequency = '3-4';
  } else if (normalizedId.includes('5-6')) {
    trainingFrequency = '5-6';
  } else if (normalizedId.includes('7')) {
    trainingFrequency = '7';
  } else if (planTitle) {
    const titleLower = planTitle.toLowerCase();

    if (/(3\s*(?:-|a)\s*4)/.test(titleLower)) {
      trainingFrequency = '3-4';
    } else if (/(5\s*(?:-|a)\s*6)/.test(titleLower)) {
      trainingFrequency = '5-6';
    } else if (/\b7\b/.test(titleLower)) {
      trainingFrequency = '7';
    }
  }

  return {
    productType,
    trainingFrequency,
    accessLevel: { ...PERMISSIONS_MATRIX[productType] },
  };
}