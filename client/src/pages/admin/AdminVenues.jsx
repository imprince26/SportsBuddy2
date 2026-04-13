import { useState } from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminVenues,
  useUpdateAdminVenueFeatured,
  useUpdateAdminVenueStatus,
  useUpdateAdminVenueVerification,
} from "@/hooks/admin/useAdminVenues";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminVenues = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const venuesFilter = filters.venues;
  const venuesQuery = useAdminVenues(venuesFilter);
  const verificationMutation = useUpdateAdminVenueVerification();
  const statusMutation = useUpdateAdminVenueStatus();
  const featuredMutation = useUpdateAdminVenueFeatured();
  const [selectedVenue, setSelectedVenue] = useState(null);

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Venue Governance"
        description="Manage venue trust signals, activation, and ownership quality."
      />

      <Card className="rounded-2xl border-border/60 bg-card">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <Input
            placeholder="Search venue"
            value={venuesFilter.search}
            onChange={(event) => updateFilter("venues", { search: event.target.value, page: 1 })}
          />

          <Select
            value={venuesFilter.isVerified}
            onValueChange={(value) => updateFilter("venues", { isVerified: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={venuesFilter.isActive}
            onValueChange={(value) => updateFilter("venues", { isActive: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="City"
            value={venuesFilter.city}
            onChange={(event) => updateFilter("venues", { city: event.target.value, page: 1 })}
          />
        </CardContent>
      </Card>

      {venuesQuery.isLoading ? (
        <AdminLoadingBlock rows={6} />
      ) : venuesQuery.data?.data?.length ? (
        <div className="space-y-3">
          {venuesQuery.data.data.map((venue) => (
            <Card key={venue._id} className="rounded-2xl border-border/60 bg-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{venue.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {venue.location?.address || "-"}, {venue.location?.city || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Owner: {venue.owner?.name || "Unknown"} - Added{" "}
                      {venue.createdAt ? format(new Date(venue.createdAt), "dd MMM yyyy") : "-"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Rating: {venue.averageRating || 0} ({venue.ratingsCount || 0})</span>
                      <span>Total bookings: {venue.totalBookings || 0}</span>
                      <span>Confirmed: {venue.confirmedBookings || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={venue.isActive ? "active" : "suspended"} />
                    <AdminStatusBadge value={venue.isVerified ? "verified" : "unverified"} />
                    {venue.isFeatured ? <AdminStatusBadge value="featured" /> : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Select
                    defaultValue={String(Boolean(venue.isVerified))}
                    onValueChange={(value) =>
                      verificationMutation.mutate({
                        venueId: venue._id,
                        isVerified: value === "true",
                        note: value === "true" ? "Verified by admin" : "Verification removed by admin",
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Verified</SelectItem>
                      <SelectItem value="false">Unverified</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    defaultValue={String(Boolean(venue.isActive))}
                    onValueChange={(value) =>
                      statusMutation.mutate({
                        venueId: venue._id,
                        isActive: value === "true",
                        note: value === "true" ? "Activated by admin" : "Deactivated by admin",
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">Featured</span>
                    <Switch
                      checked={Boolean(venue.isFeatured)}
                      onCheckedChange={(checked) =>
                        featuredMutation.mutate({ venueId: venue._id, isFeatured: checked })
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVenue(venue)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    <Eye className="h-4 w-4" />
                    View details
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={venuesQuery.data?.pagination}
            onPageChange={(page) => updateFilter("venues", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No venues found" description="Try changing city or verification filters." />
      )}

      <Dialog open={Boolean(selectedVenue)} onOpenChange={(open) => (!open ? setSelectedVenue(null) : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVenue?.name || "Venue details"}</DialogTitle>
            <DialogDescription>{selectedVenue?.description || "No description provided"}</DialogDescription>
          </DialogHeader>

          {selectedVenue ? (
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">City</p>
                <p className="font-medium">{selectedVenue.location?.city || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="font-medium">{selectedVenue.location?.country || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Hourly rate</p>
                <p className="font-medium">Rs {Math.round(selectedVenue.pricing?.hourlyRate || 0)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-medium">{selectedVenue.capacity || 0}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVenues;
