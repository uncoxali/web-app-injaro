"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName="mt-2"
      toastOptions={{
        duration: 3000,
        style: {
          direction: "rtl",
          fontFamily: "Vazirmatn, system-ui, sans-serif",
          fontSize: "14px",
          borderRadius: "12px",
          padding: "12px 16px",
          background: "#111827",
          color: "#ffffff",
          maxWidth: "440px",
        },
        success: {
          iconTheme: {
            primary: "#10B981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
