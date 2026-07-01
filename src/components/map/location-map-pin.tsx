import { cn, imgUrl } from "@/lib/utils";

const PIN_COLOR = "#ff5a5f";
const PIN_STROKE = "#d1d5db";
const STROKE_WIDTH = 2.5;

const SIZES = {
  sm: { width: 42, height: 52, logoR: 10, logoSize: 20, logoOffset: 11 },
  md: { width: 52, height: 64, logoR: 9, logoSize: 18, logoOffset: 12 },
  lg: { width: 72, height: 88, logoR: 11, logoSize: 22, logoOffset: 10 },
} as const;

export type LocationMapPinSize = keyof typeof SIZES;

interface LocationMapPinProps {
  id: string;
  logo?: string;
  size?: LocationMapPinSize;
  selected?: boolean;
  className?: string;
}

export function LocationMapPin({
  id,
  logo,
  size = "md",
  selected = false,
  className,
}: LocationMapPinProps) {
  const { width, height, logoR, logoSize, logoOffset } = SIZES[size];
  const clipId = `pin-clip-${id}`;
  const logoSrc = imgUrl(logo);
  const logoY = 15 - logoSize / 2;
  const pinFill = selected ? PIN_COLOR : "#ffffff";
  const pinStroke = selected ? PIN_COLOR : PIN_STROKE;
  const circleFill = selected ? "#ffffff" : "#f3f4f6";

  return (
    <div
      className={cn(
        "relative flex items-end justify-center drop-shadow-md transition-[transform,filter] duration-200",
        selected && "scale-110 origin-bottom drop-shadow-lg z-10",
        className
      )}
    >
      <svg width={width} height={height} viewBox="0 0 42 50" fill="none" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <circle cx="21" cy="15" r={logoR} />
          </clipPath>
        </defs>
        <path
          d="M21 1C12.72 1 6 7.72 6 16c0 10.5 15 33 15 33s15-22.5 15-33c0-8.28-6.72-15-15-15z"
          fill={pinFill}
          stroke={pinStroke}
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx="21"
          cy="15"
          r={logoR}
          fill={circleFill}
          stroke={pinStroke}
          strokeWidth={STROKE_WIDTH}
        />
        {logoSrc ? (
          <image
            href={logoSrc}
            x={logoOffset}
            y={logoY}
            width={logoSize}
            height={logoSize}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <circle
            cx="21"
            cy="15"
            r={5}
            fill={selected ? "#ffffff" : PIN_COLOR}
          />
        )}
      </svg>
    </div>
  );
}
