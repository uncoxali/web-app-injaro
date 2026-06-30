import { useQuery } from "@tanstack/react-query";
import { getSponsors, type Sponsor } from "@/lib/api/locations";

export const sponsorKeys = {
  all: ["sponsors"] as const,
};

export function useSponsors(enabled = true) {
  return useQuery<Sponsor[]>({
    queryKey: sponsorKeys.all,
    queryFn: getSponsors,
    enabled,
  });
}
