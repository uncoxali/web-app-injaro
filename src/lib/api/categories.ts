import { authFetch } from "@/lib/auth-fetch";

export interface Category {
  id: number;
  name: string;
  icon?: string;
  location_icon?: string;
  location_selected_icon?: string;
}

export async function getCategories(): Promise<Category[]> {
  const res = await authFetch("/main/category/list/", { skipAuth: true });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}
