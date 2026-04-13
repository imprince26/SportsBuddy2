import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminEvents, useDeleteAdminEvent, useUpdateAdminEventStatus } from "@/hooks/admin/useAdminEvents";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const eventStatusOptions = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

const AdminEvents = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const eventsFilter = filters.events;

  const eventsQuery = useAdminEvents(eventsFilter);
  const updateStatusMutation = useUpdateAdminEventStatus();
  const deleteMutation = useDeleteAdminEvent();

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Event Operations"
        description="Moderate event lifecycle, quality, and operational compliance."
      />

      <Card className="rounded-2xl border-border/60 bg-card/70">
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
            <Card key={event._id} className="rounded-2xl border-border/60 bg-card/70">
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
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={event.status} />
                    <span className="text-xs text-muted-foreground">
                      Event date {event.date ? format(new Date(event.date), "dd MMM yyyy") : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    defaultValue={event.status}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({ eventId: event._id, status: value })
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
    </div>
  );
};

export default AdminEvents;
