const CACHE_NAME = "injaro-v4";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon.svg",
  "/fonts/Vazirmatn-Regular.woff2",
  "/fonts/Vazirmatn-Medium.woff2",
  "/fonts/Vazirmatn-Bold.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: network-first with fallback
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/main/") ||
    url.pathname.startsWith("/accounts/") ||
    url.pathname.startsWith("/invite/")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Next.js image optimizer: network-first (signed URLs rotate; avoid stale cache)
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: cache-first
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation: network-first
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(null, { status: 408 });
  }
}
