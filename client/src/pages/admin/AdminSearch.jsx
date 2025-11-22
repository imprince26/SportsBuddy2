import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import {
  Search,
  Users,
  Calendar,
  Bell,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  ChevronRight,
  X,
  Target,
  Menu,
  History,
  Mail,
  Calendar as CalendarIcon,
  User,
  Settings,
  BarChart3,
  Lightbulb,
  Compass
} from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { format, formatDistanceToNow } from "date-fns"
import api from "@/utils/api"

const AdminSearch = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [results, setResults] = useState({})
  const [searching, setSearching] = useState(false)
  const [lastSearchTime, setLastSearchTime] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    category: "all",
    priority: "all",
    dateFrom: "",
    dateTo: "",
    location: "",
    isActive: "all",
    relevanceSort: false
  })

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  // Refs
  const searchInputRef = useRef(null)
  const debounceRef = useRef(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("admin_search_history")
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (error) {
        console.error("Error parsing search history:", error)
        setSearchHistory([])
      }
    }
  }, [])

  // Save search to history
  const saveSearchToHistory = useCallback((query, type) => {
    if (!query.trim()) return
    
    const newSearch = {
      id: Date.now(),
      query: query.trim(),
      type,
      timestamp: new Date().toISOString(),
      resultsCount: Object.values(results).reduce((sum, category) => 
        sum + (category.pagination?.total || 0), 0
      )
    }

    setSearchHistory(prev => {
      const updatedHistory = [newSearch, ...prev.filter(h => 
        !(h.query === newSearch.query && h.type === newSearch.type)
      )].slice(0, 10)
      
      localStorage.setItem("admin_search_history", JSON.stringify(updatedHistory))
      return updatedHistory
    })
  }, [results])

  // Perform search
  const performSearch = useCallback(async (query, type, page = 1, forceSearch = false) => {
    if (!query.trim() && !forceSearch) {
      setResults({})
      setLastSearchTime(null)
      return
    }

    try {
      setSearching(true)
      const token = localStorage.getItem("token")
      
      // Convert "all" values back to empty strings for API
      const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = value === "all" ? "" : value
        return acc
      }, {})

      const params = new URLSearchParams({
        type,
        query: query.trim(),
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        filters: JSON.stringify(apiFilters)
      })

      const response = await api.get(`/admin/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = response.data
      setResults(data.results || {})
      setLastSearchTime(new Date())
      
      // Save to search history if it's a new search
      if (page === 1) {
        saveSearchToHistory(query, type)
      }

      // Show suggestions if results are low
      if (data.results?.[type]?.suggestions) {
        setSuggestions(data.results[type].suggestions)
      } else {
        setSuggestions([])
      }

      const totalResults = data.results?.insights?.totalResults || 
        Object.values(data.results || {}).reduce((sum, category) => 
          sum + (category.pagination?.total || 0), 0
        )

      toast.success(`Found ${totalResults} results`)

    } catch (error) {
      console.error("Search failed:", error)
      toast.error("Search failed. Please try again.")
      setResults({})
    } finally {
      setSearching(false)
    }
  }, [itemsPerPage, sortBy, sortOrder, filters, saveSearchToHistory])

  // Debounced search
  const debouncedSearch = useCallback((query, type) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query, type)
    }, 500)
  }, [performSearch])

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    if (value.trim().length > 2) {
      debouncedSearch(value, searchType)
    } else if (value.trim().length === 0) {
      setResults({})
      setLastSearchTime(null)
    }
  }

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery, searchType, 1, true)
    }
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Apply filters
  const applyFilters = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, searchType, 1, true)
    }
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      role: "all",
      status: "all",
      category: "all",
      priority: "all",
      dateFrom: "",
      dateTo: "",
      location: "",
      isActive: "all",
      relevanceSort: false
    })
  }

  // Use search suggestion
  const useSuggestion = (suggestion) => {
    setSearchQuery(suggestion.suggestion)
    performSearch(suggestion.suggestion, searchType, 1, true)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "upcoming":
      case "sent":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200/20"
      case "draft":
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200/20"
      case "rejected":
      case "failed":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200/20"
      case "scheduled":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20"
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20"
    }
  }

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200/20"
      case "user":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20"
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20"
    }
  }

  // Mobile Controls Component
  const MobileControls = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Search Controls</SheetTitle>
          <SheetDescription>Advanced search options and filters</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => {
              clearFilters()
              setMobileMenuOpen(false)
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => {
              setSearchQuery("")
              setResults({})
              setMobileMenuOpen(false)
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Search
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Search result card components
  const UserResultCard = ({ user, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30"
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 ring-2 ring-white/20 dark:ring-gray-700/20 shrink-0">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs border ${getRoleColor(user.role)}`}>
                {user.role}
              </Badge>
              {user.isActive !== false && (
                <Badge variant="outline" className="text-xs border-green-200/20 bg-green-50 text-green-700">
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {user.location.city || user.location.state || user.location.country}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {user.eventsCreated || 0} events created • {user.eventsParticipated || 0} participated
            </span>
            <span>
              Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/users/${user._id}`} className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )

  const EventResultCard = ({ event, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
              {event.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Badge className={`text-xs border ${getStatusColor(event.status)}`}>
              {event.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.category}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">by {event.organizer?.name || event.createdBy?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {event.location?.city || event.location?.address || "Location TBD"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {event.date ? format(new Date(event.date), "MMM dd, yyyy") : "Date TBD"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 shrink-0" />
              <span>
                {event.participantCount || 0}
                {event.maxParticipants ? ` / ${event.maxParticipants}` : ""} participants
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Created {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
            </span>
            {event.avgRating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{event.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/events/${event._id}`} className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Manage Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )

  const NotificationResultCard = ({ notification, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Badge className={`text-xs border ${getStatusColor(notification.status)}`}>
              {notification.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {notification.type}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4 shrink-0" />
              <span>{notification.recipientCount || 0} recipients</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">by {notification.creator?.name}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{notification.deliveryRate?.toFixed(1) || 0}% delivered</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Eye className="w-4 h-4 shrink-0" />
              <span>{notification.openRate?.toFixed(1) || 0}% opened</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/notifications`} className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0"
    >
      {/* Header with Gradient Background */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 text-white shadow-xl"
      >
        <div className="relative z-10 flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 leading-tight">
                  Advanced Search
                </h1>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Find users, events, and notifications across your platform
                </p>
              </div>
            </div>
            {lastSearchTime && (
              <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">
                  Last search: {formatDistanceToNow(lastSearchTime, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-3 z-10 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              onClick={clearFilters}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <Button
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90"
              onClick={() => {
                setSearchQuery("")
                setResults({})
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Search
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden justify-end">
            <MobileControls />
          </div>
        </div>
      </motion.div>

      {/* Search Interface */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
              <span className="truncate">Search & Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search users, events, notifications..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6"
                      onClick={() => {
                        setSearchQuery("")
                        setResults({})
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Search Type */}
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Search Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="notifications">Notifications</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search Button */}
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={searching}
                >
                  {searching ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </form>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="User Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Swimming">Swimming</SelectItem>
                  <SelectItem value="Running">Running</SelectItem>
                  <SelectItem value="Cycling">Cycling</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyFilters}
                  className="flex-1 bg-white/50 dark:bg-gray-800/50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-white/50 dark:bg-gray-800/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search History */}
      {searchHistory.length > 0 && !searchQuery && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" />
                <span className="truncate">Recent Searches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchHistory.slice(0, 6).map((search) => (
                  <Button
                    key={search.id}
                    variant="outline"
                    className="justify-start h-auto p-3 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                    onClick={() => {
                      setSearchQuery(search.query)
                      setSearchType(search.type)
                      performSearch(search.query, search.type, 1, true)
                    }}
                  >
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {search.query}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {search.type} • {search.resultsCount} results
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                <span className="truncate">Search Suggestions</span>
              </CardTitle>
              <CardDescription>
                Try these suggestions to find what you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 bg-yellow-50/50 dark:bg-yellow-900/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-800/30 border-yellow-200/50 dark:border-yellow-700/50"
                    onClick={() => useSuggestion(suggestion)}
                  >
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {suggestion.suggestion}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {suggestion.reason}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Results */}
      {Object.keys(results).length > 0 && (
        <motion.div variants={itemVariants}>
          <Tabs value={searchType} onValueChange={setSearchType} className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 p-1 rounded-xl w-full flex justify-evenly sm:w-auto md:inline-flex">
                {searchType === "all" && (
                  <>
                    <TabsTrigger
                      value="users"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
                      onClick={() => setSearchType("users")}
                    >
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Users ({results.users?.pagination?.total || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="events"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
                      onClick={() => setSearchType("events")}
                    >
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Events ({results.events?.pagination?.total || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
                      onClick={() => setSearchType("notifications")}
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Notifications ({results.notifications?.pagination?.total || 0})
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            {/* Results Content */}
            <div className="space-y-4">
              {/* Users Results */}
              {(searchType === "users" || searchType === "all") && results.users?.data && (
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          Users ({results.users.pagination?.total || 0})
                        </span>
                      </CardTitle>
                      {searchType === "all" && results.users.data.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchType("users")}
                        >
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {results.users.data.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try adjusting your search criteria or filters.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.users.data.map((user, index) => (
                          <UserResultCard key={user._id} user={user} index={index} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Events Results */}
              {(searchType === "events" || searchType === "all") && results.events?.data && (
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                        <span className="truncate">
                          Events ({results.events.pagination?.total || 0})
                        </span>
                      </CardTitle>
                      {searchType === "all" && results.events.data.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchType("events")}
                        >
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {results.events.data.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No events found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try adjusting your search criteria or filters.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.events.data.map((event, index) => (
                          <EventResultCard key={event._id} event={event} index={index} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notifications Results */}
              {(searchType === "notifications" || searchType === "all") && results.notifications?.data && (
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                        <span className="truncate">
                          Notifications ({results.notifications.pagination?.total || 0})
                        </span>
                      </CardTitle>
                      {searchType === "all" && results.notifications.data.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchType("notifications")}
                        >
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {results.notifications.data.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No notifications found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try adjusting your search criteria or filters.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.notifications.data.map((notification, index) => (
                          <NotificationResultCard key={notification._id} notification={notification} index={index} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Search Insights for 'all' type */}
              {searchType === "all" && results.insights && (
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                      <span className="truncate">Search Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {results.insights.totalResults}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Results</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {results.insights.categoryBreakdown?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {results.insights.appliedFilters || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Filters Applied</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </Tabs>
        </motion.div>
      )}

      {/* Empty State */}
      {!searching && !searchQuery && Object.keys(results).length === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start Your Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Use the search box above to find users, events, and notifications across your platform.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["users", "events", "football", "admin", "notifications"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(term)
                      performSearch(term, "all", 1, true)
                    }}
                    className="bg-gray-50/50 dark:bg-gray-800/50"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AdminSearch