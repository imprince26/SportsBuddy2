import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuth } from "@/hooks/useAuth"
import { useSocket } from "@/hooks/useSocket"
import { useEvents } from "@/hooks/useEvents"
import { useMetadata } from "@/hooks/useMetadata"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EventDetailsSkeleton from "@/components/events/EventDetailsSkeleton"
import EventDetailsError from "@/components/events/EventDetailsError"
import api from "@/utils/api"

import {
  EventHeroSection,
  EventOverviewTab,
  EventParticipantsTab,
  EventReviewsTab,
  EventSidebar,
  EventChatModal,
  DeleteConfirmModal,
  ShareModal,
  ImageGalleryModal
} from "@/components/events/details"

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { socket } = useSocket()
  const { deleteEvent, joinEvent, leaveEvent } = useEvents()
  const chatEndRef = useRef(null)

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Use metadata hook with event data
  useMetadata(event ? { event } : {})

  // Emoji click handler
  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

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

  // Scroll to chat on modal open
  useEffect(() => {
    if (showChatModal) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        })
      }, 300)
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
      const eventDate = new Date(event.date)
      const [hours, minutes] = event.time.split(':').map(Number)

      const eventDateTime = new Date(eventDate)
      eventDateTime.setHours(hours, minutes, 0, 0)

      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const nowIST = new Date(now.getTime() + istOffset)

      const eventDateTimeIST = new Date(eventDateTime.getTime() + istOffset)

      return nowIST > eventDateTimeIST
    } catch (error) {
      console.error('Error checking if event ended:', error)
      return false
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

  // Socket event handlers
  useEffect(() => {
    if (!socket || !id || !user?.id) return

    socket.emit('joinEventChat', { eventId: id, userId: user.id })

    const handleNewMessage = (newMessage) => {
      setEvent(prevEvent => {
        if (!prevEvent) return prevEvent

        const updatedChat = prevEvent.chat ? [...prevEvent.chat] : []

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

      if (newMessage.user._id !== user?.id) {
        toast.success(`${newMessage.user.name}: ${(newMessage.content || newMessage.message).substring(0, 30)}...`)
      }
    }

    socket.on('newEventMessage', handleNewMessage)

    return () => {
      socket.emit('leaveEventChat', { eventId: id, userId: user.id })
      socket.off('newEventMessage', handleNewMessage)
    }
  }, [socket, id, user?.id])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !socket) return

    setSendingMessage(true)

    try {
      const messageData = {
        _id: Date.now().toString(),
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

      setMessage("")

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        })
      }, 50)

      socket.emit('sendEventMessage', messageData)

      try {
        await api.post(`/events/${id}/messages`, {
          message: message.trim()
        })
      } catch (dbError) {
        console.error('Error saving to database:', dbError)
      }

    } catch (err) {
      toast.error("Failed to send message")
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
        <EventHeroSection
          event={event}
          isAuthenticated={isAuthenticated}
          isParticipant={isParticipant}
          isCreator={isCreator}
          loadingAction={loadingAction}
          isFavorite={isFavorite}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          setShowImageModal={setShowImageModal}
          setShowShareModal={setShowShareModal}
          handleJoinEvent={handleJoinEvent}
          handleShare={handleShare}
          handlePreviousPage={handlePreviousPage}
          toggleFavorite={toggleFavorite}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 delay-300">
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
                    <TabsContent value="overview">
                      <EventOverviewTab
                        event={event}
                        setShowLocationModal={setShowLocationModal}
                      />
                    </TabsContent>

                    <TabsContent value="participants">
                      <EventParticipantsTab event={event} />
                    </TabsContent>

                    <TabsContent value="reviews">
                      <EventReviewsTab
                        event={event}
                        isAuthenticated={isAuthenticated}
                        isParticipant={isParticipant}
                        hasRated={hasRated}
                        isEventEnded={isEventEnded}
                        rating={rating}
                        setRating={setRating}
                        review={review}
                        setReview={setReview}
                        submittingReview={submittingReview}
                        handleSubmitRating={handleSubmitRating}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <EventSidebar
              event={event}
              id={id}
              isAuthenticated={isAuthenticated}
              isParticipant={isParticipant}
              isCreator={isCreator}
              loadingAction={loadingAction}
              isFavorite={isFavorite}
              handleLeaveEvent={handleLeaveEvent}
              toggleFavorite={toggleFavorite}
              setShowShareModal={setShowShareModal}
              setShowReportModal={setShowReportModal}
              setShowConfirmDelete={setShowConfirmDelete}
              navigate={navigate}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventChatModal
        event={event}
        user={user}
        showChatModal={showChatModal}
        setShowChatModal={setShowChatModal}
        message={message}
        setMessage={setMessage}
        sendingMessage={sendingMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleSendMessage={handleSendMessage}
        onEmojiClick={onEmojiClick}
        chatEndRef={chatEndRef}
      />

      <DeleteConfirmModal
        showConfirmDelete={showConfirmDelete}
        setShowConfirmDelete={setShowConfirmDelete}
        loadingAction={loadingAction}
        handleDeleteEvent={handleDeleteEvent}
      />

      <ShareModal
        event={event}
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        handleShare={handleShare}
      />

      <ImageGalleryModal
        event={event}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
      />
    </div>
  )
}

export default EventDetails
