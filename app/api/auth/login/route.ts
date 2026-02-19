import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 🚨 LA OPCIÓN NUCLEAR: Prohíbe a Vercel congelar esta ruta
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === process.env.ADMIN_PASSWORD) {
      
      // Seteo de cookie limpio, sin restricciones que confundan al navegador
      cookies().set("ts_admin_session", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}