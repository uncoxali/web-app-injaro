"use client";

import { cn } from "@/lib/utils";
import { iconsRegistry, type IconName } from "./icons-registry";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 17,
  md: 22,
  lg: 26,
  xl: 56,
};

type IconColor = "current" | "primary" | "error" | "success" | "white";

const colorMap: Record<IconColor, string> = {
  current: "text-current",
  primary: "text-primary",
  error: "text-error",
  success: "text-success",
  white: "text-white",
};

/** Semantic icon names mapped to desktop SVG assets */
const semanticMap = {
  home: { outline: "home-outline", filled: "home-filled-gray" },
  feed: { outline: "new-badge", filled: "new-badge" },
  mapPin: { outline: "location-pin-outline", filled: "location-pin-filled" },
  user: { outline: "user-profile-outline", filled: "user-profile-filled" },
  bell: { outline: "notification", filled: "notification" },
  bookmark: { outline: "bookmark-outline", filled: "bookmark-filled" },
  qr: { outline: "qr-code", filled: "qr-code" },
  search: { outline: "search", filled: "search" },
  calendar: { outline: "calendar", filled: "calendar" },
  plus: { outline: "plus", filled: "plus" },
  minus: { outline: "minus", filled: "minus" },
  share: { outline: "share", filled: "share" },
  shareUpload: { outline: "share-upload", filled: "share-upload" },
  phone: { outline: "phone", filled: "phone" },
  mail: { outline: "email-at", filled: "email-at" },
  envelope: { outline: "envelope", filled: "envelope" },
  chevronLeft: { outline: "arrow-back", filled: "arrow-back" },
  chevronRight: { outline: "navigation-turn", filled: "navigation-turn" },
  support: { outline: "customer-support", filled: "customer-support" },
  eye: { outline: "eye", filled: "eye" },
  eyeOff: { outline: "eye-off", filled: "eye-off" },
  link: { outline: "link", filled: "link" },
  heart: { outline: "heart-outline", filled: "heart-filled" },
  filter: { outline: "filter", filled: "filter" },
  camera: { outline: "camera", filled: "camera" },
  car: { outline: "car", filled: "car" },
  invitation: { outline: "invitation", filled: "invitation" },
  gender: { outline: "gender", filled: "gender" },
  navigation: { outline: "navigation-turn", filled: "navigation-turn" },
  mapLocation: { outline: "map-location-white", filled: "map-location-red" },
  parking: { outline: "parking", filled: "parking" },
  metro: { outline: "metro", filled: "metro" },
  bus: { outline: "bus-station", filled: "bus-station" },
  shoppingBag: { outline: "shopping-bag", filled: "shopping-bag" },
  design: { outline: "design-gray", filled: "design-red" },
  viewedEvents: { outline: "eye", filled: "eye" },
  upcomingEvents: { outline: "calendar", filled: "calendar" },
  savedEvents: { outline: "bookmark-outline", filled: "bookmark-filled" },
  userData: { outline: "user-profile-outline", filled: "user-profile-filled" },
} as const satisfies Record<
  string,
  { outline: IconName; filled: IconName }
>;

const fallbackIcons: Record<string, string> = {
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

export type SemanticIconName = keyof typeof semanticMap | "close";

export interface IconProps {
  /** Semantic name or raw registry key (e.g. "cafe") */
  name: SemanticIconName | IconName;
  size?: IconSize | number;
  className?: string;
  color?: IconColor;
  /** When set, switches between outline/filled variants */
  active?: boolean;
  /** Force a specific variant */
  variant?: "outline" | "filled";
}

function resolveIconKey(
  name: SemanticIconName | IconName,
  active?: boolean,
  variant?: "outline" | "filled"
): IconName {
  if (name === "close") return "close" as IconName;
  if (name in semanticMap) {
    const entry = semanticMap[name as keyof typeof semanticMap];
    if (variant) return entry[variant];
    if (active !== undefined) return active ? entry.filled : entry.outline;
    return entry.outline;
  }
  return name as IconName;
}

function sanitizeSvgColors(svg: string): string {
  return svg
    .replace(/fill="#[0-9a-fA-F]{3,8}"/gi, 'fill="currentColor"')
    .replace(/stroke="#[0-9a-fA-F]{3,8}"/gi, 'stroke="currentColor"')
    .replace(/fill="white"/gi, 'fill="currentColor"')
    .replace(/stroke="white"/gi, 'stroke="currentColor"');
}

export function Icon({
  name,
  size = "md",
  className,
  color = "current",
  active,
  variant,
}: IconProps) {
  const px = typeof size === "number" ? size : sizeMap[size];
  const rawSvg =
    name === "close"
      ? fallbackIcons.close
      : iconsRegistry[resolveIconKey(name, active, variant)];

  if (!rawSvg) return null;

  const svg = sanitizeSvgColors(rawSvg);

  return (
    <span
      role="img"
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden [&_svg]:block [&_svg]:size-full",
        colorMap[color],
        className
      )}
      style={{ width: px, height: px }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export { semanticMap, type IconName };
