"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useEvents } from "../context/EventContext"
import { useAuth } from "../context/AuthContext"
import { format } from "date-fns"
import { Calendar, MapPin, Users, Clock, Star, ChevronLeft, MessageSquare, Share2, Heart, Edit, Trash2, AlertTriangle, UserPlus, UserMinus, Award, Dumbbell, Tag, Clipboard, Send, ChevronRight, Loader2, Info, User, ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react'

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
  const [loadingAction, setLoadingAction] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(id)
        setEvent(eventData)

        // Check if event is in favorites (would be implemented with local storage or user data)
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setIsFavorite(favorites.includes(id))
      } catch (error) {
        console.error("Error fetching event details:", error)
      }
    }

    fetchEventDetails()
  }, [id])

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
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
      const updatedEvent = await joinEvent(id)
      setEvent(updatedEvent)
    } catch (error) {
      console.error("Error joining event:", error)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleLeaveEvent = async () => {
    setLoadingAction(true)
    try {
      const updatedEvent = await leaveEvent(id)
      setEvent(updatedEvent)
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
      const updatedEvent = await addRating(id, { rating, review })
      setEvent(updatedEvent)
      setRating(0)
      setReview("")
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
          alert("Link copied to clipboard!")
        } catch (err) {
          console.error("Failed to copy: ", err)
        }
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, "_blank")
        break
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`, "_blank")
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${eventTitle} - ${eventUrl}`)}`, "_blank")
        break
      default:
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

  const handleImageNavigation = (direction) => {
    if (!event?.images?.length) return

    if (direction === "next") {
      setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))
    } else {
      setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))
    }
  }

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading event details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Events
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
        {/* Event Header */}
        <div className="relative">
          <div className="h-64 md:h-96 overflow-hidden">
            {event.images && event.images.length > 0 ? (
              <img
                src={event.images[activeImageIndex].url || "/placeholder.svg?height=384&width=768"}
                alt={event.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                <span className="text-muted-foreground-light dark:text-muted-foreground-dark">No image</span>
              </div>
            )}

            {event.images && event.images.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNavigation("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                  aria-label="Previous image"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => handleImageNavigation("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                  aria-label="Next image"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>

          {event.images && event.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {event.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === activeImageIndex ? "bg-white" : "bg-white/50"}`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <Share2 size={20} />
              </button>
              {showShareOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                  <button
                    onClick={() => handleShare("copy")}
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                  >
                    <span className="mr-2 text-blue-600">f</span>
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                  >
                    <span className="mr-2 text-blue-400">𝕏</span>
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                  >
                    <span className="mr-2 text-green-500">W</span>
                    Share on WhatsApp
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleFavorite}
              className={`p-2 backdrop-blur-sm rounded-full text-white transition-colors ${isFavorite
                  ? "bg-red-500/80 hover:bg-red-500/90"
                  : "bg-white/20 hover:bg-white/30"
                }`}
            >
              <Heart size={20} className={isFavorite ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <span
                  className={`
                  px-3 py-1 rounded-full text-sm font-medium mr-3
                  ${event.status === "Upcoming" ? "bg-primary-light/90 dark:bg-primary-dark/90 text-white" : ""}
                  ${event.status === "Ongoing" ? "bg-accent-light/90 dark:bg-accent-dark/90 text-white" : ""}
                  ${event.status === "Completed" ? "bg-muted-light/90 dark:bg-muted-dark/90 text-foreground-light dark:text-foreground-dark" : ""}
                  ${event.status === "Cancelled" ? "bg-destructive-light/90 dark:bg-destructive-dark/90 text-white" : ""}
                `}
                >
                  {event.status}
                </span>
                <span
                  className={`
                  px-3 py-1 rounded-full text-sm
                  ${event.difficulty === "Beginner" ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark" : ""}
                  ${event.difficulty === "Intermediate" ? "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark" : ""}
                  ${event.difficulty === "Advanced" ? "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark" : ""}
                `}
                >
                  {event.difficulty}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{event.name}</h1>
              <div className="flex items-center mt-2 text-muted-foreground-light dark:text-muted-foreground-dark">
                <MapPin size={18} className="mr-1" />
                <span>{`${event.location.address}, ${event.location.city}${event.location.state ? `, ${event.location.state}` : ""}`}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {isAuthenticated && !isParticipant() && !isCreator() && event.status === "Upcoming" && (
                <button
                  onClick={handleJoinEvent}
                  disabled={loadingAction || event.participants.length >= event.maxParticipants}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md 
                    ${event.participants.length >= event.maxParticipants
                      ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                      : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                    }
                    transition-colors
                  `}
                >
                  {loadingAction ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Join Event</span>
                    </>
                  )}
                </button>
              )}

              {isAuthenticated && isParticipant() && event.status === "Upcoming" && (
                <button
                  onClick={handleLeaveEvent}
                  disabled={loadingAction}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
                >
                  {loadingAction ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                  ) : (
                    <>
                      <UserMinus size={18} />
                      <span>Leave Event</span>
                    </>
                  )}
                </button>
              )}

              {isAuthenticated && isCreator() && (
                <>
                  <Link
                    to={`/events/edit/${event._id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent-light dark:bg-accent-dark text-white hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 transition-colors"
                  >
                    <Edit size={18} />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                </>
              )}

              {isAuthenticated && isParticipant() && (
                <Link
                  to={`/chat/${event._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>Chat</span>
                </Link>
              )}
            </div>
          </div>

          {/* Event Tabs */}
          <div className="border-b border-border-light dark:border-border-dark mb-6">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "details"
                    ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                    : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "participants"
                    ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                    : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  }`}
              >
                Participants ({event.participants.length})
              </button>
              {event.teams && event.teams.length > 0 && (
                <button
                  onClick={() => setActiveTab("teams")}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "teams"
                      ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                      : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                    }`}
                >
                  Teams ({event.teams.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "reviews"
                    ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                    : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  }`}
              >
                Reviews ({event.ratings ? event.ratings.length : 0})
              </button>
              {isAuthenticated && isParticipant() && (
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "chat"
                      ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                      : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                    }`}
                >
                  Chat
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center">
                    <Calendar className="w-10 h-10 text-primary-light dark:text-primary-dark mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                        Date
                      </h3>
                      <p className="text-foreground-light dark:text-foreground-dark font-medium">
                        {format(new Date(event.date), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center">
                    <Clock className="w-10 h-10 text-primary-light dark:text-primary-dark mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                        Time
                      </h3>
                      <p className="text-foreground-light dark:text-foreground-dark font-medium">{event.time}</p>
                    </div>
                  </div>
                  <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center">
                    <Users className="w-10 h-10 text-primary-light dark:text-primary-dark mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                        Participants
                      </h3>
                      <p className="text-foreground-light dark:text-foreground-dark font-medium">
                        {event.participants.length}/{event.maxParticipants}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                    About this event
                  </h2>
                  <p className="text-foreground-light dark:text-foreground-dark whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                      Event Details
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Tag className="w-5 h-5 text-primary-light dark:text-primary-dark mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                            Category
                          </h3>
                          <p className="text-foreground-light dark:text-foreground-dark">{event.category}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Dumbbell className="w-5 h-5 text-primary-light dark:text-primary-dark mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                            Difficulty
                          </h3>
                          <p className="text-foreground-light dark:text-foreground-dark">{event.difficulty}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Award className="w-5 h-5 text-primary-light dark:text-primary-dark mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                            Event Type
                          </h3>
                          <p className="text-foreground-light dark:text-foreground-dark capitalize">
                            {event.eventType}
                          </p>
                        </div>
                      </div>
                      {event.registrationFee > 0 && (
                        <div className="flex items-start">
                          <div className="w-5 h-5 text-primary-light dark:text-primary-dark mr-2 mt-0.5 flex items-center justify-center font-bold">
                            $
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                              Registration Fee
                            </h3>
                            <p className="text-foreground-light dark:text-foreground-dark">
                              ${event.registrationFee.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {(event.rules?.length > 0 || event.equipment?.length > 0) && (
                    <div>
                      {event.rules?.length > 0 && (
                        <div className="mb-4">
                          <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                            Rules
                          </h2>
                          <ul className="list-disc list-inside space-y-1 text-foreground-light dark:text-foreground-dark">
                            {event.rules.map((rule, index) => (
                              <li key={index}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {event.equipment?.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                            Equipment
                          </h2>
                          <ul className="space-y-1">
                            {event.equipment.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-center text-foreground-light dark:text-foreground-dark"
                              >
                                <Clipboard className="w-4 h-4 mr-2" />
                                <span>{item.item}</span>
                                {item.required && (
                                  <span className="ml-2 text-xs bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark px-2 py-0.5 rounded">
                                    Required
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Map Section */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                    Location
                  </h2>
                  <div className="h-64 bg-muted-light dark:bg-muted-dark rounded-lg overflow-hidden">
                    {/* This would be replaced with an actual map component */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-2" />
                        <p className="text-foreground-light dark:text-foreground-dark font-medium">
                          {event.location.address}
                        </p>
                        <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                          {event.location.city}, {event.location.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Section */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                    Organizer
                  </h2>
                  <Link
                    to={`/profile/${event.createdBy._id}`}
                    className="flex items-center p-4 bg-background-light dark:bg-background-dark rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-4">
                      {event.createdBy.avatar ? (
                        <img
                          src={event.createdBy.avatar || "/placeholder.svg?height=48&width=48"}
                          alt={event.createdBy.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground-light dark:text-muted-foreground-dark" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground-light dark:text-foreground-dark">
                        {event.createdBy.name}
                      </h3>
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Event Organizer
                      </p>
                    </div>
                    <ChevronRight className="ml-auto text-muted-foreground-light dark:text-muted-foreground-dark" size={20} />
                  </Link>
                </div>
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === "participants" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {event.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                        {participant.user.avatar ? (
                          <img
                            src={participant.user.avatar || "/placeholder.svg?height=48&width=48"}
                            alt={participant.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                            {participant.user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground-light dark:text-foreground-dark">
                          {participant.user.name || "User"}
                        </h3>
                        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          Joined {format(new Date(participant.joinedAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {event.participants.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No participants yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === "teams" && (
              <div>
                {event.teams && event.teams.length > 0 ? (
                  <div className="space-y-6">
                    {event.teams.map((team, index) => (
                      <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                          {team.name}
                        </h3>
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mr-2">
                              Captain:
                            </span>
                            <span className="text-foreground-light dark:text-foreground-dark">
                              {team.captain?.name || "Not assigned"}
                            </span>
                          </div>
                          <div className="mx-3 text-muted-foreground-light dark:text-muted-foreground-dark">•</div>
                          <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                            {team.members?.length || 0} members
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {team.members?.map((member, memberIndex) => (
                            <div key={memberIndex} className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                {member.avatar ? (
                                  <img
                                    src={member.avatar || "/placeholder.svg?height=32&width=32"}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                                    <User
                                      size={12}
                                      className="text-muted-foreground-light dark:text-muted-foreground-dark"
                                    />
                                  </div>
                                )}
                              </div>
                              <span className="text-foreground-light dark:text-foreground-dark">
                                {member.name || "User"}
                                {team.captain?._id === member._id && (
                                  <span className="ml-1 text-xs bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark px-1.5 py-0.5 rounded">
                                    Captain
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                      No teams have been created yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {isAuthenticated && isParticipant() && event.status === "Completed" && (
                  <div className="mb-6 bg-background-light dark:bg-background-dark rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                      Leave a Review
                    </h3>
                    <form onSubmit={handleSubmitRating}>
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mr-2">
                            Rating:
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  size={24}
                                  className={`${star <= rating
                                      ? "text-accent-light dark:text-accent-dark fill-accent-light dark:fill-accent-dark"
                                      : "text-muted-foreground-light dark:text-muted-foreground-dark"
                                    }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your experience..."
                          className="w-full p-3 rounded-md border border-input-light dark:border-input-dark bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          rows={3}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={rating === 0}
                        className={`px-4 py-2 rounded-md ${rating === 0
                            ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                            : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                          }`}
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}

                {event.ratings && event.ratings.length > 0 ? (
                  <div className="space-y-4">
                    {event.ratings.map((rating, index) => (
                      <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            {rating.user.avatar ? (
                              <img
                                src={rating.user.avatar || "/placeholder.svg?height=40&width=40"}
                                alt={rating.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                                <User size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground-light dark:text-foreground-dark">
                              {rating.user.name || "User"}
                            </h3>
                            <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                              {format(new Date(rating.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="ml-auto flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${star <= rating.rating
                                    ? "text-accent-light dark:text-accent-dark fill-accent-light dark:fill-accent-dark"
                                    : "text-muted-foreground-light dark:text-muted-foreground-dark"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.review && (
                          <p className="text-foreground-light dark:text-foreground-dark mt-2">{rating.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No reviews yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div>
                <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 h-64 overflow-y-auto mb-4">
                  {event.chat && event.chat.length > 0 ? (
                    <div className="space-y-3">
                      {event.chat.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.user._id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.user._id === user?.id
                                ? "bg-primary-light dark:bg-primary-dark text-white"
                                : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                              }`}
                          >
                            <div className="flex items-center mb-1">
                              <span className="text-xs font-medium">{message.user.name || "User"}</span>
                              <span className="text-xs ml-2 opacity-70">
                                {format(new Date(message.timestamp), "h:mm a")}
                              </span>
                            </div>
                            <p>{message.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No messages yet</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`p-3 rounded-md ${!message.trim()
                        ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                        : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                      }`}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-destructive-light dark:text-destructive-dark mr-3" size={24} />
              <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Delete Event</h3>
            </div>
            <p className="text-foreground-light dark:text-foreground-dark mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={loadingAction}
                className="px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
              >
                {loadingAction ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && event.images && event.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <img
              src={event.images[activeImageIndex].url || "/placeholder.svg"}
              alt={event.name}
              className="max-w-full max-h-full object-contain"
            />

            {event.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNavigation("prev");
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ArrowLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNavigation("next");
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ArrowRight size={24} />
                </button>
              </>
            )}

            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {event.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full ${index === activeImageIndex ? "bg-white" : "bg-white/50"}`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetails
