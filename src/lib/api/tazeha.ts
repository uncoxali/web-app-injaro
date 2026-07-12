import { apiFetchJson } from "@/lib/api-fetch";
import {
  normalizeTazehaItem,
  normalizeTazehaResponse,
} from "@/lib/api/tazeha-normalize";

export interface TazehaLocationRef {
  name?: string;
}

export interface TazehaItem {
  event_slug?: string;
  topic?: string;
  thumbnail?: string;
  event_name?: string;
  image_url?: string;
  id?: number;
  statement?: string;
  description?: string;
  event_description?: string;
  main_organizers?: string;
  start_datetime?: string;
  finish_datetime?: string;
  start_date?: string;
  end_date?: string;
  location_name?: string;
  brand_name?: string;
  district?: string;
  location?: TazehaLocationRef;
  category?: number;
  category_id?: number;
  /** Response bucket key from /main/tazeha/list/ (usually category name) */
  category_section?: string;
  is_live?: boolean;
}

export interface TazehaResponse {
  live_events?: TazehaItem[];
  future_events?: TazehaItem[];
  popular_events?: TazehaItem[];
  all_events?: TazehaItem[];
  [key: string]: TazehaItem[] | undefined;
}

interface TazehaPaginatedResponse {
  results?: unknown[];
  next?: string | null;
}

function isPaginatedResponse(raw: unknown): raw is TazehaPaginatedResponse {
  return (
    !!raw &&
    typeof raw === "object" &&
    Array.isArray((raw as TazehaPaginatedResponse).results)
  );
}

function nextPageFromUrl(next?: string | null): number | null {
  if (!next) return null;
  try {
    const page = new URL(next).searchParams.get("page");
    if (!page) return null;
    const parsed = Number(page);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function dedupeTazehaItems(items: TazehaItem[]): TazehaItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const slug = item.event_slug?.trim();
    if (!slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

export async function getTazeha(date?: string): Promise<TazehaResponse> {
  const merged: TazehaItem[] = [];
  let page = 1;

  for (;;) {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    const path = qs ? `/main/tazeha/list/?${qs}` : `/main/tazeha/list/`;
    const raw = await apiFetchJson<unknown>(path);

    if (!isPaginatedResponse(raw)) {
      return normalizeTazehaResponse(raw);
    }

    merged.push(
      ...raw.results!.map((item) => normalizeTazehaItem(item))
    );

    const nextPage = nextPageFromUrl(raw.next);
    if (!nextPage || nextPage <= page || page >= 20) break;
    page = nextPage;
  }

  return { all_events: dedupeTazehaItems(merged) };
}
