import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Community Card Skeleton
export const CommunityCardSkeleton = ({ variant = "default" }) => {
    return (
        <Card className="overflow-hidden">
            {/* Image Skeleton */}
            <Skeleton className={variant === "compact" ? "w-32 h-full" : "h-44 sm:h-48 w-full"} />

            <CardContent className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>

                {/* Creator */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>

                {/* Button */}
                <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
        </Card>
    )
}

// Communities Grid Skeleton
export const CommunitiesGridSkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <CommunityCardSkeleton key={i} />
            ))}
        </div>
    )
}

// Hero Section Skeleton
export const CommunityHeroSkeleton = () => {
    return (
        <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden border-b border-border/40">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-3xl space-y-6">
                        <Skeleton className="h-16 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                        <div className="flex gap-4 mt-8">
                            <Skeleton className="h-14 w-40 rounded-full" />
                            <Skeleton className="h-14 w-40 rounded-full" />
                        </div>
                    </div>
                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="w-40 h-32 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Filters Skeleton
export const CommunityFiltersSkeleton = () => {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}

export default {
    CommunityCardSkeleton,
    CommunitiesGridSkeleton,
    CommunityHeroSkeleton,
    CommunityFiltersSkeleton
}
