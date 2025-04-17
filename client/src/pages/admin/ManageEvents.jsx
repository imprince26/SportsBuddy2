"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useEvents } from "@/context/EventContext"
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Calendar, Loader2, AlertTriangle } from 'lucide-react'
import { format } from "date-fns"
import AdminLayout from "@/components/layout/AdminLayout"

const ManageEvents = () => {
  const { events, fetchEvents, approveEvent, deleteEvent, loading: eventsLoading } = useEvents()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [actionEvent, setActionEvent] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)

  useEffect(() => {
    fetchAllEvents()
  }, [currentPage, selectedCategory, selectedStatus])

  const fetchAllEvents = async () => {
    try {
      setLoading(true)
      await fetchEvents({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchTerm || undefined,
        page: currentPage,
      })
      
      // Mock pagination for demonstration
      setTotalPages(5)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to load events. Please try again later.")
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchAllEvents()
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleEventAction = async (action, eventId) => {
    try {
      if (action === "approve") {
        await approveEvent(eventId)
      } else if (action === "delete") {
        setEventToDelete(eventId)
        setShowDeleteConfirm(true)
        return
      }
      
      setActionEvent(null)
    } catch (error) {
      console.error(`Error performing ${action} action:`, error)
    }
  }

  const confirmDeleteEvent = async () => {
    try {
      await deleteEvent(eventToDelete)
      setShowDeleteConfirm(false)
      setEventToDelete(null)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const loading_state = loading || eventsLoading

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-4 md:mb-0">
            Manage Events
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                size={18}
              />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-4 mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="all">All Categories</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="all">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Pending">Pending Approval</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading_state ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
              <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Error</h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-2">No Events Found</h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
              No events match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted-light dark:bg-muted-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Organizer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {events.map((event) => (
                      <tr
                        key={event._id}
                        className="hover:bg-muted-light/50 dark:hover:bg-muted-dark/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                              {event.images && event.images.length > 0 ? (
                                <img
                                  src={event.images[0].url || "/placeholder.svg"}
                                  alt={event.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Calendar size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground-light dark:text-foreground-dark">
                                {event.name}
                              </div>
                              <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                {event.location?.city}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/profile/${event.createdBy?._id}`}
                            className="text-foreground-light dark:text-foreground-dark hover:underline"
                          >
                            {event.createdBy?.name || "Unknown"}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                          {event.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-light dark:text-foreground-dark">
                          {format(new Date(event.date), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              event.status === "Upcoming"
                                ? "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark"
                                : event.status === "Ongoing"
                                ? "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark"
                                : event.status === "Completed"
                                ? "bg-muted-light/50 dark:bg-muted-dark/50 text-foreground-light dark:text-foreground-dark"
                                : event.status === "Cancelled"
                                ? "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark"
                                : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                            }`}
                          >
                            {event.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-light dark:text-foreground-dark">
                          {event.participants?.length || 0}/{event.maxParticipants || "∞"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setActionEvent(actionEvent === event._id ? null : event._id)}
                              className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                            >
                              <MoreHorizontal size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                            </button>
                            {actionEvent === event._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                                <Link
                                  to={`/events/${event._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                                >
                                  <Eye size={16} className="mr-2" />
                                  View Event
                                </Link>
                                <Link
                                  to={`/events/edit/${event._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                                >
                                  <Edit size={16} className="mr-2" />
                                  Edit Event
                                </Link>
                                {event.status === "Pending" && (
                                  <button
                                    onClick={() => handleEventAction("approve", event._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                  >
                                    <CheckCircle size={16} className="mr-2 text-success-light dark:text-success-dark" />
                                    Approve Event
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEventAction("delete", event._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-destructive-light dark:text-destructive-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete Event
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * 10, events.length)}</span> of{" "}
                <span className="font-medium">{events.length}</span> events
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                      : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === page
                        ? "bg-primary-light dark:bg-primary-dark text-white"
                        : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                      : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setEventToDelete(null)
                }}
                className="px-4 py-2 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEvent}
                disabled={loading_state}
                className="px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
              >
                {loading_state ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default ManageEvents
