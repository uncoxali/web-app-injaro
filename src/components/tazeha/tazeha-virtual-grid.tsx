"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { TazehaItem } from "@/lib/api/tazeha";
import { Spinner } from "@/components/ui/spinner";

const ROW_HEIGHT = 196;

interface TazehaVirtualGridProps {
  items: TazehaItem[];
  renderCard: (item: TazehaItem) => ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function TazehaVirtualGrid({
  items,
  renderCard,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: TazehaVirtualGridProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const loadMoreLockRef = useRef(false);

  const tryLoadMore = useCallback(
    (lastVisibleIndex: number) => {
      if (
        !hasNextPage ||
        isFetchingNextPage ||
        !onLoadMore ||
        lastVisibleIndex < items.length - 2
      ) {
        return;
      }
      if (loadMoreLockRef.current) return;
      loadMoreLockRef.current = true;
      onLoadMore();
    },
    [hasNextPage, isFetchingNextPage, items.length, onLoadMore]
  );

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
    scrollMargin,
    onChange: (instance) => {
      const virtualItems = instance.getVirtualItems();
      const last = virtualItems[virtualItems.length - 1];
      if (last) tryLoadMore(last.index);
    },
  });

  useEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop);
    }
  }, [items.length]);

  useEffect(() => {
    if (!isFetchingNextPage) {
      loadMoreLockRef.current = false;
    }
  }, [isFetchingNextPage]);

  if (items.length === 0) return null;

  return (
    <div ref={listRef}>
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute inset-x-0"
              style={{
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              {virtualRow.index > 0 && (
                <div className="mx-5 border-t border-black/8" />
              )}
              {renderCard(item)}
            </div>
          );
        })}
      </div>

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}
