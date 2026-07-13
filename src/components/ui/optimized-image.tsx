"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
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
      <Icon name="camera" size="md" className="text-gray-300 dark:text-gray-600" />
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
