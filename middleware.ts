import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. PROTEGER RUTAS DE ADMIN
  // Si la ruta empieza con /admin...
  if (path.startsWith("/admin")) {
    
    // Excepción: Permitir entrar a la página de login sin llave
    if (path === "/admin/login") {
        return NextResponse.next();
    }

    // Verificamos si tiene la cookie "ts_admin_session"
    const isAdmin = request.cookies.get("ts_admin_session");

    // Si NO tiene la cookie, lo mandamos al login
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Si todo está bien, dejamos pasar
  return NextResponse.next();
}

// Configuración: Solo vigilar estas rutas para no afectar el rendimiento
export const config = {
  matcher: ["/admin/:path*"],
};