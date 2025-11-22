import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import toast from "react-hot-toast";
import {
  Send,
  MessageSquare,
  Bell,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  Archive,
  Clock,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Menu,
  Copy,
  BarChart3,
  Users,
  Calendar,
  Activity,
  FileText,
  PieChart,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import api from "@/utils/api";

const ManageNotifications = () => {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form states
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "announcement",
    priority: "normal",
    recipients: "all",
    specificRecipients: [],
    scheduledAt: "",
    metadata: {
      emailSent: true,
      actionUrl: "",
    },
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

  // Cache configuration
  const CACHE_KEY = "notifications_management";
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  // Fetch notifications with filters
  const fetchNotifications = useCallback(
    async (page = 1, refresh = false) => {
      try {
        if (refresh) setRefreshing(true);

        if (!refresh) {
          const cached = localStorage.getItem(`${CACHE_KEY}_${page}`);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              setNotifications(data.data);
              setTotalPages(data.pagination.pages);
              setTotalItems(data.pagination.total);
              setCurrentPage(data.pagination.page);
              setLoading(false);
              return;
            }
          }
        }

        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(typeFilter !== "all" && { type: typeFilter }),
          ...(priorityFilter !== "all" && { priority: priorityFilter }),
        });

        const response = await api.get(`/notifications/bulk?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = response.data;

        localStorage.setItem(
          `${CACHE_KEY}_${page}`,
          JSON.stringify({
            data: responseData,
            timestamp: Date.now(),
          })
        );

        setNotifications(responseData.data);
        setTotalPages(responseData.pagination.pages);
        setTotalItems(responseData.pagination.total);
        setCurrentPage(responseData.pagination.page);
        setLastUpdated(new Date());

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
    },
    [statusFilter, typeFilter, priorityFilter, itemsPerPage]
  );

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/notifications/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/notifications/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
    fetchStats();
    fetchTemplates();
  }, [fetchNotifications, fetchStats, fetchTemplates]);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      setCurrentPage(1);
      fetchNotifications(1);
      localStorage.removeItem(`${CACHE_KEY}_${currentPage}`);
    }
  }, [statusFilter, typeFilter, priorityFilter]);

  // Create notification
  const handleCreateNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast.error("Title and message are required");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await api.post(
        "/notifications/bulk",
        newNotification,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response.data.message || "Notification created successfully!"
      );
      setShowCreateDialog(false);
      setNewNotification({
        title: "",
        message: "",
        type: "announcement",
        priority: "normal",
        recipients: "all",
        specificRecipients: [],
        scheduledAt: "",
        metadata: {
          emailSent: true,
          actionUrl: "",
        },
      });

      localStorage.removeItem(`${CACHE_KEY}_${currentPage}`);
      fetchNotifications(1, true);
      fetchStats();
    } catch (error) {
      console.error("Failed to create notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to create notification"
      );
    }
  };

  // Send notification now
  const handleSendNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/notifications/bulk/${id}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message || "Notification sent successfully!");
      localStorage.removeItem(`${CACHE_KEY}_${currentPage}`);
      fetchNotifications(currentPage, true);
      fetchStats();
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send notification"
      );
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/notifications/bulk/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Notification deleted successfully!");
      localStorage.removeItem(`${CACHE_KEY}_${currentPage}`);
      fetchNotifications(currentPage, true);
      fetchStats();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  };

  // Archive notification
  const handleArchiveNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/notifications/bulk/${id}/archive`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response.data.message || "Notification archived successfully!"
      );
      localStorage.removeItem(`${CACHE_KEY}_${currentPage}`);
      fetchNotifications(currentPage, true);
      fetchStats();
    } catch (error) {
      console.error("Failed to archive notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to archive notification"
      );
    }
  };

  // View notification details
  const handleViewDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/notifications/bulk/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedNotification(response.data.data);
      setShowDetailDialog(true);
    } catch (error) {
      console.error("Failed to fetch notification details:", error);
      toast.error("Failed to load notification details");
    }
  };

  // Get status color classes
  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200/20";
      case "scheduled":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20";
      case "draft":
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20";
      case "failed":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20";
    }
  };

  // Get type color classes
  const getTypeColor = (type) => {
    switch (type) {
      case "announcement":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200/20";
      case "system":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20";
      case "event":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200/20";
      case "marketing":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200/20";
      case "urgent":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20";
    }
  };

  // Get priority color classes
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200/20";
      case "normal":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20";
      case "low":
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200/20";
    }
  };

  // Filter notifications based on search
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats cards data
  const getStatsCards = () => [
    {
      title: "Total Notifications",
      value: stats?.overview?.totalNotifications || 0,
      change: "+12%",
      changeType: "positive",
      icon: Bell,
      color: "blue",
      description: "All notifications sent",
    },
    {
      title: "Sent Successfully",
      value: stats?.overview?.totalSent || 0,
      change: "+8%",
      changeType: "positive",
      icon: CheckCircle,
      color: "green",
      description: "Successfully delivered",
    },
    {
      title: "Engagement Rate",
      value: `${stats?.overview?.avgEngagementRate?.toFixed(1) || 0}%`,
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
      color: "indigo",
      description: "Average open rate",
    },
    {
      title: "Scheduled",
      value: stats?.overview?.totalScheduled || 0,
      change: "Pending",
      changeType: "neutral",
      icon: Clock,
      color: "orange",
      description: "Awaiting delivery",
    },
  ];

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
      <SheetContent
        side="right"
        className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle>Notification Controls</SheetTitle>
          <SheetDescription>
            Quick actions and filters for notification management
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              setShowCreateDialog(true);
              setMobileMenuOpen(false);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Notification
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              fetchNotifications(1, true);
              fetchStats();
              setMobileMenuOpen(false);
            }}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Skeleton components
  const StatCardSkeleton = () => (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 w-12 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden"
    >
      {/* Header with Gradient Background */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white shadow-xl"
      >
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold mb-1 leading-tight">
                  Notification Management
                </h1>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                  Create, schedule, and manage notifications for your users
                </p>
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          <div className="flex lg:hidden justify-end">
            <MobileControls />
          </div>

          <div className="hidden lg:flex items-center gap-3 z-10 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              onClick={() => fetchNotifications(1, true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
          : getStatsCards().map((stat, index) => {
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
                  <CardContent className="p-3 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                          {stat.title}
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {stat.value}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/20 dark:border-blue-700/20 border transition-transform duration-300 group-hover:scale-110 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="notifications" className="space-y-4 max-w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 p-1 rounded-xl inline-flex min-w-max">
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs px-3 py-2 whitespace-nowrap"
              >
                <Bell className="w-3 h-3 mr-1" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs px-3 py-2 whitespace-nowrap"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-200 text-xs px-3 py-2 whitespace-nowrap"
              >
                <FileText className="w-3 h-3 mr-1" />
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
                      <Filter className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">Filters & Search</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-xs">
                      Filter and search through {totalItems} notifications
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New Notification
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
                      <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate">
                        Notifications ({filteredNotifications.length})
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-xs">
                      Manage your notification campaigns and broadcasts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg"
                      >
                        <Skeleton className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No notifications found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Get started by creating your first notification campaign.
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Notification
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200/20 dark:border-blue-700/20">
                            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                {notification.message}
                              </p>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              <Badge
                                className={`text-xs px-2 py-1 border ${getStatusColor(
                                  notification.status
                                )}`}
                              >
                                {notification.status}
                              </Badge>
                              <Badge
                                className={`text-xs px-2 py-1 border ${getTypeColor(
                                  notification.type
                                )}`}
                              >
                                {notification.type}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {notification.recipientCount || 0} recipients
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(
                                  new Date(notification.createdAt),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                              {notification.sentAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Sent{" "}
                                  {format(
                                    new Date(notification.sentAt),
                                    "MMM dd h:mm a"
                                  )}
                                </span>
                              )}
                            </div>

                            {notification.engagementRate && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>
                                  {notification.engagementRate.toFixed(1)}%
                                  engagement
                                </span>
                              </div>
                            )}
                          </div>

                          {notification.priority !== "normal" && (
                            <Badge
                              className={`text-xs px-2 py-1 border w-fit ${getPriorityColor(
                                notification.priority
                              )}`}
                            >
                              {notification.priority} priority
                            </Badge>
                          )}
                        </div>

                        <div className="flex-shrink-0 self-end sm:self-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(notification._id)}
                                className="flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {notification.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSendNotification(notification._id)
                                  }
                                  className="flex items-center"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Now
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleArchiveNotification(notification._id)
                                }
                                className="flex items-center"
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteNotification(notification._id)
                                }
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
                )}

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                      {totalItems} notifications
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNotifications(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => fetchNotifications(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNotifications(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    Notification Types
                  </CardTitle>
                  <CardDescription>
                    Distribution of notification types sent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.byType?.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {type._id}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {type.count} (
                          {(
                            (type.count / stats.overview.totalNotifications) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                      <Progress
                        value={(type.count / stats.overview.totalNotifications) * 100}
                        className="h-2"
                      />
                    </div>
                  )) || (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No data available
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Activity className="w-4 h-4 text-yellow-600" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Delivery and engagement statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Delivery Rate
                        </p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {stats?.overview?.totalRecipients
                            ? (
                              (stats.overview.totalDelivered /
                                stats.overview.totalRecipients) *
                              100
                            ).toFixed(1)
                            : 0}
                          %
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {stats?.overview?.totalDelivered || 0} of{" "}
                          {stats?.overview?.totalRecipients || 0} delivered
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Open Rate
                        </p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {stats?.overview?.totalDelivered
                            ? (
                              (stats.overview.totalRead /
                                stats.overview.totalDelivered) *
                              100
                            ).toFixed(1)
                            : 0}
                          %
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {stats?.overview?.totalRead || 0} notifications opened
                        </p>
                      </div>
                      <Eye className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                          Avg. Engagement
                        </p>
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          {stats?.overview?.avgEngagementRate?.toFixed(1) || 0}%
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                          Average across all notifications
                        </p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-indigo-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Monthly Activity
                  </CardTitle>
                  <CardDescription>
                    Notification activity over the past months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.monthly?.map((month, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(
                              month._id.year,
                              month._id.month - 1
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {month.recipients} recipients reached
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {month.count}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            notifications
                          </p>
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            No monthly data available
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Notification Templates
                </CardTitle>
                <CardDescription>
                  Pre-configured templates for common notification types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          <Badge
                            className={`text-xs border ${getTypeColor(template.type)}`}
                          >
                            {template.type}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {template.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {template.message}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setNewNotification((prev) => ({
                              ...prev,
                              title: template.title,
                              message: template.message,
                              type: template.type,
                            }));
                            setShowCreateDialog(true);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {templates.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No templates available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Create New Notification
            </DialogTitle>
            <DialogDescription>
              Create and send notifications to your users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, title: e.target.value })
                  }
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, type: value })
                  }
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message..."
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, message: e.target.value })
                }
                className="bg-white/50 dark:bg-gray-800/50 min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, priority: value })
                  }
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Select
                  value={newNotification.recipients}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, recipients: value })
                  }
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Regular Users</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={newNotification.scheduledAt}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    scheduledAt: e.target.value,
                  })
                }
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            <div>
              <Label htmlFor="actionUrl">Action URL (Optional)</Label>
              <Input
                id="actionUrl"
                placeholder="https://example.com/action"
                value={newNotification.metadata.actionUrl}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    metadata: {
                      ...newNotification.metadata,
                      actionUrl: e.target.value,
                    },
                  })
                }
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="emailSent"
                checked={newNotification.metadata.emailSent}
                onCheckedChange={(checked) =>
                  setNewNotification({
                    ...newNotification,
                    metadata: {
                      ...newNotification.metadata,
                      emailSent: checked,
                    },
                  })
                }
              />
              <Label htmlFor="emailSent">Send email notification</Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNotification}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {newNotification.scheduledAt ? "Schedule Notification" : "Send Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Notification Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this notification
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedNotification && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </Label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedNotification.title}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </Label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </Label>
                      <Badge
                        className={`text-xs px-2 py-1 border ${getStatusColor(
                          selectedNotification.status
                        )}`}
                      >
                        {selectedNotification.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </Label>
                      <Badge
                        className={`text-xs px-2 py-1 border ${getTypeColor(
                          selectedNotification.type
                        )}`}
                      >
                        {selectedNotification.type}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </Label>
                      <Badge
                        className={`text-xs px-2 py-1 border ${getPriorityColor(
                          selectedNotification.priority
                        )}`}
                      >
                        {selectedNotification.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recipients
                    </Label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedNotification.recipientCount || 0} users
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </Label>
                    <p className="text-gray-900 dark:text-white">
                      {format(
                        new Date(selectedNotification.createdAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>

                  {selectedNotification.sentAt && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sent
                      </Label>
                      <p className="text-gray-900 dark:text-white">
                        {format(
                          new Date(selectedNotification.sentAt),
                          "MMM dd, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {selectedNotification.deliveryLogs &&
                  selectedNotification.deliveryLogs.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">
                        Delivery Statistics
                      </Label>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/20">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Delivered
                            </span>
                          </div>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {selectedNotification.deliveredCount || 0}
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/20">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              Opened
                            </span>
                          </div>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {selectedNotification.readCount || 0}
                          </p>
                        </div>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200/20">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                              Engagement
                            </span>
                          </div>
                          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {selectedNotification.engagementRate?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {selectedNotification.createdBy && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Created By
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {selectedNotification.createdBy.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedNotification.createdBy.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedNotification.createdBy.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ManageNotifications;