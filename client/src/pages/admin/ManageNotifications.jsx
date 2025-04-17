"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Send, Trash2, Bell, Users, User, Calendar, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { format } from "date-fns"
import AdminLayout from "@/components/layout/AdminLayout"

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedType, setSelectedType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [actionNotification, setActionNotification] = useState(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system",
    recipients: "all",
  })

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, selectedType])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // This would be an API call in a real application
      // const response = await api.get('/admin/notifications', {
      //   params: {
      //     page: currentPage,
      //     type: selectedType !== 'all' ? selectedType : undefined,
      //     search: searchTerm || undefined,
      //   }
      // });
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockNotifications = Array.from({ length: 20 }, (_, i) => ({
          _id: `notification_${i + 1}`,
          title: `Notification ${i + 1}`,
          message: `This is a sample notification message ${i + 1}. It could be about an event, system update, or other important information.`,
          type: ["system", "event", "chat", "team"][i % 4],
          recipients: i % 3 === 0 ? "all" : "specific",
          recipientCount: i % 3 === 0 ? "All Users" : Math.floor(Math.random() * 100) + 1,
          sentAt: new Date(Date.now() - Math.random() * 10000000000),
          status: i % 5 === 0 ? "scheduled" : "sent",
        }))
        
        setNotifications(mockNotifications)
        setTotalPages(5)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError("Failed to load notifications. Please try again later.")
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchNotifications()
  }

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleNotificationAction = (action, notificationId) => {
    // This would be an API call in a real application
    console.log(`${action} notification with ID: ${notificationId}`)
    
    if (action === "delete") {
      setNotifications(notifications.filter(n => n._id !== notificationId))
    }
    
    setActionNotification(null)
  }

  const handleSendNotification = (e) => {
    e.preventDefault()
    // This would be an API call in a real application
    console.log("Sending notification:", newNotification)
    
    // Add the new notification to the list for demonstration
    const newNotificationObj = {
      _id: `notification_${Date.now()}`,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      recipients: newNotification.recipients,
      recipientCount: newNotification.recipients === "all" ? "All Users" : "Selected Users",
      sentAt: new Date(),
      status: "sent",
    }
    
    setNotifications([newNotificationObj, ...notifications])
    setShowSendModal(false)
    setNewNotification({
      title: "",
      message: "",
      type: "system",
      recipients: "all",
    })
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-4 md:mb-0">
            Manage Notifications
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                size={18}
              />
              <input
                type="text"
                placeholder="Search notifications..."
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
            <button
              onClick={() => setShowSendModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              <Send size={18} />
              <span>Send Notification</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-4 mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="all">All Types</option>
                  <option value="system">System</option>
                  <option value="event">Event</option>
                  <option value="chat">Chat</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
              <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading notifications...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Error</h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted-light dark:bg-muted-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Sent At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {notifications.map((notification) => (
                      <tr
                        key={notification._id}
                        className="hover:bg-muted-light/50 dark:hover:bg-muted-dark/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                              {notification.type === "system" && (
                                <Bell size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                              )}
                              {notification.type === "event" && (
                                <Calendar size={16} className="text-primary-light dark:text-primary-dark" />
                              )}
                              {notification.type === "chat" && (
                                <Send size={16} className="text-accent-light dark:text-accent-dark" />
                              )}
                              {notification.type === "team" && (
                                <Users size={16} className="text-success-light dark:text-success-dark" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground-light dark:text-foreground-dark">
                                {notification.title}
                              </div>
                              <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark truncate max-w-xs">
                                {notification.message}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              notification.type === "system"
                                ? "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                                : notification.type === "event"
                                ? "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark"
                                : notification.type === "chat"
                                ? "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark"
                                : "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark"
                            }`}
                          >
                            {notification.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                          {notification.recipientCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-light dark:text-foreground-dark">
                          {format(new Date(notification.sentAt), "MMM dd, yyyy h:mm a")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              notification.status === "sent"
                                ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark"
                                : "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark"
                            }`}
                          >
                            {notification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setActionNotification(actionNotification === notification._id ? null : notification._id)}
                              className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                            >
                              <MoreHorizontal size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                            </button>
                            {actionNotification === notification._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                                <button
                                  onClick={() => handleNotificationAction("resend", notification._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                >
                                  <Send size={16} className="mr-2" />
                                  Resend
                                </button>
                                <button
                                  onClick={() => handleNotificationAction("delete", notification._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-destructive-light dark:text-destructive-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete
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
                <span className="font-medium">{Math.min(currentPage * 10, notifications.length)}</span> of{" "}
                <span className="font-medium">{notifications.length}</span> notifications
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

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Send New Notification
            </h3>
            <form onSubmit={handleSendNotification}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                    Message
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    placeholder="Notification message"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                    Type
                  </label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  >
                    <option value="system">System</option>
                    <option value="event">Event</option>
                    <option value="chat">Chat</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                    Recipients
                  </label>
                  <select
                    value={newNotification.recipients}
                    onChange={(e) => setNewNotification({ ...newNotification, recipients: e.target.value })}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  >
                    <option value="all">All Users</option>
                    <option value="specific">Specific Users</option>
                  </select>
                </div>
                {newNotification.recipients === "specific" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Select Users
                    </label>
                    <div className="p-2 border border-input-light dark:border-input-dark rounded-md bg-background-light dark:bg-background-dark text-muted-foreground-light dark:text-muted-foreground-dark">
                      User selection would be implemented here
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                >
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default ManageNotifications
