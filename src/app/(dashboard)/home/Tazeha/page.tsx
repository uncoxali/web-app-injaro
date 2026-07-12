"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { type TazehaItem } from "@/lib/api/tazeha";
import { type LandingLocation } from "@/lib/api/landing";
import type { Category } from "@/lib/api/categories";
import { useLandingLocations } from "@/lib/queries/landing";
import { useCategories } from "@/lib/queries/categories";
import { useInfiniteTazeha } from "@/lib/queries/tazeha";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeNavbar, HomeNavbarSpacer, HOME_NAVBAR_HEIGHT, HOME_NAVBAR_HEIGHT_EXPANDED } from "@/components/home/home-navbar";
import { UnifiedSearchResults, type SearchLocationResult } from "@/components/search/unified-search-results";
import { isAuthenticated } from "@/lib/auth-utils";
import { DateSlider, generateDays, persianToGregorian, type DayOption } from "@/components/tazeha/date-slider";
import { TazehaVirtualGrid } from "@/components/tazeha/tazeha-virtual-grid";
import { TazehaListItem } from "@/components/tazeha/tazeha-list-item";
import { TazehaCategoryFilters } from "@/components/tazeha/tazeha-category-filters";
import { getTazehaCategoryId, getTazehaImage, getTazehaSlug, getTazehaTitle } from "@/components/tazeha/tazeha-format";
import { useEnrichedTazehaItems } from "@/lib/queries/tazeha-enrichment";
import { useMapStore } from "@/store/map";

function getSlug(item: TazehaItem): string {
  return getTazehaSlug(item);
}

function getTitle(item: TazehaItem): string {
  return getTazehaTitle(item);
}

function getImage(item: TazehaItem): string {
  return getTazehaImage(item);
}

function dedupeItems(items: TazehaItem[]): TazehaItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const slug = getSlug(item);
    if (!slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

const META_SECTION_KEYS = new Set([
  "live_events",
  "future_events",
  "popular_events",
  "all_events",
]);

function getFilterCategories(
  categories: Category[],
  items: TazehaItem[]
): Category[] {
  const sectionNames = new Set<string>();
  const categoryIds = new Set<number>();

  for (const item of items) {
    if (item.category_section && !META_SECTION_KEYS.has(item.category_section)) {
      sectionNames.add(item.category_section);
    }
    const id = getTazehaCategoryId(item);
    if (id != null) categoryIds.add(id);
  }

  return categories.filter(
    (c) => sectionNames.has(c.name) || categoryIds.has(c.id)
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="overflow-hidden rounded-3xl bg-[#ececec] py-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            {i > 0 && <div className="mx-5 border-t border-black/8" />}
            <div className="grid min-h-[11.75rem] grid-cols-[auto_minmax(0,1fr)] gap-4 px-5 py-5">
              <div className="aspect-4/5 w-[8.5rem] shrink-0 animate-pulse rounded-xl bg-gray-300/60" />
              <div className="flex flex-col gap-2 py-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300/60" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-300/40" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-300/40" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-gray-300/40" />
                <div className="mt-auto h-3 w-1/2 animate-pulse rounded bg-gray-300/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TazehaPage() {
  const router = useRouter();
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const authed = isAuthenticated();
  const { data: locations = [] } = useLandingLocations();
  const { data: categories = [] } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [days, setDays] = useState<DayOption[]>([]);

  const gregDate = selectedDate ? persianToGregorian(selectedDate) : undefined;
  const {
    data,
    isLoading: loading,
    isError: error,
    refetch: refetchTazeha,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTazeha(gregDate);

  useEffect(() => {
    const d = generateDays(21);
    setDays(d);
    setSelectedDate(d[0]?.date || "");
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleLocationSelect = useCallback(
    (loc: SearchLocationResult) => {
      setMapSearchQuery(loc.name);
      router.push("/home/Injaro");
    },
    [router, setMapSearchQuery]
  );

  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    return dedupeItems(data.pages.flatMap((page) => page.items));
  }, [data]);

  const filterCategories = useMemo(
    () => getFilterCategories(categories, allItems),
    [categories, allItems]
  );

  const displayItems = useMemo(() => {
    if (selectedCategory === null) return allItems;

    const selected = categories.find((c) => c.id === selectedCategory);
    if (!selected) return allItems;

    return allItems.filter((item) => {
      if (getTazehaCategoryId(item) === selectedCategory) return true;
      return item.category_section === selected.name;
    });
  }, [allItems, selectedCategory, categories]);

  const { items: listItems, isEnriching } = useEnrichedTazehaItems(
    displayItems,
    authed
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { events: [] as { slug: string; title: string; thumbnail?: string }[], locations: [] as LandingLocation[] };
    }
    const q = searchQuery.trim().toLowerCase();
    return {
      events: allItems
        .filter((item) => getTitle(item).toLowerCase().includes(q))
        .map((item) => ({
          slug: getSlug(item),
          title: getTitle(item),
          thumbnail: getImage(item),
        })),
      locations: locations
        .filter((loc) => loc.name.toLowerCase().includes(q))
        .map((loc) => ({ slug: loc.slug, name: loc.name, logo: loc.logo })),
    };
  }, [searchQuery, allItems, locations]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <HomeNavbar
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchClose={handleSearchClose}
        onSearchOpen={handleSearchOpen}
        searchInputRef={searchInputRef}
      />
      <HomeNavbarSpacer searchOpen={searchOpen} />

      <div
        className="sticky z-10 border-b border-border/10 bg-background/95"
        style={{
          top: `calc(${searchOpen ? HOME_NAVBAR_HEIGHT_EXPANDED : HOME_NAVBAR_HEIGHT} + env(safe-area-inset-top))`,
        }}
      >
        <div className="px-4 py-3">
          {!searchOpen && !loading && days.length > 0 && (
            <DateSlider
              days={days}
              selected={selectedDate}
              onSelect={handleDateChange}
            />
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-3 pb-28">
        {searchOpen && searchQuery.trim() ? (
          <UnifiedSearchResults
            query={searchQuery}
            events={searchResults.events}
            locations={searchResults.locations}
            onLocationClick={handleLocationSelect}
          />
        ) : loading ? (
          <ListSkeleton />
        ) : error ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <ErrorState onRetry={() => refetchTazeha()} />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <EmptyState
              title="رویدادی یافت نشد"
              description="در حال حاضر رویدادی برای نمایش وجود ندارد."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filterCategories.length > 0 && (
              <TazehaCategoryFilters
                categories={filterCategories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
            <div className="overflow-hidden rounded-3xl bg-[#ececec] py-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <TazehaVirtualGrid
                items={listItems}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={handleLoadMore}
                renderCard={(item) => (
                  <TazehaListItem
                    key={item.event_slug || item.id || getSlug(item)}
                    item={item}
                    descriptionPending={isEnriching && authed}
                  />
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
