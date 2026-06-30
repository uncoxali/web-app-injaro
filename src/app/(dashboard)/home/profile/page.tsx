"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

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
  const { data: categories = [] } = useCategories();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
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
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const [scanResult, setScanResult] = useState("");

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

  const startScanner = useCallback(async () => {
    if (!scannerContainerRef.current) return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-scanner-container");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanResult(decodedText);
          scanner.stop().catch(() => {});
          scannerRef.current = null;
        },
        () => {}
      );
    } catch {
      toast.error("دسترسی به دوربین ممکن نیست");
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
  }, []);

  const handleOpenScanner = useCallback(() => {
    setScanResult("");
    setShowScanModal(true);
  }, []);

  useEffect(() => {
    if (showScanModal) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [showScanModal, startScanner, stopScanner]);

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
        <ErrorState onRetry={fetchProfile} />
      </div>
    );
  }

  const unreadCount = profile?.unread_notifications || 0;
  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2)
    : profile?.phone?.slice(-2) || "";

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="relative overflow-hidden pb-6">
        <div className="absolute inset-0 bg-linear-to-b from-primary/7 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-primary/4 blur-3xl" />

        <div className="absolute top-4 inset-e-4 z-10">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center pt-16 pb-2"
        >
          <div className="relative mb-1">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative w-[88px] h-[88px] rounded-full bg-linear-to-br from-primary/20 to-primary/4 ring-3 ring-primary/8 flex items-center justify-center shadow-xl shadow-primary/5 overflow-hidden"
            >
              {profile?.avatar_url ? (
                <OptimizedImage src={profile.avatar_url} alt="" width={88} height={88} className="w-full h-full" />
              ) : (
                <span className="text-3xl font-bold text-primary/80">{initials}</span>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-0.5 -inset-e-0.5 w-7 h-7 rounded-full bg-primary border-3 border-background flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <h1 className="text-xl font-bold text-text-primary mt-3">
            {profile?.full_name || "کاربر"}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm text-text-secondary/70" dir="ltr">{profile?.phone}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/50">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/60 dark:bg-white/5 border border-border/30 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border/60 transition-all shadow-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              QR من
            </button>
            <button
              onClick={handleOpenScanner}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/60 dark:bg-white/5 border border-border/30 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border/60 transition-all shadow-xs"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
                اسکن
              </button>
          </div>
        </motion.div>
      </div>

      <div className="px-4 flex flex-col gap-5 flex-1 pb-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-text-secondary/40 px-4 tracking-widest uppercase">حساب کاربری</span>

          <MenuItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            iconBg="bg-primary/7"
            label="داده‌های کاربری"
            description="مشاهده و ویرایش اطلاعات شخصی"
            href="/profile"
          />

          <MenuItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            iconBg="bg-amber-500/8"
            label="علاقه‌مندی‌ها"
            description="دسته‌بندی‌های مورد علاقه‌تان"
            onClick={handleOpenInterests}
          />
        </div>

        <div className="-mx-4 h-px bg-border/30" />

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-text-secondary/40 px-4 tracking-widest uppercase">اعلان‌ها</span>

          <button
            onClick={handleOpenNotif}
            className="flex items-center justify-between w-full h-16 px-4 rounded-2xl bg-white/50 dark:bg-white/2 border border-border/20 hover:bg-white/80 dark:hover:bg-white/4 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative w-10 h-10 rounded-xl bg-primary/7 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -inset-e-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">نوتیفیکیشن‌ها</span>
                <span className="text-[11px] text-text-secondary/50">پیام‌ها و اعلان‌های شما</span>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <div className="-mx-4 h-px bg-border/30" />

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-text-secondary/40 px-4 tracking-widest uppercase">بیشتر</span>

          <MenuItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            iconBg="bg-emerald-500/8"
            label="پشتیبانی"
            description="ارتباط با تیم پشتیبانی"
            href="/home/profile/support"
          />

          <div className="mt-2">
            <MenuItem
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-error">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              }
              iconBg="bg-error/7"
              label="خروج از حساب"
              description="از اینجارو خارج شوید"
              labelClass="text-error"
              onClick={() => setShowLogoutConfirm(true)}
            />
          </div>
        </div>
      </div>

      <Modal open={showQrModal} onClose={() => setShowQrModal(false)} title="QR من">
        <div className="flex flex-col items-center py-4">
          <div className="w-48 h-48 rounded-xl bg-linear-to-br from-primary/4 to-surface border border-border flex items-center justify-center">
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
          <p className="text-xs text-text-secondary mt-3">این QR را به دیگران نشان دهید</p>
        </div>
      </Modal>

      <Modal
        open={showScanModal}
        onClose={() => { stopScanner(); setShowScanModal(false); }}
        title="اسکن QR"
      >
        <div className="flex flex-col items-center py-2">
          <div
            ref={scannerContainerRef}
            id="qr-scanner-container"
            className="w-64 h-64 rounded-xl overflow-hidden bg-black"
          />
          {scanResult ? (
            <div className="mt-3 text-center">
              <p className="text-xs text-success font-medium mb-1">کد اسکن شد</p>
              <p className="text-xs text-text-secondary break-all" dir="ltr">{scanResult}</p>
            </div>
          ) : (
            <p className="text-xs text-text-secondary mt-3">دوربین را روی QR کد بگیرید</p>
          )}
        </div>
      </Modal>

      <BottomSheet
        open={showNotifSheet}
        onClose={() => setShowNotifSheet(false)}
        title="نوتیفیکیشن‌ها"
      >
        {notifLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20 mb-3">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-sm text-text-secondary">نوتیفیکیشنی وجود ندارد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  notif.is_seen
                    ? "border-border/30 bg-surface"
                    : "border-primary/15 bg-primary/3"
                )}
              >
                <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                {notif.message && (
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                )}
                {notif.date && (
                  <p className="text-[10px] text-text-secondary/50 mt-1">{notif.date}</p>
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
        <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto py-2">
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
                  "px-3 py-2 rounded-xl text-sm font-medium border transition-all",
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

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  labelClass?: string;
  iconBg?: string;
}

function MenuItem({ icon, label, description, href, onClick, labelClass, iconBg = "bg-primary/7" }: MenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-between w-full h-16 px-4 rounded-2xl bg-white/50 dark:bg-white/2 border border-border/20 hover:bg-white/80 dark:hover:bg-white/4 transition-all"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className={cn("text-sm font-semibold leading-tight", labelClass || "text-text-primary")}>
            {label}
          </span>
          {description && (
            <span className="text-[11px] text-text-secondary/50 leading-tight mt-0.5">{description}</span>
          )}
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/20">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
