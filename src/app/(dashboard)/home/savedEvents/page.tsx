"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSavedEvents, type SavedEvent } from "@/lib/api/events";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { imgUrl, cn } from "@/lib/utils";

export default function SavedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSaved = useCallback(() => {
    setLoading(true);
    setError(false);
    getSavedEvents()
      .then(setEvents)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.trim().toLowerCase();
    return events.filter((ev) => ev.topic.toLowerCase().includes(q));
  }, [events, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={fetchSaved} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="sticky top-0 z-10 bg-background/85 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="بازگشت"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-text-primary">رویدادهای ذخیره‌شده</h1>
          {events.length > 0 && (
            <span className="me-auto text-[11px] font-medium text-text-secondary bg-surface px-2 py-0.5 rounded-full">
              {events.length}
            </span>
          )}
        </div>
        {events.length > 0 && (
          <div className="px-4 pb-3">
            <div className="relative">
              <svg
                className="absolute start-3 top-1/2 -translate-y-1/2 text-text-secondary"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="جستجو در ذخیره‌شده‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 ps-9 pe-4 rounded-xl bg-surface border border-border/60 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-text-secondary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 pt-5 pb-6">
        {events.length === 0 ? (
          <EmptyState
            title="رویدادی ذخیره نکردید"
            description="رویدادهای مورد علاقه خود را ذخیره کنید تا سریع به آن‌ها دسترسی داشته باشید"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="نتیجه‌ای یافت نشد"
            description={`موردی با نام "${searchQuery}" در ذخیره‌شده‌ها وجود ندارد`}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredEvents.map((ev, i) => (
              <motion.button
                key={ev.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => router.push(`/events/${ev.event_slug}`)}
                className="flex flex-col rounded-xl bg-surface border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all text-right active:scale-[0.98]"
              >
                <div className="aspect-[4/3] bg-surface overflow-hidden">
                  {ev.thumbnail ? (
                    <img
                      src={imgUrl(ev.thumbnail) ?? ""}
                      alt={ev.topic}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-text-primary line-clamp-2 leading-snug">
                    {ev.topic}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
