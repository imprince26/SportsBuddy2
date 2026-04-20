import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/CustomToast";

const formatCurrency = (amount = 0) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
};

const surfaceMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const EventPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated, updateProfile } = useAuth();
  const { getEventById, getEventPaymentStatus, createEventPaymentOrder, verifyEventPayment } = useEvents();

  const eventActionsRef = useRef({
    getEventById,
    getEventPaymentStatus,
  });

  useEffect(() => {
    eventActionsRef.current = {
      getEventById,
      getEventPaymentStatus,
    };
  }, [getEventById, getEventPaymentStatus]);

  const [event, setEvent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  useEffect(() => {
    setPhoneInput(user?.phone || "");
  }, [user?.phone]);

  const fetchPaymentContext = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsBootstrapping(true);

    try {
      const [eventResponse, paymentResponse] = await Promise.all([
        eventActionsRef.current.getEventById(id),
        eventActionsRef.current.getEventPaymentStatus(id),
      ]);

      if (!eventResponse?.success || !eventResponse?.data) {
        showToast.error("Event not found");
        navigate("/events", { replace: true });
        return;
      }

      setEvent(eventResponse.data);

      if (paymentResponse?.success) {
        setPaymentStatus(paymentResponse.data);
      }
    } catch (error) {
      const message = error?.message || "Unable to load payment details";
      showToast.error(message);
      navigate(`/events/${id}`, { replace: true });
    } finally {
      setIsBootstrapping(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    fetchPaymentContext();
  }, [fetchPaymentContext, isAuthenticated, navigate]);

  const registrationFee = useMemo(() => {
    return Number(event?.registrationFee) || Number(paymentStatus?.registrationFee) || 0;
  }, [event?.registrationFee, paymentStatus?.registrationFee]);

  const participantCount = useMemo(() => {
    if (typeof event?.participantCount === "number") {
      return event.participantCount;
    }

    if (Array.isArray(event?.participants)) {
      return event.participants.length;
    }

    return 0;
  }, [event?.participantCount, event?.participants]);

  const isAlreadyParticipant = Boolean(paymentStatus?.isParticipant);
  const isPaid = paymentStatus?.participantPayment?.paymentStatus === "paid";
  const hasPaidButNotJoined = Boolean(paymentStatus?.hasPaidButNotJoined);
  const savedPhone = normalizePhone(user?.phone || "");
  const draftPhone = normalizePhone(phoneInput || "");
  const hasSavedPhone = /^\d{10}$/.test(savedPhone);
  const hasValidDraftPhone = /^\d{10}$/.test(draftPhone);

  const heroStatus = useMemo(() => {
    if (isAlreadyParticipant && isPaid) {
      return {
        label: "Payment Completed",
        description: "Your seat is already confirmed for this event.",
        tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
    }

    if (hasPaidButNotJoined) {
      return {
        label: "Payment Received",
        description: "Your payment is captured. We are reconciling your registration.",
        tone: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      };
    }

    if (paymentStatus?.latestPayment?.status === "failed") {
      return {
        label: "Previous Attempt Failed",
        description: "You can retry payment now. No extra charge is created until a successful capture.",
        tone: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
      };
    }

    return {
      label: "Secure Checkout",
      description: "Complete payment to confirm your seat for this event.",
      tone: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    };
  }, [hasPaidButNotJoined, isAlreadyParticipant, isPaid, paymentStatus?.latestPayment?.status]);

  const handleStartPayment = async () => {
    if (!event || !id) {
      return;
    }

    if (registrationFee <= 0) {
      showToast.info("This event is free. Join directly from event page.");
      navigate(`/events/${id}`);
      return;
    }

    if (isAlreadyParticipant) {
      showToast.info("You are already registered for this event.");
      navigate(`/events/${id}`);
      return;
    }

    if (hasPaidButNotJoined) {
      showToast.info("Payment already received. Syncing your registration status.");
      await fetchPaymentContext();
      return;
    }

    if (!hasSavedPhone) {
      showToast.warning("Please save your 10-digit mobile number before proceeding to payment.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderResponse = await createEventPaymentOrder(id);
      if (!orderResponse?.success) {
        if (orderResponse?.details?.requiresPhone) {
          showToast.warning(orderResponse?.message || "Add mobile number in profile to continue.");
          return;
        }
        showToast.error(orderResponse?.message || "Failed to initialize payment");
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        showToast.error("Unable to load Razorpay checkout script");
        return;
      }

      const payload = orderResponse.data;

      if (payload?.order?.reusedExistingOrder) {
        showToast.info("Continuing your existing pending payment order.");
      }

      openRazorpayCheckout({
        key: payload?.keyId,
        orderId: payload?.order?.id,
        amount: payload?.order?.amount,
        currency: payload?.order?.currency || "INR",
        name: "SportsBuddy",
        description: payload?.event?.name || "Event registration",
        prefill: {
          name: payload?.user?.name || user?.name || "",
          email: payload?.user?.email || user?.email || "",
          contact: payload?.user?.contact || "",
        },
        notes: {
          eventId: payload?.event?.id || id,
          eventName: payload?.event?.name || event.name,
        },
        theme: {
          color: "#1d4ed8",
        },
        modal: {
          ondismiss: () => {
            showToast.info("Payment window closed. You can retry when ready.");
          },
        },
        onSuccess: async (response) => {
          const verifyResponse = await verifyEventPayment(id, response);

          if (!verifyResponse?.success) {
            showToast.error(verifyResponse?.message || "Payment was received, but confirmation failed. Please retry.");
            await fetchPaymentContext();
            return;
          }

          showToast.success("Payment successful. Your seat is confirmed.");
          navigate(`/events/${id}`);
        },
        onFailure: (failureEvent) => {
          const message =
            failureEvent?.error?.description ||
            failureEvent?.error?.reason ||
            "Payment failed. Please try again.";
          showToast.error(message);
          fetchPaymentContext();
        },
      });
    } catch (error) {
      showToast.error(error?.message || "Something went wrong while starting payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSavePhone = async () => {
    const sanitizedPhone = normalizePhone(phoneInput);

    if (!/^\d{10}$/.test(sanitizedPhone)) {
      showToast.warning("Enter a valid 10-digit mobile number.");
      return;
    }

    setIsSavingPhone(true);
    try {
      const formData = new FormData();
      formData.append("phone", sanitizedPhone);

      const result = await updateProfile(formData);
      if (result?.success) {
        showToast.success("Mobile number saved. You can continue to payment.");
        return;
      }

      showToast.error(result?.message || "Unable to save mobile number.");
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Unable to save mobile number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-border/60 bg-card/70 p-10 text-center backdrop-blur-sm">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Loading checkout details</h1>
          <p className="mt-2 text-sm text-muted-foreground">Preparing your event payment context</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold text-foreground">Event not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">The requested event could not be loaded.</p>
          <Button className="mt-6" onClick={() => navigate("/events")}>Back to Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_80%_-20%,rgba(29,78,216,0.18),transparent),radial-gradient(900px_450px_at_10%_120%,rgba(16,185,129,0.14),transparent)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div {...surfaceMotion} className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-border/70 bg-background/70"
            onClick={() => navigate(`/events/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
          <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
            Razorpay Test Mode
          </Badge>
        </motion.div>

        <motion.section
          {...surfaceMotion}
          transition={{ delay: 0.04 }}
          className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        >
          <div className="grid gap-0 lg:grid-cols-[1.45fr_1fr]">
            <div className="space-y-6 p-7 sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                SportsBuddy Secure Registration
              </div>

              <div>
                <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">Complete your event booking</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Pay once and reserve your seat instantly with Razorpay checkout.
                </p>
              </div>

              <div className={cn("rounded-2xl border px-4 py-3 text-sm", heroStatus.tone)}>
                <p className="font-semibold">{heroStatus.label}</p>
                <p className="mt-1 text-xs opacity-90 sm:text-sm">{heroStatus.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Event Date</p>
                  <p className="mt-1 font-semibold text-foreground">{event?.date ? format(new Date(event.date), "EEE, MMM dd, yyyy") : "-"}</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                  <p className="mt-1 line-clamp-1 font-semibold text-foreground">{event?.location?.city || event?.location?.address || "TBA"}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">What happens after payment</p>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>Your participant status becomes confirmed immediately.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Use UPI, cards, net banking, or wallets in one checkout flow.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <Ticket className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Event organizer is notified instantly for the paid seat.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/70 bg-background/65 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <Card className="rounded-2xl border-border/70 bg-card shadow-none">
                <CardHeader className="space-y-3 pb-4">
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                  <p className="text-sm text-muted-foreground">Confirm details before opening secure checkout</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Event</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{event.name}</p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Participants</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {participantCount}/{event?.maxParticipants || 0}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registration fee</span>
                      <span className="text-2xl font-bold text-foreground">{formatCurrency(registrationFee)}</span>
                    </div>
                  </div>

                  {!hasSavedPhone ? (
                    <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                        Mobile number required
                      </p>
                      <p className="text-xs text-amber-700/90 dark:text-amber-300/90">
                        Add your 10-digit mobile number to continue in Razorpay checkout.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          inputMode="numeric"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(event) => setPhoneInput(normalizePhone(event.target.value).slice(0, 10))}
                          placeholder="Enter mobile number"
                          className="h-10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10"
                          onClick={handleSavePhone}
                          disabled={isSavingPhone || !hasValidDraftPhone}
                        >
                          {isSavingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {paymentStatus?.latestPayment?.status === "failed" ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                      Last attempt: {paymentStatus?.latestPayment?.failureReason || "Payment failed"}
                    </div>
                  ) : null}

                  <Button
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleStartPayment}
                    disabled={isProcessingPayment || isAlreadyParticipant || hasPaidButNotJoined || !hasSavedPhone}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening secure checkout...
                      </>
                    ) : hasPaidButNotJoined ? (
                      <>
                        Payment Captured - Syncing
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : isAlreadyParticipant ? (
                      <>
                        Already Registered
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : !hasSavedPhone ? (
                      <>
                        Add Mobile Number to Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Pay {formatCurrency(registrationFee)}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                    Test mode only. Use Razorpay test cards/UPI IDs. Real money will not be charged.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EventPayment;
