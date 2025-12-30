import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
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
  Target,
  Flag,
  MoreVertical,
  Copy,
  CheckCircle,
  Eye,
  Navigation,
  Sparkles,
  Trophy,
  MessageCircle,
  Smile,
  Paperclip,
  ImageIcon,
  Activity,
  Bike,
  Waves
} from "lucide-react"
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaMoneyBillWave, FaTools } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth"
import { useSocket } from "@/hooks/useSocket"
import { useEvents } from "@/hooks/useEvents"
import { useMetadata } from "@/hooks/useMetadata"
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
import { Separator } from "@/components/ui/separator"
import EventDetailsSkeleton from "@/components/events/EventDetailsSkeleton"
import EventDetailsError from "@/components/events/EventDetailsError"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import toast from "react-hot-toast"
import EmojiPicker from 'emoji-picker-react';
import { isToday, isYesterday, format as formatDate, isSameDay } from 'date-fns';

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { socket } = useSocket()
  const { deleteEvent, joinEvent, leaveEvent } = useEvents()
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // State management
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Form states
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [message, setMessage] = useState("")

  // Modal states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  // Action states
  const [loadingAction, setLoadingAction] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Use metadata hook with event data
  useMetadata(event ? { event } : {})

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp);

      if (!currentGroup || !isSameDay(new Date(currentGroup.date), msgDate)) {
        currentGroup = {
          date: msgDate,
          messages: [msg]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(msg);
      }
    });

    return groups;
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return formatDate(date, 'MMM dd, yyyy');
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(`/events/${id}`)

        if (response.data.success) {
          setEvent(response.data.data)

          // Check if user has already rated
          if (user && response.data.data.ratings) {
            const userRating = response.data.data.ratings.find((r) => r.user._id === user.id)
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

  // useEffect(() => {
  //   if (showChatModal && chatEndRef.current) {
  //     // Use setTimeout to ensure DOM has rendered
  //     setTimeout(() => {
  //       chatEndRef.current?.scrollIntoView({ 
  //         behavior: "smooth",
  //         block: "end"
  //       })
  //     }, 100)
  //   }
  // }, [event?.chat, showChatModal])

  useEffect(() => {
    if (showChatModal) {
      // Scroll to bottom when modal opens
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        })
      }, 300) // Longer delay for modal animation
    }
  }, [showChatModal])

  // Helper functions
  const isParticipant = () => {
    if (!user || !event) return false
    return event?.participants.some((p) => p.user.id === user.id)
  }

  const isCreator = () => {
    if (!user || !event) return false
    return event.createdBy._id === user.id
  }

  // Check if event has ended based on date and time (IST timezone)
  const isEventEnded = () => {
    if (!event) return false
    
    try {
      // Parse event date and time
      const eventDate = new Date(event.date)
      const [hours, minutes] = event.time.split(':').map(Number)
      
      // Create event datetime
      const eventDateTime = new Date(eventDate)
      eventDateTime.setHours(hours, minutes, 0, 0)
      
      // Get current time in IST (UTC + 5:30)
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000 // 5 hours 30 minutes in milliseconds
      const nowIST = new Date(now.getTime() + istOffset)
      
      // Convert event time to IST for comparison
      const eventDateTimeIST = new Date(eventDateTime.getTime() + istOffset)
      
      // Event is ended if current IST time is after event time
      return nowIST > eventDateTimeIST
    } catch (error) {
      console.error('Error checking if event ended:', error)
      return false
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      case "Intermediate":
        return "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "Advanced":
        return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      Football: Trophy,
      Basketball: Trophy,
      Tennis: Trophy,
      Running: Activity,
      Cycling: Bike,
      Swimming: Waves,
      Volleyball: Trophy,
      Cricket: Trophy,
      default: Trophy,
    }
    return icons[category] || icons.default
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
      toast.success("Successfully joined the event! 🎉")
      window.location.reload()
    } catch (err) {
      console.error("Error joining event:", err)
      toast.error("Failed to join event")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleLeaveEvent = async () => {
    setLoadingAction(true)
    try {
      await leaveEvent(id)
      toast.success("You have left the event")
      window.location.reload()
    } catch (err) {
      console.error("Error leaving event:", err)
      toast.error("Failed to leave event")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteEvent = async () => {
    setLoadingAction(true)
    try {
      await deleteEvent(id)
      toast.success("Event deleted successfully")
      navigate("/events")
    } catch (err) {
      console.error("Error deleting event:", err)
      toast.error("Failed to delete event")
    } finally {
      setLoadingAction(false)
      setShowConfirmDelete(false)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setSubmittingReview(true)
    try {
      const response = await api.post(`/events/${id}/ratings`, { 
        rating, 
        review: review.trim() || undefined 
      })
      
      if (response.data.success) {
        setEvent(response.data.data)
        setRating(0)
        setReview("")
        setHasRated(true)
        toast.success("Review submitted successfully!")
      } else {
        toast.error(response.data.message || "Failed to submit review")
      }
    } catch (err) {
      console.error("Error submitting rating:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit review"
      toast.error(errorMessage)
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    if (!socket || !id || !user?.id) return

    // Join event chat room
    socket.emit('joinEventChat', { eventId: id, userId: user.id })

    // Listen for new messages
    const handleNewMessage = (newMessage) => {

      // Update the event state with the new message
      setEvent(prevEvent => {
        if (!prevEvent) return prevEvent

        const updatedChat = prevEvent.chat ? [...prevEvent.chat] : []

        // Check if message already exists to prevent duplicates
        if (!updatedChat.some(msg => msg._id === newMessage._id ||
          (msg.message === newMessage.content && msg.timestamp === newMessage.timestamp))) {
          updatedChat.push({
            _id: newMessage._id || Date.now().toString(),
            message: newMessage.content || newMessage.message,
            user: newMessage.user,
            timestamp: newMessage.timestamp
          })
        }

        return {
          ...prevEvent,
          chat: updatedChat
        }
      })

      // Show toast notification for messages from other users
      if (newMessage.user._id !== user?.id) {
        toast.success(`${newMessage.user.name}: ${(newMessage.content || newMessage.message).substring(0, 30)}...`)
      }
    }

    // Listen for user join/leave events
    // const handleUserJoined = (userData) => {
    //   toast.success(`${userData.name} joined the chat`)
    // }

    // const handleUserLeft = (userData) => {
    //   toast(`${userData.name} left the chat`)
    // }

    // Add event listeners
    socket.on('newEventMessage', handleNewMessage)
    // socket.on('userJoinedChat', handleUserJoined)
    // socket.on('userLeftChat', handleUserLeft)

    return () => {
      socket.emit('leaveEventChat', { eventId: id, userId: user.id })
      socket.off('newEventMessage', handleNewMessage)
      // socket.off('userJoinedChat', handleUserJoined)
      // socket.off('userLeftChat', handleUserLeft)
    }
  }, [socket, id, user?.id])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !socket) return

    setSendingMessage(true)

    try {
      const messageData = {
        _id: Date.now().toString(), // Temporary ID
        eventId: id,
        content: message.trim(),
        user: {
          _id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        },
        timestamp: new Date().toISOString()
      }

      // Add message to local state immediately for instant feedback
      setEvent(prevEvent => {
        if (!prevEvent) return prevEvent

        const updatedChat = prevEvent.chat ? [...prevEvent.chat] : []
        updatedChat.push({
          _id: messageData._id,
          message: messageData.content,
          user: messageData.user,
          timestamp: messageData.timestamp
        })

        return {
          ...prevEvent,
          chat: updatedChat
        }
      })

      // Clear input immediately
      setMessage("")

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        })
      }, 50)

      // Emit to socket for real-time delivery to others
      socket.emit('sendEventMessage', messageData)

      // Save to database in background
      try {
        await api.post(`/events/${id}/messages`, {
          message: message.trim()
        })
      } catch (dbError) {
        console.error('Error saving to database:', dbError)

      }

    } catch (err) {
      toast.error("Failed to send message")

      // Remove the message from local state if it failed
      setEvent(prevEvent => {
        if (!prevEvent) return prevEvent

        const updatedChat = prevEvent.chat ?
          prevEvent.chat.filter(msg => msg._id !== messageData._id) : []

        return {
          ...prevEvent,
          chat: updatedChat
        }
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter((eventId) => eventId !== id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      toast.success("Removed from favorites")
    } else {
      favorites.push(id)
      localStorage.setItem("favorites", JSON.stringify(favorites))
      toast.success("Added to favorites")
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
          toast.success("Link copied to clipboard! 📋")
        } catch (err) {
          console.error("Failed to copy:", err)
          toast.error("Failed to copy link")
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

    setShowShareModal(false)
  }

  const handlePreviousPage = () => {
    if (document.referrer) {
      navigate(-1)
    } else {
      navigate("/events")
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    // Reset the input
    e.target.value = null
  }

  // Loading skeleton
  if (loading) {
    return <EventDetailsSkeleton />
  }

  // Error state
  if (error) {
    return <EventDetailsError error={error} />
  }

  if (!event) return null

  return (

    <div className="min-h-screen bg-background relative">
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border bg-background/50 backdrop-blur-sm">

          <div className="relative container mx-auto px-4 py-8 sm:py-12 lg:py-16">
            {/* Breadcrumb */}
            <div
              className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <Button
                onClick={handlePreviousPage}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent border border-border rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Events
              </Button>
            </div>

            {/* Hero Content */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-in fade-in duration-700"
            >
              {/* Left Content */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {/* Category Badge */}
                <div
                  className="inline-block animate-in zoom-in-90 fade-in duration-600 delay-200"
                >
                  <div className="group relative">
                    <div className="relative px-4 sm:px-6 py-2 sm:py-3 bg-card rounded-full border border-border flex items-center gap-2 sm:gap-3 shadow-sm">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const IconComponent = getCategoryIcon(event.category);
                          return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
                        })()}
                      </div>
                      <span className="text-foreground font-medium text-sm sm:text-base">{event.category}</span>
                      {event.difficulty && (
                        <span className="text-white font-medium text-xs">
                          <span className={cn("px-2 py-1 rounded-full", getDifficultyColor(event.difficulty))}>
                            {event.difficulty}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                    {event.name}
                  </h1>

                  <div className="flex items-center gap-3 text-muted-foreground mb-6">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-lg">
                      {event.location.address}, {event.location.city}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  {[
                    {
                      label: "Participants",
                      value: `${event.participantCount}/${event.maxParticipants}`,
                      icon: Users,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-50 dark:bg-blue-900/20",
                    },
                    {
                      label: "Date",
                      value: format(new Date(event.date), "MMM dd"),
                      icon: Calendar,
                      color: "text-green-600 dark:text-green-400",
                      bg: "bg-green-50 dark:bg-green-900/20",
                    },
                    {
                      label: "Time",
                      value: event.time,
                      icon: Clock,
                      color: "text-purple-600 dark:text-purple-400",
                      bg: "bg-purple-50 dark:bg-purple-900/20",
                    },
                    {
                      label: event.registrationFee > 0 ? "Fee" : "Rating",
                      value:
                        event.registrationFee > 0
                          ? `₹${event.registrationFee}`
                          : event.averageRating > 0
                            ? event.averageRating.toFixed(1)
                            : "N/A",
                      icon: event.registrationFee > 0 ? FaMoneyBillWave : Star,
                      color: "text-green-600 dark:text-green-400",
                      bg: "bg-green-50 dark:bg-green-900/20",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="group relative"
                    >
                      <div className="relative p-3 sm:p-4 bg-card rounded-xl border border-border text-center hover:border-primary/50 transition-colors">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-xl ${stat.bg} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                        >
                          <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-foreground mb-1">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                  {/* Join button - only show for upcoming events, non-participants, non-creators */}
                  {isAuthenticated && !isParticipant() && !isCreator() && event.status === "Upcoming" && new Date(event.date) > new Date() && (
                    <div className="transition-transform hover:scale-105 active:scale-95">
                      <Button
                        onClick={handleJoinEvent}
                        disabled={loadingAction || event.participantCount >= event.maxParticipants}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-3 rounded-xl shadow-lg"
                        size="lg"
                      >
                        {loadingAction ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-5 h-5 mr-2" />
                        )}
                        {event.participantCount >= event.maxParticipants ? "Event Full" : "Join Event"}
                      </Button>
                    </div>
                  )}

                  {/* View Details button for participants */}
                  {isAuthenticated && isParticipant() && !isCreator() && (
                    <div className="transition-transform hover:scale-105 active:scale-95">
                      <Button
                        onClick={() => setActiveTab("participants")}
                        className="bg-green-600 text-white hover:bg-green-700 font-bold px-6 py-3 rounded-xl shadow-lg"
                        size="lg"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Joined - View Details
                      </Button>
                    </div>
                  )}

                  {!isAuthenticated && event.status === "Upcoming" && new Date(event.date) > new Date() && (
                    <div className="transition-transform hover:scale-105 active:scale-95">
                      <Button
                        asChild
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-3 rounded-xl shadow-lg"
                      >
                        <Link to="/login">
                          <UserPlus className="w-5 h-5 mr-2" />
                          Login to Join
                        </Link>
                      </Button>
                    </div>
                  )}

                  <div className="transition-transform hover:scale-105 active:scale-95">
                    <Button
                      variant="outline"
                      onClick={() => setShowShareModal(true)}
                      className="bg-card border-border text-foreground hover:bg-accent px-6 py-3 rounded-xl"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share Event
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative animate-in slide-in-from-right-8 fade-in duration-500 delay-200">

                <div className="relative group">
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-muted">
                    {event.images && event.images.length > 0 ? (
                      <img
                        src={
                          event.images[activeImageIndex].url ||
                          "/placeholder.svg"
                        }
                        alt={event.name}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-24 h-24 text-muted-foreground" />
                      </div>
                    )}

                    {/* Image Navigation */}
                    {event.images && event.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white transition-all duration-300 rounded-full"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))
                          }
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white transition-all duration-300 rounded-full"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))
                          }
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2  transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleFavorite}
                        className={cn(
                          "bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white rounded-full",
                          isFavorite && "text-red-400",
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white rounded-full"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-card border-border"
                        >
                          <DropdownMenuItem onClick={() => handleShare("copy")}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowImageModal(true)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Gallery
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
                              "w-2 h-2 rounded-full transition-all duration-300",
                              index === activeImageIndex ? "bg-white w-6" : "bg-white/50",
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 delay-300"
          >
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Tabs */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex md:grid md:grid-cols-4 w-full bg-muted border border-border rounded-xl p-1 gap-1 overflow-x-auto md:overflow-visible">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="participants"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0"
                    >
                      Participants
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0"
                    >
                      Reviews
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0"
                      onClick={() => {
                        if (isAuthenticated && isParticipant()) {
                          setShowChatModal(true)
                        } else if (!isAuthenticated) {
                          navigate("/login")
                        } else {
                          toast.error("Only participants can access the chat")
                        }
                      }}
                    >
                      Chat
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content */}
                  <div className="mt-6">
                    <TabsContent value="overview" className="space-y-6 mt-0">
                      {/* About Section */}
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="bg-card border-border shadow-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground">
                              {/* <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div> */}
                              About This Event
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-line text-muted-foreground leading-relaxed text-base sm:text-lg">
                              {event.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Event Details Grid */}
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Event Info */}
                          <Card className="bg-card border-border shadow-sm">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-foreground">
                                {/* <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div> */}
                                Event Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  <span className="font-medium text-muted-foreground">Date</span>
                                </div>
                                <span className="text-foreground  font-semibold">
                                  {format(new Date(event.date), "MMMM dd, yyyy")}
                                </span>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  <span className="font-medium text-muted-foreground">Time</span>
                                </div>
                                <span className="text-foreground font-semibold">{event.time}</span>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                  <span className="font-medium text-muted-foreground">Difficulty</span>
                                </div>
                                <Badge className={cn("border font-medium", getDifficultyColor(event.difficulty))}>
                                  {event.difficulty}
                                </Badge>
                              </div>

                              {event.registrationFee > 0 && (
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FaMoneyBillWave className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="font-medium text-muted-foreground">
                                      Registration Fee
                                    </span>
                                  </div>
                                  <span className="text-foreground font-semibold text-lg">
                                    ₹{event.registrationFee}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Participation Progress */}
                          <Card className="bg-card border-border shadow-sm">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-foreground">
                                {/* <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div> */}
                                Participation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-foreground mb-2">
                                  {event.participantCount}
                                  <span className="text-muted-foreground">/{event.maxParticipants}</span>
                                </div>
                                <p className="text-muted-foreground">Participants Joined</p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Event Capacity</span>
                                  <span className="font-medium text-foreground">
                                    {Math.round((event.participantCount / event.maxParticipants) * 100)}% filled
                                  </span>
                                </div>
                                <Progress
                                  value={(event.participantCount / event.maxParticipants) * 100}
                                  className="h-3 bg-muted"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {event.maxParticipants - event.participantCount}
                                  </div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400">Spots Left</div>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {Math.max(
                                      0,
                                      Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)),
                                    )}
                                  </div>
                                  <div className="text-xs text-green-600 dark:text-green-400">Days Left</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Rules and Equipment */}
                      {(event.rules?.length > 0 || event.equipment?.length > 0) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {event.rules?.length > 0 && (
                              <Card className="bg-card border-border shadow-sm">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-foreground">
                                    {/* <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                      <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div> */}
                                    Event Rules
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-3">
                                    {event.rules.map((ruleItem, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg animate-in fade-in slide-in-from-left-4 duration-500"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                      >
                                        <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
                                            {index + 1}
                                          </span>
                                        </div>
                                        <span className="text-muted-foreground leading-relaxed">
                                          {typeof ruleItem === "object"
                                            ? ruleItem.rule || ruleItem.text || "Rule"
                                            : ruleItem}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}

                            {event.equipment?.length > 0 && (
                              <Card className="bg-card border-border shadow-sm">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-foreground">
                                    {/* <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                      <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div> */}
                                    Required Equipment
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {event.equipment.map((equipmentItem, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg animate-in fade-in zoom-in-90 duration-500"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                      >
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                          <FaTools className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <span className="text-muted-foreground font-medium">
                                          {typeof equipmentItem === "object"
                                            ? equipmentItem.item || equipmentItem.name || "Equipment Item"
                                            : equipmentItem}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location Map */}
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">

                        <Card className="bg-card border-border shadow-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground">
                              {/* <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              </div> */}
                              Event Location
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1">
                                    {event.location.venue || "Event Venue"}
                                  </h4>
                                  <p className="text-muted-foreground">{event.location.address}</p>
                                  <p className="text-muted-foreground">
                                    {event.location.city}, {event.location.state} {event.location.zipCode}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setShowLocationModal(true)}
                                className="flex-1 bg-card border-border"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View on Map
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  const address = `${event.location.address}, ${event.location.city}, ${event.location.state}`
                                  window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, "_blank")
                                }}
                                className="flex-1 bg-card border-border"
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Get Directions
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Participants Tab */}
                    <TabsContent value="participants" className="space-y-6 mt-0">
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="bg-card border-border shadow-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-foreground">
                                {/* <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div> */}
                                Event Participants ({event.participantCount})
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              >
                                {event.maxParticipants - event.participantCount} spots left
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {event.participants.length > 0 ? (
                              <div className="space-y-4">
                                <Link to={`/profile/${event.createdBy._id}`} className="block mb-4">
                                  {/* Event Creator */}
                                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                                    <div className="flex items-center gap-4">
                                      <div className="relative">
                                        <Avatar className="w-12 h-12 border-2 border-yellow-400">
                                          <AvatarImage src={event.createdBy.avatar?.url} />
                                          <AvatarFallback className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                            {event.createdBy.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                          <Trophy className="w-3 h-3 text-white" />
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold text-foreground">
                                            {event.createdBy.name}
                                          </h4>
                                          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                                            Event Creator
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Joined {formatDistanceToNow(new Date(event.createdAt))} ago
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Link>

                                {/* Participants Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {event.participants.map((participant, index) => (
                                    <Link key={participant._id} to={`/profile/${participant.user._id}`}>
                                      <div
                                        key={participant._id}
                                        className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <Avatar className="w-10 h-10">
                                            <AvatarImage src={participant.user.avatar?.url} />
                                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                              {participant.user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-foreground truncate">
                                              {participant.user.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                              Joined {formatDistanceToNow(new Date(participant.joinedAt))} ago
                                            </p>
                                          </div>
                                          {participant.teamName && (
                                            <Badge variant="outline" className="text-xs">
                                              {participant.teamName}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  No Participants Yet
                                </h3>
                                <p className="text-muted-foreground">
                                  Be the first to join this exciting event!
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-6 mt-0">
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="bg-card border-border shadow-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground">
                              {/* <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              </div> */}
                              Event Reviews
                              {event.ratings && event.ratings.length > 0 && (() => {
                                const totalRating = event.ratings.reduce((sum, r) => sum + r.rating, 0)
                                const avgRating = totalRating / event.ratings.length
                                return (
                                  <div className="flex items-center gap-2 ml-auto">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={cn(
                                            "w-4 h-4",
                                            i < Math.floor(avgRating)
                                              ? "text-yellow-400 fill-current"
                                              : "text-muted-foreground",
                                          )}
                                        />
                                      ))}
                                    </div>
                                    <span className="font-semibold text-foreground">
                                      {avgRating.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      ({event.ratings.length} {event.ratings.length === 1 ? 'review' : 'reviews'})
                                    </span>
                                  </div>
                                )
                              })()}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Add Review Form */}
                            {isAuthenticated && isParticipant() && !hasRated && isEventEnded() && (
                              <div
                                className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              >
                                <h4 className="font-semibold text-foreground mb-4">
                                  Share Your Experience
                                </h4>
                                <form onSubmit={handleSubmitRating} className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                      Rating
                                    </label>
                                    <div className="flex gap-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setRating(star)}
                                          className="p-1 hover:scale-110 transition-transform"
                                        >
                                          <Star
                                            className={cn(
                                              "w-8 h-8 transition-colors",
                                              star <= rating
                                                ? "text-yellow-400 fill-current"
                                                : "text-muted-foreground hover:text-yellow-400",
                                            )}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                      Review (Optional)
                                    </label>
                                    <Textarea
                                      value={review}
                                      onChange={(e) => setReview(e.target.value)}
                                      placeholder="Share your thoughts about this event..."
                                      className="bg-card border-border"
                                      rows={3}
                                    />
                                  </div>
                                  <Button
                                    type="submit"
                                    disabled={rating === 0 || submittingReview}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                  >
                                    {submittingReview ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Star className="w-4 h-4 mr-2" />
                                        Submit Review
                                      </>
                                    )}
                                  </Button>
                                </form>
                              </div>
                            )}

                            {/* Reviews List */}
                            {event.ratings && event.ratings.length > 0 ? (
                              <div className="space-y-4">
                                {event.ratings.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).map((rating, index) => (
                                  <div
                                    key={rating._id}
                                    className="p-5 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border border-border/50 hover:border-border transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <div className="flex items-start gap-4">
                                      <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                        <AvatarImage src={rating.user.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-600 dark:text-blue-400 font-semibold">
                                          {rating.user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                          <div>
                                            <h4 className="font-semibold text-foreground">
                                              {rating.user.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={cn(
                                                      "w-4 h-4",
                                                      i < rating.rating
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-muted-foreground/30",
                                                    )}
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(rating.date || rating.createdAt))} ago
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {rating.review && (
                                          <p className="text-foreground/80 leading-relaxed mt-3 text-sm">
                                            {rating.review}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Star className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  No Reviews Yet
                                </h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                  {isEventEnded() ? "Be the first to share your experience!" : "Reviews will be available after the event ends."}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Actions */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">

                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      {/* <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div> */}
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isAuthenticated && isParticipant() && !isCreator() && (
                      <Button
                        onClick={handleLeaveEvent}
                        disabled={loadingAction}
                        variant="outline"
                        className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent rounded-[.4rem]"
                      >
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
                        <Button
                          asChild
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-[.4rem]"
                        >
                          <Link to={`/events/${id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </Link>
                        </Button>
                        <Button
                          onClick={() => setShowConfirmDelete(true)}
                          disabled={loadingAction}
                          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-[.4rem]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Event
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={toggleFavorite}
                      className={cn(
                        "w-full rounded-[.4rem]",
                        isFavorite
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-muted text-foreground hover:bg-accent",
                      )}
                    >
                      <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
                      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>

                    <Button
                      onClick={() => setShowShareModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-[.4rem]"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>

                    <Button
                      onClick={() => setShowReportModal(true)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-[.4rem]"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report Event
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Event Creator */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      {/* <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <FaUserTie className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div> */}
                      Event Organizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-green-400">
                          <AvatarImage src={event.createdBy.avatar?.url} />
                          <AvatarFallback className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-lg">
                            {event.createdBy.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-lg">{event.createdBy.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">Event Organizer</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent border-border">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" onClick={() => navigate(`/profile/${event.createdBy._id}`)} variant="outline" className="bg-transparent border-border">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Stats */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      {/* <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <IoStatsChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div> */}
                      Event Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{event.views || 0}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Views</div>
                      </div>
                      {/* <div className="text-center p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{event.likes || 0}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Likes</div>
                      </div> */}
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {event.shares || 0}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Shares</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {event.ratings?.length || 0}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Reviews</div>
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-foreground">
                          {formatDistanceToNow(new Date(event.createdAt))} ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium text-foreground">
                          {formatDistanceToNow(new Date(event.updatedAt))} ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Related Events */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      {/* <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div> */}
                      Similar Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Placeholder for related events */}
                      <div className="text-center py-4">
                        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Similar events will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal Dialog */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-5xl h-[90vh] bg-gray-50 dark:bg-card/10 backdrop-blur-3xl border-border p-0 overflow-auto scrollbar-hide">
          <DialogHeader className="px-4 md:mt-3 mt-6 sm:p-6 pb-0 border-b border-border">
            <DialogTitle className="flex items-center  gap-3 text-foreground">
              {/* <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div> */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">Event Chat</h3>
                <p className="text-sm text-muted-foreground truncate">{event.name}</p>
              </div>
              <Badge
                variant="secondary"
                className="px-2 py-1 md:flex hidden"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Participants Only
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Chat with other event participants in real-time • {event.participantCount} members
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-full overflow-hidden">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 px-8 sm:px-6">
              <div className="py-4 space-y-6">
                {event.chat && event.chat.length > 0 ? (
                  groupMessagesByDate(event.chat).map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      {/* Date Separator */}
                      <div className="flex items-center justify-center my-6">
                        <div className="px-2 py-1 bg-muted rounded-full">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getDateLabel(group.date)}
                          </span>
                        </div>
                      </div>

                      {/* Messages for this date */}
                      {group.messages.map((msg, msgIndex) => {
                        const isOwn = msg.user._id === user?.id;
                        const showAvatar = msgIndex === 0 || group.messages[msgIndex - 1].user._id !== msg.user._id;
                        const isLastInGroup = msgIndex === group.messages.length - 1 ||
                          group.messages[msgIndex + 1].user._id !== msg.user._id;

                        return (
                          <div
                            key={msg._id}
                            className={cn(
                              "flex gap-3 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
                              isOwn ? "flex-row-reverse" : "flex-row",
                              !showAvatar && "ml-11"
                            )}
                            style={{ animationDelay: `${msgIndex * 50}ms` }}
                          >
                            {/* Avatar */}
                            {!isOwn && showAvatar ? (
                              <Avatar className="w-8 h-8 ring-2 ring-border shadow-sm">
                                <AvatarImage src={msg.user?.avatar?.url || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                  {msg.user.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : !isOwn ? (
                              <div className="w-8 h-8" />
                            ) : null}

                            <div className={cn(
                              "flex flex-col max-w-[70%] sm:max-w-[80%]",
                              isOwn ? "items-end" : "items-start"
                            )}>
                              {/* Username (only show for first message in group) */}
                              {!isOwn && showAvatar && (
                                <div className="flex items-center gap-2 mb-1 px-1">
                                  <span className="text-xs font-semibold text-foreground">
                                    {msg.user.name}
                                  </span>
                                  {msg.user.role === 'admin' && (
                                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                      <span className="text-[8px] text-white font-bold">A</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Message Bubble */}
                              <div
                                className={cn(
                                  "relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md group",
                                  isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border",
                                  // Rounded corners based on position
                                  isOwn
                                    ? showAvatar ? "rounded-tr-md" : isLastInGroup ? "rounded-br-md" : "rounded-r-md"
                                    : showAvatar ? "rounded-tl-md" : isLastInGroup ? "rounded-bl-md" : "rounded-l-md"
                                )}
                              >
                                {/* Message Content */}
                                <div className={cn(
                                  "text-sm md:text-[1rem] leading-relaxed break-words",
                                  !isOwn && "text-card-foreground"
                                )}>
                                  {msg.message}
                                </div>

                                {/* Message Time - only show on last message in group */}
                                {isLastInGroup && (
                                  <div className={cn(
                                    "flex items-center gap-1 mt-1",
                                    isOwn ? "justify-end" : "justify-start"
                                  )}>
                                    <span className={cn(
                                      "text-xs opacity-70",
                                      isOwn ? "text-white/80" : "text-muted-foreground"
                                    )}>
                                      {formatDate(new Date(msg.timestamp), 'HH:mm')}
                                    </span>
                                    {isOwn && (
                                      <div className="flex gap-0.5">
                                        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                                        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      Be the first to send a message and break the ice with other participants!
                    </p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                className="absolute bottom-20 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                  width={350}
                  height={400}
                  previewConfig={{
                    showPreview: false
                  }}
                  skinTonesDisabled
                  searchDisabled={false}
                />
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 sm:p-6 border-t border-border bg-muted/50">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* Additional Actions */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    title="Upload file"
                  >
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    title="Send image"
                  >
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Message Input Container */}
                <div className="flex-1 relative">
                  <div className="flex items-end bg-card rounded-2xl border border-border shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-sm px-4 py-3 max-h-32 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />

                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 mr-2 rounded-full hover:bg-muted transition-colors"
                      title="Add emoji"
                    >
                      <Smile className={cn(
                        "w-5 h-5 transition-colors",
                        showEmojiPicker
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      )} />
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!message.trim() || sendingMessage}
                  size="icon"
                  className="h-12 w-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emoji Picker Overlay to close when clicking outside */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Other Modals */}
      {/* Confirm Delete Modal */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              Delete Event
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone and all participants will be
              notified.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDelete(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteEvent}
              disabled={loadingAction}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loadingAction ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md bg-card/30 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <span>Share Event</span>
            </DialogTitle>
            <DialogDescription>
              Share this amazing event with your friends and community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Event Preview Card */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex gap-3">
                {event.images && event.images[0] && (
                  <img
                    src={event.images[0].url}
                    alt={event.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1">{event.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleShare("copy")}
                variant="secondary"
                className="flex flex-col items-center gap-3 h-24 transition-all"
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <Copy className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Copy Link</span>
              </Button>
              <Button
                onClick={() => handleShare("whatsapp")}
                variant="secondary"
                className="flex flex-col items-center gap-3 h-24 transition-all"
              >
                <div className="p-2 rounded-full bg-green-500">
                  <FaWhatsapp className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">WhatsApp</span>
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                variant="secondary"
                className="flex flex-col items-center gap-3 h-24  transition-all"
              >
                <div className="p-2 rounded-full bg-blue-600">
                  <FaFacebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Facebook</span>
              </Button>
              <Button
                onClick={() => handleShare("twitter")}
                variant="secondary"
                className="flex flex-col items-center gap-3 h-24 transition-all"
              >
                <div className="p-2 rounded-full bg-black">
                  <FaXTwitter className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">X (Twitter)</span>
              </Button>
            </div>

            {/* URL Display */}
            <div className="p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs text-muted-foreground break-all font-mono">
                {window.location.href}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{event.analytics?.views || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{event.participants?.length || 0} joined</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl bg-black/95 border-0 p-2 ">
          <div className="relative">
            {event.images && event.images[activeImageIndex] && (
              <img
                src={event.images[activeImageIndex].url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            {event.images && event.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </>
            )}
            {event.images && event.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {event.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      index === activeImageIndex ? "bg-white" : "bg-white/50",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventDetails
