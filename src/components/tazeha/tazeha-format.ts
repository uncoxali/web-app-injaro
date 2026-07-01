import { toJalaali } from "jalaali-js";
import { toPersianDigits } from "@/lib/utils";
import type { EventDetail } from "@/lib/api/events";
import type { TazehaItem } from "@/lib/api/tazeha";

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const WEEKDAYS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه",
];

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSingleDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const weekday = WEEKDAYS[d.getDay()];
  return `${weekday} ${toPersianDigits(j.jd)} ${PERSIAN_MONTHS[j.jm - 1]}`;
}

export function getTazehaSlug(item: TazehaItem): string {
  return item.event_slug || item.topic || String(item.id || "");
}

export function getTazehaTitle(item: TazehaItem): string {
  return item.topic || item.event_name || "";
}

export function getTazehaImage(item: TazehaItem): string {
  return item.thumbnail || item.image_url || "";
}

export function formatTazehaDateRange(item: TazehaItem): string {
  const start = item.start_datetime || item.start_date;
  const end = item.finish_datetime || item.end_date;
  if (!start && !end) return "";
  const startLabel = formatSingleDate(start);
  const endLabel = formatSingleDate(end);
  if (startLabel && endLabel && startLabel !== endLabel) {
    return `${startLabel} تا ${endLabel}`;
  }
  return startLabel || endLabel;
}

export function getTazehaDescription(item: TazehaItem): string {
  const raw =
    item.statement?.trim() ||
    item.description?.trim() ||
    item.event_description?.trim() ||
    item.main_organizers?.trim() ||
    "";

  return raw ? stripHtml(raw) : "";
}

export function getTazehaLocation(item: TazehaItem): string {
  return (
    item.location_name?.trim() ||
    item.brand_name?.trim() ||
    item.district?.trim() ||
    item.location?.name?.trim() ||
    ""
  );
}

export function getTazehaCategoryId(item: TazehaItem): number | undefined {
  const id = item.category_id ?? item.category;
  return typeof id === "number" ? id : undefined;
}

export function mergeTazehaWithEventDetail(
  item: TazehaItem,
  detail: EventDetail
): TazehaItem {
  return {
    ...item,
    statement: item.statement || detail.statement,
    main_organizers: item.main_organizers || detail.main_organizers,
    start_datetime: item.start_datetime || detail.start_datetime,
    finish_datetime: item.finish_datetime || detail.finish_datetime,
    location_name: item.location_name || detail.location?.name,
    location: item.location?.name
      ? item.location
      : detail.location
        ? { name: detail.location.name }
        : item.location,
  };
}
