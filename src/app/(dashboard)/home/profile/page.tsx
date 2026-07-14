"use client";

import { useState, useCallback, useRef, useMemo } from "react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, toPersianDigits, imgUrl } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ProfileMapBackground } from "@/components/profile/profile-map-background";
import { Icon } from "@/components/ui/icon";
import type { Category } from "@/lib/api/categories";

const profileCardClass =
  "overflow-hidden rounded-[20px] bg-white dark:bg-surface shadow-[0_8px_28px_rgba(0,0,0,0.09),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]";
const profileStatClass =
  "flex flex-col items-center gap-1 rounded-[18px] bg-white dark:bg-surface px-2 py-3.5 shadow-[0_6px_22px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_22px_rgba(0,0,0,0.3)]";
const pageShellClass =
  "relative flex min-h-dvh flex-col bg-[#e8e8e8] dark:bg-background text-text-primary";

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
      const interestIds = Array.from(selectedInterests);
      const updated = await updateProfile({ interests: interestIds });
      const selectedCategories = categories.filter((cat) =>
        interestIds.includes(cat.id)
      );

      updateProfileCache(() => ({
        ...updated,
        interests: interestIds,
        favorit_categories:
          selectedCategories.length > 0
            ? selectedCategories
            : updated.favorit_categories,
      }));
      toast.success("علاقه‌مندی‌ها ذخیره شد");
      setShowInterestsModal(false);
    } catch {
      toast.error("خطا در ذخیره");
    } finally {
      setSavingInterests(false);
    }
  }, [categories, selectedInterests, updateProfileCache]);

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

  const userInterests = useMemo(() => {
    const ids = profile?.interests ?? [];
    const fromProfile = profile?.favorit_categories ?? [];

    const resolved = ids
      .map((id) => {
        return (
          categories.find((cat) => cat.id === id) ??
          fromProfile.find((cat) => cat.id === id)
        );
      })
      .filter((cat): cat is Category => Boolean(cat));

    if (resolved.length > 0) return resolved;
    return fromProfile;
  }, [categories, profile?.favorit_categories, profile?.interests]);
  const hasInterests = userInterests.length > 0;

  if (loading) {
    return (
      <div className={pageShellClass}>
        <ProfileMapBackground />
        <div className="relative z-10 flex flex-col gap-4 px-4 pt-4 pb-6">
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
          <div className={cn("p-1", profileCardClass)}>
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

  return (
    <div className={pageShellClass}>
      <ProfileMapBackground />

      <div className="relative z-10 flex flex-col gap-4 px-4 pt-4 pb-6">
        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <button
            onClick={handleOpenNotif}
            aria-label="اعلان‌ها"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f0f0] dark:bg-surface transition-transform active:scale-95"
          >
            <Icon name="bell" size={20} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -inset-e-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white ring-2 ring-[#e8e8e8] dark:ring-background">
                {unreadCount > 9 ? "9+" : toPersianDigits(unreadCount)}
              </span>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 rounded-[20px] border border-primary bg-white p-3 dark:bg-surface shadow-[0_8px_28px_rgba(0,0,0,0.09),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-primary shadow-[0_4px_14px_rgba(255,90,95,0.35)]"
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
                className="absolute -bottom-0.5 -inset-e-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#4b5563] text-white ring-2 ring-white dark:ring-surface"
              >
                <Icon name="plus" size={14} color="white" />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-right">
              <h1 className="truncate text-[15px] font-bold leading-snug text-text-primary">
                {profile?.full_name || "کاربر"}
              </h1>
              {profile?.job ? (
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {profile.job}
                </p>
              ) : null}
            </div>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex h-[76px] w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-white dark:border-border/50 dark:bg-surface"
          >
            <Icon name="qr" size="lg" className="text-text-secondary" />
            <span className="text-[10px] font-medium leading-tight text-text-secondary">
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
            icon={<Icon name="viewedEvents" size={20} color="primary" />}
          />
          <StatCard
            value={0}
            label="رویداد پیش‌رو"
            icon={<Icon name="upcomingEvents" size={20} color="primary" />}
          />
          <StatCard
            value={savedEvents.length}
            label="رویداد ذخیره شده"
            icon={<Icon name="savedEvents" size={20} color="primary" />}
            onClick={() => router.push("/home/savedEvents")}
          />
        </div>

        <div className={profileCardClass}>
          <MenuRow
            label="داده‌های کاربری"
            icon={<Icon name="userData" size="lg" color="primary" />}
            onClick={() => router.push("/profile")}
          />

          <div className="border-t border-border/50 px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleOpenInterests}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary bg-white dark:bg-surface">
                  <Icon name="plus" size="sm" color="primary" />
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  علاقه‌مندی‌ها
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenInterests}
                aria-label="افزودن علاقه‌مندی"
                className="flex h-8 w-8 items-center justify-center text-primary transition-transform active:scale-95"
              >
                <Icon name="plus" size="md" color="primary" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {categoriesLoading && !hasInterests ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-[72px] animate-pulse rounded-full bg-primary/30"
                  />
                ))
              ) : userInterests.length > 0 ? (
                userInterests.map((cat) => (
                  <InterestTag key={cat.id} category={cat} />
                ))
              ) : (
                <button
                  onClick={handleOpenInterests}
                  className="w-full rounded-xl border border-dashed border-primary/40 py-3 text-center text-xs text-text-secondary transition-colors hover:border-primary/60 hover:text-primary"
                >
                  علاقه‌مندی خود را اضافه کنید
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-border/50">
            <MenuRow
              label="پشتیبانی و ارتباط با ما"
              icon={<Icon name="support" size="lg" color="primary" />}
              onClick={() => router.push("/home/profile/support")}
            />
          </div>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="mx-auto mt-1 text-xs text-text-secondary/70 transition-colors hover:text-error"
        >
          خروج از حساب
        </button>
      </div>

      <Modal open={showQrModal} onClose={() => setShowQrModal(false)} title="کیوآرکد من">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-border bg-linear-to-br from-primary/4 to-surface">
            <Icon name="qr" size={120} className="text-text-secondary/20" />
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
            <Icon name="bell" size={40} className="mb-3 text-text-secondary/20" />
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
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                  isSelected
                    ? "border-primary bg-primary/8 text-primary shadow-xs shadow-primary/10"
                    : "border-border/60 text-text-secondary hover:border-primary/30 hover:bg-primary/2"
                )}
              >
                <CategoryIcon category={cat} selected={isSelected} />
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
        profileStatClass,
        onClick && "transition-transform active:scale-[0.98]"
      )}
    >
      <span className="text-[22px] font-bold leading-none text-text-primary">
        {toPersianDigits(value)}
      </span>
      <span className="text-center text-[10px] leading-tight text-text-secondary">
        {label}
      </span>
      <div className="mt-1 text-primary">{icon}</div>
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
      className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-[#fafafa] dark:hover:bg-surface/80"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <Icon name="chevronLeft" size="sm" color="primary" />
    </button>
  );
}

function CategoryIcon({
  category,
  selected = false,
  inverted = false,
}: {
  category: Category;
  selected?: boolean;
  inverted?: boolean;
}) {
  const iconSrc =
    category.location_icon ||
    (typeof category.icon === "string" && category.icon.startsWith("http")
      ? category.icon
      : undefined);

  const iconContent = iconSrc ? (
    <OptimizedImage
      src={imgUrl(iconSrc)}
      alt=""
      width={20}
      height={20}
      className={cn(
        "h-5 w-5 object-contain",
        inverted && "brightness-0 invert"
      )}
    />
  ) : category.icon ? (
    <span className="text-base leading-none">{category.icon}</span>
  ) : (
    <Icon name="feed" size="xs" color={inverted ? "white" : "primary"} />
  );

  if (inverted) {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
        {iconContent}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full",
        selected ? "bg-primary/10" : "bg-border/40"
      )}
    >
      {iconContent}
    </span>
  );
}

function InterestTag({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
      <CategoryIcon category={category} inverted />
      {category.name}
    </span>
  );
}

function ProfileAvatarPlaceholder() {
  return <Icon name="user" size={36} color="white" variant="filled" />;
}

