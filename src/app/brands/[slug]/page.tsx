import { BrandDetailClient } from "@/components/brand/brand-detail-client";
import { fetchLocationDetailServer } from "@/lib/server-fetch";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let initialData = null;
  let hasError = false;

  try {
    initialData = await fetchLocationDetailServer(slug);
    if (!initialData) hasError = true;
  } catch {
    hasError = true;
  }

  return (
    <BrandDetailClient
      initialData={initialData}
      slug={slug}
      hasError={hasError}
    />
  );
}
