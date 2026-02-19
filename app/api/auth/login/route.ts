import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === process.env.ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // ✅ Usamos la forma más compatible con Vercel
      response.cookies.set("ts_admin_session", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true, // Vercel siempre usa HTTPS
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json({ error: "Password incorrecto" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}