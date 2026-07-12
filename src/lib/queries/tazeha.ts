import { useInfiniteQuery } from "@tanstack/react-query";
import { getTazehaPage, type TazehaPageResult } from "@/lib/api/tazeha";

export const tazehaKeys = {
  all: ["tazeha"] as const,
  byDate: (date: string) => ["tazeha", date] as const,
};

export function useInfiniteTazeha(date?: string, enabled = true) {
  return useInfiniteQuery<TazehaPageResult>({
    queryKey: tazehaKeys.byDate(date ?? ""),
    queryFn: ({ pageParam }) => getTazehaPage(date, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled,
  });
}
