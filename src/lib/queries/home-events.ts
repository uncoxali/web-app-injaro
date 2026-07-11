import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getHomeLatestEvents,
  getHomePinnedEvents,
  getHomeTodayEvents,
  getHomeWeekEvents,
  submitHomeEventTicket,
  type HomeEventPin,
  type HomeEventTicketPayload,
  type HomeLatestEvent,
} from "@/lib/api/home-events";

export const homeEventKeys = {
  pin: ["home", "events", "pin"] as const,
  latest: ["home", "events", "latest"] as const,
  today: ["home", "events", "today"] as const,
  week: ["home", "events", "week"] as const,
};

export function useHomePinnedEvents() {
  return useQuery<HomeEventPin[]>({
    queryKey: homeEventKeys.pin,
    queryFn: getHomePinnedEvents,
    retry: 2,
  });
}

export function useHomeLatestEvents() {
  return useQuery<HomeLatestEvent[]>({
    queryKey: homeEventKeys.latest,
    queryFn: getHomeLatestEvents,
    retry: 2,
  });
}

export function useHomeTodayEvents() {
  return useQuery<HomeEventPin[]>({
    queryKey: homeEventKeys.today,
    queryFn: getHomeTodayEvents,
    retry: 2,
  });
}

export function useHomeWeekEvents() {
  return useQuery<HomeLatestEvent[]>({
    queryKey: homeEventKeys.week,
    queryFn: getHomeWeekEvents,
    retry: 2,
  });
}

export function useSubmitHomeEventTicket() {
  return useMutation({
    mutationFn: (payload: HomeEventTicketPayload) => submitHomeEventTicket(payload),
  });
}
