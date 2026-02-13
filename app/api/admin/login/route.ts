import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions, makeAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  const real = process.env.ADMIN_PASSWORD || "";

  if (!real) {
    return NextResponse.json({ error: "ADMIN_PASSWORD no configurado" }, { status: 500 });
  }
  if (!password || password !== real) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = makeAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
  return res;
}
