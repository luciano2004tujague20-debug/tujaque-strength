import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Verificación básica (Email opcional, Pass obligatorio)
    // Usamos la variable de entorno que definimos antes
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 2. Comparamos la contraseña
    if (password !== correctPassword) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // 3. Si es correcta, creamos la cookie de sesión
    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}