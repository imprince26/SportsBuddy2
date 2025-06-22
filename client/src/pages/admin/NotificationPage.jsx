import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, Users, Calendar, MessageSquare, MoreHorizontal, Trash2, Eye, Plus, Search } from "lucide-react"
import { format } from "date-fns"

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "announcement",
    recipients: "all",
    scheduleDate: "",
    scheduleTime: "",
  })

  // Mock data
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      setTimeout(() => {
        const mockNotifications = Array.from({ length: 20 }, (_, i) => ({
          _id: `notification_${i + 1}`,
          title: `Notification ${i + 1}`,
          message: `This is a sample notification message ${i + 1}. It contains important information for users.`,
          type: ["system", "event", "chat", "team", "announcement"][i % 5],
          recipients: i % 3 === 0 ? "all" : "specific",
          recipientCount: i % 3 === 0 ? "All Users" : Math.floor(Math.random() * 100) + 1,
          sentAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          status: i % 5 === 0 ? "scheduled" : i % 7 === 0 ? "draft" : "sent",
          readCount: Math.floor(Math.random() * 500),
          clickCount: Math.floor(Math.random() * 100),
        }))

        setNotifications(mockNotifications)
        setLoading(false)
      }, 1000)
    }

    fetchNotifications()
  }, [])

  const handleCreateNotification = () => {
    const notification = {
      _id: `notification_${Date.now()}`,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type ,
      recipients: newNotification.recipients,
      recipientCount: newNotification.recipients === "all" ? "All Users" : "Selected Users",
      sentAt: new Date().toISOString(),
      status: newNotification.scheduleDate ? "scheduled" : "sent",
    }

    setNotifications([notification, ...notifications])
    setShowCreateDialog(false)
    setNewNotification({
      title: "",
      message: "",
      type: "announcement",
      recipients: "all",
      scheduleDate: "",
      scheduleTime: "",
    })
  }

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n._id !== id))
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "system":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "event":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "chat":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "team":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "announcement":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Send and manage notifications to your users</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card-light dark:bg-card-dark max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send a notification to your users. You can schedule it for later or send it immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                <Input
                  placeholder="Notification title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                <Textarea
                  placeholder="Notification message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  className="bg-background min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Recipients</label>
                  <Select
                    value={newNotification.recipients}
                    onValueChange={(value) => setNewNotification({ ...newNotification, recipients: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Schedule Date (Optional)</label>
                  <Input
                    type="date"
                    value={newNotification.scheduleDate}
                    onChange={(e) => setNewNotification({ ...newNotification, scheduleDate: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Schedule Time (Optional)</label>
                  <Input
                    type="time"
                    value={newNotification.scheduleTime}
                    onChange={(e) => setNewNotification({ ...newNotification, scheduleTime: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotification}>
                <Send className="w-4 h-4 mr-2" />
                {newNotification.scheduleDate ? "Schedule" : "Send Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card-light dark:bg-card-dark border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.filter((n) => n.status === "sent").length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Send className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-light dark:bg-card-dark border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.filter((n) => n.status === "scheduled").length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-light dark:bg-card-dark border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.filter((n) => n.status === "draft").length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900">
                <MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-light dark:bg-card-dark border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold text-foreground">1.2k</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card-light dark:bg-card-dark border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="bg-card-light dark:bg-card-dark border-border">
        <CardHeader>
          <CardTitle>Recent Notifications ({filteredNotifications.length})</CardTitle>
          <CardDescription>Manage your sent and scheduled notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-start justify-between p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-foreground">{notification.title}</h3>
                      <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                      <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Recipients: {notification.recipientCount}</span>
                      <span>Sent: {format(new Date(notification.sentAt), "MMM dd, yyyy h:mm a")}</span>
                      {notification.readCount !== undefined && <span>Read: {notification.readCount}</span>}
                      {notification.clickCount !== undefined && <span>Clicks: {notification.clickCount}</span>}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card-light dark:bg-card-dark">
                      <DropdownMenuItem className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Resend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="flex items-center text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsPage
