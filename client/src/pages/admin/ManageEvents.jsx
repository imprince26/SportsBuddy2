import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  Send,
  CalendarDays,
  Target,
  MoreVertical,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, format, isPast, isToday } from "date-fns"
import { Link } from "react-router-dom"
import api from "@/utils/api"
import { cn } from "@/lib/utils"

const ManageEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(12)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [eventStats, setEventStats] = useState({})
  const [actionEvent, setActionEvent] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    status: "",
    maxParticipants: "",
  })
  const [notificationForm, setNotificationForm] = useState({
    subject: "",
    message: "",
  })

  // Fetch events with filtering and pagination
  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      try {
        setRefreshing(forceRefresh)
        setLoading(!forceRefresh)
        const token = localStorage.getItem("token")
        const response = await api.get("/admin/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            sortBy,
            sortOrder,
          },
        })

        if (response.data) {
          // Handle both array and paginated response
          if (Array.isArray(response.data)) {
            setEvents(response.data)
            setTotalPages(Math.ceil(response.data.length / itemsPerPage))
          } else {
            setEvents(response.data.data || response.data.events || [])
            setTotalPages(response.data.totalPages || 1)
          }
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError(err.message)
        toast.error("Failed to load events")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder],
  )

  // Fetch event statistics
  const fetchEventStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await api.get("/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data?.events) {
        setEventStats(response.data.events)
      }
    } catch (err) {
      console.error("Failed to fetch event stats:", err)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchEvents()
    fetchEventStats()
  }, [fetchEvents, fetchEventStats])

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1)
      fetchEvents()
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Handle filter changes
  useEffect(() => {
    setCurrentPage(1)
    fetchEvents()
  }, [selectedCategory, selectedStatus, sortBy, sortOrder])

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

  // Handle event actions
  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowDetailsDialog(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setEditForm({
      name: event.name || "",
      description: event.description || "",
      category: event.category || "",
      status: event.status || "",
      maxParticipants: event.maxParticipants || "",
    })
    setShowEditDialog(true)
  }

  const handleDeleteEvent = (event) => {
    setSelectedEvent(event)
    setShowDeleteDialog(true)
  }

  const handleSendNotification = (event) => {
    setSelectedEvent(event)
    setNotificationForm({
      subject: `Update regarding: ${event.name}`,
      message: "",
    })
    setShowNotificationDialog(true)
  }

  // Submit edit event
  const submitEditEvent = async () => {
    if (!selectedEvent) return

    try {
      const token = localStorage.getItem("token")
      await api.put(`/admin/events/${selectedEvent._id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Event updated successfully!")
      setShowEditDialog(false)
      fetchEvents(true)
    } catch (err) {
      console.error("Failed to update event:", err)
      toast.error(err.response?.data?.message || "Failed to update event")
    }
  }

  // Submit delete event
  const submitDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      const token = localStorage.getItem("token")
      await api.delete(`/admin/events/${selectedEvent._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Event deleted successfully!")
      setShowDeleteDialog(false)
      fetchEvents(true)
    } catch (err) {
      console.error("Failed to delete event:", err)
      toast.error(err.response?.data?.message || "Failed to delete event")
    }
  }

  // Approve/Reject event
  const handleEventAction = async (action, eventId) => {
    try {
      const token = localStorage.getItem("token")
      const endpoint = action === "approve" ? "approve" : "reject"

      await api.put(
        `/admin/events/${eventId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      toast.success(`Event ${action}d successfully!`)
      setActionEvent(null)
      fetchEvents(true)
    } catch (err) {
      console.error(`Failed to ${action} event:`, err)
      toast.error(`Failed to ${action} event`)
    }
  }

  // Submit notification
  const submitNotification = async () => {
    if (!selectedEvent || !notificationForm.subject || !notificationForm.message) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const token = localStorage.getItem("token")
      // Send notification to all participants
      await api.post(`/admin/events/${selectedEvent._id}/notify`, notificationForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Notification sent successfully!")
      setShowNotificationDialog(false)
    } catch (err) {
      console.error("Failed to send notification:", err)
      toast.error(err.response?.data?.message || "Failed to send notification")
    }
  }

  // Export events
  const handleExportEvents = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("token")

      // Create CSV content
      const headers = ["Name", "Category", "Status", "Organizer", "Date", "Participants", "Location"]
      const csvContent = [
        headers.join(","),
        ...events.map((event) =>
          [
            `"${event.name || ""}"`,
            `"${event.category || ""}"`,
            `"${event.status || ""}"`,
            `"${event.createdBy?.name || ""}"`,
            `"${format(new Date(event.date), "yyyy-MM-dd HH:mm:ss")}"`,
            `"${event.participants?.length || 0}/${event.maxParticipants || "∞"}"`,
            `"${event.location?.city || ""}, ${event.location?.state || ""}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `sportsbuddy-events-${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success("Events exported successfully!")
    } catch (err) {
      console.error("Failed to export events:", err)
      toast.error("Failed to export events")
    } finally {
      setRefreshing(false)
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "default"
      case "ongoing":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Get status color
  const getStatusColor = (status, date) => {
    if (status?.toLowerCase() === "cancelled") return "text-red-600"
    if (status?.toLowerCase() === "completed") return "text-gray-600"
    if (status?.toLowerCase() === "pending") return "text-yellow-600"

    // Auto-determine status based on date if not set
    if (isPast(new Date(date))) return "text-gray-600"
    if (isToday(new Date(date))) return "text-green-600"
    return "text-blue-600"
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      football: "⚽",
      basketball: "🏀",
      tennis: "🎾",
      running: "🏃",
      cycling: "🚴",
      swimming: "🏊",
      volleyball: "🏐",
      cricket: "🏏",
      default: "🏆",
    }
    return icons[category?.toLowerCase()] || icons.default
  }

  // Filter and paginate events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchTerm ||
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Update total pages based on filtered results
  useEffect(() => {
    setTotalPages(Math.ceil(filteredEvents.length / itemsPerPage))
  }, [filteredEvents.length, itemsPerPage])

  // Loading skeleton
  const EventSkeleton = () => (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 w-16 sm:w-24 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Mobile Event Card Component
  const MobileEventCard = ({ event, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 overflow-hidden">
        {/* Event Image */}
        <div className="relative h-32 overflow-hidden">
          {event.images && event.images.length > 0 ? (
            <img
              src={event.images[0].url || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
              <div className="text-3xl">{getCategoryIcon(event.category)}</div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={getStatusBadgeVariant(event.status)} className="backdrop-blur-sm text-xs">
              {event.status || "Pending"}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-2 right-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 h-8 w-8 p-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Event Actions</SheetTitle>
                  <SheetDescription className="text-left">Choose an action for {event.name}</SheetDescription>
                </SheetHeader>
                <div className="grid gap-2 py-4">
                  <Button variant="ghost" className="justify-start" onClick={() => handleViewEvent(event)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleEditEvent(event)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                  {event.status === "Pending" && (
                    <Button
                      variant="ghost"
                      className="justify-start text-green-600"
                      onClick={() => handleEventAction("approve", event._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Event
                    </Button>
                  )}
                  <Button variant="ghost" className="justify-start" onClick={() => handleSendNotification(event)}>
                    <Send className="w-4 h-4 mr-2" />
                    Notify Participants
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="justify-start text-red-600"
                    onClick={() => handleDeleteEvent(event)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Event Title and Category */}
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1 mb-1">{event.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  by {event.createdBy?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span className="truncate">{format(new Date(event.date), "MMM dd, yyyy")}</span>
                <span className="text-xs">•</span>
                <span>{format(new Date(event.date), "HH:mm")}</span>
              </div>

              {event.location?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {event.location.city}, {event.location.state}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>
                  {event.participants?.length || 0}
                  {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                </span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </span>

              <Link to={`/events/${event._id}`} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                View →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Desktop Event Card Component
  const DesktopEventCard = ({ event, index }) => (
    <motion.div
      key={event._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 overflow-hidden">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          {event.images && event.images.length > 0 ? (
            <img
              src={event.images[0].url || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
              <div className="text-4xl">{getCategoryIcon(event.category)}</div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={getStatusBadgeVariant(event.status)} className="backdrop-blur-sm">
              {event.status || "Pending"}
            </Badge>
          </div>

          {/* Action Menu */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActionEvent(actionEvent === event._id ? null : event._id)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {actionEvent === event._id && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleViewEvent(event)
                      setActionEvent(null)
                    }}
                    className="w-full justify-start"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleEditEvent(event)
                      setActionEvent(null)
                    }}
                    className="w-full justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>

                  {event.status === "Pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleEventAction("approve", event._id)
                        setActionEvent(null)
                      }}
                      className="w-full justify-start text-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleSendNotification(event)
                      setActionEvent(null)
                    }}
                    className="w-full justify-start"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Notify Participants
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDeleteEvent(event)
                      setActionEvent(null)
                    }}
                    className="w-full justify-start text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Event Title and Category */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">{event.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  by {event.createdBy?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                <span className="text-xs">•</span>
                <span>{format(new Date(event.date), "HH:mm")}</span>
              </div>

              {event.location?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {event.location.city}, {event.location.state}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {event.participants?.length || 0}
                  {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                </span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </span>

              <Link to={`/events/${event._id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4"
      >
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Events</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => fetchEvents(true)} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Event Management</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Manage events, approvals, and activities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total events: {events.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={() => fetchEvents(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
              <span className="sm:hidden">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={handleExportEvents}
              disabled={refreshing}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[
          {
            title: "Total Events",
            value: eventStats.total?.toLocaleString() || events.length.toLocaleString(),
            change: `+${eventStats.thisMonth || 0}`,
            changeType: "positive",
            icon: Calendar,
            color: "indigo",
            description: "All events",
          },
          {
            title: "Active Events",
            value: eventStats.active?.toString() || "0",
            change: "+8%",
            changeType: "positive",
            icon: Activity,
            color: "green",
            description: "Currently active",
          },
          {
            title: "This Month",
            value: eventStats.thisMonth?.toString() || "0",
            change: "+15%",
            changeType: "positive",
            icon: TrendingUp,
            color: "blue",
            description: "Monthly events",
          },
          {
            title: "Completion Rate",
            value: eventStats.total ? `${Math.round((eventStats.past / eventStats.total) * 100)}%` : "0%",
            change: "94%",
            changeType: "neutral",
            icon: Target,
            color: "orange",
            description: "Success rate",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-500/5 dark:to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            stat.changeType === "positive"
                              ? "text-green-600"
                              : stat.changeType === "negative"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{stat.description}</p>
                    </div>

                    <div className="p-2 sm:p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border-indigo-200/50 dark:border-indigo-700/50">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Search & Filter</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events by name, description, or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                />
              </div>

              {/* Filters - Desktop always visible, Mobile collapsible */}
              <div
                className={cn(
                  "space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4",
                  showFilters ? "block" : "hidden lg:flex",
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Cycling">Cycling</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Options */}
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [field, order] = value.split("-")
                      setSortBy(field)
                      setSortOrder(order)
                    }}
                  >
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="date-asc">Event Date (Earliest)</SelectItem>
                      <SelectItem value="date-desc">Event Date (Latest)</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="participants-desc">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Events Grid */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg sm:text-xl">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  Events ({filteredEvents.length})
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage and moderate platform events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <EventSkeleton key={index} />
                ))}
              </div>
            ) : paginatedEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Events Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "Try adjusting your search criteria." : "No events available."}
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <AnimatePresence>
                    {paginatedEvents.map((event, index) => (
                      <div key={event._id}>
                        {/* Mobile View */}
                        <div className="block sm:hidden">
                          <MobileEventCard event={event} index={index} />
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block">
                          <DesktopEventCard event={event} index={index} />
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-white/50 dark:bg-gray-800/50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>

                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={
                                currentPage === page ? "bg-indigo-600 text-white" : "bg-white/50 dark:bg-gray-800/50"
                              }
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white/50 dark:bg-gray-800/50"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Event Image */}
                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <div className="w-full h-32 sm:h-48 rounded-lg overflow-hidden">
                    <img
                      src={selectedEvent.images[0].url || "/placeholder.svg"}
                      alt={selectedEvent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Event Name</Label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedEvent.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                    <Badge variant={getStatusBadgeVariant(selectedEvent.status)}>
                      {selectedEvent.status || "Pending"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Organizer</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedEvent.createdBy?.name}
                    </p>
                  </div>
                </div>

                {/* Date and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {format(new Date(selectedEvent.date), "PPP")} at {format(new Date(selectedEvent.date), "p")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedEvent.location?.city}, {selectedEvent.location?.state}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Participants</Label>
                  <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                    {selectedEvent.participants?.length || 0}
                    {selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants}`} participants
                  </p>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Link to={`/events/${selectedEvent?._id}`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">View Full Event</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-indigo-600" />
              Edit Event
            </DialogTitle>
            <DialogDescription>Update event information and settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Cycling">Cycling</SelectItem>
                    <SelectItem value="Swimming">Swimming</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={editForm.maxParticipants}
                  onChange={(e) => setEditForm({ ...editForm, maxParticipants: e.target.value })}
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="bg-white/50 dark:bg-gray-800/50 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={submitEditEvent} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{selectedEvent?.name}</strong>"? This action cannot be undone and
              will permanently remove the event and notify all participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitDeleteEvent} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Send Notification
            </DialogTitle>
            <DialogDescription>Send a notification to all participants of "{selectedEvent?.name}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={notificationForm.subject}
                onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                placeholder="Enter notification subject"
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                placeholder="Enter your message to participants"
                rows={4}
                className="bg-white/50 dark:bg-gray-800/50 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={submitNotification} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default ManageEvents
