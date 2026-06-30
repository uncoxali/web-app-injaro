import { useQuery } from "@tanstack/react-query";
import { getTazeha, type TazehaResponse } from "@/lib/api/tazeha";

export const tazehaKeys = {
  all: ["tazeha"] as const,
  byDate: (date: string) => ["tazeha", date] as const,
};

export function useTazeha(date?: string, enabled = true) {
  return useQuery<TazehaResponse>({
    queryKey: tazehaKeys.byDate(date ?? ""),
    queryFn: () => getTazeha(date),
    enabled,
  });
}
