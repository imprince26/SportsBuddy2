import { format } from "date-fns";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminBookings, useUpdateAdminBookingStatus } from "@/hooks/admin/useAdminBookings";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bookingStatusOptions = ["pending", "confirmed", "cancelled"];

const AdminBookings = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const bookingsFilter = filters.bookings;
  const bookingsQuery = useAdminBookings(bookingsFilter);
  const updateStatusMutation = useUpdateAdminBookingStatus();

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Booking Control"
        description="Track reservation throughput, confirmations, and booking quality."
      />

      <Card className="rounded-2xl border-border/60 bg-card/70">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
          <Select
            value={bookingsFilter.status}
            onValueChange={(value) => updateFilter("bookings", { status: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {bookingStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by venue id"
            value={bookingsFilter.venueId}
            onChange={(event) => updateFilter("bookings", { venueId: event.target.value, page: 1 })}
          />

          <Select
            value={String(bookingsFilter.limit)}
            onValueChange={(value) => updateFilter("bookings", { limit: Number(value), page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 bg-card/70">
        <CardContent className="grid grid-cols-2 gap-3 p-4 md:grid-cols-5">
          <div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
            <p className="text-lg font-semibold">{bookingsQuery.data?.stats?.totalBookings || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-semibold">{bookingsQuery.data?.stats?.pending || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
            <p className="text-lg font-semibold">{bookingsQuery.data?.stats?.confirmed || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
            <p className="text-lg font-semibold">{bookingsQuery.data?.stats?.cancelled || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-lg font-semibold">Rs {Math.round(bookingsQuery.data?.stats?.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {bookingsQuery.isLoading ? (
        <AdminLoadingBlock rows={6} />
      ) : bookingsQuery.data?.data?.length ? (
        <div className="space-y-3">
          {bookingsQuery.data.data.map((booking) => (
            <Card key={booking.bookingId} className="rounded-2xl border-border/60 bg-card/70">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{booking.venue?.name || "Unknown venue"}</p>
                    <p className="text-xs text-muted-foreground">
                      User: {booking.user?.name || "Unknown"} ({booking.user?.email || "-"})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Start {booking.startTime ? format(new Date(booking.startTime), "dd MMM yyyy hh:mm a") : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Amount Rs {Math.round(booking.totalAmount || booking.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={booking.status} />
                    <Select
                      defaultValue={booking.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({
                          venueId: booking.venue?._id,
                          bookingId: booking.bookingId,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-[160px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={bookingsQuery.data?.pagination}
            onPageChange={(page) => updateFilter("bookings", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No bookings available" description="Bookings will appear once reservations are created." />
      )}
    </div>
  );
};

export default AdminBookings;
