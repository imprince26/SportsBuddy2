import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  DollarSign,
  IndianRupee,
  MapPin,
  Filter,
  Search,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  Phone,
  Mail,
  MoreVertical
} from 'lucide-react';
import { useVenue } from '@/hooks/useVenue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';

const VenueBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentVenue, loading, getVenueById, getVenueBookings } = useVenue();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getVenueById(id);
      fetchBookings();
    }
  }, [id]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const result = await getVenueBookings(id);
      if (result) {
        setBookings(result.bookings || []);
        setStats(result.stats || {});
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.user?.name?.toLowerCase().includes(term) ||
          booking.user?.email?.toLowerCase().includes(term) ||
          booking._id?.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      pending: { variant: 'secondary', icon: AlertCircle, color: 'text-yellow-600' },
      cancelled: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  if (loading || !currentVenue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <Skeleton className="h-[600px] w-full" />
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
            onClick={() => navigate('/admin/venues')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 text-white shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Venue Bookings</h1>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span>{currentVenue.name}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats?.confirmed + stats?.pending + stats?.cancelled || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.confirmed || 0}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats?.totalRevenue || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                  <IndianRupee className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user name, email, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Bookings List ({filteredBookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No bookings found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {statusFilter !== 'all' ? 'Try changing the filter' : 'Bookings will appear here'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={booking.user?.avatar} />
                                <AvatarFallback>{booking.user?.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.user?.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{formatDateTime(booking.startTime)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'long' })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {calculateDuration(booking.startTime, booking.endTime)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">₹{booking.amount || 0}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {booking.user?.phone && (
                                  <DropdownMenuItem asChild>
                                    <a href={`tel:${booking.user.phone}`}>
                                      <Phone className="w-4 h-4 mr-2" />
                                      Call Customer
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                {booking.user?.email && (
                                  <DropdownMenuItem asChild>
                                    <a href={`mailto:${booking.user.email}`}>
                                      <Mail className="w-4 h-4 mr-2" />
                                      Email Customer
                                    </a>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Complete information about this booking</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedBooking.user?.avatar} />
                    <AvatarFallback>{selectedBooking.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedBooking.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.user?.email}</p>
                    {selectedBooking.user?.phone && (
                      <p className="text-sm text-muted-foreground">{selectedBooking.user?.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                    <p className="font-medium">{formatDateTime(selectedBooking.startTime)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">End Time</p>
                    <p className="font-medium">{formatDateTime(selectedBooking.endTime)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{calculateDuration(selectedBooking.startTime, selectedBooking.endTime)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Information
                </h3>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold">₹{selectedBooking.amount || 0}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-medium">Cash on Arrival</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h3 className="font-semibold mb-3">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueBookings;
