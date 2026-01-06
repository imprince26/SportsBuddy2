import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Community Details Page Skeleton
const CommunityDetailsSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Skeleton */}
            <div className="relative">
                <Skeleton className="h-56 md:h-72 lg:h-96 w-full" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                    <div className="container mx-auto">
                        <div className="flex items-end gap-4 md:gap-6">
                            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-8 md:h-10 w-64" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card className="border-border">
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <Skeleton className="h-12 w-full rounded-lg" />

                        {/* Create Post */}
                        <Card className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <Skeleton className="h-10 flex-1 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Posts */}
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="border-border">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-20 w-full" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* About Card */}
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-5 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                                <div className="space-y-2 pt-4 border-t">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Members Card */}
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-5 w-24" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="w-10 h-10 rounded-full" />
                                    ))}
                                </div>
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-5 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-8 h-8 rounded-lg" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <Skeleton className="h-4 w-8" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommunityDetailsSkeleton
