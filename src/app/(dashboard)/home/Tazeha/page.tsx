"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTazeha, type TazehaResponse, type TazehaItem } from "@/lib/api/tazeha";
import { getLandingEvents, type LandingEvent } from "@/lib/api/landing";
import {
  DateSlider,
  generateDays,
} from "@/components/tazeha/date-slider";
import { ErrorState } from "@/components/ui/error-state";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { imgUrl, toPersianDigits, cn } from "@/lib/utils";

const SECTION_META: Record<
  string,
  { label: string; description: string; accent: string; bg: string }
> = {
  live_events: {
    label: "رویدادهای زنده",
    description: "الان در حال برگزاری",
    accent: "text-success",
    bg: "bg-success/10",
  },
  future_events: {
    label: "رویدادهای آینده",
    description: "برنامه‌ریزی‌شده برای روزهای پیش‌رو",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  popular_events: {
    label: "رویدادهای محبوب",
    description: "پرطرفدارترین‌ها",
    accent: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  all_events: {
    label: "همه رویدادها",
    description: "آخرین به‌روزرسانی‌ها",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
};

const KNOWN_SECTION_KEYS = [
  "live_events",
  "future_events",
  "popular_events",
  "all_events",
] as const;

function buildSections(data: TazehaResponse) {
  const seen = new Set<string>();
  const sections: {
    key: string;
    label: string;
    description: string;
    meta: (typeof SECTION_META)[string] | undefined;
    items: TazehaItem[];
  }[] = [];

  for (const key of KNOWN_SECTION_KEYS) {
    const items = data[key];
    if (!items?.length) continue;
    seen.add(key);
    sections.push({
      key,
      label: SECTION_META[key]?.label ?? key,
      description: SECTION_META[key]?.description ?? "",
      meta: SECTION_META[key],
      items,
    });
  }

  for (const [key, items] of Object.entries(data)) {
    if (seen.has(key) || !Array.isArray(items) || items.length === 0) continue;
    sections.push({
      key,
      label: key,
      description: "",
      meta: undefined,
      items,
    });
  }

  return sections;
}

function getSlug(item: TazehaItem): string {
  return item.event_slug || item.topic || String(item.id || "");
}

function getTitle(item: TazehaItem): string {
  return item.event_name || item.topic || "";
}

function getImage(item: TazehaItem): string {
  return item.thumbnail || item.image_url || "";
}

function landingToItem(event: LandingEvent): TazehaItem {
  return {
    event_slug: event.event_slug,
    topic: event.topic,
    thumbnail: event.thumbnail,
    event_name: event.topic,
  };
}

function SectionIcon({ sectionKey }: { sectionKey: string }) {
  const meta = SECTION_META[sectionKey];
  const className = cn("w-4 h-4", meta?.accent ?? "text-primary");

  if (sectionKey === "live_events") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (sectionKey === "popular_events") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function EventListCard({
  item,
  index,
  sectionKey,
}: {
  item: TazehaItem;
  index: number;
  sectionKey: string;
}) {
  const slug = getSlug(item);
  const title = getTitle(item);
  const image = imgUrl(getImage(item));
  const isLive = sectionKey === "live_events";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        href={`/events/${slug}`}
        className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-border/70 shadow-sm shadow-black/[0.03] active:scale-[0.99] transition-transform"
      >
        <div className="relative shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden bg-surface">
          {image ? (
            <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary/25">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          {isLive && (
            <span className="absolute top-1.5 end-1.5 flex items-center gap-0.5 rounded-full bg-success px-1.5 py-0.5 text-[9px] font-bold text-white">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              زنده
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
            {title}
          </p>
          <p className="text-[11px] text-text-secondary mt-1">
            {isLive ? "در حال برگزاری" : "مشاهده جزئیات"}
          </p>
        </div>

        <svg
          className="shrink-0 text-text-secondary/40 -scale-x-100"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </motion.div>
  );
}

function EventSlideCard({
  item,
  index,
  sectionKey,
}: {
  item: TazehaItem;
  index: number;
  sectionKey: string;
}) {
  const slug = getSlug(item);
  const title = getTitle(item);
  const image = imgUrl(getImage(item));
  const isLive = sectionKey === "live_events";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        href={`/events/${slug}`}
        className="block w-[140px] shrink-0 snap-start"
      >
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-border">
          {image ? (
            <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary/25">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {isLive && (
            <span className="absolute top-2 end-2 flex items-center gap-0.5 rounded-full bg-success px-1.5 py-0.5 text-[9px] font-bold text-white">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              زنده
            </span>
          )}
          <div className="absolute bottom-0 inset-x-0 p-2.5">
            <p className="text-[11px] font-medium text-white leading-tight line-clamp-2">
              {title}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SectionSlider({
  items,
  sectionKey,
  sectionIndex,
}: {
  items: TazehaItem[];
  sectionKey: string;
  sectionIndex: number;
}) {
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-3 overflow-x-auto scrollbar-none ps-5 pe-4 pb-1"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item, index) => (
          <EventSlideCard
            key={item.event_slug || item.id || index}
            item={item}
            index={sectionIndex * 10 + index}
            sectionKey={sectionKey}
          />
        ))}
      </div>
    </div>
  );
}

function GuestBanner() {
  return (
    <div className="mx-4 mb-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-white to-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">ورود برای تجربه کامل</p>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            با ورود، رویدادهای شخصی‌سازی‌شده را ببینید.
          </p>
          <Link
            href={loginUrl("/home/Tazeha")}
            className="inline-flex mt-3 text-xs font-semibold text-white bg-primary px-4 py-2 rounded-full"
          >
            ورود / ثبت‌نام
          </Link>
        </div>
      </div>
    </div>
  );
}

function SliderSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="overflow-hidden ps-5 pe-4">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="w-[140px] aspect-[3/4] rounded-xl bg-border/50 animate-pulse shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5 px-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-surface animate-pulse">
          <div className="w-[72px] h-[72px] rounded-xl bg-border/60" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-4/5 rounded-md bg-border/60" />
            <div className="h-3 w-1/3 rounded-md bg-border/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-text-secondary/30 mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <p className="text-sm font-medium text-text-primary">رویدادی یافت نشد</p>
      <p className="text-xs text-text-secondary mt-1.5 max-w-[240px] leading-relaxed">
        فعلاً رویدادی برای نمایش وجود ندارد. بعداً سر بزنید.
      </p>
    </div>
  );
}

