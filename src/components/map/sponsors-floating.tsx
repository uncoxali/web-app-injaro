"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSponsors, type Sponsor } from "@/lib/api/locations";
import { isAuthenticated } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5000;

function SponsorSkeleton() {
  return (
    <div className="pointer-events-none overflow-hidden rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-3 p-3">
        <div className="h-5 w-14 rounded-full bg-border/60 animate-pulse" />
        <div className="h-10 w-10 rounded-xl bg-border/60 animate-pulse shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 rounded-md bg-border/60 animate-pulse" />
          <div className="h-2.5 w-20 rounded-md bg-border/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SponsorLogo({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="relative shrink-0">
      <div className="absolute inset-0 rounded-xl bg-primary/25 blur-md scale-125" />
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white ring-2 ring-white shadow-sm">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-base font-bold text-primary">
            {name.charAt(0)}
          </span>
        )}
      </div>
    </div>
  );
}

export function SponsorsFloating() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    getSponsors()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSponsors(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sponsors.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [sponsors.length]);

  if (loading) {
    return (
      <div
        className="absolute inset-x-0 z-30 px-4 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.25rem)" }}
      >
        <SponsorSkeleton />
      </div>
    );
  }

  if (sponsors.length === 0) return null;

  const sponsor = sponsors[current];

  return (
    <div
      className="absolute inset-x-0 z-30 px-4 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.25rem)" }}
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(17,24,39,0.12)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />

        <div
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 animate-sponsor-shine"
          aria-hidden
        />

        <AnimatePresence mode="wait">
          <motion.a
            key={sponsor.id}
            href={sponsor.link || "#"}
            target={sponsor.link ? "_blank" : undefined}
            rel={sponsor.link ? "noopener noreferrer" : undefined}
            onClick={!sponsor.link ? (e) => e.preventDefault() : undefined}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex items-center gap-3 p-3 pe-4"
          >
            <span className="shrink-0 rounded-full border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 px-2.5 py-1 text-[9px] font-bold tracking-wide text-primary">
              ✦ حامی
            </span>

            <SponsorLogo name={sponsor.name} logo={sponsor.logo} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {sponsor.name}
              </p>
              <p className="text-[10px] text-text-secondary">
                با حمایت از اینجارو
              </p>
            </div>

            {sponsor.link && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="-scale-x-100"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </motion.a>
        </AnimatePresence>

        {sponsors.length > 1 && (
          <>
            <div className="flex justify-center gap-1.5 pb-2.5">
              {sponsors.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`اسپانسر ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i === current
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-border hover:bg-primary/40"
                  )}
                />
              ))}
            </div>

            <motion.div
              key={current}
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-primary/80 to-primary/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
