"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  eventPinToLandingEvent,
  eventPinToTazehaItem,
} from "@/lib/api/home-events";
import {
  type LandingEvent,
  type LandingLocation,
  landingLocationToMarker,
} from "@/lib/api/landing";
import {
  useHomeLatestEvents,
  useHomePinnedEvents,
  useHomeTodayEvents,
  useHomeWeekEvents,
} from "@/lib/queries/home-events";
import { useLandingLocations } from "@/lib/queries/landing";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { UnifiedSearchResults, type SearchLocationResult } from "@/components/search/unified-search-results";
import { useMapStore } from "@/store/map";
import { HomeNavbar, HomeNavbarSpacer } from "@/components/home/home-navbar";
import { HomeHero } from "@/components/home/home-hero";
import { HomeEventsSection } from "@/components/home/home-events-section";
import { HomeRegisterEventCta } from "@/components/home/home-register-event-cta";
import { HomeEventTicketForm } from "@/components/home/home-event-ticket-form";
import { HomeCollaborationInfo } from "@/components/home/home-collaboration-info";
import { HomeSponsorsSection } from "@/components/home/home-sponsors-section";
import { useEnrichedTazehaGroups } from "@/lib/queries/tazeha-enrichment";
import type { TazehaItem } from "@/lib/api/tazeha";
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
      <div className="h-36 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="h-40 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);
  const [guest, setGuest] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    data: pinnedEvents = [],
    isLoading: pinnedLoading,
    isError: pinnedError,
    refetch: refetchPinned,
  } = useHomePinnedEvents();
  const {
    data: latestEvents = [],
    isLoading: latestLoading,
    isError: latestError,
    refetch: refetchLatest,
  } = useHomeLatestEvents();
  const {
    data: todayEvents = [],
    isLoading: todayLoading,
    isError: todayError,
    refetch: refetchToday,
  } = useHomeTodayEvents();
  const {
    data: weekEvents = [],
    isLoading: weekLoading,
    isError: weekError,
    refetch: refetchWeek,
  } = useHomeWeekEvents();
  const {
    data: locations = [],
    isLoading: locationsLoading,
    isError: locationsError,
    refetch: refetchLocations,
  } = useLandingLocations(searchOpen);

  const pinHeroEvents = useMemo(
    () => pinnedEvents.map(eventPinToTazehaItem),
    [pinnedEvents]
  );
  const pinCards = useMemo(
    () => pinnedEvents.map(eventPinToLandingEvent),
    [pinnedEvents]
  );
  const latestItems = useMemo<TazehaItem[]>(
    () =>
      latestEvents.map((event) => ({
        event_slug: event.event_slug,
        thumbnail: event.thumbnail,
      })),
    [latestEvents]
  );
  const weekItems = useMemo<TazehaItem[]>(
    () =>
      weekEvents.map((event) => ({
        event_slug: event.event_slug,
        thumbnail: event.thumbnail,
      })),
    [weekEvents]
  );
  const listEnrichGroups = useMemo(
    () => ({
      latest: latestItems,
      week: weekItems,
    }),
    [latestItems, weekItems]
  );
  const shouldEnrichLists =
    !latestLoading &&
    !weekLoading &&
    (latestItems.length > 0 || weekItems.length > 0);
  const { groups: enrichedListGroups } = useEnrichedTazehaGroups(
    listEnrichGroups,
    shouldEnrichLists
  );
  const enrichedLatestItems = enrichedListGroups.latest;
  const latestSectionEvents = useMemo(
    () =>
      enrichedLatestItems.map((event) => ({
        event_slug: event.event_slug ?? "",
        thumbnail: event.thumbnail,
        topic: event.topic || event.event_name || event.event_slug || "",
      })),
    [enrichedLatestItems]
  );
  const todayHeroEvents = useMemo(
    () => todayEvents.map(eventPinToTazehaItem),
    [todayEvents]
  );
  const todayCards = useMemo(
    () => todayEvents.map(eventPinToLandingEvent),
    [todayEvents]
  );
  const enrichedWeekItems = enrichedListGroups.week;
  const weekSectionEvents = useMemo(
    () =>
      enrichedWeekItems.map((event) => ({
        event_slug: event.event_slug ?? "",
        thumbnail: event.thumbnail,
        topic: event.topic || event.event_name || event.event_slug || "",
      })),
    [enrichedWeekItems]
  );

  const events = useMemo(() => {
    const bySlug = new Map<string, LandingEvent>();
    for (const event of [...pinCards, ...latestSectionEvents, ...todayCards, ...weekSectionEvents]) {
      if (event.event_slug) bySlug.set(event.event_slug, event);
    }
    return Array.from(bySlug.values());
  }, [pinCards, latestSectionEvents, todayCards, weekSectionEvents]);

  const loading = pinnedLoading || latestLoading;
  const eventsError = pinnedError && latestError && todayError && weekError;
  const error =
    !loading &&
    events.length === 0 &&
    locations.length === 0 &&
    eventsError &&
    locationsError;

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
    void refetchPinned();
    void refetchLatest();
    void refetchToday();
    void refetchWeek();
    void refetchLocations();
  }, [refetchPinned, refetchLatest, refetchToday, refetchWeek, refetchLocations]);

  useEffect(() => {
    setGuest(!isAuthenticated());
  }, []);

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
        <div className="flex flex-1 flex-col items-center justify-center px-5">
          <EmptyState title="خوش آمدید" description="به زودی رویدادها اضافه می‌شوند" />
        </div>
        <div className="flex flex-col gap-5 px-5 pb-32">
          <HomeRegisterEventCta />
          <HomeSponsorsSection enabled={!loading} />
          <HomeCollaborationInfo />
          <HomeEventTicketForm />
        </div>
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
        initial={false}
        animate="show"
        className="flex flex-col gap-5 px-5 pt-5 pb-32"
      >
        {pinHeroEvents.length > 0 && (
          <motion.div variants={fadeUp}>
            <HomeHero events={pinHeroEvents} showGuestCta={guest} />
          </motion.div>
        )}

        <motion.div variants={fadeUp}>
          <HomeEventsSection events={latestSectionEvents} title="آخرین رویدادها" />
        </motion.div>

        {todayHeroEvents.length > 0 && (
          <motion.div variants={fadeUp}>
            <HomeHero events={todayHeroEvents} showTodayBadge />
          </motion.div>
        )}

        <motion.div variants={fadeUp}>
          <HomeEventsSection
            events={weekSectionEvents}
            title="رویدادهای این هفته"
            variant="plain"
            titleStyle="pill"
            cardWidth="w-[160px]"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <HomeRegisterEventCta />
        </motion.div>

        <motion.div variants={fadeUp}>
          <HomeSponsorsSection enabled={!loading} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <HomeCollaborationInfo />
        </motion.div>

        <motion.div variants={fadeUp}>
          <HomeEventTicketForm />
        </motion.div>
      </motion.div>
    </div>
  );
}
