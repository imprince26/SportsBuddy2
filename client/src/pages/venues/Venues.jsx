import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Filter,
  Star,
  Users,
  Calendar,
  ArrowRight,
  Navigation,
  Phone,
  Globe,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { useVenue } from '@/hooks/useVenue';
import VenueCard from '@/components/venues/VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



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

  useEffect(() => {
    getVenues();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
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
      priceRange: '',
      sortBy: 'createdAt:desc'
    };
    setFilters(defaultFilters);
    getVenues(defaultFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Discover World-Class <span className="text-primary">Sports Venues</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Find and book the perfect field, court, or gym for your next game. Verified venues with real-time availability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search venues by name, city, or sport..."
                  className="pl-10 h-12 text-base bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sport</label>
                  <Select value={filters.sport} onValueChange={(v) => handleFilterChange('sport', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
                  <Select value={filters.priceRange} onValueChange={(v) => handleFilterChange('priceRange', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="0-20">Under ₹20/hr</SelectItem>
                      <SelectItem value="20-50">₹20 - ₹50/hr</SelectItem>
                      <SelectItem value="50-100">₹50 - ₹100/hr</SelectItem>
                      <SelectItem value="100-plus">₹100+/hr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt:desc">Newest Added</SelectItem>
                      <SelectItem value="rating:desc">Highest Rated</SelectItem>
                      <SelectItem value="price:asc">Price: Low to High</SelectItem>
                      <SelectItem value="price:desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Venues Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : venues.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {venues.map((venue) => (
                <VenueCard key={venue._id} venue={venue} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-16 gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => getVenues(filters, pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => getVenues(filters, pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No venues found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any venues matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Venues;
