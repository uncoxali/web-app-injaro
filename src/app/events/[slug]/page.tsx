import { EventDetailClient } from "@/components/event/event-detail-client";
import { fetchEventDetailServer } from "@/lib/server-fetch";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let initialData = null;
  let hasError = false;

  try {
    initialData = await fetchEventDetailServer(slug);
    if (!initialData) hasError = true;
  } catch {
    hasError = true;
  }

  return (
    <EventDetailClient
      initialData={initialData}
      slug={slug}
      hasError={hasError}
    />
  );
}
