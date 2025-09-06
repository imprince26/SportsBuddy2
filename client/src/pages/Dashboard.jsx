import React,{ useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import { format, formatDistanceToNow } from "date-fns"
import {
  Calendar, Users, Award, Activity, MapPin, Clock, ChevronRight, Plus, Star, Bell,
   BarChart3, TrendingUp, CheckCircle, User, Dumbbell, Target, Zap, Trophy, 
   Settings, ArrowUp, Crown, Medal,
  Coffee, Sunrise, Moon, Sun, UserPlus, MessageCircle,  Sparkles,
   CalendarDays, Users2, ShieldCheck,
   Rocket
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
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
  const [hoveredCard, setHoveredCard] = useState(null)
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
          setUserEvents({
            participating: events.filter(event => 
              event.participants?.some(p => p.user._id === user.id || p.user === user.id)
            ),
            created: events.filter(event => 
              event.createdBy._id === user.id || event.createdBy === user.id
            ),
            upcoming: events.filter(event => 
              new Date(event.date) > now && event.status === "Upcoming"
            ),
            completed: events.filter(event => 
              event.status === "Completed"
            )
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
        totalEvents:  user.stats?.eventsParticipated || 0,
        eventsCreated: user.stats?.eventsCreated || 0,
        eventsParticipated: user.stats?.eventsParticipated || 0,
        upcomingEvents: userEvents.upcoming.length,
        completedEvents: userEvents.completed.length,
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

  const getGreetingIcon = () => {
    const icons = {
      night: Moon,
      morning: Sunrise,
      afternoon: Sun,
      evening: Coffee
    }
    return icons[timeOfDay] || Sun
  }

  const getActivityIcon = (action) => {
    const icons = {
      event_join: UserPlus,
      event_create: Plus,
      venue_review: Star,
      achievement_earned: Award,
      post_create: MessageCircle
    }
    return icons[action] || Activity
  }

  const getActivityColor = (action) => {
    const colors = {
      event_join: "text-green-600 bg-green-100 dark:bg-green-900/20",
      event_create: "text-blue-600 bg-blue-100 dark:bg-blue-900/20", 
      venue_review: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
      achievement_earned: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      post_create: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20"
    }
    return colors[action] || "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
  }

  const getUserLevel = (points) => {
    if (points >= 5000) return { level: "Legend", color: "from-purple-500 to-pink-500", icon: Crown }
    if (points >= 2000) return { level: "Expert", color: "from-yellow-500 to-orange-500", icon: Trophy }
    if (points >= 1000) return { level: "Advanced", color: "from-blue-500 to-purple-500", icon: Medal }
    if (points >= 500) return { level: "Intermediate", color: "from-green-500 to-blue-500", icon: Target }
    return { level: "Beginner", color: "from-gray-500 to-gray-600", icon: Sparkles }
  }

  const nextUpcomingEvent = userEvents.upcoming[0]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex justify-center items-center overflow-hidden relative">
        {/* Enhanced Loading Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -60, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center relative z-10 text-center"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-800"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
            />
            <div className="absolute inset-6 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            Loading Your Sports Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Preparing your personalized dashboard...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden relative">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating Elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">


<motion.div variants={itemVariants} className="mb-8">
  <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 sm:p-6 lg:p-8 border border-white/50 dark:border-slate-700/50 shadow-2xl">
    {/* Header Background Pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />

    <div className="relative z-10">
      {/* Main User Info Section */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-6">
        {/* Left Section: Avatar + Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-4">
            {/* Avatar with Online Status */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-white shadow-xl">
                <AvatarImage src={user?.avatar?.url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Greeting and User Info */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-wrap items-center gap-2 mb-2"
              >
                {/* {React.createElement(getGreetingIcon(), {
                  className: "w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0",
                })} */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                  {getGreeting()}!
                </h1>
                {/* <motion.span
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                  className="text-lg sm:text-xl lg:text-2xl flex-shrink-0"
                >
                  👋
                </motion.span> */}
              </motion.div>

              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg mb-3">
                Ready to elevate your sports journey today?
              </p>

              {/* User Level Badge and Username */}
              {dashboardStats && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-wrap items-center gap-2 sm:gap-3"
                >
                  {(() => {
                    const levelInfo = getUserLevel(dashboardStats.totalPoints)
                    return (
                      <div
                        className={`flex items-center gap-2 px-3 py-1 sm:px-4 rounded-full bg-gradient-to-r ${levelInfo.color} text-white shadow-lg`}
                      >
                        <span className="font-bold text-[.75rem] sm:text-base">{levelInfo.level}</span>
                        <span className="text-white/80 text-xs sm:text-sm">{dashboardStats.totalPoints} pts</span>
                      </div>
                    )
                  })()}

                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs sm:text-sm rounded-xl"
                  >
                    @{user?.username}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Quick Actions - Better positioning on large screens */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:min-w-fit">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full bg-white/80 hover:bg-white text-gray-900 border-gray-200/50 backdrop-blur-sm shadow-lg rounded-xl"
            >
              <Link to="/notifications" className="flex items-center justify-center gap-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {user?.notifications?.filter(n => !n.read).length > 0 && (
                  <Badge className="bg-red-500 rounded-full text-white border-0 ml-1">
                    {user.notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Link>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="w-full  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-xl"
            >
              <Link to="/events/create" className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Create Event</span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section: Quick Stats */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {dashboardStats && [
            { icon: Calendar, label: "Events", value: dashboardStats.totalEvents, color: "blue" },
            { icon: Trophy, label: "Achievements", value: dashboardStats.achievements, color: "yellow" },
            { icon: Users, label: "Followers", value: dashboardStats.followers, color: "green" },
            { icon: Target, label: "Level", value: Math.floor(dashboardStats.totalPoints / 100) + 1, color: "purple" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl px-3 py-3 sm:px-4 sm:py-4 border border-${stat.color}-200/50 dark:border-${stat.color}-700/50 text-center sm:text-left group hover:shadow-lg transition-all duration-300`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto sm:mx-0 rounded-xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
</motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl p-1 shadow-lg">
                {[
                  { value: "overview", icon: BarChart3, label: "Overview" },
                  { value: "events", icon: Calendar, label: "Events" },
                  { value: "activity", icon: Activity, label: "Activity" },
                  { value: "profile", icon: User, label: "Profile" }
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-8">
                {/* Enhanced Stats Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dashboardStats && [
                    {
                      title: "Events Created",
                      value: dashboardStats.eventsCreated,
                      icon: Plus,
                      trend: "+12%",
                      gradient: "from-blue-500 to-blue-600",
                      description: "Events organized by you"
                    },
                    {
                      title: "Events Joined",
                      value: dashboardStats.eventsParticipated,
                      icon: UserPlus,
                      trend: "+8%",
                      gradient: "from-green-500 to-green-600",
                      description: "Events you participated in"
                    },
                    {
                      title: "Total Points",
                      value: dashboardStats.totalPoints,
                      icon: Zap,
                      trend: "+15%",
                      gradient: "from-yellow-500 to-orange-500",
                      description: "Points earned"
                    },
                    {
                      title: "Achievements",
                      value: dashboardStats.achievements,
                      icon: Award,
                      trend: "+3%",
                      gradient: "from-purple-500 to-pink-500",
                      description: "Badges unlocked"
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onHoverStart={() => setHoveredCard(index)}
                      onHoverEnd={() => setHoveredCard(null)}
                      className="group relative"
                    >
                      <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        
                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <motion.div
                              animate={{ rotate: hoveredCard === index ? [0, 360] : 0 }}
                              transition={{ duration: 0.6 }}
                              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                            >
                              <stat.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <ArrowUp className="w-4 h-4" />
                              <span>{stat.trend}</span>
                            </div>
                          </div>
                          
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {stat.title}
                          </h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {stat.value.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {stat.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Next Event Card */}
                {nextUpcomingEvent && (
                  <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                          <CalendarDays className="w-5 h-5" />
                          Next Event
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {nextUpcomingEvent.name}
                            </h3>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(nextUpcomingEvent.date), "MMM dd, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{nextUpcomingEvent.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{nextUpcomingEvent.location.city}</span>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {nextUpcomingEvent.category}
                            </Badge>
                          </div>
                          <Button asChild>
                            <Link to={`/events/${nextUpcomingEvent._id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Recent Achievements */}
                {user?.achievements?.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Recent Achievements
                          </CardTitle>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/profile" className="flex items-center gap-2">
                              View All
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {user.achievements.slice(0, 6).map((achievement, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-700/50"
                            >
                              <div className="text-2xl mb-2">{achievement.icon || "🏆"}</div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {achievement.description}
                              </p>
                              {achievement.points && (
                                <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  +{achievement.points} pts
                                </Badge>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="events" className="space-y-6 mt-8">
                {/* Events Overview */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {userEvents.upcoming.length}
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300">Upcoming Events</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {userEvents.created.length}
                      </h3>
                      <p className="text-green-700 dark:text-green-300">Events Created</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {userEvents.completed.length}
                      </h3>
                      <p className="text-purple-700 dark:text-purple-300">Completed</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Upcoming Events List */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Upcoming Events
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/events">View All</Link>
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userEvents.upcoming.length > 0 ? (
                        <div className="space-y-4">
                          {userEvents.upcoming.slice(0, 5).map((event, index) => (
                            <motion.div
                              key={event._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {event.name}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{format(new Date(event.date), "MMM dd")}</span>
                                    <span>•</span>
                                    <span>{event.time}</span>
                                    <span>•</span>
                                    <span>{event.location.city}</span>
                                  </div>
                                </div>
                              </div>
                              <Button asChild size="sm" variant="outline">
                                <Link to={`/events/${event._id}`}>View</Link>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
                          <Button asChild className="mt-4">
                            <Link to="/events">Browse Events</Link>
                          </Button>
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
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recentActivity.length > 0 ? (
                          <div className="space-y-4">
                            {recentActivity.map((activity, index) => {
                              const ActivityIcon = getActivityIcon(activity.action)
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.action)}`}>
                                    <ActivityIcon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white font-medium">
                                      {activity.action.replace('_', ' ').charAt(0).toUpperCase() + activity.action.replace('_', ' ').slice(1)}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <span>{activity.category}</span>
                                      {activity.points && (
                                        <>
                                          <span>•</span>
                                          <span className="text-green-600">+{activity.points} pts</span>
                                        </>
                                      )}
                                      <span>•</span>
                                      <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Sports Preferences */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Dumbbell className="w-5 h-5" />
                            Your Sports
                          </CardTitle>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/profile">Manage</Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {user?.sportsPreferences?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {user.sportsPreferences.map((sport, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 text-center"
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Dumbbell className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {sport.sport}
                                </h3>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    sport.skillLevel === "Advanced" && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
                                    sport.skillLevel === "Intermediate" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
                                    sport.skillLevel === "Beginner" && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                  )}
                                >
                                  {sport.skillLevel}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No sports preferences added</p>
                            <Button asChild className="mt-4">
                              <Link to="/profile">Add Sports</Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 mt-8">
                {/* Profile Stats */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Profile Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {[
                            { label: "Total Points", value: dashboardStats.totalPoints, icon: Zap, color: "yellow" },
                            { label: "Followers", value: dashboardStats.followers, icon: Users, color: "blue" },
                            { label: "Following", value: dashboardStats.following, icon: UserPlus, color: "green" },
                            { label: "Communities", value: dashboardStats.communitiesJoined, icon: Users2, color: "purple" }
                          ].map((stat, index) => (
                            <motion.div
                              key={stat.label}
                              whileHover={{ scale: 1.05 }}
                              className={`text-center p-4 rounded-xl bg-gradient-to-br from-${stat.color}-50/50 to-${stat.color}-100/50 dark:from-${stat.color}-900/20 dark:to-${stat.color}-800/20 border border-${stat.color}-200/30 dark:border-${stat.color}-700/30`}
                            >
                              <div className={`w-16 h-16 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                                <stat.icon className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stat.value.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.label}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Profile Actions */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { title: "Edit Profile", icon: User, href: "/profile", color: "blue" },
                          { title: "Settings", icon: Settings, href: "/settings", color: "yellow" },
                          { title: "Notifications", icon: Bell, href: "/notifications", color: "purple" },
                          { title: "Privacy", icon: ShieldCheck, href: "/privacy", color: "green" }
                        ].map((action, index) => (
                          <motion.div
                            key={action.title}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to={action.href}
                              className={`block p-4 rounded-xl border border-${action.color}-200/50 dark:border-${action.color}-700/50 hover:shadow-lg transition-all duration-300 group bg-${action.color}-50/30 dark:bg-${action.color}-900/10 backdrop-blur-sm`}
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                <action.icon className="w-5 h-5 text-white" />
                              </div>
                              <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-${action.color}-600 dark:group-hover:text-${action.color}-400 transition-colors`}>
                                {action.title}
                              </h3>
                            </Link>
                          </motion.div>
                        ))}
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