"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMapStore } from "@/store/map";
import { reportNavigationClick } from "@/lib/api/locations";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { cn, imgUrl } from "@/lib/utils";

function LocationLogo({
  name,
  logo,
  size = "md",
}: {
  name: string;
  logo?: string;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-16 w-16 rounded-2xl" : "h-14 w-14 rounded-xl";

  return (
    <div className="relative shrink-0">
      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg scale-110" />
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-white ring-2 ring-white shadow-md",
          dim
        )}
      >
        {logo ? (
          <img
            src={imgUrl(logo)}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-primary">{name.charAt(0)}</span>
        )}
      </div>
    </div>
  );
}

export function LocationBottomSheet() {
  const router = useRouter();
  const selectedLocation = useMapStore((s) => s.selectedLocation);
  const sheetOpen = useMapStore((s) => s.sheetOpen);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) setDragY(delta);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragging.current = false;
    if (dragY > 100) {
      setSheetOpen(false);
    }
    setDragY(0);
  }, [dragY, setSheetOpen]);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
  }, [setSheetOpen]);

  const handleNavigate = useCallback(() => {
    if (!selectedLocation) return;

    const { latitude, longitude, slug } = selectedLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
    if (isAuthenticated()) reportNavigationClick(slug);
  }, [selectedLocation]);

  const handleViewBrand = useCallback(() => {
    if (!selectedLocation) return;
    const brandPath = `/brands/${selectedLocation.slug}`;
    setSheetOpen(false);
    if (!isAuthenticated()) {
      router.push(loginUrl(brandPath));
      return;
    }
    reportNavigationClick(selectedLocation.slug);
    router.push(brandPath);
  }, [selectedLocation, router, setSheetOpen]);

  return (
    <AnimatePresence>
      {sheetOpen && selectedLocation && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: dragY }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className="absolute bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="overflow-hidden rounded-t-[28px] border border-white/70 bg-white/95 shadow-[0_-12px_40px_rgba(17,24,39,0.18)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

              <div
                className="flex cursor-grab touch-none flex-col items-center pt-3 pb-1 active:cursor-grabbing"
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
              >
                <div className="h-1 w-10 rounded-full bg-border/80" />
              </div>

              <div className="px-5 pb-5">
                <div className="mb-4 flex items-start gap-3.5">
                  <LocationLogo
                    name={selectedLocation.name}
                    logo={selectedLocation.logo}
                    size="lg"
                  />

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold leading-snug text-text-primary">
                        {selectedLocation.name}
                      </h2>
                      <button
                        type="button"
                        onClick={handleClose}
                        aria-label="بستن"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary transition-colors hover:bg-border/60"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    {selectedLocation.address && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-text-secondary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mt-0.5 shrink-0 text-primary/70"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="line-clamp-2">
                          {selectedLocation.address}
                        </span>
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {selectedLocation.category !== undefined && (
                        <span className="rounded-full border border-border/70 bg-surface px-2.5 py-0.5 text-[10px] font-medium text-text-secondary">
                          دسته {selectedLocation.category}
                        </span>
                      )}
                      {selectedLocation.events_count !== undefined &&
                        selectedLocation.events_count > 0 && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                            {selectedLocation.events_count} رویداد
                          </span>
                        )}
                      {selectedLocation.is_open && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-medium text-success">
                          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                          فعال
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedLocation.description && (
                  <p className="mb-4 line-clamp-2 rounded-xl bg-surface/80 px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                    {selectedLocation.description}
                  </p>
                )}

                <div className="flex flex-col gap-2.5">
                  <Button fullWidth size="lg" onClick={handleViewBrand}>
                    مشاهده برند
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="mr-1.5 -scale-x-100"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleNavigate}
                      className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-white text-sm font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-primary"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      مسیریابی
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex h-11 items-center justify-center rounded-xl border border-border/70 bg-surface text-sm font-medium text-text-secondary transition-colors hover:bg-border/40"
                    >
                      بستن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
