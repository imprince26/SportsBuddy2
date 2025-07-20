import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
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

  // Cache configuration
  const CACHE_KEY = 'admin_dashboard_analytics'
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
      const token = localStorage.getItem('token')
      const response = await api.get('/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = response.data

      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))

      setAnalytics(data)
      setLastUpdated(new Date())
      setError(null)

      if (forceRefresh) {
        toast.success("Dashboard data refreshed successfully!")
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
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
    document.title = 'Admin Dashboard - SportsBuddy'
  }, [])

  // Calculate growth rates and trends
  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return { rate: 0, trend: 'neutral' }
    const rate = ((current - previous) / previous) * 100
    return {
      rate: Math.abs(rate).toFixed(1),
      trend: rate > 0 ? 'positive' : rate < 0 ? 'negative' : 'neutral'
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
          { label: "This Month", value: analytics.users.thisMonth }
        ]
      },
      {
        title: "Total Events",
        value: analytics.events.total.toString(),
        change: `+${analytics.events.thisMonth}`,
        changeType: analytics.events.thisMonth > 0 ? "positive" : "neutral",
        icon: Calendar,
        color: "purple",
        description: "Created events",
        trend: eventGrowth.trend,
        trendValue: eventGrowth.rate,
        subMetrics: [
          { label: "Active", value: analytics.events.active },
          { label: "Past", value: analytics.events.past }
        ]
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
          { label: "This Month", value: analytics.events.thisMonth }
        ]
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
          { label: "Weekly Active", value: Math.floor(analytics.users.total * 0.45) }
        ]
      }
    ]
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const handleExport = async () => {
    try {
      setRefreshing(true);

      const token = localStorage.getItem('token');
      const response = await api.get('/admin/analytics/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      if (!response || !response.data) {
        throw new Error('Failed to export analytics report');
      }

      // Get the blob from response
      const blob = await response.data;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sportsbuddy-analytics-${new Date().toISOString().split('T')[0]}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Analytics report downloaded successfully!");

    } catch (err) {
      console.error('Error exporting analytics:', err);
      toast.error("Failed to export analytics report");
    } finally {
      setRefreshing(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    }
    return colors[color] || colors.blue
  }

  const StatCardSkeleton = () => (
    <Card className="bg-card-light dark:bg-card-dark border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchAnalytics(true)}>
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
      className="space-y-8"
    >
      {/* Header with Gradient Background */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-light via-primary-light to-secondary-light dark:from-primary-dark dark:via-primary-dark dark:to-secondary-dark p-8 text-white"
      >

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-1">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 text-lg">
                  Welcome back! Here's what's happening with SportsBuddy today.
                </p>
              </div>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

            <Button
              size="sm"
              className="bg-white text-primary-light hover:bg-white/90"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          getStatCards().map((stat, index) => {
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
                <Card className="bg-card-light dark:bg-card-dark border-border hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-light/5 dark:to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: activeMetric === index ? 1 : 0 }}
                            className="w-2 h-2 bg-primary-light dark:bg-primary-dark rounded-full"
                          />
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl ${getColorClasses(stat.color)} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {stat.trend === "positive" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : stat.trend === "negative" ? (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-gray-600" />
                        )}
                        <span className={`text-sm font-medium ${stat.trend === "positive" ? "text-green-600" :
                          stat.trend === "negative" ? "text-red-600" :
                            "text-muted-foreground"
                          }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stat.changeType !== "neutral" ? "today" : "of total"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">{stat.description}</p>

                      {/* Sub-metrics */}
                      <AnimatePresence>
                        {activeMetric === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-border space-y-1"
                          >
                            {stat.subMetrics.map((metric, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{metric.label}:</span>
                                <span className="font-medium text-foreground">{metric.value}</span>
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
          })
        )}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card-light dark:bg-card-dark border border-border p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-xl">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-primary-light dark:data-[state=active]:bg-primary-dark data-[state=active]:text-white rounded-xl">
              <Clock className="w-4 h-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Categories */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          Popular Categories
                        </CardTitle>
                        <CardDescription>Most active sports categories</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))
                    ) : (
                      analytics?.events.byCategory.map((category, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {category._id || 'Other'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {category.count} events
                            </span>
                          </div>
                          <Progress
                            value={(category.count / analytics.events.total) * 100}
                            className="h-2"
                          />
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Users */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-blue-600" />
                          Recent Users
                        </CardTitle>
                        <CardDescription>Latest user registrations</CardDescription>
                      </div>
                      <Link to="/admin/users">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))
                    ) : (
                      analytics?.users.recent.map((user, index) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted-light/30 dark:hover:bg-muted-dark/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Analytics */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      User Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Users</span>
                          <span className="font-semibold">{analytics?.users.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">New Today</span>
                          <span className="font-semibold text-green-600">+{analytics?.users.newToday}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">This Month</span>
                          <span className="font-semibold">{analytics?.users.thisMonth}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">User Roles</p>
                          {analytics?.users.byRole.map((role, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="capitalize">{role._id}:</span>
                              <span>{role.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Analytics */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      Event Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Events</span>
                          <span className="font-semibold">{analytics?.events.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Active</span>
                          <span className="font-semibold text-green-600">{analytics?.events.active}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Completed</span>
                          <span className="font-semibold">{analytics?.events.past}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">This Month</span>
                          <span className="font-semibold">{analytics?.events.thisMonth}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Popular Events */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Popular Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      ))
                    ) : (
                      analytics?.events.popular.slice(0, 3).map((event, index) => (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {event.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                by {event.createdBy?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {event.participants?.length || 0} participants
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarPlus className="w-5 h-5 text-green-600" />
                          Recent Events
                        </CardTitle>
                        <CardDescription>Latest created events</CardDescription>
                      </div>
                      <Link to="/admin/events">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      ))
                    ) : (
                      analytics?.events.recent.map((event, index) => (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                {event.name}
                              </h4>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {event.category || event.sport || 'Event'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location?.city || 'Location TBD'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                by {event.createdBy?.name}
                              </span>
                              <span className="text-muted-foreground">
                                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card-light dark:bg-card-dark border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Most Active Category
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {analytics?.events.byCategory[0]?._id || 'N/A'}
                                ({analytics?.events.byCategory[0]?.count || 0} events)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                User Growth Rate
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                +{((analytics?.users.newToday / analytics?.users.total) * 100).toFixed(2)}% daily
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                              <Activity className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                Event Success Rate
                              </p>
                              <p className="text-xs text-purple-700 dark:text-purple-300">
                                {((analytics?.events.past / analytics?.events.total) * 100).toFixed(1)}% completion
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

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card-light dark:bg-card-dark border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks and shortcuts</CardDescription>
              </div>
              <Badge variant="outline" className="animate-pulse">
                Live Dashboard
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Manage Users",
                  description: "View and edit user accounts",
                  icon: Users,
                  href: "/admin/users",
                  color: "blue"
                },
                {
                  title: "Manage Events",
                  description: "Review and approve events",
                  icon: Calendar,
                  href: "/admin/events",
                  color: "purple"
                },
                {
                  title: "Send Notifications",
                  description: "Broadcast messages to users",
                  icon: Bell,
                  href: "/admin/notifications",
                  color: "green"
                },
                {
                  title: "Advanced Search",
                  description: "Find users and events",
                  icon: Search,
                  href: "/admin/search",
                  color: "orange"
                }
              ].map((action, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to={action.href}>
                    <Button
                      variant="outline"
                      className="w-full bg-background-light/70 dark:bg-background-dark/70 hover:bg-background-light/80 hover:dark:bg-background-dark/30 rounded-xl justify-start h-auto p-4 hover:shadow-lg transition-all duration-300"
                    >
                      <action.icon className="w-5 h-5 mr-3 shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
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