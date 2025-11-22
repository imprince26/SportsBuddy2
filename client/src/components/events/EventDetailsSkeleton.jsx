import { Skeleton } from "../ui/skeleton"
import { Card, CardContent, CardHeader } from "../ui/card"

const EventDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative">

      <div className="relative z-10">
        {/* Hero Section Skeleton */}
        <div className="relative overflow-hidden border-b border-border bg-background/50 backdrop-blur-sm">

          <div className="relative container mx-auto px-4 py-8 sm:py-12 lg:py-16">
            {/* Breadcrumb Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>

            {/* Hero Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content Skeleton */}
              <div className="space-y-6">
                {/* Category Badge */}
                <Skeleton className="h-12 w-64 rounded-full" />

                {/* Title */}
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-6 w-2/3 mt-4" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="relative p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border">
                      <Skeleton className="w-10 h-10 mx-auto mb-2 rounded-xl" />
                      <Skeleton className="h-6 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Skeleton className="h-12 w-40 rounded-2xl" />
                  <Skeleton className="h-12 w-40 rounded-2xl" />
                </div>
              </div>

              {/* Right Content - Hero Image Skeleton */}
              <div className="relative">
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm">
                  <Skeleton className="w-full h-full" />

                  {/* Action Buttons Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="w-2 h-2 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs Skeleton */}
              <div className="w-full">
                <div className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-1 shadow-lg mb-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-xl" />
                  ))}
                </div>

                {/* Tab Content - About Section */}
                <div className="space-y-6">
                  {/* About Card */}
                  <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <Skeleton className="h-6 w-48" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Skeleton className="w-5 h-5 rounded" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="h-5 w-32" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Rules and Equipment Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <Skeleton className="h-6 w-36" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                              <Skeleton className="w-6 h-6 rounded-full" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Location Card */}
                  <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-6 w-36" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </CardContent>
              </Card>

              {/* Event Organizer Card */}
              <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-8 flex-1 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Stats Card */}
              <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Similar Events Card */}
              <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 space-y-2">
                    <Skeleton className="w-12 h-12 mx-auto rounded" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailsSkeleton
