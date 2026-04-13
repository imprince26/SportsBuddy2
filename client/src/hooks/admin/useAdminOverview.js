import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.getDashboardOverview,
    staleTime: 60 * 1000,
  });
};
