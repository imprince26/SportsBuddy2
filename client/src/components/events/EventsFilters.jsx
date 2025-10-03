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
  CalendarIcon,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react"
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
  resetFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const difficulties = [
    { value: "all", label: "All Levels", icon: "", color: "text-gray-600" },
    { value: "Beginner", label: "Beginner", icon: "", color: "text-green-600" },
    { value: "Intermediate", label: "Intermediate", icon: "", color: "text-yellow-600" },
    { value: "Advanced", label: "Advanced", icon: "", color: "text-red-600" },
  ]

  const dateRanges = [
    { value: "all", label: "All Dates", icon: "", color: "text-gray-600" },
    { value: "today", label: "Today", icon: "", color: "text-blue-600" },
    { value: "tomorrow", label: "Tomorrow", icon: "", color: "text-purple-600" },
    { value: "thisWeek", label: "This Week", icon: "", color: "text-green-600" },
    { value: "thisMonth", label: "This Month", icon: "", color: "text-orange-600" },
    { value: "upcoming", label: "Upcoming", icon: "", color: "text-indigo-600" },
  ]

  const sortOptions = [
    { value: "date:asc", label: "Date (Earliest First)", icon: "", color: "text-blue-600" },
    { value: "date:desc", label: "Date (Latest First)", icon: "", color: "text-blue-600" },
    { value: "created:desc", label: "Recently Added", icon: "", color: "text-purple-600" },
    { value: "participants:desc", label: "Most Popular", icon: "", color: "text-green-600" },
    { value: "name:asc", label: "Name (A-Z)", icon: "", color: "text-gray-600" },
  ]

  const statusOptions = [
    { value: "all", label: "All Statuses", icon: "", color: "text-gray-600" },
    { value: "Upcoming", label: "Upcoming", icon: "", color: "text-blue-600" },
    { value: "Ongoing", label: "Live Now", icon: "", color: "text-red-600" },
    { value: "Completed", label: "Completed", icon: "", color: "text-green-600" },
  ]

  // Quick filter shortcuts
  const quickFilters = [
    {
      label: "Today's Events",
      shortLabel: "Today",
      action: () => handleFilterChange("dateRange", "today"),
      icon: Clock,
      gradient: "from-blue-500 to-blue-600",
      active: filters.dateRange === "today",
    },
    {
      label: "Beginner Friendly",
      shortLabel: "Beginner",
      action: () => handleFilterChange("difficulty", "Beginner"),
      icon: Target,
      gradient: "from-green-500 to-green-600",
      active: filters.difficulty === "Beginner",
    },
    {
      label: "Most Popular",
      shortLabel: "Popular",
      action: () => handleFilterChange("sortBy", "participants:desc"),
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
      active: filters.sortBy === "participants:desc",
    },
    {
      label: "Free Events",
      shortLabel: "Free",
      action: () => handleFilterChange("feeType", "free"),
      icon: Sparkles,
      gradient: "from-yellow-500 to-orange-500",
      active: filters.feeType === "free",
    },
  ]

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== "all" && value !== "" && key !== "sortBy",
  ).length

  // Get current filter display values
  const getCurrentFilterLabel = (type, value) => {
    switch (type) {
      case "category":
        return categories.find((c) => c.value === value)?.label || "All Sports"
      case "difficulty":
        return difficulties.find((d) => d.value === value)?.label || "All Levels"
      case "dateRange":
        return dateRanges.find((d) => d.value === value)?.label || "All Dates"
      case "status":
        return statusOptions.find((s) => s.value === value)?.label || "All Statuses"
      case "feeType":
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
      className="space-y-4 sm:space-y-6"
    >
      {/* Main Filter Card */}
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Search Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Enhanced Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300",
                    isSearchFocused ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500",
                  )}
                />
              </div>
              <Input
                type="text"
                placeholder="Search events, sports, locations..."
                value={filters.search}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base bg-gray-50/80 dark:bg-gray-800/80 border-2",
                  "border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl transition-all duration-300",
                  "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                )}
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("search", "")}
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

              {/* Main Filters */}
              <div className="flex flex-col lg:flex-row flex-wrap lg:flex-nowrap items-stretch xs:items-center gap-2 sm:gap-3 flex-1">
                {/* Category Filter */}
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger className="w-full xs:w-auto xs:min-w-[140px] sm:min-w-[160px] h-10 sm:h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">
                        {getCurrentFilterLabel("category", filters.category)}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="rounded-lg py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-lg">{category.icon}</span>
                          <span className="font-medium text-sm sm:text-base">{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range Filter */}
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                  <SelectTrigger className="w-full xs:w-auto xs:min-w-[120px] sm:min-w-[140px] h-10 sm:h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">
                        {getCurrentFilterLabel("dateRange", filters.dateRange)}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="rounded-lg py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-lg">{range.icon}</span>
                          <span className="font-medium text-sm sm:text-base">{range.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Difficulty Filter */}
                <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                  <SelectTrigger className="w-full xs:w-auto xs:min-w-[110px] sm:min-w-[130px] h-10 sm:h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">
                        {getCurrentFilterLabel("difficulty", filters.difficulty)}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value} className="rounded-lg py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-lg">{difficulty.icon}</span>
                          <span className="font-medium text-sm sm:text-base">{difficulty.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                {/* More Filters Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={cn(
                    "flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-sm sm:text-base",
                    showAdvancedFilters
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                  )}
                >
                  <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="font-medium hidden xs:inline">More</span>
                  <span className="font-medium xs:hidden">Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform duration-300 flex-shrink-0",
                      showAdvancedFilters && "rotate-180",
                    )}
                  />
                </Button>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  onClick={refreshEvents}
                  disabled={loading}
                  className="h-10 sm:h-11 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <RefreshCw className={cn("w-3 h-3 sm:w-4 sm:h-4", loading && "animate-spin")} />
                  <span className="font-medium ml-1 sm:ml-2 hidden sm:inline text-sm sm:text-base">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Clear All Button - Separate row on mobile for better accessibility */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-center sm:justify-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full sm:w-auto h-10 sm:h-11 px-4 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Clear All Filters</span>
                </Button>
              </div>
            )}

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
                        "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300",
                        "border-2 hover:scale-105 active:scale-95 flex-shrink-0",
                        filter.active
                          ? `bg-gradient-to-r ${filter.gradient} text-white border-transparent shadow-lg`
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                      )}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden xs:inline">{filter.label}</span>
                      <span className="xs:hidden">{filter.shortLabel}</span>
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
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Advanced Filters Header */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Advanced Filters
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Fine-tune your event search</p>
                    </div>
                  </div>

                  {/* Advanced Filter Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Event Status */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        Event Status
                      </label>
                      <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                        <SelectTrigger className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value} className="rounded-lg py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-base sm:text-lg">{status.icon}</span>
                                <span className="font-medium text-sm sm:text-base">{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        Sort By
                      </label>
                      <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                        <SelectTrigger className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <SelectValue placeholder="Choose sorting" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-lg py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-base sm:text-lg">{option.icon}</span>
                                <span className="font-medium text-sm sm:text-base">{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fee Type Filter */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        Fee Type
                      </label>
                      <Select
                        value={filters.feeType || "all"}
                        onValueChange={(value) => handleFilterChange("feeType", value)}
                      >
                        <SelectTrigger className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                          <SelectItem value="all" className="rounded-lg py-2 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* <span className="text-base sm:text-lg">💰</span> */}
                              <span className="font-medium text-sm sm:text-base">All Events</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="free" className="rounded-lg py-2 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* <span className="text-base sm:text-lg">🆓</span> */}
                              <span className="font-medium text-sm sm:text-base">Free Events</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="paid" className="rounded-lg py-2 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* <span className="text-base sm:text-lg">💵</span> */}
                              <span className="font-medium text-sm sm:text-base">Paid Events</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter - Future Enhancement */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <Input
                          placeholder="Search by city or area..."
                          className="pl-8 sm:pl-10 h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon - Location-based filtering</p>
                    </div>
                  </div>

                  {/* Quick Actions for Advanced Filters */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Quick Selections
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("difficulty", "Beginner")
                            handleFilterChange("dateRange", "thisWeek")
                          }}
                          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          <span className="hidden xs:inline ml-1">Beginner This Week</span>
                          <span className="xs:hidden ml-1">Beginner</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("status", "Upcoming")
                            handleFilterChange("sortBy", "participants:desc")
                          }}
                          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          <span className="hidden xs:inline ml-1">Popular Upcoming</span>
                          <span className="xs:hidden ml-1">Popular</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("dateRange", "today")
                            handleFilterChange("status", "Ongoing")
                          }}
                          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          <span className="hidden xs:inline ml-1">Live Now</span>
                          <span className="xs:hidden ml-1">Live</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFilterChange("feeType", "free")
                          }}
                          className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        >
                          <span className="hidden xs:inline ml-1">Free Events</span>
                          <span className="xs:hidden ml-1">Free</span>
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
          className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} applied
            </span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value && value !== "all" && value !== "" && key !== "sortBy") {
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md"
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
