import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  const getStatusBadge = (status) => {
    const config = {
      confirmed: { variant: 'default', icon: CheckCircle, label: 'Confirmed', color: 'text-green-600' },
      pending: { variant: 'secondary', icon: AlertCircle, label: 'Pending', color: 'text-yellow-600' },
      cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelled', color: 'text-red-600' }
    };
    
    const { variant, icon: Icon, label, color } = config[status] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
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
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                My Bookings
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage your venue bookings
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                    <p className="text-3xl font-bold mt-2">{upcomingBookings}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Past Bookings</p>
                    <p className="text-3xl font-bold mt-2">{pastBookings}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-3xl font-bold mt-2">₹{totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by venue name or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
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
            filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link 
                              to={`/venues/${booking.venue?._id}`}
                              className="text-xl font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2"
                            >
                              <Building2 className="w-5 h-5" />
                              {booking.venue?.name || 'Venue'}
                            </Link>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.venue?.location?.address}, {booking.venue?.location?.city}</span>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {format(new Date(booking.startTime), 'hh:mm a')} - {format(new Date(booking.endTime), 'hh:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">₹{booking.totalAmount || booking.amount}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Notes:</span> {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailsDialog(true);
                          }}
                          className="flex-1 lg:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 lg:flex-none"
                        >
                          <Link to={`/venues/${booking.venue?._id}`}>
                            View Venue
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'You haven\'t made any bookings yet'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button asChild>
                    <Link to="/venues">Browse Venues</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete information about your booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-mono font-semibold">
                      #{selectedBooking._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Venue Information
                  </h4>
                  <div className="space-y-2 pl-7">
                    <p className="font-medium">{selectedBooking.venue?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedBooking.venue?.location?.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedBooking.venue?.contactInfo?.phone || 'Not available'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-7">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{format(new Date(selectedBooking.startTime), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Slot</p>
                      <p className="font-medium">
                        {format(new Date(selectedBooking.startTime), 'hh:mm a')} - {format(new Date(selectedBooking.endTime), 'hh:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedBooking.duration || 'N/A'} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="font-semibold text-lg text-primary">₹{selectedBooking.totalAmount || selectedBooking.amount}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Payment Method: <span className="font-medium text-foreground">Cash</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Booked on: {format(new Date(selectedBooking.bookingDate || selectedBooking.createdAt), 'PPP')}
                    </p>
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
