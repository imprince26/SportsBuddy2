/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  MapPin, Users, Clock, Heart, ArrowUpRight, Sparkles, Zap
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const EventCard = ({ event, index, categories, viewMode = "grid", featured = false }) => {
  const [isLiked, setIsLiked] = useState(false)

  // Get category info
  const getCategoryInfo = (category) => {
    const categoryInfo = categories.find(c => c.value === category)
    return {
      icon: categoryInfo?.icon || "",
      label: categoryInfo?.label || category
    }
  }

  // Calculate metrics
  const fillPercentage = ((event.participantCount || 0) / event.maxParticipants) * 100
  const isAlmostFull = fillPercentage > 85
  const isFreeEvent = !event.registrationFee || event.registrationFee === 0
  const eventDate = new Date(event.date)

  // List View
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Link to={`/events/${event._id}`} className="group block">
          <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row h-full">
              {/* Image Section */}
              <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 sm:hidden" />
                {event.images && event.images.length > 0 ? (
                  <img
                    src={event.images[0].url || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground">🏆</span>
                  </div>
                )}
                
                {/* Date Badge (Mobile) */}
                <div className="absolute top-3 left-3 z-20 sm:hidden">
                  <div className="bg-background/90 backdrop-blur-md rounded-lg p-2 text-center shadow-sm border border-border/50">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">
                      {format(eventDate, "MMM")}
                    </div>
                    <div className="text-lg font-black leading-none">
                      {format(eventDate, "dd")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="rounded-md font-medium bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        {getCategoryInfo(event.category).label}
                      </Badge>
                      {featured && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                          <Sparkles className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsLiked(!isLiked)
                      }}
                    >
                      <Heart className={cn("w-4 h-4", isLiked && "fill-current text-red-500")} />
                    </Button>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {event.name}
                  </h3>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      {format(eventDate, "EEE, MMM d")} • {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {event.location?.city || "TBD"}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <Avatar key={i} className="w-7 h-7 border-2 border-background">
                          <AvatarFallback className="text-[10px] bg-muted">U{i}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{event.participantCount || 0}</span> going
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-muted-foreground">Price</div>
                      <div className="text-lg font-bold text-primary">
                        {isFreeEvent ? "Free" : `₹${event.registrationFee}`}
                      </div>
                    </div>
                    <Button size="sm" className="rounded-full px-6 group-hover:translate-x-1 transition-transform">
                      View <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Grid View (Default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={`/events/${event._id}`} className="group block h-full">
        <Card className="h-full flex flex-col border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group -translate-y-1 overflow-hidden">
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            
            {event.images && event.images.length > 0 ? (
              <img
                src={event.images[0].url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-6xl opacity-20">🏆</span>
              </div>
            )}

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              <div className="bg-background/95 backdrop-blur-md rounded-xl p-2.5 text-center shadow-lg min-w-[60px]">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                  {format(eventDate, "MMM")}
                </div>
                <div className="text-xl font-black leading-none text-foreground">
                  {format(eventDate, "dd")}
                </div>
              </div>

              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-white border-0"
                onClick={(e) => {
                  e.preventDefault()
                  setIsLiked(!isLiked)
                }}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current text-red-500")} />
              </Button>
            </div>

            {/* Bottom Info on Image */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-md border-0">
                  {getCategoryInfo(event.category).label}
                </Badge>
                {isAlmostFull && (
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-0 animate-pulse">
                    <Zap className="w-3 h-3 mr-1" /> Few Spots
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-white line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <div className="flex items-center text-white/80 text-sm">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                <span className="truncate">{event.location?.city || "Location TBD"}</span>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <CardContent className="flex-1 p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
              <div className="flex items-center bg-secondary/50 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {event.time}
              </div>
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                <span>{event.participantCount || 0}/{event.maxParticipants}</span>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium text-primary">
                    {Math.round(fillPercentage)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Card Footer */}
          <CardFooter className="p-5 flex items-center justify-between border-t border-border/50 pt-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Price</p>
              <p className="text-lg font-bold text-primary">
                {isFreeEvent ? "Free" : `₹${event.registrationFee}`}
              </p>
            </div>
            <Button size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              Join Now
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

export default EventCard
