import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Eye,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { FaMoneyBillWave } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const AllVenueBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchAllBookings();
  }, [statusFilter]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/venue-bookings', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const total = bookingsData.length;
    const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
    const pending = bookingsData.filter(b => b.status === 'pending').length;
    const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
    const revenue = bookingsData
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    setStats({ total, confirmed, pending, cancelled, revenue });
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const handleExportData = () => {
    toast.success('Export functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-primary" />
            All Venue Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all venue bookings across the platform
          </p>
        </div>
        <Button onClick={handleExportData} className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <CalendarCheck className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">{stats.confirmed}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">₹{stats.revenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <FaMoneyBillWave className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by venue, customer name, or email..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-mono text-sm">
                      #{booking._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <Link
                          to={`/venues/${booking.venue?._id}`}
                          className="hover:underline font-medium"
                        >
                          {booking.venue?.name || 'N/A'}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(booking.startTime), 'hh:mm a')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.duration} hrs</TableCell>
                    <TableCell className="font-semibold">₹{booking.totalAmount}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-mono font-semibold">
                    #{selectedBooking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Venue Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedBooking.venue?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedBooking.venue?.location?.address}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedBooking.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedBooking.user?.email}</span>
                  </div>
                  {selectedBooking.user?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedBooking.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p>{format(new Date(selectedBooking.startTime), 'PPp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p>{format(new Date(selectedBooking.endTime), 'PPp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p>{selectedBooking.duration} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg">₹{selectedBooking.totalAmount}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllVenueBookings;
