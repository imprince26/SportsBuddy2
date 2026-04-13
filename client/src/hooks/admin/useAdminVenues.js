import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";
import { showToast } from "@/components/CustomToast";

export const useAdminVenues = (filters) => {
  return useQuery({
    queryKey: ["admin", "venues", filters],
    queryFn: () => adminApi.getVenues(filters),
    keepPreviousData: true,
  });
};

export const useUpdateAdminVenueVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateVenueVerification,
    onSuccess: () => {
      showToast.success("Venue verification updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update venue verification");
    },
  });
};

export const useUpdateAdminVenueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateVenueStatus,
    onSuccess: () => {
      showToast.success("Venue status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update venue status");
    },
  });
};

export const useUpdateAdminVenueFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateVenueFeatured,
    onSuccess: () => {
      showToast.success("Venue featured flag updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update featured flag");
    },
  });
};
