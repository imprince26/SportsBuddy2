import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { CalendarDays, MapPin, Users, Filter, Search, Star, Clock, ChevronDown, Plus, Loader2, SlidersHorizontal, X, Calendar, Grid3X3, List, TrendingUp, Award, Target, Zap, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import EventCard from "@/components/events/EventCard"
import EventsFilters from "@/components/events/EventsFilters"

const Events = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State management
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")

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
    { value: "all", label: "All Sports", icon: "🏆" },
    { value: "Football", label: "Football", icon: "⚽" },
    { value: "Basketball", label: "Basketball", icon: "🏀" },
    { value: "Tennis", label: "Tennis", icon: "🎾" },
    { value: "Running", label: "Running", icon: "🏃" },
    { value: "Cycling", label: "Cycling", icon: "🚴" },
    { value: "Swimming", label: "Swimming", icon: "🏊" },
    { value: "Volleyball", label: "Volleyball", icon: "🏐" },
    { value: "Cricket", label: "Cricket", icon: "🏏" },
    { value: "Other", label: "Other", icon: "🎯" }
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
  }




  return (
    <div className="min-h-screen mx-auto max-w-7xl bg-background-light  dark:bg-background-dark">
      {/* Hero Section */}
      <div className="bg-primary-light dark:bg-primary-dark text-white py-12 rounded-xl mx-3 mt-5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Sports Events
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join exciting sports events in your area and connect with fellow athletes
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <EventsFilters filters={filters} handleSearch={handleSearch} categories={categories} handleFilterChange={handleFilterChange} refreshEvents={refreshEvents} loading={loading} resetFilters={resetFilters} />

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              {loading ? "Loading..." : `${pagination.total} Events Found`}
            </h2>
            {!loading && pagination.total > 0 && (
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted-light dark:bg-muted-dark rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Create Event Button */}
            {isAuthenticated && (
              <Button asChild className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90">
                <Link to="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark mx-auto mb-4" />
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark">Loading amazing events...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Card className="max-w-md mx-auto bg-card-light dark:bg-card-dark border-destructive-light dark:border-destructive-dark">
              <CardContent className="p-8">
                <div className="text-destructive-light dark:text-destructive-dark mb-4">
                  <AlertTriangle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
                  {error}
                </p>
                <Button onClick={refreshEvents} className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90">
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
            className="text-center py-20"
          >
            <Card className="max-w-md mx-auto bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
              <CardContent className="p-8">
                <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                  No events found
                </h3>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
                  Try adjusting your search criteria or create a new event to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  {isAuthenticated && (
                    <Button asChild className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={cn(
              "grid gap-6 mb-8",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}>
              {events.map((event, index) => (
                <EventCard key={event._id} event={event} categories={categories} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center"
          >
            <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
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

                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className={cn(
                            "w-10 h-10",
                            pagination.page === pageNum
                              ? "bg-primary-light dark:bg-primary-dark text-white"
                              : "bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
                          )}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center mt-3 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  Page {pagination.page} of {pagination.pages}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Events
