import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";
import { showToast } from "@/components/CustomToast";

export const useAdminNotifications = (filters) => {
  return useQuery({
    queryKey: ["admin", "notifications", filters],
    queryFn: () => adminApi.getNotifications(filters),
    keepPreviousData: true,
  });
};

export const useCreateAdminNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createNotification,
    onSuccess: () => {
      showToast.success("Notification saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to create notification");
    },
  });
};

export const useSendAdminNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.sendNotification,
    onSuccess: () => {
      showToast.success("Notification sent");
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to send notification");
    },
  });
};
