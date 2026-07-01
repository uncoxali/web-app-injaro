import { EventDetailClient } from "@/components/event/event-detail-client";
import { fetchEventDetailServer } from "@/lib/server-fetch";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let initialData = null;

  try {
    initialData = await fetchEventDetailServer(slug);
  } catch {
    // Guest/unauthenticated SSR may 403 — client handles public fallback.
  }

  return (
    <EventDetailClient initialData={initialData} slug={slug} />
  );
}
