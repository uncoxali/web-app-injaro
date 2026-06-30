"use client";

import Lottie from "lottie-react";
import animData from "../../animation/animfa.json";

interface SplashLottieProps {
  onComplete?: () => void;
}

export function SplashLottie({ onComplete }: SplashLottieProps) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <Lottie
        animationData={animData}
        loop={false}
        onComplete={onComplete}
        className="h-full w-full max-h-full max-w-full"
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </div>
  );
}

export function SplashFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 animate-pulse" />
    </div>
  );
}
