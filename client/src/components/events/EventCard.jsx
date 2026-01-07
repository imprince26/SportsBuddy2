/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { format, isToday, isTomorrow, differenceInDays } from "date-fns"
import {
  MapPin, Users, Clock, Calendar, ArrowRight, Bookmark, CheckCircle2
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const EventCard = ({ event, index = 0, viewMode = "grid", user = null }) => {
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Date calculations
  const eventDate = new Date(event.date)
  const isPastEvent = eventDate < new Date()
  const daysUntil = differenceInDays(eventDate, new Date())

  // User status
  const isParticipant = user && event.participants?.some(p => {
    const participantId = typeof p.user === 'object' ? p.user._id : p.user
    return participantId === user.id
  })
  const isCreator = user && (event.createdBy?._id === user.id || event.createdBy === user.id)
  const hasJoined = isParticipant || isCreator

  // Capacity
  const participantCount = event.participantCount || event.participants?.length || 0
  const maxParticipants = event.maxParticipants || 10
  const fillPercentage = Math.min(100, (participantCount / maxParticipants) * 100)
  const spotsLeft = Math.max(0, maxParticipants - participantCount)
  const isAlmostFull = fillPercentage >= 80

  // Price
  const isFreeEvent = !event.registrationFee || event.registrationFee === 0

  // Date label
  const getDateLabel = () => {
    if (isPastEvent) return "Ended"
    if (isToday(eventDate)) return "Today"
    if (isTomorrow(eventDate)) return "Tomorrow"
    if (daysUntil <= 7) return `In ${daysUntil} days`
    return format(eventDate, "MMM d")
  }

  // Difficulty color
  const getDifficultyStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-primary/10 text-primary border-primary/20'
      case 'intermediate': return 'bg-primary/15 text-primary border-primary/30'
      case 'advanced': return 'bg-primary/20 text-primary border-primary/40'
      default: return 'bg-secondary text-muted-foreground border-border/50'
    }
  }

  // List View
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
      >
        <Link to={`/events/${event._id}`} className="group block">
          <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
                {event.images?.[0]?.url ? (
                  <img
                    src={event.images[0].url}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                {/* Date Badge */}
                <div className="absolute top-3 left-3">
                  <div className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md",
                    isPastEvent
                      ? "bg-muted/90 text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  )}>
                    {getDateLabel()}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                <div>
                  {/* Category & Status */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="rounded-md text-xs border-primary/20 text-primary bg-primary/5">
                      {event.category || "Sports"}
                    </Badge>
                    {event.difficulty && (
                      <Badge variant="outline" className={cn("rounded-md text-xs", getDifficultyStyle(event.difficulty))}>
                        {event.difficulty}
                      </Badge>
                    )}
                    {hasJoined && (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Joined
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary/60" />
                      {format(eventDate, "EEE, MMM d")} • {event.time || "TBA"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary/60" />
                      {event.location?.city || event.location?.address || "TBD"}
                    </span>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    {/* Participants */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {event.participants?.slice(0, 3).map((p, i) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={p.user?.avatar?.url} />
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                              {p.user?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{participantCount}</span>/{maxParticipants}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="text-sm">
                      <span className="font-bold text-primary">
                        {isFreeEvent ? "Free" : `₹${event.registrationFee}`}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isPastEvent ? "secondary" : "default"}
                    disabled={isPastEvent}
                    className="rounded-lg gap-1"
                  >
                    {isPastEvent ? "Ended" : "View"}
                    {!isPastEvent && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="h-full"
    >
      <Link to={`/events/${event._id}`} className="group block h-full">
        <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card">
          {/* Image Section */}
          <div className="relative h-44 overflow-hidden bg-muted">
            {event.images?.[0]?.url ? (
              <img
                src={event.images[0].url}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Calendar className="w-12 h-12 text-muted-foreground/20" />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Top row: Date + Bookmark */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm",
                isPastEvent
                  ? "bg-muted/90 text-muted-foreground"
                  : isToday(eventDate) || isTomorrow(eventDate)
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/90 text-foreground"
              )}>
                {getDateLabel()}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-white"
                onClick={(e) => {
                  e.preventDefault()
                  setIsBookmarked(!isBookmarked)
                }}
              >
                <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
              </Button>
            </div>

            {/* Bottom: Category badge */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs backdrop-blur-sm">
                  {event.category || "Sports"}
                </Badge>
                {isAlmostFull && !isPastEvent && (
                  <Badge variant="secondary" className="bg-background/80 text-foreground border-0 text-xs backdrop-blur-sm">
                    {spotsLeft} spots left
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col">
            {/* Title */}
            <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
              {event.name}
            </h3>

            {/* Meta info */}
            <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                <span className="truncate">{format(eventDate, "EEE, MMM d")} • {event.time || "TBA"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                <span className="truncate">{event.location?.city || event.location?.address || "Location TBD"}</span>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Capacity bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {participantCount}/{maxParticipants} joined
                </span>
                <span className={cn(
                  "font-medium",
                  isAlmostFull ? "text-primary" : "text-muted-foreground"
                )}>
                  {Math.round(fillPercentage)}%
                </span>
              </div>
              <Progress value={fillPercentage} className="h-1.5" />
            </div>

            {/* Footer: Price + Status/Button */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Entry</p>
                <p className="text-base font-bold text-primary">
                  {isFreeEvent ? "Free" : `₹${event.registrationFee}`}
                </p>
              </div>

              {isPastEvent ? (
                <Badge variant="secondary" className="rounded-lg px-3 py-1">
                  Ended
                </Badge>
              ) : hasJoined ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Joined
                </Badge>
              ) : (
                <Button size="sm" className="rounded-lg gap-1 shadow-sm shadow-primary/20">
                  Join <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export default EventCard
