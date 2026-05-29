import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Activity,
  Award,
  Ban,
  Bell,
  CalendarDays,
  Crown,
  Eye,
  Filter,
  Mail,
  MapPin,
  Search,
  Shield,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import { userNotificationSchema, userRoleSchema, userStatusSchema } from "@/schemas/adminSchemas";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminUserDetails,
  useAdminUsers,
  useSendAdminUserNotification,
  useUpdateAdminUserRole,
  useUpdateAdminUserStatus,
} from "@/hooks/admin/useAdminUsers";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "user", label: "Players" },
  { value: "admin", label: "Admins" },
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name A-Z" },
  { value: "lastLoginAt:desc", label: "Latest login" },
];

const notificationTypes = [
  { value: "system", label: "System" },
  { value: "announcement", label: "Announcement" },
  { value: "event", label: "Event" },
  { value: "marketing", label: "Marketing" },
];

const safeFormat = (date, pattern = "dd MMM yyyy") => {
  if (!date) return "-";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? "-" : format(parsedDate, pattern);
};

const getPrimarySport = (user) => {
  const preference = Array.isArray(user?.sportsPreferences) ? user.sportsPreferences[0] : null;
  if (!preference?.sport) return "Multi-sport";
  return preference.skillLevel ? `${preference.sport} - ${preference.skillLevel}` : preference.sport;
};

const getLocationLabel = (location) => {
  return [location?.city, location?.state].filter(Boolean).join(", ") || "Location not set";
};

