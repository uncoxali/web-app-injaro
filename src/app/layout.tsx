import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SWRegister } from "@/components/sw-register";
import { InstallPrompt } from "@/components/install-prompt";
import { OfflineHandler } from "@/components/offline-handler";
import { PageviewTracker } from "@/components/pageview-tracker";
import { GoogleAnalytics } from "@/components/google-analytics";

export const metadata: Metadata = {
  title: "اینجارو",
  description: "اینجارو - پلتفرم خرید و فروش",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/icons/icon.svg" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "اینجارو",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-dvh flex flex-col bg-background text-text-primary">
        <GoogleAnalytics />
        <Providers>
          <SWRegister />
          <OfflineHandler />
          <PageviewTracker />
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
