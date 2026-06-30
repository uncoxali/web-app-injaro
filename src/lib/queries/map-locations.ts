import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocations } from "@/lib/api/locations";
import { isTehranArea } from "@/lib/map-utils";
import type { Location } from "@/store/map";

export const mapLocationKeys = {
  auth: (category: number | null, search: string) =>
    ["mapLocations", category, search] as const,
};

export async function fetchAuthMapLocations(
  category?: number | null,
  search?: string
): Promise<Location[]> {
  const deduped = await getLocations({
    category: category ?? undefined,
    search: search || undefined,
  });
  return deduped.filter((marker) =>
    isTehranArea(marker.latitude, marker.longitude)
  );
}

export function useAuthMapLocations(
  category?: number | null,
  search?: string,
  enabled = false
) {
  return useQuery<Location[]>({
    queryKey: mapLocationKeys.auth(category ?? null, search ?? ""),
    queryFn: () => fetchAuthMapLocations(category, search),
    enabled,
  });
}

export function useFetchAuthMapLocations() {
  const queryClient = useQueryClient();
  return (category?: number | null, search?: string) =>
    queryClient.fetchQuery({
      queryKey: mapLocationKeys.auth(category ?? null, search ?? ""),
      queryFn: () => fetchAuthMapLocations(category, search),
    });
}
