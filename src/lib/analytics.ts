const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-YXQGPZCH29";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function pageview(path: string, title?: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(
  action: string,
  params?: EventParams
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
}

export const AnalyticsEvents = {
  locationClick: (slug: string, name: string) =>
    trackEvent("location_click", { slug, name }),
  eventView: (slug: string, id?: number) =>
    trackEvent("event_view", { slug, event_id: id }),
  search: (query: string) =>
    trackEvent("search", { search_term: query }),
  brandClick: (slug: string, name: string) =>
    trackEvent("brand_click", { slug, name }),
  share: (content_type: string, content_id?: string) =>
    trackEvent("share", { content_type, content_id }),
  login: (method?: string) =>
    trackEvent("login", { method }),
  signUp: () => trackEvent("sign_up"),
  filterApply: (filter_name: string, value: string) =>
    trackEvent("filter_apply", { filter_name, value }),
  categorySelect: (category_id: number, category_name: string) =>
    trackEvent("category_select", { category_id, category_name }),
};
