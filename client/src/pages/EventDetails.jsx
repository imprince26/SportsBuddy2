"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, joinEvent, leaveEvent, deleteEvent, addRating, sendMessage, loading } = useEvents()
  const { user, isAuthenticated } = useAuth()

  const [event, setEvent] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [message, setMessage] = useState("")
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(id)
        setEvent(eventData)

        // Check if event is in favorites
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setIsFavorite(favorites.includes(id))
      } catch (error) {
        console.error("Error fetching event details:", error)
      }
    }

    fetchEventDetails()
  }, [id])

  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [event?.chat, activeTab])

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    setLoadingAction(true)
    try {
      const result = await joinEvent(id)
      if (result.success) {
        setEvent(result.event)
      }
    } catch (error) {
      console.error("Error joining event:", error)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleLeaveEvent = async () => {
    setLoadingAction(true)
    try {
      const result = await leaveEvent(id)
      if (result.success) {
        setEvent(result.event)
      }
    } catch (error) {
      console.error("Error leaving event:", error)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteEvent = async () => {
    setLoadingAction(true)
    try {
      await deleteEvent(id)
      navigate("/events")
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (rating === 0) return

    try {
      const result = await addRating(id, { rating, review })
      if (result.success) {
        setEvent(result.event)
        setRating(0)
        setReview("")
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      await sendMessage(id, message)
      setMessage("")
      // Refresh event to get updated chat
      const updatedEvent = await getEventById(id)
      setEvent(updatedEvent)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter((eventId) => eventId !== id)
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
          // You could add a toast notification here
        } catch (err) {
          console.error("Failed to copy: ", err)
        }
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`,
          "_blank",
        )
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${eventTitle} - ${eventUrl}`)}`, "_blank")
        break
    }

    setShowShareOptions(false)
  }

  const isParticipant = () => {
    if (!user || !event) return false
    return event.participants.some((p) => p.user._id === user.id)
  }

  const isCreator = () => {
    if (!user || !event) return false
    return event.createdBy._id === user.id
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Ongoing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div>
          {/* Back Button Skeleton */}
          <Skeleton className="h-10 w-32 mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Main Event Card Skeleton */}
              <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg overflow-hidden">
                {/* Hero Image Skeleton */}
                <Skeleton className="h-96 w-full rounded-t-lg" />
                <CardContent className="p-6 space-y-4">
                  {/* Badges Skeleton */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  {/* Title Skeleton */}
                  <Skeleton className="h-8 w-3/4" />
                  {/* Location Skeleton */}
                  <Skeleton className="h-4 w-1/2" />
                  {/* Event Info Grid Skeleton */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  {/* Action Buttons Skeleton */}
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Skeleton */}
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                {/* Tab Content Skeleton */}
                <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
                {/* Rules/Equipment Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
                    <CardHeader>
                      <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                  <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
                    <CardHeader>
                      <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Sidebar Skeletons */}
            <div className="space-y-6">
              {/* Organizer Card Skeleton */}
              <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Stats Card Skeleton */}
              <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
              {/* Location Card Skeleton */}
              <Card className="bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="text-center py-16 bg-card-light dark:bg-card-dark shadow-lg rounded-lg">
          <CardContent>
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Event Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              The event you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/events">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Events
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
            <div className="relative">
              <div className="aspect-video overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={event.images[activeImageIndex].url || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {event.images && event.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={() => setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <DropdownMenu open={showShareOptions} onOpenChange={setShowShareOptions}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="opacity-90 hover:opacity-100">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare("copy")}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("facebook")}>Share on Facebook</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("twitter")}>Share on Twitter</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("whatsapp")}>Share on WhatsApp</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleFavorite}
                  className={`opacity-90 hover:opacity-100 ${isFavorite ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>

              {/* Image Indicators */}
              {event.images && event.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {event.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === activeImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                <Badge className={getDifficultyColor(event.difficulty)}>{event.difficulty}</Badge>
                <Badge variant="secondary">{event.category}</Badge>
              </div>

              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>

              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {event.location.address}, {event.location.city}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(event.date), "MMMM dd, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="font-medium">
                      {event.participants.length}/{event.maxParticipants}
                    </p>
                  </div>
                </div>
                {event.registrationFee > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fee</p>
                      <p className="font-medium">${event.registrationFee}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isAuthenticated && !isParticipant() && !isCreator() && event.status === "Upcoming" && (
                  <Button
                    onClick={handleJoinEvent}
                    disabled={loadingAction || event.participants.length >= event.maxParticipants}
                    className="flex-1 sm:flex-none"
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {event.participants.length >= event.maxParticipants ? "Event Full" : "Join Event"}
                  </Button>
                )}

                {isAuthenticated && isParticipant() && event.status === "Upcoming" && (
                  <Button variant="destructive" onClick={handleLeaveEvent} disabled={loadingAction}>
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4 mr-2" />
                    )}
                    Leave Event
                  </Button>
                )}

                {isAuthenticated && isCreator() && (
                  <>
                    <Button variant="outline" asChild>
                      <Link to={`/events/edit/${event._id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="destructive" onClick={() => setShowConfirmDelete(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}

                {isAuthenticated && isParticipant() && (
                  <Button variant="outline" asChild>
                    <Link to={`/chat/${event._id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid bg-card-light dark:bg-card-dark w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="participants">Participants ({event.participants.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({event.ratings?.length || 0})</TabsTrigger>
              {isAuthenticated && isParticipant() && <TabsTrigger value="chat">Chat</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{event.description}</p>
                </CardContent>
              </Card>

              {(event.rules?.length > 0 || event.equipment?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.rules?.length > 0 && (
                    <Card className="overflow-hidden bg-card-light dark:bg-card-dark" >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {event.rules.map((rule, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {event.equipment?.length > 0 && (
                    <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Equipment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {event.equipment.map((item, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{item.item}</span>
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

            <TabsContent value="participants">
              <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.participants.length > 0 ? (
                      event.participants.map((participant) => (
                          <div key={participant.user._id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Avatar>
                          <AvatarImage src={participant.user.avatar?.url || "/placeholder.svg"} />
                          <AvatarFallback>{participant.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{participant.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {format(new Date(participant.joinedAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                        {participant.user._id === event.createdBy._id && <Badge>Organizer</Badge>}
                      </div>
                      ))
                    ) : (
                      <div className="text-center col-span-2 text-muted-foreground py-8">
                        <Users className="w-12 h-12 mx-auto mb-4" />
                        <p>No participants yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                {isAuthenticated && isParticipant() && event.status === "Upcoming" && (
                  <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                    <CardHeader>
                      <CardTitle>Leave a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitRating} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Review</label>
                          <Textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience..."
                            rows={3}
                          />
                        </div>
                        <Button type="submit" disabled={rating === 0}>
                          Submit Review
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {event.ratings && event.ratings.length > 0 ? (
                  <div className="space-y-4">
                    {event.ratings.map((rating, index) => (
                      <Card key={index} className="overflow-hidden bg-card-light dark:bg-card-dark">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={rating.user.avatar.url || "/placeholder.svg"} />
                              <AvatarFallback>{rating.user.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">{rating.user.name}</p>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= rating.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {rating.review && <p className="text-muted-foreground">{rating.review}</p>}
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(rating.date), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                    <CardContent className="text-center py-8">
                      <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No reviews yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {isAuthenticated && isParticipant() && (
              <TabsContent value="chat">
                <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                  <CardHeader>
                    <CardTitle>Event Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 mb-4 p-4 border rounded">
                      {event.chat && event.chat.length > 0 ? (
                        <div className="space-y-3">
                          {event.chat.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.user._id === user?.id ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.user._id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">{msg.user.name}</span>
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
                        <div className="text-center text-muted-foreground">No messages yet</div>
                      )}
                    </ScrollArea>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!message.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizer Card */}
          <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={`/profile/${event.createdBy._id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar>
                  <AvatarImage src={event.createdBy.avatar?.url || "/placeholder.svg"} />
                  <AvatarFallback>{event.createdBy.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">Event Organizer</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Participants</span>
                <span className="font-medium">
                  {event.participants.length}/{event.maxParticipants}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Event Type</span>
                <span className="font-medium capitalize">{event.eventType}</span>
              </div>
              {event.ratings && event.ratings.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {(event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">({event.ratings.length})</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Map Placeholder */}
          <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="aspect-square bg-muted-light dark:bg-muted-dark rounded-lg flex items-center justify-center mb-3">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div> */}
              <div className="text-sm">
                <p className="font-medium">{event.location.address}</p>
                <p className="text-muted-foreground">
                  {event.location.city}, {event.location.state}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="bg-card-light dark:bg-card-dark md:max-w-md max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="bg-muted-light dark:bg-muted-dark border-muted-light dark:border-muted-dark " onClick={() => setShowConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent} disabled={loadingAction}>
                {loadingAction ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl bg-card-light dark:bg-card-dark mx-auto">
          <div className="relative m-3">
            <img
              src={event.images?.[activeImageIndex]?.url || "/event-placeholder.svg"}
              alt={event.name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            {event.images && event.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={() => setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventDetails
