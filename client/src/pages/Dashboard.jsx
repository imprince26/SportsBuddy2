"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEvents } from "../context/EventContext"
import { format } from "date-fns"
import { Calendar, Users, Award, Activity, MapPin, Clock, ChevronRight, Plus, Star, Bell } from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth()
  const { getUserEvents, loading } = useEvents()
  const [userEvents, setUserEvents] = useState({
    participating: [],
    created: [],
    past: [],
  })
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    achievements: 0,
  })

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const events = await getUserEvents()
  
        // Separate events into categories
        const now = new Date()
        const participating = []
        const created = []
        const past = []

        events.forEach((event) => {
          const eventDate = new Date(event.date)

          if (eventDate < now) {
            past.push(event)
          } else if (event.createdBy === user.id) {
            created.push(event)
          } else {
            participating.push(event)
          }
        })

        setUserEvents({
          participating,
          created,
          past,
        })

        // Calculate stats
        setStats({
          totalEvents: events.length,
          upcomingEvents: participating.length + created.length,
          completedEvents: past.length,
          achievements: user.achievements?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching user events:", error)
      }
    }

    if (user) {
      fetchUserEvents()
    }
  }, [user, getUserEvents])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            Welcome, {user?.name || "Athlete"}!
          </h1>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
            Manage your sports events and activities
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link
            to="/notifications"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
          >
            <Bell size={18} />
            <span>Notifications</span>
            {user?.notifications?.filter((n) => !n.read).length > 0 && (
              <span className="w-5 h-5 rounded-full bg-destructive-light dark:bg-destructive-dark text-white text-xs flex items-center justify-center">
                {user.notifications.filter((n) => !n.read).length}
              </span>
            )}
          </Link>
          <Link
            to="/events/create"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Total Events</h3>
            <Calendar className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.totalEvents}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Events you've participated in or created
          </p>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Upcoming</h3>
            <Users className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.upcomingEvents}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Events scheduled in the future
          </p>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Completed</h3>
            <Activity className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.completedEvents}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Events you've participated in
          </p>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Achievements</h3>
            <Award className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.achievements}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Achievements earned
          </p>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">Upcoming Events</h2>
          <Link to="/events" className="text-primary-light dark:text-primary-dark hover:underline flex items-center">
            View all <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {userEvents.participating.length === 0 && userEvents.created.length === 0 ? (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-4">
              You don't have any upcoming events
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              <Calendar size={18} />
              <span>Browse Events</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...userEvents.participating, ...userEvents.created].slice(0, 6).map((event) => (
              <Link
                to={`/events/${event._id}`}
                key={event._id}
                className="group bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={event.images[0].url || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                      <span className="text-muted-foreground-light dark:text-muted-foreground-dark">No image</span>
                    </div>
                  )}
                  {event.createdBy === user.id && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-light/90 dark:bg-primary-dark/90 text-white">
                        Your Event
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2 truncate">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                    <span className="mx-2">•</span>
                    <Clock size={14} className="mr-1" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">{event.location.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {userEvents.past.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">Past Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.past.slice(0, 3).map((event) => (
              <Link
                to={`/events/${event._id}`}
                key={event._id}
                className="group bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={event.images[0].url || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                      <span className="text-muted-foreground-light dark:text-muted-foreground-dark">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted-light/90 dark:bg-muted-dark/90 text-foreground-light dark:text-foreground-dark">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2 truncate">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                  </div>
                  {event.ratings && event.ratings.length > 0 && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      <Star size={14} className="mr-1 text-accent-light dark:text-accent-dark" />
                      <span>
                        {(event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(1)}
                      </span>
                      <span className="ml-1">({event.ratings.length})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
