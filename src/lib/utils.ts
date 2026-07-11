import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiUrl } from "@/lib/api-fetch";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPersianDigits(num: string | number): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

const MEDIA_BASE =
  process.env.NEXT_PUBLIC_MEDIA_BASE || "https://injaro.darkube.ir";

const MEDIA_HOST = (() => {
  try {
    return new URL(MEDIA_BASE).hostname;
  } catch {
    return "injaro.darkube.ir";
  }
})();

/** Strip signed-URL query params; MinIO serves /media/* without them. */
function normalizeMediaUrl(url: URL): string {
  if (url.hostname === MEDIA_HOST && url.pathname.startsWith("/media/")) {
    return `${url.protocol}//${url.host}${url.pathname}`;
  }
  return url.toString();
}

export function imgUrl(path?: string): string | undefined {
  if (!path) return undefined;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      return normalizeMediaUrl(new URL(path));
    } catch {
      return path;
    }
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/media/")) {
    return `${MEDIA_BASE.replace(/\/$/, "")}${normalized}`;
  }

  return apiUrl(normalized);
}

export function isSvgUrl(url: string): boolean {
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".svg");
  } catch {
    return url.toLowerCase().includes(".svg");
  }
}

export function toEnglishDigits(str: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[۰-۹]/g, (d) =>
    String(persianDigits.indexOf(d))
  );
}

export type ShareResult = "shared" | "copied" | "canceled";

/** Web Share API with clipboard fallback; ignores user cancel (AbortError). */
export async function shareContent(options: {
  title?: string;
  url?: string;
}): Promise<ShareResult> {
  const url = options.url ?? window.location.href;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: options.title, url });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "canceled";
      }
    }
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}
