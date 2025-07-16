import { useState} from "react"
import { motion, AnimatePresence } from "framer-motion"
import {Search, ChevronDown, SlidersHorizontal, X, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const EventsFilters = ({filters,handleSearch,handleFilterChange,categories,refreshEvents,loading,resetFilters}) => {
  const [showFilters, setShowFilters] = useState(false)


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
  return (
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
  )
}

export default EventsFilters
