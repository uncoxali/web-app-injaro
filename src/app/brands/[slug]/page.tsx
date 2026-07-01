import { BrandDetailClient } from "@/components/brand/brand-detail-client";
import { fetchLocationDetailServer } from "@/lib/server-fetch";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let initialData = null;

  try {
    initialData = await fetchLocationDetailServer(slug);
  } catch {
    // Client may retry with auth token.
  }

  return <BrandDetailClient initialData={initialData} slug={slug} />;
}
