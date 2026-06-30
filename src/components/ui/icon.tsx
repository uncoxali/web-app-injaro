"use client";

import { cn } from "@/lib/utils";

type IconSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<IconSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 48,
};

type IconColor = "current" | "primary" | "error" | "success" | "white";

const colorMap: Record<IconColor, string> = {
  current: "text-current",
  primary: "text-primary",
  error: "text-error",
  success: "text-success",
  white: "text-white",
};

export interface IconProps {
  name: string;
  size?: IconSize | number;
  className?: string;
  color?: IconColor;
  active?: boolean;
}

export function Icon({
  name,
  size = "md",
  className,
  color = "current",
  active,
}: IconProps) {
  const px = typeof size === "number" ? size : sizeMap[size];
  const strokeW = active !== undefined ? (active ? 0 : 1.5) : 1.5;
  const fillV = active !== undefined ? (active ? "currentColor" : "none") : "none";

  const svgProps = {
    xmlns: "http://www.w3.org/2000/svg" as const,
    width: px,
    height: px,
    viewBox: "0 0 24 24" as const,
    fill: fillV,
    stroke: "currentColor",
    strokeWidth: strokeW,
    className: cn(colorMap[color], className),
  };

  switch (name) {
    case "chevronRight": {
      return (
        <svg {...svgProps}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    }
    case "chevronLeft": {
      return (
        <svg {...svgProps}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    }
    case "chevronDown": {
      return (
        <svg {...svgProps} width={px} height={px}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    }
    case "arrowRight": {
      return (
        <svg {...svgProps} strokeWidth={2.5}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    }
    case "home": {
      return (
        <svg {...svgProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    }
    case "feed": {
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    }
    case "mapPin": {
      return (
        <svg {...svgProps}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    }
    case "user": {
      return (
        <svg {...svgProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    }
    case "close": {
      return (
        <svg {...svgProps} strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    }
    case "search": {
      return (
        <svg {...svgProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    }
    case "bookmark": {
      return (
        <svg {...svgProps}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    }
    case "share": {
      return (
        <svg {...svgProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    }
    case "calendar": {
      return (
        <svg {...svgProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    }
    case "calendarCheck": {
      return (
        <svg {...svgProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="8 14 11 17 16 12" />
        </svg>
      );
    }
    case "clock": {
      return (
        <svg {...svgProps} width={px} height={px} strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    case "image": {
      return (
        <svg {...svgProps} strokeWidth={1}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    }
    case "qr": {
      return (
        <svg {...svgProps} strokeWidth={0.5} width={px} height={px}>
          <rect x="2" y="2" width="5" height="5" />
          <rect x="17" y="2" width="5" height="5" />
          <rect x="2" y="17" width="5" height="5" />
          <rect x="12" y="12" width="5" height="5" />
          <rect x="8" y="8" width="2" height="2" />
          <rect x="14" y="8" width="2" height="2" />
          <rect x="8" y="14" width="2" height="2" />
          <rect x="19" y="12" width="3" height="2" />
          <rect x="12" y="19" width="2" height="3" />
        </svg>
      );
    }
    case "scan": {
      return (
        <svg {...svgProps}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    }
    case "check": {
      return (
        <svg {...svgProps} strokeWidth={2}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    case "checkFilled": {
      return (
        <svg {...svgProps} fill="currentColor" stroke="none">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      );
    }
    case "bell": {
      return (
        <svg {...svgProps}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    }
    case "error": {
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    case "sun": {
      return (
        <svg {...svgProps} strokeWidth={2}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    }
    case "moon": {
      return (
        <svg {...svgProps} strokeWidth={2}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    case "phone": {
      return (
        <svg {...svgProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    }
    case "mail": {
      return (
        <svg {...svgProps}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    }
    case "instagram": {
      return (
        <svg {...svgProps}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1" />
        </svg>
      );
    }
    case "externalLink": {
      return (
        <svg {...svgProps} strokeWidth={2}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    }
    case "message": {
      return (
        <svg {...svgProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    }
    case "logout": {
      return (
        <svg {...svgProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    }
    case "star": {
      return (
        <svg {...svgProps} fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    case "live": {
      return (
        <svg {...svgProps} strokeWidth={2}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    }
    case "facebook": {
      return (
        <svg {...svgProps}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    }
    case "globe": {
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    }
    case "download": {
      return (
        <svg {...svgProps}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    }
    default:
      return null;
  }
}
