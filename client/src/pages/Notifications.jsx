"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { Bell, Calendar, MessageSquare, Users, Info, Check, CheckCheck, ChevronLeft } from "lucide-react"

const Notifications = () => {
  const { user, notifications, fetchNotifications, markNotificationAsRead } = useAuth()
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true)
      try {
        await fetchNotifications()
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Assuming there's a function to mark all as read
      // await markAllNotificationsAsRead();
      // For now, let's mark each unread notification as read
      for (const notification of notifications.filter((n) => !n.read)) {
        await markNotificationAsRead(notification._id)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case "event":
        return <Calendar className="w-5 h-5 text-primary-light dark:text-primary-dark" />
      case "chat":
        return <MessageSquare className="w-5 h-5 text-accent-light dark:text-accent-dark" />
      case "team":
        return <Users className="w-5 h-5 text-success-light dark:text-success-dark" />
      case "system":
        return <Info className="w-5 h-5 text-muted-foreground-light dark:text-muted-foreground-dark" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground-light dark:text-muted-foreground-dark" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-4 md:mb-0">
            Notifications
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "all"
                  ? "bg-primary-light dark:bg-primary-dark text-white"
                  : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "unread"
                  ? "bg-primary-light dark:bg-primary-dark text-white"
                  : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("event")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "event"
                  ? "bg-primary-light dark:bg-primary-dark text-white"
                  : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setFilter("chat")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "chat"
                  ? "bg-primary-light dark:bg-primary-dark text-white"
                  : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setFilter("team")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "team"
                  ? "bg-primary-light dark:bg-primary-dark text-white"
                  : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
              }`}
            >
              Teams
            </button>
          </div>
        </div>

        {notifications?.some((n) => !n.read) && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-sm text-primary-light dark:text-primary-dark hover:underline"
            >
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {filteredNotifications?.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg ${
                  notification.read
                    ? "bg-background-light dark:bg-background-dark"
                    : "bg-primary-light/5 dark:bg-primary-dark/5 border-l-4 border-primary-light dark:border-primary-dark"
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-foreground-light dark:text-foreground-dark">{notification.message}</p>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
                      {format(new Date(notification.timestamp), "MMM dd, yyyy • h:mm a")}
                    </p>
                    {notification.relatedEvent && (
                      <Link
                        to={`/events/${notification.relatedEvent}`}
                        className="text-sm text-primary-light dark:text-primary-dark hover:underline mt-2 inline-block"
                      >
                        View Event
                      </Link>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-1 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">
              No notifications
            </h3>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
              {filter === "all"
                ? "You don't have any notifications yet"
                : `You don't have any ${filter === "unread" ? "unread" : filter} notifications`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
