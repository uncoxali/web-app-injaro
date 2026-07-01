"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { TazehaItem } from "@/lib/api/tazeha";

const ROW_HEIGHT = 196;

interface TazehaVirtualGridProps {
  items: TazehaItem[];
  renderCard: (item: TazehaItem) => ReactNode;
}

export function TazehaVirtualGrid({ items, renderCard }: TazehaVirtualGridProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop);
    }
  }, [items.length]);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    scrollMargin,
  });

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
    </div>
  );
}
