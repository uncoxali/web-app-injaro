"use client";

import type { ProfileEventItem } from "@/lib/api/events";
import { ProfileEventCard } from "@/components/profile/profile-event-card";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/components/ui/icon";
import { cn, toPersianDigits } from "@/lib/utils";

export type ProfileEventsTab = "viewed" | "upcoming" | "saved";

const panelBgClass = "bg-[#ececec] dark:bg-surface/60";
const inactiveTabClass =
  "rounded-[18px] bg-white dark:bg-surface shadow-[0_6px_22px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_22px_rgba(0,0,0,0.3)]";
const activeTabClass = cn(
  "relative z-10 rounded-t-[18px] rounded-b-none shadow-none",
  "border border-primary/40 border-b-0",
  panelBgClass
);

const tabGapClass = "mt-2.5";
const activeTabBridgeClass = "relative z-10 mb-[-0.625rem] pb-[calc(0.625rem+1px)]";

interface ProfileEventsSectionProps {
  activeTab: ProfileEventsTab | null;
  onTabChange: (tab: ProfileEventsTab | null) => void;
  savedEvents: ProfileEventItem[];
  goingEvents: ProfileEventItem[];
  savedLoading?: boolean;
  goingLoading?: boolean;
}

export function ProfileEventsSection({
  activeTab,
  onTabChange,
  savedEvents,
  goingEvents,
  savedLoading,
  goingLoading,
}: ProfileEventsSectionProps) {
  const tabs: {
    id: ProfileEventsTab;
    value: number;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "viewed",
      value: 0,
      label: "رویداد دیده شده",
      icon: <Icon name="viewedEvents" size={20} color="primary" />,
    },
    {
      id: "upcoming",
      value: goingEvents.length,
      label: "رویداد پیش‌رو",
      icon: <Icon name="upcomingEvents" size={20} color="primary" />,
    },
    {
      id: "saved",
      value: savedEvents.length,
      label: "رویداد ذخیره شده",
      icon: <Icon name="savedEvents" size={20} color="primary" />,
    },
  ];

  const loading =
    activeTab === "saved"
      ? savedLoading
      : activeTab === "upcoming"
        ? goingLoading
        : false;

  const items =
    activeTab === "saved"
      ? savedEvents
      : activeTab === "upcoming"
        ? goingEvents
        : [];

  const emptyTitle =
    activeTab === "saved"
      ? "رویدادی ذخیره نکردید"
      : activeTab === "upcoming"
        ? "رویداد پیش‌رویی ندارید"
        : "رویداد دیده‌شده‌ای ندارید";

  const emptyDescription =
    activeTab === "saved"
      ? "رویدادهای مورد علاقه را ذخیره کنید تا اینجا ببینید"
      : activeTab === "upcoming"
        ? "روی «شرکت می‌کنم» بزنید تا اینجا نمایش داده شود"
        : "به‌زودی رویدادهای دیده‌شده اینجا نمایش داده می‌شوند";

  const handleTabClick = (tabId: ProfileEventsTab) => {
    onTabChange(activeTab === tabId ? null : tabId);
  };

  return (
    <section className="flex flex-col">
      <div className="grid grid-cols-3 gap-2.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3.5 transition-all active:scale-[0.98]",
                isActive ? activeTabClass : inactiveTabClass,
                isActive && activeTabBridgeClass
              )}
            >
              <span className="text-[22px] font-bold leading-none text-text-primary">
                {toPersianDigits(tab.value)}
              </span>
              <span className="text-center text-[10px] leading-tight text-text-secondary">
                {tab.label}
              </span>
              <div className="mt-1 text-primary">{tab.icon}</div>
            </button>
          );
        })}
      </div>

      {activeTab !== null && (
      <div
        className={cn(
          "relative z-0 rounded-b-[24px] rounded-t-none border border-t-0 border-primary/40 px-3 pb-4 pt-3",
          tabGapClass,
          panelBgClass
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <Icon
              name={activeTab === "saved" ? "bookmark" : "calendar"}
              size={36}
              className="mb-3 text-text-secondary/25"
            />
            <p className="text-sm font-medium text-text-primary">{emptyTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {items.map((event) => (
              <ProfileEventCard key={event.event_slug} event={event} />
            ))}
          </div>
        )}
      </div>
      )}
    </section>
  );
}
