import type { TazehaItem, TazehaResponse } from "@/lib/api/tazeha";

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

function pickNumber(
  raw: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return undefined;
}

function pickNestedName(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  return pickString(value as Record<string, unknown>, "name", "title", "label");
}

export function normalizeTazehaItem(
  raw: unknown,
  sectionKey?: string
): TazehaItem {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const location =
    record.location && typeof record.location === "object"
      ? (record.location as Record<string, unknown>)
      : undefined;
  const brand =
    record.brand && typeof record.brand === "object"
      ? (record.brand as Record<string, unknown>)
      : undefined;
  const event =
    record.event && typeof record.event === "object"
      ? (record.event as Record<string, unknown>)
      : undefined;

  const statement =
    pickString(
      record,
      "statement",
      "description",
      "event_description",
      "summary",
      "short_description",
      "about",
      "text",
      "bio",
      "content",
      "excerpt"
    ) ||
    (event
      ? pickString(
          event,
          "statement",
          "description",
          "event_description",
          "summary",
          "short_description"
        )
      : undefined);

  const categoryRaw = record.category;

  return {
    id: pickNumber(record, "id"),
    event_slug:
      pickString(record, "event_slug", "slug") ||
      (event ? pickString(event, "event_slug", "slug") : undefined),
    topic:
      pickString(record, "topic", "event_name", "title", "name") ||
      (event ? pickString(event, "topic", "event_name", "title") : undefined),
    event_name: pickString(record, "event_name", "topic", "title"),
    thumbnail:
      pickString(record, "thumbnail", "image", "image_url", "poster") ||
      (event ? pickString(event, "thumbnail", "image", "image_url") : undefined),
    image_url: pickString(record, "image_url", "thumbnail", "image"),
    statement,
    description: pickString(record, "description"),
    event_description: pickString(record, "event_description"),
    main_organizers:
      pickString(record, "main_organizers", "organizers", "organizer") ||
      (event ? pickString(event, "main_organizers", "organizers") : undefined),
    start_datetime:
      pickString(
        record,
        "start_datetime",
        "start_date",
        "start_time",
        "event_start",
        "from_date"
      ) ||
      (event
        ? pickString(event, "start_datetime", "start_date", "start_time")
        : undefined),
    finish_datetime:
      pickString(
        record,
        "finish_datetime",
        "finish_date",
        "end_datetime",
        "end_date",
        "event_end",
        "to_date"
      ) ||
      (event
        ? pickString(event, "finish_datetime", "finish_date", "end_datetime")
        : undefined),
    start_date: pickString(record, "start_date"),
    end_date: pickString(record, "end_date"),
    location_name:
      pickString(
        record,
        "location_name",
        "venue_name",
        "place_name",
        "district",
        "hood"
      ) ||
      pickNestedName(location) ||
      pickNestedName(brand) ||
      (event ? pickNestedName(event.location) : undefined),
    brand_name:
      pickString(record, "brand_name") ||
      pickNestedName(brand) ||
      (event ? pickNestedName(event.brand) : undefined),
    district: pickString(record, "district", "neighborhood", "area", "hood"),
    location: location
      ? { name: pickNestedName(location) }
      : event?.location && typeof event.location === "object"
        ? { name: pickNestedName(event.location) }
        : undefined,
    category:
      typeof categoryRaw === "number" && !Number.isNaN(categoryRaw)
        ? categoryRaw
        : pickNumber(record, "category_id"),
    category_id: pickNumber(record, "category_id"),
    category_name:
      (typeof categoryRaw === "string" && categoryRaw.trim()
        ? categoryRaw.trim()
        : undefined) ||
      pickString(record, "category_name", "category_label"),
    category_section: sectionKey,
    is_live: record.is_live === true || record.is_open === true,
  };
}

export function normalizeTazehaResponse(raw: unknown): TazehaResponse {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const result: TazehaResponse = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    result[key] = value.map((item) => normalizeTazehaItem(item, key));
  }
  return result;
}
