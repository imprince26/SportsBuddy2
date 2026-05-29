import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Camera,
  Eye,
  Filter,
  MapPin,
  Medal,
  Search,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminEvents,
  useDeleteAdminEvent,
  useUpdateAdminEventFeatured,
  useUpdateAdminEventStatus,
} from "@/hooks/admin/useAdminEvents";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const eventStatusOptions = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const categoryOptions = ["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"];

const safeFormat = (date, pattern = "dd MMM yyyy") => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : format(parsed, pattern);
};

const formatMoney = (value = 0) => `Rs ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const getEventImage = (event) => event?.primaryImage?.url || event?.images?.[0]?.url || "";

const MiniStat = ({ label, value }) => (
  <div className="rounded-md border border-border/60 bg-background/80 px-3 py-2">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const EventImage = ({ event, className = "" }) => {
  const imageUrl = getEventImage(event);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={event?.name || "Event"}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-sky-100 to-emerald-100 dark:from-primary/25 dark:via-slate-900 dark:to-emerald-950 ${className}`}>
      <Trophy className="h-10 w-10 text-primary/70" />
    </div>
  );
};

const AdminEvents = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const eventsFilter = filters.events;
  const eventsQuery = useAdminEvents(eventsFilter);
  const updateStatusMutation = useUpdateAdminEventStatus();
  const updateFeaturedMutation = useUpdateAdminEventFeatured();
  const deleteMutation = useDeleteAdminEvent();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const stats = eventsQuery.data?.stats || {};
  const events = eventsQuery.data?.data || [];

  const metrics = useMemo(
    () => [
      {
        title: "Live pipeline",
        value: (stats.upcoming || 0) + (stats.ongoing || 0),
        hint: `${stats.total || 0} events in this view`,
        icon: CalendarDays,
        trend: "up",
      },
      {
        title: "Fill rate",
        value: `${stats.fillRate || 0}%`,
        hint: `${stats.totalParticipants || 0} players of ${stats.totalCapacity || 0} slots`,
        icon: Users,
        trend: "neutral",
      },
      {
        title: "Featured plays",
        value: stats.featured || 0,
        hint: `${stats.withImages || 0} have event images`,
        icon: Sparkles,
        trend: "up",
      },
      {
        title: "Paid events",
        value: stats.paidEvents || 0,
        hint: `${stats.freeEvents || 0} free events`,
        icon: Ticket,
        trend: "neutral",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Event Operations"
        description="A visual control room for schedule quality, capacity, creator trust, and event lifecycle decisions."
      />

      <AdminMetricGrid items={metrics} />

      <section className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-emerald-500/10 shadow-sm">
        <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr] lg:p-5">
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Match calendar command board</h3>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Use imagery, capacity pressure, and status signals together so weak listings stand out before players see them.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Upcoming" value={stats.upcoming || 0} />
              <MiniStat label="Ongoing" value={stats.ongoing || 0} />
              <MiniStat label="Waitlist" value={stats.totalWaitlist || 0} />
              <MiniStat label="Cancelled" value={stats.cancelled || 0} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {events.slice(0, 3).map((event) => (
              <div key={event._id} className="relative min-h-28 overflow-hidden rounded-lg border border-background/70 bg-card shadow-sm">
                <EventImage event={event} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="truncate text-xs font-semibold text-white">{event.name}</p>
                  <p className="truncate text-[11px] text-white/80">{event.location?.city || "No city"}</p>
                </div>
              </div>
            ))}
            {events.length === 0 ? (
              <div className="col-span-3 flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border/70 text-sm text-muted-foreground">
                Event images will appear here
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search event, description, city"
              value={eventsFilter.search}
              onChange={(event) => updateFilter("events", { search: event.target.value, page: 1 })}
            />
          </div>

          <Select value={eventsFilter.status} onValueChange={(value) => updateFilter("events", { status: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {eventStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventsFilter.category} onValueChange={(value) => updateFilter("events", { category: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sports</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventsFilter.sortBy} onValueChange={(value) => updateFilter("events", { sortBy: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="date:asc">Event date near</SelectItem>
              <SelectItem value="date:desc">Event date far</SelectItem>
              <SelectItem value="name:asc">Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => resetFilter("events")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {eventsQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : events.length ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event._id} className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="grid min-h-[220px] sm:grid-cols-[220px_1fr]">
                  <div className="relative min-h-[180px]">
                    <EventImage event={event} />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <AdminStatusBadge value={event.status} />
                      {event.isFeatured ? <AdminStatusBadge value="featured" /> : null}
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                      {safeFormat(event.date)}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">{event.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="truncate">{event.location?.city || "Unknown city"} - {event.category || "General"}</span>
                          </p>
                        </div>
                        <div className="rounded-md border border-border/60 bg-background px-3 py-1 text-right">
                          <p className="text-[11px] text-muted-foreground">Fee</p>
                          <p className="text-sm font-semibold">{formatMoney(event.registrationFee)}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <MiniStat label="Players" value={`${event.participantCount || 0}/${event.maxParticipants || 0}`} />
                      <MiniStat label="Waitlist" value={event.waitlistCount || 0} />
                      <MiniStat label="Rating" value={`${event.averageRating || 0} (${event.ratingsCount || 0})`} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Capacity pressure</span>
                        <span>{event.fillRate || 0}%</span>
                      </div>
                      <Progress value={event.fillRate || 0} className="h-2" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      <div className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1">
                        <span className="text-xs text-muted-foreground">Featured</span>
                        <Switch
                          checked={Boolean(event.isFeatured)}
                          onCheckedChange={(checked) => updateFeaturedMutation.mutate({ eventId: event._id, isFeatured: checked })}
                        />
                      </div>

                      <Select
                        defaultValue={event.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({
                            eventId: event._id,
                            status: value,
                            note: `Status changed to ${value} by admin`,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Button>

                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(event._id)} disabled={deleteMutation.isPending}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div>
            <AdminPagination pagination={eventsQuery.data?.pagination} onPageChange={(page) => updateFilter("events", { page })} />
          </div>
        </div>
      ) : (
        <AdminEmptyState title="No events found" description="Try a wider sport, date, or status filter." />
      )}

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => (!open ? setSelectedEvent(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{selectedEvent?.name || "Event details"}</DialogTitle>
            <DialogDescription>{selectedEvent?.description || "No description provided"}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {selectedEvent ? (
              <div className="space-y-4 text-sm">
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <div className="h-56">
                    <EventImage event={selectedEvent} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="Sport" value={selectedEvent.category || "-"} />
                  <MiniStat label="Difficulty" value={selectedEvent.difficulty || "-"} />
                  <MiniStat label="Event type" value={selectedEvent.eventType || "casual"} />
                  <MiniStat label="Images" value={selectedEvent.imageCount || 0} />
                  <MiniStat label="Date" value={safeFormat(selectedEvent.date, "dd MMM yyyy hh:mm a")} />
                  <MiniStat label="Time" value={selectedEvent.time || "-"} />
                  <MiniStat label="Fee" value={formatMoney(selectedEvent.registrationFee)} />
                  <MiniStat label="Capacity" value={`${selectedEvent.participantCount || 0}/${selectedEvent.maxParticipants || 0}`} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Location</p>
                    <p className="mt-1 font-medium">{selectedEvent.location?.address || "-"}</p>
                    <p className="text-muted-foreground">
                      {[selectedEvent.location?.city, selectedEvent.location?.state].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Created by</p>
                    <p className="mt-1 font-medium">{selectedEvent.createdBy?.name || "Unknown"}</p>
                    <p className="text-muted-foreground">{selectedEvent.createdBy?.email || "No email"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Linked venue</p>
                    <p className="mt-1 font-medium">{selectedEvent.venue?.name || "No venue linked"}</p>
                    <p className="text-muted-foreground">{selectedEvent.venue?.location?.city || ""}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Community</p>
                    <p className="mt-1 font-medium">{selectedEvent.community?.name || "Standalone event"}</p>
                    <p className="text-muted-foreground">Featured: {selectedEvent.isFeatured ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.participantCount || 0} confirmed players</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Medal className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.waitlistCount || 0} waiting</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Star className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.averageRating || 0} rating</span>
                  </div>
                </div>

                {Array.isArray(selectedEvent.images) && selectedEvent.images.length > 1 ? (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Gallery</p>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {selectedEvent.images.slice(0, 8).map((image) => (
                        <img
                          key={image.public_id || image.url}
                          src={image.url}
                          alt={image.caption || selectedEvent.name}
                          className="h-24 w-full rounded-md object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-3 text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    <span>No extra event gallery images available.</span>
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

export default AdminEvents;
