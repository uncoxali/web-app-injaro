import { useQuery } from "@tanstack/react-query";
import {
  getSavedEvents,
  getGoingEvents,
  type ProfileEventItem,
} from "@/lib/api/events";

export const savedEventsKeys = {
  all: ["savedEvents"] as const,
};

export const goingEventsKeys = {
  all: ["goingEvents"] as const,
};

export function useSavedEvents(enabled = true) {
  return useQuery<ProfileEventItem[]>({
    queryKey: savedEventsKeys.all,
    queryFn: getSavedEvents,
    enabled,
  });
}

export function useGoingEvents(enabled = true) {
  return useQuery<ProfileEventItem[]>({
    queryKey: goingEventsKeys.all,
    queryFn: getGoingEvents,
    enabled,
  });
}
