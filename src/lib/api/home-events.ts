import { apiFetch, apiFetchJson } from "@/lib/api-fetch";
import type { EventPin, EventTicket, LatestEvent } from "@/lib/api/generated";
import type { LandingEvent } from "@/lib/api/landing";
import type { TazehaItem } from "@/lib/api/tazeha";

export type HomeEventPin = EventPin & { event_slug: string };
export type HomeLatestEvent = LatestEvent & { event_slug: string };

export function getHomePinnedEvents(): Promise<HomeEventPin[]> {
  return apiFetchJson<HomeEventPin[]>("/main/home/event/pin/");
}

export function getHomeLatestEvents(): Promise<HomeLatestEvent[]> {
  return apiFetchJson<HomeLatestEvent[]>("/main/home/event/latest/");
}

export function getHomeTodayEvents(): Promise<HomeEventPin[]> {
  return apiFetchJson<HomeEventPin[]>("/main/home/event/today/");
}

export function getHomeWeekEvents(): Promise<HomeLatestEvent[]> {
  return apiFetchJson<HomeLatestEvent[]>("/main/home/event/week/");
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
