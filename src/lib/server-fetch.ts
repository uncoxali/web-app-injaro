import { cookies } from "next/headers";
import type { EventDetail } from "@/lib/api/events";
import type { LocationDetail } from "@/lib/api/locations";
import { normalizeLocationDetail } from "@/lib/api/locations";

const API_ORIGIN =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ||
  "https://api.injaro.info";

async function serverFetch(path: string): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(`${API_ORIGIN}${path}`, {
    headers,
    next: { revalidate: 60 },
  });
}

export async function fetchEventDetailServer(
  slug: string
): Promise<EventDetail | null> {
  const res = await serverFetch(`/main/v2/event/${slug}/`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchLocationDetailServer(
  slug: string
): Promise<LocationDetail | null> {
  const res = await serverFetch(`/main/v2/location/${slug}/`);
  if (!res.ok) return null;
  const data = await res.json();
  return normalizeLocationDetail(data);
}
