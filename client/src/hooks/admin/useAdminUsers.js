import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";
import { showToast } from "@/components/CustomToast";

export const useAdminUsers = (filters) => {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => adminApi.getUsers(filters),
    keepPreviousData: true,
  });
};

export const useAdminUserDetails = (userId) => {
  return useQuery({
    queryKey: ["admin", "users", userId, "details"],
    queryFn: () => adminApi.getUserDetails(userId),
    enabled: Boolean(userId),
  });
};

export const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateUserRole,
    onSuccess: () => {
      showToast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update role");
    },
  });
};

export const useSendAdminUserNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.sendUserNotification,
    onSuccess: (_, variables) => {
      showToast.success("Notification sent to user");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: ["admin", "users", variables.userId, "details"] });
      }
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to send notification");
    },
  });
};

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateUserStatus,
    onSuccess: () => {
      showToast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update account status");
    },
  });
};
