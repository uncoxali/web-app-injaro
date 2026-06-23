import { authFetch } from "@/lib/auth-fetch";

export interface UserProfile {
  id?: string;
  phone?: string;
  full_name?: string;
  email?: string;
  job?: string;
  living_city?: string;
  birth_at?: string;
  gender?: "male" | "female" | "";
  interests?: number[];
  unread_notifications?: number;
}

export interface Notification {
  id: number;
  title: string;
  message?: string;
  date?: string;
  link?: string;
  is_seen?: boolean;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await authFetch("/accounts/get/me/");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
  const res = await authFetch("/accounts/get/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await authFetch("/accounts/notification/list/");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationsSeen(): Promise<void> {
  const res = await authFetch("/accounts/notification/seen/", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to mark notifications");
}

export interface TicketPayload {
  subject: string;
  message: string;
}

export async function sendTicket(data: TicketPayload): Promise<void> {
  const res = await authFetch("/accounts/ticket/send/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send ticket");
}
