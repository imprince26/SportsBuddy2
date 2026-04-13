import { format } from "date-fns";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminAuditLogs } from "@/hooks/admin/useAdminAuditLogs";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminAuditLogs = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const auditFilter = filters.auditLogs;
  const logsQuery = useAdminAuditLogs(auditFilter);

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Audit Trail"
        description="Track administrative actions with metadata and actor attribution."
      />

      <Card className="rounded-2xl border-border/60 bg-card/70">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <Input
            placeholder="Action key"
            value={auditFilter.action}
            onChange={(event) => updateFilter("auditLogs", { action: event.target.value, page: 1 })}
          />

          <Select
            value={auditFilter.entityType}
            onValueChange={(value) => updateFilter("auditLogs", { entityType: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={auditFilter.status}
            onValueChange={(value) => updateFilter("auditLogs", { status: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(auditFilter.limit)}
            onValueChange={(value) => updateFilter("auditLogs", { limit: Number(value), page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {logsQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : logsQuery.data?.data?.length ? (
        <div className="space-y-3">
          {logsQuery.data.data.map((log) => (
            <Card key={log._id} className="rounded-2xl border-border/60 bg-card/70">
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-semibold text-foreground">{log.action}</p>
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={log.status} />
                    <AdminStatusBadge value={log.entityType} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2">
                  <p>
                    Admin: {log.admin?.name || "Unknown"} ({log.admin?.email || "-"})
                  </p>
                  <p>{log.createdAt ? format(new Date(log.createdAt), "dd MMM yyyy hh:mm a") : "-"}</p>
                  <p>IP: {log.ipAddress || "-"}</p>
                  <p className="truncate">Agent: {log.userAgent || "-"}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={logsQuery.data?.pagination}
            onPageChange={(page) => updateFilter("auditLogs", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No audit logs yet" description="Administrative actions will appear here." />
      )}
    </div>
  );
};

export default AdminAuditLogs;
