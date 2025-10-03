import { useState, useEffect, useCallback, Suspense } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Star, Plus, Calendar, Grid3X3, List, ChevronLeft, ChevronRight,
  RefreshCw, AlertTriangle, Sparkles, Trophy, Flame,Search
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import EventCard from "@/components/events/EventCard"
import EventsFilters from "@/components/events/EventsFilters"
import EventsLoadingSkeleton from "@/components/events/EventsLoadingSkeleton"
import HeroBg from "@/components/HeroBg"

const Events = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State management
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    avgRating: 0
  })

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    difficulty: "all",
    status: "all",
    dateRange: "all",
    sortBy: "date:asc"
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Categories and options
  const categories = [
    { value: "all", label: "All Sports", icon: "" },
    { value: "Football", label: "Football", icon: "" },
    { value: "Basketball", label: "Basketball", icon: "" },
    { value: "Tennis", label: "Tennis", icon: "" },
    { value: "Running", label: "Running", icon: "" },
    { value: "Cycling", label: "Cycling", icon: "" },
    { value: "Swimming", label: "Swimming", icon: "" },
    { value: "Volleyball", label: "Volleyball", icon: "" },
    { value: "Cricket", label: "Cricket", icon: "" },
    { value: "Other", label: "Other", icon: "" }
  ]

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const newFilters = { ...filters }

    if (urlParams.get("category")) newFilters.category = urlParams.get("category")
    if (urlParams.get("difficulty")) newFilters.difficulty = urlParams.get("difficulty")
    if (urlParams.get("search")) newFilters.search = urlParams.get("search")
    if (urlParams.get("dateRange")) newFilters.dateRange = urlParams.get("dateRange")
    if (urlParams.get("sortBy")) newFilters.sortBy = urlParams.get("sortBy")

    setFilters(newFilters)

    const page = parseInt(urlParams.get("page")) || 1
    setPagination(prev => ({ ...prev, page }))
  }, [location.search])

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newPage = 1) => {
    const params = new URLSearchParams()

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value)
      }
    })

    if (newPage > 1) {
      params.set("page", newPage.toString())
    }

    const newURL = params.toString() ? `?${params.toString()}` : ""
    navigate(`/events${newURL}`, { replace: true })
  }, [navigate])

  // Fetch events function
  const fetchEvents = useCallback(async (newFilters = filters, page = pagination.page) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      // Add filters to params
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value)
        }
      })

      // Add pagination
      params.set("page", page.toString())
      params.set("limit", pagination.limit.toString())

      // Add timestamp to prevent caching
      params.set("_t", Date.now().toString())

      const response = await api.get(`/events?${params.toString()}`)

      if (response.data.success) {
        setEvents(response.data.data)
        setPagination(response.data.pagination)
        if (response.data.stats) setStats(response.data.stats)
      } else {
        throw new Error(response.data.message || "Failed to fetch events")
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err.message || "Failed to fetch events")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Fetch featured events
  const fetchFeaturedEvents = useCallback(async () => {
    try {
      const response = await api.get('/events/featured')
      if (response.data.success) {
        setFeaturedEvents(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching featured events:", err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEvents()
    fetchFeaturedEvents()
  }, [])

  // Set page title
  useEffect(() => {
    document.title = "Sports Events - SportsBuddy"
  }, [])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    updateURL(newFilters, 1)
    fetchEvents(newFilters, 1)
  }

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value
    handleFilterChange("search", value)
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    updateURL(filters, newPage)
    fetchEvents(filters, newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      category: "all",
      difficulty: "all",
      status: "all",
      dateRange: "all",
      sortBy: "date:asc"
    }
    setFilters(defaultFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    updateURL(defaultFilters, 1)
    fetchEvents(defaultFilters, 1)
  }

  // Refresh events
  const refreshEvents = () => {
    fetchEvents(filters, pagination.page)
    fetchFeaturedEvents()
  }

  // Mobile-friendly pagination helper
  const getMobilePaginationPages = () => {
    const { page, pages } = pagination
    const maxVisible = 3 // Show maximum 3 page numbers on mobile
    
    if (pages <= maxVisible) {
      return Array.from({ length: pages }, (_, i) => i + 1)
    }
    
    if (page <= 2) {
      return [1, 2, 3]
    }
    
    if (page >= pages - 1) {
      return [pages - 2, pages - 1, pages]
    }
    
    return [page - 1, page, page + 1]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      {/* Hero Section */}
    <div className="relative overflow-hidden">
  <HeroBg/>

  <div className="relative container mx-auto px-4 py-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center max-w-4xl mx-auto"
    >
      {/* Welcome Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-block mb-4 sm:mb-6"
      >
      <div className="group relative">
  {/* Enhanced Animated Background Glow */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/60 via-purple-500/60 to-indigo-500/60 dark:from-blue-400/80 dark:via-purple-400/80 dark:to-indigo-400/80 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
  
  {/* Secondary Glow Effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 dark:from-cyan-300/40 dark:via-blue-300/40 dark:to-purple-300/40 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-all duration-300 scale-110" />
  
  {/* Main Badge Container */}
  <div className="relative px-4 sm:px-6 py-2 sm:py-3 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-full border border-blue-200/40 dark:border-blue-400/30 flex items-center gap-2 sm:gap-3 shadow-lg dark:shadow-xl group-hover:shadow-2xl transition-all duration-300">
    
    {/* Icon with Enhanced Animation */}
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-60 animate-pulse" />
      <Sparkles className="relative w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300 animate-bounce" style={{ animationDuration: '2s' }} />
    </div>
    
    {/* Enhanced Text */}
    <span className="bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 dark:from-blue-200 dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent font-semibold text-sm sm:text-base tracking-wide">
      Discover Amazing Events
    </span>
    
    {/* Enhanced Animated Dots */}
    <div className="flex gap-1">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-300 dark:to-purple-300 rounded-full animate-pulse shadow-sm" 
          style={{ 
            animationDelay: `${i * 0.3}s`,
            animationDuration: '1.5s'
          }} 
        />
      ))}
    </div>
    
    {/* Subtle Inner Highlight */}
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 dark:from-white/5 dark:via-white/15 dark:to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
  </div>
</div>
      </motion.div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
        Find Your Perfect
        <motion.span
          className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-yellow-300 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ['0%', '100%', '0%'],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Sports Event
        </motion.span>
      </h1>

      <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
        Join thousands of athletes and sports enthusiasts. Discover events, make connections, and level up your game.
      </p>

      {/* Platform Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
      >
        {[
          { label: "Events", value: `${stats.totalEvents || 250}+`, icon: Trophy, color: "from-blue-500 to-blue-600" },
          { label: "Active", value: `${stats.activeEvents || 120}+`, icon: Flame, color: "from-red-500 to-red-600" },
          { label: "Athletes", value: `${stats.totalParticipants || 15000}+`, icon: Users, color: "from-green-500 to-green-600" },
          { label: "Rating", value: `${stats.avgRating?.toFixed(1) || '4.9'}`, icon: Star, color: "from-yellow-500 to-yellow-600" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="group relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 dark:from-black/20 dark:to-black/5 rounded-xl blur-lg group-hover:blur-md transition-all duration-300" />
            <div className="relative p-3 sm:p-4 lg:p-6 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/30 dark:border-white/20 text-center shadow-lg dark:shadow-xl">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-white/80">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
      >
        {isAuthenticated && (
          <Link to="/events/create" className="w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-600/40 text-blue-600 dark:text-blue-400 font-bold rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/50 transform transition-transform group-hover:scale-110" />
              <div className="relative flex items-center justify-center gap-3">
                <Plus className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                <span>Create Event</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-400/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </Link>
        )}

        <motion.button
          whileHover={{ scale: 1.05, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/20 dark:bg-gray-900/40 backdrop-blur-xl border-2 border-white/40 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-white/30 dark:hover:bg-gray-900/60 transition-all duration-300 shadow-lg"
        >
          <div className="flex items-center justify-center gap-3">
            <Search className="w-5 h-5" />
            <span>Browse Events</span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  </div>
    </div>

      <div id="events-section" className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <Suspense fallback={<EventsLoadingSkeleton type="filters" />}>
            <EventsFilters
              filters={filters}
              handleSearch={handleSearch}
              categories={categories}
              handleFilterChange={handleFilterChange}
              refreshEvents={refreshEvents}
              loading={loading}
              resetFilters={resetFilters}
            />
          </Suspense>
        </motion.div>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Featured Events
              </h2>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs sm:text-sm rounded-xl">
                Hot
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredEvents.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard event={event} categories={categories} index={index} featured />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col space-y-4 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <motion.h2
                className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {loading ? "Loading Events..." : `${pagination.total} Events Available`}
              </motion.h2>
              {!loading && pagination.total > 0 && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
                </p>
              )}
            </div>

            {/* View Mode Toggle - Desktop */}
            <div className="hidden sm:flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-9 px-3 lg:px-4 rounded-lg transition-all text-sm",
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Grid3X3 className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-9 px-3 lg:px-4 rounded-lg transition-all text-sm",
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <List className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">List</span>
              </Button>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex sm:hidden items-center justify-between gap-3">
            {/* Filter Toggle */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button> */}

            {/* View Mode Toggle - Mobile */}
            <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 px-2 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 px-2 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && <EventsLoadingSkeleton type="events" viewMode={viewMode} />}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-red-200/50 dark:border-red-800/50 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <motion.div
                  className="text-red-500 mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <Button
                  onClick={refreshEvents}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && !error && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-0">
              <CardContent className="p-6 sm:p-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No events found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or create a new event to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                    Reset Filters
                  </Button>
                  {isAuthenticated && (
                    <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      <Link to="/events/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 sm:mb-12"
          >
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 max-w-4xl mx-auto"
            )}>
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event._id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <EventCard
                      event={event}
                      categories={categories}
                      index={index}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {!loading && !error && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center mt-8 sm:mt-12"
          >
            <Card className="w-full max-w-sm sm:max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Desktop Pagination */}
                <div className="hidden sm:block">
                  {/* Pagination Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Page Navigation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
                    </p>
                  </div>

                  {/* Main Pagination Controls */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* First Page Button */}
                    {pagination.page > 3 && pagination.pages > 5 && (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(1)}
                            className="w-10 h-10 p-0 bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                          >
                            1
                          </Button>
                        </motion.div>
                        {pagination.page > 4 && (
                          <div className="text-gray-400 dark:text-gray-500 px-2">...</div>
                        )}
                      </>
                    )}

                    {/* Previous Button */}
                    <motion.div
                      whileHover={{ scale: 1.05, x: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className={cn(
                          "px-4 h-10 bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 transition-all duration-300",
                          !pagination.hasPrev
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="hidden lg:inline">Previous</span>
                      </Button>
                    </motion.div>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }

                        const isActive = pagination.page === pageNum

                        return (
                          <motion.div
                            key={pageNum}
                            whileHover={{ scale: 1.1, rotateY: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative"
                          >
                            <Button
                              variant={isActive ? "default" : "outline"}
                              onClick={() => handlePageChange(pageNum)}
                              className={cn(
                                "w-10 h-10 p-0 transition-all duration-300 relative overflow-hidden",
                                isActive
                                  ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl"
                                  : "bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400"
                              )}
                            >
                              {isActive && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-transparent"
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                              )}
                              <span className="relative font-semibold">{pageNum}</span>
                            </Button>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Next Button */}
                    <motion.div
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className={cn(
                          "px-4 h-10 bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 transition-all duration-300",
                          !pagination.hasNext
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                      >
                        <span className="hidden lg:inline">Next</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>

                    {/* Last Page Button */}
                    {pagination.page < pagination.pages - 2 && pagination.pages > 5 && (
                      <>
                        {pagination.page < pagination.pages - 3 && (
                          <div className="text-gray-400 dark:text-gray-500 px-2">...</div>
                        )}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.pages)}
                            className="w-10 h-10 p-0 bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                          >
                            {pagination.pages}
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Pagination */}
                <div className="block sm:hidden">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="flex-1 mr-2 bg-white/70 dark:bg-gray-800/70 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    {/* Page Numbers - Mobile Optimized */}
                    <div className="flex items-center gap-1 mx-2">
                      {getMobilePaginationPages().map((pageNum) => {
                        const isActive = pagination.page === pageNum
                        return (
                          <Button
                            key={pageNum}
                            variant={isActive ? "default" : "outline"}
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "w-8 h-8 p-0 text-xs",
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                                : "bg-white/70 dark:bg-gray-800/70"
                            )}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="flex-1 ml-2 bg-white/70 dark:bg-gray-800/70 disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{Math.round((pagination.page / pagination.pages) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(pagination.page / pagination.pages) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  {/* Quick Jump - Mobile */}
                  {/* {pagination.pages > 10 && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 text-xs">Jump to:</span>
                        <input
                          type="number"
                          min="1"
                          max={pagination.pages}
                          value={pagination.page}
                          onChange={(e) => {
                            e.preventDefault()
                            const page = parseInt(e.target.value)
                            if (page >= 1 && page <= pagination.pages) {
                              handlePageChange(page)
                            }
                          }}
                          className="w-12 h-6 px-1 text-center text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <span className="text-gray-600 dark:text-gray-400 text-xs">of {pagination.pages}</span>
                      </div>
                    </div>
                  )} */}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Background Particle System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Events
