
import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from "@/hooks/useSocket"
import { format } from "date-fns"
import { ChevronLeft, Send, User, ImageIcon, Smile, Paperclip, Loader2, AlertTriangle, Users, Info } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

const EventChat = () => {
  const { eventId } = useParams()
  const { getEventById, sendMessage } = useEvents()
  const { user } = useAuth()
  const { socket, joinEventRoom, leaveEventRoom } = useSocket()
  const [event, setEvent] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showEventInfo, setShowEventInfo] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true)
        const eventData = await getEventById(eventId)
        setEvent(eventData)
        setMessages(eventData.chat || [])
      } catch (error) {
        console.error("Error fetching event details:", error)
        setError("Failed to load event chat. The event may not exist or you don't have permission to view it.")
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId])

  useEffect(() => {
    if (event) {
      joinEventRoom(eventId)
    }

    return () => {
      if (event) {
        leaveEventRoom(eventId)
      }
    }
  }, [event, joinEventRoom, leaveEventRoom])

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        setMessages((prev) => [...prev, message])
      }

      socket.on("newMessage", handleNewMessage)

      return () => {
        socket.off("newMessage", handleNewMessage)
      }
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      await sendMessage(eventId, message)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Chat Not Available</h2>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">{error}</p>
          <Link
            to="/events"
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Event
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-white mr-3">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">{event.name}</h2>
              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                {event.participants.length} participants
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              aria-label="Show participants"
            >
              <Users size={20} className="text-foreground-light dark:text-foreground-dark" />
            </button>
            <button
              onClick={() => setShowEventInfo(!showEventInfo)}
              className="p-2 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              aria-label="Show event info"
            >
              <Info size={20} className="text-foreground-light dark:text-foreground-dark" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-16rem)]">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center mb-4">
                    <Send size={24} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    No messages yet
                  </h3>
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md">
                    Be the first to send a message in this event chat!
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser = msg.user._id === user?.id
                  return (
                    <div
                      key={index}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          isCurrentUser
                            ? "bg-primary-light dark:bg-primary-dark text-white"
                            : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <div className="flex items-center">
                            {!isCurrentUser && (
                              <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                {msg.user.avatar ? (
                                  <img
                                    src={msg.user.avatar || "/placeholder.svg"}
                                    alt={msg.user.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                                    <User size={12} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                                  </div>
                                )}
                              </div>
                            )}
                            <span className="text-xs font-medium">{msg.user.name || "User"}</span>
                          </div>
                          <span className="text-xs ml-2 opacity-70">
                            {format(new Date(msg.timestamp), "h:mm a")}
                          </span>
                        </div>
                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border-light dark:border-border-dark p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="p-2 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <Paperclip size={20} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <ImageIcon size={20} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <Smile size={20} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                </button>
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
                  className={`p-3 rounded-md ${
                    !message.trim()
                      ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                      : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                  }`}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Participants */}
          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l border-border-light dark:border-border-dark overflow-hidden"
              >
                <div className="p-4 border-b border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                    Participants ({event.participants.length})
                  </h3>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-16rem-8rem)]">
                  <div className="space-y-4">
                    {event.participants.map((participant) => (
                      <Link
                        to={`/profile/${participant.user._id}`}
                        key={participant.user._id}
                        className="flex items-center p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          {participant.user.avatar ? (
                            <img
                              src={participant.user.avatar || "/placeholder.svg"}
                              alt={participant.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                              <User size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground-light dark:text-foreground-dark">
                            {participant.user.name}
                            {participant.user._id === event.createdBy._id && (
                              <span className="ml-2 text-xs bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark px-1.5 py-0.5 rounded">
                                Organizer
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                            Joined {format(new Date(participant.joinedAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar - Event Info */}
          <AnimatePresence>
            {showEventInfo && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l border-border-light dark:border-border-dark overflow-hidden"
              >
                <div className="p-4 border-b border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Event Info</h3>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-16rem-8rem)]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        Date & Time
                      </h4>
                      <p className="text-foreground-light dark:text-foreground-dark">
                        {format(new Date(event.date), "MMMM dd, yyyy")} at {event.time}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        Location
                      </h4>
                      <p className="text-foreground-light dark:text-foreground-dark">
                        {event.location.address}, {event.location.city}
                        {event.location.state && `, ${event.location.state}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        Category
                      </h4>
                      <p className="text-foreground-light dark:text-foreground-dark">{event.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        Difficulty
                      </h4>
                      <p className="text-foreground-light dark:text-foreground-dark">{event.difficulty}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        Organizer
                      </h4>
                      <Link
                        to={`/profile/${event.createdBy._id}`}
                        className="flex items-center hover:underline text-foreground-light dark:text-foreground-dark"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                          {event.createdBy.avatar ? (
                            <img
                              src={event.createdBy.avatar || "/placeholder.svg"}
                              alt={event.createdBy.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                              <User size={12} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                            </div>
                          )}
                        </div>
                        {event.createdBy.name}
                      </Link>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        Description
                      </h4>
                      <p className="text-foreground-light dark:text-foreground-dark text-sm whitespace-pre-line">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default EventChat
