import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { notificationFormSchema } from "@/schemas/adminSchemas";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminNotifications,
  useCreateAdminNotification,
  useSendAdminNotification,
} from "@/hooks/admin/useAdminNotifications";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

const AdminNotifications = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const notificationsFilter = filters.notifications;

  const notificationsQuery = useAdminNotifications(notificationsFilter);
  const usersQuery = useAdminUsers({ page: 1, limit: 100, accountStatus: "active" });
  const createMutation = useCreateAdminNotification();
  const sendMutation = useSendAdminNotification();

  const form = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: defaultFormValues,
  });

  const recipientOptions = useMemo(() => {
    const users = usersQuery.data?.data || [];
    return users.map((user) => ({
      id: user._id,
      label: `${user.name} (${user.email})`,
    }));
  }, [usersQuery.data]);

  const selectedRecipients = form.watch("specificRecipientIds") || [];

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
    <div className="space-y-4">
      <AdminSectionHeader
        title="Notification Center"
        description="Create high-impact communication flows for users and admins."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card className="rounded-2xl border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Compose Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  value={form.watch("title")}
                  onChange={(event) => form.setValue("title", event.target.value, { shouldValidate: true })}
                />
              </div>

              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value, { shouldValidate: true })}
                >
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
            </div>

            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={form.watch("message")}
                onChange={(event) => form.setValue("message", event.target.value, { shouldValidate: true })}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) => form.setValue("priority", value, { shouldValidate: true })}
                >
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

              <div className="space-y-1">
                <Label>Recipients</Label>
                <Select
                  value={form.watch("recipients")}
                  onValueChange={(value) => form.setValue("recipients", value, { shouldValidate: true })}
                >
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
            </div>

            {form.watch("recipients") === "specific" ? (
              <div className="max-h-40 space-y-2 overflow-auto rounded-xl border border-border/60 bg-secondary/30 p-3">
                {recipientOptions.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
                    <Checkbox
                      checked={selectedRecipients.includes(option.id)}
                      onCheckedChange={() => toggleRecipient(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Schedule at (optional)</Label>
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

            <div className="flex flex-wrap items-center gap-4 text-xs">
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
                  onCheckedChange={(value) =>
                    form.setValue("metadata.emailSent", Boolean(value), { shouldValidate: true })
                  }
                />
                Send email copy
              </label>
            </div>

            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Save Notification
            </Button>

            {form.formState.errors.title ? <p className="text-xs text-rose-600">{form.formState.errors.title.message}</p> : null}
            {form.formState.errors.message ? (
              <p className="text-xs text-rose-600">{form.formState.errors.message.message}</p>
            ) : null}
            {form.formState.errors.specificRecipientIds ? (
              <p className="text-xs text-rose-600">{form.formState.errors.specificRecipientIds.message}</p>
            ) : null}
            {form.formState.errors.scheduledAt ? (
              <p className="text-xs text-rose-600">{form.formState.errors.scheduledAt.message}</p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border/60 bg-card/70">
            <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
              <Input
                placeholder="Search notifications"
                value={notificationsFilter.search}
                onChange={(event) => updateFilter("notifications", { search: event.target.value, page: 1 })}
              />
              <Select
                value={notificationsFilter.status}
                onValueChange={(value) => updateFilter("notifications", { status: value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {notificationsQuery.isLoading ? (
            <AdminLoadingBlock rows={5} />
          ) : notificationsQuery.data?.data?.length ? (
            <div className="space-y-3">
              {notificationsQuery.data.data.map((notification) => (
                <Card key={notification._id} className="rounded-2xl border-border/60 bg-card/70">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{notification.title}</p>
                      <AdminStatusBadge value={notification.status} />
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Created {notification.createdAt ? format(new Date(notification.createdAt), "dd MMM yyyy") : "-"}
                      </span>
                      <span>{notification.priority}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={notification.status === "sent" || sendMutation.isPending}
                      onClick={() => sendMutation.mutate(notification._id)}
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Send now
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <AdminPagination
                pagination={notificationsQuery.data?.pagination}
                onPageChange={(page) => updateFilter("notifications", { page })}
              />
            </div>
          ) : (
            <AdminEmptyState title="No notifications" description="Create your first operational notification." />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
