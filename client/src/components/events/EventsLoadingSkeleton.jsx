import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const EventsLoadingSkeleton = ({ type = "events", viewMode = "grid", count = 12 }) => {
  // Generate array for skeleton items
  const skeletonItems = Array.from({ length: count }, (_, i) => i)

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  // List view skeleton
  const ListSkeleton = ({ index }) => (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image skeleton */}
            <div className="relative h-48 sm:h-32 sm:w-48 flex-shrink-0">
              <Skeleton className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
              {/* Badge skeletons */}
              <div className="absolute top-2 left-2">
                <Skeleton className="h-5 w-16 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
                
                {/* Badges */}
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Grid view skeleton
  const GridSkeleton = ({ index }) => (
    <motion.div
      variants={itemVariants}
      className="group h-full"
    >
      <Card className="h-full overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
        {/* Image skeleton */}
        <div className="relative h-48 sm:h-56">
          <Skeleton className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full bg-white/80 dark:bg-gray-800/80" />
            <Skeleton className="h-5 w-20 rounded-full bg-white/80 dark:bg-gray-800/80" />
          </div>
          
          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <Skeleton className="h-5 w-24 rounded-full bg-white/80 dark:bg-gray-800/80" />
          </div>
          
          {/* Title area */}
          <div className="absolute bottom-3 right-3 left-28">
            <Skeleton className="h-6 w-full bg-white/60 dark:bg-gray-800/60 mb-2" />
            <Skeleton className="h-4 w-2/3 bg-white/60 dark:bg-gray-800/60" />
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Date and time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-8 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 w-8 bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Featured events skeleton
  const FeaturedSkeleton = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800" />
        <Skeleton className="h-8 w-48 bg-gray-200 dark:bg-gray-700" />
      </div>
      
      {/* Featured events grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-yellow-200/50 dark:border-yellow-800/50">
              <div className="relative h-56">
                <Skeleton className="w-full h-full bg-gradient-to-br from-yellow-200 via-orange-200 to-yellow-200 dark:from-yellow-800 dark:via-orange-800 dark:to-yellow-800" />
                
                {/* Featured badge */}
                <div className="absolute top-3 right-3">
                  <Skeleton className="h-6 w-20 rounded-full bg-yellow-300 dark:bg-yellow-700" />
                </div>
                
                {/* Content overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <Skeleton className="h-6 w-3/4 bg-white/80 dark:bg-gray-800/80 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-white/80 dark:bg-gray-800/80" />
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
                </div>
                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  // Stats skeleton
  const StatsSkeleton = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div key={index} variants={itemVariants}>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
            <Skeleton className="w-8 h-8 rounded bg-white/20 mx-auto mb-2" />
            <Skeleton className="h-8 w-16 bg-white/20 mx-auto mb-1" />
            <Skeleton className="h-4 w-12 bg-white/20 mx-auto" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )

  // Main render based on type
  if (type === "hero") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative container mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hero content skeleton */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Skeleton className="w-8 h-8 rounded bg-yellow-400/20" />
              <Skeleton className="h-8 w-48 rounded-full bg-white/20" />
            </div>
            
            <div className="space-y-4 mb-8">
              <Skeleton className="h-16 w-3/4 bg-white/20 mx-auto" />
              <Skeleton className="h-16 w-1/2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 mx-auto" />
            </div>
            
            <Skeleton className="h-6 w-2/3 bg-white/20 mx-auto mb-8" />

            {/* Stats skeleton */}
            <StatsSkeleton />
            
            {/* Search skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Skeleton className="h-12 w-full bg-white/20 rounded-lg" />
                    </div>
                    <Skeleton className="h-12 w-full sm:w-32 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Featured events skeleton */}
      {type === "events" && <FeaturedSkeleton />}
      
      {/* Results header skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex-1">
          <Skeleton className="h-8 w-64 bg-gray-200 dark:bg-gray-700 mb-2" />
          <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-700" />
        </div>
        
        <div className="flex items-center gap-3">
          {/* View mode toggle skeleton */}
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <Skeleton className="h-10 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 ml-1" />
          </div>
          
          {/* Create button skeleton */}
          <Skeleton className="h-10 w-32 rounded-lg bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800" />
        </div>
      </div>

      {/* Events grid/list skeleton */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 max-w-4xl mx-auto"
        )}
      >
        {skeletonItems.map((_, index) => (
          <motion.div key={index} variants={itemVariants}>
            {viewMode === "list" ? (
              <ListSkeleton index={index} />
            ) : (
              <GridSkeleton index={index} />
            )}
          </motion.div>
        ))}
      </motion.div>
      
      {/* Pagination skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex justify-center mt-12"
      >
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
              <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="text-center mt-4">
              <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default EventsLoadingSkeleton