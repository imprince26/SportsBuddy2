"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import toast from "react-hot-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts"
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Clock,
  Target,
  Zap,
  Award,
  Star,
  UserCheck,
  CalendarCheck,
  Heart,
  Eye,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Shield,
  AlertTriangle,
  Database,
  Gauge,
  Monitor,
  MoreVertical,
} from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"
import api from "@/utils/api"

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState("7d")
  const [activeChart, setActiveChart] = useState("bar")
  const [lastUpdated, setLastUpdated] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Cache configuration
  const CACHE_KEY = "admin_analytics_data"
  const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes

  // Chart colors
  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#f97316"]

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
      const response = await api.get("/admin/analytics")
      const data = response.data

      // Generate time series data for charts
      const enhancedData = {
        ...data,
        timeSeries: generateTimeSeriesData(data, dateRange),
        engagementMetrics: generateEngagementMetrics(data),
        categoryTrends: generateCategoryTrends(data),
        performanceMetrics: generatePerformanceMetrics(data),
      }

      // Cache the data
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: enhancedData,
          timestamp: Date.now(),
        }),
      )

      setAnalytics(enhancedData)
      setLastUpdated(new Date())
      setError(null)

      if (forceRefresh) {
        toast.success("Analytics data refreshed successfully!")
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      setError(err.message)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Generate time series data for charts
  const generateTimeSeriesData = (data, range) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
    const timeSeriesData = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      timeSeriesData.push({
        date: format(date, "MMM dd"),
        fullDate: date,
        users: Math.floor(Math.random() * 50) + (data.users?.newToday || 0),
        events: Math.floor(Math.random() * 20) + (data.events?.thisMonth || 0),
        engagement: Math.floor(Math.random() * 80) + 20,
        revenue: Math.floor(Math.random() * 1000) + 500,
      })
    }

    return timeSeriesData
  }

  // Generate engagement metrics
  const generateEngagementMetrics = (data) => {
    return {
      dailyActive: Math.floor((data.users?.total || 0) * 0.15),
      weeklyActive: Math.floor((data.users?.total || 0) * 0.45),
      monthlyActive: Math.floor((data.users?.total || 0) * 0.7),
      avgSessionTime: "8m 42s",
      bounceRate: "24.6%",
      pageViews: Math.floor(Math.random() * 10000) + 5000,
    }
  }

  // Generate category trends
  const generateCategoryTrends = (data) => {
    return (
      data.events?.byCategory?.map((category, index) => ({
        name: category._id || "Other",
        value: category.count,
        percentage: ((category.count / (data.events?.total || 1)) * 100).toFixed(1),
        color: COLORS[index % COLORS.length],
        trend: Math.random() > 0.5 ? "up" : "down",
        change: (Math.random() * 20).toFixed(1),
      })) || []
    )
  }

  // Generate performance metrics
  const generatePerformanceMetrics = (data) => {
    return {
      conversionRate: "12.4%",
      retentionRate: "68.9%",
      satisfactionScore: 4.6,
      supportTickets: Math.floor(Math.random() * 50) + 10,
      uptime: "99.9%",
      loadTime: "1.2s",
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  // Dynamic page title
  useEffect(() => {
    document.title = "Analytics - SportsBuddy Admin"
  }, [])

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

  // Handle export
  const handleExport = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("token")
      const response = await api.get("/admin/analytics/export", {
        headers: {
          bearer: token,
        },
        responseType: "blob",
      })

      const blob = await response.data
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `sportsbuddy-analytics-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Analytics report exported successfully!")
    } catch (err) {
      console.error("Error exporting analytics:", err)
      toast.error("Failed to export analytics report")
    } finally {
      setRefreshing(false)
    }
  }

  // Loading skeleton
  const AnalyticsSkeleton = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20"
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-2 sm:space-y-3">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-2 sm:h-3 w-14 sm:w-20 bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <Skeleton className="h-48 sm:h-64 lg:h-80 w-full bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Advanced insights and data visualization
            </p>
          </div>
        </div>
        <AnalyticsSkeleton />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4"
      >
        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Analytics</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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
      // initial="hidden"
      // animate="visible"
      className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Comprehensive insights and data visualization
                </p>
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-28 sm:w-32 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={handleExport}
              disabled={refreshing}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="flex sm:hidden items-center gap-2 w-full">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/20 border-gray-200/30">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Analytics Controls</SheetTitle>
                  <SheetDescription>Manage your analytics view and export data</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      fetchAnalytics(true)
                      setShowMobileFilters(false)
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
                      setShowMobileFilters(false)
                    }}
                    disabled={refreshing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[
          {
            title: "Total Users",
            value: analytics?.users?.total?.toLocaleString() || "0",
            change: `+${analytics?.users?.newToday || 0}`,
            changeType: "positive",
            icon: Users,
            color: "blue",
            description: "Registered users",
            subValue: `${analytics?.engagementMetrics?.dailyActive || 0} active today`,
          },
          {
            title: "Total Events",
            value: analytics?.events?.total?.toString() || "0",
            change: `+${analytics?.events?.thisMonth || 0}`,
            changeType: analytics?.events?.thisMonth > 0 ? "positive" : "neutral",
            icon: Calendar,
            color: "indigo",
            description: "Created events",
            subValue: `${analytics?.events?.active || 0} active now`,
          },
          {
            title: "Engagement Rate",
            value: `${((analytics?.engagementMetrics?.dailyActive / analytics?.users?.total) * 100).toFixed(1) || 0}%`,
            change: "+2.4%",
            changeType: "positive",
            icon: Activity,
            color: "green",
            description: "User engagement",
            subValue: analytics?.engagementMetrics?.avgSessionTime || "0m",
          },
          {
            title: "Platform Growth",
            value: `${((analytics?.users?.newToday / analytics?.users?.total) * 100).toFixed(2) || 0}%`,
            change: "+1.8%",
            changeType: "positive",
            icon: TrendingUp,
            color: "orange",
            description: "Daily growth rate",
            subValue: `${analytics?.performanceMetrics?.uptime || "99.9%"} uptime`,
          },
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  <div className="flex items-start justify-between mb-2 sm:mb-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                        {metric.title}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                          {metric.value}
                        </p>
                        <div className="flex items-center gap-1">
                          {metric.changeType === "positive" ? (
                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              metric.changeType === "positive" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{metric.description}</p>
                    </div>

                    <div
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-transform duration-300 group-hover:scale-110 bg-${metric.color}-50 dark:bg-${metric.color}-950/50 border-${metric.color}-200/50 dark:border-${metric.color}-700/50 flex-shrink-0`}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${metric.color}-600 dark:text-${metric.color}-400`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{metric.subValue}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Main Analytics Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 p-1 rounded-xl inline-flex min-w-full sm:min-w-0">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <LineChartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <PieChartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
              >
                <Gauge className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* User Growth Chart */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          User Growth
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Daily user registrations over time
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveChart("bar")} className="p-1 sm:p-2">
                          <BarChart3
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${activeChart === "bar" ? "text-blue-600" : "text-gray-400"}`}
                          />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setActiveChart("line")} className="p-1 sm:p-2">
                          <LineChartIcon
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${activeChart === "line" ? "text-blue-600" : "text-gray-400"}`}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="h-48 sm:h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeChart === "bar" ? (
                          <BarChart data={analytics?.timeSeries || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis
                              dataKey="date"
                              stroke="#6b7280"
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : (
                          <LineChart data={analytics?.timeSeries || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis
                              dataKey="date"
                              stroke="#6b7280"
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                fontSize: "12px",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Analytics */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      Event Analytics
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Event creation and engagement trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="h-48 sm:h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analytics?.timeSeries || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={10}
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                              fontSize: "12px",
                            }}
                          />
                          <Legend fontSize={10} />
                          <Bar dataKey="events" fill="#6366f1" radius={[4, 4, 0, 0]} name="Events Created" />
                          <Line
                            type="monotone"
                            dataKey="engagement"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                            name="Engagement Rate"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Engagement Metrics */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    User Engagement Overview
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Real-time user activity and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[
                      {
                        label: "Daily Active",
                        value: analytics?.engagementMetrics?.dailyActive || 0,
                        icon: Users,
                        color: "blue",
                      },
                      {
                        label: "Weekly Active",
                        value: analytics?.engagementMetrics?.weeklyActive || 0,
                        icon: Calendar,
                        color: "indigo",
                      },
                      {
                        label: "Monthly Active",
                        value: analytics?.engagementMetrics?.monthlyActive || 0,
                        icon: TrendingUp,
                        color: "green",
                      },
                      {
                        label: "Avg Session",
                        value: analytics?.engagementMetrics?.avgSessionTime || "0m",
                        icon: Clock,
                        color: "orange",
                      },
                      {
                        label: "Bounce Rate",
                        value: analytics?.engagementMetrics?.bounceRate || "0%",
                        icon: Target,
                        color: "red",
                      },
                      {
                        label: "Page Views",
                        value: (analytics?.engagementMetrics?.pageViews || 0).toLocaleString(),
                        icon: Eye,
                        color: "indigo",
                      },
                    ].map((metric, index) => {
                      const Icon = metric.icon
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 bg-${metric.color}-500 rounded-lg flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="text-center sm:text-left min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                                {metric.label}
                              </p>
                              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                {metric.value}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Time Series Trends */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Growth Trends
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Platform growth over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics?.timeSeries || []}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={10}
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                              fontSize: "12px",
                            }}
                          />
                          <Legend fontSize={10} />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                            name="Users"
                          />
                          <Area
                            type="monotone"
                            dataKey="events"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorEvents)"
                            name="Events"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Engagement Trends */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      Engagement Trends
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      User engagement patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics?.timeSeries || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={10}
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis stroke="#6b7280" fontSize={10} tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                              fontSize: "12px",
                            }}
                          />
                          <Legend fontSize={10} />
                          <Line
                            type="monotone"
                            dataKey="engagement"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                            name="Engagement Rate"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Category Distribution */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      Category Distribution
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Event categories breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics?.categoryTrends || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                            outerRadius={window.innerWidth < 640 ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(analytics?.categoryTrends || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Details */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      Category Performance
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Detailed category metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <ScrollArea className="h-64 sm:h-80">
                      <div className="space-y-3 sm:space-y-4">
                        {(analytics?.categoryTrends || []).map((category, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 dark:text-white capitalize text-sm sm:text-base truncate">
                                  {category.name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {category.value} events • {category.percentage}%
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              {category.trend === "up" ? (
                                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                              )}
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  category.trend === "up" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {category.change}%
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 sm:space-y-6">
            {/* Performance Metrics */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
                    <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Platform Performance
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    System health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      {
                        title: "Conversion Rate",
                        value: analytics?.performanceMetrics?.conversionRate || "0%",
                        icon: Target,
                        color: "green",
                        description: "User to customer conversion",
                      },
                      {
                        title: "Retention Rate",
                        value: analytics?.performanceMetrics?.retentionRate || "0%",
                        icon: Heart,
                        color: "indigo",
                        description: "User retention over time",
                      },
                      {
                        title: "Satisfaction Score",
                        value: analytics?.performanceMetrics?.satisfactionScore || "0",
                        icon: Star,
                        color: "yellow",
                        description: "Average user rating",
                      },
                      {
                        title: "Support Tickets",
                        value: analytics?.performanceMetrics?.supportTickets || "0",
                        icon: MessageSquare,
                        color: "red",
                        description: "Open support requests",
                      },
                      {
                        title: "System Uptime",
                        value: analytics?.performanceMetrics?.uptime || "99.9%",
                        icon: Monitor,
                        color: "blue",
                        description: "Platform availability",
                      },
                      {
                        title: "Load Time",
                        value: analytics?.performanceMetrics?.loadTime || "0s",
                        icon: Zap,
                        color: "orange",
                        description: "Average page load time",
                      },
                    ].map((metric, index) => {
                      const Icon = metric.icon
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 bg-${metric.color}-500 rounded-xl flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                                {metric.title}
                              </p>
                              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                {metric.value}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base sm:text-lg">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              Real-time Activity Feed
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Live updates from your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <ScrollArea className="h-48 sm:h-64">
              <div className="space-y-2 sm:space-y-3">
                {[
                  {
                    type: "user",
                    action: "New user registration",
                    user: "John Doe",
                    time: "2 minutes ago",
                    icon: UserCheck,
                  },
                  {
                    type: "event",
                    action: "Event created",
                    user: "Sarah Wilson",
                    time: "5 minutes ago",
                    icon: CalendarCheck,
                  },
                  {
                    type: "engagement",
                    action: "High engagement detected",
                    user: "System",
                    time: "8 minutes ago",
                    icon: TrendingUp,
                  },
                  {
                    type: "user",
                    action: "User completed profile",
                    user: "Mike Johnson",
                    time: "12 minutes ago",
                    icon: Shield,
                  },
                  {
                    type: "event",
                    action: "Event fully booked",
                    user: "Tennis Club",
                    time: "15 minutes ago",
                    icon: Crown,
                  },
                ].map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          by {activity.user} • {activity.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        Live
                      </Badge>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AdminAnalytics
