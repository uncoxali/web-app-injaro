"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import {
  updateProfile,
  updateAvatar,
  getNotifications,
  markNotificationsSeen,
  type UserProfile,
  type Notification,
} from "@/lib/api/profile";
import { useProfile, profileKeys } from "@/lib/queries/profile";
import { useCategories } from "@/lib/queries/categories";
import { useSavedEvents } from "@/lib/queries/saved-events";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { cn, toPersianDigits, imgUrl } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ProfileMapBackground } from "@/components/profile/profile-map-background";
import type { Category } from "@/lib/api/categories";

const PROFILE_PRIMARY = "#ff5a5f";
const PROFILE_TEXT = "#1f2937";
const PROFILE_TEXT_MUTED = "#6b7280";
const PROFILE_CARD_SHADOW =
  "0 8px 28px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)";
const PROFILE_STAT_SHADOW =
  "0 6px 22px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  const {
    data: profile = null,
    isLoading: loading,
    isError: error,
    refetch: fetchProfile,
  } = useProfile();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: savedEvents = [] } = useSavedEvents();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showNotifSheet, setShowNotifSheet] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<Set<number>>(new Set());
  const [savingInterests, setSavingInterests] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const updateProfileCache = useCallback(
    (updater: (prev: UserProfile | undefined) => UserProfile | undefined) => {
      queryClient.setQueryData<UserProfile>(profileKeys.me, (prev) =>
        updater(prev)
      );
    },
    [queryClient]
  );

  const handleOpenNotif = useCallback(async () => {
    setShowNotifSheet(true);
    setNotifLoading(true);
    try {
      const list = await getNotifications();
      setNotifications(list);
      await markNotificationsSeen();
      updateProfileCache((prev) =>
        prev ? { ...prev, unread_notifications: 0 } : prev
      );
    } catch {
    } finally {
      setNotifLoading(false);
    }
  }, [updateProfileCache]);

  const handleOpenInterests = useCallback(() => {
    setSelectedInterests(new Set(profile?.interests || []));
    setShowInterestsModal(true);
  }, [profile]);

  const handleSaveInterests = useCallback(async () => {
    setSavingInterests(true);
    try {
      await updateProfile({ interests: Array.from(selectedInterests) });
      updateProfileCache((prev) =>
        prev ? { ...prev, interests: Array.from(selectedInterests) } : prev
      );
      toast.success("علاقه‌مندی‌ها ذخیره شد");
      setShowInterestsModal(false);
    } catch {
      toast.error("خطا در ذخیره");
    } finally {
      setSavingInterests(false);
    }
  }, [selectedInterests, updateProfileCache]);

  const handleLogout = useCallback(() => {
    setLogoutLoading(true);
    setTimeout(() => {
      logout();
      router.replace("/home");
    }, 300);
  }, [logout, router]);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await updateAvatar(file);
      updateProfileCache((prev) =>
        prev ? { ...prev, avatar_url: result.avatar_url } : prev
      );
      toast.success("عکس پروفایل بروزرسانی شد");
    } catch {
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [updateProfileCache]);

  if (loading) {
    return (
      <div className="relative flex min-h-dvh flex-col bg-[#e8e8e8]">
        <ProfileMapBackground />
        <div className="relative z-10 flex flex-col gap-4 px-4 pt-4 pb-6">
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
            className="rounded-[20px] bg-white p-1"
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={fetchProfile} />
      </div>
    );
  }

  const unreadCount = profile?.unread_notifications || 0;
  const userInterests = categories.filter((cat) =>
    profile?.interests?.includes(cat.id)
  );

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#e8e8e8] text-[#1f2937]">
      <ProfileMapBackground />

      <div className="relative z-10 flex flex-col gap-4 px-4 pt-4 pb-6">
        <div className="flex items-center justify-end">
          <button
            onClick={handleOpenNotif}
            aria-label="اعلان‌ها"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f0f0] transition-transform active:scale-95"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -inset-e-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-[#e8e8e8]"
                style={{ backgroundColor: PROFILE_PRIMARY }}
              >
                {unreadCount > 9 ? "9+" : toPersianDigits(unreadCount)}
              </span>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 rounded-[20px] border bg-white p-3"
          style={{ borderColor: PROFILE_PRIMARY, boxShadow: PROFILE_CARD_SHADOW }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full shadow-[0_4px_14px_rgba(255,90,95,0.35)]"
                style={{ backgroundColor: PROFILE_PRIMARY }}
              >
                {profile?.avatar_url ? (
                  <OptimizedImage
                    src={profile.avatar_url}
                    alt=""
                    width={68}
                    height={68}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ProfileAvatarPlaceholder />
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  </div>
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-0.5 -inset-e-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#4b5563] text-white ring-2 ring-white"
              >
                <PlusIcon size={11} />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-right">
              <h1
                className="truncate text-[15px] font-bold leading-snug"
                style={{ color: PROFILE_TEXT }}
              >
                {profile?.full_name || "کاربر"}
              </h1>
              {profile?.job ? (
                <p
                  className="mt-0.5 truncate text-xs"
                  style={{ color: PROFILE_TEXT_MUTED }}
                >
                  {profile.job}
                </p>
              ) : null}
            </div>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex h-[76px] w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-[#d1d5db] bg-white"
          >
            <QrIcon />
            <span
              className="text-[10px] font-medium leading-tight"
              style={{ color: PROFILE_TEXT_MUTED }}
            >
              کیوآرکد من
            </span>
          </button>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            value={0}
            label="رویداد دیده شده"
            icon={<ViewedEventsIcon />}
          />
          <StatCard
            value={0}
            label="رویداد پیش‌رو"
            icon={<UpcomingEventsIcon />}
          />
          <StatCard
            value={savedEvents.length}
            label="رویداد ذخیره شده"
            icon={<SavedEventsIcon />}
            onClick={() => router.push("/home/savedEvents")}
          />
        </div>

        <div
          className="overflow-hidden rounded-[20px] bg-white"
          style={{ boxShadow: PROFILE_CARD_SHADOW }}
        >
          <MenuRow
            label="داده‌های کاربری"
            icon={<UserDataIcon />}
            onClick={() => router.push("/profile")}
          />

          <div className="border-t border-[#ececec] px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handleOpenInterests}
                aria-label="افزودن علاقه‌مندی"
                className="flex h-7 w-7 items-center justify-center"
                style={{ color: PROFILE_PRIMARY }}
              >
                <PlusIcon size={18} />
              </button>

              <button
                type="button"
                onClick={handleOpenInterests}
                className="flex items-center gap-1.5"
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: PROFILE_TEXT }}
                >
                  علاقه‌مندی‌ها
                </span>
                <span
                  className="flex h-6 w-6 items-center justify-center"
                  style={{ color: PROFILE_PRIMARY }}
                >
                  <PlusIcon size={18} />
                </span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categoriesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-[72px] animate-pulse rounded-full"
                    style={{ backgroundColor: `${PROFILE_PRIMARY}44` }}
                  />
                ))
              ) : userInterests.length > 0 ? (
                userInterests.map((cat) => (
                  <InterestTag key={cat.id} category={cat} />
                ))
              ) : (
                <button
                  onClick={handleOpenInterests}
                  className="w-full rounded-xl border border-dashed py-3 text-center text-xs transition-colors"
                  style={{
                    borderColor: `${PROFILE_PRIMARY}55`,
                    color: PROFILE_TEXT_MUTED,
                  }}
                >
                  علاقه‌مندی خود را اضافه کنید
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-[#ececec]">
            <MenuRow
              label="پشتیبانی و ارتباط با ما"
              icon={<SupportIcon />}
              onClick={() => router.push("/home/profile/support")}
            />
          </div>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="mx-auto mt-1 text-xs text-[#9ca3af] transition-colors hover:text-[#ef4444]"
        >
          خروج از حساب
        </button>
      </div>

      <Modal open={showQrModal} onClose={() => setShowQrModal(false)} title="کیوآرکد من">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-border bg-linear-to-br from-primary/4 to-surface">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-secondary/20">
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
          </div>
          <p className="mt-3 text-xs text-text-secondary">این QR را به دیگران نشان دهید</p>
        </div>
      </Modal>

      <BottomSheet
        open={showNotifSheet}
        onClose={() => setShowNotifSheet(false)}
        title="اعلان‌ها"
      >
        {notifLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <BellIcon className="mb-3 text-text-secondary/20" size={40} />
            <p className="text-sm text-text-secondary">اعلانی وجود ندارد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "rounded-xl border p-3 transition-all",
                  notif.is_seen
                    ? "border-border/30 bg-surface"
                    : "border-primary/15 bg-primary/3"
                )}
              >
                <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                {notif.message && (
                  <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                    {notif.message}
                  </p>
                )}
                {notif.date && (
                  <p className="mt-1 text-[10px] text-text-secondary/50">{notif.date}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </BottomSheet>

      <Modal
        open={showInterestsModal}
        onClose={() => setShowInterestsModal(false)}
        title="علاقه‌مندی‌ها"
      >
        <div className="flex max-h-80 flex-wrap gap-2 overflow-y-auto py-2">
          {categories.map((cat) => {
            const isSelected = selectedInterests.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedInterests((prev) => {
                    const next = new Set(prev);
                    if (next.has(cat.id)) next.delete(cat.id);
                    else next.add(cat.id);
                    return next;
                  });
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                  isSelected
                    ? "border-primary bg-primary/8 text-primary shadow-xs shadow-primary/10"
                    : "border-border/60 text-text-secondary hover:border-primary/30 hover:bg-primary/2"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <Button fullWidth onClick={handleSaveInterests} loading={savingInterests} disabled={savingInterests}>
            ذخیره
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="خروج از حساب"
        message="آیا مطمئن هستید که می‌خواهید خارج شوید؟"
        confirmLabel="خروج"
        cancelLabel="انصراف"
        loading={logoutLoading}
      />
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
  onClick,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-[18px] bg-white px-2 py-3.5",
        onClick && "transition-transform active:scale-[0.98]"
      )}
      style={{ boxShadow: PROFILE_STAT_SHADOW }}
    >
      <span className="text-[22px] font-bold leading-none" style={{ color: PROFILE_TEXT }}>
        {toPersianDigits(value)}
      </span>
      <span
        className="text-center text-[10px] leading-tight"
        style={{ color: PROFILE_TEXT_MUTED }}
      >
        {label}
      </span>
      <div className="mt-1" style={{ color: PROFILE_PRIMARY }}>
        {icon}
      </div>
    </Comp>
  );
}

function MenuRow({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-[#fafafa]"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center"
          style={{ color: PROFILE_PRIMARY }}
        >
          {icon}
        </div>
        <span className="text-sm font-medium" style={{ color: PROFILE_TEXT }}>
          {label}
        </span>
      </div>
      <ChevronIcon />
    </button>
  );
}

function InterestTag({ category }: { category: Category }) {
  const iconSrc = category.location_icon || category.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
      style={{
        backgroundColor: PROFILE_PRIMARY,
        boxShadow: "0 2px 8px rgba(255,90,95,0.35)",
      }}
    >
      {iconSrc ? (
        <OptimizedImage
          src={imgUrl(iconSrc)}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5 object-contain brightness-0 invert"
        />
      ) : (
        <TagDotIcon className="text-white" />
      )}
      {category.name}
    </span>
  );
}

function ProfileAvatarPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="9" cy="7" r="0.8" fill="white" stroke="none" />
      <circle cx="15" cy="7" r="0.8" fill="white" stroke="none" />
      <path d="M10 11c.5.5 1.5.5 2 0" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn("text-[#6b7280]", className)}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6b7280]">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: PROFILE_PRIMARY }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function UserDataIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="9" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10 11c.5.5 1.5.5 2 0" strokeLinecap="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 11h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H3z" />
      <path d="M21 11h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2z" />
      <path d="M5 11V7a7 7 0 0 1 14 0v4" />
    </svg>
  );
}

function ViewedEventsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

function UpcomingEventsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SavedEventsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TagDotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
