import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  ChevronDown, 
  SlidersHorizontal, 
  X, 
  RefreshCw, 
  Filter, 
  MapPin, 
  Calendar as CalendarIcon, 
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const EventsFilters = ({ 
  filters, 
  handleSearch, 
  handleFilterChange, 
  categories, 
  refreshEvents, 
  loading, 
  resetFilters 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const difficulties = [
    { value: "all", label: "All Levels", icon: "🎯", color: "text-gray-600" },
    { value: "Beginner", label: "Beginner", icon: "🌱", color: "text-green-600" },
    { value: "Intermediate", label: "Intermediate", icon: "⚡", color: "text-yellow-600" },
    { value: "Advanced", label: "Advanced", icon: "🔥", color: "text-red-600" }
  ]

  const dateRanges = [
    { value: "all", label: "All Dates", icon: "📅", color: "text-gray-600" },
    { value: "today", label: "Today", icon: "📍", color: "text-blue-600" },
    { value: "tomorrow", label: "Tomorrow", icon: "🌅", color: "text-purple-600" },
    { value: "thisWeek", label: "This Week", icon: "📊", color: "text-green-600" },
    { value: "thisMonth", label: "This Month", icon: "📆", color: "text-orange-600" },
    { value: "upcoming", label: "Upcoming", icon: "🚀", color: "text-indigo-600" }
  ]

  const sortOptions = [
    { value: "date:asc", label: "Date (Earliest First)", icon: "⏰", color: "text-blue-600" },
    { value: "date:desc", label: "Date (Latest First)", icon: "🕐", color: "text-blue-600" },
    { value: "created:desc", label: "Recently Added", icon: "✨", color: "text-purple-600" },
    { value: "participants:desc", label: "Most Popular", icon: "👥", color: "text-green-600" },
    { value: "name:asc", label: "Name (A-Z)", icon: "🔤", color: "text-gray-600" }
  ]

  const statusOptions = [
    { value: "all", label: "All Statuses", icon: "📋", color: "text-gray-600" },
    { value: "Upcoming", label: "Upcoming", icon: "🚀", color: "text-blue-600" },
    { value: "Ongoing", label: "Live Now", icon: "🔴", color: "text-red-600" },
    { value: "Completed", label: "Completed", icon: "✅", color: "text-green-600" }
  ]

  // Quick filter shortcuts
  const quickFilters = [
    {
      label: "Today's Events",
      action: () => handleFilterChange("dateRange", "today"),
      icon: Clock,
      gradient: "from-blue-500 to-blue-600",
      active: filters.dateRange === "today"
    },
    {
      label: "Beginner Friendly", 
      action: () => handleFilterChange("difficulty", "Beginner"),
      icon: Target,
      gradient: "from-green-500 to-green-600",
      active: filters.difficulty === "Beginner"
    },
    {
      label: "Most Popular",
      action: () => handleFilterChange("sortBy", "participants:desc"),
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
      active: filters.sortBy === "participants:desc"
    },
    {
      label: "Free Events",
      action: () => handleFilterChange("feeType", "free"), // Changed to use feeType filter
      icon: Sparkles,
      gradient: "from-yellow-500 to-orange-500",
      active: filters.feeType === "free"
    }
  ]

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== "all" && value !== "" && key !== "sortBy"
  ).length

  // Get current filter display values
  const getCurrentFilterLabel = (type, value) => {
    switch (type) {
      case 'category':
        return categories.find(c => c.value === value)?.label || "All Sports"
      case 'difficulty':
        return difficulties.find(d => d.value === value)?.label || "All Levels"
      case 'dateRange':
        return dateRanges.find(d => d.value === value)?.label || "All Dates"
      case 'status':
        return statusOptions.find(s => s.value === value)?.label || "All Statuses"
      case 'feeType':
        return value === "free" ? "Free Events" : value === "paid" ? "Paid Events" : "All Events"
      default:
        return value
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Main Filter Card */}
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <CardContent className="p-6">
          {/* Search Section */}
          <div className="space-y-4">
            {/* Enhanced Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isSearchFocused 
                    ? "text-blue-500 dark:text-blue-400" 
                    : "text-gray-400 dark:text-gray-500"
                )} />
              </div>
              <Input
                type="text"
                placeholder="Search for events, sports, locations, or organizers..."
                value={filters.search}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-12 pr-12 h-14 text-base bg-gray-50/80 dark:bg-gray-800/80 border-2",
                  "border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-300",
                  "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400"
                )}
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("search", "")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Quick Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger className="w-auto min-w-[160px] h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{getCurrentFilterLabel('category', filters.category)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="rounded-lg py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                <SelectTrigger className="w-auto min-w-[140px] h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{getCurrentFilterLabel('dateRange', filters.dateRange)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value} className="rounded-lg py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{range.icon}</span>
                        <span className="font-medium">{range.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                <SelectTrigger className="w-auto min-w-[130px] h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{getCurrentFilterLabel('difficulty', filters.difficulty)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value} className="rounded-lg py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{difficulty.icon}</span>
                        <span className="font-medium">{difficulty.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={cn(
                    "h-11 px-4 rounded-xl border-2 transition-all duration-300",
                    showAdvancedFilters 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300" 
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <span className="font-medium">More Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className={cn(
                    "w-4 h-4 ml-2 transition-transform duration-300",
                    showAdvancedFilters && "rotate-180"
                  )} />
                </Button>

                <Button
                  variant="outline"
                  onClick={refreshEvents}
                  disabled={loading}
                  className="h-11 px-4 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  <span className="font-medium ml-2 hidden sm:inline">Refresh</span>
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="h-11 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    <span className="font-medium">Clear All</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Action Pills */}
            {!showAdvancedFilters && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                {quickFilters.map((filter, index) => {
                  const Icon = filter.icon
                  return (
                    <motion.button
                      key={filter.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={filter.action}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        "border-2 hover:scale-105 active:scale-95",
                        filter.active
                          ? `bg-gradient-to-r ${filter.gradient} text-white border-transparent shadow-lg`
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{filter.label}</span>
                    </motion.button>
                  )
                })}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 backdrop-blur-xl border-blue-200/50 dark:border-blue-800/50 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Advanced Filters Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fine-tune your event search</p>
                    </div>
                  </div>

                  {/* Advanced Filter Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Event Status */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Event Status
                      </label>
                      <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value} className="rounded-lg py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{status.icon}</span>
                                <span className="font-medium">{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Sort By
                      </label>
                      <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <SelectValue placeholder="Choose sorting" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-lg py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{option.icon}</span>
                                <span className="font-medium">{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fee Type Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Fee Type
                      </label>
                      <Select value={filters.feeType || "all"} onValueChange={(value) => handleFilterChange("feeType", value)}>
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                          <SelectItem value="all" className="rounded-lg py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">💰</span>
                              <span className="font-medium">All Events</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="free" className="rounded-lg py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🆓</span>
                              <span className="font-medium">Free Events</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="paid" className="rounded-lg py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">💵</span>
                              <span className="font-medium">Paid Events</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter - Future Enhancement */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by city or area..."
                          className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon - Location-based filtering</p>
                    </div>
                  </div>

                  {/* Quick Actions for Advanced Filters */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Selections</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("difficulty", "Beginner")
                            handleFilterChange("dateRange", "thisWeek")
                          }}
                          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg"
                        >
                          🌱 Beginner This Week
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("status", "Upcoming")
                            handleFilterChange("sortBy", "participants:desc")
                          }}
                          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                          🚀 Popular Upcoming
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("dateRange", "today")
                            handleFilterChange("status", "Ongoing")
                          }}
                          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          🔴 Live Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("feeType", "free")
                          }}
                          className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg"
                        >
                          🆓 Free Events
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <Filter className="w-4 h-4" />
          <span>
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
          </span>
          <div className="flex gap-1 ml-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value && value !== "all" && value !== "" && key !== "sortBy") {
                return (
                  <Badge 
                    key={key} 
                    variant="secondary" 
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  >
                    {getCurrentFilterLabel(key, value)}
                  </Badge>
                )
              }
              return null
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default EventsFilters