const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const cookieUtils = {
  getAccessToken: (): string | null => {
    return getCookie(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string, expiresInDays = 30) => {
    setCookie(ACCESS_TOKEN_KEY, token, expiresInDays);
  },

  removeAccessToken: () => {
    removeCookie(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return getCookie(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string, expiresInDays = 365) => {
    setCookie(REFRESH_TOKEN_KEY, token, expiresInDays);
  },

  removeRefreshToken: () => {
    removeCookie(REFRESH_TOKEN_KEY);
  },

  clearAll: () => {
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
  },
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; sameSite=lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; sameSite=lax`;
}
