// lib/pricing.ts
// ✅ Fuente de verdad de precios: Supabase (tabla plans) + /api/plans/public
// Este archivo SOLO define catálogo/metadata (sin números).

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
// ✅ Compat: CheckoutClient todavía importa getConversions.
// No tocamos CheckoutClient: simplemente volvemos a exportarlo.
export const getConversions = () => PLAN_COPY;