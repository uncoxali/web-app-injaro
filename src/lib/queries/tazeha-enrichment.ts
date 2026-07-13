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
const ENRICH_CONCURRENCY = 4;

let activeEnrichFetches = 0;
const enrichWaitQueue: Array<() => void> = [];

async function withEnrichConcurrency<T>(fn: () => Promise<T>): Promise<T> {
  while (activeEnrichFetches >= ENRICH_CONCURRENCY) {
    await new Promise<void>((resolve) => {
      enrichWaitQueue.push(resolve);
    });
  }

  activeEnrichFetches += 1;
  try {
    return await fn();
  } finally {
    activeEnrichFetches -= 1;
    enrichWaitQueue.shift()?.();
  }
}

export function collectSlugsToEnrich(
  items: TazehaItem[],
  max = MAX_ENRICH
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const item of items) {
    if (getTazehaDescription(item)) continue;
    const slug = getTazehaSlug(item);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
    if (slugs.length >= max) break;
  }

  return slugs;
}

function dedupeItemsForEnrichment(items: TazehaItem[]): TazehaItem[] {
  const seen = new Set<string>();
  const deduped: TazehaItem[] = [];

  for (const item of items) {
    const slug = getTazehaSlug(item);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    deduped.push(item);
  }

  return deduped;
}

function enrichItemsWithDetails(
  items: TazehaItem[],
  slugsToEnrich: string[],
  detailsBySlug: Map<string, Awaited<ReturnType<typeof getEventDetail>>>
): TazehaItem[] {
  if (slugsToEnrich.length === 0 || detailsBySlug.size === 0) {
    return items;
  }

  return items.map((item) => {
    const slug = getTazehaSlug(item);
    if (!slug) return item;
    const detail = detailsBySlug.get(slug);
    return detail ? mergeTazehaWithEventDetail(item, detail) : item;
  });
}

export function useEnrichedTazehaItems(items: TazehaItem[], enabled: boolean) {
  const slugsToEnrich = useMemo(
    () => (enabled ? collectSlugsToEnrich(items) : []),
    [items, enabled]
  );

  const detailQueries = useQueries({
    queries: slugsToEnrich.map((slug) => ({
      queryKey: ["eventDetail", slug] as const,
      queryFn: () => withEnrichConcurrency(() => getEventDetail(slug)),
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
        .filter(
          (
            entry
          ): entry is [
            string,
            NonNullable<(typeof detailQueries)[number]["data"]>,
          ] => Boolean(entry[1])
        )
    );

    return enrichItemsWithDetails(items, slugsToEnrich, detailsBySlug);
  }, [detailQueries, enabled, items, slugsToEnrich]);

  const isEnriching =
    enabled &&
    slugsToEnrich.length > 0 &&
    detailQueries.some((query) => query.isLoading || query.isFetching);

  return { items: enrichedItems, isEnriching };
}

export function useEnrichedTazehaGroups<G extends Record<string, TazehaItem[]>>(
  groups: G,
  enabled: boolean
): { groups: G; isEnriching: boolean } {
  const mergedItems = useMemo(
    () => dedupeItemsForEnrichment(Object.values(groups).flat()),
    [groups]
  );

  const { items: enrichedItems, isEnriching } = useEnrichedTazehaItems(
    mergedItems,
    enabled && mergedItems.length > 0
  );

  const enrichedBySlug = useMemo(() => {
    const map = new Map<string, TazehaItem>();
    for (const item of enrichedItems) {
      const slug = getTazehaSlug(item);
      if (slug) map.set(slug, item);
    }
    return map;
  }, [enrichedItems]);

  const enrichedGroups = useMemo(() => {
    const out = {} as G;

    for (const key of Object.keys(groups) as (keyof G & string)[]) {
      out[key] = groups[key].map((item) => {
        const slug = getTazehaSlug(item);
        if (!slug) return item;
        return enrichedBySlug.get(slug) ?? item;
      }) as G[keyof G & string];
    }

    return out;
  }, [groups, enrichedBySlug]);

  return { groups: enrichedGroups, isEnriching };
}
