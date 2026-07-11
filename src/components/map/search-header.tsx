"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store/map";
import { MARKER_FOCUS_ZOOM } from "@/lib/map-utils";
import { ExpandableSearchBar } from "@/components/search/expandable-search-bar";
import { UnifiedSearchResults } from "@/components/search/unified-search-results";
import type { SearchEventResult } from "@/components/search/unified-search-results";

interface SearchHeaderProps {
  onSearch?: (query: string) => void;
  events?: SearchEventResult[];
  className?: string;
}

export function SearchHeader({ onSearch, events = [], className }: SearchHeaderProps) {
  const [open, setOpen] = useState(false);
  const mapSearchQuery = useMapStore((s) => s.mapSearchQuery);
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const markers = useMapStore((s) => s.markers);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mapSearchQuery) {
      setOpen(true);
    }
  }, [mapSearchQuery]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setMapSearchQuery(value);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch?.(value);
      }, 300);
    },
    [setMapSearchQuery, onSearch]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        setMapSearchQuery("");
        onSearch?.("");
      }
    },
    [setMapSearchQuery, onSearch]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const query = mapSearchQuery.trim().toLowerCase();

  const filteredEvents = query
    ? events.filter((ev) => ev.title.toLowerCase().includes(query))
    : [];

  const locationResults = useMemo(
    () =>
      markers.map((m) => ({
        slug: m.slug,
        name: m.name,
        logo: m.logo,
      })),
    [markers]
  );

  const handleLocationClick = useCallback(
    (loc: { slug: string }) => {
      const marker = markers.find((m) => m.slug === loc.slug);
      if (!marker) return;
      selectLocation(marker.id);
      setSelectedLocation(marker);
      setFlyToTarget({
        latitude: marker.latitude,
        longitude: marker.longitude,
        zoom: MARKER_FOCUS_ZOOM,
      });
      setSheetOpen(true);
      setOpen(false);
    },
    [markers, selectLocation, setSelectedLocation, setFlyToTarget, setSheetOpen]
  );

  const hasResults = locationResults.length > 0 || filteredEvents.length > 0;

  return (
    <div className={cn("relative", className)}>
      <div className={cn("flex", open ? "w-full" : "justify-end")}>
        <ExpandableSearchBar
          open={open}
          onOpenChange={handleOpenChange}
          query={mapSearchQuery}
          onQueryChange={handleQueryChange}
          className={open ? "flex-1 w-full" : undefined}
        />
      </div>

      {open && query && hasResults && (
        <div className="absolute top-full mt-2 left-0 right-0 z-30 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg p-3 max-h-[55dvh] overflow-y-auto">
          <UnifiedSearchResults
            query={mapSearchQuery}
            events={filteredEvents}
            locations={locationResults}
            onLocationClick={handleLocationClick}
          />
        </div>
      )}

      {open && query && !hasResults && (
        <div className="absolute top-full mt-2 left-0 right-0 z-30 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg p-3">
          <p className="text-sm text-text-secondary text-center py-4">نتیجه‌ای یافت نشد</p>
        </div>
      )}
    </div>
  );
}
