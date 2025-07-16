import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { CalendarDays, MapPin, Users, Star, Clock, Calendar } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const EventCard = ({ event, index,categories }) => {
      // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark border-primary-light/30 dark:border-primary-dark/30"
      case "Ongoing":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30"
      case "Completed":
        return "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark border-muted-light/30 dark:border-muted-dark/30"
      case "Cancelled":
        return "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark border-destructive-light/30 dark:border-destructive-dark/30"
      default:
        return "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark border-muted-light/30 dark:border-muted-dark/30"
    }
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30"
      case "Intermediate":
        return "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark border-accent-light/30 dark:border-accent-dark/30"
      case "Advanced":
        return "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark border-destructive-light/30 dark:border-destructive-dark/30"
      default:
        return "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark border-muted-light/30 dark:border-muted-dark/30"
    }
  }
  return (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/events/${event._id}`}>
        <Card className="h-full overflow-hidden bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
          <div className="relative h-48 overflow-hidden">
            {event.images && event.images.length > 0 ? (
              <img
                src={event.images[0].url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark" />
              </div>
            )}
            
            {/* Overlay with badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge className={cn("text-xs font-medium border", getStatusColor(event.status))}>
                {event.status}
              </Badge>
              <Badge className={cn("text-xs font-medium border", getDifficultyColor(event.difficulty))}>
                {event.difficulty}
              </Badge>
            </div>
            
            {/* Category badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-background-light/90 dark:bg-background-dark/90 text-foreground-light dark:text-foreground-dark border-border-light dark:border-border-dark">
                {categories.find(c => c.value === event.category)?.icon} {event.category}
              </Badge>
            </div>
            
            {/* Event title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white text-xl font-bold mb-1 line-clamp-2 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                {event.name}
              </h3>
              <div className="flex items-center text-white/90 text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{event.location?.city}</span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 space-y-3">
            {/* Date and time */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                <CalendarDays className="w-4 h-4 mr-1" />
                <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                <Clock className="w-4 h-4 mr-1" />
                <span>{event.time}</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-foreground-light dark:text-foreground-dark text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-1 text-primary-light dark:text-primary-dark" />
                <span className="text-foreground-light dark:text-foreground-dark font-medium">
                  {event.participantCount || 0}
                </span>
                <span className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  /{event.maxParticipants}
                </span>
              </div>
              
              {event.averageRating > 0 && (
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1 text-accent-light dark:text-accent-dark fill-current" />
                  <span className="text-foreground-light dark:text-foreground-dark font-medium">
                    {event.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              
              {event.registrationFee > 0 && (
                <div className="text-sm font-medium text-success-light dark:text-success-dark">
                  ₹{event.registrationFee}
                </div>
              )}
            </div>
            
            {/* Progress bar for participants */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                <span>Spots filled</span>
                <span>{Math.round(((event.participantCount || 0) / event.maxParticipants) * 100)}%</span>
              </div>
              <div className="w-full bg-muted-light dark:bg-muted-dark rounded-full h-2">
                <div
                  className="bg-primary-light dark:bg-primary-dark h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((event.participantCount || 0) / event.maxParticipants) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default EventCard
