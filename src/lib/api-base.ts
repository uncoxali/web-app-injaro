/**
 * Same-origin API proxy — routed to the backend via next.config rewrites.
 * Always use /api in the browser to avoid CORS and cookie issues.
 * Server-side fetches use server-fetch.ts with API_PROXY_TARGET instead.
 */
export const API_BASE = "/api";
