import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";

export const useAdminAuditLogs = (filters) => {
  return useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => adminApi.getAuditLogs(filters),
    keepPreviousData: true,
  });
};
