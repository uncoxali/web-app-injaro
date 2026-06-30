"use client";

import Image from "next/image";
import { imgUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-gray-300 dark:text-gray-600"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
}: OptimizedImageProps) {
  const url = imgUrl(src);

  if (!url) {
    return <ImagePlaceholder className={className} />;
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        sizes={sizes ?? "100vw"}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      className={cn("object-cover", className)}
      priority={priority}
      sizes={sizes}
    />
  );
}
