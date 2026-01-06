import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Phone,
  IndianRupee,
  CalendarDays,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { MdStadium } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, [statusFilter]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/my-bookings', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });

      if (response.data.success) {
        setBookings(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load your bookings';
      toast.error(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      confirmed: {
        variant: 'default',
        icon: CheckCircle,
        label: 'Confirmed',
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20'
      },
      pending: {
        variant: 'secondary',
        icon: AlertCircle,
        label: 'Pending',
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/20'
      },
      cancelled: {
        variant: 'destructive',
        icon: XCircle,
        label: 'Cancelled',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20'
      }
    };
    return config[status] || config.pending;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const upcomingBookings = filteredBookings.filter(b =>
    new Date(b.startTime) > new Date() && b.status !== 'cancelled'
  ).length;

  const pastBookings = filteredBookings.filter(b =>
    new Date(b.startTime) < new Date()
  ).length;

  const totalSpent = filteredBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-16 rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-6 sm:p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Your Bookings</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Bookings</h1>
                <p className="opacity-90 text-sm sm:text-base mt-1">View and manage your venue reservations</p>
              </div>
              <Link to="/venues">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <MdStadium className="w-4 h-4 mr-2" />
                  Browse Venues
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          {[
            { label: 'Upcoming', value: upcomingBookings, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Completed', value: pastBookings, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          ].map((stat, i) => (
            <Card key={i} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by venue name or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border focus-visible:ring-primary"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const isUpcoming = new Date(booking.startTime) > new Date();

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "border-border hover:border-primary/30 transition-all hover:shadow-md overflow-hidden",
                    isUpcoming && booking.status === 'confirmed' && "border-l-4 border-l-primary"
                  )}>
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Venue Image */}
                        {booking.venue?.images?.[0] && (
                          <div className="lg:w-48 h-32 lg:h-auto flex-shrink-0">
                            <img
                              src={booking.venue.images[0].url}
                              alt={booking.venue?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <Link
                                to={`/venues/${booking.venue?._id}`}
                                className="text-lg font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                              >
                                {booking.venue?.name || 'Venue'}
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </Link>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{booking.venue?.location?.address}, {booking.venue?.location?.city}</span>
                              </div>
                            </div>
                            <Badge className={cn(
                              "flex items-center gap-1 self-start",
                              statusConfig.bg,
                              statusConfig.text,
                              statusConfig.border,
                              "border"
                            )}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="font-medium">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{format(new Date(booking.startTime), 'hh:mm a')} - {format(new Date(booking.endTime), 'hh:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-4 h-4 text-primary" />
                              <span className="font-semibold">₹{booking.totalAmount || booking.amount}</span>
                            </div>
                            {isUpcoming && booking.status === 'confirmed' && (
                              <Badge variant="outline" className="w-fit border-primary/30 text-primary bg-primary/5">
                                Upcoming
                              </Badge>
                            )}
                          </div>

                          {booking.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Notes:</span> {booking.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailsDialog(true);
                              }}
                              className="hover:bg-primary/5 hover:border-primary/30"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-primary/5 hover:border-primary/30"
                            >
                              <Link to={`/venues/${booking.venue?._id}`}>
                                <MdStadium className="w-4 h-4 mr-2" />
                                View Venue
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <CalendarDays className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your filters to find your bookings'
                      : "You haven't made any venue bookings yet. Start exploring our venues!"}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/venues">
                        <MdStadium className="w-4 h-4 mr-2" />
                        Browse Venues
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Booking Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Booking Details
              </DialogTitle>
              <DialogDescription>
                Complete information about your booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-5">
                {/* Booking ID & Status */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Booking ID</p>
                    <p className="font-mono font-semibold text-lg">#{selectedBooking._id.slice(-8).toUpperCase()}</p>
                  </div>
                  {(() => {
                    const config = getStatusConfig(selectedBooking.status);
                    const Icon = config.icon;
                    return (
                      <Badge className={cn("flex items-center gap-1", config.bg, config.text, config.border, "border")}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Venue Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                    <MdStadium className="w-4 h-4 text-primary" />
                    Venue
                  </h4>
                  <Card className="border-border">
                    <CardContent className="p-4 space-y-2">
                      <p className="font-semibold text-lg">{selectedBooking.venue?.name}</p>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <span>{selectedBooking.venue?.location?.address}, {selectedBooking.venue?.location?.city}</span>
                      </div>
                      {selectedBooking.venue?.contactInfo?.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{selectedBooking.venue.contactInfo.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-border">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{format(new Date(selectedBooking.startTime), 'PPP')}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-medium">{format(new Date(selectedBooking.startTime), 'hh:mm a')} - {format(new Date(selectedBooking.endTime), 'hh:mm a')}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">{selectedBooking.duration || 'N/A'} hours</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-primary/5">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-bold text-lg text-primary">₹{selectedBooking.totalAmount || selectedBooking.amount}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Payment Info */}
                <div className="p-4 bg-muted/50 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">Cash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booked on</span>
                    <span className="font-medium">{format(new Date(selectedBooking.bookingDate || selectedBooking.createdAt), 'PPP')}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyBookings;
