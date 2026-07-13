import { PageLoadingShell } from "@/components/ui/page-loading-shell";
import { ProfileMapBackground } from "@/components/profile/profile-map-background";
import { cn } from "@/lib/utils";

const profileCardClass =
  "overflow-hidden rounded-[20px] bg-white dark:bg-surface shadow-[0_8px_28px_rgba(0,0,0,0.09),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]";
const profileStatClass =
  "flex flex-col items-center gap-1 rounded-[18px] bg-white dark:bg-surface px-2 py-3.5 shadow-[0_6px_22px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_22px_rgba(0,0,0,0.3)]";

export default function ProfileLoading() {
  return (
    <PageLoadingShell className="bg-[#e8e8e8] dark:bg-background">
      <ProfileMapBackground />
      <div className="relative z-10 flex flex-col flex-1 gap-4 px-4 pt-4 pb-6">
        <div className="flex justify-end gap-2">
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#f0f0f0] dark:bg-surface" />
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#f0f0f0] dark:bg-surface" />
        </div>
        <div className="h-[104px] animate-pulse rounded-[20px] border border-primary bg-white dark:bg-surface" />
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("h-[108px] animate-pulse", profileStatClass)} />
          ))}
        </div>
        <div className={profileCardClass}>
          <div className="h-14 animate-pulse border-b border-border/50" />
          <div className="px-4 py-4">
            <div className="mb-3 h-4 w-28 animate-pulse rounded bg-border/40 ms-auto" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-[72px] animate-pulse rounded-full bg-primary/30"
                />
              ))}
            </div>
          </div>
          <div className="h-14 animate-pulse border-t border-border/50" />
        </div>
      </div>
    </PageLoadingShell>
  );
}
