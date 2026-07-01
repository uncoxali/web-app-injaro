/** Always same-origin /api proxy — never read from env (avoids stale/wrong builds). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const clean =
    normalized.length > 1 && normalized.endsWith("/")
      ? normalized.slice(0, -1)
      : normalized;
  return `/api${clean}`;
}

export function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), { redirect: "follow", ...init });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
  retries = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await apiFetch(path, init);
      if (!res.ok) {
        throw new Error(`${path} returned ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await sleep(250 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${path}`);
}