const StatPill = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
    <Icon className="h-4 w-4 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const AdminUsers = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const usersFilter = filters.users;
  const usersQuery = useAdminUsers(usersFilter);
  const updateRoleMutation = useUpdateAdminUserRole();
  const updateStatusMutation = useUpdateAdminUserStatus();
  const sendNotificationMutation = useSendAdminUserNotification();

  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const detailsQuery = useAdminUserDetails(detailsUser?._id);

  const roleForm = useForm({
    resolver: zodResolver(userRoleSchema),
    defaultValues: { role: "user" },
  });

  const statusForm = useForm({
    resolver: zodResolver(userStatusSchema),
    defaultValues: { accountStatus: "active", reason: "", note: "" },
  });

  const notificationForm = useForm({
    resolver: zodResolver(userNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "system",
      priority: "normal",
      actionUrl: "",
    },
  });

  const metrics = useMemo(() => {
    const stats = usersQuery.data?.stats || {};
    const moderated = (stats.suspended || 0) + (stats.banned || 0);

    return [
      {
        title: "Total roster",
        value: stats.total ?? usersQuery.data?.pagination?.total ?? 0,
        hint: "All SportsBuddy accounts",
        icon: Users,
        trend: "neutral",
      },
      {
        title: "Active players",
        value: stats.active ?? 0,
        hint: "Ready for events and venues",
        icon: Activity,
        trend: "up",
      },
      {
        title: "Moderation bench",
        value: moderated,
        hint: `${stats.suspended || 0} suspended, ${stats.banned || 0} banned`,
        icon: Ban,
        trend: moderated > 0 ? "down" : "neutral",
      },
      {
        title: "Admin captains",
        value: stats.admins ?? 0,
        hint: `${stats.newLast30Days || 0} new users in 30 days`,
        icon: Crown,
        trend: "neutral",
      },
    ];
  }, [usersQuery.data]);

  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setDialogType("role");
    roleForm.reset({ role: user.role || "user" });
  };

  const openStatusDialog = (user) => {
    setSelectedUser(user);
    setDialogType("status");
    statusForm.reset({
      accountStatus: user.accountStatus || "active",
      reason: user.moderation?.reason || "",
      note: user.moderation?.note || "",
    });
  };

  const openNotificationDialog = (user) => {
    setSelectedUser(user);
    setDialogType("notification");
    notificationForm.reset({
      title: "",
      message: "",
      type: "system",
      priority: "normal",
      actionUrl: "",
    });
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedUser(null);
  };

  const handleRoleSubmit = roleForm.handleSubmit(async (values) => {
    if (!selectedUser?._id) return;
    await updateRoleMutation.mutateAsync({ userId: selectedUser._id, role: values.role });
    closeDialog();
  });

  const handleStatusSubmit = statusForm.handleSubmit(async (values) => {
    if (!selectedUser?._id) return;
    await updateStatusMutation.mutateAsync({
      userId: selectedUser._id,
      accountStatus: values.accountStatus,
      reason: values.reason,
      note: values.note,
    });
    closeDialog();
  });

  const handleNotificationSubmit = notificationForm.handleSubmit(async (values) => {
    if (!selectedUser?._id) return;
    await sendNotificationMutation.mutateAsync({
      userId: selectedUser._id,
      ...values,
      actionUrl: values.actionUrl || undefined,
    });
    closeDialog();
  });

  const detail = detailsQuery.data || detailsUser;

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="User Roster Control"
        description="Review athletes, protect the community, and keep SportsBuddy teams moving."
      />

      <AdminMetricGrid items={metrics} />

      <section className="rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-foreground">Match-day command center</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Search the roster, spot inactive accounts, update captain privileges, and send focused messages without
              leaving this workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
            <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground">Showing</p>
              <p className="font-semibold">{usersQuery.data?.data?.length || 0} users</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground">Page</p>
              <p className="font-semibold">{usersQuery.data?.pagination?.page || usersFilter.page}</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, username, email"
              value={usersFilter.search}
              onChange={(event) => updateFilter("users", { search: event.target.value, page: 1 })}
            />
          </div>

          <Select value={usersFilter.role} onValueChange={(value) => updateFilter("users", { role: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={usersFilter.accountStatus}
            onValueChange={(value) => updateFilter("users", { accountStatus: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={usersFilter.sortBy}
            onValueChange={(value) => updateFilter("users", { sortBy: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => resetFilter("users")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {usersQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : usersQuery.data?.data?.length ? (
        <div className="space-y-4">
          {usersQuery.data.data.map((user) => (
            <Card key={user._id} className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-14 w-14 border-2 border-background shadow-sm ring-1 ring-border/70">
                        <AvatarImage src={user.avatar?.url} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-foreground">{user.name || "Unnamed user"}</p>
                          {user.role === "admin" ? <Crown className="h-4 w-4 text-primary" /> : null}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">@{user.username || "unknown"}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email || "No email"}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <AdminStatusBadge value={user.accountStatus} />
                      <AdminStatusBadge value={user.role} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatPill icon={Trophy} label="Points" value={user.stats?.totalPoints || 0} />
                    <StatPill icon={CalendarDays} label="Created" value={user.stats?.eventsCreated || 0} />
                    <StatPill icon={Activity} label="Joined" value={user.stats?.eventsParticipated || 0} />
                    <StatPill icon={Award} label="Rank" value={user.stats?.currentRank || "-"} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="truncate">{getPrimarySport(user)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{getLocationLabel(user.location)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{user.followerCount || 0} followers</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bell className="h-4 w-4 text-primary" />
                      <span>{user.unreadNotificationsCount || 0} unread alerts</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Joined {safeFormat(user.createdAt)}</span>
                    <span>Last login {safeFormat(user.lastLoginAt)}</span>
                    {user.moderation?.reason ? <span>Reason: {user.moderation.reason}</span> : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                    <Button variant="outline" size="sm" onClick={() => setDetailsUser(user)}>
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openNotificationDialog(user)}>
                      <Mail className="mr-1 h-4 w-4" />
                      Notify
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openRoleDialog(user)}>
                      <Shield className="mr-1 h-4 w-4" />
                      Role
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openStatusDialog(user)}>
                      <UserCog className="mr-1 h-4 w-4" />
                      Status
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/profile/${user._id}`}>Public profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div>
            <AdminPagination
              pagination={usersQuery.data?.pagination}
              onPageChange={(page) => updateFilter("users", { page })}
            />
          </div>
        </div>
      ) : (
        <AdminEmptyState title="No users found" description="Adjust filters to discover user records." />
      )}

      <Dialog open={dialogType === "role"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent className="max-h-[88vh] rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Update role</DialogTitle>
            <DialogDescription>
              Change platform privileges for {selectedUser?.name || "this user"}.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={roleForm.watch("role")}
                  onValueChange={(value) => roleForm.setValue("role", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {roleForm.formState.errors.role ? (
                  <p className="text-xs text-rose-600">{roleForm.formState.errors.role.message}</p>
                ) : null}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={handleRoleSubmit} disabled={updateRoleMutation.isPending}>
                  Save role
                </Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogType === "status"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent className="max-h-[88vh] rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Update account status</DialogTitle>
            <DialogDescription>
              Moderate access for {selectedUser?.name || "this user"} and keep an audit trail.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select
                    value={statusForm.watch("accountStatus")}
                    onValueChange={(value) => statusForm.setValue("accountStatus", value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Reason</Label>
                  <Input
                    value={statusForm.watch("reason") || ""}
                    onChange={(event) => statusForm.setValue("reason", event.target.value, { shouldValidate: true })}
                    placeholder="Policy, payment, spam, safety"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Internal note</Label>
                  <Textarea
                    value={statusForm.watch("note") || ""}
                    onChange={(event) => statusForm.setValue("note", event.target.value, { shouldValidate: true })}
                    placeholder="Add context for the next admin reviewing this account"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={handleStatusSubmit} disabled={updateStatusMutation.isPending}>
                  Save status
                </Button>
              </DialogFooter>

              {statusForm.formState.errors.accountStatus ? (
                <p className="text-xs text-rose-600">{statusForm.formState.errors.accountStatus.message}</p>
              ) : null}
              {statusForm.formState.errors.reason ? (
                <p className="text-xs text-rose-600">{statusForm.formState.errors.reason.message}</p>
              ) : null}
              {statusForm.formState.errors.note ? (
                <p className="text-xs text-rose-600">{statusForm.formState.errors.note.message}</p>
              ) : null}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogType === "notification"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent className="max-h-[88vh] rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Send direct notification</DialogTitle>
            <DialogDescription>
              Reach {selectedUser?.name || "this user"} with an in-app SportsBuddy message.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Type</Label>
                    <Select
                      value={notificationForm.watch("type")}
                      onValueChange={(value) => notificationForm.setValue("type", value, { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Priority</Label>
                    <Select
                      value={notificationForm.watch("priority")}
                      onValueChange={(value) => notificationForm.setValue("priority", value, { shouldValidate: true })}
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
                </div>

                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    value={notificationForm.watch("title")}
                    onChange={(event) => notificationForm.setValue("title", event.target.value, { shouldValidate: true })}
                    placeholder="Venue booking update"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Message</Label>
                  <Textarea
                    value={notificationForm.watch("message")}
                    onChange={(event) => notificationForm.setValue("message", event.target.value, { shouldValidate: true })}
                    placeholder="Write a clear, helpful message for this user"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Action URL</Label>
                  <Input
                    value={notificationForm.watch("actionUrl") || ""}
                    onChange={(event) => notificationForm.setValue("actionUrl", event.target.value, { shouldValidate: true })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={handleNotificationSubmit} disabled={sendNotificationMutation.isPending}>
                  Send notification
                </Button>
              </DialogFooter>

              {Object.values(notificationForm.formState.errors).map((error) => (
                <p key={error.message} className="text-xs text-rose-600">
                  {error.message}
                </p>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detailsUser)} onOpenChange={(open) => (!open ? setDetailsUser(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{detail?.name || "User details"}</DialogTitle>
            <DialogDescription>{detail?.email || "No email"}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {detailsQuery.isLoading ? (
              <AdminLoadingBlock rows={4} />
            ) : detail ? (
              <div className="space-y-4 text-sm">
              <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-14 w-14 border border-border/70">
                    <AvatarImage src={detail.avatar?.url} />
                    <AvatarFallback>{detail.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">@{detail.username || "-"}</p>
                    <p className="truncate text-muted-foreground">{getPrimarySport(detail)}</p>
                    <p className="truncate text-muted-foreground">{getLocationLabel(detail.location)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge value={detail.role} />
                  <AdminStatusBadge value={detail.accountStatus} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatPill icon={Trophy} label="Points" value={detail.stats?.totalPoints || 0} />
                <StatPill icon={CalendarDays} label="Events created" value={detail.metrics?.createdEventsCount || detail.stats?.eventsCreated || 0} />
                <StatPill icon={Activity} label="Events joined" value={detail.metrics?.participatingEventsCount || detail.stats?.eventsParticipated || 0} />
                <StatPill icon={Award} label="Achievements" value={detail.stats?.achievementsCount || detail.achievements?.length || 0} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Timeline</p>
                  <p className="mt-1">Joined {safeFormat(detail.createdAt, "dd MMM yyyy hh:mm a")}</p>
                  <p>Last login {safeFormat(detail.lastLoginAt, "dd MMM yyyy hh:mm a")}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Network</p>
                  <p className="mt-1">{detail.followers?.length || detail.followerCount || 0} followers</p>
                  <p>{detail.following?.length || detail.followingCount || 0} following</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Contact</p>
                  <p className="mt-1">{detail.email || "-"}</p>
                  <p>{detail.phone || "No phone added"}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Moderation</p>
                  <p className="mt-1">{detail.moderation?.reason || "No active reason"}</p>
                  <p className="text-muted-foreground">{detail.moderation?.note || "No internal note"}</p>
                </div>
              </div>

              {detail.bio ? (
                <div className="rounded-lg border border-border/60 bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Bio</p>
                  <p className="mt-1 text-foreground">{detail.bio}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsUser(null);
                    openNotificationDialog(detail);
                  }}
                >
                  <Mail className="mr-1 h-4 w-4" />
                  Notify
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsUser(null);
                    openStatusDialog(detail);
                  }}
                >
                  <UserCog className="mr-1 h-4 w-4" />
                  Moderate
                </Button>
                <Button asChild>
                  <Link to={`/profile/${detail._id}`}>Open public profile</Link>
                </Button>
              </div>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
