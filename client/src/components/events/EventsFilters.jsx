import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  Filter,
  Calendar as CalendarIcon,
  Target,
  TrendingUp,
  Clock,
  Check,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

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

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== "all" && value !== "" && key !== "sortBy"
  ).length

  return (
    <div className="space-y-6">
      {/* Search and Main Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search events, locations, or sports..."
            value={filters.search}
            onChange={handleSearch}
            className="pl-12 h-12 text-base bg-background border-border/50 shadow-sm focus-visible:ring-primary/20 transition-all rounded-xl"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "h-12 px-4 rounded-xl border-border/50 shadow-sm transition-all",
              showAdvancedFilters && "bg-secondary border-primary/20 text-primary"
            )}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[1.25rem] bg-primary text-primary-foreground">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
            <SelectTrigger className="h-12 w-[180px] rounded-xl border-border/50 shadow-sm bg-background">
              <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={refreshEvents}
            disabled={loading}
            className="h-12 w-12 rounded-xl border border-border/50 shadow-sm bg-background hover:bg-secondary"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-2">
          <div className="flex space-x-2 p-1">
            {categories.map((category) => {
              const isSelected = filters.category === category.value
              return (
                <button
                  key={category.value}
                  onClick={() => handleFilterChange("category", category.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-border/50 bg-secondary/10 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" /> Date Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dateRanges.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => handleFilterChange("dateRange", range.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-colors border",
                          filters.dateRange === range.value
                            ? "bg-primary/10 border-primary/20 text-primary font-medium"
                            : "bg-background border-border/50 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" /> Difficulty Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() => handleFilterChange("difficulty", diff.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-colors border",
                          filters.difficulty === diff.value
                            ? "bg-primary/10 border-primary/20 text-primary font-medium"
                            : "bg-background border-border/50 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4" /> Quick Filters
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleFilterChange("status", "Upcoming")}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors",
                        filters.status === "Upcoming"
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-background border-border/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <span>Upcoming Events</span>
                      {filters.status === "Upcoming" && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleFilterChange("feeType", "free")}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors",
                        filters.feeType === "free"
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-background border-border/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <span>Free Events Only</span>
                      {filters.feeType === "free" && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground hover:text-destructive">
                  Reset All
                </Button>
                <Button onClick={() => setShowAdvancedFilters(false)}>
                  Show Results
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && !showAdvancedFilters && (
        <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-2">
          <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== "all" && value !== "" && key !== "sortBy") {
              let label = value
              if (key === "category") label = categories.find(c => c.value === value)?.label || value
              if (key === "dateRange") label = dateRanges.find(d => d.value === value)?.label || value
              
              return (
                <Badge key={key} variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  {label}
                  <button
                    onClick={() => handleFilterChange(key, key === "category" || key === "difficulty" || key === "status" || key === "dateRange" ? "all" : "")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )
            }
            return null
          })}
          <Button variant="link" size="sm" onClick={resetFilters} className="text-muted-foreground h-auto p-0 ml-2">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

export default EventsFilters
