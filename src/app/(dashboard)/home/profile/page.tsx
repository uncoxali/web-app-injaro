"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationsSeen,
  type UserProfile,
  type Notification,
} from "@/lib/api/profile";
import { getCategories, type Category } from "@/lib/api/categories";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showNotifSheet, setShowNotifSheet] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<number>>(new Set());
  const [savingInterests, setSavingInterests] = useState(false);

  const fetchProfile = useCallback(() => {
    setLoading(true);
    setError(false);
    getProfile()
      .then(setProfile)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, [fetchProfile]);

  const handleOpenNotif = useCallback(async () => {
    setShowNotifSheet(true);
    setNotifLoading(true);
    try {
      const list = await getNotifications();
      setNotifications(list);
      await markNotificationsSeen();
      setProfile((prev) => prev ? { ...prev, unread_notifications: 0 } : prev);
    } catch {
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleOpenInterests = useCallback(() => {
    setSelectedInterests(new Set(profile?.interests || []));
    setShowInterestsModal(true);
  }, [profile]);

  const handleSaveInterests = useCallback(async () => {
    setSavingInterests(true);
    try {
      await updateProfile({ interests: Array.from(selectedInterests) });
      setProfile((prev) => prev ? { ...prev, interests: Array.from(selectedInterests) } : prev);
      toast.success("علاقه‌مندی‌ها ذخیره شد");
      setShowInterestsModal(false);
    } catch {
      toast.error("خطا در ذخیره");
    } finally {
      setSavingInterests(false);
    }
  }, [selectedInterests]);

  const handleLogout = useCallback(() => {
    setLogoutLoading(true);
    setTimeout(() => {
      logout();
      router.replace("/home");
    }, 300);
  }, [logout, router]);

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
      <div className="relative pt-6 pb-8 px-4 bg-gradient-to-b from-primary/[0.06] to-background">
        <div className="absolute top-4 end-4">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-[3px] border-primary/15 flex items-center justify-center text-2xl font-bold text-primary shadow-sm">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -end-0.5 w-5 h-5 rounded-full bg-success border-2 border-background flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-lg font-bold text-text-primary mt-3">
            {profile?.full_name || "کاربر"}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5" dir="ltr">
            {profile?.phone}
          </p>
        </motion.div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-border/50 bg-surface text-sm font-medium text-text-primary hover:border-primary/30 hover:bg-primary/[0.02] transition-all shadow-sm shadow-border/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            QR من
          </button>
          <button
            onClick={() => setShowScanModal(true)}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-border/50 bg-surface text-sm font-medium text-text-primary hover:border-primary/30 hover:bg-primary/[0.02] transition-all shadow-sm shadow-border/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="1" />
            </svg>
            اسکن QR
          </button>
        </div>
      </div>

      <button
        onClick={handleOpenNotif}
        className="mx-4 mb-4 flex items-center justify-between h-14 px-4 rounded-xl bg-surface border border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] transition-all shadow-sm shadow-border/20"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-text-primary">نوتیفیکیشن‌ها</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/50">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="mx-4 rounded-xl bg-surface border border-border/50 overflow-hidden mb-6 shadow-sm shadow-border/20">
        <MenuItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          label="داده‌های کاربری"
          href="/profile"
        />
        <div className="h-px bg-border/40 mx-4" />
        <MenuItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          label="علاقه‌مندی‌ها"
          onClick={handleOpenInterests}
        />
        <div className="h-px bg-border/40 mx-4" />
        <MenuItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
          label="پشتیبانی"
          href="/home/profile/support"
        />
        <div className="h-px bg-border/40 mx-4" />
        <MenuItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-error">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
          label="خروج"
          labelClass="text-error"
          onClick={() => setShowLogoutConfirm(true)}
        />
      </div>

      <Modal open={showQrModal} onClose={() => setShowQrModal(false)} title="QR من">
        <div className="flex flex-col items-center py-4">
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary/[0.04] to-surface border border-border flex items-center justify-center">
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

      <Modal open={showScanModal} onClose={() => setShowScanModal(false)} title="اسکن QR">
        <div className="flex flex-col items-center py-4">
          <div className="w-56 h-56 rounded-xl bg-black flex items-center justify-center">
            <p className="text-sm text-white/40">دوربین</p>
          </div>
          <p className="text-xs text-text-secondary mt-3">دوربین را روی QR کد بگیرید</p>
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
                    : "border-primary/15 bg-primary/[0.03]"
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
                    ? "border-primary bg-primary/8 text-primary shadow-sm shadow-primary/10"
                    : "border-border/60 text-text-secondary hover:border-primary/30 hover:bg-primary/[0.02]"
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
  href?: string;
  onClick?: () => void;
  labelClass?: string;
}

function MenuItem({ icon, label, href, onClick, labelClass }: MenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-between w-full h-14 px-4 hover:bg-surface/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className={cn("text-sm font-medium", labelClass || "text-text-primary")}>
          {label}
        </span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/30">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
