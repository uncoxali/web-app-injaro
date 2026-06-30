"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import animData from "../../animation/animfa.json";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((r) => setTimeout(r, 3200));
      router.replace("/home");
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-dvh w-full max-w-[480px] mx-auto flex-col">
      <Lottie animationData={animData} loop={false} className="w-full h-full" />
    </div>
  );
}
