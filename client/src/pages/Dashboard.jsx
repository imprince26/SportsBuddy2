import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useEvents } from "@/hooks/useEvents"
import { format, formatDistanceToNow } from "date-fns"
import {
  Calendar, Users, Award, Activity, MapPin, Clock, ChevronRight, Plus, Star, Bell,
  Loader2, BarChart3, TrendingUp, CalendarIcon, CheckCircle, User, Dumbbell,
  UserPlus, Target, Zap, Trophy, Flame, Eye, Settings, ArrowUp, ArrowDown, Crown,
  Medal, Timer, Globe, Heart, Share2, Sparkles, Rocket, Shield, MessageCircle,
  Camera, Edit, BookOpen, Gift, Compass, Briefcase, Coffee, Music
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
    totalEvents: 15,
    upcomingEvents: 8,
    completedEvents: 12,
    achievements: 6,
  })
  const [activityData, setActivityData] = useState([
    { month: "Jul", count: 4 },
    { month: "Aug", count: 7 },
    { month: "Sep", count: 3 },
    { month: "Oct", count: 9 },
    { month: "Nov", count: 6 },
    { month: "Dec", count: 8 },
  ])
  const [loadingData, setLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeOfDay, setTimeOfDay] = useState("")
  const [hoveredCard, setHoveredCard] = useState(null)

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

  // Mock data for demo
  const mockUser = {
    name: "Alex Thompson",
    avatar: { url: "/placeholder.svg?height=120&width=120" },
    sportsPreferences: [
      { sport: "Football", skillLevel: "Advanced" },
      { sport: "Basketball", skillLevel: "Intermediate" },
      { sport: "Tennis", skillLevel: "Beginner" },
      { sport: "Swimming", skillLevel: "Advanced" },
    ],
    achievements: [
      { title: "First Event", description: "Joined your first sports event", date: "2024-01-15" },
      { title: "Event Creator", description: "Created 5 successful events", date: "2024-02-20" },
      { title: "Community Builder", description: "Helped 50+ athletes connect", date: "2024-03-10" },
    ],
    recentActivity: [
      { type: "join", message: "Joined 'Morning Basketball at Central Park'", timestamp: "2024-01-20T10:00:00Z" },
      { type: "create", message: "Created 'Weekend Football Match'", timestamp: "2024-01-19T15:30:00Z" },
      { type: "achievement", message: "Earned 'Team Player' badge", timestamp: "2024-01-18T09:15:00Z" },
      { type: "review", message: "Received 5-star review from Sarah", timestamp: "2024-01-17T14:45:00Z" },
    ]
  }

  const currentUser = user || mockUser

  const mockEvents = [
    {
      _id: "1",
      name: "Weekend Football Match",
      location: { city: "Central Park, NY" },
      date: "2024-02-15",
      time: "10:00 AM",
      category: "Football",
      maxParticipants: 20,
      participantCount: 15,
      createdBy: "user123",
      images: [{ url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4U-43sYipS4JxVU_wrkLYcRSMfEk0Cs7XJQ&s" }]
    },
    {
      _id: "2",
      name: "Morning Basketball",
      location: { city: "Brooklyn, NY" },
      date: "2024-02-18",
      time: "8:00 AM",
      category: "Basketball",
      maxParticipants: 10,
      participantCount: 8,
      createdBy: "other",
      images: [{ url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4U-43sYipS4JxVU_wrkLYcRSMfEk0Cs7XJQ&s" }]
    },
    {
      _id: "3",
      name: "Tennis Tournament",
      location: { city: "Queens, NY" },
      date: "2024-02-20",
      time: "2:00 PM",
      category: "Tennis",
      maxParticipants: 16,
      participantCount: 12,
      createdBy: "user123",
      images: [{ url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4U-43sYipS4JxVU_wrkLYcRSMfEk0Cs7XJQ&s" }]
    }
  ]

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex justify-center items-center overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/20 rounded-full animate-pulse" />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-medium text-gray-900 dark:text-white"
          >
            Loading your dashboard...
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Preparing your sports journey
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

        {/* Animated Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${15 + (i * 8) % 70}%`,
              top: `${10 + (i * 12) % 80}%`,
              width: `${30 + (i % 3) * 20}px`,
              height: `${30 + (i % 3) * 20}px`,
              background: `linear-gradient(135deg, ${['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]
                }, transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 8 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <motion.div
                  className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
              </div>

              {/* Floating Particles in Header */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-500/40 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-6 md:mb-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 mb-4"
                  >
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-4 border-blue-500/20">
                        <AvatarImage src={currentUser?.avatar?.url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                          {currentUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-4xl font-bold mb-1 text-gray-900 dark:text-white"
                      >
                        {getGreeting()}, {currentUser?.name?.split(" ")[0] || "Athlete"}!
                        <motion.span
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          className="inline-block ml-2"
                        >
                          👋
                        </motion.span>
                      </motion.h1>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Ready to conquer your fitness goals today?</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 border border-blue-500/20"
                    >
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{stats.totalEvents} Events</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-purple-500/10 rounded-full px-4 py-2 border border-purple-500/20"
                    >
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{stats.achievements} Achievements</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-green-500/10 rounded-full px-4 py-2 border border-green-500/20"
                    >
                      <Target className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Level {Math.floor(stats.totalEvents / 5) + 1}</span>
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-900 border border-gray-200/50 backdrop-blur-sm shadow-lg"
                      variant="outline"
                    >
                      <Link to="/notifications" className="flex items-center justify-center sm:justify-start gap-2">
                        <Bell className="w-5 h-5" />
                        <span className="hidden sm:inline">Notifications</span>
                        <span className="sm:hidden">Notify</span>
                        <Badge className="bg-red-500 text-white border-0">3</Badge>
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white shadow-lg">
                      <Link to="/events/create" className="flex items-center justify-center sm:justify-start gap-2">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Create Event</span>
                        <span className="sm:hidden">Create</span>
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-1 shadow-lg">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
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
                      color: "blue",
                      description: "Events participated",
                      trend: "+12%",
                      trendUp: true,
                      gradient: "from-blue-500 to-blue-600"
                    },
                    {
                      title: "Upcoming",
                      value: stats.upcomingEvents,
                      icon: Clock,
                      color: "purple",
                      description: "Events scheduled",
                      trend: "+5%",
                      trendUp: true,
                      gradient: "from-purple-500 to-purple-600"
                    },
                    {
                      title: "Completed",
                      value: stats.completedEvents,
                      icon: CheckCircle,
                      color: "green",
                      description: "Events finished",
                      trend: "+8%",
                      trendUp: true,
                      gradient: "from-green-500 to-green-600"
                    },
                    {
                      title: "Achievements",
                      value: stats.achievements,
                      icon: Award,
                      color: "yellow",
                      description: "Badges earned",
                      trend: "+3%",
                      trendUp: true,
                      gradient: "from-yellow-500 to-orange-500"
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        rotateY: 5,
                        z: 50
                      }}
                      onHoverStart={() => setHoveredCard(index)}
                      onHoverEnd={() => setHoveredCard(null)}
                      className="group relative"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                        {/* Floating Particles for Each Card */}
                        {hoveredCard === index && (
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className={`absolute w-1 h-1 bg-gradient-to-r ${stat.gradient} rounded-full`}
                                style={{
                                  left: `${20 + Math.random() * 60}%`,
                                  top: `${20 + Math.random() * 60}%`,
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1.5, 0],
                                  y: [0, -20, -40],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <CardContent className="relative p-6">
                          <div className="flex items-center justify-between mb-4">
                            <motion.div
                              animate={{
                                rotate: hoveredCard === index ? [0, 10, -10, 0] : 0,
                              }}
                              transition={{ duration: 0.6 }}
                              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                            >
                              <stat.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="flex items-center gap-1 text-sm">
                              {stat.trendUp ? (
                                <ArrowUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-red-500" />
                              )}
                              <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>
                                {stat.trend}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {stat.title}
                          </h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {stat.value}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {stat.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Activity Chart */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            Activity Overview
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-400">
                            Your sports activity over the last 6 months
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
                          </div>
                          <Button variant="outline" size="sm" className="border-gray-200/50 dark:border-gray-700/50">
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
                                  height: data.count ? Math.max(data.count * 25, 20) : 10,
                                }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 cursor-pointer relative group"
                              >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  {data.count} events
                                </div>
                              </motion.div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
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
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
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
                            gradient: "from-blue-500 to-blue-600",
                          },
                          {
                            title: "Create Event",
                            description: "Organize your own event",
                            icon: Plus,
                            href: "/events/create",
                            gradient: "from-green-500 to-green-600",
                          },
                          {
                            title: "View Profile",
                            description: "Manage your profile",
                            icon: User,
                            href: "/profile",
                            gradient: "from-purple-500 to-purple-600",
                          },
                          {
                            title: "Settings",
                            description: "Customize your experience",
                            icon: Settings,
                            href: "/settings",
                            gradient: "from-gray-500 to-gray-600",
                          },
                        ].map((action, index) => (
                          <motion.div
                            key={action.title}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              to={action.href}
                              className="block p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 group bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm"
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                <action.icon className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            Upcoming Events
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-400">
                            Events you're participating in or organizing
                          </p>
                        </div>
                        <Button asChild variant="outline" className="border-gray-200/50 dark:border-gray-700/50">
                          <Link to="/events" className="flex items-center gap-2">
                            View All
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockEvents.map((event, index) => (
                          <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group"
                          >
                            <Link to={`/events/${event._id}`}>
                              <Card className="overflow-hidden border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                                <div className="relative h-40 overflow-hidden">
                                  <img
                                    src={event.images[0].url}
                                    alt={event.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  {event.createdBy === "user123" && (
                                    <div className="absolute top-3 left-3">
                                      <Badge className="bg-blue-600/90 text-white border-0">
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
                                      <span className="truncate">{event.location.city}</span>
                                    </div>
                                  </div>
                                </div>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                                      <Users className="w-4 h-4 text-blue-500" />
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {event.participantCount}/{event.maxParticipants}
                                      </span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {event.category}
                                    </Badge>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mt-3">
                                    <Progress
                                      value={(event.participantCount / event.maxParticipants) * 100}
                                      className="h-2"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Activity className="w-5 h-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {currentUser.recentActivity?.slice(0, 5).map((activity, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                activity.type === "join" && "bg-green-500/20 text-green-600",
                                activity.type === "create" && "bg-blue-500/20 text-blue-600",
                                activity.type === "review" && "bg-purple-500/20 text-purple-600",
                                activity.type === "achievement" && "bg-yellow-500/20 text-yellow-600",
                              )}>
                                {activity.type === "join" && <UserPlus className="w-5 h-5" />}
                                {activity.type === "create" && <Plus className="w-5 h-5" />}
                                {activity.type === "review" && <Star className="w-5 h-5" />}
                                {activity.type === "achievement" && <Award className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {activity.message}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Achievements */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Trophy className="w-5 h-5" />
                            Achievements
                          </CardTitle>
                          <Button asChild variant="outline" size="sm" className="border-gray-200/50 dark:border-gray-700/50">
                            <Link to="/profile" className="flex items-center gap-1">
                              View All
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {currentUser.achievements?.slice(0, 3).map((achievement, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20"
                            >
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Medal className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {achievement.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {format(new Date(achievement.date), "MMM dd, yyyy")}
                                </p>
                                {achievement.description && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    {achievement.description}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 mt-8">
                {/* Sports Preferences */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Dumbbell className="w-5 h-5" />
                            Your Sports
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-400">
                            Sports you're interested in and your skill levels
                          </p>
                        </div>
                        <Button asChild variant="outline" className="border-gray-200/50 dark:border-gray-700/50">
                          <Link to="/profile" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* {currentUser.sportsPreferences.map((sport, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 text-center group bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50"
                          >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Dumbbell className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {sport.sport}
                            </h3>
                            <Badge
                              variant="secondary"
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
                        ))} */}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Profile Stats */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <TrendingUp className="w-5 h-5" />
                        Profile Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/30 dark:border-blue-700/30"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Timer className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.totalEvents * 2}h
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Activity Time
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/30 dark:border-green-700/30"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Heart className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.floor(stats.totalEvents * 1.5)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Events Liked
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/30 dark:border-purple-700/30"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Share2 className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.floor(stats.totalEvents * 0.8)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Events Shared
                          </p>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      {/* Corner Decorative Elements */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </div>
  )
}

export default Dashboard