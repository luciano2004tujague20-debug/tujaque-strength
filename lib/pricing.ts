// lib/pricing.ts
// ✅ Fuente de verdad de precios: Supabase (tabla plans) + /api/plans/public
// Este archivo define catálogo/metadata + helpers de compat.

export const EXTRA_VIDEO_PRICE_ARS = 0;

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

// ======================================================================
// ✅ COMPAT: getConversions se usa en algunos componentes legacy.
// - getConversions() -> devuelve PLAN_COPY (compat)
// - getConversions(ars:number) -> devuelve { usd, usdt } (CheckoutClient)
// ======================================================================

type PlanCopyRecord = typeof PLAN_COPY;
type ConversionResult = { usd: number; usdt: number };

// Overloads:
export function getConversions(): PlanCopyRecord;
export function getConversions(arsAmount: number): ConversionResult;

// Impl:
export function getConversions(arsAmount?: number): PlanCopyRecord | ConversionResult {
  // Si lo llaman con ARS, devolvemos conversiones
  if (typeof arsAmount === "number" && Number.isFinite(arsAmount)) {
    // ⚠️ Ajustá esto como quieras. Ideal: setear en Vercel env vars.
    // NEXT_PUBLIC_USD_ARS y NEXT_PUBLIC_USDT_ARS para que también funcione en cliente.
    const USD_ARS = Number(process.env.NEXT_PUBLIC_USD_ARS ?? 1000);
    const USDT_ARS = Number(process.env.NEXT_PUBLIC_USDT_ARS ?? USD_ARS);

    const safeUsd = USD_ARS > 0 ? arsAmount / USD_ARS : 0;
    const safeUsdt = USDT_ARS > 0 ? arsAmount / USDT_ARS : 0;

    return { usd: safeUsd, usdt: safeUsdt };
  }

  // Si lo llaman sin args, devolvemos el copy
  return PLAN_COPY;
}