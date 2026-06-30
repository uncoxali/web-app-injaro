"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SplashFallback } from "@/components/splash-lottie";

const SplashLottie = dynamic(
  () => import("@/components/splash-lottie").then((m) => m.SplashLottie),
  { ssr: false, loading: () => <SplashFallback /> }
);

const MIN_SPLASH_MS = 1500;
const MAX_SPLASH_MS = 3200;

export default function SplashPage() {
  const router = useRouter();
  const redirected = useRef(false);
  const mountedAt = useRef(Date.now());
  const animationDone = useRef(false);

  const redirect = useCallback(() => {
    if (redirected.current) return;
    const elapsed = Date.now() - mountedAt.current;
    if (!animationDone.current && elapsed < MIN_SPLASH_MS) return;
    redirected.current = true;
    router.replace("/home");
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(redirect, MAX_SPLASH_MS);
    return () => clearTimeout(timer);
  }, [redirect]);

  const handleComplete = useCallback(() => {
    animationDone.current = true;
    redirect();
  }, [redirect]);

  return (
    <div
      className="flex h-dvh min-h-dvh w-full flex-1 flex-col overflow-hidden bg-background"
      style={{
        paddingTop: "var(--safe-area-top)",
        paddingBottom: "var(--safe-area-bottom)",
      }}
    >
      <SplashLottie onComplete={handleComplete} />
    </div>
  );
}
