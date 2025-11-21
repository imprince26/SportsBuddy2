import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const EventsLoadingSkeleton = ({ type = "events", viewMode = "grid", count = 8 }) => {
  // Generate array for skeleton items
  const skeletonItems = Array.from({ length: count }, (_, i) => i)

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.4
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  // Filters Skeleton
  if (type === "filters") {
    return (
      <div className="space-y-4">
        {/* Search and basic filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="h-12 w-full lg:w-96 rounded-xl" />
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
        {/* Advanced filters toggle */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    )
  }

  // List view skeleton
  const ListSkeleton = () => (
    <Card className="overflow-hidden border-border/50 bg-card/50">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image skeleton */}
        <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2 mb-2">
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            <Skeleton className="h-7 w-3/4 mb-2" />

            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-7 h-7 rounded-full border-2 border-background" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <Skeleton className="h-3 w-10 mb-1 ml-auto" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  // Grid view skeleton
  const GridSkeleton = () => (
    <Card className="h-full flex flex-col border-border/50 bg-card overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-48 w-full">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton className="h-6 w-24 rounded-md mb-2" />
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      
      <CardContent className="flex-1 p-5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="space-y-3 mt-auto">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 flex items-center justify-between border-t border-border/50 pt-4">
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </CardFooter>
    </Card>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "grid gap-6",
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 max-w-4xl mx-auto w-full"
      )}
    >
      {skeletonItems.map((_, index) => (
        <motion.div key={index} variants={itemVariants} className="h-full">
          {viewMode === "list" ? (
            <ListSkeleton />
          ) : (
            <GridSkeleton />
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default EventsLoadingSkeleton
