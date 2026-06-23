import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/login", "/register", "/verify"];

const protectedPrefixes = [
  "/home/profile",
  "/home/savedEvents",
  "/profile",
  "/onboarding",
  "/invite",
  "/messages",
  "/search",
  "/brands",
];

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/" || pathname === "/home" || pathname === "/home/") {
    return true;
  }

  const publicPrefixes = ["/home/Injaro", "/home/Tazeha", "/events"];
  return publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function requiresAuth(pathname: string): boolean {
  if (isAuthRoute(pathname) || isPublicRoute(pathname)) return false;
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  if (requiresAuth(pathname) && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && accessToken) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const destination =
      redirect && redirect.startsWith("/") ? redirect : "/home";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
