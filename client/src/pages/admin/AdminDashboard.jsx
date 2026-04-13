import { useMemo } from "react";
import {
  Bell,
  Building2,
  CalendarDays,
  BarChart3,
  Shield,
  Users,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminOverview } from "@/hooks/admin/useAdminOverview";
import { useAdminGrowth } from "@/hooks/admin/useAdminGrowth";
import { useAdminUiStore } from "@/store/adminUiStore";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartConfig = [
  { key: "users", label: "New users", color: "hsl(var(--primary))" },
  { key: "events", label: "New events", color: "hsl(205 88% 45%)" },
  { key: "bookings", label: "Bookings", color: "hsl(160 84% 39%)" },
];

const AdminDashboard = () => {
  const { growthDays, setGrowthDays } = useAdminUiStore();
  const overviewQuery = useAdminOverview();
  const growthQuery = useAdminGrowth(growthDays);

  const metrics = useMemo(() => {
    const users = overviewQuery.data?.users;
    const events = overviewQuery.data?.events;
    const communities = overviewQuery.data?.communities;
    const venues = overviewQuery.data?.venues;
    const notifications = overviewQuery.data?.notifications;

    return [
      {
        title: "Active users",
        value: users?.active ?? 0,
        hint: `${users?.newLast30Days ?? 0} new in 30 days`,
        icon: Users,
        trend: "up",
      },
      {
        title: "Live events",
        value: events?.active ?? 0,
        hint: `${events?.total ?? 0} total events`,
        icon: CalendarDays,
        trend: "neutral",
      },
      {
        title: "Verified venues",
        value: venues?.verified ?? 0,
        hint: `${venues?.total ?? 0} total venues`,
        icon: Building2,
        trend: "up",
      },
      {
        title: "Notifications sent",
        value: notifications?.sent ?? 0,
        hint: `${notifications?.scheduled ?? 0} scheduled`,
        icon: Bell,
        trend: "neutral",
      },
      {
        title: "Communities",
        value: communities?.active ?? 0,
        hint: `${communities?.total ?? 0} total communities`,
        icon: Shield,
        trend: "neutral",
      },
      {
        title: "Booking revenue",
        value: `Rs ${Math.round(overviewQuery.data?.bookings?.totalRevenue || 0).toLocaleString()}`,
        hint: `${overviewQuery.data?.bookings?.confirmedBookings || 0} confirmed bookings`,
        icon: BarChart3,
        trend: "up",
      },
    ];
  }, [overviewQuery.data]);

  const chartData = useMemo(() => {
    const users = growthQuery.data?.users || [];
    const events = growthQuery.data?.events || [];
    const bookings = growthQuery.data?.bookings || [];

    return users.map((item, index) => ({
      date: item.date,
      users: item.count,
      events: events[index]?.count || 0,
      bookings: bookings[index]?.count || 0,
      revenue: bookings[index]?.revenue || 0,
    }));
  }, [growthQuery.data]);

  if (overviewQuery.isLoading) {
    return <AdminLoadingBlock rows={8} />;
  }

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Executive Overview"
        description="Realtime platform snapshots for operations, growth, and engagement."
      />

      <AdminMetricGrid items={metrics} />

      <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Growth Trends</CardTitle>
          <div className="w-full sm:w-[180px]">
            <Select value={String(growthDays)} onValueChange={(value) => setGrowthDays(Number(value))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {chartConfig.map((line) => (
              <span key={line.key} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                {line.label}
              </span>
            ))}
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  {chartConfig.map((line) => (
                    <linearGradient key={line.key} id={`admin-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={line.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={line.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                {chartConfig.map((line) => (
                  <Area
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={2}
                    fill={`url(#admin-${line.key})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
