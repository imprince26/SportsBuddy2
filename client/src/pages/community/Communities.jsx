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
  Sparkles
} from 'lucide-react'
import { useCommunity } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import useDebounce from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Import community components
import CommunityCard from '@/components/community/CommunityCard'
import CommunityFilters from '@/components/community/CommunityFilters'
import {
  CommunitiesGridSkeleton
} from '@/components/community/CommunitySkeletons'
import {
  CommunityEmptyState,
  CommunityQuickStats
} from '@/components/community/CommunityComponents'

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

  const isFiltersActive = searchQuery || selectedCategory !== 'all' ||
    sortBy !== 'members:desc' || location || privacy !== 'all'

  const displayCommunities = activeTab === 'discover' ? communities : myCommunities
  const userCommunityIds = myCommunities.map(c => c._id)
  const userCreatedIds = myCommunities.filter(c => c.isCreator).map(c => c._id)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Section - Clean & Modern */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="max-w-3xl">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Join Your <br />
                <span className="text-primary">Sports Tribe</span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Connect with athletes who share your passion. Discover communities, share experiences, and grow together.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {user && (
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/community/create')}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Community
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50"
                  onClick={() => document.getElementById('communities-feed')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse Communities
                </Button>
              </motion.div>
            </div>

            {/* Right Content - Quick Stats */}
            <motion.div
              className="hidden lg:grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { label: "Communities", value: stats.totalCommunities, icon: Users },
                { label: "Members", value: stats.totalMembers, icon: Activity },
                { label: "Posts Today", value: stats.postsToday, icon: MessageSquare },
                { label: "New This Week", value: stats.newCommunities, icon: TrendingUp }
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-2xl w-40 hover:border-primary/30 transition-colors duration-300 shadow-sm"
                >
                  <stat.icon className="w-8 h-8 mb-3 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

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

          {/* Filters Section - Only for Discover Tab */}
          {activeTab === 'discover' && (
            <div className="mb-8 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
              <CommunityFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                location={location}
                setLocation={setLocation}
                privacy={privacy}
                setPrivacy={setPrivacy}
                onClearFilters={clearFilters}
                isFiltersActive={isFiltersActive}
              />
            </div>
          )}

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
