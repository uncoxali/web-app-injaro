import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getTazehaPage,
  getTazehaPageByUrl,
  type TazehaPageResult,
} from "@/lib/api/tazeha";

export const tazehaKeys = {
  all: ["tazeha"] as const,
  list: (date: string, categoryId: number | null) =>
    ["tazeha", date, categoryId ?? "all"] as const,
};

export function useInfiniteTazeha(
  date?: string,
  categoryId: number | null = null,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: tazehaKeys.list(date ?? "", categoryId),
    queryFn: ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return getTazehaPageByUrl(pageParam, date, categoryId);
      }
      return getTazehaPage(date, pageParam as number, categoryId);
    },
    initialPageParam: 1 as number | string,
    getNextPageParam: (lastPage: TazehaPageResult, allPages: TazehaPageResult[]) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.items.length,
        0
      );
      if (lastPage.count > 0 && loadedCount >= lastPage.count) {
        return undefined;
      }

      if (lastPage.nextUrl) return lastPage.nextUrl;
      if (lastPage.nextPage) return lastPage.nextPage;
      return undefined;
    },
    enabled,
  });
}
