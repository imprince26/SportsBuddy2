import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Users,
  DollarSign,
  IndianRupee,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  CalendarCheck,
  Download
} from 'lucide-react';
import { FaMoneyBillWave } from "react-icons/fa";
import { useVenue } from '@/hooks/useVenue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';

const AdminVenues = () => {
  const navigate = useNavigate();
  const { venues, getVenues, deleteVenue, loading, filters, setFilters } = useVenue();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    getVenues();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
    getVenues({ ...filters, search: value }, 1);
  };

  const handleSportFilter = (sport) => {
    setFilters({ ...filters, sport });
    getVenues({ ...filters, sport }, 1);
  };

  const handleDeleteClick = (venue) => {
    setVenueToDelete(venue);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (venueToDelete) {
      const result = await deleteVenue(venueToDelete._id);
      if (result.success) {
        toast.success('Venue deleted successfully');
        // Refresh venues list to show updated data
        await getVenues(filters, 1);
      }
      setDeleteDialogOpen(false);
      setVenueToDelete(null);
    }
  };

  const handleEdit = (venueId) => {
    navigate(`/admin/edit-venue/${venueId}`);
  };

  const handleView = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  const handleExportVenues = async () => {
    try {
      // Create CSV content
      const headers = ["Name", "Location", "Sports", "Capacity", "Price/Hour", "Status", "Verified"];
      const csvContent = [
        headers.join(","),
        ...venues.map((venue) =>
          [
            `"${venue.name || ""}"`,
            `"${venue.location?.city || ""}, ${venue.location?.state || ""}"`,
            `"${venue.sports?.join(", ") || ""}"`,
            `"${venue.capacity || 0}"`,
            `"${venue.pricing?.hourlyRate || 0}"`,
            `"${venue.isActive !== false ? "Active" : "Inactive"}"`,
            `"${venue.isVerified ? "Yes" : "No"}"`,
          ].join(","),
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `sportsbuddy-venues-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success("Venues exported successfully!");
    } catch (err) {
      console.error("Failed to export venues:", err);
      toast.error("Failed to export venues");
    }
  };

  const VenueCard = ({ venue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Venue Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {venue.images && venue.images.length > 0 ? (
            <img
              src={venue.images[0].url || venue.images[0]}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Building2 className="w-16 h-16 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant={venue.isActive !== false ? 'default' : 'secondary'} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm">
              {venue.isActive !== false ? 'Active' : 'Inactive'}
            </Badge>
            {venue.isVerified && (
              <Badge variant="default" className="bg-green-500/90 text-white backdrop-blur shadow-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title and Location */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                {venue.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">
                  {venue.location?.city || 'Location not set'}
                  {venue.location?.state && `, ${venue.location.state}`}
                </span>
              </div>
            </div>

            {/* Sports */}
            <div className="flex flex-wrap gap-2">
              {venue.sports?.slice(0, 3).map((sport, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {sport}
                </Badge>
              ))}
              {venue.sports?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{venue.sports.length - 3} more
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="font-semibold text-foreground">{venue.capacity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Per Hour</p>
                  <p className="font-semibold text-foreground">₹{venue.pricing?.hourlyRate || 0}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleView(venue._id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(venue._id)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(venue)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, idx) => (
        <TableRow key={idx}>
          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const GridSkeleton = () => (
    <>
      {[...Array(6)].map((_, idx) => (
        <Card key={idx} className="border-border">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          {/* Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 text-white shadow-xl mb-6">
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
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1 leading-tight">Venue Management</h1>
                  <p className="text-white/90 text-sm sm:text-base">Manage all sports venues on the platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportVenues} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white shrink-0">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => navigate('/admin/create-venue')} className="bg-white text-slate-900 hover:bg-white/90 shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Venue
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Venues</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{venues.length}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200/20 dark:border-blue-700/20">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {venues.filter(v => v.isActive !== false).length}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200/20 dark:border-green-700/20">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Capacity</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {venues.reduce((sum, v) => sum + (v.capacity || 0), 0)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200/20 dark:border-indigo-700/20">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Price/Hour</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{venues.length > 0 ? Math.round(venues.reduce((sum, v) => sum + (v.pricing?.hourlyRate || 0), 0) / venues.length) : 0}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200/20 dark:border-orange-700/20">
                    <FaMoneyBillWave className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search venues by name, location..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.sport} onValueChange={handleSportFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Tennis">Tennis</SelectItem>
                <SelectItem value="Cricket">Cricket</SelectItem>
                <SelectItem value="Volleyball">Volleyball</SelectItem>
                <SelectItem value="Badminton">Badminton</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Building2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Venues List */}
        {viewMode === 'table' ? (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sports</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price/Hour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : venues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground">No venues found</p>
                      <p className="text-muted-foreground">Create your first venue to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  venues.map((venue) => (
                    <TableRow key={venue._id} className="hover:bg-accent transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {venue.images && venue.images.length > 0 ? (
                            <img
                              src={venue.images[0].url || venue.images[0]}
                              alt={venue.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <span className="line-clamp-1">{venue.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="line-clamp-1">
                            {venue.location?.city || 'Not set'}
                            {venue.location?.state && `, ${venue.location.state}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {venue.sports?.slice(0, 2).map((sport, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {sport}
                            </Badge>
                          ))}
                          {venue.sports?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{venue.sports.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {venue.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold">
                          ₹{venue.pricing?.hourlyRate || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={venue.isActive !== false ? 'default' : 'secondary'}>
                            {venue.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                          {venue.isVerified && (
                            <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleView(venue._id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/venues/${venue._id}/bookings`}>
                                <CalendarCheck className="w-4 h-4 mr-2" />
                                View Bookings
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(venue._id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Venue
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(venue)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Venue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <GridSkeleton />
            ) : venues.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">No venues found</p>
                <p className="text-muted-foreground mb-6">Create your first venue to get started</p>
                <Button onClick={() => navigate('/admin/create-venue')} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Venue
                </Button>
              </div>
            ) : (
              venues.map((venue) => <VenueCard key={venue._id} venue={venue} />)
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the venue "{venueToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVenues;
