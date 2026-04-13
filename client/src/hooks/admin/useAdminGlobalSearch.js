import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";

export const useAdminGlobalSearch = (query, limit = 8) => {
  return useQuery({
    queryKey: ["admin", "global-search", query, limit],
    queryFn: () => adminApi.globalSearch(query, limit),
    enabled: Boolean(query && query.trim().length >= 2),
    staleTime: 20 * 1000,
  });
};
