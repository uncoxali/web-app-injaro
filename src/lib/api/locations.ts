import { authFetch } from "@/lib/auth-fetch";
import { apiFetchJson } from "@/lib/api-fetch";
import { normalizeIranCoordinates } from "@/lib/map-utils";
import type { Location } from "@/store/map";

export interface BrandEvent {
  event_slug: string;
  slug?: string;
  topic: string;
  thumbnail?: string;
  start_datetime?: string;
  finish_datetime?: string;
  is_live?: boolean;
}

export interface KenarItem {
  id: number;
  title: string;
  image?: string;
  link?: string;
}

export interface LocationDetail extends Location {
  address?: string;
  description?: string;
  website?: string;
  phone?: string;
  instagram?: string;
  telegram?: string;
  banner?: string;
  background_image?: string;
  subway_station?: string;
  bus_station?: string;
  parking?: string;
  events?: BrandEvent[];
  kenar?: KenarItem[];
  qr_code?: string;
  is_saved?: boolean;
  is_liked?: boolean;
  likes?: number;
}

export function pickFeaturedEvent(
  events?: BrandEvent[],
  preferredSlug?: string | null
): BrandEvent | null {
  if (!events?.length) return null;
  const preferred = preferredSlug?.trim();
  if (preferred) {
    const match = events.find(
      (event) => event.event_slug === preferred || event.slug === preferred
    );
    if (match) return match;
  }
  return events.find((event) => event.is_live) ?? events[0];
}

export function resolveActiveEventSlug(
  events: BrandEvent[] | undefined,
  preferredSlug?: string | null
): string | null {
  const preferred = preferredSlug?.trim();
  if (preferred) return preferred;
  return pickFeaturedEvent(events)?.event_slug ?? null;
}

export function normalizeLocationDetail(raw: Record<string, unknown>): LocationDetail {
  const events = Array.isArray(raw.events) ? raw.events : [];
  const banner =
    (raw.background_image as string | undefined) ||
    (raw.banner as string | undefined);

  return {
    ...(raw as unknown as LocationDetail),
    banner,
    background_image: banner,
    subway_station:
      typeof raw.subway_station === "string" ? raw.subway_station : undefined,
    bus_station:
      typeof raw.bus_station === "string" ? raw.bus_station : undefined,
    parking: typeof raw.parking === "string" ? raw.parking : undefined,
    events: events
      .map((item) => {
        const event = item as Record<string, unknown>;
        const eventSlug =
          (typeof event.event_slug === "string" && event.event_slug) ||
          (typeof event.slug === "string" && event.slug) ||
          "";
        if (!eventSlug) return null;
        return {
          ...(event as unknown as BrandEvent),
          event_slug: eventSlug,
        };
      })
      .filter((event): event is BrandEvent => event !== null),
    is_saved: typeof raw.is_saved === "boolean" ? raw.is_saved : undefined,
    is_liked: typeof raw.is_liked === "boolean" ? raw.is_liked : undefined,
    likes: typeof raw.likes === "number" ? raw.likes : undefined,
  };
}

function slugToNumericId(slug: string, fallback: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = Math.imul(31, hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || fallback;
}

function normalizeLocationListItem(
  raw: Record<string, unknown>,
  index: number
): Location | null {
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  if (!slug) return null;

  const latitudeRaw = Number(raw.latitude);
  const longitudeRaw = Number(raw.longitude);
  if (!Number.isFinite(latitudeRaw) || !Number.isFinite(longitudeRaw)) return null;

  const { latitude, longitude } = normalizeIranCoordinates(
    latitudeRaw,
    longitudeRaw
  );

  return {
    id:
      typeof raw.id === "number"
        ? raw.id
        : slugToNumericId(slug, index + 1),
    name: String(raw.name ?? ""),
    slug,
    latitude,
    longitude,
    category: typeof raw.category === "number" ? raw.category : 0,
    logo: typeof raw.logo === "string" ? raw.logo : undefined,
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : undefined,
    events_count:
      typeof raw.events_count === "number" ? raw.events_count : undefined,
    is_open: typeof raw.is_open === "boolean" ? raw.is_open : undefined,
    address: typeof raw.address === "string" ? raw.address : undefined,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
  };
}

function normalizeLocationList(data: unknown): Location[] {
  const list = Array.isArray(data) ? data : [];
  const seen = new Set<string>();
  const normalized: Location[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = normalizeLocationListItem(
      list[i] as Record<string, unknown>,
      i
    );
    if (!item || seen.has(item.slug)) continue;
    seen.add(item.slug);
    normalized.push(item);
  }

  return normalized;
}

export interface Sponsor {
  id: number;
  name: string;
  logo?: string;
  link?: string;
  latitude?: number;
  longitude?: number;
}

export async function getLocations(params?: {
  category?: number;
  search?: string;
}): Promise<Location[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("events__category", String(params.category));
  if (params?.search) searchParams.set("search", params.search);

  const qs = searchParams.toString();
  const res = await authFetch(`/main/v2/location/list/${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch locations");
  const data = await res.json();
  return normalizeLocationList(data);
}

export async function getLocationDetail(
  slug: string
): Promise<LocationDetail> {
  const res = await authFetch(`/main/v2/location/${slug}/`);
  if (!res.ok) throw new Error("Failed to fetch location detail");
  const data = await res.json();
  return normalizeLocationDetail(data);
}

async function postLocationAction(
  slug: string,
  action: "save" | "like"
): Promise<Response> {
  const paths = [
    `/main/location/${slug}/${action}/`,
    `/main/v2/location/${slug}/${action}/`,
  ];

  let lastRes: Response | null = null;
  for (const path of paths) {
    const res = await authFetch(path, { method: "POST" });
    if (res.ok) return res;
    lastRes = res;
    if (res.status !== 404) break;
  }

  throw new Error(
    `Failed to toggle ${action} location (${lastRes?.status ?? 0})`
  );
}

export async function toggleSaveLocation(slug: string): Promise<void> {
  await postLocationAction(slug, "save");
}

export async function toggleLikeLocation(slug: string): Promise<void> {
  await postLocationAction(slug, "like");
}

export async function getSponsors(): Promise<Sponsor[]> {
  return apiFetchJson<Sponsor[]>("/main/sponsor/list/");
}

export async function reportNavigationClick(slug: string): Promise<void> {
  await authFetch(`/analyst/navigation/click/counter/${slug}`, {
    method: "POST",
  });
}
