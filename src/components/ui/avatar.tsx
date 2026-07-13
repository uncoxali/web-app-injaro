import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className,
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium",
        sizes[size],
        className
      )}
    >
      {name ? getInitials(name) : <Icon name="user" size="md" color="primary" />}
    </div>
  );
}
