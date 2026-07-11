import { cn } from "@/lib/utils";

function MapPattern() {
  const bg = "#e8e8e8";
  const stroke = "#c8c8c8";
  const strokeSoft = "#d6d6d6";

  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-70"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="profile-map-pattern"
          width="400"
          height="400"
          patternUnits="userSpaceOnUse"
        >
          <rect width="400" height="400" fill={bg} />
          <path
            d="M0 80 Q100 60 200 80 T400 80"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M0 160 Q120 140 240 160 T400 160"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M0 240 Q80 260 160 240 T320 240 T400 240"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M0 320 Q150 300 300 320 T400 320"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M60 0 Q80 100 60 200 T60 400"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M160 0 Q140 120 160 240 T160 400"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M260 0 Q280 100 260 200 T260 400"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M340 0 Q320 150 340 300 T340 400"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <circle
            cx="120"
            cy="120"
            r="18"
            fill="none"
            stroke={strokeSoft}
            strokeWidth="1"
          />
          <circle
            cx="280"
            cy="200"
            r="24"
            fill="none"
            stroke={strokeSoft}
            strokeWidth="1"
          />
          <circle
            cx="200"
            cy="300"
            r="14"
            fill="none"
            stroke={strokeSoft}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#profile-map-pattern)" />
    </svg>
  );
}

export function ProfileMapBackground() {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[#e8e8e8]"
      )}
    >
      <MapPattern />
    </div>
  );
}
