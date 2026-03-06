// lib/pricing.ts
// ✅ Fuente de verdad de precios: Supabase (tabla plans) + /api/plans/public
// Este archivo define catálogo/metadata + helpers (conversions y compat legacy)

export type PlanCode =
  | "static-fuerza"
  | "static-hipertrofia"
  | "semanal-3-4"
  | "semanal-5-6"
  | "semanal-7"
  | "mensual-3-4"
  | "mensual-5-6"
  | "mensual-7";

export type PlanGroup = "static" | "sprint" | "monthly";

export const PLAN_GROUPS: Record<PlanGroup, PlanCode[]> = {
  static: ["static-fuerza", "static-hipertrofia"],
  sprint: ["semanal-3-4", "semanal-5-6", "semanal-7"],
  monthly: ["mensual-3-4", "mensual-5-6", "mensual-7"],
};

export const DEFAULT_SELECTION: Record<PlanGroup, PlanCode> = {
  static: "static-fuerza",
  sprint: "semanal-5-6",
  monthly: "mensual-5-6",
};

export const PLAN_COPY: Record<
  PlanCode,
  { title: string; subtitle: string; badge?: string }
> = {
  "static-fuerza": {
    title: "Protocolo Fuerza Base",
    subtitle: "Para el atleta independiente",
  },
  "static-hipertrofia": {
    title: "Mutación Hipertrófica",
    subtitle: "Para el atleta independiente",
  },
  "semanal-3-4": {
    title: "Sprint (3 a 4 días)",
    subtitle: "Diagnóstico Técnico (7 Días)",
  },
  "semanal-5-6": {
    title: "Sprint (5 a 6 días)",
    subtitle: "Diagnóstico Técnico (7 Días)",
  },
  "semanal-7": {
    title: "Sprint (7 días Full)",
    subtitle: "Diagnóstico Técnico (7 Días)",
  },
  "mensual-3-4": {
    title: "Coaching (3 a 4 días)",
    subtitle: "El Ecosistema Élite",
  },
  "mensual-5-6": {
    title: "Coaching (5 a 6 días)",
    subtitle: "El Ecosistema Élite",
    badge: "Recomendado",
  },
  "mensual-7": {
    title: "Coaching (7 días Full)",
    subtitle: "El Ecosistema Élite",
  },
};

/**
 * ✅ Tipos de conversión que usan CheckoutClient / PaymentConversionTable
 * (agregamos btc para que no rompa)
 */
export type ConversionResult = {
  ars: number;
  usd: number;
  usdt: number;
  btc: number; // ✅ nuevo
};

/**
 * ✅ Lee cotizaciones desde ENV (Vercel):
 * NEXT_PUBLIC_USD_ARS
 * NEXT_PUBLIC_USDT_ARS (opcional, fallback a USD)
 *
 * BTC (opcional, NO rompe si no está):
 * - NEXT_PUBLIC_BTC_ARS  (1 BTC en ARS)
 * o
 * - NEXT_PUBLIC_BTC_USD  (1 BTC en USD) + usa USD_ARS
 */
export function getRates() {
  const usdArs = Number(process.env.NEXT_PUBLIC_USD_ARS ?? 0);
  const usdtArs = Number(process.env.NEXT_PUBLIC_USDT_ARS ?? 0);

  const btcArs = Number(process.env.NEXT_PUBLIC_BTC_ARS ?? 0);
  const btcUsd = Number(process.env.NEXT_PUBLIC_BTC_USD ?? 0);

  return {
    usdArs: usdArs > 0 ? usdArs : 0,
    usdtArs: usdtArs > 0 ? usdtArs : (usdArs > 0 ? usdArs : 0),
    btcArs: btcArs > 0 ? btcArs : 0,
    btcUsd: btcUsd > 0 ? btcUsd : 0,
  };
}

/**
 * ✅ getConversions(precioARS) -> { ars, usd, usdt, btc }
 */
export function getConversions(priceArs: number): ConversionResult {
  const { usdArs, usdtArs, btcArs, btcUsd } = getRates();

  const safePrice = Number(priceArs || 0);

  const usd = usdArs > 0 ? safePrice / usdArs : 0;
  const usdt = usdtArs > 0 ? safePrice / usdtArs : 0;

  // BTC: preferimos BTC_ARS. Si no existe, usamos BTC_USD * USD_ARS.
  let btc = 0;
  if (btcArs > 0) {
    btc = safePrice / btcArs;
  } else if (btcUsd > 0 && usdArs > 0) {
    btc = safePrice / (btcUsd * usdArs);
  }

  return { ars: safePrice, usd, usdt, btc };
}

/**
 * ✅ Compat legacy: si algo viejo importaba este nombre, no rompemos build.
 */
export const EXTRA_VIDEO_PRICE_ARS = Number(
  process.env.NEXT_PUBLIC_EXTRA_VIDEO_PRICE_ARS ?? 0
);