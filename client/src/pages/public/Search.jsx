import { useState, useEffect, useRef } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from '@/hooks/useAuth';
import { format } from "date-fns"
import { SearchIcon, Filter, MapPin, Calendar, Users, Star, ChevronDown, X, Loader2, User, CalendarDays, Dumbbell, Clock, Sliders, ArrowUpDown, CheckCircle2 } from 'lucide-react'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchEvents, searchUsers } = useEvents()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [searchType, setSearchType] = useState(searchParams.get("type") || "events")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ events: [], users: [] })
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date:desc")
  const [showSortOptions, setShowSortOptions] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    difficulty: searchParams.get("difficulty") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    location: searchParams.get("location") || "",
    radius: searchParams.get("radius") || "10",
  })

  const searchInputRef = useRef(null)
  const sortRef = useRef(null)

  // Handle outside clicks for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Page title
  useEffect(() => {
    document.title = `Search - SportsBuddy`
  }, [])

  // Perform search when params change
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm && !filters.category && !filters.location) return

      setLoading(true)
      try {
        if (searchType === "events") {
          const response = await searchEvents({
            search: searchTerm,
            category: filters.category,
            difficulty: filters.difficulty,
            startDate: filters.startDate,
            endDate: filters.endDate,
            location: filters.location,
            radius: filters.radius,
            sortBy,
            page: currentPage,
          })

          setResults({ ...results, events: response.data })
          setTotalResults(response.pagination.total)
          setTotalPages(response.pagination.pages)
        } else {
          const response = await searchUsers({
            search: searchTerm,
            sortBy,
            page: currentPage,
          })

          setResults({ ...results, users: response.data })
          setTotalResults(response.pagination.total)
          setTotalPages(response.pagination.pages)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()

    // Update URL params
    const params = new URLSearchParams()
    params.set("q", searchTerm)
    params.set("type", searchType)
    params.set("page", "1") // Reset to first page on new search

    if (filters.category) params.set("category", filters.category)
    if (filters.difficulty) params.set("difficulty", filters.difficulty)
    if (filters.startDate) params.set("startDate", filters.startDate)
    if (filters.endDate) params.set("endDate", filters.endDate)
    if (filters.location) params.set("location", filters.location)
    if (filters.radius) params.set("radius", filters.radius)
    if (sortBy) params.set("sort", sortBy)

    setSearchParams(params)
    setCurrentPage(1)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      difficulty: "",
      startDate: "",
      endDate: "",
      location: "",
      radius: "10",
    })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    setSearchParams(params)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setShowSortOptions(false)

    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    setSearchParams(params)
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case "date:desc":
        return "Newest First"
      case "date:asc":
        return "Oldest First"
      case "name:asc":
        return "Name (A-Z)"
      case "name:desc":
        return "Name (Z-A)"
      case "rating:desc":
        return "Highest Rated"
      default:
        return "Sort By"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-6">Search</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search events, users, teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex rounded-md overflow-hidden border border-input-light dark:border-input-dark">
                <button
                  type="button"
                  onClick={() => setSearchType("events")}
                  className={`px-4 py-2 ${searchType === "events"
                      ? "bg-primary-light dark:bg-primary-dark text-white"
                      : "bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    }`}
                >
                  Events
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType("users")}
                  className={`px-4 py-2 ${searchType === "users"
                      ? "bg-primary-light dark:bg-primary-dark text-white"
                      : "bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    }`}
                >
                  Users
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
              >
                <SearchIcon size={18} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div
              className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="mt-4 p-4 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Filters</h3>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  {searchType === "events" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                          className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                          className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          placeholder="City, State"
                          value={filters.location}
                          onChange={handleFilterChange}
                          className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                          Radius (km)
                        </label>
                        <input
                          type="range"
                          name="radius"
                          min="1"
                          max="100"
                          value={filters.radius}
                          onChange={handleFilterChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                          <span>1km</span>
                          <span>{filters.radius}km</span>
                          <span>100km</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          )}
        </form>

        {/* Results Header */}
        {(searchTerm || filters.category || filters.location) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
                {loading ? "Searching..." : `${totalResults} results found`}
              </h2>
              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                {searchType === "events" ? "Events" : "Users"} matching your search
              </p>
            </div>

            <div className="mt-2 sm:mt-0 relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
              >
                <ArrowUpDown size={16} />
                <span>{getSortLabel()}</span>
                <ChevronDown size={16} className={`transition-transform ${showSortOptions ? "rotate-180" : ""}`} />
              </button>

              {showSortOptions && (
                <div className="absolute right-0 mt-1 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleSortChange("date:desc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "date:desc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "date:desc" ? "ml-6" : "ml-0"}>Newest First</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("date:asc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "date:asc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "date:asc" ? "ml-6" : "ml-0"}>Oldest First</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("name:asc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "name:asc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "name:asc" ? "ml-6" : "ml-0"}>Name (A-Z)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("name:desc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "name:desc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "name:desc" ? "ml-6" : "ml-0"}>Name (Z-A)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("rating:desc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "rating:desc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "rating:desc" ? "ml-6" : "ml-0"}>Highest Rated</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
              <p className="mt-4 text-foreground-light dark:text-foreground-dark">Searching...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && totalResults === 0 && (searchTerm || filters.category || filters.location) && (
          <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-lg">
            <SearchIcon className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md mx-auto">
              We couldn't find any {searchType} matching your search criteria. Try adjusting your filters or search term.
            </p>
          </div>
        )}

        {/* Results - Events */}
        {!loading && searchType === "events" && results.events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.events.map((event) => (
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
                      <Calendar size={16} className="mr-1" />
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
                      <Star size={16} className="mr-1 text-accent-light dark:text-accent-dark fill-accent-light dark:fill-accent-dark" />
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
        )}

        {/* Results - Users */}
        {!loading && searchType === "users" && results.users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.users.map((user) => (
              <Link
                to={`/profile/${user._id}`}
                key={user._id}
                className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg?height=96&width=96"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-1">{user.name}</h3>
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-3">@{user.username}</p>

                  {user.location?.city && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{user.location.city}</span>
                    </div>
                  )}

                  {user.sportsPreferences && user.sportsPreferences.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {user.sportsPreferences.slice(0, 3).map((sport, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                        >
                          {sport.sport}
                        </span>
                      ))}
                      {user.sportsPreferences.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark">
                          +{user.sportsPreferences.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border-light dark:border-border-dark w-full">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground-light dark:text-foreground-dark">{user.followers?.length || 0}</span>
                      <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground-light dark:text-foreground-dark">{user.stats?.eventsCreated || 0}</span>
                      <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">Events</span>
                    </div>
                    {user.stats?.rating > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center font-semibold text-foreground-light dark:text-foreground-dark">
                          {user.stats.rating.toFixed(1)}
                          <Star size={14} className="ml-1 text-accent-light dark:text-accent-dark fill-accent-light dark:fill-accent-dark" />
                        </div>
                        <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">Rating</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1
                    ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                    : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  }`}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNum
                        ? "bg-primary-light dark:bg-primary-dark text-white"
                        : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages
                    ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                    : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
