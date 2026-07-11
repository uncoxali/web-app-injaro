"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  type LandingEvent,
  type LandingLocation,
  landingLocationToMarker,
} from "@/lib/api/landing";
import { useLandingEvents, useLandingLocations } from "@/lib/queries/landing";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { UnifiedSearchResults, type SearchLocationResult } from "@/components/search/unified-search-results";
import { useMapStore } from "@/store/map";
import { HomeNavbar, HomeNavbarSpacer } from "@/components/home/home-navbar";
import { HomeHero } from "@/components/home/home-hero";
import { HomeEventsSection } from "@/components/home/home-events-section";
import { isAuthenticated } from "@/lib/auth-utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function Skeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-28">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[160px] aspect-3/4 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        ))}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="h-4 w-56 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-11 w-44 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-3 w-48 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
      <div className="h-5 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[140px] aspect-2/3 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-12 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[160px] aspect-3/4 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useLandingEvents();
  const {
    data: locations = [],
    isLoading: locationsLoading,
    isError: locationsError,
    refetch: refetchLocations,
  } = useLandingLocations();
  const loading = eventsLoading || locationsLoading;
  const error =
    !loading &&
    events.length === 0 &&
    locations.length === 0 &&
    eventsError &&
    locationsError;
  const [guest, setGuest] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        events: [] as { slug: string; title: string; thumbnail?: string }[],
        locations: [] as LandingLocation[],
      };
    }
    const q = searchQuery.trim().toLowerCase();
    return {
      events: events
        .filter((ev) => ev.topic.toLowerCase().includes(q))
        .map((ev) => ({ slug: ev.event_slug, title: ev.topic, thumbnail: ev.thumbnail })),
      locations: locations
        .filter((loc) => loc.name.toLowerCase().includes(q))
        .map((loc) => ({ slug: loc.slug, name: loc.name, logo: loc.logo })),
    };
  }, [searchQuery, events, locations]);

  const focusMapOnLocation = useCallback(
    (loc: LandingLocation) => {
      const marker = landingLocationToMarker(loc, 1);
      setSelectedLocation(marker);
      setFlyToTarget({
        latitude: loc.latitude,
        longitude: loc.longitude,
        zoom: 15,
      });
      setSheetOpen(true);
      router.push("/home/Injaro");
    },
    [router, setFlyToTarget, setSelectedLocation, setSheetOpen]
  );

  const handleLocationSelect = useCallback(
    (loc: SearchLocationResult) => {
      const full = locations.find((l) => l.slug === loc.slug);
      if (!full) return;
      setMapSearchQuery(full.name);
      focusMapOnLocation(full);
    },
    [focusMapOnLocation, locations, setMapSearchQuery]
  );

  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const fetchData = useCallback(() => {
    void refetchEvents();
    void refetchLocations();
  }, [refetchEvents, refetchLocations]);

  useEffect(() => {
    setGuest(!isAuthenticated());
  }, []);

  const rest = events.slice(1);

  const hasContent = events.length > 0 || locations.length > 0;

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-5">
        <ErrorState onRetry={fetchData} />
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="flex-1 flex items-center justify-center px-5">
        <EmptyState title="خوش آمدید" description="به زودی رویدادها اضافه می‌شوند" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <HomeNavbar
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchClose={handleSearchClose}
        onSearchOpen={handleSearchOpen}
        searchInputRef={searchInputRef}
      />
      <HomeNavbarSpacer searchOpen={searchOpen} />
      {searchOpen && searchQuery.trim() && (
        <div className="px-5 pb-4 mt-3">
          <UnifiedSearchResults
            query={searchQuery}
            events={searchResults.events}
            locations={searchResults.locations}
            onLocationClick={handleLocationSelect}
          />
        </div>
      )}

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5 px-5 pt-5 pb-28"
      >
        {events.length > 0 && (
          <motion.div variants={fadeUp}>
            <HomeHero events={events} showGuestCta={guest} />
          </motion.div>
        )}

        <motion.div variants={fadeUp}>
          <HomeEventsSection events={rest} />
        </motion.div>

        {events.length > 0 && (
          <motion.div variants={fadeUp}>
            <HomeHero events={events} showTodayBadge />
          </motion.div>
        )}

        {events.length > 0 && (
          <motion.div variants={fadeUp}>
            <HomeEventsSection events={events} title="رویدادهای این هفته" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
