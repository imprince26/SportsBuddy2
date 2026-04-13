import { useMemo } from "react";
import { Activity, Database, Gauge, HeartPulse, Server } from "lucide-react";
import { useAdminSystemHealth } from "@/hooks/admin/useAdminSystemHealth";
import { useAdminOverview } from "@/hooks/admin/useAdminOverview";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const toMb = (value = 0) => `${(value / (1024 * 1024)).toFixed(1)} MB`;

const AdminAnalytics = () => {
  const healthQuery = useAdminSystemHealth();
  const overviewQuery = useAdminOverview();

  const processStats = healthQuery.data?.process;
  const dbStats = healthQuery.data?.database?.stats;
  const bookings = overviewQuery.data?.bookings;

  const cards = useMemo(
    () => [
      {
        title: "Process uptime",
        value: `${Math.round(healthQuery.data?.uptimeSeconds || 0)}s`,
        hint: `Node ${processStats?.nodeVersion || "-"}`,
        icon: Gauge,
        trend: "neutral",
      },
      {
        title: "Heap usage",
        value: toMb(processStats?.memory?.heapUsed || 0),
        hint: `Total ${toMb(processStats?.memory?.heapTotal || 0)}`,
        icon: Server,
        trend: "neutral",
      },
      {
        title: "Database objects",
        value: dbStats?.objects || 0,
        hint: `Collections: ${dbStats?.collections || 0}`,
        icon: Database,
        trend: "up",
      },
      {
        title: "Confirmed bookings",
        value: bookings?.confirmedBookings || 0,
        hint: `Revenue Rs ${Math.round(bookings?.totalRevenue || 0).toLocaleString()}`,
        icon: Activity,
        trend: "up",
      },
    ],
    [healthQuery.data, processStats, dbStats, bookings]
  );

  if (healthQuery.isLoading || overviewQuery.isLoading) {
    return <AdminLoadingBlock rows={6} />;
  }

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Platform Analytics"
        description="Resource pressure, data volume, and operational health in one panel."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <AdminStatsCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border/60 bg-card/75">
          <CardHeader>
            <CardTitle className="text-base">Server Heartbeat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="flex items-center gap-2 text-foreground">
                <HeartPulse className="h-4 w-4 text-primary" />
                Environment
              </span>
              <span className="font-medium uppercase">{healthQuery.data?.environment || "development"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">PID</span>
              <span className="font-medium">{processStats?.pid || "-"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">RSS</span>
              <span className="font-medium">{toMb(processStats?.memory?.rss || 0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">External memory</span>
              <span className="font-medium">{toMb(processStats?.memory?.external || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card/75">
          <CardHeader>
            <CardTitle className="text-base">Database Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">Connection state</span>
              <span className="font-medium">{healthQuery.data?.database?.state ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">Database</span>
              <span className="font-medium">{healthQuery.data?.database?.name || "-"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">Storage size</span>
              <span className="font-medium">{toMb(dbStats?.storageSize || 0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-foreground">Data size</span>
              <span className="font-medium">{toMb(dbStats?.dataSize || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
