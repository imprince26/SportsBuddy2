import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Shield, UserCog } from "lucide-react";
import { userRoleSchema, userStatusSchema } from "@/schemas/adminSchemas";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminUsers, useUpdateAdminUserRole, useUpdateAdminUserStatus } from "@/hooks/admin/useAdminUsers";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const AdminUsers = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const usersFilter = filters.users;
  const usersQuery = useAdminUsers(usersFilter);
  const updateRoleMutation = useUpdateAdminUserRole();
  const updateStatusMutation = useUpdateAdminUserStatus();

  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState(null);

  const roleForm = useForm({
    resolver: zodResolver(userRoleSchema),
    defaultValues: { role: "user" },
  });

  const statusForm = useForm({
    resolver: zodResolver(userStatusSchema),
    defaultValues: { accountStatus: "active", reason: "", note: "" },
  });

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

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="User Management"
        description="Manage identities, permissions, and account moderation across the platform."
      />

      <Card className="rounded-2xl border-border/60 bg-card/70">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <Input
            placeholder="Search name, username, email"
            value={usersFilter.search}
            onChange={(event) => updateFilter("users", { search: event.target.value, page: 1 })}
          />

          <Select
            value={usersFilter.role}
            onValueChange={(value) => updateFilter("users", { role: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
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
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
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
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="createdAt:asc">Oldest first</SelectItem>
              <SelectItem value="name:asc">Name A-Z</SelectItem>
              <SelectItem value="lastLoginAt:desc">Latest login</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {usersQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : usersQuery.data?.data?.length ? (
        <div className="space-y-3">
          {usersQuery.data.data.map((user) => (
            <Card key={user._id} className="rounded-2xl border-border/60 bg-card/70">
              <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border border-border/70">
                      <AvatarImage src={user.avatar?.url} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <AdminStatusBadge value={user.accountStatus} />
                    <AdminStatusBadge value={user.role} />
                    <span className="text-xs text-muted-foreground">
                      Joined {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy") : "-"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Last login {user.lastLoginAt ? format(new Date(user.lastLoginAt), "dd MMM yyyy") : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openRoleDialog(user)}>
                    <Shield className="mr-1 h-4 w-4" />
                    Role
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openStatusDialog(user)}>
                    <UserCog className="mr-1 h-4 w-4" />
                    Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={usersQuery.data?.pagination}
            onPageChange={(page) => updateFilter("users", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No users found" description="Adjust filters to discover user records." />
      )}

      <Dialog open={dialogType === "role"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update role</DialogTitle>
            <DialogDescription>Assign user privileges for admin operations.</DialogDescription>
          </DialogHeader>

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
              Save
            </Button>
          </DialogFooter>

          {roleForm.formState.errors.role ? (
            <p className="text-xs text-rose-600">{roleForm.formState.errors.role.message}</p>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogType === "status"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update account status</DialogTitle>
            <DialogDescription>Control account lifecycle and moderation outcomes.</DialogDescription>
          </DialogHeader>

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
                placeholder="Moderation reason"
              />
            </div>

            <div className="space-y-1">
              <Label>Note</Label>
              <Input
                value={statusForm.watch("note") || ""}
                onChange={(event) => statusForm.setValue("note", event.target.value, { shouldValidate: true })}
                placeholder="Internal note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleStatusSubmit} disabled={updateStatusMutation.isPending}>
              Save
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
