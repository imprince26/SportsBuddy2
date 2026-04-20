import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, RefreshCw } from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminEventPaymentDetails,
  useAdminEventPayments,
} from "@/hooks/admin/useAdminEventPayments";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentStatusOptions = ["created", "paid", "failed", "cancelled", "refunded"];

const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const AdminEventPayments = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const eventPaymentsFilter = filters.eventPayments;

  const paymentsQuery = useAdminEventPayments(eventPaymentsFilter);

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const paymentDetailsQuery = useAdminEventPaymentDetails(selectedPaymentId);

  const stats = paymentsQuery.data?.stats;

  const topStats = useMemo(
    () => [
      { label: "Total", value: stats?.total || 0 },
      { label: "Paid", value: stats?.paid || 0 },
      { label: "Pending", value: stats?.pending || 0 },
      { label: "Failed", value: stats?.failed || 0 },
      { label: "Revenue", value: formatCurrency(stats?.paidRevenue || 0) },
    ],
    [stats]
  );

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Event Payments"
        description="Monitor paid event transactions, payment health, and verification details."
      />

      <Card className="rounded-2xl border-border/60 bg-card">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-5">
          <Input
            placeholder="Search order id, event, user"
            value={eventPaymentsFilter.search}
            onChange={(event) => updateFilter("eventPayments", { search: event.target.value, page: 1 })}
          />

          <Select
            value={eventPaymentsFilter.status}
            onValueChange={(value) => updateFilter("eventPayments", { status: value, page: 1 })}
          >
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
            placeholder="Filter by event id"
            value={eventPaymentsFilter.eventId}
            onChange={(event) => updateFilter("eventPayments", { eventId: event.target.value, page: 1 })}
          />

          <Input
            placeholder="Filter by user id"
            value={eventPaymentsFilter.userId}
            onChange={(event) => updateFilter("eventPayments", { userId: event.target.value, page: 1 })}
          />

          <Button
            variant="outline"
            onClick={() =>
              updateFilter("eventPayments", {
                page: 1,
                search: "",
                status: "all",
                eventId: "",
                userId: "",
                sortBy: "createdAt:desc",
              })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 bg-card">
        <CardContent className="grid grid-cols-2 gap-3 p-4 md:grid-cols-5">
          {topStats.map((entry) => (
            <div key={entry.label}>
              <p className="text-xs text-muted-foreground">{entry.label}</p>
              <p className="text-lg font-semibold">{entry.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {paymentsQuery.isLoading ? (
        <AdminLoadingBlock rows={6} />
      ) : paymentsQuery.data?.data?.length ? (
        <div className="space-y-3">
          {paymentsQuery.data.data.map((payment) => (
            <Card key={payment._id} className="rounded-2xl border-border/60 bg-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{payment.eventName}</p>
                    <p className="text-xs text-muted-foreground">
                      User: {payment.userName} ({payment.userEmail || "-"})
                    </p>
                    <p className="text-xs text-muted-foreground">Order: {payment.razorpayOrderId}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {payment.createdAt ? format(new Date(payment.createdAt), "dd MMM yyyy hh:mm a") : "-"}
                    </p>
                    {payment.failureReason ? (
                      <p className="text-xs text-red-600 dark:text-red-400">Failure: {payment.failureReason}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={payment.status} />
                    <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPaymentId(payment._id)}>
                      <Eye className="mr-1 h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={paymentsQuery.data?.pagination}
            onPageChange={(page) => updateFilter("eventPayments", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No event payments found" description="Transactions appear here once paid events receive orders." />
      )}

      <Dialog open={Boolean(selectedPaymentId)} onOpenChange={(open) => (!open ? setSelectedPaymentId(null) : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Deep-dive payment and verification data for support/admin use.</DialogDescription>
          </DialogHeader>

          {paymentDetailsQuery.isLoading ? (
            <AdminLoadingBlock rows={4} />
          ) : paymentDetailsQuery.data?.data ? (
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">{paymentDetailsQuery.data.data.status}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(paymentDetailsQuery.data.data.amount)}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">Razorpay Order ID</p>
                <p className="font-mono text-xs">{paymentDetailsQuery.data.data.razorpayOrderId || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">Razorpay Payment ID</p>
                <p className="font-mono text-xs">{paymentDetailsQuery.data.data.razorpayPaymentId || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">Failure Reason</p>
                <p className="font-medium">{paymentDetailsQuery.data.data.failureReason || "-"}</p>
              </div>
            </div>
          ) : (
            <AdminEmptyState title="No payment details" description="Unable to load details for this payment." />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventPayments;
