"use client"

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

const Events = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State management
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  
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

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" }
  ]

  const dateRanges = [
    { value: "all", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "upcoming", label: "Upcoming" }
  ]

  const sortOptions = [
    { value: "date:asc", label: "Date (Earliest)" },
    { value: "date:desc", label: "Date (Latest)" },
    { value: "created:desc", label: "Recently Added" },
    { value: "participants:desc", label: "Most Popular" },
    { value: "name:asc", label: "Name (A-Z)" }
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark border-primary-light/30 dark:border-primary-dark/30"
      case "Ongoing":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30"
      case "Completed":
        return "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark border-muted-light/30 dark:border-muted-dark/30"
      case "Cancelled":
        return "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark border-destructive-light/30 dark:border-destructive-dark/30"
      default:
        return "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark border-muted-light/30 dark:border-muted-dark/30"
    }
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30"
      case "Intermediate":
        return "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark border-accent-light/30 dark:border-accent-dark/30"
      case "Advanced":
        return "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark border-destructive-light/30 dark:border-destructive-dark/30"
      default:
        return "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark border-muted-light/30 dark:border-muted-dark/30"
    }
  }

  // Event card component
  const EventCard = ({ event, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/events/${event._id}`}>
        <Card className="h-full overflow-hidden bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
          <div className="relative h-48 overflow-hidden">
            {event.images && event.images.length > 0 ? (
              <img
                src={event.images[0].url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark" />
              </div>
            )}
            
            {/* Overlay with badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge className={cn("text-xs font-medium border", getStatusColor(event.status))}>
                {event.status}
              </Badge>
              <Badge className={cn("text-xs font-medium border", getDifficultyColor(event.difficulty))}>
                {event.difficulty}
              </Badge>
            </div>
            
            {/* Category badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-background-light/90 dark:bg-background-dark/90 text-foreground-light dark:text-foreground-dark border-border-light dark:border-border-dark">
                {categories.find(c => c.value === event.category)?.icon} {event.category}
              </Badge>
            </div>
            
            {/* Event title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white text-xl font-bold mb-1 line-clamp-2 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                {event.name}
              </h3>
              <div className="flex items-center text-white/90 text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{event.location?.city}</span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 space-y-3">
            {/* Date and time */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                <CalendarDays className="w-4 h-4 mr-1" />
                <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                <Clock className="w-4 h-4 mr-1" />
                <span>{event.time}</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-foreground-light dark:text-foreground-dark text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-1 text-primary-light dark:text-primary-dark" />
                <span className="text-foreground-light dark:text-foreground-dark font-medium">
                  {event.participantCount || 0}
                </span>
                <span className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  /{event.maxParticipants}
                </span>
              </div>
              
              {event.averageRating > 0 && (
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1 text-accent-light dark:text-accent-dark fill-current" />
                  <span className="text-foreground-light dark:text-foreground-dark font-medium">
                    {event.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              
              {event.registrationFee > 0 && (
                <div className="text-sm font-medium text-success-light dark:text-success-dark">
                  ${event.registrationFee}
                </div>
              )}
            </div>
            
            {/* Progress bar for participants */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                <span>Spots filled</span>
                <span>{Math.round(((event.participantCount || 0) / event.maxParticipants) * 100)}%</span>
              </div>
              <div className="w-full bg-muted-light dark:bg-muted-dark rounded-full h-2">
                <div
                  className="bg-primary-light dark:bg-primary-dark h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((event.participantCount || 0) / event.maxParticipants) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <div className="bg-primary-light dark:bg-primary-dark text-white py-12">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search events, locations, or sports..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="pl-10 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark"
                  />
                </div>
                
                {/* Quick filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger className="w-40 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                    <SelectTrigger className="w-40 h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    More Filters
                    <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showFilters && "rotate-180")} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={refreshEvents}
                    disabled={loading}
                    className="h-12 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
              
              {/* Extended Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t border-border-light dark:border-border-dark"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Difficulty Level
                        </label>
                        <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                          <SelectTrigger className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                            {difficulties.map((difficulty) => (
                              <SelectItem key={difficulty.value} value={difficulty.value}>
                                {difficulty.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Event Status
                        </label>
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                          <SelectTrigger className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Sort By
                        </label>
                        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                          <SelectTrigger className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                            {sortOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="w-full bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reset Filters
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

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
                <EventCard key={event._id} event={event} index={index} />
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
