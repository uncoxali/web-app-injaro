import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const DEFAULT_ORIGIN = "https://api.injaro.info";

const RETRYABLE_CODES = new Set([
  "ENOTFOUND",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
]);

export function getApiOrigin(): string {
  return (process.env.API_PROXY_TARGET || DEFAULT_ORIGIN).replace(/\/$/, "");
}

export function buildUpstreamUrl(
  pathSegments: string[],
  search = ""
): string {
  const pathname = pathSegments.join("/");
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${getApiOrigin()}/${withSlash}${search}`;
}

export function buildUpstreamPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash =
    normalized.length > 1 && normalized.endsWith("/")
      ? normalized
      : `${normalized}/`;
  return `${getApiOrigin()}${withSlash}`;
}

function getErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const code = (err as NodeJS.ErrnoException).code;
  if (typeof code === "string") return code;
  const cause = (err as { cause?: unknown }).cause;
  if (cause && typeof cause === "object") {
    return (cause as NodeJS.ErrnoException).code;
  }
  return undefined;
}

function isRetryableNetworkError(err: unknown): boolean {
  const code = getErrorCode(err);
  if (code && RETRYABLE_CODES.has(code)) return true;
  return err instanceof Error && err.message === "fetch failed";
}

export async function fetchUpstream(
  url: string,
  init?: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetch(url, { redirect: "follow", ...init });
    } catch (err) {
      lastError = err;
      if (!isRetryableNetworkError(err) || attempt >= retries - 1) break;
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }

  throw lastError;
}
