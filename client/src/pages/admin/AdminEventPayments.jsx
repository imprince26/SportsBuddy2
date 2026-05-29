import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Eye,
  Filter,
  IndianRupee,
  Receipt,
  Search,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { useAdminEventPaymentDetails, useAdminEventPayments } from "@/hooks/admin/useAdminEventPayments";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentStatusOptions = ["created", "paid", "failed", "cancelled", "refunded"];

const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
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

const EventImage = ({ payment }) => {
  const imageUrl = payment?.eventImage?.url || payment?.event?.images?.[0]?.url;

  if (imageUrl) {
    return <img src={imageUrl} alt={payment?.eventName || "Event"} className="h-full w-full object-cover" loading="lazy" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-blue-100 to-emerald-100 dark:from-primary/25 dark:via-slate-900 dark:to-emerald-950">
      <Receipt className="h-10 w-10 text-primary/70" />
    </div>
  );
};

const AdminEventPayments = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const eventPaymentsFilter = filters.eventPayments;
  const paymentsQuery = useAdminEventPayments(eventPaymentsFilter);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const paymentDetailsQuery = useAdminEventPaymentDetails(selectedPaymentId);

  const payments = paymentsQuery.data?.data || [];
  const stats = paymentsQuery.data?.stats || {};
  const statusBreakdown = paymentsQuery.data?.breakdowns?.statuses || [];
  const methodBreakdown = paymentsQuery.data?.breakdowns?.paymentMethods || [];

  const metrics = useMemo(
    () => [
      {
        title: "Paid revenue",
        value: formatCurrency(stats.paidRevenue || 0),
        hint: `${stats.paid || 0} successful payments`,
        icon: IndianRupee,
        trend: "up",
      },
      {
        title: "Payment queue",
        value: stats.pending || 0,
        hint: `${stats.total || 0} total transactions`,
        icon: CreditCard,
        trend: "neutral",
      },
      {
        title: "Failures",
        value: stats.failed || 0,
        hint: `${stats.refunded || 0} refunded`,
        icon: AlertCircle,
        trend: stats.failed > 0 ? "down" : "neutral",
      },
      {
        title: "Verified flow",
        value: `${stats.paid || 0}/${stats.total || 0}`,
        hint: "Gateway status health",
        icon: ShieldCheck,
        trend: "up",
      },
    ],
    [stats]
  );

  const detail = paymentDetailsQuery.data?.data;

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Event Payments"
        description="Support paid events with transaction health, gateway evidence, failure context, and user/event matching."
      />

      <AdminMetricGrid items={metrics} />

      <section className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-cyan-500/10 p-4 shadow-sm lg:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <h3 className="text-base font-semibold text-foreground">Transaction command lane</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Fast scan payment status, revenue concentration, gateway IDs, and webhook activity before touching support cases.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Created" value={stats.pending || 0} />
              <MiniStat label="Paid" value={stats.paid || 0} />
              <MiniStat label="Failed" value={stats.failed || 0} />
              <MiniStat label="Refunded" value={stats.refunded || 0} />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background/80 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Status mix</p>
              <div className="space-y-2">
                {statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <span>{item.status}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Methods</p>
              <div className="space-y-2">
                {methodBreakdown.length ? (
                  methodBreakdown.map((item) => (
                    <div key={item.method} className="flex items-center justify-between text-sm">
                      <span>{item.method}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No method data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[1.3fr_0.75fr_0.75fr_0.75fr_0.75fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search order, payment, event, user"
              value={eventPaymentsFilter.search}
              onChange={(event) => updateFilter("eventPayments", { search: event.target.value, page: 1 })}
            />
          </div>

          <Select value={eventPaymentsFilter.status} onValueChange={(value) => updateFilter("eventPayments", { status: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {paymentStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Event ID"
            value={eventPaymentsFilter.eventId}
            onChange={(event) => updateFilter("eventPayments", { eventId: event.target.value, page: 1 })}
          />

          <Input
            placeholder="User ID"
            value={eventPaymentsFilter.userId}
            onChange={(event) => updateFilter("eventPayments", { userId: event.target.value, page: 1 })}
          />

          <Select value={eventPaymentsFilter.sortBy} onValueChange={(value) => updateFilter("eventPayments", { sortBy: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest</SelectItem>
              <SelectItem value="paidAt:desc">Latest paid</SelectItem>
              <SelectItem value="amount:desc">Amount high</SelectItem>
              <SelectItem value="amount:asc">Amount low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => resetFilter("eventPayments")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {paymentsQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : payments.length ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment._id} className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="grid min-h-[210px] lg:grid-cols-[230px_1fr]">
                  <div className="relative min-h-[180px]">
                    <EventImage payment={payment} />
                    <div className="absolute left-3 top-3">
                      <AdminStatusBadge value={payment.status} />
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">{payment.eventName}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {payment.event?.category || "Event"} - {payment.eventCity || "Unknown city"}
                        </p>
                        <div className="mt-3 flex min-w-0 items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/70">
                            <AvatarImage src={payment.user?.avatar?.url} />
                            <AvatarFallback>{payment.userName?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{payment.userName}</p>
                            <p className="truncate text-xs text-muted-foreground">{payment.userEmail || "No email"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
                        <MiniStat label="Order" value={payment.razorpayOrderId || "-"} />
                        <MiniStat label="Payment" value={payment.razorpayPaymentId || "-"} />
                        <MiniStat label="Method" value={payment.paymentMethod || "-"} />
                        <MiniStat label="Webhooks" value={payment.webhookEventCount || 0} />
                      </div>
                    </div>

                    {payment.failureReason ? (
                      <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                        {payment.failureReason}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      <span className="text-xs text-muted-foreground">Created {safeFormat(payment.createdAt)}</span>
                      {payment.paidAt ? <span className="text-xs text-muted-foreground">Paid {safeFormat(payment.paidAt)}</span> : null}
                      <Button variant="outline" size="sm" onClick={() => setSelectedPaymentId(payment._id)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination pagination={paymentsQuery.data?.pagination} onPageChange={(page) => updateFilter("eventPayments", { page })} />
        </div>
      ) : (
        <AdminEmptyState title="No event payments found" description="Transactions appear here once paid events receive orders." />
      )}

      <Dialog open={Boolean(selectedPaymentId)} onOpenChange={(open) => (!open ? setSelectedPaymentId(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Deep-dive payment and verification data for support/admin use.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {paymentDetailsQuery.isLoading ? (
              <AdminLoadingBlock rows={4} />
            ) : detail ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="Status" value={detail.status} />
                  <MiniStat label="Amount" value={formatCurrency(detail.amount)} />
                  <MiniStat label="Gateway" value={detail.gateway || "razorpay"} />
                  <MiniStat label="Currency" value={detail.currency || "INR"} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Event</p>
                    <p className="mt-1 font-medium">{detail.event?.name || "-"}</p>
                    <p className="text-muted-foreground">{detail.event?.category || ""}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">User</p>
                    <p className="mt-1 font-medium">{detail.user?.name || "-"}</p>
                    <p className="text-muted-foreground">{detail.user?.email || ""}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3 md:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Gateway IDs</p>
                    <p className="mt-1 break-all font-mono text-xs">Order: {detail.razorpayOrderId || "-"}</p>
                    <p className="break-all font-mono text-xs">Payment: {detail.razorpayPaymentId || "-"}</p>
                    <p className="break-all font-mono text-xs">Receipt: {detail.receipt || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Verification</p>
                    <p className="mt-1">Paid at {safeFormat(detail.paidAt)}</p>
                    <p className="text-muted-foreground">Verified at {safeFormat(detail.verifiedAt)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Method</p>
                    <p className="mt-1">{detail.paymentMethod || "-"}</p>
                    <p className="text-muted-foreground">{detail.description || "No description"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Webhook className="h-4 w-4 text-primary" />
                    Webhook events
                  </p>
                  {detail.webhookEvents?.length ? (
                    <div className="space-y-2">
                      {detail.webhookEvents.map((entry, index) => (
                        <div key={`${entry.event}-${index}`} className="rounded-md bg-card px-3 py-2">
                          <p className="font-medium">{entry.event || "Webhook event"}</p>
                          <p className="text-xs text-muted-foreground">{safeFormat(entry.at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No webhook events recorded.</p>
                  )}
                </div>
                {detail.failureReason ? (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-700 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <span>{detail.failureReason}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>No failure reason recorded.</span>
                  </div>
                )}
              </div>
            ) : (
              <AdminEmptyState title="No payment details" description="Unable to load details for this payment." />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventPayments;
