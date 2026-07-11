import { PageLoadingShell } from "@/components/ui/page-loading-shell";
import { ProfileMapBackground } from "@/components/profile/profile-map-background";

const PROFILE_PRIMARY = "#ff5a5f";
const PROFILE_CARD_SHADOW =
  "0 8px 28px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)";
const PROFILE_STAT_SHADOW =
  "0 6px 22px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)";

export default function ProfileLoading() {
  return (
    <PageLoadingShell className="bg-[#e8e8e8]">
      <ProfileMapBackground />
      <div className="relative z-10 flex flex-col flex-1 gap-4 px-4 pt-4 pb-6">
        <div className="flex justify-end">
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#f0f0f0]" />
        </div>
        <div
          className="h-[104px] animate-pulse rounded-[20px] border bg-white"
          style={{ borderColor: PROFILE_PRIMARY }}
        />
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[108px] animate-pulse rounded-[18px] bg-white"
              style={{ boxShadow: PROFILE_STAT_SHADOW }}
            />
          ))}
        </div>
        <div
          className="rounded-[20px] bg-white"
          style={{ boxShadow: PROFILE_CARD_SHADOW }}
        >
          <div className="h-14 animate-pulse border-b border-[#ececec]" />
          <div className="px-4 py-4">
            <div className="mb-3 h-4 w-28 animate-pulse rounded bg-[#ececec] ms-auto" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-[72px] animate-pulse rounded-full"
                  style={{ backgroundColor: `${PROFILE_PRIMARY}55` }}
                />
              ))}
            </div>
          </div>
          <div className="h-14 animate-pulse border-t border-[#ececec]" />
        </div>
      </div>
    </PageLoadingShell>
  );
}
