import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Plus, Grid3X3, List, ChevronLeft, ChevronRight,
  RefreshCw, AlertTriangle, Calendar, Trophy,
  Search, SlidersHorizontal, Filter, X, Check
} from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import EventCard from "@/components/events/EventCard"
import EventsLoadingSkeleton from "@/components/events/EventsLoadingSkeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from '@/components/ui/card'
import { Skeleton } from "@/components/ui/skeleton"

const Events = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State management
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    difficulty: "all",
    status: "all",
    dateRange: "all",
    sortBy: "date:asc",
    includeEnded: false // By default, don't show ended events
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

  // Categories
  const categories = [
    { value: "all", label: "All Sports" },
    { value: "Football", label: "Football" },
    { value: "Basketball", label: "Basketball" },
    { value: "Tennis", label: "Tennis" },
    { value: "Cricket", label: "Cricket" },
    { value: "Badminton", label: "Badminton" },
    { value: "Running", label: "Running" },
    { value: "Cycling", label: "Cycling" },
    { value: "Swimming", label: "Swimming" },
    { value: "Volleyball", label: "Volleyball" },
    { value: "Other", label: "Other" }
  ]

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" },
  ]

  const dateRanges = [
    { value: "all", label: "Any Date" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "upcoming", label: "Upcoming" },
  ]

  const sortOptions = [
    { value: "date:asc", label: "Earliest First" },
    { value: "date:desc", label: "Latest First" },
    { value: "created:desc", label: "Recently Added" },
    { value: "participants:desc", label: "Most Popular" },
  ]

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const newFilters = { ...filters }

    if (urlParams.get("category")) newFilters.category = urlParams.get("category")
    if (urlParams.get("difficulty")) newFilters.difficulty = urlParams.get("difficulty")
    if (urlParams.get("search")) {
      newFilters.search = urlParams.get("search")
      setSearchQuery(urlParams.get("search"))
    }
    if (urlParams.get("dateRange")) newFilters.dateRange = urlParams.get("dateRange")
    if (urlParams.get("sortBy")) newFilters.sortBy = urlParams.get("sortBy")

    setFilters(newFilters)
    const page = parseInt(urlParams.get("page")) || 1
    setPagination(prev => ({ ...prev, page }))
  }, [location.search])

  // Update URL
  const updateURL = useCallback((newFilters, newPage = 1) => {
    const params = new URLSearchParams()

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value)
      }
    })

    if (newPage > 1) params.set("page", newPage.toString())

    const newURL = params.toString() ? `?${params.toString()}` : ""
    navigate(`/events${newURL}`, { replace: true })
  }, [navigate])

  // Fetch events
  const fetchEvents = useCallback(async (newFilters = filters, page = pagination.page) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value)
        }
      })

      params.set("page", page.toString())
      params.set("limit", pagination.limit.toString())
      params.set("_t", Date.now().toString())

      const response = await api.get(`/events?${params.toString()}`)

      if (response.data.success) {
        setEvents(response.data.data)
        setPagination(response.data.pagination)
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

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [])

  // Page title
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
    e?.preventDefault()
    handleFilterChange("search", searchQuery)
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
    setSearchQuery("")
    const defaultFilters = {
      search: "",
      category: "all",
      difficulty: "all",
      status: "all",
      dateRange: "all",
      sortBy: "date:asc",
      includeEnded: false
    }
    setFilters(defaultFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    updateURL(defaultFilters, 1)
    fetchEvents(defaultFilters, 1)
  }

  const hasActiveFilters = filters.category !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.search ||
    filters.dateRange !== 'all' ||
    filters.includeEnded

  const activeFilterCount = [
    filters.category !== 'all',
    filters.difficulty !== 'all',
    filters.dateRange !== 'all',
    filters.search,
    filters.includeEnded
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 py-12 lg:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Trophy className="w-4 h-4" />
              <span>Discover Events Near You</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Find Your Next <br />
              <span className="text-primary">Sports Adventure</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a community of athletes. Find local games, tournaments, and training sessions tailored to your skill level.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search events, locations, or sports..."
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
                  "h-12 px-4 rounded-xl border-border hover:bg-muted relative",
                  isFilterOpen && "bg-primary/10 border-primary/30"
                )}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.slice(1, 7).map((cat) => (
                <Button
                  key={cat.value}
                  variant={filters.category === cat.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    filters.category === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/30 hover:bg-primary/10"
                  )}
                  onClick={() => handleFilterChange('category', cat.value === filters.category ? 'all' : cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Create Event Button */}
            {isAuthenticated && (
              <div className="mt-8">
                <Link to="/events/create">
                  <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/50 gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your Own Event
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Filters Panel (Expandable) */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-card/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={resetFilters}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
                <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.difficulty} onValueChange={(v) => handleFilterChange('difficulty', v)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange('dateRange', v)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Show Past Events Toggle */}
                <div
                  className={cn(
                    "flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                    filters.includeEnded && "bg-primary/10 border-primary/30 text-primary"
                  )}
                  onClick={() => handleFilterChange('includeEnded', !filters.includeEnded)}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    filters.includeEnded ? "bg-primary border-primary" : "border-muted-foreground"
                  )}>
                    {filters.includeEnded && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm font-medium select-none">Show Past Events</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {hasActiveFilters ? 'Search Results' : 'All Events'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${pagination.total || events.length} events found`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
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

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents()}
              disabled={loading}
              className="h-8"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                {filters.category}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => handleFilterChange('category', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.difficulty !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                {filters.difficulty}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => handleFilterChange('difficulty', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.dateRange !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                {dateRanges.find(d => d.value === filters.dateRange)?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => handleFilterChange('dateRange', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                "{filters.search}"
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => {
                    setSearchQuery('')
                    handleFilterChange('search', '')
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 max-w-4xl"
          )}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className={viewMode === "grid" ? "h-80 rounded-xl" : "h-40 rounded-xl"} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Something went wrong</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => fetchEvents()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">No events found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any events matching your criteria. Try adjusting your filters or create your own event!
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
              {isAuthenticated && (
                <Link to="/events/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> Create Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Events Grid/List */}
        {!loading && !error && events.length > 0 && (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 max-w-4xl"
          )}>
            {events.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                index={index}
                viewMode={viewMode}
                user={user}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="h-9 w-9 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum = i + 1
                  if (pagination.pages > 5) {
                    if (pagination.page > 3) pageNum = pagination.page - 2 + i
                    if (pagination.page > pagination.pages - 2) pageNum = pagination.pages - 4 + i
                  }
                  if (pageNum > pagination.pages || pageNum < 1) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-9 h-9 rounded-lg"
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
                className="h-9 w-9 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
              <span className="font-semibold text-foreground">{pagination.pages}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Events
