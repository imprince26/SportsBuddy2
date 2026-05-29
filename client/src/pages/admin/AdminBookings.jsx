import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  Eye,
  Filter,
  MapPin,
  Search,
  Timer,
  Wallet,
  XCircle,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminBookings, useUpdateAdminBookingStatus } from "@/hooks/admin/useAdminBookings";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bookingStatusOptions = ["pending", "confirmed", "cancelled"];

const safeFormat = (date, pattern = "dd MMM yyyy hh:mm a") => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : format(parsed, pattern);
};

const formatMoney = (value = 0) => `Rs ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const MiniStat = ({ label, value }) => (
  <div className="rounded-md border border-border/60 bg-background/80 px-3 py-2">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const VenueImage = ({ booking }) => {
  const imageUrl = booking?.venue?.primaryImage?.url;

  if (imageUrl) {
    return <img src={imageUrl} alt={booking?.venue?.name || "Venue"} className="h-full w-full object-cover" loading="lazy" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-sky-100 to-emerald-100 dark:from-primary/25 dark:via-slate-900 dark:to-emerald-950">
      <CalendarClock className="h-10 w-10 text-primary/70" />
    </div>
  );
};

const AdminBookings = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const bookingsFilter = filters.bookings;
  const bookingsQuery = useAdminBookings(bookingsFilter);
  const updateStatusMutation = useUpdateAdminBookingStatus();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookings = bookingsQuery.data?.data || [];
  const stats = bookingsQuery.data?.stats || {};
  const cities = bookingsQuery.data?.breakdowns?.cities || [];

  const metrics = useMemo(
    () => [
      {
        title: "Total bookings",
        value: stats.totalBookings || 0,
        hint: `${stats.totalHours || 0} booked hours`,
        icon: CalendarClock,
        trend: "neutral",
      },
      {
        title: "Confirmed",
        value: stats.confirmed || 0,
        hint: `${stats.pending || 0} pending approval`,
        icon: CheckCircle2,
        trend: "up",
      },
      {
        title: "Revenue",
        value: formatMoney(stats.totalRevenue || 0),
        hint: `${formatMoney(stats.averageAmount || 0)} average value`,
        icon: Wallet,
        trend: "up",
      },
      {
        title: "Cancelled",
        value: stats.cancelled || 0,
        hint: "Monitor operational friction",
        icon: XCircle,
        trend: stats.cancelled > 0 ? "down" : "neutral",
      },
    ],
    [stats]
  );

  const updateBookingStatus = (booking, status) => {
    updateStatusMutation.mutate({
      venueId: booking.venue?._id,
      bookingId: booking.bookingId,
      status,
    });
  };

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Booking Control"
        description="Run venue reservations from one queue with customer, event, time, and revenue context."
      />

      <AdminMetricGrid items={metrics} />

      <section className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-emerald-500/10 p-4 shadow-sm lg:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="text-base font-semibold text-foreground">Reservation cockpit</h3>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Pending bookings, city demand, and confirmed revenue stay visible so admins can act without hunting through IDs.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Pending" value={stats.pending || 0} />
              <MiniStat label="Confirmed" value={stats.confirmed || 0} />
              <MiniStat label="Cancelled" value={stats.cancelled || 0} />
              <MiniStat label="Avg value" value={formatMoney(stats.averageAmount || 0)} />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/80 p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Demand by city</p>
            <div className="space-y-2">
              {cities.slice(0, 5).map((item) => (
                <div key={item.city} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{item.city}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
              {cities.length === 0 ? <p className="text-sm text-muted-foreground">No city data yet.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[1.3fr_0.75fr_0.75fr_0.75fr_0.75fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search venue, user, event, notes"
              value={bookingsFilter.search}
              onChange={(event) => updateFilter("bookings", { search: event.target.value, page: 1 })}
            />
          </div>

          <Select value={bookingsFilter.status} onValueChange={(value) => updateFilter("bookings", { status: value, page: 1 })}>
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
            placeholder="City"
            value={bookingsFilter.city}
            onChange={(event) => updateFilter("bookings", { city: event.target.value, page: 1 })}
          />

          <Input
            type="date"
            value={bookingsFilter.dateFrom}
            onChange={(event) => updateFilter("bookings", { dateFrom: event.target.value, page: 1 })}
          />

          <Input
            type="date"
            value={bookingsFilter.dateTo}
            onChange={(event) => updateFilter("bookings", { dateTo: event.target.value, page: 1 })}
          />

          <Button variant="outline" onClick={() => resetFilter("bookings")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {bookingsQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : bookings.length ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.bookingId} className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="grid min-h-[210px] lg:grid-cols-[230px_1fr]">
                  <div className="relative min-h-[180px]">
                    <VenueImage booking={booking} />
                    <div className="absolute left-3 top-3">
                      <AdminStatusBadge value={booking.status} />
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                      {formatMoney(booking.totalAmount || booking.amount || 0)}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">{booking.venue?.name || "Unknown venue"}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">{booking.venue?.location?.city || "Unknown city"}</span>
                        </p>
                        <div className="mt-3 flex min-w-0 items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/70">
                            <AvatarImage src={booking.user?.avatar?.url} />
                            <AvatarFallback>{booking.user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{booking.user?.name || "Unknown user"}</p>
                            <p className="truncate text-xs text-muted-foreground">{booking.user?.email || "No email"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[460px]">
                        <MiniStat label="Start" value={safeFormat(booking.startTime, "dd MMM, hh:mm a")} />
                        <MiniStat label="Duration" value={`${booking.duration || "-"} hrs`} />
                        <MiniStat label="Event" value={booking.event?.name || "Direct"} />
                        <MiniStat label="Booked" value={safeFormat(booking.bookingDate, "dd MMM")} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      <Select defaultValue={booking.status} onValueChange={(value) => updateBookingStatus(booking, value)}>
                        <SelectTrigger className="h-8 w-[150px]">
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

                      {booking.status !== "confirmed" ? (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking, "confirmed")}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                      ) : null}
                      {booking.status !== "cancelled" ? (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking, "cancelled")}>
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination pagination={bookingsQuery.data?.pagination} onPageChange={(page) => updateFilter("bookings", { page })} />
        </div>
      ) : (
        <AdminEmptyState title="No bookings available" description="Bookings will appear once reservations are created." />
      )}

      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => (!open ? setSelectedBooking(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{selectedBooking?.venue?.name || "Booking details"}</DialogTitle>
            <DialogDescription>
              {selectedBooking?.user?.name || "Unknown user"} - {safeFormat(selectedBooking?.startTime)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {selectedBooking ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="Status" value={selectedBooking.status} />
                  <MiniStat label="Amount" value={formatMoney(selectedBooking.totalAmount || selectedBooking.amount)} />
                  <MiniStat label="Duration" value={`${selectedBooking.duration || "-"} hrs`} />
                  <MiniStat label="Booking ID" value={String(selectedBooking.bookingId).slice(-8)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Venue</p>
                    <p className="mt-1 font-medium">{selectedBooking.venue?.name || "-"}</p>
                    <p className="text-muted-foreground">
                      {[selectedBooking.venue?.location?.address, selectedBooking.venue?.location?.city].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Customer</p>
                    <p className="mt-1 font-medium">{selectedBooking.user?.name || "-"}</p>
                    <p className="text-muted-foreground">{selectedBooking.user?.email || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Time window</p>
                    <p className="mt-1">{safeFormat(selectedBooking.startTime)}</p>
                    <p className="text-muted-foreground">{safeFormat(selectedBooking.endTime)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Linked event</p>
                    <p className="mt-1 font-medium">{selectedBooking.event?.name || "Direct booking"}</p>
                    <p className="text-muted-foreground">{selectedBooking.event?.status || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                  <Timer className="h-4 w-4 text-primary" />
                  <span>{selectedBooking.notes || "No booking notes were added."}</span>
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
