// Forzamos el uso de Node.js normal para evitar el error de 'crypto' en Edge Runtime
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { createHmac } from "crypto";

export const ADMIN_COOKIE_NAME = "ts_admin";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Crea una firma segura para la cookie usando la contraseña del admin
 */
function getSignature(adminPass: string) {
  return createHmac("sha256", adminPass)
    .update("ts-admin-session")
    .digest("hex");
}

/**
 * Verifica si el usuario actual tiene la cookie de administrador válida
 */
export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!session || !adminPass) return false;

  const expectedSignature = getSignature(adminPass);
  return session.value === expectedSignature;
}

/**
 * Crea la sesión de administrador seteando la cookie
 */
export async function setAdminSession() {
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) return;

  const signature = getSignature(adminPass);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 días
    path: "/",
  });
}

/**
 * Elimina la sesión de administrador
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}