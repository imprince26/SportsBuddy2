import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import {
  Bell,
  BellRing,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Settings,
  RefreshCw,
  ExternalLink,
  Star,
  AlertTriangle,
  Sparkles,
  Filter,
  SortDesc,
  Archive,
  Pin,
  X,
  TrendingUp,
  Zap,
  Shield,
  Heart,
  Bookmark,
  Share2,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday, subDays } from "date-fns";
import api from "@/utils/api";

const Notifications = () => {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    important: 0,
    thisWeek: 0,
    archived: 0,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.4,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const slideVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
  };

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view notifications");
        return;
      }

      const response = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userNotifications = response.data.data.notifications || [];
      
      // Add mock enhanced data for better demonstration
      const enhancedNotifications = userNotifications.map(notification => ({
        ...notification,
        reactions: notification.reactions || [],
        isBookmarked: notification.isBookmarked || false,
        isArchived: notification.isArchived || false,
        isPinned: notification.isPinned || false,
        category: notification.category || 'general',
        estimatedReadTime: notification.estimatedReadTime || '1 min',
      }));

      setNotifications(enhancedNotifications);

      // Calculate enhanced stats
      const todayNotifications = enhancedNotifications.filter(n =>
        isToday(new Date(n.timestamp))
      );
      const thisWeekNotifications = enhancedNotifications.filter(n => {
        const notifDate = new Date(n.timestamp);
        const weekAgo = subDays(new Date(), 7);
        return notifDate >= weekAgo;
      });
      const unreadNotifications = enhancedNotifications.filter(n => !n.read);
      const importantNotifications = enhancedNotifications.filter(n =>
        n.priority === "high"
      );
      const archivedNotifications = enhancedNotifications.filter(n => n.isArchived);

      setStats({
        total: enhancedNotifications.length,
        unread: unreadNotifications.length,
        today: todayNotifications.length,
        important: importantNotifications.length,
        thisWeek: thisWeekNotifications.length,
        archived: archivedNotifications.length,
      });

      if (refresh) {
        toast.success("Notifications refreshed successfully!");
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/auth/notifications/${notificationId}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );

      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));

      toast.success("Marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put("/auth/notifications/read-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );

      setStats(prev => ({ ...prev, unread: 0 }));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'markRead':
          await Promise.all(
            selectedNotifications.map(id => markAsRead(id))
          );
          break;
        case 'delete':
          await Promise.all(
            selectedNotifications.map(id => deleteNotification(id))
          );
          break;
        case 'archive':
          setNotifications(prev =>
            prev.map(n =>
              selectedNotifications.includes(n._id)
                ? { ...n, isArchived: true }
                : n
            )
          );
          toast.success(`${selectedNotifications.length} notifications archived`);
          break;
      }
      
      setSelectedNotifications([]);
      setBulkActionMode(false);
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/auth/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));

      setStats(prev => ({
        total: prev.total - 1,
        unread: deletedNotification && !deletedNotification.read
          ? prev.unread - 1
          : prev.unread,
        today: isToday(new Date(deletedNotification?.timestamp))
          ? prev.today - 1
          : prev.today,
        important: deletedNotification?.priority === "high"
          ? prev.important - 1
          : prev.important,
      }));

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Toggle bookmark
  const toggleBookmark = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n._id === notificationId
          ? { ...n, isBookmarked: !n.isBookmarked }
          : n
      )
    );
    toast.success("Bookmark updated");
  };

  // Toggle pin
  const togglePin = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n._id === notificationId
          ? { ...n, isPinned: !n.isPinned }
          : n
      )
    );
    toast.success("Pin status updated");
  };

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      className: `w-4 h-4 sm:w-5 sm:h-5 ${
        priority === "high" 
          ? "text-red-500" 
          : priority === "medium"
          ? "text-yellow-500"
          : "text-blue-500"
      }`,
    };

    const icons = {
      event: Calendar,
      chat: MessageSquare,
      team: Users,
      system: Settings,
      announcement: BellRing,
      marketing: Sparkles,
      security: Shield,
      update: TrendingUp,
      reminder: Clock,
      achievement: Star,
      social: Heart,
    };

    const IconComponent = icons[type] || Bell;
    return <IconComponent {...iconProps} />;
  };

  // Get notification type color - Fixed with static classes
  const getTypeColor = (type) => {
    const colorMap = {
      event: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
      chat: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      team: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
      system: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
      announcement: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
      marketing: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
      security: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
      update: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
      social: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800",
    };
    return colorMap[type] || colorMap.system;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">High Priority</span>
          <span className="sm:hidden">High</span>
        </Badge>
      );
    }
    if (priority === "medium") {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 text-xs">
          <Zap className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Medium</span>
          <span className="sm:hidden">Med</span>
        </Badge>
      );
    }
    return null;
  };

  // Format notification date
  const formatNotificationDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  // Filter and sort notifications
  const filteredAndSortedNotifications = notifications
    .filter((notification) => {
      if (notification.isArchived && readFilter !== "archived") return false;
      
      const matchesSearch =
        notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || notification.type === typeFilter;
      const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter;

      const matchesRead =
        readFilter === "all" ||
        (readFilter === "read" && notification.read) ||
        (readFilter === "unread" && !notification.read) ||
        (readFilter === "archived" && notification.isArchived);

      return matchesSearch && matchesType && matchesRead && matchesPriority;
    })
    .sort((a, b) => {
      // Always show pinned notifications first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp) - new Date(a.timestamp);
        case "oldest":
          return new Date(a.timestamp) - new Date(b.timestamp);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, normal: 1 };
          return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // Group notifications by date
  const groupedNotifications = filteredAndSortedNotifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp);
    let groupKey;

    if (isToday(date)) {
      groupKey = "Today";
    } else if (isYesterday(date)) {
      groupKey = "Yesterday";
    } else {
      groupKey = format(date, "MMMM dd, yyyy");
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {});

  // Enhanced stats cards data with proper responsive colors
  const getStatsCardColors = (color) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200/20 dark:border-blue-800/20",
        icon: "text-blue-600 dark:text-blue-400"
      },
      red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200/20 dark:border-red-800/20",
        icon: "text-red-600 dark:text-red-400"
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200/20 dark:border-green-800/20",
        icon: "text-green-600 dark:text-green-400"
      },
      yellow: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200/20 dark:border-yellow-800/20",
        icon: "text-yellow-600 dark:text-yellow-400"
      }
    };
    return colorClasses[color] || colorClasses.blue;
  };

  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: Bell,
      color: "blue",
      description: "All notifications",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Unread",
      value: stats.unread,
      icon: BellRing,
      color: "red",
      description: "Require attention",
      change: stats.unread > 0 ? "Active" : "Clear",
      trend: stats.unread > 0 ? "up" : "down",
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      icon: TrendingUp,
      color: "green",
      description: "Past 7 days",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Important",
      value: stats.important,
      icon: Star,
      color: "yellow",
      description: "High priority",
      change: stats.important > 0 ? "Attention" : "None",
      trend: stats.important > 0 ? "up" : "down",
    },
  ];

  // Skeleton component
  const NotificationSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-800/50"
    >
      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="space-y-2 flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 sm:w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-5 w-16 sm:w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-4 sm:p-6 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full -translate-y-32 translate-x-32 sm:-translate-y-48 sm:translate-x-48" />
            
            <div className="relative z-10">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Bell className="w-6 h-6 sm:w-7 sm:h-7" />
                    </motion.div>
                    <div className="min-w-0">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                        Notifications
                      </h1>
                      <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                        Stay connected with your SportsBuddy community
                      </p>
                    </div>
                  </div>

                  {/* Live activity indicator */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                    <span>Live updates enabled</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Auto refresh toggle */}
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <Label htmlFor="auto-refresh" className="text-xs sm:text-sm text-white/90 whitespace-nowrap">
                      Auto-refresh
                    </Label>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm text-xs sm:text-sm"
                    onClick={() => fetchNotifications(true)}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${refreshing ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
                    <span className="sm:hidden">Refresh</span>
                  </Button>

                  {stats.unread > 0 && (
                    <Button
                      size="sm"
                      className="bg-white text-blue-600 hover:bg-white/90 shadow-lg text-xs sm:text-sm"
                      onClick={markAllAsRead}
                    >
                      <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Mark All Read ({stats.unread})</span>
                      <span className="sm:hidden">Mark All ({stats.unread})</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const colors = getStatsCardColors(stat.color);
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-3 sm:p-5 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                            {stat.title}
                          </p>
                          <div className="flex items-end gap-1 sm:gap-2">
                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                              {stat.value}
                            </p>
                            <div className={`flex items-center text-xs px-1.5 py-0.5 rounded ${
                              stat.trend === "up" 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              {stat.change}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {stat.description}
                          </p>
                        </div>
                        <div className={`p-2 sm:p-3 rounded-xl ${colors.bg} ${colors.border} border group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${colors.icon}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Filters and Controls */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Quick filter buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={readFilter === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReadFilter(readFilter === "unread" ? "all" : "unread")}
                    className="h-9 text-xs sm:text-sm"
                  >
                    <BellRing className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Unread</span>
                    <span className="sm:hidden">New</span>
                    {stats.unread > 0 && (
                      <Badge className="ml-1 h-4 text-xs bg-red-500 text-white">
                        {stats.unread}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant={priorityFilter === "high" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
                    className="h-9 text-xs sm:text-sm"
                  >
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Important</span>
                    <span className="sm:hidden">Imp</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Advanced filters toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9 text-xs sm:text-sm"
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Filters
                </Button>

                {/* Sort dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-28 sm:w-32 h-9 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm text-xs sm:text-sm">
                    <SortDesc className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priority">By Priority</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bulk actions */}
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {selectedNotifications.length} selected
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBulkAction('markRead')}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Read
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleBulkAction('delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Type
                        </Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="event">Events</SelectItem>
                            <SelectItem value="chat">Messages</SelectItem>
                            <SelectItem value="team">Teams</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="announcement">Announcements</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Status
                        </Label>
                        <Select value={readFilter} onValueChange={setReadFilter}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Priority
                        </Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="All Priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTypeFilter("all");
                            setReadFilter("all");
                            setPriorityFilter("all");
                            setSearchTerm("");
                          }}
                          className="h-9 w-full text-xs sm:text-sm"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Notifications List */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">Notifications</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {filteredAndSortedNotifications.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      {filteredAndSortedNotifications.length === 0 
                        ? "No notifications match your current filters"
                        : `Showing ${filteredAndSortedNotifications.length} notification${filteredAndSortedNotifications.length !== 1 ? 's' : ''}`
                      }
                    </CardDescription>
                  </div>

                  {filteredAndSortedNotifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkActionMode(!bulkActionMode)}
                        className="text-xs sm:text-sm"
                      >
                        {bulkActionMode ? "Cancel" : "Select"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress indicator for unread notifications */}
                {stats.total > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Read Progress</span>
                      <span>{Math.round(((stats.total - stats.unread) / stats.total) * 100)}%</span>
                    </div>
                    <Progress 
                      value={((stats.total - stats.unread) / stats.total) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="px-0">
                {loading ? (
                  <div className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <NotificationSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredAndSortedNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No notifications found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                      {searchTerm || typeFilter !== "all" || readFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters to find more notifications."
                        : "You're all caught up! New notifications will appear here."}
                    </p>
                    {(searchTerm || typeFilter !== "all" || readFilter !== "all" || priorityFilter !== "all") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setTypeFilter("all");
                          setReadFilter("all");
                          setPriorityFilter("all");
                        }}
                        className="text-xs sm:text-sm"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <ScrollArea className="h-[500px] sm:h-[600px]">
                    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                      {Object.entries(groupedNotifications).map(([dateGroup, notifications]) => (
                        <motion.div
                          key={dateGroup}
                          variants={itemVariants}
                          className="space-y-3"
                        >
                          {/* Date group header */}
                          <div className="flex items-center gap-3 py-2">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {dateGroup}
                            </h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-gray-700 dark:via-gray-800 dark:to-transparent" />
                            <Badge variant="secondary" className="text-xs">
                              {notifications.length}
                            </Badge>
                          </div>

                          {/* Notifications in this group */}
                          <div className="space-y-3">
                            {notifications.map((notification, index) => (
                              <motion.div
                                key={notification._id}
                                variants={slideVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ delay: index * 0.05 }}
                                className={`group relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:shadow-lg ${
                                  notification.read
                                    ? "border-gray-200/50 dark:border-gray-700/50"
                                    : "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10"
                                } ${
                                  notification.isPinned
                                    ? "ring-2 ring-yellow-200 dark:ring-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10"
                                    : ""
                                } ${
                                  selectedNotifications.includes(notification._id)
                                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                                    : ""
                                }`}
                              >
                                {/* Pin indicator */}
                                {notification.isPinned && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Pin className="w-2 h-2 text-white" />
                                  </div>
                                )}

                                <div className="p-3 sm:p-4">
                                  <div className="flex items-start gap-3 sm:gap-4">
                                    {/* Selection checkbox */}
                                    {bulkActionMode && (
                                      <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex-shrink-0 mt-1"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedNotifications.includes(notification._id)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedNotifications(prev => [...prev, notification._id]);
                                            } else {
                                              setSelectedNotifications(prev => 
                                                prev.filter(id => id !== notification._id)
                                              );
                                            }
                                          }}
                                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                      </motion.div>
                                    )}

                                    {/* Notification icon */}
                                    <div className="flex-shrink-0">
                                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                                        notification.read
                                          ? "bg-gray-100 dark:bg-gray-700"
                                          : "bg-blue-100 dark:bg-blue-900/20"
                                      }`}>
                                        {getNotificationIcon(notification.type, notification.priority)}
                                      </div>
                                    </div>

                                    {/* Notification content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          {/* Title and badges */}
                                          <div className="flex items-start gap-2 mb-2 flex-wrap">
                                            <h4 className={`text-sm font-semibold leading-tight ${
                                              notification.read
                                                ? "text-gray-700 dark:text-gray-300"
                                                : "text-gray-900 dark:text-white"
                                            }`}>
                                              {notification.title || "New Notification"}
                                            </h4>
                                            <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                                              {getPriorityBadge(notification.priority)}
                                              <Badge
                                                variant="outline"
                                                className={`text-xs ${getTypeColor(notification.type)}`}
                                              >
                                                {notification.type}
                                              </Badge>
                                              {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                              )}
                                            </div>
                                          </div>

                                          {/* Message */}
                                          <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${
                                            notification.read
                                              ? "text-gray-600 dark:text-gray-400"
                                              : "text-gray-700 dark:text-gray-300"
                                          }`}>
                                            {notification.message}
                                          </p>

                                          {/* Metadata and actions */}
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                                              <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{formatNotificationDate(notification.timestamp)}</span>
                                              </div>
                                              {notification.estimatedReadTime && (
                                                <div className="flex items-center gap-1">
                                                  <Eye className="w-3 h-3 flex-shrink-0" />
                                                  <span>{notification.estimatedReadTime}</span>
                                                </div>
                                              )}
                                              {notification.category && (
                                                <div className="flex items-center gap-1">
                                                  <span>#{notification.category}</span>
                                                </div>
                                              )}
                                            </div>

                                            {/* Quick actions */}
                                            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                              {/* Bookmark */}
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 sm:h-7 sm:w-7"
                                                onClick={() => toggleBookmark(notification._id)}
                                              >
                                                <Bookmark
                                                  className={`w-3 h-3 ${
                                                    notification.isBookmarked
                                                      ? "fill-yellow-400 text-yellow-400"
                                                      : "text-gray-400"
                                                  }`}
                                                />
                                              </Button>

                                              {/* Pin */}
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 sm:h-7 sm:w-7"
                                                onClick={() => togglePin(notification._id)}
                                              >
                                                <Pin
                                                  className={`w-3 h-3 ${
                                                    notification.isPinned
                                                      ? "fill-yellow-400 text-yellow-400"
                                                      : "text-gray-400"
                                                  }`}
                                                />
                                              </Button>

                                              {/* Share */}
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 sm:h-7 sm:w-7"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(notification.message);
                                                  toast.success("Copied to clipboard!");
                                                }}
                                              >
                                                <Share2 className="w-3 h-3 text-gray-400" />
                                              </Button>
                                            </div>
                                          </div>

                                          {/* Action buttons for certain notification types */}
                                          {(notification.type === 'event' || notification.actionUrl) && (
                                            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-7 text-xs"
                                                  onClick={() => {
                                                    setSelectedNotification(notification);
                                                    setShowDetailDialog(true);
                                                  }}
                                                >
                                                  <ExternalLink className="w-3 h-3 mr-1" />
                                                  <span className="hidden sm:inline">View Details</span>
                                                  <span className="sm:hidden">View</span>
                                                </Button>
                                                {notification.type === 'event' && (
                                                  <Button
                                                    size="sm"
                                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                                  >
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    RSVP
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Reactions display */}
                                          {notification.reactions && notification.reactions.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                              <div className="flex items-center gap-2">
                                                <div className="flex items-center -space-x-1">
                                                  {notification.reactions.slice(0, 3).map((reaction, i) => (
                                                    <div
                                                      key={i}
                                                      className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white dark:border-gray-800"
                                                    >
                                                      {reaction.emoji || "👍"}
                                                    </div>
                                                  ))}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {notification.reactions.length} reaction{notification.reactions.length !== 1 ? 's' : ''}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                                                            {/* Actions dropdown */}
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 sm:h-8 sm:w-8 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            >
                                              <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-48">
                                            {!notification.read ? (
                                              <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                                <Check className="w-4 h-4 mr-2" />
                                                Mark as Read
                                              </DropdownMenuItem>
                                            ) : (
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  setNotifications(prev =>
                                                    prev.map(n =>
                                                      n._id === notification._id ? { ...n, read: false } : n
                                                    )
                                                  );
                                                }}
                                              >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Mark as Unread
                                              </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setSelectedNotification(notification);
                                                setShowDetailDialog(true);
                                              }}
                                            >
                                              <ExternalLink className="w-4 h-4 mr-2" />
                                              View Details
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => toggleBookmark(notification._id)}>
                                              <Bookmark className="w-4 h-4 mr-2" />
                                              {notification.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => togglePin(notification._id)}>
                                              <Pin className="w-4 h-4 mr-2" />
                                              {notification.isPinned ? "Unpin" : "Pin"}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                              onClick={() => {
                                                setNotifications(prev =>
                                                  prev.map(n =>
                                                    n._id === notification._id
                                                      ? { ...n, isArchived: !n.isArchived }
                                                      : n
                                                  )
                                                );
                                                toast.success(
                                                  notification.isArchived ? "Unarchived" : "Archived"
                                                );
                                              }}
                                            >
                                              <Archive className="w-4 h-4 mr-2" />
                                              {notification.isArchived ? "Unarchive" : "Archive"}
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                              onClick={() => deleteNotification(notification._id)}
                                              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Detail Dialog */}
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  {selectedNotification && getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
                  <span className="truncate">{selectedNotification?.title || "Notification Details"}</span>
                  {selectedNotification && (
                    <div className="flex items-center gap-2 ml-auto">
                      {getPriorityBadge(selectedNotification.priority)}
                      <Badge
                        variant="outline"
                        className={`text-xs ${selectedNotification ? getTypeColor(selectedNotification.type) : ''}`}
                      >
                        {selectedNotification.type}
                      </Badge>
                    </div>
                  )}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotification && formatNotificationDate(selectedNotification.timestamp)}
                </DialogDescription>
              </DialogHeader>

              {selectedNotification && (
                <div className="space-y-4 py-4">
                  {/* Message content */}
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                        {selectedNotification.message}
                      </p>
                    </div>

                    {/* Additional details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Read time: {selectedNotification.estimatedReadTime}</span>
                        </div>
                        {selectedNotification.category && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span>Category: #{selectedNotification.category}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Eye className="w-3 h-3" />
                          <span>Status: {selectedNotification.read ? "Read" : "Unread"}</span>
                        </div>
                        {selectedNotification.isPinned && (
                          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <Pin className="w-3 h-3" />
                            <span>Pinned</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {selectedNotification.reactions && selectedNotification.reactions.length > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reactions ({selectedNotification.reactions.length})
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedNotification.reactions.map((reaction, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs"
                            >
                              <span>{reaction.emoji || "👍"}</span>
                              <span className="text-gray-600 dark:text-gray-400">{reaction.count || 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                  className="text-xs sm:text-sm"
                >
                  Close
                </Button>
                {selectedNotification && !selectedNotification.read && (
                  <Button
                    onClick={() => {
                      markAsRead(selectedNotification._id);
                      setShowDetailDialog(false);
                    }}
                    className="text-xs sm:text-sm"
                  >
                    Mark as Read
                  </Button>
                )}
                {selectedNotification && selectedNotification.actionUrl && (
                  <Button
                    onClick={() => {
                      window.open(selectedNotification.actionUrl, '_blank');
                      setShowDetailDialog(false);
                    }}
                    className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Link
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
