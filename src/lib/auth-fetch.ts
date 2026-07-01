import { cookieUtils } from "./cookies";
import { redirectToLogin } from "./auth-utils";
import { apiFetch } from "./api-fetch";

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = cookieUtils.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await apiFetch("/accounts/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      cookieUtils.clearAll();
      return false;
    }

    const data = await res.json();
    cookieUtils.setAccessToken(data.access);
    if (data.refresh) {
      cookieUtils.setRefreshToken(data.refresh);
    }
    return true;
  } catch {
    cookieUtils.clearAll();
    return false;
  }
}

export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const accessToken = cookieUtils.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const hadToken = !skipAuth && !!cookieUtils.getAccessToken();

  let res = await apiFetch(url, {
    ...fetchOptions,
    headers,
  });

  if ((res.status === 401 || res.status === 403) && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newHeaders = new Headers(headers);
      const newToken = cookieUtils.getAccessToken();
      if (newToken) {
        newHeaders.set("Authorization", `Bearer ${newToken}`);
      }

      res = await apiFetch(url, {
        ...fetchOptions,
        headers: newHeaders,
      });
    } else {
      cookieUtils.clearAll();
    }
  }

  if (res.status === 403 && !skipAuth && hadToken) {
    redirectToLogin();
  } else if (res.status === 401 && !skipAuth && hadToken) {
    redirectToLogin();
  }

  return res;
}
