/** Same-origin path; proxied to api.injaro.info via next.config rewrites. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "/api";
