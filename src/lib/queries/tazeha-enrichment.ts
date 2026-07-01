import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getEventDetail } from "@/lib/api/events";
import type { TazehaItem } from "@/lib/api/tazeha";
import {
  getTazehaDescription,
  getTazehaSlug,
  mergeTazehaWithEventDetail,
} from "@/components/tazeha/tazeha-format";

const MAX_ENRICH = 24;

export function useEnrichedTazehaItems(items: TazehaItem[], enabled: boolean) {
  const slugsToEnrich = useMemo(() => {
    if (!enabled) return [];

    const seen = new Set<string>();
    const slugs: string[] = [];

    for (const item of items) {
      if (getTazehaDescription(item)) continue;
      const slug = getTazehaSlug(item);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
      if (slugs.length >= MAX_ENRICH) break;
    }

    return slugs;
  }, [items, enabled]);

  const detailQueries = useQueries({
    queries: slugsToEnrich.map((slug) => ({
      queryKey: ["eventDetail", slug] as const,
      queryFn: () => getEventDetail(slug),
      staleTime: 10 * 60 * 1000,
      enabled,
    })),
  });

  const enrichedItems = useMemo(() => {
    if (!enabled || slugsToEnrich.length === 0) {
      return items;
    }

    const detailsBySlug = new Map(
      slugsToEnrich
        .map((slug, index) => [slug, detailQueries[index]?.data] as const)
        .filter((entry): entry is [string, NonNullable<(typeof detailQueries)[number]["data"]>] =>
          Boolean(entry[1])
        )
    );

    if (detailsBySlug.size === 0) {
      return items;
    }

    return items.map((item) => {
      const slug = getTazehaSlug(item);
      if (!slug) return item;
      const detail = detailsBySlug.get(slug);
      return detail ? mergeTazehaWithEventDetail(item, detail) : item;
    });
  }, [detailQueries, enabled, items, slugsToEnrich]);

  const isEnriching =
    enabled &&
    slugsToEnrich.length > 0 &&
    detailQueries.some((query) => query.isLoading || query.isFetching);

  return { items: enrichedItems, isEnriching };
}
