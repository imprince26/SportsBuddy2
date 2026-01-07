import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  Trophy,
  Clock,
  Search,
  X,
  CheckCheck,
  MapPin,
  Heart,
  UserPlus,
  Zap,
  BellOff,
  Loader2
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import api from "@/utils/api";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Notification types with their icons and colors
const notificationConfig = {
  event: {
    icon: Calendar,
    label: "Event",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  message: {
    icon: MessageSquare,
    label: "Message",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  chat: {
    icon: MessageSquare,
    label: "Message",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  community: {
    icon: Users,
    label: "Community",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  team: {
    icon: Users,
    label: "Team",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  follow: {
    icon: UserPlus,
    label: "Follow",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  like: {
    icon: Heart,
    label: "Like",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  achievement: {
    icon: Trophy,
    label: "Achievement",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  venue: {
    icon: MapPin,
    label: "Venue",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  system: {
    icon: Settings,
    label: "System",
    bgColor: "bg-muted",
    iconColor: "text-muted-foreground"
  },
  default: {
    icon: Bell,
    label: "Notification",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  }
};

// Loading Skeleton
const NotificationSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card"
      >
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

// Stats Card
const QuickStats = ({ notifications }) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount = notifications.filter(n => isToday(new Date(n.timestamp))).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Unread", value: unreadCount, icon: Bell },
        { label: "Today", value: todayCount, icon: Zap },
        { label: "Total", value: notifications.length, icon: CheckCheck },
        {
          label: "This Week", value: notifications.filter(n => {
            const date = new Date(n.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
          }).length, icon: Clock
        }
      ].map((stat, i) => (
        <Card key={i} className="border-border bg-card hover:border-primary/20 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Single Notification Card
const NotificationCard = ({
  notification,
  isSelectionMode,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDelete
}) => {
  const config = notificationConfig[notification.type] || notificationConfig.default;
  const Icon = config.icon;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        notification.read
          ? "bg-card border-border"
          : "bg-primary/5 border-primary/20"
      )}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="flex items-center pt-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(notification._id)}
            className="border-primary data-[state=checked]:bg-primary"
          />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
        config.bgColor
      )}>
        <Icon className={cn("w-5 h-5", config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className={cn(
                "text-sm font-semibold truncate",
                notification.read ? "text-foreground" : "text-primary"
              )}>
                {notification.title}
              </h4>
            )}
            <p className={cn(
              "text-sm text-muted-foreground mt-1 leading-relaxed",
              notification.title ? "line-clamp-2" : "line-clamp-3"
            )}>
              {notification.message}
            </p>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(notification.timestamp)}
          </span>
        </div>

        {/* Tags & Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border-0"
            >
              {config.label}
            </Badge>
            {notification.priority === 'high' && (
              <Badge className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive border-0">
                Urgent
              </Badge>
            )}
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification._id)}
                className="h-8 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {!notification.read && (
                  <DropdownMenuItem onClick={() => onMarkAsRead(notification._id)}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(notification._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State
const EmptyState = ({ filter, onReset }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <BellOff className="w-10 h-10 text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">
      {filter === "unread" ? "All caught up!" : "No notifications yet"}
    </h3>
    <p className="text-muted-foreground max-w-sm mb-6">
      {filter === "unread"
        ? "You've read all your notifications. Check back later for new updates."
        : "When you receive notifications, they'll appear here."
      }
    </p>
    {filter !== 'all' && (
      <Button variant="outline" onClick={onReset}>
        View all notifications
      </Button>
    )}
  </motion.div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.get("/auth/profile");
      const rawNotifications = response.data.data.notifications || [];
      const sorted = rawNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(sorted);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread" && n.read) return false;
    if (filter === "archived" && !n.isArchived) return false;
    if (filter === "all" && n.isArchived) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp);
    let key;
    if (isToday(date)) key = "Today";
    else if (isYesterday(date)) key = "Yesterday";
    else key = format(date, "MMMM d, yyyy");
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(notification);
    return groups;
  }, {});

  // Actions
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/user/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      toast.success("Marked as read");
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error("Failed to update");
    }
  };

  const markAllRead = async () => {
    try {
      setIsProcessing(true);
      await api.put("/notifications/user/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error("Failed to update");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/user/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Deleted");
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Failed to delete");
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      // Implement bulk delete API if available
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n._id)));
      setSelectedIds([]);
      setIsSelectionMode(false);
      toast.success(`${selectedIds.length} notifications deleted`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkMarkRead = async () => {
    setIsProcessing(true);
    try {
      setNotifications(prev => prev.map(n =>
        selectedIds.includes(n._id) ? { ...n, read: true } : n
      ));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} marked as read`);
    } finally {
      setIsProcessing(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10">
                  <Bell className="w-7 h-7 text-primary" />
                </div>
                Notifications
              </h1>
              <p className="text-muted-foreground mt-2">
                Stay updated with your sports activities and connections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllRead}
                  disabled={isProcessing}
                  className="border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4 mr-2" />
                  )}
                  Mark all read
                </Button>
              )}
              <Button
                variant={isSelectionMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds([]);
                }}
              >
                {isSelectionMode ? "Cancel" : "Select"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {!loading && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuickStats notifications={notifications} />
          </motion.div>
        )}

        {/* Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-0 z-20 bg-background/95 backdrop-blur-md py-4 mb-6 -mx-4 px-4 border-b border-border"
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 w-full md:w-auto bg-muted/50">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
                >
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="ml-1.5 h-5 min-w-[20px] p-0 flex items-center justify-center bg-primary/20 text-primary text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search & Type Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-muted/50 border-border focus-visible:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-10 bg-muted/50 border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="follow">Follows</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {isSelectionMode && selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-3 mt-4">
                  <span className="text-sm font-medium text-primary ml-2">
                    {selectedIds.length} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBulkMarkRead}
                      disabled={isProcessing}
                      className="hover:bg-primary/10"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark Read
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <NotificationSkeleton />
          ) : filteredNotifications.length == 0 ? (
            <EmptyState filter={filter} onReset={() => setFilter("all")} />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      {date}
                    </h3>
                    <div className="flex-1 h-px bg-border" />
                    <Badge variant="secondary" className="text-xs bg-muted">
                      {items.length}
                    </Badge>
                  </div>

                  {/* Notification Items */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {items.map((notification) => (
                        <NotificationCard
                          key={notification._id}
                          notification={notification}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedIds.includes(notification._id)}
                          onSelect={toggleSelection}
                          onMarkAsRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
