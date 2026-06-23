import { authFetch } from "@/lib/auth-fetch";

export interface TazehaItem {
  event_slug?: string;
  topic?: string;
  thumbnail?: string;
  event_name?: string;
  image_url?: string;
  id?: number;
}

export interface TazehaResponse {
  live_events?: TazehaItem[];
  future_events?: TazehaItem[];
  popular_events?: TazehaItem[];
  [key: string]: TazehaItem[] | undefined;
}

export async function getTazeha(date?: string): Promise<TazehaResponse> {
  const params = date ? `?date=${date}` : "";
  const res = await authFetch(`/main/Tazeha/list/${params}`);
  if (!res.ok) throw new Error("Failed to fetch Tazeha");
  return res.json();
}
