import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
} from "lucide-react"
import { Link } from "react-router-dom"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalEvents: 89,
    activeEvents: 23,
    totalMessages: 3456,
    newUsersToday: 12,
    newEventsToday: 3,
    popularCategories: [
      { name: "Football", count: 34, percentage: 85 },
      { name: "Basketball", count: 28, percentage: 70 },
      { name: "Tennis", count: 15, percentage: 38 },
      { name: "Running", count: 12, percentage: 30 },
    ],
    recentReports: [
      {
        id: 1,
        type: "user",
        reportedBy: { name: "John Doe" },
        description: "Inappropriate behavior during event",
        createdAt: new Date(),
        status: "pending",
      },
      {
        id: 2,
        type: "event",
        reportedBy: { name: "Jane Smith" },
        description: "Event location was incorrect",
        createdAt: new Date(Date.now() - 86400000),
        status: "resolved",
      },
    ],
  })

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersToday}`,
      changeType: "positive",
      icon: Users,
      color: "blue",
    },
    {
      title: "Total Events",
      value: stats.totalEvents.toString(),
      change: `+${stats.newEventsToday}`,
      changeType: "positive",
      icon: Calendar,
      color: "purple",
    },
    {
      title: "Active Events",
      value: stats.activeEvents.toString(),
      change: `${((stats.activeEvents / stats.totalEvents) * 100).toFixed(1)}%`,
      changeType: "neutral",
      icon: Activity,
      color: "green",
    },
    {
      title: "Messages",
      value: stats.totalMessages.toLocaleString(),
      change: "+156",
      changeType: "positive",
      icon: MessageSquare,
      color: "orange",
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with SportsBuddy today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button size="sm">
            <Activity className="w-4 h-4 mr-2" />
            System Status
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="bg-card-light dark:bg-card-dark border-border hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      {stat.changeType === "positive" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : stat.changeType === "negative" ? (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      ) : null}
                      <span
                        className={`text-sm font-medium ${stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stat.changeType !== "neutral" ? "today" : "of total"}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card-light dark:bg-card-dark">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Categories */}
            <Card className="bg-card-light dark:bg-card-dark border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span>Popular Categories</span>
                    </CardTitle>
                    <CardDescription>Most active sports categories this month</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.popularCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.count} events</span>
                    </div>
                    <Progress value={category.percentage} className="h-2 bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card-light dark:bg-card-dark border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest platform activities and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">New user registration spike detected</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Football tournament event created</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">System maintenance completed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Weekly analytics report generated</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-card-light dark:bg-card-dark border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Recent Reports</span>
                  </CardTitle>
                  <CardDescription>User and event reports requiring attention</CardDescription>
                </div>
                <Link to="/admin/reports">
                  <Button variant="outline" size="sm">
                    View All Reports
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Reports</h3>
                  <p className="text-muted-foreground">There are no reported issues at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant={report.type === "user" ? "destructive" : "secondary"}>{report.type}</Badge>
                        <div>
                          <p className="text-sm font-medium text-foreground">Reported by {report.reportedBy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.description.length > 50
                              ? `${report.description.substring(0, 50)}...`
                              : report.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={report.status === "resolved" ? "default" : "secondary"}
                          className={
                            report.status === "resolved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }
                        >
                          {report.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-card-light dark:bg-card-dark border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/users">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-xs text-muted-foreground">View and edit user accounts</div>
                </div>
              </Button>
            </Link>

            <Link to="/admin/events">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <Calendar className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Manage Events</div>
                  <div className="text-xs text-muted-foreground">Review and approve events</div>
                </div>
              </Button>
            </Link>

            <Link to="/admin/notifications">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <Bell className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Send Notifications</div>
                  <div className="text-xs text-muted-foreground">Broadcast messages to users</div>
                </div>
              </Button>
            </Link>

            <Link to="/admin/search">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <TrendingUp className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Advanced Search</div>
                  <div className="text-xs text-muted-foreground">Find users and events</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
