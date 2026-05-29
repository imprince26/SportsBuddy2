import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Mail,
  MousePointerClick,
  Search,
  Send,
  Users,
} from "lucide-react";
import { notificationFormSchema } from "@/schemas/adminSchemas";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminNotificationRecipients,
  useAdminNotifications,
  useCreateAdminNotification,
  useSendAdminNotification,
} from "@/hooks/admin/useAdminNotifications";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const defaultFormValues = {
  title: "",
  message: "",
  type: "announcement",
  priority: "normal",
  recipients: "all",
  specificRecipientIds: [],
  scheduledAt: "",
  sendNow: false,
  metadata: {
    actionUrl: "",
    emailSent: true,
  },
};

const safeFormat = (date, pattern = "dd MMM yyyy hh:mm a") => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : format(parsed, pattern);
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-md border border-border/60 bg-background/80 px-3 py-2">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const AdminNotifications = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const notificationsFilter = filters.notifications;
  const [recipientSearch, setRecipientSearch] = useState("");
  const [specificRoleFilter, setSpecificRoleFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const form = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: defaultFormValues,
  });

  const notificationsQuery = useAdminNotifications(notificationsFilter);
  const recipientScope = form.watch("recipients");
  const trimmedRecipientSearch = recipientSearch.trim();
  const createMutation = useCreateAdminNotification();
  const sendMutation = useSendAdminNotification();

  useEffect(() => {
    if (recipientScope !== "specific") {
      const currentRecipients = form.getValues("specificRecipientIds") || [];
      if (currentRecipients.length > 0) {
        form.setValue("specificRecipientIds", [], { shouldValidate: true });
      }
      setRecipientSearch("");
      setSpecificRoleFilter("all");
    }
  }, [form, recipientScope]);

  const recipientsQuery = useAdminNotificationRecipients({
    limit: 500,
    search: trimmedRecipientSearch.length >= 2 ? trimmedRecipientSearch : undefined,
    role:
      recipientScope === "users"
        ? "user"
        : recipientScope === "admins"
          ? "admin"
          : recipientScope === "specific" && specificRoleFilter !== "all"
            ? specificRoleFilter
            : undefined,
  });

  const recipientOptions = useMemo(() => {
    const users = recipientsQuery.data?.data || [];
    return users.map((user) => ({
      id: user._id,
      label: `${user.name} (${user.email})`,
      role: user.role,
    }));
  }, [recipientsQuery.data]);

  const recipientOptionsByScope = useMemo(() => {
    let options = recipientOptions;

    if (recipientScope === "admins") options = options.filter((option) => option.role === "admin");
    if (recipientScope === "users") options = options.filter((option) => option.role === "user");
    if (recipientScope === "specific" && specificRoleFilter !== "all") {
      options = options.filter((option) => option.role === specificRoleFilter);
    }
    if (trimmedRecipientSearch.length === 1) {
      const normalizedSearch = trimmedRecipientSearch.toLowerCase();
      options = options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
    }

    return options;
  }, [recipientOptions, recipientScope, specificRoleFilter, trimmedRecipientSearch]);

  const notifications = notificationsQuery.data?.data || [];
  const stats = notificationsQuery.data?.stats || {};
  const recipientBreakdown = notificationsQuery.data?.breakdowns?.recipients || [];
  const selectedRecipients = form.watch("specificRecipientIds") || [];

  const metrics = useMemo(
    () => [
      {
        title: "Messages",
        value: stats.total || 0,
        hint: `${stats.sent || 0} sent, ${stats.scheduled || 0} scheduled`,
        icon: Bell,
        trend: "neutral",
      },
      {
        title: "Recipients",
        value: (stats.totalRecipients || 0).toLocaleString("en-IN"),
        hint: `${stats.deliveryRate || 0}% delivery rate`,
        icon: Users,
        trend: "up",
      },
      {
        title: "Read rate",
        value: `${stats.readRate || 0}%`,
        hint: `${stats.read || 0} reads`,
        icon: CheckCircle2,
        trend: "up",
      },
      {
        title: "Clicks",
        value: stats.clicks || 0,
        hint: `${stats.highPriority || 0} high priority`,
        icon: MousePointerClick,
        trend: "neutral",
      },
    ],
    [stats]
  );

  const toggleRecipient = (id) => {
    const current = form.getValues("specificRecipientIds") || [];
    if (current.includes(id)) {
      form.setValue(
        "specificRecipientIds",
        current.filter((entry) => entry !== id),
        { shouldValidate: true }
      );
      return;
    }
    form.setValue("specificRecipientIds", [...current, id], { shouldValidate: true });
  };

  const handleCreate = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      metadata: {
        actionUrl: values.metadata.actionUrl || undefined,
        emailSent: values.metadata.emailSent,
      },
      scheduledAt: values.scheduledAt || undefined,
    };

    await createMutation.mutateAsync(payload);
    form.reset(defaultFormValues);
  });

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Notification Center"
        description="Compose, schedule, and dispatch SportsBuddy communication with delivery and engagement visibility."
      />

      <AdminMetricGrid items={metrics} />

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_380px]">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Compose Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  value={form.watch("title")}
                  onChange={(event) => form.setValue("title", event.target.value, { shouldValidate: true })}
                  placeholder="Weekend venue slots are live"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Priority</Label>
                  <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={form.watch("message")}
                onChange={(event) => form.setValue("message", event.target.value, { shouldValidate: true })}
                placeholder="Write the message players will see."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Recipients</Label>
                <Select value={form.watch("recipients")} onValueChange={(value) => form.setValue("recipients", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="users">Only users</SelectItem>
                    <SelectItem value="admins">Only admins</SelectItem>
                    <SelectItem value="specific">Specific users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Schedule at</Label>
                <Input
                  type="datetime-local"
                  value={form.watch("scheduledAt") || ""}
                  onChange={(event) => form.setValue("scheduledAt", event.target.value, { shouldValidate: true })}
                />
              </div>
              <div className="space-y-1">
                <Label>Action URL</Label>
                <Input
                  placeholder="https://example.com/path"
                  value={form.watch("metadata.actionUrl") || ""}
                  onChange={(event) => form.setValue("metadata.actionUrl", event.target.value, { shouldValidate: true })}
                />
              </div>
            </div>

            {recipientScope === "specific" ? (
              <div className="space-y-2 rounded-lg border border-border/60 bg-background/70 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
                  <Input placeholder="Search recipients" value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} />
                  <Select value={specificRoleFilter} onValueChange={setSpecificRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="user">Users only</SelectItem>
                      <SelectItem value="admin">Admins only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{selectedRecipients.length} selected</span>
                  {trimmedRecipientSearch.length === 1 ? <span>Type 2+ chars for server search</span> : null}
                </div>

                <ScrollArea className="h-48 rounded-md border border-border/60 bg-card p-3">
                  {recipientsQuery.isLoading ? (
                    <p className="text-xs text-muted-foreground">Loading recipients...</p>
                  ) : recipientOptionsByScope.length ? (
                    <div className="space-y-2">
                      {recipientOptionsByScope.map((option) => (
                        <label key={option.id} className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
                          <Checkbox checked={selectedRecipients.includes(option.id)} onCheckedChange={() => toggleRecipient(option.id)} />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No active recipients match this scope.</p>
                  )}
                </ScrollArea>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <Checkbox
                    checked={Boolean(form.watch("sendNow"))}
                    onCheckedChange={(value) => form.setValue("sendNow", Boolean(value), { shouldValidate: true })}
                  />
                  Send immediately
                </label>
                <label className="flex items-center gap-2 text-muted-foreground">
                  <Checkbox
                    checked={Boolean(form.watch("metadata.emailSent"))}
                    onCheckedChange={(value) => form.setValue("metadata.emailSent", Boolean(value), { shouldValidate: true })}
                  />
                  Send email copy
                </label>
              </div>

              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                <Mail className="mr-2 h-4 w-4" />
                Save Notification
              </Button>
            </div>

            {Object.values(form.formState.errors).map((error) => (
              <p key={error.message} className="text-xs text-rose-600">
                {error.message}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Audience Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recipientBreakdown.length ? (
              recipientBreakdown.map((item) => (
                <div key={item.recipients} className="flex items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm">
                  <span>{item.recipients}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Audience data appears after notifications exist.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[1.4fr_0.75fr_0.75fr_0.75fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search title or message"
              value={notificationsFilter.search}
              onChange={(event) => updateFilter("notifications", { search: event.target.value, page: 1 })}
            />
          </div>
          <Select value={notificationsFilter.status} onValueChange={(value) => updateFilter("notifications", { status: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={notificationsFilter.type} onValueChange={(value) => updateFilter("notifications", { type: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={notificationsFilter.priority} onValueChange={(value) => updateFilter("notifications", { priority: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => resetFilter("notifications")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {notificationsQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification._id} className="rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                      <AdminStatusBadge value={notification.status} />
                      <AdminStatusBadge value={notification.priority} />
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-4xl text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created by {notification.createdBy?.name || "Unknown"} on {safeFormat(notification.createdAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
                    <MiniStat label="Recipients" value={notification.recipientCount || 0} />
                    <MiniStat label="Delivered" value={notification.deliveredCount || 0} />
                    <MiniStat label="Read" value={`${notification.calculatedReadRate || 0}%`} />
                    <MiniStat label="Clicks" value={notification.statistics?.clicks || 0} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {notification.scheduledAt ? `Scheduled ${safeFormat(notification.scheduledAt)}` : "No schedule"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedNotification(notification)}>
                    <Eye className="mr-1 h-4 w-4" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={notification.status === "sent" || sendMutation.isPending}
                    onClick={() => sendMutation.mutate(notification._id)}
                  >
                    <Send className="mr-1 h-4 w-4" />
                    Send now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination pagination={notificationsQuery.data?.pagination} onPageChange={(page) => updateFilter("notifications", { page })} />
        </div>
      ) : (
        <AdminEmptyState title="No notifications" description="Create your first operational notification." />
      )}

      <Dialog open={Boolean(selectedNotification)} onOpenChange={(open) => (!open ? setSelectedNotification(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{selectedNotification?.title || "Notification details"}</DialogTitle>
            <DialogDescription>{selectedNotification?.message || "No message"}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {selectedNotification ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="Status" value={selectedNotification.status} />
                  <MiniStat label="Type" value={selectedNotification.type} />
                  <MiniStat label="Recipients" value={selectedNotification.recipientCount || 0} />
                  <MiniStat label="Read rate" value={`${selectedNotification.calculatedReadRate || 0}%`} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Schedule</p>
                    <p className="mt-1">Scheduled {safeFormat(selectedNotification.scheduledAt)}</p>
                    <p className="text-muted-foreground">Sent {safeFormat(selectedNotification.sentAt)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Delivery</p>
                    <p className="mt-1">{selectedNotification.deliveredCount || 0} delivered</p>
                    <p className="text-muted-foreground">{selectedNotification.failedCount || 0} failed</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3 md:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Action URL</p>
                    <p className="mt-1 break-all">{selectedNotification.actionUrl || "No action URL"}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;
