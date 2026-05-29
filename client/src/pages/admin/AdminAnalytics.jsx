import { useMemo } from "react";
import {
  Activity,
  BarChart3,
  BellRing,
  Building2,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  HeartPulse,
  Receipt,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminGrowth } from "@/hooks/admin/useAdminGrowth";
import { useAdminOverview } from "@/hooks/admin/useAdminOverview";
import { useAdminSystemHealth } from "@/hooks/admin/useAdminSystemHealth";
import { useAdminUiStore } from "@/store/adminUiStore";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const toMb = (value = 0) => `${(Number(value) / (1024 * 1024)).toFixed(1)} MB`;
const toPercent = (value = 0) => `${Math.round(Number(value) || 0)}%`;

const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const chartColors = {
  primary: "hsl(var(--primary))",
  blue: "hsl(205 88% 45%)",
  green: "hsl(160 84% 39%)",
  amber: "hsl(38 92% 50%)",
  red: "hsl(0 84% 60%)",
  violet: "hsl(262 83% 58%)",
};

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2">
    <span className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" /> : null}
      <span className="truncate">{label}</span>
    </span>
    <span className="shrink-0 text-sm font-semibold text-foreground">{value}</span>
  </div>
);

const InsightCard = ({ title, value, hint, progress, icon: Icon }) => (
  <Card className="rounded-lg border-border/60 bg-card shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-1 truncate text-xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {typeof progress === "number" ? <Progress className="mt-4" value={progress} /> : null}
    </CardContent>
  </Card>
);

