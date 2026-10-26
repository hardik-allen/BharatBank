import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

const PROTECTED_PATHS = ["/dashboard", "/payments", "/products", "/account", "/profile", "/assistant"];

export function middleware(req: NextRequest) {
  const session = req.cookies.get(COOKIE_NAME)?.value;

  if (req.nextUrl.pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const isProtected = PROTECTED_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/payments/:path*",
    "/products/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/assistant/:path*",
  ],
};
