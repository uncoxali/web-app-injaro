import type { Location } from "@/store/map";
import { apiFetchJson } from "@/lib/api-fetch";

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

export function getLandingEvents(): Promise<LandingEvent[]> {
  return apiFetchJson<LandingEvent[]>("/landing/tazeha/list/");
}

export function getLandingLocations(): Promise<LandingLocation[]> {
  return apiFetchJson<LandingLocation[]>("/landing/location/list/");
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
