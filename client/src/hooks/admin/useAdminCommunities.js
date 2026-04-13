import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";
import { showToast } from "@/components/CustomToast";

export const useAdminCommunities = (filters) => {
  return useQuery({
    queryKey: ["admin", "communities", filters],
    queryFn: () => adminApi.getCommunities(filters),
    keepPreviousData: true,
  });
};

export const useUpdateAdminCommunityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateCommunityStatus,
    onSuccess: () => {
      showToast.success("Community status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "communities"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update community");
    },
  });
};

export const useDeleteAdminCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteCommunity,
    onSuccess: () => {
      showToast.success("Community deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "communities"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to delete community");
    },
  });
};
