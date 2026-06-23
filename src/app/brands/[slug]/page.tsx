import { BrandDetailClient } from "@/components/brand/brand-detail-client";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <BrandDetailClient initialData={null} slug={slug} hasError={false} />;
}
