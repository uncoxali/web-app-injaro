import { authFetch } from "@/lib/auth-fetch";
import type { Category } from "@/lib/api/categories";

export interface UserProfile {
  id?: string;
  phone?: string;
  full_name?: string;
  email?: string;
  job?: string;
  living_city?: string;
  birth_at?: string;
  gender?: "male" | "female" | "";
  avatar_url?: string;
  permission?: string;
  interests?: number[];
  favorit_categories?: Category[];
  unread_notifications?: number;
}

function normalizeInterestIds(raw: Record<string, unknown>): number[] {
  if (Array.isArray(raw.favorit_category_ids)) {
    return raw.favorit_category_ids.filter(
      (id): id is number => typeof id === "number"
    );
  }

  if (Array.isArray(raw.interests)) {
    return raw.interests.filter((id): id is number => typeof id === "number");
  }

  if (Array.isArray(raw.favorit_category)) {
    return raw.favorit_category
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const id = (item as Category).id;
        return typeof id === "number" ? id : null;
      })
      .filter((id): id is number => id != null);
  }

  return [];
}

function normalizeFavoriteCategories(raw: Record<string, unknown>): Category[] {
  if (!Array.isArray(raw.favorit_category)) return [];

  return raw.favorit_category
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const category = item as Category;
      if (typeof category.id !== "number" || typeof category.name !== "string") {
        return null;
      }
      return category;
    })
    .filter((category): category is Category => category != null);
}

function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const interests = normalizeInterestIds(raw);
  const favorit_categories = normalizeFavoriteCategories(raw);

  return {
    ...(raw as UserProfile),
    phone:
      typeof raw.phone === "string"
        ? raw.phone
        : typeof raw.phone_number === "string"
          ? raw.phone_number
          : undefined,
    avatar_url:
      typeof raw.avatar_url === "string"
        ? raw.avatar_url
        : typeof raw.avatar === "string"
          ? raw.avatar
          : undefined,
    interests,
    favorit_categories:
      favorit_categories.length > 0 ? favorit_categories : undefined,
  };
}

function buildProfilePayload(data: Partial<UserProfile>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...data };

  if (data.interests !== undefined) {
    payload.favorit_category_ids = data.interests;
    delete payload.interests;
  }

  delete payload.favorit_categories;

  return payload;
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
  const data = await res.json();
  return normalizeProfile(data as Record<string, unknown>);
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await authFetch("/accounts/get/me/", {
    method: "PATCH",
    body: JSON.stringify(buildProfilePayload(data)),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const updated = await res.json();
  return normalizeProfile(updated as Record<string, unknown>);
}

export async function updateAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await authFetch("/accounts/get/me/", {
    method: "PATCH",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update avatar");
  const data = await res.json();
  return { avatar_url: data.avatar_url || data.avatar || "" };
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
