import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";

export const useAdminEventPayments = (filters) => {
  return useQuery({
    queryKey: ["admin", "event-payments", filters],
    queryFn: () => adminApi.getEventPayments(filters),
    keepPreviousData: true,
  });
};

export const useAdminEventPaymentDetails = (paymentId, options = {}) => {
  return useQuery({
    queryKey: ["admin", "event-payment", paymentId],
    queryFn: () => adminApi.getEventPaymentDetails(paymentId),
    enabled: Boolean(paymentId),
    ...options,
  });
};
