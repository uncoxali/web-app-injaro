import { authFetch } from "@/lib/auth-fetch";

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
  location?: EventLocation;
  saloons?: EventSaloon[];
  conversation_panel?: TalkItem[];
  is_vip?: boolean;
  need_ticket?: boolean;
  GoogleMapLink?: string;
  GoogleCalendarLink?: string;
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  const res = await authFetch(`/main/v2/event/${slug}/`);
  if (!res.ok) throw new Error("Failed to fetch event detail");
  return res.json();
}

export async function toggleSaveEvent(): Promise<void> {
  const res = await authFetch("/main/event/save/", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle save event");
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
}

export async function getSavedEvents(): Promise<SavedEvent[]> {
  const res = await authFetch("/accounts/saved/event/");
  if (!res.ok) throw new Error("Failed to fetch saved events");
  return res.json();
}
