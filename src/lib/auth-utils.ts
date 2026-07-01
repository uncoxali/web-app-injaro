import { cookieUtils } from "./cookies";

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return !!cookieUtils.getAccessToken();
}

export function loginUrl(redirectPath?: string): string {
  if (!redirectPath) return "/login";
  return `/login?redirect=${encodeURIComponent(redirectPath)}`;
}

/** Paths guests can open without being sent back to /login */
export function isPublicAppPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/home" || pathname === "/home/") {
    return true;
  }

  const publicPrefixes = ["/home/Injaro", "/home/Tazeha", "/events"];
  return publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getLoginBackTarget(redirectPath?: string | null): string {
  if (redirectPath && redirectPath.startsWith("/") && isPublicAppPath(redirectPath)) {
    return redirectPath;
  }
  return "/home";
}

let redirectingToLogin = false;

export function redirectToLogin(): void {
  if (typeof window === "undefined" || redirectingToLogin) return;

  const path = window.location.pathname;
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/verify")
  ) {
    return;
  }

  redirectingToLogin = true;
  cookieUtils.clearAll();
  const redirect = path + window.location.search;
  window.location.href = loginUrl(redirect);
}
