"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import toast from "react-hot-toast"
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  Award,
  Star,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
  Search,
  Download,
  Zap,
  Sparkles,
  Crown,
  ChevronRight,
  BarChart3,
  Menu,
  Building2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import api from "@/utils/api"

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const [activeMetric, setActiveMetric] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Cache configuration
  const CACHE_KEY = "admin_dashboard_analytics"
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Fetch analytics data with caching
  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            setAnalytics(data)
            setLastUpdated(new Date(timestamp))
            setLoading(false)
            return
          }
        }
      }

      setRefreshing(forceRefresh)
      const token = localStorage.getItem("token")
      const response = await api.get("/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = response.data

      // Cache the data
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      )

      setAnalytics(data)
      setLastUpdated(new Date())
      setError(null)
      if (forceRefresh) {
        toast.success("Dashboard data refreshed successfully!")
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      setError(err.message)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  // Dynamic page title
  useEffect(() => {
    document.title = "Admin Dashboard - SportsBuddy"
  }, [])

  // Calculate growth rates and trends
  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return { rate: 0, trend: "neutral" }
    const rate = ((current - previous) / previous) * 100
    return {
      rate: Math.abs(rate).toFixed(1),
      trend: rate > 0 ? "positive" : rate < 0 ? "negative" : "neutral",
    }
  }

  // Prepare stat cards data
  const getStatCards = () => {
    if (!analytics) return []
    const userGrowth = calculateGrowthRate(analytics.users.newToday, 5) // Assuming baseline
    const eventGrowth = calculateGrowthRate(analytics.events.thisMonth, 15) // Assuming baseline

    return [
      {
        title: "Total Users",
        value: analytics.users.total.toLocaleString(),
        change: `+${analytics.users.newToday}`,
        changeType: analytics.users.newToday > 0 ? "positive" : "neutral",
        icon: Users,
        color: "blue",
        description: "Registered users",
        trend: userGrowth.trend,
        trendValue: userGrowth.rate,
        subMetrics: [
          { label: "Today", value: analytics.users.newToday },
          { label: "This Month", value: analytics.users.thisMonth },
        ],
      },
      {
        title: "Total Events",
        value: analytics.events.total.toString(),
        change: `+${analytics.events.thisMonth}`,
        changeType: analytics.events.thisMonth > 0 ? "positive" : "neutral",
        icon: Calendar,
        color: "indigo",
        description: "Created events",
        trend: eventGrowth.trend,
        trendValue: eventGrowth.rate,
        subMetrics: [
          { label: "Active", value: analytics.events.active },
          { label: "Past", value: analytics.events.past },
        ],
      },
      {
        title: "Active Events",
        value: analytics.events.active.toString(),
        change: `${((analytics.events.active / analytics.events.total) * 100).toFixed(1)}%`,
        changeType: "neutral",
        icon: Activity,
        color: "green",
        description: "Currently active",
        trend: "positive",
        trendValue: "12.5",
        subMetrics: [
          { label: "Upcoming", value: analytics.events.active },
          { label: "This Month", value: analytics.events.thisMonth },
        ],
      },
      {
        title: "User Engagement",
        value: "89.2%",
        change: "+2.1%",
        changeType: "positive",
        icon: TrendingUp,
        color: "orange",
        description: "Platform engagement",
        trend: "positive",
        trendValue: "2.1",
        subMetrics: [
          { label: "Daily Active", value: Math.floor(analytics.users.total * 0.15) },
          { label: "Weekly Active", value: Math.floor(analytics.users.total * 0.45) },
        ],
      },
    ]
  }

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

  const handleExport = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/export", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to export analytics")
      }
      // Get the blob from response
      const blob = await response.blob()
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `sportsbuddy-analytics-${new Date().toISOString().split("T")[0]}.pdf`
      // Trigger download
      document.body.appendChild(link)
      link.click()
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Analytics report downloaded successfully!")
    } catch (err) {
      console.error("Error exporting analytics:", err)
      toast.error("Failed to export analytics report")
    } finally {
      setRefreshing(false)
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20 dark:border-blue-700/20",
      indigo:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200/20 dark:border-indigo-700/20",
      green:
        "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200/20 dark:border-green-700/20",
      orange:
        "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200/20 dark:border-orange-700/20",
    }
    return colors[color] || colors.blue
  }

  const StatCardSkeleton = () => (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  )

  // Mobile Controls Component
  const MobileControls = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Dashboard Controls</SheetTitle>
          <SheetDescription>Quick actions and settings for your admin dashboard</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => {
              fetchAnalytics(true)
              setMobileMenuOpen(false)
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => {
              handleExport()
              setMobileMenuOpen(false)
            }}
            disabled={refreshing}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Quick Navigation</p>
            <div className="space-y-2">
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/events" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
              </Link>
              <Link to="/admin/venues" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Venues
                </Button>
              </Link>
              <Link to="/admin/analytics" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4"
      >
        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 max-w-md">{error}</p>
          <Button onClick={() => fetchAnalytics(true)} className="bg-blue-600 hover:bg-blue-700">
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
      className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0"
    >
      {/* Header with Gradient Background - Fully Responsive */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 text-white shadow-xl"
      >
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

        <div className="relative z-10 flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 leading-tight">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Welcome back! Here's what's happening with SportsBuddy today.
                </p>
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-3 z-10 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90"
              onClick={handleExport}
              disabled={refreshing}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden justify-end">
            <MobileControls />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Fully Responsive Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
          : getStatCards().map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setActiveMetric(index)}
                onHoverEnd={() => setActiveMetric(null)}
              >
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                          {stat.title}
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                            {stat.value}
                          </p>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: activeMetric === index ? 1 : 0 }}
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0"
                          />
                        </div>
                      </div>
                      <div
                        className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-transform duration-300 group-hover:scale-110 shrink-0 ${getColorClasses(stat.color)}`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {stat.trend === "positive" ? (
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
                        ) : stat.trend === "negative" ? (
                          <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 shrink-0" />
                        ) : (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 shrink-0" />
                        )}
                        <span
                          className={`text-xs sm:text-sm font-medium truncate ${stat.trend === "positive"
                              ? "text-green-600"
                              : stat.trend === "negative"
                                ? "text-red-600"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {stat.changeType !== "neutral" ? "today" : "of total"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stat.description}</p>

                      {/* Sub-metrics - Hidden on mobile, shown on hover for larger screens */}
                      <AnimatePresence>
                        {activeMetric === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="hidden sm:block pt-2 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1"
                          >
                            {stat.subMetrics.map((metric, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 truncate">{metric.label}:</span>
                                <span className="font-medium text-gray-900 dark:text-white shrink-0">
                                  {metric.value}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
      </motion.div>

      {/* Main Content Tabs - Mobile Optimized */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 p-1 rounded-xl w-full flex justify-evenly sm:w-auto md:inline-flex">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Recent
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Popular Categories - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                          <span className="truncate">Popular Categories</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          Most active sports categories
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8 sm:w-10 sm:h-10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {loading
                      ? Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700" />
                            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700" />
                          </div>
                          <Skeleton className="h-2 w-full bg-gray-200 dark:bg-gray-700" />
                        </div>
                      ))
                      : analytics?.events.byCategory.map((category, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize truncate">
                              {category._id || "Other"}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 shrink-0">
                              {category.count} events
                            </span>
                          </div>
                          <Progress value={(category.count / analytics.events.total) * 100} className="h-2" />
                        </motion.div>
                      ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Users - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                          <span className="truncate">Recent Users</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          Latest user registrations
                        </CardDescription>
                      </div>
                      <Link to="/admin/users">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View All</span>
                          <span className="sm:hidden">All</span>
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {loading
                      ? Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700" />
                            <Skeleton className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>
                      ))
                      : analytics?.users.recent.map((user, index) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-white/20 dark:ring-gray-700/20 shrink-0">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold text-xs sm:text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={`${user.role === "admin" ? "bg-blue-600 text-white" : ""} text-xs px-2 py-1 shrink-0`}
                          >
                            {user.role}
                          </Badge>
                        </motion.div>
                      ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* User Analytics - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                      <span className="truncate">User Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-3 sm:h-4 w-full bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-3 sm:h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-3 sm:h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {analytics?.users.total}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">New Today</span>
                          <span className="font-semibold text-green-600 text-xs sm:text-sm">
                            +{analytics?.users.newToday}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This Month</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {analytics?.users.thisMonth}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">User Roles</p>
                          {analytics?.users.byRole.map((role, index) => (
                            <div key={index} className="flex justify-between text-xs sm:text-sm">
                              <span className="capitalize text-gray-600 dark:text-gray-400">{role._id}:</span>
                              <span className="text-gray-900 dark:text-white">{role.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Analytics - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                      <span className="truncate">Event Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-3 sm:h-4 w-full bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-3 sm:h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-3 sm:h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {analytics?.events.total}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active</span>
                          <span className="font-semibold text-green-600 text-xs sm:text-sm">
                            {analytics?.events.active}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {analytics?.events.past}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This Month</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {analytics?.events.thisMonth}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Popular Events - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                      <span className="truncate">Popular Events</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading
                      ? Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-3 sm:h-4 w-full bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-2 sm:h-3 w-2/3 bg-gray-200 dark:bg-gray-700" />
                        </div>
                      ))
                      : analytics?.events.popular.slice(0, 3).map((event, index) => (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-2 sm:p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 bg-gray-50/50 dark:bg-gray-800/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                {event.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                by {event.createdBy?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  {event.participants?.length || 0} participants
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Events - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                          <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                          <span className="truncate">Recent Events</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          Latest created events
                        </CardDescription>
                      </div>
                      <Link to="/admin/events">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View All</span>
                          <span className="sm:hidden">All</span>
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <ScrollArea className="h-64 sm:h-80">
                      {loading
                        ? Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="space-y-2 mb-4">
                            <Skeleton className="h-3 sm:h-4 w-full bg-gray-200 dark:bg-gray-700" />
                            <Skeleton className="h-2 sm:h-3 w-2/3 bg-gray-200 dark:bg-gray-700" />
                            <Skeleton className="h-2 sm:h-3 w-1/3 bg-gray-200 dark:bg-gray-700" />
                          </div>
                        ))
                        : analytics?.events.recent.map((event, index) => (
                          <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-2 sm:p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300 mb-3 bg-gray-50/50 dark:bg-gray-800/50"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
                                  {event.name}
                                </h4>
                                <Badge variant="outline" className="text-xs shrink-0 px-2 py-0.5">
                                  {event.category || event.sport || "Event"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{event.location?.city || "Location TBD"}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400 truncate">
                                  by {event.createdBy?.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-500 shrink-0">
                                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Insights - Mobile Optimized */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                      <span className="truncate">Quick Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 sm:h-16 w-full bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-12 sm:h-16 w-full bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-12 sm:h-16 w-full bg-gray-200 dark:bg-gray-700" />
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                                Most Active Category
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                                {analytics?.events.byCategory[0]?._id || "N/A"}(
                                {analytics?.events.byCategory[0]?.count || 0} events)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200/50 dark:border-green-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                                User Growth Rate
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                +
                                {analytics?.users.total
                                  ? ((analytics?.users.newToday / analytics?.users.total) * 100).toFixed(2)
                                  : 0}
                                % daily
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border border-indigo-200/50 dark:border-indigo-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-indigo-900 dark:text-indigo-100">
                                Event Success Rate
                              </p>
                              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                {analytics?.events.total
                                  ? ((analytics?.events.past / analytics?.events.total) * 100).toFixed(1)
                                  : 0}
                                % completion
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Quick Actions - Fully Responsive */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                  <span className="truncate">Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Common administrative tasks and shortcuts
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="animate-pulse bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 shrink-0"
              >
                Live Dashboard
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  title: "Manage Users",
                  description: "View and edit user accounts",
                  icon: Users,
                  href: "/admin/users",
                  color: "blue",
                },
                {
                  title: "Manage Events",
                  description: "Review and approve events",
                  icon: Calendar,
                  href: "/admin/events",
                  color: "indigo",
                },
                {
                  title: "Manage Venues",
                  description: "Create and manage venues",
                  icon: Building2,
                  href: "/admin/venues",
                  color: "purple",
                },
                {
                  title: "Send Notifications",
                  description: "Broadcast messages to users",
                  icon: Bell,
                  href: "/admin/notifications",
                  color: "green",
                },
                {
                  title: "Advanced Search",
                  description: "Find users and events",
                  icon: Search,
                  href: "/admin/search",
                  color: "orange",
                },
              ].map((action, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to={action.href}>
                    <Button
                      variant="outline"
                      className="w-full bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl justify-start h-auto p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border-gray-200/50 dark:border-gray-700/50"
                    >
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 shrink-0 text-gray-700 dark:text-gray-300" />
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                          {action.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{action.description}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto text-gray-400 shrink-0" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboard
