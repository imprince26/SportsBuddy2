import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import { format, formatDistanceToNow } from "date-fns"
import {
  Calendar, Users, Trophy, Activity, MapPin, Clock, Plus, Bell,
  BarChart3, Zap, CalendarDays, User, Sparkles, Dumbbell, Settings, UserPlus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/utils/api"

const Dashboard = () => {
  const { user, getCurrentUser } = useAuth()
  const { getUserEvents, loading } = useEvents()
  const [userEvents, setUserEvents] = useState({
    participating: [],
    created: [],
    upcoming: [],
    completed: []
  })
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeOfDay, setTimeOfDay] = useState("")
  const [recentActivity, setRecentActivity] = useState([])

  // Enhanced greeting system
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 6) setTimeOfDay("night")
    else if (hour < 12) setTimeOfDay("morning")
    else if (hour < 17) setTimeOfDay("afternoon")
    else if (hour < 21) setTimeOfDay("evening")
    else setTimeOfDay("night")
  }, [])

  // Fetch real user data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      setLoadingData(true)
      try {
        // Fetch user events
        const eventsData = await api.get('/users/events')
        if (eventsData.data.success) {
          const now = new Date()
          const events = eventsData.data.data

          // Filter participating events (exclude created events)
          const participatingEvents = events.filter(event => {
            const isParticipant = event.participants?.some(p => {
              const participantId = typeof p.user === 'object' ? p.user._id : p.user
              return participantId?.toString() === user.id?.toString()
            })
            const isCreator = (event.createdBy?._id || event.createdBy)?.toString() === user.id?.toString()
            return isParticipant && !isCreator
          })

          // Filter created events
          const createdEvents = events.filter(event => {
            const creatorId = typeof event.createdBy === 'object' ? event.createdBy._id : event.createdBy
            return creatorId?.toString() === user.id?.toString()
          })

          // Filter upcoming events (from all user events)
          const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date)
            return eventDate > now && event.status === "Upcoming"
          }).sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by nearest date first

          // Filter completed events
          const completedEvents = events.filter(event =>
            event.status === "Completed"
          )

          setUserEvents({
            participating: participatingEvents,
            created: createdEvents,
            upcoming: upcomingEvents,
            completed: completedEvents
          })
        }

        // Get current user data with stats
        await getCurrentUser()
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Process real user stats
  useEffect(() => {
    if (user) {
      const stats = {
        totalEvents: user.stats?.eventsParticipated || 0,
        eventsCreated: user.stats?.eventsCreated || 0,
        eventsParticipated: user.stats?.eventsParticipated || 0,
        upcomingEvents: Math.max(0, userEvents.upcoming?.length || 0),
        completedEvents: Math.max(0, userEvents.completed?.length || 0),
        achievements: user.stats?.achievementsCount || user.achievements?.length || 0,
        totalPoints: user.stats?.totalPoints || 0,
        currentRank: user.stats?.currentRank || 0,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        communitiesJoined: user.stats?.communitiesJoined || 0
      }
      setDashboardStats(stats)

      // Process recent activity
      if (user.activityLog) {
        setRecentActivity(user.activityLog.slice(0, 6))
      }
    }
  }, [user, userEvents])

  const getGreeting = () => {
    const greetings = {
      night: user?.name ? `Good night, ${user.name.split(" ")[0]}` : "Good night",
      morning: user?.name ? `Good morning, ${user.name.split(" ")[0]}` : "Good morning",
      afternoon: user?.name ? `Good afternoon, ${user.name.split(" ")[0]}` : "Good afternoon",
      evening: user?.name ? `Good evening, ${user.name.split(" ")[0]}` : "Good evening"
    }
    return greetings[timeOfDay] || "Hello"
  }

  const getUserLevel = (points) => {
    if (points >= 5000) return { level: "Legend", color: "bg-primary text-primary-foreground shadow-lg shadow-primary/25", icon: Trophy }
    if (points >= 2000) return { level: "Expert", color: "bg-primary/90 text-primary-foreground shadow-md shadow-primary/20", icon: Trophy }
    if (points >= 1000) return { level: "Advanced", color: "bg-primary/80 text-primary-foreground", icon: Trophy }
    if (points >= 500) return { level: "Intermediate", color: "bg-primary/20 text-primary border border-primary/20", icon: Trophy }
    return { level: "Beginner", color: "bg-secondary text-muted-foreground border border-border", icon: Sparkles }
  }

  const nextUpcomingEvent = userEvents.upcoming[0]

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-border">
              <AvatarImage src={user?.avatar?.url} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {getGreeting()}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">
                  @{user?.username}
                </p>
                {dashboardStats && (
                  <Badge variant="secondary" className={`text-xs font-normal ${getUserLevel(dashboardStats.totalPoints).color}`}>
                    {getUserLevel(dashboardStats.totalPoints).level}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
                {user?.notifications?.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                    {user.notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/events/create" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {dashboardStats && [
            { label: "Events", value: dashboardStats.totalEvents },
            { label: "Points", value: dashboardStats.totalPoints },
            { label: "Followers", value: dashboardStats.followers },
            { label: "Achievements", value: dashboardStats.achievements }
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50 bg-card/50">
              <CardContent className="p-6 flex flex-col items-center text-center sm:items-start sm:text-left">
                {/* <div className="p-2 rounded-lg bg-primary/10 text-primary mb-3">
                  <stat.icon className="w-5 h-5" />
                </div> */}
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Next Event */}
              <div className="lg:col-span-2">
                <Card className="h-full border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Next Up
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nextUpcomingEvent ? (
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {nextUpcomingEvent.name}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(nextUpcomingEvent.date), "MMM dd, yyyy")}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {nextUpcomingEvent.time}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {nextUpcomingEvent.location.city}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              {nextUpcomingEvent.category}
                            </Badge>
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                              Upcoming
                            </Badge>
                          </div>
                        </div>
                        <Button asChild className="w-full sm:w-auto">
                          <Link to={`/events/${nextUpcomingEvent._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">No upcoming events</h3>
                        <p className="text-muted-foreground text-sm mb-4">You haven't joined any events yet.</p>
                        <Button variant="outline" asChild>
                          <Link to="/events">Browse Events</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Achievements */}
              <div>
                <Card className="h-full border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      Recent Achievements
                    </CardTitle>
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    {user?.achievements?.length > 0 ? (
                      <div className="space-y-4">
                        {user.achievements.slice(0, 3).map((achievement, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {achievement.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" className="w-full text-xs" asChild>
                          <Link to="/profile">View All</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No achievements yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "Edit Profile", icon: User, href: "/profile" },
                { title: "Settings", icon: Settings, href: "/settings" },
                { title: "Find Friends", icon: UserPlus, href: "/community" },
                { title: "Your Sports", icon: Dumbbell, href: "/profile" }
              ].map((action) => (
                <Link key={action.title} to={action.href}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-border/50">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.title}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userEvents.upcoming.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Upcoming Events
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userEvents.created.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Events Created
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userEvents.completed.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Completed Events
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events you are participating in soon</CardDescription>
              </CardHeader>
              <CardContent>
                {userEvents.upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {userEvents.upcoming.map((event) => (
                      <div
                        key={event._id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {format(new Date(event.date), "dd")}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{event.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{format(new Date(event.date), "MMM yyyy")}</span>
                              <span>•</span>
                              <span>{event.time}</span>
                              <span>•</span>
                              <span>{event.location.city}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/events/${event._id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming events found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-6">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="mt-1">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.action.replace('_', ' ').charAt(0).toUpperCase() + activity.action.replace('_', ' ').slice(1)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{activity.category}</span>
                            {activity.points && (
                              <span className="text-green-600 font-medium">+{activity.points} pts</span>
                            )}
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard
