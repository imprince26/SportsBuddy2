"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useEvents } from "../context/EventContext"
import { useAuth } from '@/hooks/useAuth';
import { format } from "date-fns"
import { CalendarDays, MapPin, Users, Filter, Search, Star, Clock, ChevronDown, Plus, Loader2, SlidersHorizontal, X, Calendar } from 'lucide-react'

const Events = () => {
  const { events, loading, getEvents: fetchEvents } = useEvents()
  const { isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    status: "",
    dateRange: "all",
    sortBy: "newest",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Apply search filter
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Apply filters to events
  const filterEvents = useCallback(() => {
    if (loading || !events.length) return

    setIsSearching(true)

    let filtered = [...events]

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((event) => event.category === filters.category)
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter((event) => event.difficulty === filters.difficulty)
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((event) => event.status === filters.status)
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)

        switch (filters.dateRange) {
          case "today":
            return eventDate >= today && eventDate < tomorrow
          case "thisWeek":
            return eventDate >= today && eventDate < nextWeek
          case "thisMonth":
            return eventDate >= today && eventDate < nextMonth
          default:
            return true
        }
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "newest":
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
          break
        case "oldest":
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
          break
        case "popular":
          filtered.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
          break
        case "rating":
          filtered.sort((a, b) => {
            const aRating = a.ratings?.length
              ? a.ratings.reduce((acc, curr) => acc + curr.rating, 0) / a.ratings.length
              : 0
            const bRating = b.ratings?.length
              ? b.ratings.reduce((acc, curr) => acc + curr.rating, 0) / b.ratings.length
              : 0
            return bRating - aRating
          })
          break
        default:
          break
      }
    }

    setFilteredEvents(filtered)
    setIsSearching(false)
  }, [events, searchTerm, filters, loading])

  // Apply filters when dependencies change
  useEffect(() => {
    filterEvents()
  }, [filterEvents, events, searchTerm, filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      difficulty: "",
      status: "",
      dateRange: "all",
      sortBy: "newest",
    })
    setSearchTerm("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-4 md:mb-0">
          Sports Events
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
              size={18}
            />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          {isAuthenticated && (
            <Link
              to="/events/create"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              <Plus size={18} />
              <span>Create Event</span>
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-4 mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal size={18} />
              Filter Options
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-primary-light dark:text-primary-dark hover:underline flex items-center gap-1"
            >
              <X size={14} />
              Reset All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
              >
                <option value="">All Categories</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Cricket">Cricket</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
              >
                <option value="">All Statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                Date Range
              </label>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading || isSearching ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
            <p className="mt-4 text-foreground-light dark:text-foreground-dark">
              {loading ? "Loading events..." : "Filtering events..."}
            </p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-card-light dark:bg-card-dark rounded-lg shadow">
          <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
            No events found
          </h3>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md mx-auto mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
            Found {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                to={`/events/${event._id}`}
                key={event._id}
                className="group bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={event.images[0].url || "/placeholder.svg?height=192&width=384"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                      <span className="text-muted-foreground-light dark:text-muted-foreground-dark">No image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${event.status === "Upcoming" ? "bg-primary-light/90 dark:bg-primary-dark/90 text-white" : ""}
                      ${event.status === "Ongoing" ? "bg-accent-light/90 dark:bg-accent-dark/90 text-white" : ""}
                      ${event.status === "Completed" ? "bg-muted-light/90 dark:bg-muted-dark/90 text-foreground-light dark:text-foreground-dark" : ""}
                      ${event.status === "Cancelled" ? "bg-destructive-light/90 dark:bg-destructive-dark/90 text-white" : ""}
                    `}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white text-xl font-bold truncate">{event.name}</h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <MapPin size={14} className="mr-1" />
                      <span className="truncate">{event.location.city}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      <CalendarDays size={16} className="mr-1" />
                      <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      <Clock size={16} className="mr-1" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <p className="text-foreground-light dark:text-foreground-dark line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      <Users size={16} className="mr-1" />
                      <span>
                        {event.participants?.length || 0}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs
                        ${event.difficulty === "Beginner" ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark" : ""}
                        ${event.difficulty === "Intermediate" ? "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark" : ""}
                        ${event.difficulty === "Advanced" ? "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark" : ""}
                      `}
                      >
                        {event.difficulty}
                      </span>
                    </div>
                  </div>
                  {event.ratings && event.ratings.length > 0 && (
                    <div className="flex items-center mt-3 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      <Star size={16} className="mr-1 text-accent-light dark:text-accent-dark" />
                      <span>
                        {(event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(1)}
                      </span>
                      <span className="ml-1">({event.ratings.length})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Events
