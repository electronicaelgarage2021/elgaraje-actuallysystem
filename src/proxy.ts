import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, decryptSession } from "@/lib/session";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await decryptSession(token);

  const isLogin = pathname === "/login";

  // Sin sesión y fuera del login → al login
  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  // Con sesión y en el login → a la home
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Corre en todas las rutas excepto API, estáticos y archivos PWA (manifest, sw, íconos)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-192.png|icon-512.png).*)",
  ],
};
