import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  CalendarDays,
  Eye,
  Filter,
  Fingerprint,
  MonitorSmartphone,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldX,
  UserCog,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminAuditLogs } from "@/hooks/admin/useAdminAuditLogs";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const safeFormat = (date, pattern = "dd MMM yyyy hh:mm a") => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : format(parsed, pattern);
};

const formatAction = (action = "") =>
  action
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Unknown action";

const compactJson = (value) => {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
    return "No metadata captured";
  }
  return JSON.stringify(value, null, 2);
};

const MiniStat = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background/80 px-3 py-2">
    {Icon ? (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
    ) : null}
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const BreakdownList = ({ title, items, labelKey, emptyLabel }) => (
  <Card className="rounded-lg border-border/60 bg-card shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      {items?.length ? (
        items.slice(0, 6).map((item) => {
          const label = item[labelKey] || "unknown";
          return (
            <button
              key={label}
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
            >
              <span className="max-w-[220px] truncate font-medium text-foreground">{formatAction(String(label))}</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">{item.count}</span>
            </button>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </CardContent>
  </Card>
);

const AdminAuditLogs = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const auditFilter = filters.auditLogs;
  const logsQuery = useAdminAuditLogs(auditFilter);
  const [selectedLog, setSelectedLog] = useState(null);

  const logs = logsQuery.data?.data || [];
  const stats = logsQuery.data?.stats || {};
  const breakdowns = logsQuery.data?.breakdowns || {};

  const metrics = useMemo(
    () => [
      {
        title: "Audit entries",
        value: stats.total || 0,
        hint: `${stats.adminCount || 0} admins active`,
        icon: Activity,
        trend: "neutral",
      },
      {
        title: "Successful actions",
        value: stats.success || 0,
        hint: "Completed without errors",
        icon: ShieldCheck,
        trend: "up",
      },
      {
        title: "Failed actions",
        value: stats.failed || 0,
        hint: "Needs operational review",
        icon: ShieldX,
        trend: stats.failed ? "down" : "neutral",
      },
      {
        title: "Entity spread",
        value: stats.entityCount || 0,
        hint: "Touched admin domains",
        icon: Fingerprint,
        trend: "neutral",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Audit Trail"
        description="Trace every admin action with actor context, request fingerprints, entity scope, and metadata."
      />

      <AdminMetricGrid items={metrics} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <BreakdownList title="Entity Hotspots" items={breakdowns.entities} labelKey="entityType" emptyLabel="No entity activity yet." />
        <BreakdownList title="Action Mix" items={breakdowns.actions} labelKey="action" emptyLabel="No action mix available." />
      </div>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search action key"
                value={auditFilter.action}
                onChange={(event) => updateFilter("auditLogs", { action: event.target.value, page: 1 })}
              />
            </div>

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

            <Button variant="outline" onClick={() => resetFilter("auditLogs")}>
              <Filter className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={auditFilter.dateFrom || ""}
                onChange={(event) => updateFilter("auditLogs", { dateFrom: event.target.value, page: 1 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={auditFilter.dateTo || ""}
                onChange={(event) => updateFilter("auditLogs", { dateTo: event.target.value, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {logsQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : logs.length ? (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log._id} className="rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,520px)]">
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      {log.status === "failed" ? <ShieldX className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">{formatAction(log.action)}</h3>
                        <AdminStatusBadge value={log.status} />
                        <AdminStatusBadge value={log.entityType} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {log.admin?.name || "Unknown admin"} - {log.admin?.email || "No email"}
                      </p>
                      <p className="mt-2 line-clamp-2 max-w-4xl text-xs text-muted-foreground">
                        {log.errorMessage || `Entity ${log.entityId || "not linked"} was updated from ${log.ipAddress || "unknown IP"}.`}
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
                    <MiniStat label="Time" value={safeFormat(log.createdAt, "dd MMM, hh:mm a")} icon={CalendarDays} />
                    <MiniStat label="IP address" value={log.ipAddress || "-"} icon={MonitorSmartphone} />
                    <MiniStat label="Entity ID" value={log.entityId || "-"} icon={Fingerprint} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <UserCog className="h-3.5 w-3.5" />
                      <span className="truncate">{log.admin?.role || "admin"}</span>
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MonitorSmartphone className="h-3.5 w-3.5" />
                      <span className="max-w-[420px] truncate">{log.userAgent || "No user agent"}</span>
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                    <Eye className="mr-1 h-4 w-4" />
                    Inspect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination pagination={logsQuery.data?.pagination} onPageChange={(page) => updateFilter("auditLogs", { page })} />
        </div>
      ) : (
        <AdminEmptyState title="No audit logs yet" description="Administrative actions will appear here." />
      )}

      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => (!open ? setSelectedLog(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{selectedLog ? formatAction(selectedLog.action) : "Audit details"}</DialogTitle>
            <DialogDescription>
              {selectedLog
                ? `${selectedLog.admin?.name || "Unknown admin"} - ${safeFormat(selectedLog.createdAt)}`
                : "Full request context and metadata."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {selectedLog ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="Result" value={selectedLog.status} icon={selectedLog.status === "failed" ? ShieldX : ShieldCheck} />
                  <MiniStat label="Entity" value={selectedLog.entityType || "-"} icon={Fingerprint} />
                  <MiniStat label="IP" value={selectedLog.ipAddress || "-"} icon={MonitorSmartphone} />
                  <MiniStat label="Time" value={safeFormat(selectedLog.createdAt, "dd MMM yyyy")} icon={CalendarDays} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actor</p>
                    <p className="mt-2 font-semibold text-foreground">{selectedLog.admin?.name || "Unknown admin"}</p>
                    <p className="break-all text-muted-foreground">{selectedLog.admin?.email || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Request</p>
                    <p className="mt-2 break-all text-foreground">{selectedLog.userAgent || "No user agent"}</p>
                    <p className="mt-1 text-muted-foreground">Entity ID: {selectedLog.entityId || "-"}</p>
                  </div>
                </div>

                {selectedLog.errorMessage ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
                    <p className="text-xs font-semibold uppercase tracking-wide">Failure reason</p>
                    <p className="mt-1">{selectedLog.errorMessage}</p>
                  </div>
                ) : null}

                <div className="rounded-lg border border-border/60 bg-slate-950 p-4 text-slate-100">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Metadata
                  </div>
                  <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed">
                    {compactJson(selectedLog.metadata)}
                  </pre>
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;
