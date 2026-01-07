import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus,
  Users,
  Globe,
  Star,
  TrendingUp,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  X,
  Filter,
  MapPin
} from 'lucide-react'
import { useCommunity } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import useDebounce from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Import community components
import CommunityCard from '@/components/community/CommunityCard'
import {
  CommunitiesGridSkeleton
} from '@/components/community/CommunitySkeletons'
import {
  CommunityEmptyState
} from '@/components/community/CommunityComponents'

const SPORTS_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'Football', label: 'Football' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Tennis', label: 'Tennis' },
  { value: 'Running', label: 'Running' },
  { value: 'Cycling', label: 'Cycling' },
  { value: 'Swimming', label: 'Swimming' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Cricket', label: 'Cricket' },
  { value: 'Other', label: 'Other' }
]

const COMMUNITIES_SORT = [
  { value: 'members:desc', label: 'Most Members' },
  { value: 'members:asc', label: 'Least Members' },
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'activity:desc', label: 'Most Active' }
]

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
  } = useCommunity()
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('members:desc')
  const [location, setLocation] = useState('')
  const [privacy, setPrivacy] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Stats (mock for now - can be fetched from API)
  const [stats] = useState({
    totalCommunities: communities?.length || 50,
    totalMembers: '5.2k',
    postsToday: 128,
    newCommunities: 12
  })

  // Debounce search and location
  const debouncedSearch = useDebounce(searchQuery, 500)
  const debouncedLocation = useDebounce(location, 500)

  // Fetch on tab change
  useEffect(() => {
    if (activeTab === 'discover') {
      getCommunities()
    } else if (user) {
      getMyCommunities()
    }
  }, [activeTab])

  // Real-time search effect
  useEffect(() => {
    if (activeTab === 'discover') {
      const newFilters = {
        ...filters,
        search: debouncedSearch,
        category: selectedCategory === 'all' ? 'all' : selectedCategory,
        sortBy,
        location: debouncedLocation,
        isPrivate: privacy === 'all' ? '' : privacy
      }
      setFilters(newFilters)
      getCommunities(newFilters)
    }
  }, [debouncedSearch, selectedCategory, sortBy, debouncedLocation, privacy, activeTab])

  // Set page title
  useEffect(() => {
    document.title = "Communities - SportsBuddy"
  }, [])

  const handleJoinCommunity = async (communityId) => {
    await joinCommunity(communityId)
    if (activeTab === 'discover') {
      getCommunities()
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSortBy('members:desc')
    setLocation('')
    setPrivacy('all')
    const defaultFilters = {
      search: '',
      category: 'all',
      sortBy: 'members:desc',
      location: '',
      isPrivate: ''
    }
    setFilters(defaultFilters)
    getCommunities(defaultFilters)
  }

  const handleSearch = (e) => {
    e?.preventDefault()
    // Triggered via debounce effect
  }

  const isFiltersActive = searchQuery || selectedCategory !== 'all' ||
    sortBy !== 'members:desc' || location || privacy !== 'all'

  const displayCommunities = activeTab === 'discover' ? communities : myCommunities
  const userCommunityIds = myCommunities.map(c => c._id)
  const userCreatedIds = myCommunities.filter(c => c.isCreator).map(c => c._id)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.12),transparent_50%)]" />

        <div className="container mx-auto px-4 py-12 lg:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>Join {stats.totalCommunities}+ Active Communities</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Find Your <br />
              <span className="text-primary">Sports Tribe</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with athletes who share your passion. Discover communities, share experiences, and grow together.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search communities..."
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

            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {SPORTS_CATEGORIES.slice(1, 6).map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/30 hover:bg-primary/10"
                  )}
                  onClick={() => setSelectedCategory(selectedCategory === cat.value ? 'all' : cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Create Community Button */}
            {user && (
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/community/create')}
                  variant="outline"
                  className="rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your Own Community
                </Button>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* Filters Section (Expandable) */}
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
                {isFiltersActive && (
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
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="City or Area"
                      className="pl-9 bg-background border-border"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Privacy</label>
                  <Select value={privacy} onValueChange={setPrivacy}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="false">Public Only</SelectItem>
                      <SelectItem value="true">Private Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITIES_SORT.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div id="communities-feed" className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <TabsList className="bg-card border border-border p-1.5 rounded-xl w-fit">
              <TabsTrigger
                value="discover"
                className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Globe className="w-4 h-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger
                value="my-communities"
                className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Star className="w-4 h-4 mr-2" />
                My Communities
                {myCommunities.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs font-bold">
                    {myCommunities.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${displayCommunities.length} communities found`}
            </p>
          </div>

          {/* Discover Tab Content */}
          <TabsContent value="discover" className="mt-0">
            {loading ? (
              <CommunitiesGridSkeleton count={8} />
            ) : displayCommunities.length === 0 ? (
              <CommunityEmptyState
                type={isFiltersActive ? "search" : "discover"}
                onAction={clearFilters}
                actionLabel="Clear Filters"
              />
            ) : (
              <>
                {/* Communities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {displayCommunities.map((community, index) => (
                      <motion.div
                        key={community._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <CommunityCard
                          community={community}
                          onJoin={handleJoinCommunity}
                          isMember={userCommunityIds.includes(community._id)}
                          isCreator={userCreatedIds.includes(community._id)}
                          user={user}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm border-2 border-border/60 p-3 rounded-2xl shadow-lg">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => getCommunities({ ...filters, page: pagination.page - 1 })}
                        disabled={!pagination.hasPrev}
                        className="h-10 w-10 rounded-xl border-2 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>

                      <div className="flex items-center gap-2 px-2">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum = i + 1
                          if (pagination.pages > 5) {
                            if (pagination.page > 3) pageNum = pagination.page - 2 + i
                            if (pagination.page > pagination.pages - 2) pageNum = pagination.pages - 4 + i
                          }
                          if (pageNum > pagination.pages) return null

                          return (
                            <Button
                              key={pageNum}
                              variant={pagination.page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => getCommunities({ ...filters, page: pageNum })}
                              className={cn(
                                "min-w-10 h-10 rounded-xl font-semibold text-base transition-all",
                                pagination.page === pageNum
                                  ? "shadow-md shadow-primary/30"
                                  : "hover:border-primary/50"
                              )}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => getCommunities({ ...filters, page: pagination.page + 1 })}
                        disabled={!pagination.hasNext}
                        className="h-10 w-10 rounded-xl border-2 disabled:opacity-30"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground">
                      Page <span className="text-foreground font-bold">{pagination.page}</span> of{" "}
                      <span className="text-foreground font-bold">{pagination.pages}</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* My Communities Tab Content */}
          <TabsContent value="my-communities" className="mt-0">
            {!user ? (
              <CommunityEmptyState
                type="sign-in"
                onAction={() => navigate('/login')}
                actionLabel="Sign In"
              />
            ) : loading ? (
              <CommunitiesGridSkeleton count={4} />
            ) : myCommunities.length === 0 ? (
              <CommunityEmptyState
                type="my-communities"
                onAction={() => setActiveTab('discover')}
                actionLabel="Discover Communities"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {myCommunities.map((community, index) => (
                    <motion.div
                      key={community._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CommunityCard
                        community={community}
                        onJoin={handleJoinCommunity}
                        isMember={true}
                        isCreator={userCreatedIds.includes(community._id)}
                        user={user}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Create Button (Mobile) */}
      {user && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 lg:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90"
            onClick={() => navigate('/community/create')}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default Communities
