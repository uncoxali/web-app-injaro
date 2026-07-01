"use client";

import Image from "next/image";
import { cn, imgUrl } from "@/lib/utils";

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

function RemoteImage({
  url,
  alt,
  className,
  fill,
  width,
  height,
  priority,
}: {
  url: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      className={cn("object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/** Remote/CDN media — direct <img> (next/image breaks SVG + signed MinIO URLs). */
function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
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

  if (isRemoteUrl(url)) {
    return (
      <RemoteImage
        url={url}
        alt={alt}
        className={className}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
      />
    );
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
