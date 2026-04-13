import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";

export const useAdminSystemHealth = () => {
  return useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: adminApi.getSystemHealth,
    staleTime: 60 * 1000,
  });
};
