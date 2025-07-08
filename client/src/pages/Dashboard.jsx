import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import { format, formatDistanceToNow } from "date-fns"
import { Calendar, Users, Award, Activity, MapPin, Clock, ChevronRight, Plus, Star, Bell, Loader2, BarChart3, TrendingUp, CalendarIcon, CheckCircle, User, Dumbbell, UserPlus, Target, Zap, Trophy, FlameIcon as Fire, Eye, Settings, ArrowUp, ArrowDown,  Crown, Medal, Timer, Globe, Heart, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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
  const [activeTab, setActiveTab] = useState("overview")
  const [timeOfDay, setTimeOfDay] = useState("")

  // Get time-based greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay("morning")
    else if (hour < 17) setTimeOfDay("afternoon")
    else setTimeOfDay("evening")
  }, [])

  // Dynamic title
  useEffect(() => {
    document.title = `Dashboard - ${user?.name || "SportsBuddy"}`
  }, [user])

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoadingData(true)
        const events = await getUserEvents(user.id)
        const now = new Date()
        const participating = []
        const created = []
        const past = []

        events.data.forEach((event) => {
          const eventDate = new Date(event.date)
          if (eventDate < now) {
            past.push(event)
          } else if (event.createdBy === user.id) {
            created.push(event)
          } else {
            participating.push(event)
          }
        })

        setUserEvents({ participating, created, past })
        setStats({
          totalEvents: events.data.length,
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

  const generateActivityData = (events) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12
      return months[monthIndex]
    }).reverse()

    const eventCounts = lastSixMonths.map((month) => {
      const monthIndex = months.indexOf(month)
      return events.data.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate.getMonth() === monthIndex
      }).length
    })

    setActivityData(
      lastSixMonths.map((month, index) => ({
        month,
        count: eventCounts[index],
      })),
    )
  }

  const getGreeting = () => {
    const greetings = {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    }
    return greetings[timeOfDay] || "Hello"
  }

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

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-primary-light dark:text-primary-dark" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary-light/20 dark:border-primary-dark/20 rounded-full animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-medium text-foreground-light dark:text-foreground-dark">
            Loading your dashboard...
          </p>
          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
            Preparing your sports journey
          </p>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-light to-muted-light/30 dark:from-background-dark dark:via-background-dark dark:to-muted-dark/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-light via-primary-light to-secondary-light dark:from-primary-dark dark:via-primary-dark dark:to-secondary-dark p-8 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center ">
                <div className="mb-6 md:mb-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <Avatar className="w-16 h-16 border-4 border-white/20">
                      <AvatarImage src={user?.avatar?.url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-1">
                        {getGreeting()}, {user?.name?.split(" ")[0] || "Athlete"}! 👋
                      </h1>
                      <p className="text-white/90 text-lg">Ready to conquer your fitness goals today?</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                      <Fire className="w-5 h-5" />
                      <span className="font-medium">{stats.totalEvents} Events</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium">{stats.achievements} Achievements</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Level {Math.floor(stats.totalEvents / 5) + 1}</span>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    variant="outline"
                  >
                    <Link to="/notifications" className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                      {user?.notifications?.filter((n) => !n.read).length > 0 && (
                        <Badge className="bg-destructive-light dark:bg-destructive-dark text-white border-0">
                          {user.notifications.filter((n) => !n.read).length}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="bg-white rounded-xl text-primary-light hover:bg-white/90">
                    <Link to="/events/create" className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>Create Event</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-[.5rem] p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-[.5rem]"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-[.5rem]"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-[.5rem]"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-[.5rem]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-8">
                {/* Stats Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Total Events",
                      value: stats.totalEvents,
                      icon: Calendar,
                      color: "primary",
                      description: "Events participated",
                      trend: "+12%",
                      trendUp: true,
                    },
                    {
                      title: "Upcoming",
                      value: stats.upcomingEvents,
                      icon: Clock,
                      color: "accent",
                      description: "Events scheduled",
                      trend: "+5%",
                      trendUp: true,
                    },
                    {
                      title: "Completed",
                      value: stats.completedEvents,
                      icon: CheckCircle,
                      color: "success",
                      description: "Events finished",
                      trend: "+8%",
                      trendUp: true,
                    },
                    {
                      title: "Achievements",
                      value: stats.achievements,
                      icon: Award,
                      color: "destructive",
                      description: "Badges earned",
                      trend: "+3%",
                      trendUp: true,
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Card className="relative overflow-hidden bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted-light/10 dark:to-muted-dark/10" />
                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                stat.color === "primary" &&
                                  "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark",
                                stat.color === "accent" &&
                                  "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark",
                                stat.color === "success" &&
                                  "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark",
                                stat.color === "destructive" &&
                                  "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark",
                              )}
                            >
                              <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              {stat.trendUp ? (
                                <ArrowUp className="w-4 h-4 text-success-light dark:text-success-dark" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-destructive-light dark:text-destructive-dark" />
                              )}
                              <span
                                className={cn(
                                  "font-medium",
                                  stat.trendUp
                                    ? "text-success-light dark:text-success-dark"
                                    : "text-destructive-light dark:text-destructive-dark",
                                )}
                              >
                                {stat.trend}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                            {stat.title}
                          </h3>
                          <p className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-1">
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                            {stat.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Activity Chart */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
                            Activity Overview
                          </CardTitle>
                          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                            Your sports activity over the last 6 months
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary-light dark:bg-primary-dark" />
                            <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                              Events
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-end justify-between gap-2">
                        {activityData.map((data, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex flex-col items-center flex-1"
                          >
                            <div className="w-full flex justify-center mb-3">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{
                                  height: data.count ? Math.max(data.count * 30, 20) : 10,
                                }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                className="w-8 bg-gradient-to-t from-primary-light to-primary-light/70 dark:from-primary-dark dark:to-primary-dark/70 rounded-t-lg hover:from-primary-light/80 hover:to-primary-light dark:hover:from-primary-dark/80 dark:hover:to-primary-dark transition-all duration-300 cursor-pointer relative group"
                              >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground-light dark:bg-foreground-dark text-background-light dark:text-background-dark px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  {data.count} events
                                </div>
                              </motion.div>
                            </div>
                            <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark font-medium">
                              {data.month}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            title: "Browse Events",
                            description: "Find new events to join",
                            icon: Globe,
                            href: "/events",
                            color: "primary",
                          },
                          {
                            title: "Create Event",
                            description: "Organize your own event",
                            icon: Plus,
                            href: "/events/create",
                            color: "success",
                          },
                          {
                            title: "View Profile",
                            description: "Manage your profile",
                            icon: User,
                            href: "/profile",
                            color: "accent",
                          },
                          {
                            title: "Settings",
                            description: "Customize your experience",
                            icon: Settings,
                            href: "/settings",
                            color: "muted",
                          },
                        ].map((action, index) => (
                          <motion.div
                            key={action.title}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              to={action.href}
                              className="block p-4 rounded-xl border border-border-light dark:border-border-dark hover:shadow-lg transition-all duration-300 group"
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                                  action.color === "primary" &&
                                    "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark",
                                  action.color === "success" &&
                                    "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark",
                                  action.color === "accent" &&
                                    "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark",
                                  action.color === "muted" &&
                                    "bg-muted-light/20 dark:bg-muted-dark/20 text-muted-foreground-light dark:text-muted-foreground-dark",
                                )}
                              >
                                <action.icon className="w-5 h-5" />
                              </div>
                              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                {action.description}
                              </p>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="events" className="space-y-6 mt-8">
                {/* Upcoming Events */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
                            Upcoming Events
                          </CardTitle>
                          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                            Events you're participating in or organizing
                          </p>
                        </div>
                        <Button asChild variant="outline">
                          <Link to="/events" className="flex items-center gap-2">
                            View All
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userEvents.participating.length === 0 && userEvents.created.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-muted-light/20 dark:bg-muted-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-10 h-10 text-muted-foreground-light dark:text-muted-foreground-dark" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                            No upcoming events
                          </h3>
                          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
                            Discover exciting sports events in your area
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild>
                              <Link to="/events" className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Browse Events
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link to="/events/create" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Event
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...userEvents.participating, ...userEvents.created].slice(0, 6).map((event, index) => (
                            <motion.div
                              key={event._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className="group"
                            >
                              <Link to={`/events/${event._id}`}>
                                <Card className="overflow-hidden border-border-light dark:border-border-dark hover:shadow-xl transition-all duration-300">
                                  <div className="relative h-40 overflow-hidden">
                                    {event.images && event.images.length > 0 ? (
                                      <img
                                        src={event.images[0].url || "/placeholder.svg?height=160&width=320"}
                                        alt={event.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-muted-light to-muted-light/50 dark:from-muted-dark dark:to-muted-dark/50 flex items-center justify-center">
                                        <Calendar className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    {event.createdBy === user.id && (
                                      <div className="absolute top-3 left-3">
                                        <Badge className="bg-primary-light/90 dark:bg-primary-dark/90 text-white border-0">
                                          <Crown className="w-3 h-3 mr-1" />
                                          Your Event
                                        </Badge>
                                      </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 right-3">
                                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                                        {event.name}
                                      </h3>
                                      <div className="flex items-center text-white/90 text-sm">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="truncate">{event.location?.city}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-3">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{format(new Date(event.date), "MMM dd")}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{event.time}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-sm">
                                        <Users className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                                        <span className="font-medium text-foreground-light dark:text-foreground-dark">
                                          {event.participantCount || 0}/{event.maxParticipants}
                                        </span>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {event.category}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                          <Activity className="w-5 h-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {user.recentActivity && user.recentActivity.length > 0 ? (
                          <div className="space-y-4">
                            {user.recentActivity?.slice(0, 5).map((activity, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted-light/30 dark:hover:bg-muted-dark/30 transition-colors"
                              >
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    activity.type === "join" &&
                                      "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark",
                                    activity.type === "create" &&
                                      "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark",
                                    activity.type === "review" &&
                                      "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark",
                                    activity.type === "achievement" &&
                                      "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark",
                                  )}
                                >
                                  {activity.type === "join" && <UserPlus className="w-5 h-5" />}
                                  {activity.type === "create" && <Plus className="w-5 h-5" />}
                                  {activity.type === "review" && <Star className="w-5 h-5" />}
                                  {activity.type === "achievement" && <Award className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-foreground-light dark:text-foreground-dark font-medium">
                                    {activity.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-3" />
                            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                              No recent activity
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Achievements */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                            <Trophy className="w-5 h-5" />
                            Achievements
                          </CardTitle>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/profile" className="flex items-center gap-1">
                              View All
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {user.achievements && user.achievements.length > 0 ? (
                          <div className="space-y-4">
                            {user.achievements?.slice(0, 3).map((achievement, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg border border-border-light dark:border-border-dark hover:shadow-md transition-all duration-300"
                              >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive-light to-destructive-light/70 dark:from-destructive-dark dark:to-destructive-dark/70 flex items-center justify-center flex-shrink-0">
                                  <Medal className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">
                                    {achievement.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                                    {format(new Date(achievement.date), "MMM dd, yyyy")}
                                  </p>
                                  {achievement.description && (
                                    <p className="text-sm text-foreground-light dark:text-foreground-dark mt-1">
                                      {achievement.description}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Trophy className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-3" />
                            <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                              No achievements yet
                            </h3>
                            <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-4">
                              Complete events to earn achievements
                            </p>
                            <Button asChild size="sm">
                              <Link to="/events" className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Find Events
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 mt-8">
                {/* Sports Preferences */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                            <Dumbbell className="w-5 h-5" />
                            Your Sports
                          </CardTitle>
                          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                            Sports you're interested in and your skill levels
                          </p>
                        </div>
                        <Button asChild variant="outline">
                          <Link to="/profile" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {user.sportsPreferences && user.sportsPreferences.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {user.sportsPreferences.map((sport, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 rounded-xl border border-border-light dark:border-border-dark hover:shadow-lg transition-all duration-300 text-center group"
                            >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-light/20 to-primary-light/10 dark:from-primary-dark/20 dark:to-primary-dark/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Dumbbell className="w-8 h-8 text-primary-light dark:text-primary-dark" />
                              </div>
                              <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                                {sport.sport}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {sport.skillLevel}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-muted-light/20 dark:bg-muted-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Dumbbell className="w-10 h-10 text-muted-foreground-light dark:text-muted-foreground-dark" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                            No sports preferences added
                          </h3>
                          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
                            Add your favorite sports to get personalized recommendations
                          </p>
                          <Button asChild>
                            <Link to="/profile" className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add Sports
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Profile Stats */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground-light dark:text-foreground-dark">
                        <TrendingUp className="w-5 h-5" />
                        Profile Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary-light/20 dark:bg-primary-dark/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Timer className="w-8 h-8 text-primary-light dark:text-primary-dark" />
                          </div>
                          <p className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                            {stats.totalEvents * 2}h
                          </p>
                          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                            Total Activity Time
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-success-light/20 dark:bg-success-dark/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Heart className="w-8 h-8 text-success-light dark:text-success-dark" />
                          </div>
                          <p className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                            {Math.floor(stats.totalEvents * 1.5)}
                          </p>
                          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                            Events Liked
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-accent-light/20 dark:bg-accent-dark/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Share2 className="w-8 h-8 text-accent-light dark:text-accent-dark" />
                          </div>
                          <p className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                            {Math.floor(stats.totalEvents * 0.8)}
                          </p>
                          <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                            Events Shared
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
