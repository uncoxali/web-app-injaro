import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE } from "@/lib/api-base";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPersianDigits(num: string | number): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

const MEDIA_BASE =
  process.env.NEXT_PUBLIC_MEDIA_BASE || "https://injaro.darkube.ir";

export function imgUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/media/")) {
    return `${MEDIA_BASE}${normalized}`;
  }

  return `${API_BASE}${normalized}`;
}

export function toEnglishDigits(str: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[۰-۹]/g, (d) =>
    String(persianDigits.indexOf(d))
  );
}
