"use client"

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
  DollarSign,
  Shield,
  Target,
  TrendingUp,
  Zap,
  Flag,
  MoreVertical,
  Copy,
  CheckCircle,
  Info,
  X,
  Eye,
  Navigation,
  Sparkles,
  Trophy,
  MessageCircle,
  Smile,
  Paperclip,
  ImageIcon,
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
import { Separator } from "@/components/ui/separator"
import EventDetailsSkeleton from "@/components/events/EventDetailsSkeleton"
import EventDetailsError from "@/components/events/EventDetailsError"
import { showToast } from "@/components/CustomToast"
import { cn } from "@/lib/utils"
import api from "@/utils/api"

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
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
  const [teamName, setTeamName] = useState("")

  // Modal states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  // Action states
  const [loadingAction, setLoadingAction] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChatModal && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [event?.chat, showChatModal])

  // Helper functions
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
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "Ongoing":
        return "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      case "Completed":
        return "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
      case "Cancelled":
        return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
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
      Football: "⚽",
      Basketball: "🏀",
      Tennis: "🎾",
      Running: "🏃",
      Cycling: "🚴",
      Swimming: "🏊",
      Volleyball: "🏐",
      Cricket: "🏏",
      default: "🏆",
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
      showToast.success("Successfully joined the event! 🎉")
      window.location.reload()
    } catch (err) {
      console.error("Error joining event:", err)
      showToast.error("Failed to join event")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleLeaveEvent = async () => {
    setLoadingAction(true)
    try {
      await leaveEvent(id)
      showToast.success("You have left the event")
      window.location.reload()
    } catch (err) {
      console.error("Error leaving event:", err)
      showToast.error("Failed to leave event")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteEvent = async () => {
    setLoadingAction(true)
    try {
      await deleteEvent(id)
      showToast.success("Event deleted successfully")
      navigate("/events")
    } catch (err) {
      console.error("Error deleting event:", err)
      showToast.error("Failed to delete event")
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
        showToast.success("Review submitted successfully! ⭐")
      }
    } catch (err) {
      console.error("Error submitting rating:", err)
      showToast.error("Failed to submit review")
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setSendingMessage(true)
    try {
      await api.post(`/events/${id}/messages`, { message })
      setMessage("")
      // Refresh event to get updated chat
      const response = await api.get(`/events/${id}`)
      if (response.data.success) {
        setEvent(response.data.data)
      }
      showToast.success("Message sent! 💬")
    } catch (err) {
      console.error("Error sending message:", err)
      showToast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter((eventId) => eventId !== id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      showToast.success("Removed from favorites")
    } else {
      favorites.push(id)
      localStorage.setItem("favorites", JSON.stringify(favorites))
      showToast.success("Added to favorites ❤️")
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
          showToast.success("Link copied to clipboard! 📋")
        } catch (err) {
          console.error("Failed to copy:", err)
          showToast.error("Failed to copy link")
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
    // This would be implemented with file upload functionality
    console.log("File selected:", e.target.files)
    // Reset the input
    e.target.value = null
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/10 dark:bg-blue-400/5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section with Immersive Design */}
        <div className="relative overflow-hidden">
          {/* Background with 3D Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-blue-800/90" />

            {/* 3D Floating Orbs */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${20 + (i % 3) * 10}px`,
                    height: `${20 + (i % 3) * 10}px`,
                    background: `linear-gradient(135deg, ${
                      ["rgba(59, 130, 246, 0.2)", "rgba(139, 92, 246, 0.2)", "rgba(34, 197, 94, 0.2)"][i % 3]
                    }, transparent)`,
                    backdropFilter: "blur(10px)",
                    left: `${10 + ((i * 12) % 80)}%`,
                    top: `${20 + ((i * 8) % 60)}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                    rotateX: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 5 + (i % 3),
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative container mx-auto px-4 py-8 sm:py-12 lg:py-16">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Button
                onClick={handlePreviousPage}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Events
              </Button>
            </motion.div>

            {/* Hero Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* Left Content */}
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Category Badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block"
                >
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center gap-2 sm:gap-3">
                      <span className="text-2xl">{getCategoryIcon(event.category)}</span>
                      <span className="text-white font-medium text-sm sm:text-base">{event.category}</span>
                      <Badge className={cn("border font-medium text-xs", getStatusColor(event.status))}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {event.name}
                  </h1>

                  <div className="flex items-center gap-3 text-white/90 mb-6">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-lg">
                      {event.location.address}, {event.location.city}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Participants",
                      value: `${event.participantCount}/${event.maxParticipants}`,
                      icon: Users,
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      label: "Date",
                      value: format(new Date(event.date), "MMM dd"),
                      icon: Calendar,
                      color: "from-green-500 to-green-600",
                    },
                    {
                      label: "Time",
                      value: event.time,
                      icon: Clock,
                      color: "from-purple-500 to-purple-600",
                    },
                    {
                      label: event.registrationFee > 0 ? "Fee" : "Rating",
                      value:
                        event.registrationFee > 0
                          ? `$${event.registrationFee}`
                          : event.averageRating > 0
                            ? event.averageRating.toFixed(1)
                            : "N/A",
                      icon: event.registrationFee > 0 ? DollarSign : Star,
                      color: "from-yellow-500 to-yellow-600",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl blur-lg group-hover:blur-md transition-all duration-300" />
                      <div className="relative p-3 sm:p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                        >
                          <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-white/80">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                  {isAuthenticated && !isParticipant() && !isCreator() && event.status === "Upcoming" && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleJoinEvent}
                        disabled={loadingAction || event.participantCount >= event.maxParticipants}
                        className="bg-white text-blue-600 hover:bg-white/90 font-bold px-6 py-3 rounded-2xl shadow-2xl"
                        size="lg"
                      >
                        {loadingAction ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-5 h-5 mr-2" />
                        )}
                        {event.participantCount >= event.maxParticipants ? "Event Full" : "Join Event"}
                      </Button>
                    </motion.div>
                  )}

                  {!isAuthenticated && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        asChild
                        className="bg-white text-blue-600 hover:bg-white/90 font-bold px-6 py-3 rounded-2xl shadow-2xl"
                      >
                        <Link to="/login">
                          <UserPlus className="w-5 h-5 mr-2" />
                          Login to Join
                        </Link>
                      </Button>
                    </motion.div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={() => setShowShareModal(true)}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share Event
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right Content - Hero Image */}
              <motion.div variants={slideVariants} className="relative">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/20 backdrop-blur-sm">
                    {event.images && event.images.length > 0 ? (
                      <img
                        src={
                          event.images[activeImageIndex].url ||
                          "/placeholder.svg?height=400&width=600&query=sports event"
                        }
                        alt={event.name}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
                        <Calendar className="w-24 h-24 text-white/60" />
                      </div>
                    )}

                    {/* Image Navigation */}
                    {event.images && event.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-80 hover:opacity-100 bg-black/20 backdrop-blur-sm border-0 text-white transition-all duration-300"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))
                          }
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-80 hover:opacity-100 bg-black/20 backdrop-blur-sm border-0 text-white transition-all duration-300"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))
                          }
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleFavorite}
                        className={cn(
                          "bg-black/20 backdrop-blur-sm border-0 text-white hover:bg-black/30",
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
                            className="bg-black/20 backdrop-blur-sm border-0 text-white hover:bg-black/30"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20"
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
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Tabs */}
              <motion.div variants={itemVariants}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-1 shadow-lg">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="participants"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Participants</span>
                      <span className="sm:hidden">({event.participantCount})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Reviews</span>
                      <span className="sm:hidden">({event.ratings?.length || 0})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                      onClick={() => {
                        if (isAuthenticated && isParticipant()) {
                          setShowChatModal(true)
                        } else if (!isAuthenticated) {
                          navigate("/login")
                        } else {
                          showToast.error("Only participants can access the chat")
                        }
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content */}
                  <div className="mt-6">
                    <TabsContent value="overview" className="space-y-6 mt-0">
                      {/* About Section */}
                      <motion.div variants={itemVariants}>
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Info className="w-5 h-5 text-white" />
                              </div>
                              About This Event
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                              {event.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Event Details Grid */}
                      <motion.div variants={itemVariants}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Event Info */}
                          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-white" />
                                </div>
                                Event Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Date</span>
                                </div>
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {format(new Date(event.date), "EEEE, MMMM dd, yyyy")}
                                </span>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Time</span>
                                </div>
                                <span className="text-gray-900 dark:text-white font-semibold">{event.time}</span>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Difficulty</span>
                                </div>
                                <Badge className={cn("border font-medium", getDifficultyColor(event.difficulty))}>
                                  {event.difficulty}
                                </Badge>
                              </div>

                              {event.registrationFee > 0 && (
                                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      Registration Fee
                                    </span>
                                  </div>
                                  <span className="text-gray-900 dark:text-white font-semibold text-lg">
                                    ${event.registrationFee}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Participation Progress */}
                          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                Participation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                  {event.participantCount}
                                  <span className="text-gray-500 dark:text-gray-400">/{event.maxParticipants}</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">Participants Joined</p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Event Capacity</span>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {Math.round((event.participantCount / event.maxParticipants) * 100)}% filled
                                  </span>
                                </div>
                                <Progress
                                  value={(event.participantCount / event.maxParticipants) * 100}
                                  className="h-3 bg-gray-200 dark:bg-gray-700"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {event.maxParticipants - event.participantCount}
                                  </div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400">Spots Left</div>
                                </div>
                                <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
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
                      </motion.div>

                      {/* Rules and Equipment */}
                      {(event.rules?.length > 0 || event.equipment?.length > 0) && (
                        <motion.div variants={itemVariants}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {event.rules?.length > 0 && (
                              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                      <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    Event Rules
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-3">
                                    {event.rules.map((ruleItem, index) => (
                                      <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-3 p-3 bg-red-50/30 dark:bg-red-900/10 rounded-lg"
                                      >
                                        <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
                                            {index + 1}
                                          </span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {typeof ruleItem === "object"
                                            ? ruleItem.rule || ruleItem.text || "Rule"
                                            : ruleItem}
                                        </span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}

                            {event.equipment?.length > 0 && (
                              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                                      <Target className="w-5 h-5 text-white" />
                                    </div>
                                    Required Equipment
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {event.equipment.map((equipmentItem, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-3 bg-orange-50/30 dark:bg-orange-900/10 rounded-lg"
                                      >
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                          <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                          {typeof equipmentItem === "object"
                                            ? equipmentItem.item || equipmentItem.name || "Equipment Item"
                                            : equipmentItem}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Location Map */}
                      <motion.div variants={itemVariants}>
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              Event Location
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {event.location.venue || "Event Venue"}
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-400">{event.location.address}</p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {event.location.city}, {event.location.state} {event.location.zipCode}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setShowLocationModal(true)}
                                className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
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
                                className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Get Directions
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </TabsContent>

                    {/* Participants Tab */}
                    <TabsContent value="participants" className="space-y-6 mt-0">
                      <motion.div variants={itemVariants}>
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
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
                                {/* Event Creator */}
                                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50">
                                  <div className="flex items-center gap-4">
                                    <div className="relative">
                                      <Avatar className="w-12 h-12 border-2 border-yellow-400">
                                        <AvatarImage src={event.createdBy.avatar || "/placeholder.svg"} />
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
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          {event.createdBy.name}
                                        </h4>
                                        <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                                          Event Creator
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Joined {formatDistanceToNow(new Date(event.createdAt))} ago
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Participants Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {event.participants.map((participant, index) => (
                                    <motion.div
                                      key={participant._id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                          <AvatarImage src={participant.user.avatar || "/placeholder.svg"} />
                                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            {participant.user.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                            {participant.user.name}
                                          </h4>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Joined {formatDistanceToNow(new Date(participant.joinedAt))} ago
                                          </p>
                                        </div>
                                        {participant.teamName && (
                                          <Badge variant="outline" className="text-xs">
                                            {participant.teamName}
                                          </Badge>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                  No Participants Yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Be the first to join this exciting event!
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-6 mt-0">
                      <motion.div variants={itemVariants}>
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                              </div>
                              Event Reviews
                              {event.averageRating > 0 && (
                                <div className="flex items-center gap-2 ml-auto">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "w-4 h-4",
                                          i < Math.floor(event.averageRating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300 dark:text-gray-600",
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {event.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    ({event.ratings?.length || 0} reviews)
                                  </span>
                                </div>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Add Review Form */}
                            {isAuthenticated && isParticipant() && !hasRated && event.status === "Completed" && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
                              >
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                  Share Your Experience
                                </h4>
                                <form onSubmit={handleSubmitRating} className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                                : "text-gray-300 dark:text-gray-600 hover:text-yellow-400",
                                            )}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Review (Optional)
                                    </label>
                                    <Textarea
                                      value={review}
                                      onChange={(e) => setReview(e.target.value)}
                                      placeholder="Share your thoughts about this event..."
                                      className="bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50"
                                      rows={3}
                                    />
                                  </div>
                                  <Button
                                    type="submit"
                                    disabled={rating === 0}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                  >
                                    <Star className="w-4 h-4 mr-2" />
                                    Submit Review
                                  </Button>
                                </form>
                              </motion.div>
                            )}

                            {/* Reviews List */}
                            {event.ratings && event.ratings.length > 0 ? (
                              <div className="space-y-4">
                                {event.ratings.map((rating, index) => (
                                  <motion.div
                                    key={rating._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"
                                  >
                                    <div className="flex items-start gap-4">
                                      <Avatar className="w-10 h-10">
                                        <AvatarImage src={rating.user.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                          {rating.user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-medium text-gray-900 dark:text-white">
                                            {rating.user.name}
                                          </h4>
                                          <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={cn(
                                                  "w-4 h-4",
                                                  i < rating.rating
                                                    ? "text-yellow-400 fill-current"
                                                    : "text-gray-300 dark:text-gray-600",
                                                )}
                                              />
                                            ))}
                                          </div>
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(rating.createdAt))} ago
                                          </span>
                                        </div>
                                        {rating.review && (
                                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {rating.review}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                  No Reviews Yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Be the first to review this event after it's completed.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Actions */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isAuthenticated && isParticipant() && !isCreator() && (
                      <Button
                        onClick={handleLeaveEvent}
                        disabled={loadingAction}
                        variant="outline"
                        className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
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
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        >
                          <Link to={`/events/${id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </Link>
                        </Button>
                        <Button
                          onClick={() => setShowConfirmDelete(true)}
                          disabled={loadingAction}
                          variant="outline"
                          className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Event
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={toggleFavorite}
                      variant="outline"
                      className={cn(
                        "w-full",
                        isFavorite
                          ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      )}
                    >
                      <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
                      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>

                    <Button
                      onClick={() => setShowShareModal(true)}
                      variant="outline"
                      className="w-full border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>

                    <Button
                      onClick={() => setShowReportModal(true)}
                      variant="outline"
                      className="w-full border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report Event
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Creator */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      Event Organizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-green-400">
                          <AvatarImage src={event.createdBy.avatar || "/placeholder.svg"} />
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
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{event.createdBy.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Event Organizer</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Stats */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      Event Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{event.views || 0}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Views</div>
                      </div>
                      <div className="text-center p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{event.likes || 0}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Likes</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {event.shares || 0}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Shares</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {event.ratings?.length || 0}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Reviews</div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200/50 dark:bg-gray-700/50" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDistanceToNow(new Date(event.createdAt))} ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDistanceToNow(new Date(event.updatedAt))} ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Related Events */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      Similar Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Placeholder for related events */}
                      <div className="text-center py-4">
                        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Similar events will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chat Modal Dialog */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-4xl h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Event Chat - {event.name}
              <Badge
                variant="secondary"
                className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 ml-auto"
              >
                Participants Only
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Chat with other event participants in real-time
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-full px-6 pb-6">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/30 dark:bg-gray-800/30 rounded-xl mb-4">
              <div className="space-y-4">
                {event.chat && event.chat.length > 0 ? (
                  event.chat.map((msg, index) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn("flex gap-3", msg.user._id === user?.id ? "flex-row-reverse" : "")}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">
                          {msg.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("max-w-xs lg:max-w-md", msg.user._id === user?.id ? "text-right" : "")}>
                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl",
                            msg.user._id === user?.id
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600",
                          )}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{msg.user.name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(msg.createdAt))} ago</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <button
                type="button"
                onClick={handleFileUpload}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50"
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendingMessage}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Modals */}
      {/* Confirm Delete Modal */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
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
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Share Event
            </DialogTitle>
            <DialogDescription>Share this amazing event with your friends and community.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              onClick={() => handleShare("copy")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <Copy className="w-6 h-6" />
              <span>Copy Link</span>
            </Button>
            <Button
              onClick={() => handleShare("facebook")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
              <span>Facebook</span>
            </Button>
            <Button
              onClick={() => handleShare("twitter")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
              <span>Twitter</span>
            </Button>
            <Button
              onClick={() => handleShare("whatsapp")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span>WhatsApp</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl bg-black/95 border-0 p-0">
          <div className="relative">
            {event.images && event.images[activeImageIndex] && (
              <img
                src={event.images[activeImageIndex].url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
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
