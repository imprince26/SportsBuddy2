"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEvents } from "../context/EventContext"
import { format } from "date-fns"
import { Calendar, Users, Award, Activity, MapPin, Clock, ChevronRight, Plus, Star, Bell, Loader2, BarChart3, TrendingUp, CalendarIcon, CheckCircle, User, Dumbbell, UserPlus } from 'lucide-react'

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
  const [activityData, setActivityData] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoadingData(true)
        const events = await getUserEvents(user.id)
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

        generateActivityData(events)
      } catch (error) {
        console.error("Error fetching user events:", error)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      fetchUserEvents()
    }
  }, [user])

  // Generate mock activity data for the chart
  const generateActivityData = (events) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()

    // Get last 6 months
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12
      return months[monthIndex]
    }).reverse()

    // Count events per month
    const eventCounts = lastSixMonths.map(month => {
      const monthIndex = months.indexOf(month)
      return events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.getMonth() === monthIndex
      }).length
    })

    setActivityData(lastSixMonths.map((month, index) => ({
      month,
      count: eventCounts[index]
    })))
  }

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading dashboard...</p>
        </div>
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
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Total Events</h3>
            <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-light dark:text-primary-dark" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.totalEvents}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Events you've participated in or created
          </p>
          <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
            <Link
              to="/events"
              className="text-sm text-primary-light dark:text-primary-dark hover:underline flex items-center"
            >
              View all events
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Upcoming</h3>
            <div className="w-10 h-10 rounded-full bg-accent-light/10 dark:bg-accent-dark/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-light dark:text-accent-dark" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.upcomingEvents}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Events scheduled in the future
          </p>
          <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
            <Link
              to="/events?status=Upcoming"
              className="text-sm text-accent-light dark:text-accent-dark hover:underline flex items-center"
            >
              View upcoming events
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Completed</h3>
            <div className="w-10 h-10 rounded-full bg-success-light/10 dark:bg-success-dark/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-light dark:text-success-dark" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.completedEvents}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Events you've participated in
          </p>
          <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
            <Link
              to="/events?status=Completed"
              className="text-sm text-success-light dark:text-success-dark hover:underline flex items-center"
            >
              View completed events
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark">Achievements</h3>
            <div className="w-10 h-10 rounded-full bg-destructive-light/10 dark:bg-destructive-dark/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-destructive-light dark:text-destructive-dark" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">{stats.achievements}</p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
            Achievements earned
          </p>
          <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
            <Link
              to="/profile"
              className="text-sm text-destructive-light dark:text-destructive-dark hover:underline flex items-center"
            >
              View achievements
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Activity Overview</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary-light dark:bg-primary-dark mr-2"></div>
              <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Events</span>
            </div>
            <select
              className="text-sm border-none bg-transparent text-muted-foreground-light dark:text-muted-foreground-dark focus:outline-none focus:ring-0"
              defaultValue="6months"
            >
              <option value="30days">Last 30 days</option>
              <option value="6months">Last 6 months</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between">
          {activityData.map((data, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              <div className="w-full flex justify-center mb-2">
                <div
                  className="w-12 bg-primary-light/80 dark:bg-primary-dark/80 rounded-t-md hover:bg-primary-light dark:hover:bg-primary-dark transition-colors"
                  style={{ height: `${data.count ? Math.max(data.count * 30, 20) : 10}px` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">{data.month}</span>
            </div>
          ))}
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
            <CalendarIcon className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
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
                      src={event.images[0].url || "/placeholder.svg?height=160&width=320"}
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

      {/* Recent Activity and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">Recent Activity</h2>

          {user.recentActivity && user.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {user.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                    {activity.type === 'join' && <UserPlus size={18} className="text-success-light dark:text-success-dark" />}
                    {activity.type === 'create' && <Plus size={18} className="text-primary-light dark:text-primary-dark" />}
                    {activity.type === 'review' && <Star size={18} className="text-accent-light dark:text-accent-dark" />}
                    {activity.type === 'achievement' && <Award size={18} className="text-destructive-light dark:text-destructive-dark" />}
                  </div>
                  <div>
                    <p className="text-foreground-light dark:text-foreground-dark">{activity.message}</p>
                    <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-2" />
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No recent activity</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Achievements</h2>
            <Link to="/profile" className="text-primary-light dark:text-primary-dark hover:underline flex items-center">
              View all <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {user.achievements && user.achievements.length > 0 ? (
            <div className="space-y-4">
              {user.achievements?.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-destructive-light/10 dark:bg-destructive-dark/10 flex items-center justify-center mr-3">
                    <Award size={18} className="text-destructive-light dark:text-destructive-dark" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      {format(new Date(achievement.date), "MMM dd, yyyy")}
                    </p>
                    {achievement.description && (
                      <p className="text-sm text-foreground-light dark:text-foreground-dark mt-1">{achievement.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Award className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-2" />
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No achievements yet</p>
              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mt-2">
                Complete events to earn achievements
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sports Preferences */}
      <div className="mt-8 bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Your Sports</h2>
          <Link to="/profile" className="text-primary-light dark:text-primary-dark hover:underline flex items-center">
            Manage <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {user.sportsPreferences && user.sportsPreferences.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {user.sportsPreferences.map((sport, index) => (
              <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-3 text-center">
                <div className="w-12 h-12 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center mx-auto mb-2">
                  <Dumbbell className="w-6 h-6 text-primary-light dark:text-primary-dark" />
                </div>
                <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{sport.sport}</h3>
                <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark mt-1">
                  {sport.skillLevel}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Dumbbell className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-2" />
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No sports preferences added</p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              <Plus size={16} />
              <span>Add Sports</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
