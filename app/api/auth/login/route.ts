import { NextResponse } from "next/server";
// ✅ IMPORTAMOS LA HERRAMIENTA NATIVA DE NEXT.JS
import { cookies } from "next/headers"; 

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === process.env.ADMIN_PASSWORD) {
      
      // ✅ LA MAGIA ESTÁ ACÁ: Forzamos la cookie directamente en el servidor de Vercel
      cookies().set({
        name: "ts_admin_session",
        value: "true",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax"
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}