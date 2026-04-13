import { format } from "date-fns";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminVenues,
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

const AdminVenues = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const venuesFilter = filters.venues;
  const venuesQuery = useAdminVenues(venuesFilter);
  const verificationMutation = useUpdateAdminVenueVerification();
  const statusMutation = useUpdateAdminVenueStatus();

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Venue Governance"
        description="Manage venue trust signals, activation, and ownership quality."
      />

      <Card className="rounded-2xl border-border/60 bg-card/70">
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
            <Card key={venue._id} className="rounded-2xl border-border/60 bg-card/70">
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
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={venue.isActive ? "active" : "suspended"} />
                    <AdminStatusBadge value={venue.isVerified ? "verified" : "unverified"} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Select
                    defaultValue={String(Boolean(venue.isVerified))}
                    onValueChange={(value) =>
                      verificationMutation.mutate({ venueId: venue._id, isVerified: value === "true" })
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
                    onValueChange={(value) => statusMutation.mutate({ venueId: venue._id, isActive: value === "true" })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
    </div>
  );
};

export default AdminVenues;
