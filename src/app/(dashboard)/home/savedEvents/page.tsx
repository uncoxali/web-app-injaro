"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSavedEvents, type SavedEvent } from "@/lib/api/events";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.injaro.info";

export default function SavedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-text-primary">رویدادهای ذخیره‌شده</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-text-secondary/20"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm text-text-secondary mt-4">
              رویدادی ذخیره نکردید
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {events.map((ev, i) => (
              <motion.button
                key={ev.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => router.push(`/events/${ev.event_slug}`)}
                className="flex flex-col rounded-xl bg-white border border-border/60 overflow-hidden hover:border-primary/30 transition-colors text-right"
              >
                <div className="aspect-[4/3] bg-surface overflow-hidden">
                  {ev.thumbnail ? (
                    <img
                      src={API_BASE + ev.thumbnail}
                      alt={ev.topic}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-text-secondary/20"
                      >
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
