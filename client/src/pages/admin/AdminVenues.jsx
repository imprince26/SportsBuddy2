import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  ImageIcon,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminVenues,
  useUpdateAdminVenueFeatured,
  useUpdateAdminVenueStatus,
  useUpdateAdminVenueVerification,
} from "@/hooks/admin/useAdminVenues";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formatMoney = (value = 0) => `Rs ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const getVenueImage = (venue) => venue?.primaryImage?.url || venue?.images?.[0]?.url || "";

const MiniStat = ({ label, value }) => (
  <div className="rounded-md border border-border/60 bg-background/80 px-3 py-2">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const VenueImage = ({ venue, className = "" }) => {
  const imageUrl = getVenueImage(venue);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={venue?.name || "Venue"}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-cyan-100 to-emerald-100 dark:from-primary/25 dark:via-slate-900 dark:to-cyan-950 ${className}`}>
      <Building2 className="h-10 w-10 text-primary/70" />
    </div>
  );
};

const AdminVenues = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const venuesFilter = filters.venues;
  const venuesQuery = useAdminVenues(venuesFilter);
  const verificationMutation = useUpdateAdminVenueVerification();
  const statusMutation = useUpdateAdminVenueStatus();
  const featuredMutation = useUpdateAdminVenueFeatured();
  const [selectedVenue, setSelectedVenue] = useState(null);

  const stats = venuesQuery.data?.stats || {};
  const venues = venuesQuery.data?.data || [];
  const cityBreakdown = venuesQuery.data?.breakdowns?.cities || [];
  const sportBreakdown = venuesQuery.data?.breakdowns?.sports || [];

  const metrics = useMemo(
    () => [
      {
        title: "Venue network",
        value: stats.total || 0,
        hint: `${stats.active || 0} active, ${stats.inactive || 0} inactive`,
        icon: Building2,
        trend: "neutral",
      },
      {
        title: "Verified courts",
        value: stats.verified || 0,
        hint: `${stats.unverified || 0} still need checks`,
        icon: ShieldCheck,
        trend: "up",
      },
      {
        title: "Booking revenue",
        value: formatMoney(stats.bookingRevenue || 0),
        hint: `${stats.confirmedBookings || 0} confirmed bookings`,
        icon: Wallet,
        trend: "up",
      },
      {
        title: "Image coverage",
        value: stats.withImages || 0,
        hint: `${stats.featured || 0} featured venues`,
        icon: ImageIcon,
        trend: "neutral",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Venue Governance"
        description="Verify venue trust, surface standout places, and keep booking inventory healthy."
      />

      <AdminMetricGrid items={metrics} />

      <section className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-sky-500/10 via-background to-emerald-500/10 shadow-sm">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr] lg:p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Ground quality radar</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The best venue listings combine verified ownership, clear photos, reliable sports coverage, and booking activity.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Capacity" value={(stats.totalCapacity || 0).toLocaleString("en-IN")} />
              <MiniStat label="Bookings" value={stats.totalBookings || 0} />
              <MiniStat label="Featured" value={stats.featured || 0} />
              <MiniStat label="With images" value={stats.withImages || 0} />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background/80 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Top cities</p>
              <div className="space-y-2">
                {cityBreakdown.slice(0, 4).map((item) => (
                  <div key={item.city} className="flex items-center justify-between text-sm">
                    <span className="truncate">{item.city}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
                {cityBreakdown.length === 0 ? <p className="text-sm text-muted-foreground">No city data yet.</p> : null}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Sports coverage</p>
              <div className="space-y-2">
                {sportBreakdown.slice(0, 4).map((item) => (
                  <div key={item.sport} className="flex items-center justify-between text-sm">
                    <span className="truncate">{item.sport}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
                {sportBreakdown.length === 0 ? <p className="text-sm text-muted-foreground">No sport tags yet.</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search venue, address, description"
              value={venuesFilter.search}
              onChange={(event) => updateFilter("venues", { search: event.target.value, page: 1 })}
            />
          </div>

          <Select value={venuesFilter.isVerified} onValueChange={(value) => updateFilter("venues", { isVerified: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trust states</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={venuesFilter.isActive} onValueChange={(value) => updateFilter("venues", { isActive: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="City"
            value={venuesFilter.city}
            onChange={(event) => updateFilter("venues", { city: event.target.value, page: 1 })}
          />

          <Button variant="outline" onClick={() => resetFilter("venues")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {venuesQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : venues.length ? (
        <div className="space-y-4">
          {venues.map((venue) => (
            <Card key={venue._id} className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="grid min-h-[230px] sm:grid-cols-[240px_1fr]">
                  <div className="relative min-h-[190px]">
                    <VenueImage venue={venue} />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <AdminStatusBadge value={venue.isActive ? "active" : "suspended"} />
                      <AdminStatusBadge value={venue.isVerified ? "verified" : "unverified"} />
                      {venue.isFeatured ? <AdminStatusBadge value="featured" /> : null}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 rounded-md bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                      <span className="line-clamp-1">{venue.location?.address || venue.location?.city || "No address"}</span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 p-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">{venue.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="truncate">{[venue.location?.city, venue.location?.state].filter(Boolean).join(", ") || "Unknown city"}</span>
                          </p>
                        </div>
                        <div className="rounded-md border border-border/60 bg-background px-3 py-1 text-right">
                          <p className="text-[11px] text-muted-foreground">Hourly</p>
                          <p className="text-sm font-semibold">{formatMoney(venue.pricing?.hourlyRate)}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{venue.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <MiniStat label="Rating" value={`${venue.averageRating || 0} (${venue.ratingsCount || 0})`} />
                      <MiniStat label="Bookings" value={venue.totalBookings || 0} />
                      <MiniStat label="Capacity" value={venue.capacity || 0} />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(venue.sports || []).slice(0, 5).map((sport) => (
                        <span key={sport} className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary">
                          {sport}
                        </span>
                      ))}
                      {venue.sports?.length > 5 ? (
                        <span className="rounded-full border border-border/60 px-2 py-1 text-[11px] text-muted-foreground">+{venue.sports.length - 5}</span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-2 border-t border-border/60 pt-3 sm:grid-cols-4">
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
                          <SelectValue />
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1">
                        <span className="text-xs text-muted-foreground">Feature</span>
                        <Switch
                          checked={Boolean(venue.isFeatured)}
                          onCheckedChange={(checked) => featuredMutation.mutate({ venueId: venue._id, isFeatured: checked })}
                        />
                      </div>

                      <Button type="button" variant="outline" size="sm" onClick={() => setSelectedVenue(venue)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div>
            <AdminPagination pagination={venuesQuery.data?.pagination} onPageChange={(page) => updateFilter("venues", { page })} />
          </div>
        </div>
      ) : (
        <AdminEmptyState title="No venues found" description="Try changing city, verification, or active filters." />
      )}

      <Dialog open={Boolean(selectedVenue)} onOpenChange={(open) => (!open ? setSelectedVenue(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{selectedVenue?.name || "Venue details"}</DialogTitle>
            <DialogDescription>{selectedVenue?.description || "No description provided"}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {selectedVenue ? (
              <div className="space-y-4 text-sm">
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <div className="h-60">
                    <VenueImage venue={selectedVenue} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="City" value={selectedVenue.location?.city || "-"} />
                  <MiniStat label="Country" value={selectedVenue.location?.country || "-"} />
                  <MiniStat label="Hourly rate" value={formatMoney(selectedVenue.pricing?.hourlyRate)} />
                  <MiniStat label="Day rate" value={formatMoney(selectedVenue.pricing?.dayRate)} />
                  <MiniStat label="Capacity" value={selectedVenue.capacity || 0} />
                  <MiniStat label="Images" value={selectedVenue.imageCount || 0} />
                  <MiniStat label="Bookings" value={selectedVenue.totalBookings || 0} />
                  <MiniStat label="Revenue" value={formatMoney(selectedVenue.bookingRevenue || 0)} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Address</p>
                    <p className="mt-1 font-medium">{selectedVenue.location?.address || "-"}</p>
                    <p className="text-muted-foreground">
                      {[selectedVenue.location?.city, selectedVenue.location?.state, selectedVenue.location?.country].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Owner</p>
                    <p className="mt-1 font-medium">{selectedVenue.owner?.name || "Unknown owner"}</p>
                    <p className="text-muted-foreground">{selectedVenue.owner?.email || "No email"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Contact</p>
                    <p className="mt-1">{selectedVenue.contactInfo?.phone || "No phone"}</p>
                    <p className="text-muted-foreground">{selectedVenue.contactInfo?.email || "No email"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Moderation</p>
                    <p className="mt-1">{selectedVenue.moderation?.note || "No internal note"}</p>
                    <p className="text-muted-foreground">Featured: {selectedVenue.isFeatured ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{selectedVenue.confirmedBookings || 0} confirmed bookings</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <span>{selectedVenue.pendingBookings || 0} pending bookings</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Star className="h-4 w-4 text-primary" />
                    <span>{selectedVenue.averageRating || 0} average rating</span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedVenue.amenities || []).map((amenity) => (
                      <span
                        key={amenity.name}
                        className={`rounded-full border px-2 py-1 text-xs ${
                          amenity.available
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border/60 bg-background text-muted-foreground"
                        }`}
                      >
                        {amenity.name}
                      </span>
                    ))}
                    {selectedVenue.amenities?.length ? null : <span className="text-muted-foreground">No amenities listed.</span>}
                  </div>
                </div>

                {Array.isArray(selectedVenue.images) && selectedVenue.images.length > 1 ? (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Gallery</p>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {selectedVenue.images.slice(0, 8).map((image) => (
                        <img
                          key={image.public_id || image.url}
                          src={image.url}
                          alt={image.caption || selectedVenue.name}
                          className="h-24 w-full rounded-md object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-3 text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>No extra venue gallery images available.</span>
                  </div>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVenues;
