import { useState, useEffect, useCallback, Suspense } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Plus, Grid3X3, List, ChevronLeft, ChevronRight,
  RefreshCw, AlertTriangle, Calendar, Trophy, Activity, Users, Star
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
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
    { value: "all", label: "All Sports" },
    { value: "Football", label: "Football" },
    { value: "Basketball", label: "Basketball" },
    { value: "Tennis", label: "Tennis" },
    { value: "Running", label: "Running" },
    { value: "Cycling", label: "Cycling" },
    { value: "Swimming", label: "Swimming" },
    { value: "Volleyball", label: "Volleyball" },
    { value: "Cricket", label: "Cricket" },
    { value: "Other", label: "Other" }
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

  return (
    <div className="min-h-screen bg-background relative">
      <HeroBg />
      
      {/* Modern Minimal Hero Section */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-tight">
                Discover Your Next <br />
                <span className="text-primary">
                  Sports Adventure
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                Join a community of athletes. Find local games, tournaments, and training sessions tailored to your skill level.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {isAuthenticated && (
                  <Link to="/events/create">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50"
                  onClick={() => document.getElementById('events-feed').scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse Events
                </Button>
              </div>
            </div>

            {/* Quick Stats - Minimal Blue Design */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { label: "Active Events", value: stats.activeEvents || "100+", icon: Activity },
                { label: "Athletes", value: stats.totalParticipants || "5k+", icon: Users },
                { label: "Avg Rating", value: stats.avgRating?.toFixed(1) || "4.9", icon: Star },
                { label: "Total Events", value: stats.totalEvents || "500+", icon: Trophy },
              ].map((stat, i) => (
                <div key={i} className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-2xl w-40 hover:border-primary/30 transition-colors duration-300 shadow-sm">
                  <stat.icon className="w-8 h-8 mb-3 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="events-feed" className="container mx-auto px-4 pb-20">
        
        {/* Filters Section */}
        <div className="z-30 bg-background/95 backdrop-blur-xl py-4 -mx-4 px-4 mb-8 border-y border-border/50 shadow-sm">
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
        </div>

        {/* Featured Events Carousel/Grid */}
        {featuredEvents.length > 0 && !filters.search && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <Trophy className="w-6 h-6 text-primary" />
                Featured Events
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event, index) => (
                <EventCard key={event._id} event={event} categories={categories} index={index} featured />
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col gap-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {loading ? "Loading..." : `${pagination.total} Events Found`}
            </h2>
            
            <div className="flex items-center bg-secondary/50 p-1 rounded-lg border border-border/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3 rounded-md"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3 rounded-md"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && <EventsLoadingSkeleton type="events" viewMode={viewMode} />}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={refreshEvents}>
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We couldn't find any events matching your criteria. Try adjusting your filters or create your own event!
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
                {isAuthenticated && (
                  <Link to="/events/create">
                    <Button>Create Event</Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && events.length > 0 && (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto w-full"
            )}>
              {events.map((event, index) => (
                <EventCard
                  key={event._id}
                  event={event}
                  categories={categories}
                  index={index}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.pages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm border-2 border-border/60 p-3 rounded-2xl shadow-lg">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
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
                        onClick={() => handlePageChange(pageNum)}
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
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="h-10 w-10 rounded-xl border-2 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-sm font-medium text-muted-foreground">
                Page <span className="text-foreground font-bold">{pagination.page}</span> of <span className="text-foreground font-bold">{pagination.pages}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Events
