import { authFetch } from "@/lib/auth-fetch";
import { normalizeTazehaResponse } from "@/lib/api/tazeha-normalize";

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
  /** Response bucket key from /main/Tazeha/list/ (usually category name) */
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

export async function getTazeha(date?: string): Promise<TazehaResponse> {
  const params = date ? `?date=${date}` : "";
  const res = await authFetch(`/main/Tazeha/list/${params}`);
  if (!res.ok) throw new Error("Failed to fetch Tazeha");
  const raw: unknown = await res.json();
  return normalizeTazehaResponse(raw);
}
