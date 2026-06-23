import { EventDetailClient } from "@/components/event/event-detail-client";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EventDetailClient initialData={null} slug={slug} hasError={false} />;
}
