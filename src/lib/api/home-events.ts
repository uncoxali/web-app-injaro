import { apiFetch, apiFetchJson } from "@/lib/api-fetch";
import type { EventPin, EventTicket, LatestEvent } from "@/lib/api/generated";
import type { LandingEvent } from "@/lib/api/landing";
import type { TazehaItem } from "@/lib/api/tazeha";

export type HomeEventPin = EventPin & { event_slug: string };
export type HomeLatestEvent = LatestEvent & { event_slug: string };

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

function normalizeHomeEventPin(raw: unknown): HomeEventPin | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const event_slug = pickString(record, "event_slug", "slug");
  if (!event_slug) return null;

  return {
    event_slug,
    topic: pickString(record, "topic", "event_name", "title") ?? event_slug,
    thumbnail: pickString(record, "thumbnail", "image", "image_url"),
    statement: pickString(record, "statement", "description"),
    start_datetime: pickString(record, "start_datetime", "start_date"),
    finish_datetime: pickString(record, "finish_datetime", "finish_date", "end_date"),
  };
}

function normalizeHomeLatestEvent(raw: unknown): HomeLatestEvent | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const event_slug = pickString(record, "event_slug", "slug");
  if (!event_slug) return null;

  return {
    event_slug,
    thumbnail: pickString(record, "thumbnail", "image", "image_url"),
  };
}

function normalizeHomeEventPinList(data: unknown): HomeEventPin[] {
  if (Array.isArray(data)) {
    return data
      .map(normalizeHomeEventPin)
      .filter((item): item is HomeEventPin => item !== null);
  }

  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  if (Array.isArray(record.results)) {
    return normalizeHomeEventPinList(record.results);
  }
  if (Array.isArray(record.data)) {
    return normalizeHomeEventPinList(record.data);
  }

  const merged: HomeEventPin[] = [];
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      merged.push(...normalizeHomeEventPinList(value));
    }
  }

  return merged;
}

function normalizeHomeLatestEventList(data: unknown): HomeLatestEvent[] {
  if (Array.isArray(data)) {
    return data
      .map(normalizeHomeLatestEvent)
      .filter((item): item is HomeLatestEvent => item !== null);
  }

  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  if (Array.isArray(record.results)) {
    return normalizeHomeLatestEventList(record.results);
  }
  if (Array.isArray(record.data)) {
    return normalizeHomeLatestEventList(record.data);
  }

  const merged: HomeLatestEvent[] = [];
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      merged.push(...normalizeHomeLatestEventList(value));
    }
  }

  return merged;
}

export async function getHomePinnedEvents(): Promise<HomeEventPin[]> {
  const data = await apiFetchJson<unknown>("/main/home/event/pin/");
  return normalizeHomeEventPinList(data);
}

export async function getHomeLatestEvents(): Promise<HomeLatestEvent[]> {
  const data = await apiFetchJson<unknown>("/main/home/event/latest/");
  return normalizeHomeLatestEventList(data);
}

export async function getHomeTodayEvents(): Promise<HomeEventPin[]> {
  const data = await apiFetchJson<unknown>("/main/home/event/today/");
  return normalizeHomeEventPinList(data);
}

export async function getHomeWeekEvents(): Promise<HomeLatestEvent[]> {
  const data = await apiFetchJson<unknown>("/main/home/event/week/");
  return normalizeHomeLatestEventList(data);
}

export function eventPinToTazehaItem(event: HomeEventPin): TazehaItem {
  return {
    event_slug: event.event_slug,
    topic: event.topic,
    thumbnail: event.thumbnail,
    event_name: event.topic,
    statement: event.statement,
    start_datetime: event.start_datetime,
    finish_datetime: event.finish_datetime,
  };
}

export function latestEventToLandingEvent(event: HomeLatestEvent): LandingEvent {
  return {
    event_slug: event.event_slug,
    thumbnail: event.thumbnail,
    topic: event.event_slug,
  };
}

export function eventPinToLandingEvent(event: HomeEventPin): LandingEvent {
  return {
    event_slug: event.event_slug,
    thumbnail: event.thumbnail,
    topic: event.topic,
  };
}

export type HomeEventTicketPayload = {
  provider_name: string;
  event_name: string;
  event_category: string;
  phone_number: string;
  attachment: string;
  description: string;
};

export async function submitHomeEventTicket(
  payload: HomeEventTicketPayload
): Promise<EventTicket> {
  const res = await apiFetch("/main/home/event/ticket/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to submit event ticket");
  }
  return res.json() as Promise<EventTicket>;
}
