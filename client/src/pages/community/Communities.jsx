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
  Calendar,
  CheckCircle,
  Lock,
  Globe,
  Star,
  Activity,
  Settings
} from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
import HeroBg from '@/components/HeroBg';

const CommunityCard = ({ community, onJoin, isMember, isAdmin, user }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl h-full flex flex-col cursor-pointer group"
        onClick={() => navigate(`/community/${community._id}`)}
      >
        {/* Cover Image */}
        <div className="h-32 relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          {community.image?.url ? (
            <img 
              src={community.image.url} 
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Users className="w-16 h-16 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Privacy Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white">
              {community.isPrivate ? (
                <><Lock className="w-3 h-3 mr-1" /> Private</>
              ) : (
                <><Globe className="w-3 h-3 mr-1" /> Public</>
              )}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary/90 hover:bg-primary text-white border-0">
              {community.category}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-primary transition-colors">
                {community.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {community.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-2 flex-grow">
          <div className="space-y-3">
            {/* Location */}
            {community.location?.city && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {community.location.city}, {community.location.country}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {community.memberCount || community.members?.filter(m => m.isActive).length || 0}
                </span>
                <span className="text-gray-500">members</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Activity className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {community.stats?.totalPosts || 0}
                </span>
                <span className="text-gray-500">posts</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                Updated {format(new Date(community.updatedAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-4 px-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
          {isAdmin ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/community/${community._id}/edit`);
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-all duration-300"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          ) : isMember ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/community/${community._id}`);
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View Community
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (user) {
                  onJoin(community._id);
                } else {
                  navigate('/login');
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-300"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          )}
        </CardFooter>
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'discover') {
      getCommunities();
    } else {
      getMyCommunities();
    }
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchQuery };
    setFilters(newFilters);
    getCommunities(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    getCommunities(newFilters);
  };

  const handleJoinCommunity = async (communityId) => {
    await joinCommunity(communityId);
    if (activeTab === 'discover') {
      getCommunities();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    const defaultFilters = {
      search: '',
      category: 'all',
      location: '',
      sortBy: 'members:desc'
    };
    setFilters(defaultFilters);
    getCommunities(defaultFilters);
  };

  const displayCommunities = activeTab === 'discover' ? communities : myCommunities;
  const userCommunityIds = myCommunities.map(c => c._id);

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <HeroBg />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="border-b border-border bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Sports <span className="text-primary">Communities</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Connect with passionate athletes, share experiences, and grow together in your favorite sports communities.
                </p>

                {/* Create Community Button */}
                {user && (
                  <Button
                    onClick={() => navigate('/community/create')}
                    size="lg"
                    className="mt-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Community
                  </Button>
                )}
              </motion.div>

              {/* Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSearch}
                className="mt-8"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search communities by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base border-border bg-card"
                    />
                  </div>
                  <Button type="submit" size="lg" className="px-8">
                    Search
                  </Button>
                </div>
              </motion.form>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="discover" className="px-6">
                  <Globe className="w-4 h-4 mr-2" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="my-communities" className="px-6">
                  <Star className="w-4 h-4 mr-2" />
                  My Communities
                </TabsTrigger>
              </TabsList>

              {/* Filters (Only on Discover Tab) */}
              {activeTab === 'discover' && (
                <div className="flex items-center gap-2">
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Cycling">Cycling</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="members:desc">Most Members</SelectItem>
                      <SelectItem value="created:desc">Newest</SelectItem>
                      <SelectItem value="created:asc">Oldest</SelectItem>
                      <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>

                  {(filters.category !== 'all' || filters.search) && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Discover Tab */}
            <TabsContent value="discover" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-32 w-full" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-10 w-full mt-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : displayCommunities.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {displayCommunities.map((community) => {
                      const isMember = userCommunityIds.includes(community._id);
                      const isAdmin = user && (community.creator?._id === user.id || community.creator === user.id || community.admins?.includes(user.id));
                      return (
                        <CommunityCard
                          key={community._id}
                          community={community}
                          onJoin={handleJoinCommunity}
                          isMember={isMember}
                          isAdmin={isAdmin}
                          user={user}
                        />
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No communities found</h3>
                  <p className="text-muted-foreground mb-6">
                    {filters.search || filters.category !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Be the first to create a community!'}
                  </p>
                  {user && (
                    <Button onClick={() => navigate('/community/create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Community
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* My Communities Tab */}
            <TabsContent value="my-communities" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-32 w-full" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full mt-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : myCommunities.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {myCommunities.map((community) => {
                    const isAdmin = user && (community.creator?._id === user.id || community.creator === user.id || community.admins?.includes(user.id));
                    return (
                      <CommunityCard
                        key={community._id}
                        community={community}
                        onJoin={handleJoinCommunity}
                        isMember={true}
                        isAdmin={isAdmin}
                        user={user}
                      />
                    );
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">You haven't joined any communities yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Discover and join communities to connect with like-minded athletes
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>
                    Explore Communities
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => {
                  const newPage = pagination.page - 1;
                  if (activeTab === 'discover') {
                    getCommunities(filters, newPage);
                  }
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => {
                  const newPage = pagination.page + 1;
                  if (activeTab === 'discover') {
                    getCommunities(filters, newPage);
                  }
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communities;
