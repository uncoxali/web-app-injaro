import type { Location } from "@/store/map";
import { redirectToLogin } from "@/lib/auth-utils";
import { API_BASE } from "@/lib/api-base";

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

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (res.status === 403) {
    redirectToLogin();
    throw new Error("Forbidden");
  }
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

export function getLandingEvents(): Promise<LandingEvent[]> {
  return publicFetch<LandingEvent[]>("/landing/tazeha/list/");
}

export function getLandingLocations(): Promise<LandingLocation[]> {
  return publicFetch<LandingLocation[]>("/landing/location/list/");
}

export async function getLandingEventBySlug(
  slug: string
): Promise<LandingEvent | null> {
  const events = await getLandingEvents();
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
