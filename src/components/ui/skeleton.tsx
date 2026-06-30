import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-linear-to-r from-border/40 via-border/60 to-border/40 bg-size-[200%_100%] animate-shimmer",
        className
      )}
    />
  );
}
