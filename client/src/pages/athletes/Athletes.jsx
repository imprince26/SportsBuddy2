import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  Users,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Grid3X3,
  List,
  Sparkles
} from 'lucide-react';
import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import AthleteCard from '@/components/athletes/AthleteCard';

// Sports categories with icons
const sportsCategories = [
  { value: 'all', label: 'All Sports' },
  { value: 'Football', label: 'Football' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Tennis', label: 'Tennis' },
  { value: 'Cricket', label: 'Cricket' },
  { value: 'Running', label: 'Running' },
  { value: 'Swimming', label: 'Swimming' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Badminton', label: 'Badminton' },
];

// Featured Athletes Section
const FeaturedAthletes = ({ athletes, currentUser, onFollow }) => {
  if (!athletes || athletes.length === 0) return null;

  const featured = athletes.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Featured Athletes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map((athlete, i) => (
          <Link key={athlete._id} to={`/profile/${athlete._id}`}>
            <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 transition-all group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/30">
                    <AvatarImage src={athlete.avatar?.url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {athlete.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {athlete.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{athlete.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {athlete.sportsPreferences?.slice(0, 2).map((pref, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                          {pref.sport}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground border-0">
                    <Star className="w-3 h-3 mr-1" />
                    #{i + 1}
                  </Badge>
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
const AthletesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="border-border overflow-hidden">
        <div className="h-20 bg-muted" />
        <CardContent className="pt-12 pb-4 space-y-3">
          <Skeleton className="h-5 w-2/3" />
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
      <Users className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-2xl font-bold text-foreground mb-2">No athletes found</h3>
    <p className="text-muted-foreground max-w-md mb-8">
      We couldn't find any athletes matching your criteria. Try adjusting your filters or search terms.
    </p>
    <Button onClick={onClear} variant="outline" className="border-primary/30 hover:bg-primary/10">
      <X className="w-4 h-4 mr-2" />
      Clear all filters
    </Button>
  </motion.div>
);

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
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    getAllAthletes();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
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

  const hasActiveFilters = filters.sport !== 'all' || filters.skillLevel !== 'all' || searchQuery;



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 py-12 lg:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>Connect with {pagination?.total || athletes.length}+ Athletes</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Find Your Perfect{' '}
              <span className="text-primary">Sports Buddy</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with athletes, join teams, and elevate your game. Discover talented individuals in your area who share your passion for sports.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by name, username, or location..."
                  className="pl-12 h-12 text-base bg-card border-border focus-visible:ring-primary rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "h-12 px-4 rounded-xl border-border hover:bg-muted",
                  isFilterOpen && "bg-primary/10 border-primary/30"
                )}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Sport Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {sportsCategories.slice(1, 6).map((sport) => (
                <Button
                  key={sport.value}
                  variant={filters.sport === sport.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    filters.sport === sport.value
                      ? "bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/30 hover:bg-primary/10"
                  )}
                  onClick={() => handleFilterChange('sport', sport.value === filters.sport ? 'all' : sport.value)}
                >
                  {sport.label}
                </Button>
              ))}
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
                  <label className="text-sm font-medium text-muted-foreground">Skill Level</label>
                  <Select value={filters.skillLevel} onValueChange={(v) => handleFilterChange('skillLevel', v)}>
                    <SelectTrigger className="w-full bg-background border-border">
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
                  <label className="text-sm font-medium text-muted-foreground">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joinedDate:desc">Newest Members</SelectItem>
                      <SelectItem value="rating:desc">Highest Rated</SelectItem>
                      <SelectItem value="followers:desc">Most Popular</SelectItem>
                      <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <Input
                    placeholder="Enter city or area..."
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
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


        {/* Featured Athletes */}
        {!loading && athletes.length > 0 && (
          <FeaturedAthletes
            athletes={athletes}
            currentUser={user}
            onFollow={toggleFollowAthlete}
          />
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {hasActiveFilters ? 'Search Results' : 'All Athletes'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${athletes.length} athletes`}
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

        {/* Athletes Grid */}
        {loading ? (
          <AthletesSkeleton />
        ) : athletes.length > 0 ? (
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
                {athletes.map((athlete, index) => (
                  <motion.div
                    key={athlete._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AthleteCard
                      athlete={athlete}
                      currentUser={user}
                      isFollowing={user && athlete.followers?.includes(user.id)}
                      onFollow={toggleFollowAthlete}
                      variant={viewMode}
                    />
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
                  onClick={() => getAllAthletes(filters, pagination.currentPage - 1)}
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
                        onClick={() => getAllAthletes(filters, page)}
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
                        onClick={() => getAllAthletes(filters, pagination.totalPages)}
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
                  onClick={() => getAllAthletes(filters, pagination.currentPage + 1)}
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

export default Athletes;
