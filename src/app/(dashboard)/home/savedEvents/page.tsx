"use client";

import { useRouter } from "next/navigation";
import { useSavedEvents } from "@/lib/queries/saved-events";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileEventsSection } from "@/components/profile/profile-events-section";

export default function SavedEventsPage() {
  const router = useRouter();
  const {
    data: events = [],
    isLoading: loading,
    isError: error,
    refetch: fetchSaved,
  } = useSavedEvents();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={() => void fetchSaved()} />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#e8e8e8] dark:bg-background">
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-2xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            onClick={() => router.back()}
            className="text-text-secondary transition-colors hover:text-text-primary"
            aria-label="بازگشت"
          >
            <Icon name="chevronLeft" size={22} className="scale-x-[-1]" />
          </button>
          <h1 className="text-base font-bold text-text-primary">رویدادهای ذخیره‌شده</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        <ProfileEventsSection
          activeTab="saved"
          onTabChange={() => {}}
          savedEvents={events}
          goingEvents={[]}
        />
      </div>
    </div>
  );
}
