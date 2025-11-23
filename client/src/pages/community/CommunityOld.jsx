import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Users, 
  Plus, 
  TrendingUp, 
  Award,
  MapPin,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Star,
  Trophy,
  Target,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  ArrowRight,
  Sparkles,
  Crown,
  Activity,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Hooks and Context
import { useAuth } from '@/hooks/useAuth';
import useDebounce from '@/hooks/useDebounce';

// Utils
import { cn } from '@/lib/utils';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [communities, setCommunities] = useState([]);
  const [featuredCommunities, setFeaturedCommunities] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'members:desc',
    isPrivate: searchParams.get('isPrivate') || '',
    minMembers: searchParams.get('minMembers') || '',
    maxMembers: searchParams.get('maxMembers') || ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Categories
  const categories = [
    { value: 'all', label: 'All Sports', icon: '' },
    { value: 'Football', label: 'Football', icon: '' },
    { value: 'Cricket', label: 'Cricket', icon: '' },
    { value: 'Basketball', label: 'Basketball', icon: '' },
    { value: 'Badminton', label: 'Badminton', icon: '' },
    { value: 'Tennis', label: 'Tennis', icon: '' },
    { value: 'Volleyball', label: 'Volleyball', icon: '' },
    { value: 'Swimming', label: 'Swimming', icon: '' },
    { value: 'Running', label: 'Running', icon: '' },
    { value: 'Cycling', label: 'Cycling', icon: '' },
    { value: 'Gym', label: 'Gym & Fitness', icon: '' },
    { value: 'Yoga', label: 'Yoga', icon: '' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Fetch communities
  const fetchCommunities = async (newFilters = null, page = 1) => {
    try {
      if (page === 1) setLoading(true);
      else setSearchLoading(true);

      const queryFilters = newFilters || filters;
      const queryParams = new URLSearchParams();
      
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value && value !== 'all') queryParams.append(key, value);
      });
      
      queryParams.append('page', page);
      queryParams.append('limit', pagination.limit);

      const response = await api.get(`/community?${queryParams}`);
      
      if (response.data.success) {
        if (page === 1) {
          setCommunities(response.data.data);
        } else {
          setCommunities(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
        
        // Update URL params
        const newSearchParams = new URLSearchParams();
        Object.entries(queryFilters).forEach(([key, value]) => {
          if (value && value !== 'all') newSearchParams.set(key, value);
        });
        setSearchParams(newSearchParams);
      }
    } catch (error) {
      setError('Failed to fetch communities');
      toast.error('Failed to fetch communities');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Fetch featured communities
  const fetchFeatured = async () => {
    try {
      const response = await api.get('/community/featured?limit=6');
      if (response.data.success) {
        setFeaturedCommunities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching featured communities:', error);
    }
  };

  // Fetch trending posts
  const fetchTrending = async () => {
    try {
      const response = await api.get('/community/posts/trending?limit=5');
      if (response.data.success) {
        setTrendingPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  // Fetch community stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/community/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCommunities(),
        fetchFeatured(),
        fetchTrending(),
        fetchStats()
      ]);
    };

    initializeData();
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newFilters = { ...filters, search: debouncedSearch };
      setFilters(newFilters);
      fetchCommunities(newFilters, 1);
    }
  }, [debouncedSearch]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchCommunities(newFilters, 1);
  };

  // Load more communities
  const loadMore = () => {
    if (pagination.hasNext && !searchLoading) {
      fetchCommunities(filters, pagination.currentPage + 1);
    }
  };

  // Join community handler
  const handleJoinCommunity = async (communityId, isPrivate) => {
    if (!user) {
      toast.error('Please login to join communities');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/community/${communityId}/join`);
      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh communities
        fetchCommunities(filters, 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950/20"
    >
      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-800 dark:via-indigo-800 dark:to-blue-900"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center text-white">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Join the Sports Revolution</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            >
              Sports Communities
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with passionate athletes, share your journey, and discover amazing sports communities around you
            </motion.p>

            {/* Quick Stats */}
            {stats && (
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-8"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold">{stats.totalCommunities || 0}</div>
                  <div className="text-sm md:text-base text-blue-100">Communities</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold">{stats.totalMembers || 0}</div>
                  <div className="text-sm md:text-base text-blue-100">Members</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold">{stats.totalPosts || 0}</div>
                  <div className="text-sm md:text-base text-blue-100">Posts</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold">{stats.activeCommunities || 0}</div>
                  <div className="text-sm md:text-base text-blue-100">Active Today</div>
                </div>
              </motion.div>
            )}

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {user ? (
                <Button
                  size="lg"
                  onClick={() => navigate('/community/create')}
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Community
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join SportsBuddy
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-2xl font-semibold backdrop-blur-sm"
              >
                <Eye className="w-5 h-5 mr-2" />
                Explore Communities
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-gray-900 to-transparent" />
      </motion.section>

      {/* Categories Section */}
      <motion.section 
        variants={itemVariants}
        className="relative py-16 bg-white dark:bg-gray-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore by Sport
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find communities for your favorite sports and discover new ones
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-0 overflow-hidden group",
                    filters.category === category.value 
                      ? "ring-2 ring-blue-500 shadow-lg" 
                      : "hover:shadow-xl"
                  )}
                  onClick={() => handleFilterChange('category', category.value)}
                >
                  <CardContent className={cn(
                    "p-4 text-center bg-gradient-to-br",
                    category.color,
                    "group-hover:scale-105 transition-transform duration-300"
                  )}>
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-white font-semibold text-sm">{category.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Communities */}
      {featuredCommunities.length > 0 && (
        <motion.section 
          variants={itemVariants}
          className="py-16 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Featured Communities
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Most active and engaging communities this week
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden md:flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCommunities.map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  variants={cardHoverVariants}
                  whileHover="hover"
                >
                  <FeaturedCommunityCard 
                    community={community} 
                    onJoin={handleJoinCommunity}
                    user={user}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <motion.section 
        id="explore"
        variants={itemVariants}
        className="py-16 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              
              {/* Search & Filters */}
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Search & Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search communities..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    {/* <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="City, State, Country"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    {/* <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="members:desc">Most Members</SelectItem>
                        <SelectItem value="created:desc">Newest</SelectItem>
                        <SelectItem value="created:asc">Oldest</SelectItem>
                        <SelectItem value="name:asc">Name A-Z</SelectItem>
                        <SelectItem value="activity:desc">Most Active</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>

                  {/* Privacy Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Privacy</label>
                    {/* <Select value={filters.isPrivate} onValueChange={(value) => handleFilterChange('isPrivate', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="false">Public</SelectItem>
                        <SelectItem value="true">Private</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        search: '',
                        category: 'all',
                        location: '',
                        sortBy: 'members:desc',
                        isPrivate: '',
                        minMembers: '',
                        maxMembers: ''
                      });
                      setSearchParams({});
                      fetchCommunities({
                        search: '',
                        category: 'all',
                        location: '',
                        sortBy: 'members:desc',
                        isPrivate: '',
                        minMembers: '',
                        maxMembers: ''
                      }, 1);
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Posts */}
              {trendingPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      Trending Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trendingPosts.slice(0, 3).map((post) => (
                      <div key={post._id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={post.author?.avatar?.url} />
                            <AvatarFallback>
                              {post.author?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.author?.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likesCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.commentsCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => navigate('/community/create')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Community
                    </Button>
                    <Button
                      onClick={() => navigate('/community/my')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      My Communities
                    </Button>
                    <Button
                      onClick={() => navigate('/events/create')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    All Communities
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {pagination.total} communities found
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Communities Grid/List */}
              {loading ? (
                <CommunitiesLoadingSkeleton viewMode={viewMode} />
              ) : error ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <Button onClick={() => fetchCommunities(filters, 1)}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : communities.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No communities found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try adjusting your search criteria or create a new community
                    </p>
                    {user && (
                      <Button onClick={() => navigate('/community/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Community
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  )}>
                    {communities.map((community, index) => (
                      <motion.div
                        key={community._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        variants={cardHoverVariants}
                        whileHover="hover"
                      >
                        {viewMode === 'grid' ? (
                          <CommunityCard 
                            community={community} 
                            onJoin={handleJoinCommunity}
                            user={user}
                          />
                        ) : (
                          <CommunityListItem 
                            community={community} 
                            onJoin={handleJoinCommunity}
                            user={user}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More */}
                  {pagination.hasNext && (
                    <div className="text-center pt-8">
                      <Button
                        onClick={loadMore}
                        disabled={searchLoading}
                        size="lg"
                        className="min-w-32"
                      >
                        {searchLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

// Featured Community Card Component
const FeaturedCommunityCard = ({ community, onJoin, user }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-2xl transition-all duration-300">
      {/* Header with background */}
      <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
        {community.image?.url && (
          <img
            src={community.image.url}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={cn(
            "flex items-center gap-1",
            community.isPrivate 
              ? "bg-orange-500/90 text-white" 
              : "bg-green-500/90 text-white"
          )}>
            {community.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {community.isPrivate ? 'Private' : 'Public'}
          </Badge>
        </div>

        {/* Crown for featured */}
        <div className="absolute top-3 left-3">
          <div className="bg-yellow-500/90 text-white p-2 rounded-full">
            <Crown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Community Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
            <AvatarImage src={community.image?.url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              {community.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">
              {community.name}
            </h3>
            <Badge variant="secondary" className="mb-2">
              {community.category}
            </Badge>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {community.memberCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {community.stats?.totalPosts || 0}
            </span>
          </div>
          {community.location?.city && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {community.location.city}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/community/${community._id}`)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          
          {user && (
            <Button
              onClick={() => onJoin(community._id, community.isPrivate)}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {community.isPrivate ? 'Request' : 'Join'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Community Card Component
const CommunityCard = ({ community, onJoin, user }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 shadow-lg">
      {/* Header */}
      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden">
        {community.image?.url && (
          <img
            src={community.image.url}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="absolute top-2 right-2">
          <Badge className={cn(
            "flex items-center gap-1 text-xs",
            community.isPrivate 
              ? "bg-orange-500/90 text-white" 
              : "bg-green-500/90 text-white"
          )}>
            {community.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {community.isPrivate ? 'Private' : 'Public'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Community Info */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={community.image?.url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
              {community.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
              {community.name}
            </h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {community.category}
            </Badge>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-3">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {community.memberCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {community.stats?.totalPosts || 0}
            </span>
          </div>
          {community.location?.city && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {community.location.city}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/community/${community._id}`)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            View
          </Button>
          
          {user && (
            <Button
              onClick={() => onJoin(community._id, community.isPrivate)}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {community.isPrivate ? 'Request' : 'Join'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Community List Item Component
const CommunityListItem = ({ community, onJoin, user }) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={community.image?.url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              {community.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                  {community.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {community.category}
                  </Badge>
                  <Badge className={cn(
                    "flex items-center gap-1",
                    community.isPrivate 
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" 
                      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  )}>
                    {community.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {community.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => navigate(`/community/${community._id}`)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                
                {user && (
                  <Button
                    onClick={() => onJoin(community._id, community.isPrivate)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {community.isPrivate ? 'Request' : 'Join'}
                  </Button>
                )}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
              {community.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {community.memberCount || 0} members
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {community.stats?.totalPosts || 0} posts
              </span>
              {community.location?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {community.location.city}, {community.location.state}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton Component
const CommunitiesLoadingSkeleton = ({ viewMode }) => {
  const items = Array.from({ length: viewMode === 'grid' ? 9 : 6 });

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-24 w-full" />
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Community;