const AdminAnalytics = () => {
  const { growthDays, setGrowthDays } = useAdminUiStore();
  const healthQuery = useAdminSystemHealth();
  const overviewQuery = useAdminOverview();
  const growthQuery = useAdminGrowth(growthDays);

  const health = healthQuery.data || {};
  const overview = overviewQuery.data || {};
  const growth = growthQuery.data || {};
  const processStats = health.process || {};
  const dbStats = health.database?.stats || {};
  const memory = processStats.memory || {};
  const users = overview.users || {};
  const events = overview.events || {};
  const venues = overview.venues || {};
  const communities = overview.communities || {};
  const bookings = overview.bookings || {};
  const payments = overview.eventPayments || {};
  const notifications = overview.notifications || {};
  const audits = overview.audits || {};

  const heapPercent = memory.heapTotal ? Math.min(100, Math.round((memory.heapUsed / memory.heapTotal) * 100)) : 0;
  const storagePercent = dbStats.storageSize ? Math.min(100, Math.round((Number(dbStats.dataSize || 0) / Number(dbStats.storageSize || 1)) * 100)) : 0;
  const healthScore = Math.max(
    0,
    100 -
      Math.min(25, Math.round(heapPercent / 4)) -
      Math.min(25, payments.failed || 0) -
      Math.min(20, audits.failed || 0) -
      Math.min(15, venues.unverified || 0)
  );

  const metrics = useMemo(
    () => [
      {
        title: "Health score",
        value: `${healthScore}%`,
        hint: `${health.environment || "development"} environment`,
        icon: HeartPulse,
        trend: healthScore >= 80 ? "up" : "down",
      },
      {
        title: "Heap pressure",
        value: toPercent(heapPercent),
        hint: `${toMb(memory.heapUsed)} used of ${toMb(memory.heapTotal)}`,
        icon: Server,
        trend: heapPercent > 80 ? "down" : "neutral",
      },
      {
        title: "Booking revenue",
        value: formatCurrency(bookings.totalRevenue || 0),
        hint: `${bookings.totalHours || 0} booked hours`,
        icon: Receipt,
        trend: "up",
      },
      {
        title: "Delivery rate",
        value: `${notifications.deliveryRate || 0}%`,
        hint: `${notifications.totalRecipients || 0} recipients reached`,
        icon: BellRing,
        trend: notifications.deliveryRate >= 80 ? "up" : "neutral",
      },
    ],
    [bookings, health.environment, healthScore, heapPercent, memory, notifications]
  );

  const growthData = useMemo(() => {
    const usersSeries = growth.users || [];
    const eventsSeries = growth.events || [];
    const communitiesSeries = growth.communities || [];
    const venuesSeries = growth.venues || [];
    const bookingSeries = growth.bookings || [];
    const paymentSeries = growth.payments || [];
    const notificationSeries = growth.notifications || [];
    const auditSeries = growth.auditLogs || [];

    return usersSeries.map((item, index) => ({
      date: item.date,
      users: item.count,
      events: eventsSeries[index]?.count || 0,
      communities: communitiesSeries[index]?.count || 0,
      venues: venuesSeries[index]?.count || 0,
      bookings: bookingSeries[index]?.count || 0,
      bookingRevenue: bookingSeries[index]?.revenue || 0,
      paymentRevenue: paymentSeries[index]?.revenue || 0,
      failedPayments: paymentSeries[index]?.failed || 0,
      notifications: notificationSeries[index]?.sent || 0,
      auditFailures: auditSeries[index]?.failed || 0,
    }));
  }, [growth]);

  const funnelData = useMemo(
    () => [
      { name: "Users", value: users.active || 0, color: chartColors.primary },
      { name: "Events", value: events.active || 0, color: chartColors.blue },
      { name: "Bookings", value: bookings.confirmedBookings || 0, color: chartColors.green },
      { name: "Payments", value: payments.paid || 0, color: chartColors.amber },
    ],
    [bookings.confirmedBookings, events.active, payments.paid, users.active]
  );

  const riskData = useMemo(
    () => [
      { name: "Failed payments", value: payments.failed || 0 },
      { name: "Audit failures", value: audits.failed || 0 },
      { name: "Unverified venues", value: venues.unverified || 0 },
      { name: "Pending bookings", value: bookings.pendingBookings || 0 },
      { name: "Failed notifications", value: notifications.failed || 0 },
    ],
    [audits.failed, bookings.pendingBookings, notifications.failed, payments.failed, venues.unverified]
  );

  if (healthQuery.isLoading || overviewQuery.isLoading) {
    return <AdminLoadingBlock rows={8} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminSectionHeader
        title="Platform Analytics"
        description="Operational intelligence for system health, growth velocity, revenue quality, and admin risk."
      />

      <AdminMetricGrid items={metrics} />

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Growth Velocity</CardTitle>
            <Select value={String(growthDays)} onValueChange={(value) => setGrowthDays(Number(value))}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 180 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Line type="monotone" dataKey="users" stroke={chartColors.primary} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="events" stroke={chartColors.blue} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="bookings" stroke={chartColors.green} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="notifications" stroke={chartColors.violet} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
          <InsightCard title="User activation" value={`${users.activeRate || 0}%`} hint={`${users.active || 0} active of ${users.total || 0}`} progress={users.activeRate || 0} icon={Users} />
          <InsightCard title="Venue trust" value={`${venues.verificationRate || 0}%`} hint={`${venues.verified || 0} verified venues`} progress={venues.verificationRate || 0} icon={Building2} />
          <InsightCard title="Event occupancy" value={`${events.fillRate || 0}%`} hint={`${events.totalParticipants || 0} participants`} progress={events.fillRate || 0} icon={Activity} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Conversion Shape</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={funnelData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={4}>
                    {funnelData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2">
              {funnelData.map((item) => (
                <InfoRow key={item.name} label={item.name} value={item.value} icon={BarChart3} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="analytics-payment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.amber} stopOpacity={0.34} />
                      <stop offset="95%" stopColor={chartColors.amber} stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="analytics-booking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.green} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={chartColors.green} stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Area type="monotone" dataKey="paymentRevenue" stroke={chartColors.amber} strokeWidth={2} fill="url(#analytics-payment)" />
                  <Area type="monotone" dataKey="bookingRevenue" stroke={chartColors.green} strokeWidth={2} fill="url(#analytics-booking)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Operational Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={chartColors.red} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">System Heartbeat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow label="Environment" value={health.environment || "development"} icon={Gauge} />
            <InfoRow label="Uptime" value={`${Math.round(health.uptimeSeconds || 0)}s`} icon={HeartPulse} />
            <InfoRow label="Node version" value={processStats.nodeVersion || "-"} icon={Cpu} />
            <InfoRow label="PID" value={processStats.pid || "-"} icon={Server} />
            <InfoRow label="RSS memory" value={toMb(memory.rss || 0)} icon={HardDrive} />
            <InfoRow label="External memory" value={toMb(memory.external || 0)} icon={HardDrive} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Database Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <InsightCard title="Connection state" value={health.database?.state ?? "-"} hint={health.database?.name || "Database name unavailable"} progress={undefined} icon={Database} />
          <InsightCard title="Storage density" value={toPercent(storagePercent)} hint={`${toMb(dbStats.dataSize || 0)} data / ${toMb(dbStats.storageSize || 0)} storage`} progress={storagePercent} icon={HardDrive} />
          <InsightCard title="Objects" value={dbStats.objects || 0} hint={`${dbStats.collections || 0} collections, ${dbStats.indexes || 0} indexes`} progress={undefined} icon={ShieldAlert} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
