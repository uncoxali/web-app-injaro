import { authFetch } from "@/lib/auth-fetch";
import { apiFetch } from "@/lib/api-fetch";

export interface EventImage {
  url: string;
  alt?: string;
}

export interface SideOrganizer {
  id: number;
  name: string;
  logo?: string;
}

export interface EventLocation {
  name: string;
  slug: string;
  address?: string;
}

export interface CompanyBooth {
  id: number;
  name: string;
  logo?: string;
  booth?: string;
  link?: string;
}

export interface EventSaloon {
  name: string;
  company?: CompanyBooth[];
}

export interface TalkItem {
  name?: string;
  title?: string;
  time?: string;
}

export interface EventDetail {
  id: number;
  topic: string;
  slug: string;
  event_slug: string;
  images?: EventImage[];
  thumbnail?: string;
  start_datetime?: string;
  finish_datetime?: string;
  main_organizers?: string;
  side_organizers?: SideOrganizer[];
  statement?: string;
  location?: EventLocation | string;
  saloons?: EventSaloon[];
  conversation_panel?: TalkItem[];
  is_vip?: boolean;
  need_ticket?: boolean;
  GoogleMapLink?: string;
  GoogleCalendarLink?: string;
  is_going?: boolean;
  is_liked?: boolean;
  is_saved?: boolean;
  likes?: number;
}

export interface EventInteractionState {
  is_going?: boolean;
  is_liked?: boolean;
  is_saved?: boolean;
  likes?: number;
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  const res = await authFetch(`/main/v2/event/${slug}/`);
  if (!res.ok) throw new Error("Failed to fetch event detail");
  return res.json();
}

export async function getPublicEventDetail(slug: string): Promise<EventDetail | null> {
  try {
    const res = await apiFetch(`/main/v2/event/${slug}/`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getEventInteractionState(
  eventSlug: string
): Promise<EventInteractionState> {
  const res = await authFetch(`/main/v2/event/${eventSlug}/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch event state (${res.status})`);
  }
  const data = await res.json();
  return parseEventInteractionState(data);
}

export function parseEventInteractionState(data: unknown): EventInteractionState {
  if (!data || typeof data !== "object") return {};

  const record = data as Record<string, unknown>;
  return {
    is_going: typeof record.is_going === "boolean" ? record.is_going : undefined,
    is_liked: typeof record.is_liked === "boolean" ? record.is_liked : undefined,
    is_saved: typeof record.is_saved === "boolean" ? record.is_saved : undefined,
    likes: typeof record.likes === "number" ? record.likes : undefined,
  };
}

async function postEventAction(
  eventSlug: string,
  action: "going" | "like" | "save"
): Promise<EventInteractionState> {
  const res = await authFetch(`/main/event/${eventSlug}/${action}/`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle event ${action} (${res.status})`);
  }

  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return parseEventInteractionState(JSON.parse(text));
  } catch {
    return {};
  }
}

export async function toggleGoingEvent(eventSlug: string): Promise<EventInteractionState> {
  return postEventAction(eventSlug, "going");
}

export async function toggleLikeEvent(eventSlug: string): Promise<EventInteractionState> {
  return postEventAction(eventSlug, "like");
}

export async function toggleSaveEvent(eventSlug: string): Promise<EventInteractionState> {
  return postEventAction(eventSlug, "save");
}

export interface InviteInfo {
  event_slug: string;
  parent_slug?: string;
  thumbnail?: string;
  topic: string;
}

export async function getInviteInfo(slug: string): Promise<InviteInfo> {
  const res = await authFetch(`/invite/link/${slug}/`);
  if (!res.ok) throw new Error("Failed to fetch invite info");
  return res.json();
}

export interface InviteResponse {
  event_slug: string;
  attend: boolean;
}

export async function submitInviteResponse(data: InviteResponse): Promise<void> {
  const res = await authFetch("/invite/form/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit invite response");
}

export interface SavedEvent {
  slug: string;
  topic: string;
  thumbnail?: string;
  event_slug: string;
  location_slug?: string;
  location_name?: string;
}

export type ProfileEventItem = SavedEvent;

function pickString(
  raw: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeProfileEventItem(
  raw: unknown,
  index: number
): ProfileEventItem | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const nested =
    record.event && typeof record.event === "object"
      ? (record.event as Record<string, unknown>)
      : null;
  const source = nested ?? record;

  const event_slug = pickString(source, "event_slug", "slug");
  if (!event_slug) return null;

  const topic =
    pickString(source, "topic", "event_name", "title") ?? event_slug;
  const thumbnail = pickString(source, "thumbnail", "image", "image_url");

  let location_slug: string | undefined;
  let location_name: string | undefined;
  const location = source.location;

  if (typeof location === "string") {
    location_slug = location;
  } else if (location && typeof location === "object") {
    const locationRecord = location as Record<string, unknown>;
    location_slug = pickString(locationRecord, "slug");
    location_name = pickString(locationRecord, "name");
  }

  location_name =
    location_name || pickString(source, "location_name", "hood", "brand_name");

  return {
    slug: pickString(record, "slug") ?? event_slug,
    event_slug,
    topic,
    thumbnail,
    location_slug,
    location_name,
  };
}

function normalizeProfileEventList(data: unknown): ProfileEventItem[] {
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const items: ProfileEventItem[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = normalizeProfileEventItem(data[i], i);
    if (!item || seen.has(item.event_slug)) continue;
    seen.add(item.event_slug);
    items.push(item);
  }

  return items;
}

export async function getSavedEvents(): Promise<ProfileEventItem[]> {
  const paths = ["/accounts/save/list/", "/accounts/saved/event/"];

  for (const path of paths) {
    const res = await authFetch(path);
    if (res.ok) {
      const data = await res.json();
      return normalizeProfileEventList(data);
    }
    if (res.status !== 404) break;
  }

  throw new Error("Failed to fetch saved events");
}

export async function getGoingEvents(): Promise<ProfileEventItem[]> {
  const res = await authFetch("/accounts/profile/events/going/");
  if (!res.ok) throw new Error("Failed to fetch going events");
  const data = await res.json();
  return normalizeProfileEventList(data);
}
