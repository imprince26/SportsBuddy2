import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Users,
  MapPin,
  TrendingUp,
  Clock,
  Activity,
  Lock,
  Globe,
  Star,
  Crown,
  ChevronRight,
  Sparkles,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import useDebounce from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const SPORTS_CATEGORIES = [
  'All Categories',
  'Football',
  'Basketball',
  'Tennis',
  'Running',
  'Cycling',
  'Swimming',
  'Volleyball',
  'Cricket',
  'General',
  'Other'
];

const CommunityCard = ({ community, onJoin, isMember, isCreator, user }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
        onClick={() => navigate(`/community/${community._id}`)}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {community.image?.url ? (
            <img 
              src={community.image.url} 
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-20 h-20 text-gray-300 dark:text-gray-700" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          
          {/* Featured Badge */}
          {community.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Privacy & Category */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              {community.isPrivate ? (
                <><Lock className="w-3 h-3 mr-1" /> Private</>
              ) : (
                <><Globe className="w-3 h-3 mr-1" /> Public</>
              )}
            </Badge>
          </div>

          {/* Category at bottom */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary text-white">
              {community.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="pb-3 pt-4">
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
              {community.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {community.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 flex-grow flex flex-col justify-between">
          {/* Stats & Info */}
          <div className="space-y-3 mb-4">
            {/* Location */}
            {community.location?.city && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">
                  {community.location.city}, {community.location.country}
                </span>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {community.memberCount || 0}
                </span>
                <span className="text-gray-500">members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {community.stats?.totalPosts || 0}
                </span>
                <span className="text-gray-500">posts</span>
              </div>
            </div>

            {/* Creator */}
            {community.creator && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={community.creator.avatar} />
                  <AvatarFallback className="text-xs">
                    {community.creator.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">
                  by <span className="font-medium text-gray-700 dark:text-gray-300">{community.creator.name}</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            {isCreator ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/community/${community._id}/edit`);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Manage Community
              </Button>
            ) : isMember ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/community/${community._id}`);
                }}
                variant="outline"
                className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                size="sm"
              >
                <Star className="w-4 h-4 mr-2 fill-green-500" />
                View Community
              </Button>
            ) : user ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(community._id);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/login');
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Community
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Communities = () => {
  const { 
    communities,
    myCommunities,
    loading,
    getCommunities,
    getMyCommunities,
    joinCommunity,
    filters,
    setFilters,
    pagination
  } = useCommunity();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('members:desc');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('all');

  // Debounce search and location
  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedLocation = useDebounce(location, 500);

  useEffect(() => {
    if (activeTab === 'discover') {
      getCommunities();
    } else if (user) {
      getMyCommunities();
    }
  }, [activeTab]);

  // Real-time search effect
  useEffect(() => {
    if (activeTab === 'discover') {
      const newFilters = { 
        ...filters, 
        search: debouncedSearch,
        category: selectedCategory === 'All Categories' ? 'all' : selectedCategory,
        sortBy,
        location: debouncedLocation,
        isPrivate: privacy === 'all' ? '' : privacy
      };
      setFilters(newFilters);
      getCommunities(newFilters);
    }
  }, [debouncedSearch, selectedCategory, sortBy, debouncedLocation, privacy, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    // No need to do anything - real-time search handles it
  };

  const handleFilterChange = (category, sort) => {
    setSelectedCategory(category);
    setSortBy(sort);
  };

  const handleJoinCommunity = async (communityId) => {
    await joinCommunity(communityId);
    if (activeTab === 'discover') {
      getCommunities();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('members:desc');
    setLocation('');
    setPrivacy('all');
    const defaultFilters = {
      search: '',
      category: 'all',
      sortBy: 'members:desc',
      location: '',
      isPrivate: ''
    };
    setFilters(defaultFilters);
    getCommunities(defaultFilters);
  };

  const displayCommunities = activeTab === 'discover' ? communities : myCommunities;
  const userCommunityIds = myCommunities.map(c => c._id);
  const userCreatedIds = myCommunities.filter(c => c.isCreator).map(c => c._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Communities
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Connect with athletes and sports enthusiasts
              </p>
            </div>

            {user && (
              <Button
                onClick={() => navigate('/community/create')}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Community
              </Button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search communities... (real-time)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-[200px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                />
              </div>

              <Select
                value={privacy}
                onValueChange={(value) => setPrivacy(value)}
              >
                <SelectTrigger className="w-[150px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="false">Public</SelectItem>
                  <SelectItem value="true">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members:desc">Most Members</SelectItem>
                  <SelectItem value="members:asc">Least Members</SelectItem>
                  <SelectItem value="createdAt:desc">Newest First</SelectItem>
                  <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                  <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || selectedCategory !== 'All Categories' || sortBy !== 'members:desc' || location || privacy !== 'all') && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedCategory !== 'All Categories' || location || privacy !== 'all') && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span>Active filters:</span>
                {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}
                {selectedCategory !== 'All Categories' && <Badge variant="secondary">{selectedCategory}</Badge>}
                {location && <Badge variant="secondary">Location: {location}</Badge>}
                {privacy !== 'all' && <Badge variant="secondary">{privacy === 'true' ? 'Private' : 'Public'}</Badge>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs */}
          <TabsList className="mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1">
            <TabsTrigger value="discover" className="px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="my-communities" className="px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Star className="w-4 h-4 mr-2" />
              My Communities
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayCommunities.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No communities found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {displayCommunities.map((community) => (
                    <CommunityCard
                      key={community._id}
                      community={community}
                      onJoin={handleJoinCommunity}
                      isMember={userCommunityIds.includes(community._id)}
                      isCreator={userCreatedIds.includes(community._id)}
                      user={user}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => getCommunities({ ...filters, page: pagination.page - 1 })}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => getCommunities({ ...filters, page: pagination.page + 1 })}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Communities Tab */}
          <TabsContent value="my-communities" className="mt-0">
            {!user ? (
              <div className="text-center py-20">
                <Lock className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Sign in to view your communities
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Join communities and manage them from here
                </p>
                <Button onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myCommunities.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  You haven't joined any communities yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Discover and join communities to connect with other athletes
                </p>
                <Button onClick={() => setActiveTab('discover')}>
                  Discover Communities
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {myCommunities.map((community) => (
                    <CommunityCard
                      key={community._id}
                      community={community}
                      onJoin={handleJoinCommunity}
                      isMember={true}
                      isCreator={userCreatedIds.includes(community._id)}
                      user={user}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Communities;
