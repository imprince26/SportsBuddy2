import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/utils/adminApi";
import { showToast } from "@/components/CustomToast";

export const useAdminBookings = (filters) => {
  return useQuery({
    queryKey: ["admin", "bookings", filters],
    queryFn: () => adminApi.getBookings(filters),
    keepPreviousData: true,
  });
};

export const useUpdateAdminBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updateBookingStatus,
    onSuccess: () => {
      showToast.success("Booking status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || "Failed to update booking status");
    },
  });
};
