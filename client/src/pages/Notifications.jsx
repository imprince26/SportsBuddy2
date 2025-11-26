import { useState, useEffect, useCallback } from "react";
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
  Star,
  Clock,
  ChevronRight,
  Archive,
  Search,
  X,
  CheckCheck
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import api from "@/utils/api";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, archived
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.get("/auth/profile");

      // Mock data enhancement if needed, or use real data
      const rawNotifications = response.data.data.notifications || [];
      
      // Sort by date desc
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
    // Status Filter
    if (filter === "unread" && n.read) return false;
    if (filter === "archived" && !n.isArchived) return false;
    if (filter === "all" && n.isArchived) return false; // Don't show archived in 'all' by default

    // Type Filter
    if (typeFilter !== "all" && n.type !== typeFilter) return false;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      );
    }

    return true;
  });

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
      await api.put("/notifications/user/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error("Failed to update");
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
    // Implement bulk delete API call here
    // For now just update local state
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n._id)));
    setSelectedIds([]);
    setIsSelectionMode(false);
    toast.success("Selected items deleted");
  };

  const getIcon = (type) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'team': return <Users className="w-4 h-4 text-purple-500" />;
      case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated with your sports activity.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="hidden sm:flex">
                <CheckCheck className="w-4 h-4 mr-2" />
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
              {isSelectionMode ? "Cancel Selection" : "Select"}
            </Button>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 mb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Tabs / Filter Pills */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {['all', 'unread', 'archived'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    filter === f 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Search & Type Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-secondary/30 border-transparent focus:bg-background focus:border-primary/20 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-secondary/30 border-transparent">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="chat">Messages</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isSelectionMode && selectedIds.length > 0 ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-lg p-3 mt-4">
              <span className="text-sm font-medium text-primary ml-2">
                {selectedIds.length} selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                  Deselect All
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2 min-h-[400px]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/50">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500 bg-card">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No notifications</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                You're all caught up! Check back later for new updates.
              </p>
              {filter !== 'all' && (
                <Button variant="link" onClick={() => setFilter('all')} className="mt-4">
                  View all notifications
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
                    "hover:shadow-sm hover:border-primary/20",
                    notification.read 
                      ? "bg-background border-border/40" 
                      : "bg-primary/5 border-primary/10"
                  )}
                >
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="pt-1">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(notification._id)}
                        onChange={() => toggleSelection(notification._id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border",
                    notification.read 
                      ? "bg-secondary/50 border-transparent" 
                      : "bg-background border-primary/20 shadow-sm"
                  )}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className={cn(
                      "flex gap-2",
                      notification.title ? "items-start justify-between" : "justify-end"
                    )}>
                      <h4 className={cn(
                        "text-sm font-medium leading-none",
                        !notification.read && "text-primary font-semibold",
                        notification.title ? "block" : "hidden"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2",
                      notification.title ? "" : "-mt-3"
                    )}>
                      {notification.message}
                    </p>

                    {/* Footer / Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      {notification.type === 'event' && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
                          Event
                        </Badge>
                      )}
                      {notification.priority === 'high' && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 h-5 font-normal">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity sm:flex sm:flex-col sm:gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notification.read && (
                          <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                            <Check className="w-4 h-4 mr-2" /> Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteNotification(notification._id)} className="text-red-600 focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
