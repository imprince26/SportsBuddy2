import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Star,
  Building2,
  CheckCircle2,
  Sparkles,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { MdStadium } from "react-icons/md";
import { useVenue } from '@/hooks/useVenue';
import VenueCard from '@/components/venues/VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

// Sports categories for quick filters
const sportsCategories = [
  { value: 'all', label: 'All Sports' },
  { value: 'Football', label: 'Football' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Tennis', label: 'Tennis' },
  { value: 'Cricket', label: 'Cricket' },
  { value: 'Swimming', label: 'Swimming' },
  { value: 'Badminton', label: 'Badminton' },
  { value: 'Volleyball', label: 'Volleyball' },
];

// Price range options
const priceRanges = [
  { value: 'all', label: 'Any Price' },
  { value: '0-500', label: 'Under ₹500/hr' },
  { value: '500-1000', label: '₹500 - ₹1000/hr' },
  { value: '1000-2000', label: '₹1000 - ₹2000/hr' },
  { value: '2000-plus', label: '₹2000+/hr' },
];

// Featured Venues Section
const FeaturedVenues = ({ venues }) => {
  if (!venues || venues.length === 0) return null;

  const featured = venues.filter(v => v.isVerified).slice(0, 3);
  if (featured.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Featured Venues</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map((venue, i) => (
          <Link key={venue._id} to={`/venues/${venue._id}`}>
            <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 transition-all group overflow-hidden h-full">
              <div className="relative h-32 overflow-hidden">
                <img
                  src={venue.images?.length > 0 ? venue.images[0].url : '/venues/default-venue.png'}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  #{i + 1}
                </Badge>
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="font-semibold text-white truncate">{venue.name}</h3>
                  <div className="flex items-center text-white/80 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{venue.location?.city}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {venue.sports?.slice(0, 2).map((sport, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-primary">
                    ₹{venue.pricing?.hourlyRate}/hr
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

// Loading Skeleton
const VenuesSkeleton = ({ viewMode }) => (
  <div className={cn(
    "grid gap-6",
    viewMode === "grid"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1 lg:grid-cols-2"
  )}>
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="border-border overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ onClear }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 px-4 text-center"
  >
    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <MdStadium className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-2xl font-bold text-foreground mb-2">No venues found</h3>
    <p className="text-muted-foreground max-w-md mb-8">
      We couldn't find any venues matching your criteria. Try adjusting your filters or search terms.
    </p>
    <Button onClick={onClear} variant="outline" className="border-primary/30 hover:bg-primary/10">
      <X className="w-4 h-4 mr-2" />
      Clear all filters
    </Button>
  </motion.div>
);

const Venues = () => {
  const {
    venues,
    loading,
    getVenues,
    filters,
    setFilters,
    pagination
  } = useVenue();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    getVenues();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    getVenues({ ...filters, search: searchQuery });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    getVenues(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery("");
    const defaultFilters = {
      search: '',
      sport: 'all',
      city: '',
      priceRange: 'all',
      sortBy: 'createdAt:desc'
    };
    setFilters(defaultFilters);
    getVenues(defaultFilters);
  };

  const hasActiveFilters = filters.sport !== 'all' || filters.priceRange !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-background/50 backdrop-blur-sm">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.12),transparent_50%)]" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-12 lg:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <MdStadium className="w-4 h-4" />
              <span>{pagination?.total || venues.length}+ Premium Venues Available</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground">
              Find & Book <br />
              <span className="text-primary relative inline-block">
                Amazing Venues
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C47.6667 2.16667 152.4 -1.9 199 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/30" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover world-class sports facilities near you. Book courts, fields, and gyms instantly with verified venues and real-time availability.
            </p>

            {/* Search Bar - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search venues..."
                  className="pl-12 h-12 text-base bg-card border-border focus-visible:ring-primary rounded-xl shadow-lg shadow-black/5"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "h-12 px-4 rounded-xl border-border hover:bg-muted aspect-square sm:aspect-auto",
                  isFilterOpen && "bg-primary/10 border-primary/30"
                )}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Sport Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {sportsCategories.slice(1, 7).map((sport) => (
                <Button
                  key={sport.value}
                  variant={filters.sport === sport.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full px-4 transition-all",
                    filters.sport === sport.value
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "border-border hover:border-primary/30 hover:bg-primary/10"
                  )}
                  onClick={() => handleFilterChange('sport', sport.value === filters.sport ? 'all' : sport.value)}
                >
                  {sport.label}
                </Button>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Verified Venues</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Instant Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-card overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Advanced Filters
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Sport</label>
                  <Select value={filters.sport} onValueChange={(v) => handleFilterChange('sport', v)}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Select Sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportsCategories.map((sport) => (
                        <SelectItem key={sport.value} value={sport.value}>
                          {sport.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Price Range</label>
                  <Select value={filters.priceRange || 'all'} onValueChange={(v) => handleFilterChange('priceRange', v)}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Select Price" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((price) => (
                        <SelectItem key={price.value} value={price.value}>
                          {price.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt:desc">Newest Added</SelectItem>
                      <SelectItem value="rating:desc">Highest Rated</SelectItem>
                      <SelectItem value="price:asc">Price: Low to High</SelectItem>
                      <SelectItem value="price:desc">Price: High to Low</SelectItem>
                      <SelectItem value="bookings:desc">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <Input
                    placeholder="Enter city name..."
                    value={filters.city || ''}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Featured Venues */}
        {!loading && venues.length > 0 && (
          <FeaturedVenues venues={venues} />
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {hasActiveFilters ? 'Search Results' : 'All Venues'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${venues.length} venues`}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="grid" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Grid3X3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Venues Grid */}
        {loading ? (
          <VenuesSkeleton viewMode={viewMode} />
        ) : venues.length > 0 ? (
          <>
            <motion.div
              layout
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 lg:grid-cols-2"
              )}
            >
              <AnimatePresence>
                {venues.map((venue, index) => (
                  <motion.div
                    key={venue._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <VenueCard venue={venue} variant={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => getVenues(filters, pagination.currentPage - 1)}
                  className="border-border hover:bg-primary/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-10 h-10",
                          pagination.currentPage === page && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => getVenues(filters, page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="px-2 text-muted-foreground">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10"
                        onClick={() => getVenues(filters, pagination.totalPages)}
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => getVenues(filters, pagination.currentPage + 1)}
                  className="border-border hover:bg-primary/10"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </div>
    </div>
  );
};

export default Venues;
