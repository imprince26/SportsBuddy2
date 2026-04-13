import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";

export const useAdminGrowth = (days) => {
  return useQuery({
    queryKey: ["admin", "growth", days],
    queryFn: () => adminApi.getDashboardGrowth(days),
    staleTime: 60 * 1000,
  });
};
