import { useQuery } from "@tanstack/react-query";
import { getProfile, type UserProfile } from "@/lib/api/profile";

export const profileKeys = {
  me: ["profile", "me"] as const,
};

export function useProfile(enabled = true) {
  return useQuery<UserProfile>({
    queryKey: profileKeys.me,
    queryFn: getProfile,
    enabled,
  });
}
