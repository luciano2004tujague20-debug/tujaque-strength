import * as crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "ts_admin";
const DAY_MS = 24 * 60 * 60 * 1000;

function b64url(input: unknown) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function unb64url(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64").toString("utf8");
}

function sign(data: string, secret: string) {
  return b64url(crypto.createHmac("sha256", secret).update(data).digest());
}

export function makeAdminToken() {
  const secret = process.env.ADMIN_PASSWORD || "";
  if (!secret) throw new Error("Falta ADMIN_PASSWORD en .env.local");

  const payload = { exp: Date.now() + DAY_MS };
  const data = b64url(JSON.stringify(payload));
  const sig = sign(data, secret);

  return `${data}.${sig}`;
}

// ✅ AHORA ES ASYNC (porque cookies() te devuelve Promise)
export async function isAdmin() {
  const secret = process.env.ADMIN_PASSWORD || "";
  if (!secret) return false;

  const c = await cookies();
  const token = c.get(ADMIN_COOKIE_NAME)?.value || "";
  if (!token.includes(".")) return false;

  const [data, sig] = token.split(".");
  const expected = sign(data, secret);
  if (sig !== expected) return false;

  try {
    const payload = JSON.parse(unb64url(data));
    if (!payload?.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(DAY_MS / 1000),
  };
}
