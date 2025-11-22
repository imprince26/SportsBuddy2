import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Trophy, 
  UserPlus, 
  UserCheck,
  ChevronRight,
  Star,
  Activity,
  Dumbbell,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SportsBuddyLoader from '@/components/Loader';

const AthleteCard = ({ athlete, onFollow, isFollowing, currentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Card className="overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-full flex flex-col">
        <div className="h-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-10 left-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-900 shadow-md">
                <AvatarImage src={athlete.avatar?.url} alt={athlete.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-xl">
                  {athlete.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {athlete.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
              )}
            </div>
          </div>
        </div>

        <CardHeader className="pt-12 pb-2 px-6">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/profile/${athlete._id}`} className="group-hover:text-blue-600 transition-colors">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                  {athlete.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{athlete.username}</p>
            </div>
            {athlete.stats?.rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                  {athlete.stats.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 py-2 flex-grow space-y-4">
          {athlete.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[2.5rem]">
              {athlete.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {athlete.sportsPreferences?.slice(0, 3).map((pref, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20 border-0"
              >
                {pref.sport}
              </Badge>
            ))}
            {athlete.sportsPreferences?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{athlete.sportsPreferences.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">
                {athlete.location?.city || 'Unknown Location'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{athlete.stats?.eventsParticipated || 0} Events</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <Link to={`/profile/${athlete._id}`} className="flex-1">
            <Button variant="outline" className="w-full text-xs h-9 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800">
              View Profile
            </Button>
          </Link>
          {currentUser && currentUser._id !== athlete._id && (
            <Button 
              size="sm"
              onClick={() => onFollow(athlete._id)}
              className={`h-9 px-3 transition-all duration-300 ${
                isFollowing 
                  ? "bg-gray-100 text-gray-900 hover:bg-red-50 hover:text-red-600 border border-gray-200" 
                  : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
              }`}
            >
              {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Athletes = () => {
  const { 
    athletes, 
    loading, 
    getAllAthletes, 
    toggleFollowAthlete,
    filters,
    setFilters,
    pagination
  } = useAthletes();
  const { user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getAllAthletes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    getAllAthletes({ ...filters, search: searchQuery });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    getAllAthletes(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery("");
    const defaultFilters = {
      search: '',
      sport: 'all',
      skillLevel: 'all',
      location: '',
      sortBy: 'joinedDate:desc'
    };
    setFilters(defaultFilters);
    getAllAthletes(defaultFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Find Your Perfect <span className="text-primary">Sports Buddy</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Connect with athletes, join teams, and elevate your game. Discover talented individuals in your area.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Search by name, username, or location..." 
                  className="pl-10 h-12 text-base bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 rounded-xl"
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
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
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
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill Level</label>
                  <Select value={filters.skillLevel} onValueChange={(v) => handleFilterChange('skillLevel', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
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
                      <SelectItem value="joinedDate:desc">Newest Members</SelectItem>
                      <SelectItem value="rating:desc">Highest Rated</SelectItem>
                      <SelectItem value="followers:desc">Most Popular</SelectItem>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : athletes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {athletes.map((athlete) => (
                <AthleteCard
                  key={athlete._id}
                  athlete={athlete}
                  currentUser={user}
                  isFollowing={athlete.isFollowing}
                  onFollow={toggleFollowAthlete}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => getAllAthletes(filters, pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => getAllAthletes(filters, pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No athletes found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any athletes matching your criteria. Try adjusting your filters or search terms.
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

export default Athletes;
