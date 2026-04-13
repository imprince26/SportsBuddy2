import { useState } from "react";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminEvents,
  useDeleteAdminEvent,
  useUpdateAdminEventFeatured,
  useUpdateAdminEventStatus,
} from "@/hooks/admin/useAdminEvents";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const eventStatusOptions = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

const AdminEvents = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const eventsFilter = filters.events;

  const eventsQuery = useAdminEvents(eventsFilter);
  const updateStatusMutation = useUpdateAdminEventStatus();
  const updateFeaturedMutation = useUpdateAdminEventFeatured();
  const deleteMutation = useDeleteAdminEvent();
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Event Operations"
        description="Moderate event lifecycle, quality, and operational compliance."
      />

      <Card className="rounded-2xl border-border/60 bg-card">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <Input
            placeholder="Search event name, city"
            value={eventsFilter.search}
            onChange={(event) => updateFilter("events", { search: event.target.value, page: 1 })}
          />

          <Select
            value={eventsFilter.status}
            onValueChange={(value) => updateFilter("events", { status: value, page: 1 })}
          >
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

          <Select
            value={eventsFilter.sortBy}
            onValueChange={(value) => updateFilter("events", { sortBy: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="date:asc">Event date near</SelectItem>
              <SelectItem value="date:desc">Event date far</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => updateFilter("events", { page: 1, search: "", status: "all" })}>
            Reset
          </Button>
        </CardContent>
      </Card>

      {eventsQuery.isLoading ? (
        <AdminLoadingBlock rows={6} />
      ) : eventsQuery.data?.data?.length ? (
        <div className="space-y-3">
          {eventsQuery.data.data.map((event) => (
            <Card key={event._id} className="rounded-2xl border-border/60 bg-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.location?.city || "Unknown city"} - {event.category || "General"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created by {event.createdBy?.name || "Unknown"} on{" "}
                      {event.createdAt ? format(new Date(event.createdAt), "dd MMM yyyy") : "-"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Participants: {event.participantCount || 0}</span>
                      <span>Waitlist: {event.waitlistCount || 0}</span>
                      <span>Rating: {event.averageRating || 0} ({event.ratingsCount || 0})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={event.status} />
                    {event.isFeatured ? <AdminStatusBadge value="featured" /> : null}
                    <span className="text-xs text-muted-foreground">
                      Event date {event.date ? format(new Date(event.date), "dd MMM yyyy") : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 px-2 py-1">
                    <span className="text-xs text-muted-foreground">Featured</span>
                    <Switch
                      checked={Boolean(event.isFeatured)}
                      onCheckedChange={(checked) =>
                        updateFeaturedMutation.mutate({ eventId: event._id, isFeatured: checked })
                      }
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
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="Update status" />
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
                    View details
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(event._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={eventsQuery.data?.pagination}
            onPageChange={(page) => updateFilter("events", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No events found" description="Try a wider date or status filter." />
      )}

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => (!open ? setSelectedEvent(null) : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name || "Event details"}</DialogTitle>
            <DialogDescription>{selectedEvent?.description || "No description provided"}</DialogDescription>
          </DialogHeader>

          {selectedEvent ? (
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{selectedEvent.category || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Difficulty</p>
                <p className="font-medium">{selectedEvent.difficulty || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Registration fee</p>
                <p className="font-medium">Rs {Math.round(selectedEvent.registrationFee || 0)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-medium">{selectedEvent.maxParticipants || 0}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">
                  {selectedEvent.location?.address || "-"}, {selectedEvent.location?.city || "-"}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