export default function TazehaPage() {
  const [data, setData] = useState<TazehaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(generateDays(1)[0].date);
  const [guest, setGuest] = useState(true);

  const days = useMemo(() => generateDays(30), []);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);

    const authed = isAuthenticated();
    setGuest(!authed);

    if (!authed) {
      getLandingEvents()
        .then((events) => {
          setData({ all_events: events.map(landingToItem) });
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
      return;
    }

    // Date filter UI only for now — fetch all events without date param
    getTazeha()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const sections = useMemo(() => (data ? buildSections(data) : []), [data]);

  const totalCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.items.length, 0),
    [sections]
  );

  const selectedDay = days.find((d) => d.date === selectedDate);

  return (
    <div className="flex flex-col min-h-dvh bg-surface/40 overflow-x-hidden">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="px-4 pt-6 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-text-primary">تازه‌ها</h1>
              <p className="text-sm text-text-secondary mt-0.5">
                {loading
                  ? "در حال بارگذاری..."
                  : totalCount > 0
                    ? `${toPersianDigits(totalCount)} رویداد`
                    : "آخرین رویدادها و گالری‌ها"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedDay && (
                <div className="text-left">
                  <p className="text-[10px] text-text-secondary">{selectedDay.dayName}</p>
                  <p className="text-sm font-bold text-text-primary">
                    {toPersianDigits(selectedDay.label)} {selectedDay.monthName}
                  </p>
                </div>
              )}
              {guest && (
                <Link
                  href={loginUrl("/home/Tazeha")}
                  className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  ورود
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="pb-2">
          <DateSlider days={days} selected={selectedDate} onSelect={handleDateSelect} />
        </div>
        {guest && <GuestBanner />}
      </div>

      {loading ? (
        <div className="flex flex-col gap-8 pt-4 pb-6">
          {Array.from({ length: guest ? 1 : 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-36 rounded-md bg-border/50 animate-pulse mb-3 mx-4" />
              {guest ? <ListSkeleton rows={5} /> : <SliderSkeleton cards={4} />}
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <ErrorState onRetry={() => fetchData()} />
        </div>
      ) : sections.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-7 pt-4 pb-8"
        >
          {sections.map((section, sectionIndex) => (
            <section key={section.key}>
              <div className="flex items-center gap-2.5 px-4 mb-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    section.meta?.bg ?? "bg-primary/10"
                  )}
                >
                  <SectionIcon sectionKey={section.key} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-text-primary">
                    {section.label}
                  </h2>
                  <p className="text-[11px] text-text-secondary truncate">
                    {section.description}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-text-secondary bg-white border border-border/60 px-2 py-0.5 rounded-full">
                  {toPersianDigits(section.items.length)}
                </span>
              </div>

              {guest ? (
                <div className="flex flex-col gap-2.5 px-4">
                  {section.items.map((item, index) => (
                    <EventListCard
                      key={item.event_slug || item.id || index}
                      item={item}
                      index={sectionIndex * 10 + index}
                      sectionKey={section.key}
                    />
                  ))}
                </div>
              ) : (
                <SectionSlider
                  items={section.items}
                  sectionKey={section.key}
                  sectionIndex={sectionIndex}
                />
              )}
            </section>
          ))}
        </motion.div>
      )}
    </div>
  );
}
