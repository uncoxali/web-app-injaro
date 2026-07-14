"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { type TazehaItem } from "@/lib/api/tazeha";
import { type LandingLocation } from "@/lib/api/landing";
import { useLandingLocations } from "@/lib/queries/landing";
import { useCategories } from "@/lib/queries/categories";
import { useInfiniteTazeha } from "@/lib/queries/tazeha";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeNavbar, HomeNavbarSpacer, HOME_NAVBAR_HEIGHT, HOME_NAVBAR_HEIGHT_EXPANDED } from "@/components/home/home-navbar";
import { UnifiedSearchResults, type SearchLocationResult } from "@/components/search/unified-search-results";
import { isAuthenticated } from "@/lib/auth-utils";
import { DateSlider, generateDays, type DayOption } from "@/components/tazeha/date-slider";
import { TazehaVirtualGrid } from "@/components/tazeha/tazeha-virtual-grid";
import { TazehaListItem } from "@/components/tazeha/tazeha-list-item";
import { TazehaCategoryFilters } from "@/components/tazeha/tazeha-category-filters";
import { getTazehaImage, getTazehaSlug, getTazehaTitle, filterTazehaByCategory } from "@/components/tazeha/tazeha-format";
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

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="overflow-hidden rounded-3xl bg-[#ececec] dark:bg-surface py-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initialDaysRef = useRef<DayOption[] | null>(null);
  if (!initialDaysRef.current) {
    initialDaysRef.current = generateDays(21);
  }
  const days = initialDaysRef.current;
  const [selectedDate, setSelectedDate] = useState("");
  const { data: locations = [] } = useLandingLocations(searchOpen);
  const { data: categories = [] } = useCategories();

  const filterDate = selectedDate || undefined;
  const listKey = `${selectedDate || "all"}:${selectedCategory ?? "all"}`;
  const {
    data,
    isLoading: loading,
    isFetching,
    isError: error,
    refetch: refetchTazeha,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTazeha(filterDate);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedCategory, filterDate]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || loading) return;
    const loaded =
      data?.pages.reduce((total, page) => total + page.items.length, 0) ?? 0;
    const total = data?.pages[data.pages.length - 1]?.count ?? 0;
    const needsFullList = selectedCategory != null || !filterDate;
    if (needsFullList && total > loaded) {
      void fetchNextPage();
    }
  }, [data, fetchNextPage, filterDate, hasNextPage, isFetchingNextPage, loading, selectedCategory]);

  const hasListData = Boolean(data?.pages?.some((page) => page.items.length > 0));
  const isCategoryLoading =
    selectedCategory != null && (loading || isFetchingNextPage || hasNextPage);
  const isListLoading =
    !searchOpen &&
    !isFetchingNextPage &&
    (loading || (isFetching && !hasListData) || isCategoryLoading);

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

  const filteredItems = useMemo(
    () => filterTazehaByCategory(allItems, selectedCategory, categories),
    [allItems, selectedCategory, categories]
  );

  const { items: listItems, isEnriching } = useEnrichedTazehaItems(
    filteredItems,
    authed && !loading && filteredItems.length > 0
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
      events: filteredItems
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
  }, [searchQuery, filteredItems, locations]);

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
        <div className="flex flex-col gap-3 px-4 py-3">
          {!searchOpen && days.length > 0 && (
            <DateSlider
              days={days}
              selected={selectedDate}
              onSelect={handleDateChange}
              showAllOption
            />
          )}
          {!searchOpen && categories.length > 0 && (
            <TazehaCategoryFilters
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
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
        ) : isListLoading ? (
          <ListSkeleton />
        ) : error ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <ErrorState onRetry={() => refetchTazeha()} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <EmptyState
              title="رویدادی یافت نشد"
              description={
                selectedCategory != null
                  ? "در این دسته‌بندی رویدادی برای نمایش وجود ندارد."
                  : "در حال حاضر رویدادی برای نمایش وجود ندارد."
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-3xl bg-[#ececec] dark:bg-surface py-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
              <TazehaVirtualGrid
                items={listItems}
                listKey={listKey}
                hasNextPage={selectedCategory == null && hasNextPage}
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
