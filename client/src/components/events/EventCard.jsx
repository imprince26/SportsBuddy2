/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { 
  CalendarDays, MapPin, Users, Star, Clock, Heart, Share2, 
  Award, TrendingUp, Eye, ChevronRight, AlertCircle
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const EventCard = ({ event, index, categories, viewMode = "grid", featured = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "Upcoming":
        return { 
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
          label: "Upcoming"
        }
      case "Ongoing":
        return { 
          className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
          label: "Live"
        }
      case "Completed":
        return { 
          className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
          label: "Completed"
        }
      case "Cancelled":
        return { 
          className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
          label: "Cancelled"
        }
      default:
        return { 
          className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
          label: status
        }
    }
  }

  // Get difficulty styling
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return { 
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
          label: "Beginner"
        }
      case "Intermediate":
        return { 
          className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
          label: "Intermediate"
        }
      case "Advanced":
        return { 
          className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300",
          label: "Advanced"
        }
      default:
        return { 
          className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300",
          label: difficulty
        }
    }
  }

  // Get category info
  const getCategoryInfo = (category) => {
    const categoryInfo = categories.find(c => c.value === category)
    return {
      icon: categoryInfo?.icon || "🏆",
      label: categoryInfo?.label || category
    }
  }

  // Calculate metrics
  const fillPercentage = ((event.participantCount || 0) / event.maxParticipants) * 100
  const isAlmostFull = fillPercentage > 85
  const spotsLeft = event.maxParticipants - (event.participantCount || 0)
  const isFreeEvent = !event.registrationFee || event.registrationFee === 0

  // List view component
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group"
      >
        <Link to={`/events/${event._id}`}>
          <Card className={cn(
            "overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300",
            featured && "ring-1 ring-amber-200 dark:ring-amber-800 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10"
          )}>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Image Section */}
                <div className="relative h-48 sm:h-32 sm:w-48 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={event.images[0].url || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <div className="text-4xl">
                        {getCategoryInfo(event.category).icon}
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={cn("text-xs font-medium", getStatusBadge(event.status).className)}>
                      {getStatusBadge(event.status).label}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium">
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Free Badge */}
                  {isFreeEvent && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                        🆓 Free
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {event.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={cn("text-xs", getDifficultyBadge(event.difficulty).className)}>
                          {getDifficultyBadge(event.difficulty).label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryInfo(event.category).icon} {getCategoryInfo(event.category).label}
                        </Badge>
                        {isAlmostFull && (
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Almost Full
                          </Badge>
                        )}
                        {isFreeEvent && (
                          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 text-xs">
                            🆓 Free
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2 text-green-600" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        <span className="truncate">{event.location?.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2 text-purple-600" />
                        <span>{event.participantCount || 0}/{event.maxParticipants}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
                      <div className="flex items-center gap-4">
                        {event.averageRating > 0 && (
                          <div className="flex items-center text-sm">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {event.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        {!isFreeEvent && (
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ₹{event.registrationFee}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setIsLiked(!isLiked)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Heart className={cn("w-4 h-4", isLiked ? "text-red-500 fill-current" : "text-gray-400")} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.preventDefault()}
                          className="h-8 w-8 p-0"
                        >
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Grid view component (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/events/${event._id}`} className="block h-full">
        <Card className={cn(
          "h-full overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800  hover:shadow-lg transition-all duration-300",
          featured && " bg-gradient-to-b from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10"
        )}>
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
            {event.images && event.images.length > 0 ? (
              <img
                src={event.images[0].url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <div className="text-6xl opacity-60">
                  {getCategoryInfo(event.category).icon}
                </div>
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              <div className="flex gap-2">
                <Badge className={cn("text-xs font-medium border-none rounded-xl", getStatusBadge(event.status).className)}>
                  {getStatusBadge(event.status).label}
                </Badge>
                {isAlmostFull && (
                  <Badge className="bg-orange-100/90 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 text-xs backdrop-blur-sm rounded-xl">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Almost Full
                  </Badge>
                )}
              </div>
              
              {featured && (
                <Badge className="bg-amber-100/90 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs backdrop-blur-sm rounded-xl">
                  Featured
                </Badge>
              )}
            </div>

            {/* Free Badge - Bottom Right */}
            {isFreeEvent && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-green-100/90 text-green-800 rounded-xl dark:bg-green-900/50 dark:text-green-300 text-xs backdrop-blur-sm">
                  Free
                </Badge>
              </div>
            )}
            
            {/* Title Overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white text-lg font-semibold line-clamp-2 mb-1 drop-shadow-lg">
                {event.name}
              </h3>
              <div className="flex items-center text-white/90 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{event.location?.city}</span>
              </div>
            </div>

            {/* Hover Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-blue-600/20 flex items-center justify-center"
                >
                  <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-3 backdrop-blur-sm">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <CardContent className="p-4">
            {/* Event Meta */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CalendarDays className="w-4 h-4 mr-1 text-blue-600" />
                  <span>{format(new Date(event.date), "MMM dd")}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1 text-green-600" />
                  <span>{event.time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs border-none rounded-xl", getDifficultyBadge(event.difficulty).className)}>
                  {getDifficultyBadge(event.difficulty).label}
                </Badge>
                <Badge variant="outline" className="rounded-xl text-xs">
                  {getCategoryInfo(event.category).label}
                </Badge>
                {isFreeEvent && (
                  <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-xs rounded-xl">
                    Free
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
              {event.description}
            </p>
            
            {/* Participants Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Participants</span>
                <span className="font-medium">{event.participantCount || 0}/{event.maxParticipants}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    fillPercentage > 85 ? "bg-orange-500" :
                    fillPercentage > 60 ? "bg-blue-500" :
                    "bg-green-500"
                  )}
                  style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Footer Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                {event.analytics.avgRating > 0 && (
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {event.analytics.avgRating.toFixed(1)}
                    </span>
                  </div>
                )}
                
                {!isFreeEvent && (
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ₹{event.registrationFee}
                  </div>
                )}

                {event.analytics.avgRating > 4.5 && (
                  <Badge className="bg-yellow-100 text-yellow-800 rounded-xl dark:bg-yellow-900/30 dark:text-yellow-300 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Top Rated
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsLiked(!isLiked)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Heart className={cn("w-4 h-4", isLiked ? "text-red-500 fill-current" : "text-gray-400")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.preventDefault()}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
            
            {/* Quick Info */}
            {spotsLeft <= event.maxParticipants * 0.2 && spotsLeft > 0 && (
              <div className="mt-3 text-center">
                <Badge className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-xs">
                  Only {spotsLeft} spots left!
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default EventCard