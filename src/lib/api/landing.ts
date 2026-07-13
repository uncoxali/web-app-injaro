import type { Location } from "@/store/map";
import { apiFetch } from "@/lib/api-fetch";
import { authFetch } from "@/lib/auth-fetch";
import { getTazehaPage } from "@/lib/api/tazeha";

export interface LandingEvent {
  event_slug: string;
  thumbnail?: string;
  topic: string;
}

export interface LandingLocation {
  slug: string;
  logo?: string;
  name: string;
  latitude: number;
  longitude: number;
  is_live: boolean;
  category?: number;
}

function mapLocationRecordToLanding(
  raw: Record<string, unknown>
): LandingLocation | null {
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  if (!slug) return null;

  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    slug,
    logo: typeof raw.logo === "string" ? raw.logo : undefined,
    name: String(raw.name ?? ""),
    latitude,
    longitude,
    is_live:
      typeof raw.is_live === "boolean"
        ? raw.is_live
        : typeof raw.is_open === "boolean"
          ? raw.is_open
          : false,
    category: typeof raw.category === "number" ? raw.category : undefined,
  };
}

function mapLocationsPayloadToLanding(data: unknown): LandingLocation[] {
  const list = Array.isArray(data) ? data : [];
  const seen = new Set<string>();
  const locations: LandingLocation[] = [];

  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const mapped = mapLocationRecordToLanding(entry as Record<string, unknown>);
    if (!mapped || seen.has(mapped.slug)) continue;
    seen.add(mapped.slug);
    locations.push(mapped);
  }

  return locations;
}

async function fetchMainLocationList(): Promise<LandingLocation[]> {
  const authedRes = await authFetch("/main/v2/location/list/");
  if (authedRes.ok) {
    return mapLocationsPayloadToLanding(await authedRes.json());
  }

  const publicRes = await apiFetch("/main/v2/location/list/");
  if (!publicRes.ok) {
    throw new Error("Failed to fetch locations");
  }

  return mapLocationsPayloadToLanding(await publicRes.json());
}

export async function getLandingEvents(): Promise<LandingEvent[]> {
  try {
    const res = await apiFetch("/landing/tazeha/list/");
    if (res.ok) {
      return (await res.json()) as LandingEvent[];
    }
  } catch {
    // Fall through to main API.
  }

  const page = await getTazehaPage();
  return page.items
    .map((item) => ({
      event_slug: item.event_slug ?? "",
      thumbnail: item.thumbnail,
      topic: item.topic || item.event_name || item.event_slug || "",
    }))
    .filter((event) => event.event_slug);
}

export async function getLandingLocations(): Promise<LandingLocation[]> {
  try {
    const res = await apiFetch("/landing/location/list/");
    if (res.ok) {
      return (await res.json()) as LandingLocation[];
    }
  } catch {
    // Fall through to main API.
  }

  return fetchMainLocationList();
}

export async function getLandingEventBySlug(
  slug: string,
  cachedEvents?: LandingEvent[]
): Promise<LandingEvent | null> {
  const events = cachedEvents ?? (await getLandingEvents());
  return events.find((e) => e.event_slug === slug) ?? null;
}

export function landingLocationToMarker(
  loc: LandingLocation,
  id: number
): Location {
  return {
    id,
    name: loc.name,
    slug: loc.slug,
    latitude: loc.latitude,
    longitude: loc.longitude,
    category: loc.category ?? 0,
    logo: loc.logo,
    is_open: loc.is_live,
  };
}

export function filterLandingLocations(
  locations: LandingLocation[],
  search?: string
): LandingLocation[] {
  if (!search?.trim()) return locations;
  const q = search.trim().toLowerCase();
  return locations.filter((loc) => loc.name.toLowerCase().includes(q));
}
