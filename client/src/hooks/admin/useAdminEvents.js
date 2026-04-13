import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";
import { showToast } from "@/components/CustomToast";

export const useAdminEvents = (filters) => {
  return useQuery({
    queryKey: ["admin", "events", filters],
    queryFn: () => adminApi.getEvents(filters),
    keepPreviousData: true,
  });
};

export const useUpdateAdminEventStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateEventStatus,
    onSuccess: () => {
      showToast.success("Event status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update event status");
    },
  });
};

export const useDeleteAdminEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteEvent,
    onSuccess: () => {
      showToast.success("Event removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to delete event");
    },
  });
};
