"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { submitInviteResponse } from "@/lib/api/events";
import { authFetch } from "@/lib/auth-fetch";
import { Spinner } from "@/components/ui/spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.injaro.info";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

interface InviteData {
  event_slug: string;
  topic: string;
  thumbnail?: string;
  parent_slug?: string;
}

interface InviteClientProps {
  invite: InviteData | null;
  slug: string;
  fetchError: boolean;
}

export function InviteClient({ invite: initialInvite, slug, fetchError: serverError }: InviteClientProps) {
  const router = useRouter();
  const [invite, setInvite] = useState<InviteData | null>(initialInvite);
  const [fetchError, setFetchError] = useState(serverError);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (invite || serverError) return;
    authFetch(`/invite/link/${slug}/`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setInvite)
      .catch(() => setFetchError(true));
  }, [slug, invite, serverError]);

  const handleResponse = useCallback(
    async (attend: boolean) => {
      if (!invite) return;
      setSending(true);
      try {
        await submitInviteResponse({
          event_slug: invite.event_slug,
          attend,
        });
        setSubmitted(true);
        setTimeout(() => {
          router.replace(`/events/${invite.event_slug}`);
        }, 2000);
      } catch {
        toast.error("خطا در ثبت پاسخ");
      } finally {
        setSending(false);
      }
    },
    [invite, router]
  );

  if (fetchError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <ErrorState
          title="خطا در بارگذاری"
          message="لینک دعوت نامعتبر است"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-6">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <h2 className="text-lg font-bold text-text-primary">
              پاسخ شما ثبت شد
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              در حال انتقال به صفحه رویداد...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <div className="w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-primary/10 to-surface border border-border/60 overflow-hidden mb-6">
              {invite.thumbnail ? (
                <img
                  src={invite.thumbnail.startsWith("http") ? invite.thumbnail : API_BASE + invite.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-text-secondary/20"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            <h1 className="text-xl font-bold text-text-primary text-center">
              {invite.topic}
            </h1>
            <p className="text-sm text-text-secondary text-center mt-4 leading-relaxed">
              شما به این رویداد دعوت شده‌اید.
              <br />
              آیا در این رویداد شرکت می‌کنید؟
            </p>

            <div className="flex gap-3 w-full mt-8">
              <Button
                fullWidth
                variant="secondary"
                onClick={() => handleResponse(false)}
                loading={sending}
              >
                خیر، شرکت نمی‌کنم
              </Button>
              <Button
                fullWidth
                onClick={() => handleResponse(true)}
                loading={sending}
              >
                بله، شرکت می‌کنم
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
