import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { format, formatDistanceToNow } from "date-fns"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  ChevronLeft,
  MessageSquare,
  Share2,
  Heart,
  Edit,
  Trash2,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Send,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Shield,
  Target,
  Award,
  TrendingUp,
  Zap,
  Flag,
  MoreVertical,
  Copy,
  CheckCircle,
  Info,
  X
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import EventDetailsSkeleton from "@/components/events/EventDetailsSkeleton"
import EventDetailsError from "@/components/events/EventDetailsError"
import { showToast } from "@/components/CustomToast"
import { cn } from "@/lib/utils"
import api from "@/utils/api"

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const {deleteEvent,joinEvent,leaveEvent} = useEvents()
  const chatEndRef = useRef(null)

  // State management
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // Form states
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [message, setMessage] = useState("")
  const [teamName, setTeamName] = useState("")
  
  // Modal states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Action states
  const [loadingAction, setLoadingAction] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get(`/events/${id}`)
        
        if (response.data.success) {
          setEvent(response.data.data)
          document.title = `${response.data.data.name} - SportsBuddy`
          
          // Check if user has already rated
          if (user && response.data.data.ratings) {
            const userRating = response.data.data.ratings.find(r => r.user._id === user.id)
            setHasRated(!!userRating)
          }
          
          // Check if event is in favorites
          const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
          setIsFavorite(favorites.includes(id))
        } else {
          throw new Error(response.data.message || "Event not found")
        }
      } catch (err) {
        console.error("Error fetching event details:", err)
        setError(err.response?.data?.message || err.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEventDetails()
    }
  }, [id, user])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [event?.chat, activeTab])

  // Helper functions
  const isParticipant = () => {
    if (!user || !event) return false
    return event.participants.some(p => p.user._id === user.id)
  }

  const isCreator = () => {
    if (!user || !event) return false
    return event.createdBy._id === user.id
  }

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

  // Event actions
  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    setLoadingAction(true)
    try {
      await joinEvent(id)
      window.location.reload(); 
  
    } catch (err) {
      console.error("Error joining event:", err)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleLeaveEvent = async () => {
    setLoadingAction(true)
    try {
       await leaveEvent(id)
       window.location.reload();
    } catch (err) {
      console.error("Error leaving event:", err)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteEvent = async () => {
    setLoadingAction(true)
    try {
      await deleteEvent(id)
      navigate("/events")
    } catch (err) {
      console.error("Error deleting event:", err)
    } finally {
      setLoadingAction(false)
      setShowConfirmDelete(false)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (rating === 0) return

    try {
      const response = await api.post(`/events/${id}/ratings`, { rating, review })
      if (response.data.success) {
        setEvent(response.data.data)
        setRating(0)
        setReview("")
        setHasRated(true)
      }
    } catch (err) {
      console.error("Error submitting rating:", err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      await api.post(`/events/${id}/messages`, { message })
      setMessage("")
      // Refresh event to get updated chat
      const response = await api.get(`/events/${id}`)
      if (response.data.success) {
        setEvent(response.data.data)
      }
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter(eventId => eventId !== id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    } else {
      favorites.push(id)
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }

    setIsFavorite(!isFavorite)
  }

  const handleShare = async (platform) => {
    const eventUrl = window.location.href
    const eventTitle = event?.name || "Sports Event"

    switch (platform) {
      case "copy":
        try {
          await navigator.clipboard.writeText(eventUrl)
          showToast.success("Link copied to clipboard ")
        } catch (err) {
          console.error("Failed to copy:", err)
        }
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`,
          "_blank"
        )
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${eventTitle} - ${eventUrl}`)}`, "_blank")
        break
    }

    setShowShareModal(false)
  }

  // Loading skeleton
  if (loading) {
    return (
      <EventDetailsSkeleton />
    )
  }

  // Error state
  if (error) {
    return (
     <EventDetailsError error={error} />
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild className="pl-0 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark">
            <Link to="/events">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Events
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark shadow-xl">
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    {event.images && event.images.length > 0 ? (
                      <img
                        src={event.images[activeImageIndex].url || "/placeholder.svg"}
                        alt={event.name}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                        <Calendar className="w-24 h-24 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      </div>
                    )}
                  </div>

                  {/* Image Navigation */}
                  {event.images && event.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 bg-background-light/90 dark:bg-background-dark/90"
                        onClick={() => setActiveImageIndex(prev => prev === 0 ? event.images.length - 1 : prev - 1)}
                      >
                        <ArrowLeft className="w-4 h-4 text-foreground-light dark:text-foreground-dark " />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 bg-background-light dark:bg-background-dark"
                        onClick={() => setActiveImageIndex(prev => prev === event.images.length - 1 ? 0 : prev + 1)}
                      >
                        <ArrowRight className="w-4 h-4 text-foreground-light dark:text-foreground-dark" />
                      </Button>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => setShowShareModal(true)}
                      className="opacity-90 hover:opacity-100 bg-background-light/90 dark:bg-background-dark"
                    >
                      <Share2 className="w-4 h-4 text-foreground-light dark:text-foreground-dark" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={toggleFavorite}
                      className={cn(
                        "opacity-90 hover:opacity-100 bg-background-light/90 dark:bg-background-dark/90",
                        isFavorite && "text-red-500"
                      )}
                    >
                      <Heart className={cn("w-4 h-4 ", isFavorite && "fill-current",!isFavorite && "text-foreground-light dark:text-foreground-dark")} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="opacity-90 hover:opacity-100 bg-background-light/90 dark:bg-background-dark/90"
                        >
                          <MoreVertical className="w-4 h-4 text-foreground-light dark:text-foreground-dark" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                        {/* <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                          <Flag className="w-4 h-4 mr-2" />
                          Report Event
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => handleShare("copy")}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Image Indicators */}
                  {event.images && event.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {event.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={cn(
                            "w-3 h-3 rounded-full transition-colors",
                            index === activeImageIndex ? "bg-white" : "bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={cn("border font-medium", getStatusColor(event.status))}>
                      {event.status}
                    </Badge>
                    <Badge className={cn("border font-medium", getDifficultyColor(event.difficulty))}>
                      {event.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="border border-border-light dark:border-border-dark">
                      {event.category}
                    </Badge>
                    {event.eventType && (
                      <Badge variant="outline" className="border-border-light dark:border-border-dark">
                        {event.eventType}
                      </Badge>
                    )}
                  </div>

                  {/* Title and Location */}
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground-light dark:text-foreground-dark mb-3">
                    {event.name}
                  </h1>

                  <div className="flex items-center gap-2 text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-lg">
                      {event.location.address}, {event.location.city}
                    </span>
                  </div>

                  {/* Event Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted-light/50 dark:bg-muted-dark/50 rounded-lg p-4 text-center">
                      <Calendar className="w-6 h-6 text-primary-light dark:text-primary-dark mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Date</p>
                      <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                        {format(new Date(event.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    
                    <div className="bg-muted-light/50 dark:bg-muted-dark/50 rounded-lg p-4 text-center">
                      <Clock className="w-6 h-6 text-primary-light dark:text-primary-dark mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Time</p>
                      <p className="font-semibold text-foreground-light dark:text-foreground-dark">{event.time}</p>
                    </div>
                    
                    <div className="bg-muted-light/50 dark:bg-muted-dark/50 rounded-lg p-4 text-center">
                      <Users className="w-6 h-6 text-primary-light dark:text-primary-dark mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Participants</p>
                      <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                        {event.participantCount}/{event.maxParticipants}
                      </p>
                    </div>
                    
                    {event.registrationFee > 0 ? (
                      <div className="bg-muted-light/50 dark:bg-muted-dark/50 rounded-lg p-4 text-center">
                        <DollarSign className="w-6 h-6 text-primary-light dark:text-primary-dark mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Fee</p>
                        <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                          ${event.registrationFee}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted-light/50 dark:bg-muted-dark/50 rounded-lg p-4 text-center">
                        <Star className="w-6 h-6 text-primary-light dark:text-primary-dark mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Rating</p>
                        <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                          {event.averageRating > 0 ? event.averageRating.toFixed(1) : "N/A"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Participation Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                      <span>Event Capacity</span>
                      <span>{Math.round((event.participantCount / event.maxParticipants) * 100)}% filled</span>
                    </div>
                    <Progress 
                      value={(event.participantCount / event.maxParticipants) * 100} 
                      className="h-3 bg-muted-light dark:bg-muted-dark"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {isAuthenticated && !isParticipant() && !isCreator() && event.status === "Upcoming" && (
                      <Button
                        onClick={handleJoinEvent}
                        disabled={loadingAction || event.participantCount >= event.maxParticipants}
                        className="flex-1 sm:flex-none bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 text-white"
                        size="lg"
                      >
                        {loadingAction ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-5 h-5 mr-2" />
                        )}
                        {event.participantCount >= event.maxParticipants ? "Event Full" : "Join Event"}
                      </Button>
                    )}

                    {isAuthenticated && isParticipant() && event.status === "Upcoming" && (
                      <Button
                        variant="destructive"
                        onClick={handleLeaveEvent}
                        disabled={loadingAction}
                        size="lg"
                      >
                        {loadingAction ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <UserMinus className="w-5 h-5 mr-2" />
                        )}
                        Leave Event
                      </Button>
                    )}

                    {isAuthenticated && isCreator() && (
                      <>
                        <Button variant="outline" asChild size="lg">
                          <Link to={`/events/edit/${event._id}`}>
                            <Edit className="w-5 h-5 mr-2" />
                            Edit Event
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setShowConfirmDelete(true)}
                          size="lg"
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Delete Event
                        </Button>
                      </>
                    )}

                    {!isAuthenticated && (
                      <Button asChild size="lg" className="flex-1 sm:flex-none bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90">
                        <Link to="/login">
                          <UserPlus className="w-5 h-5 mr-2" />
                          Login to Join
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-full">
                  <TabsTrigger value="details" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-full">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="participants" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-full">
                    Participants ({event.participantCount})
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-full">
                    Reviews ({event.ratings?.length || 0})
                  </TabsTrigger>
                  {isAuthenticated && isParticipant() && (
                    <TabsTrigger value="chat" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-full">
                      Chat
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
                  {/* About Section */}
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                        <Info className="w-5 h-5" />
                        About This Event
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-foreground-light dark:text-foreground-dark leading-relaxed">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Rules and Equipment */}
                  {(event.rules?.length > 0 || event.equipment?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.rules?.length > 0 && (
                        <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                              <Shield className="w-5 h-5" />
                              Event Rules
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {event.rules.map((rule, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-6 h-6 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-primary-light dark:text-primary-dark">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span className="text-foreground-light dark:text-foreground-dark">{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {event.equipment?.length > 0 && (
                        <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                              <Target className="w-5 h-5" />
                              Required Equipment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {event.equipment.map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-success-light dark:text-success-dark" />
                                    <span className="text-foreground-light dark:text-foreground-dark">{item.item || item}</span>
                                  </div>
                                  {item.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="participants" className="mt-6">
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                        <Users className="w-5 h-5" />
                        Event Participants
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {event.participants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {event.participants.map((participant) => (
                            <Link
                              to={`/profile/${participant.user._id}`}
                              key={participant.user._id}
                              className="flex items-center gap-3 p-4 rounded-lg border border-border-light dark:border-border-dark bg-muted-light/30 dark:bg-muted-dark/30"
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={participant.user.avatar?.url || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark">
                                  {participant.user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-foreground-light dark:text-foreground-dark">
                                  {participant.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                  Joined {formatDistanceToNow(new Date(participant.joinedAt), { addSuffix: true })}
                                </p>
                              </div>
                              {participant.user._id === event.createdBy._id && (
                                <Badge className="bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark border-primary-light/30 dark:border-primary-dark/30">
                                  <Award className="w-3 h-3 mr-1" />
                                  Organizer
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                            No participants yet
                          </h3>
                          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                            Be the first to join this exciting event!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6 mt-6">
                  {/* Rating Form */}
                  {isAuthenticated && isParticipant() && !hasRated && event.status === "Completed" && (
                    <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      <CardHeader>
                        <CardTitle className="text-foreground-light dark:text-foreground-dark">Leave a Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmitRating} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2 block">
                              Rating
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className="focus:outline-none transition-colors"
                                >
                                  <Star
                                    className={cn(
                                      "w-8 h-8",
                                      star <= rating
                                        ? "text-accent-light dark:text-accent-dark fill-current"
                                        : "text-muted-foreground-light dark:text-muted-foreground-dark"
                                    )}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2 block">
                              Review (Optional)
                            </label>
                            <Textarea
                              value={review}
                              onChange={(e) => setReview(e.target.value)}
                              placeholder="Share your experience with this event..."
                              rows={4}
                              className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={rating === 0}
                            className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                          >
                            Submit Review
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  {event.ratings && event.ratings.length > 0 ? (
                    <div className="space-y-4">
                      {event.ratings.map((rating, index) => (
                        <Card key={index} className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={rating.user.avatar?.url || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark">
                                  {rating.user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-foreground-light dark:text-foreground-dark">
                                    {rating.user.name}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={cn(
                                          "w-4 h-4",
                                          star <= rating.rating
                                            ? "text-accent-light dark:text-accent-dark fill-current"
                                            : "text-muted-foreground-light dark:text-muted-foreground-dark"
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {rating.review && (
                                  <p className="text-foreground-light dark:text-foreground-dark mb-2 leading-relaxed">
                                    {rating.review}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                  {formatDistanceToNow(new Date(rating.date), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      <CardContent className="text-center py-12">
                        <Star className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                          No reviews yet
                        </h3>
                        <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                          Be the first to share your experience!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {isAuthenticated && isParticipant() && (
                  <TabsContent value="chat" className="mt-6">
                    <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                          <MessageSquare className="w-5 h-5" />
                          Event Chat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-80 mb-4 p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                          {event.chat && event.chat.length > 0 ? (
                            <div className="space-y-4">
                              {event.chat.map((msg, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "flex",
                                    msg.user._id === user?.id ? "justify-end" : "justify-start"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "max-w-[80%] rounded-lg p-3",
                                      msg.user._id === user?.id
                                        ? "bg-primary-light dark:bg-primary-dark text-white"
                                        : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium opacity-90">
                                        {msg.user.name}
                                      </span>
                                      <span className="text-xs opacity-70">
                                        {format(new Date(msg.timestamp), "h:mm a")}
                                      </span>
                                    </div>
                                    <p className="text-sm">{msg.message}</p>
                                  </div>
                                </div>
                              ))}
                              <div ref={chatEndRef} />
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground-light dark:text-muted-foreground-dark py-8">
                              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                              <p>No messages yet. Start the conversation!</p>
                            </div>
                          )}
                        </ScrollArea>

                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
                          />
                          <Button
                            type="submit"
                            disabled={!message.trim()}
                            className="bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                <CardHeader>
                  <CardTitle className="text-foreground-light dark:text-foreground-dark">Event Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    to={`/profile/${event.createdBy._id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted-light/50 dark:hover:bg-muted-dark/50 transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={event.createdBy.avatar?.url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark">
                        {event.createdBy.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                        {event.createdBy.name}
                      </p>
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Event Organizer
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                    <TrendingUp className="w-5 h-5" />
                    Event Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Participants</span>
                    <span className="font-medium text-foreground-light dark:text-foreground-dark">
                      {event.participantCount}/{event.maxParticipants}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Event Type</span>
                    <span className="font-medium text-foreground-light dark:text-foreground-dark capitalize">
                      {event.eventType || "General"}
                    </span>
                  </div>
                  
                  {event.averageRating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent-light dark:fill-accent-dark text-accent-light dark:text-accent-dark" />
                        <span className="font-medium text-foreground-light dark:text-foreground-dark">
                          {event.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          ({event.ratings?.length || 0})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Spots Left</span>
                    <span className={cn(
                      "font-medium",
                      event.spotsLeft > 5 
                        ? "text-success-light dark:text-success-dark" 
                        : event.spotsLeft > 0 
                        ? "text-accent-light dark:text-accent-dark" 
                        : "text-destructive-light dark:text-destructive-dark"
                    )}>
                      {event.spotsLeft}
                    </span>
                  </div>
                  
                  {event.isUpcoming && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Days Until Event</span>
                      <span className="font-medium text-foreground-light dark:text-foreground-dark">
                        {event.daysUntilEvent} days
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground-light dark:text-foreground-dark">
                        {event.location.address}
                      </p>
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        {event.location.city}, {event.location.state}
                      </p>
                    </div>
                    
                    {event.location.coordinates && (
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          const [lng, lat] = event.location.coordinates.coordinates
                          window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Maps
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={toggleFavorite}
                  >
                    <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current text-red-500")} />
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>
                  
                  {/* <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setShowReportModal(true)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report Event
                  </Button> */}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        
        {/* Delete Confirmation Modal */}
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                <AlertTriangle className="w-5 h-5 text-destructive-light dark:text-destructive-dark" />
                Delete Event
              </DialogTitle>
              <DialogDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                Are you sure you want to delete this event? This action cannot be undone and all participants will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDelete(false)}
                className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground-light dark:text-foreground-dark">Share Event</DialogTitle>
              <DialogDescription className="text-muted-foreground-light dark:text-muted-foreground-dark">
                Share this event with your friends and fellow athletes
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleShare("copy")}
                className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("facebook")}
                className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("twitter")}
                className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("whatsapp")}
                className="bg-background-light dark:bg-background-dark border-input-light dark:border-input-dark"
              >
                WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark mx-auto">
            <div className="relative">
              <img
                src={event.images?.[activeImageIndex]?.url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-auto max-h\
                96 object-cover rounded-lg"
              />
              {/* <button
                className="absolute top-2 right-2 text-muted-foreground-light dark:text-muted-foreground-dark"
                onClick={() => setShowImageModal(false)}
              >
                <X className="w-6 h-6" />
              </button> */}
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Modal */}
        {/* <ReportModal
          open={showReportModal}
          setOpen={setShowReportModal}
          event={event}
        /> */}
      </div>
    </div>
  );
}

export default EventDetails