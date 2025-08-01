import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import api from "@/utils/api";

const Notifications = () => {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    important: 0,
  });

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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

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
      setNotifications(userNotifications);

      // Calculate stats
      const todayNotifications = userNotifications.filter(n =>
        isToday(new Date(n.timestamp))
      );
      const unreadNotifications = userNotifications.filter(n => !n.read);
      const importantNotifications = userNotifications.filter(n =>
        n.priority === "high"
      );

      setStats({
        total: userNotifications.length,
        unread: unreadNotifications.length,
        today: todayNotifications.length,
        important: importantNotifications.length,
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
      await api.put(
        `/auth/notifications/${notificationId}/read`
      );

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
      await api.put(
        "/auth/notifications/read-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      className: `w-5 h-5 ${priority === "high" ? "text-red-500" : "text-blue-500"}`,
    };

    switch (type) {
      case "event":
        return <Calendar {...iconProps} />;
      case "chat":
        return <MessageSquare {...iconProps} />;
      case "team":
        return <Users {...iconProps} />;
      case "system":
        return <Settings {...iconProps} />;
      case "announcement":
        return <BellRing {...iconProps} />;
      case "marketing":
        return <Sparkles {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Get notification type color
  const getTypeColor = (type) => {
    switch (type) {
      case "event":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "chat":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "team":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
      case "system":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      case "announcement":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "marketing":
        return "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          High Priority
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

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || notification.type === typeFilter;

    const matchesRead =
      readFilter === "all" ||
      (readFilter === "read" && notification.read) ||
      (readFilter === "unread" && !notification.read);

    return matchesSearch && matchesType && matchesRead;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
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

  // Stats cards data
  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: Bell,
      color: "blue",
      description: "All notifications",
    },
    {
      title: "Unread",
      value: stats.unread,
      icon: BellRing,
      color: "red",
      description: "Require attention",
    },
    {
      title: "Today",
      value: stats.today,
      icon: Clock,
      color: "green",
      description: "Received today",
    },
    {
      title: "Important",
      value: stats.important,
      icon: Star,
      color: "yellow",
      description: "High priority",
    },
  ];

  // Skeleton component
  const NotificationSkeleton = () => (
    <div className="flex items-start space-x-4 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
      <Skeleton className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700" />
      </div>
      <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700" />
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 text-white shadow-2xl"
        >


          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">
                      Notifications
                    </h1>
                    <p className="text-white/90 text-sm lg:text-base">
                      Stay updated with your latest activities
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  onClick={() => fetchNotifications(true)}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>

                {stats.unread > 0 && (
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-white/90"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 border border-${stat.color}-200/20 dark:border-${stat.color}-800/20`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 p-1 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <BellRing className="w-4 h-4 mr-2" />
                  Unread {stats.unread > 0 && `(${stats.unread})`}
                </TabsTrigger>
                <TabsTrigger
                  value="important"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Important
                </TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="chat">Messages</SelectItem>
                    <SelectItem value="team">Teams</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={readFilter} onValueChange={setReadFilter}>
                  <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    All Notifications ({filteredNotifications.length})
                  </CardTitle>
                  <CardDescription>
                    Your complete notification history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <NotificationSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No notifications found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm || typeFilter !== "all" || readFilter !== "all"
                          ? "Try adjusting your filters to see more notifications."
                          : "You're all caught up! New notifications will appear here."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedNotifications).map(([date, notifications]) => (
                        <div key={date} className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                            {date}
                          </h4>
                          <div className="space-y-3">
                            {notifications.map((notification, index) => (
                              <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative flex items-start space-x-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${notification.read
                                    ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                                    : "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50 shadow-sm"
                                  }`}
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setShowDetailDialog(true);
                                  if (!notification.read) {
                                    markAsRead(notification._id);
                                  }
                                }}
                              >
                                {/* Notification Icon */}
                                <div className="flex-shrink-0 mt-1">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${notification.read
                                      ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                      : "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                                    }`}>
                                    {getNotificationIcon(notification.type, notification.priority)}
                                  </div>
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      {notification.title && (
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                          {notification.title}
                                        </h3>
                                      )}
                                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                        {notification.message}
                                      </p>
                                    </div>

                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                                        {notification.type}
                                      </Badge>
                                      {getPriorityBadge(notification.priority)}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                      <Clock className="w-3 h-3" />
                                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedNotification(notification);
                                          setShowDetailDialog(true);
                                        }}
                                        className="flex items-center"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {!notification.read && (
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification._id);
                                          }}
                                          className="flex items-center"
                                        >
                                          <Check className="w-4 h-4 mr-2" />
                                          Mark as Read
                                        </DropdownMenuItem>
                                      )}
                                      {notification.actionUrl && (
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(notification.actionUrl, '_blank');
                                          }}
                                          className="flex items-center"
                                        >
                                          <ExternalLink className="w-4 h-4 mr-2" />
                                          Open Link
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notification._id);
                                        }}
                                        className="flex items-center text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-red-600" />
                    Unread Notifications ({stats.unread})
                  </CardTitle>
                  <CardDescription>
                    Notifications that require your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Similar content structure but filtered for unread */}
                  {/* Implementation similar to "all" tab but with unread filter */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="important" className="space-y-4">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Important Notifications ({stats.important})
                  </CardTitle>
                  <CardDescription>
                    High priority notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Similar content structure but filtered for high priority */}
                  {/* Implementation similar to "all" tab but with priority filter */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Notification Details
            </DialogTitle>
            <DialogDescription>
              View complete notification information
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedNotification && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-700">
                    {getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
                  </div>
                  <div className="flex-1 space-y-1">
                    {selectedNotification.title && (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedNotification.title}
                      </h3>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </h4>
                      <Badge className={getTypeColor(selectedNotification.type)}>
                        {selectedNotification.type}
                      </Badge>
                    </div>

                    {selectedNotification.priority !== "normal" && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priority
                        </h4>
                        {getPriorityBadge(selectedNotification.priority)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </h4>
                      <Badge className={
                        selectedNotification.read
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                      }>
                        {selectedNotification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Received
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNotificationDate(selectedNotification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action URL */}
                {selectedNotification.actionUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Related Link
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedNotification.actionUrl, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </Button>
                  </div>
                )}

                {/* Related Event */}
                {selectedNotification.relatedEvent && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Related Event
                    </h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Event ID: {selectedNotification.relatedEvent}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <div className="flex items-center gap-2 w-full">
              {selectedNotification && !selectedNotification.read && (
                <Button
                  variant="outline"
                  onClick={() => {
                    markAsRead(selectedNotification._id);
                    setShowDetailDialog(false);
                  }}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowDetailDialog(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Notifications;
