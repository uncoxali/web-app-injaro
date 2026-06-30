"use client";

import Lottie from "lottie-react";
import animData from "../../animation/animfa.json";

interface SplashLottieProps {
  onComplete?: () => void;
}

export function SplashLottie({ onComplete }: SplashLottieProps) {
  return (
    <Lottie
      animationData={animData}
      loop={false}
      onComplete={onComplete}
      className="w-full h-full"
    />
  );
}
