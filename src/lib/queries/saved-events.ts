import { useQuery } from "@tanstack/react-query";
import { getSavedEvents, type SavedEvent } from "@/lib/api/events";

export const savedEventsKeys = {
  all: ["savedEvents"] as const,
};

export function useSavedEvents(enabled = true) {
  return useQuery<SavedEvent[]>({
    queryKey: savedEventsKeys.all,
    queryFn: getSavedEvents,
    enabled,
  });
}
