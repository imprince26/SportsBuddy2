import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  MapPin,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Banknote,
  AlertCircle,
  Info
} from 'lucide-react';
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

  // Calculate end time based on duration
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
          navigate(`/dashboard`);
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
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/venues/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue
          </Button>

          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="opacity-90">You're just one step away from booking {currentVenue.name}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Select Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          className="pl-10 bg-muted"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Duration (Hours)</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setDuration(hrs)}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                            duration === hrs
                              ? 'border-primary bg-primary text-primary-foreground shadow-md'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {hrs}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <Label>Payment Method *</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Banknote className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Cash Payment</p>
                            <p className="text-sm text-muted-foreground">Pay at the venue</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border rounded-lg p-4 opacity-50 cursor-not-allowed">
                        <RadioGroupItem value="online" id="online" disabled />
                        <Label htmlFor="online" className="flex items-center gap-3 flex-1">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Online Payment</p>
                            <p className="text-sm text-muted-foreground">Coming soon</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>
                        Payment will be collected at the venue upon arrival. Please bring the exact amount.
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      className="w-full h-12 text-lg"
                      disabled={submitting || !startTime}
                    >
                      {submitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-4">
              {/* Venue Info */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Venue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentVenue.images?.[0] && (
                    <img
                      src={currentVenue.images[0].url}
                      alt={currentVenue.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{currentVenue.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{currentVenue.location?.address}, {currentVenue.location?.city}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {currentVenue.sports?.slice(0, 3).map((sport, idx) => (
                      <Badge key={idx} variant="secondary">{sport}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
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

                  <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Free cancellation up to 24 hours before booking
                    </AlertDescription>
                  </Alert>

                  {bookingDate && startTime && (
                    <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                      <p className="font-medium">Booking Summary:</p>
                      <p className="text-muted-foreground">
                        {new Date(bookingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted-foreground">
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
