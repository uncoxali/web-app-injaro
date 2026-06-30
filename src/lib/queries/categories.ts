import { useQuery } from "@tanstack/react-query";
import { getCategories, type Category } from "@/lib/api/categories";

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
  });
}
