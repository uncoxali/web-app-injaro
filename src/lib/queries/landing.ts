import { useQuery } from "@tanstack/react-query";
import {
  getLandingEvents,
  getLandingLocations,
  type LandingEvent,
  type LandingLocation,
} from "@/lib/api/landing";

export const landingKeys = {
  events: ["landing", "events"] as const,
  locations: ["landing", "locations"] as const,
};

export function useLandingEvents() {
  return useQuery<LandingEvent[]>({
    queryKey: landingKeys.events,
    queryFn: getLandingEvents,
    retry: false,
  });
}

export function useLandingLocations(enabled = true) {
  return useQuery<LandingLocation[]>({
    queryKey: landingKeys.locations,
    queryFn: getLandingLocations,
    retry: false,
    enabled,
  });
}
