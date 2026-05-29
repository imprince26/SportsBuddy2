import { useMemo } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminOverview } from "@/hooks/admin/useAdminOverview";
import { useAdminGrowth } from "@/hooks/admin/useAdminGrowth";
import { useAdminUiStore } from "@/store/adminUiStore";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const safeFormat = (date, pattern = "dd MMM, hh:mm a") => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : format(parsed, pattern);
};

const imageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.url || "";
};

const chartColors = {
  users: "hsl(var(--primary))",
  events: "hsl(205 88% 45%)",
  bookings: "hsl(160 84% 39%)",
  revenue: "hsl(38 92% 50%)",
  failed: "hsl(0 84% 60%)",
};

const MiniPanel = ({ label, value, hint, icon: Icon }) => (
  <div className="min-w-0 overflow-hidden rounded-lg border border-border/60 bg-background/80 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-lg font-bold text-foreground sm:text-xl">{value}</p>
        {hint ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {Icon ? (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
    </div>
  </div>
);

const QueueItem = ({ icon: Icon, label, value, tone = "neutral" }) => {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-border/60 bg-background/80 text-foreground";

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${toneClass}`}>
      <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
};

const ListRow = ({ title, subtitle, image, right, meta, fallback }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 p-3">
    <div className="flex min-w-0 items-center gap-3">
      {image ? (
        <img src={image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
      ) : (
        <div className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          {fallback}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </div>
    {right ? <div className="shrink-0 text-right text-sm font-semibold text-foreground">{right}</div> : null}
  </div>
);

const BreakdownChips = ({ title, items = [], labelKey, colorKey = labelKey }) => (
  <Card className="rounded-lg border-border/60 bg-card shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      {items.length ? (
        items.map((item, index) => (
          <span
            key={`${item[labelKey]}-${index}`}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: index % 2 === 0 ? chartColors.users : chartColors.events }}
            />
            <span className="font-medium text-foreground">{item[colorKey] || "Unknown"}</span>
            <span className="text-muted-foreground">{item.count}</span>
          </span>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No breakdown data yet.</p>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { growthDays, setGrowthDays } = useAdminUiStore();
  const overviewQuery = useAdminOverview();
  const growthQuery = useAdminGrowth(growthDays);

  const overview = overviewQuery.data || {};
  const growth = growthQuery.data || {};
  const users = overview.users || {};
  const events = overview.events || {};
  const communities = overview.communities || {};
  const venues = overview.venues || {};
  const bookings = overview.bookings || {};
  const payments = overview.eventPayments || {};
  const notifications = overview.notifications || {};
  const audits = overview.audits || {};
  const actionQueue = overview.actionQueue || {};
  const highlights = overview.highlights || {};
  const breakdowns = overview.breakdowns || {};

  const metrics = useMemo(
    () => [
      {
        title: "Active users",
        value: users.active ?? 0,
        hint: `${users.newLast30Days ?? 0} new in 30 days`,
        icon: Users,
        trend: "up",
      },
      {
        title: "Live events",
        value: events.active ?? 0,
        hint: `${events.startingSoon ?? 0} starting this week`,
        icon: CalendarDays,
        trend: "neutral",
      },
      {
        title: "Booking revenue",
        value: formatCurrency(bookings.totalRevenue || 0),
        hint: `${bookings.confirmationRate || 0}% confirmation rate`,
        icon: CircleDollarSign,
        trend: "up",
      },
      {
        title: "Payment capture",
        value: formatCurrency(payments.paidRevenue || 0),
        hint: `${payments.failed || 0} failed payments`,
        icon: Receipt,
        trend: payments.failed ? "down" : "up",
      },
    ],
    [bookings, events, payments, users]
  );

  const growthChartData = useMemo(() => {
    const userSeries = growth.users || [];
    const eventSeries = growth.events || [];
    const bookingSeries = growth.bookings || [];
    const paymentSeries = growth.payments || [];

    return userSeries.map((item, index) => ({
      date: item.date,
      users: item.count,
      events: eventSeries[index]?.count || 0,
      bookings: bookingSeries[index]?.count || 0,
      bookingRevenue: bookingSeries[index]?.revenue || 0,
      paymentRevenue: paymentSeries[index]?.revenue || 0,
      failedPayments: paymentSeries[index]?.failed || 0,
    }));
  }, [growth]);

  const operationsData = useMemo(
    () => [
      { name: "Users", value: users.active || 0 },
      { name: "Events", value: events.active || 0 },
      { name: "Venues", value: venues.active || 0 },
      { name: "Communities", value: communities.active || 0 },
    ],
    [communities.active, events.active, users.active, venues.active]
  );

  const qualityData = useMemo(
    () => [
      { name: "Verified", value: venues.verified || 0, color: "hsl(var(--primary))" },
      { name: "Unverified", value: venues.unverified || 0, color: "hsl(38 92% 50%)" },
      { name: "Inactive", value: venues.inactive || 0, color: "hsl(0 84% 60%)" },
    ],
    [venues]
  );

  if (overviewQuery.isLoading) {
    return <AdminLoadingBlock rows={8} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminSectionHeader
        title="Executive Overview"
        description="A complete control room for growth, revenue, operational queues, and SportsBuddy platform health."
      />

      <AdminMetricGrid items={metrics} />

      <Card className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SportsBuddy command center</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Revenue, participation, and trust signals in one place.</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Review unresolved queues first, then scan growth momentum and recent platform activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MiniPanel label="Venue verification" value={`${venues.verificationRate || 0}%`} hint={`${venues.unverified || 0} awaiting review`} icon={Building2} />
            <MiniPanel label="Event fill rate" value={`${events.fillRate || 0}%`} hint={`${events.totalParticipants || 0} participants`} icon={Sparkles} />
            <MiniPanel label="Notification read rate" value={`${notifications.readRate || 0}%`} hint={`${notifications.sent || 0} sent`} icon={Bell} />
          </div>

          <div className="h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData}>
                <defs>
                  <linearGradient id="overview-users" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.users} stopOpacity={0.34} />
                    <stop offset="95%" stopColor={chartColors.users} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="overview-bookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.bookings} stopOpacity={0.32} />
                    <stop offset="95%" stopColor={chartColors.bookings} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  formatter={(value, key) => (String(key).includes("Revenue") ? formatCurrency(value) : value)}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Area yAxisId="left" type="monotone" dataKey="users" stroke={chartColors.users} strokeWidth={2} fill="url(#overview-users)" />
                <Area yAxisId="left" type="monotone" dataKey="bookings" stroke={chartColors.bookings} strokeWidth={2} fill="url(#overview-bookings)" />
                <Area yAxisId="right" type="monotone" dataKey="paymentRevenue" stroke={chartColors.revenue} strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Action Queue</CardTitle>
            <Select value={String(growthDays)} onValueChange={(value) => setGrowthDays(Number(value))}>
              <SelectTrigger className="h-9 w-full sm:w-[150px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <QueueItem icon={Building2} label="Venue reviews" value={actionQueue.venueReviews || 0} tone={actionQueue.venueReviews ? "warning" : "neutral"} />
            <QueueItem icon={Clock3} label="Pending bookings" value={actionQueue.pendingBookings || 0} tone={actionQueue.pendingBookings ? "warning" : "neutral"} />
            <QueueItem icon={WalletCards} label="Failed payments" value={actionQueue.failedPayments || 0} tone={actionQueue.failedPayments ? "danger" : "neutral"} />
            <QueueItem icon={Bell} label="Scheduled notifications" value={actionQueue.scheduledNotifications || 0} />
            <QueueItem icon={AlertTriangle} label="Failed audit logs" value={actionQueue.failedAuditLogs || 0} tone={actionQueue.failedAuditLogs ? "danger" : "neutral"} />
            <QueueItem icon={Users} label="Community join requests" value={actionQueue.pendingJoinRequests || 0} tone={actionQueue.pendingJoinRequests ? "warning" : "neutral"} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Platform Mix</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={chartColors.users} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <MiniPanel label="Admins" value={users.admins || 0} hint="Active operators" icon={ShieldCheck} />
              <MiniPanel label="Communities" value={communities.active || 0} hint={`${communities.totalMembers || 0} members`} icon={Users} />
              <MiniPanel label="Audit events" value={audits.last24Hours || 0} hint="Last 24 hours" icon={CheckCircle2} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(highlights.upcomingEvents || []).length ? (
              highlights.upcomingEvents.map((event) => (
                <ListRow
                  key={event._id}
                  title={event.name}
                  subtitle={`${event.category || "Sport"} - ${event.location?.city || "No city"}`}
                  meta={safeFormat(event.date)}
                  image={imageUrl(event.primaryImage)}
                  right={<AdminStatusBadge value={event.status} />}
                  fallback={<CalendarDays className="h-5 w-5" />}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events need attention.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top Venues</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(highlights.topVenues || []).length ? (
              highlights.topVenues.map((venue) => (
                <ListRow
                  key={venue._id}
                  title={venue.name}
                  subtitle={`${venue.location?.city || "No city"} - ${(venue.sports || []).slice(0, 2).join(", ") || "Sports venue"}`}
                  meta={`${venue.confirmedBookings || 0} confirmed bookings`}
                  image={imageUrl(venue.primaryImage)}
                  right={formatCurrency(venue.bookingRevenue || 0)}
                  fallback={<Building2 className="h-5 w-5" />}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Venue performance appears after bookings are created.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Venue Trust</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={qualityData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={4}>
                    {qualityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <MiniPanel label="Verification rate" value={`${venues.verificationRate || 0}%`} hint={`${venues.verified || 0} verified venues`} icon={CheckCircle2} />
              <Progress value={venues.verificationRate || 0} />
              <p className="text-sm text-muted-foreground">
                Keep the unverified queue low so new venue owners can become bookable faster.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Money Flow</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(highlights.recentPayments || []).length ? (
              highlights.recentPayments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={payment.user?.avatar?.url} alt={payment.userName} />
                      <AvatarFallback>{payment.userName?.slice(0, 2)?.toUpperCase() || "SB"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{payment.eventName}</p>
                      <p className="truncate text-xs text-muted-foreground">{payment.userEmail || payment.userName}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(payment.amount || 0)}</p>
                    <AdminStatusBadge value={payment.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Payments will appear here when transactions start.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BreakdownChips title="Event Categories" items={breakdowns.eventCategories || []} labelKey="category" />
        <BreakdownChips title="Venue Cities" items={breakdowns.venueCities || []} labelKey="city" />
      </div>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(highlights.recentAuditLogs || []).length ? (
            highlights.recentAuditLogs.map((log) => (
              <div key={log._id} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{String(log.action || "").replaceAll("_", " ")}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.admin?.name || "Unknown admin"} - {log.entityType || "system"} - {log.ipAddress || "No IP"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AdminStatusBadge value={log.status} />
                  <span className="text-xs text-muted-foreground">{safeFormat(log.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Admin activity will appear after actions are logged.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
