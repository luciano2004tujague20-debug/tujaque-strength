import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // Cambiamos 'next/request' por 'next/server'

const ADMIN_COOKIE_NAME = "ts_admin";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protegemos el panel de administración
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get(ADMIN_COOKIE_NAME);

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};