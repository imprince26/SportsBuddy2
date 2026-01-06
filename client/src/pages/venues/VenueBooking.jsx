import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Banknote,
  Info,
  Shield,
  IndianRupee,
  Star,
  Users
} from 'lucide-react';
import { MdStadium } from 'react-icons/md';
import { useVenue } from '@/hooks/useVenue';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const VenueBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentVenue, loading, getVenueById, bookVenue } = useVenue();
  const { user } = useAuth();

  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to book a venue');
      navigate('/login');
      return;
    }
    if (id) {
      getVenueById(id);
    }
  }, [id, user]);

  useEffect(() => {
    if (startTime && duration) {
      const [hours, minutes] = startTime.split(':');
      const start = new Date();
      start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
      setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
    }
  }, [startTime, duration]);

  const calculateTotal = () => {
    if (!currentVenue?.pricing?.hourlyRate) return 0;
    return currentVenue.pricing.hourlyRate * duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startTime) {
      toast.error('Please select a start time');
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        startTime: new Date(`${bookingDate}T${startTime}`),
        endTime: new Date(`${bookingDate}T${endTime}`),
        eventId: null,
        notes,
        paymentMethod
      };

      const result = await bookVenue(id, bookingData);

      if (result.success) {
        toast.success('Booking confirmed! Redirecting...');
        setTimeout(() => {
          navigate(`/my-bookings`);
        }, 1500);
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !currentVenue) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-24 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/venues/${id}`)}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue
          </Button>

          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-6 sm:p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <MdStadium className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Venue Booking</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Complete Your Booking</h1>
              <p className="opacity-90 text-sm sm:text-base">You're one step away from booking {currentVenue.name}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit}>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Select Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-border focus-visible:ring-primary"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-medium">Start Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="pl-10 border-border focus-visible:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          className="pl-10 bg-muted border-border"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Duration (Hours)</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setDuration(hrs)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all",
                            duration === hrs
                              ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-primary/5'
                          )}
                        >
                          {hrs}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-border focus-visible:ring-primary resize-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Payment Method *</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className={cn(
                        "flex items-center space-x-3 border rounded-xl p-4 transition-all cursor-pointer",
                        paymentMethod === 'cash' ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}>
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Banknote className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Cash Payment</p>
                            <p className="text-sm text-muted-foreground">Pay at the venue upon arrival</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-xl p-4 opacity-50 cursor-not-allowed border-border">
                        <RadioGroupItem value="online" id="online" disabled />
                        <Label htmlFor="online" className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-muted">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Online Payment</p>
                            <p className="text-sm text-muted-foreground">Coming soon</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <Alert className="border-primary/20 bg-primary/5">
                      <Info className="w-4 h-4 text-primary" />
                      <AlertDescription className="text-sm mt-1">
                        Payment will be collected at the venue upon arrival. Please bring the exact amount.
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-border">
                    <Button
                      type="submit"
                      className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      disabled={submitting || !startTime}
                    >
                      {submitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Confirm Booking • ₹{calculateTotal()}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </motion.div>

          {/* Booking Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-4">
              {/* Venue Info Card */}
              <Card className="border-border overflow-hidden">
                <CardHeader className="p-0">
                  {currentVenue.images?.[0] && (
                    <div className="relative h-40">
                      <img
                        src={currentVenue.images[0].url}
                        alt={currentVenue.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-semibold text-white text-lg truncate">{currentVenue.name}</h3>
                      </div>
                      {currentVenue.isVerified && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-0">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>{currentVenue.location?.address}, {currentVenue.location?.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span>{currentVenue.averageRating || 'New'} • {currentVenue.ratings?.length || 0} reviews</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentVenue.sports?.slice(0, 3).map((sport, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-0">{sport}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Summary Card */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price per hour</span>
                      <span className="font-medium">₹{currentVenue.pricing?.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">₹{calculateTotal()}</span>
                    </div>
                  </div>

                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertDescription className="text-sm">
                      Free cancellation up to 24 hours before
                    </AlertDescription>
                  </Alert>

                  {bookingDate && startTime && (
                    <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
                      <p className="font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        Booking Summary
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(bookingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {startTime} - {endTime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VenueBooking;
