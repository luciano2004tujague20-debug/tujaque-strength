import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // Verificamos contra la contraseña del .env
    if (password === process.env.ADMIN_PASSWORD) {
      
      // Creamos la "Llave" (Cookie)
      // Dura 7 días (60 * 60 * 24 * 7)
      cookies().set("ts_admin_session", "true", {
        httpOnly: true, // No accesible por JS (Anti-Hackers)
        secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
        maxAge: 60 * 60 * 24 * 7, 
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}