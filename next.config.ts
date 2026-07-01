import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "injaro.darkube.ir", pathname: "/media/**" },
      { protocol: "https", hostname: "api.injaro.info", pathname: "/**" },
      { protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/**" },
    ],
  },
  async rewrites() {
    return [
      { source: "/landing/:path*", destination: "/api/landing/:path*" },
      { source: "/main/:path*", destination: "/api/main/:path*" },
      { source: "/accounts/:path*", destination: "/api/accounts/:path*" },
      { source: "/invite/:path*", destination: "/api/invite/:path*" },
      { source: "/analyst/:path*", destination: "/api/analyst/:path*" },
    ];
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_LANDING_URL: process.env.NEXT_PUBLIC_LANDING_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },
};

export default nextConfig;
