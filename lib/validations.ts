// lib/validations.ts
import { z } from "zod";

export const PlanCodeSchema = z.enum(["weekly", "monthly", "pro_monthly", "quarterly"]); // Ajustá según tus planes reales en DB
export const PaymentMethodSchema = z.enum(["ars", "usd", "crypto"]);

export const CreateOrderSchema = z.object({
  planCode: z.string().min(1, "El plan es requerido"),
  paymentMethod: PaymentMethodSchema,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  customerRef: z.string().optional(),
  extraVideo: z.boolean().default(false),
  // Confirmaciones legales (solo frontend, pero útil tenerlas mapeadas)
  confirmAdult: z.boolean().refine((val) => val === true, "Debés confirmar ser mayor de edad"),
  confirmReqs: z.boolean().refine((val) => val === true, "Debés aceptar los requisitos"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;