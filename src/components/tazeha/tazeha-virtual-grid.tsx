"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { TazehaItem } from "@/lib/api/tazeha";

const ROW_HEIGHT = 272;

interface TazehaVirtualGridProps {
  items: TazehaItem[];
  renderCard: (item: TazehaItem) => ReactNode;
}

export function TazehaVirtualGrid({ items, renderCard }: TazehaVirtualGridProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const rowCount = Math.ceil(items.length / 2);

  useEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop);
    }
  }, [items.length]);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
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
          const rowIndex = virtualRow.index;
          const left = items[rowIndex * 2];
          const right = items[rowIndex * 2 + 1];

          return (
            <div
              key={virtualRow.key}
              className="absolute inset-x-0 grid grid-cols-2 gap-3"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              {left ? renderCard(left) : <div />}
              {right ? renderCard(right) : <div />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
