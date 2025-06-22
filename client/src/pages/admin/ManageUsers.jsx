import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  MoreHorizontal,
  Shield,
  UserX,
  UserCheck,
  Edit,
  Trash2,
  Eye,
  Mail,
  Calendar,
  MapPin,
  Activity,
  UsersIcon,
} from "lucide-react"
import { format } from "date-fns"
import { Link } from "react-router-dom"


const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionType, setActionType] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockUsers = Array.from({ length: 50 }, (_, i) => ({
          _id: `user_${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          username: `user${i + 1}`,
          role: i % 10 === 0 ? "admin" : "user",
          status: i % 7 === 0 ? "suspended" : i % 15 === 0 ? "pending" : "active",
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          avatar: i % 3 === 0 ? `/placeholder.svg?height=40&width=40` : undefined,
          location: {
            city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][i % 5],
            country: "USA",
          },
          eventsCreated: Math.floor(Math.random() * 10),
          eventsJoined: Math.floor(Math.random() * 25),
          lastActive: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
        }))

        setUsers(mockUsers.slice((currentPage - 1) * 10, currentPage * 10))
        setTotalPages(Math.ceil(mockUsers.length / 10))
        setLoading(false)
      }, 1000)
    }

    fetchUsers()
  }, [currentPage, roleFilter, statusFilter, searchTerm])

  const handleUserAction = async (action, user) => {
    setSelectedUser(user)
    setActionType(action)
    setShowConfirmDialog(true)
  }

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return

    // Simulate API call
    console.log(`${actionType} user:`, selectedUser._id)

    // Update local state
    setUsers(
      users.map((u) => {
        if (u._id === selectedUser._id) {
          switch (actionType) {
            case "suspend":
              return { ...u, status: "suspended"  }
            case "activate":
              return { ...u, status: "active"  }
            case "makeAdmin":
              return { ...u, role: "admin"  }
            case "removeAdmin":
              return { ...u, role: "user"  }
            default:
              return u
          }
        }
        return u
      }),
    )

    setShowConfirmDialog(false)
    setSelectedUser(null)
    setActionType("")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRoleColor = (role) => {
    return role === "admin"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground">View and manage all user accounts on the platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Bulk Email
          </Button>
          <Button size="sm">
            <UsersIcon className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card-light dark:bg-card-dark border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card-light dark:bg-card-dark border-border">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-muted">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-foreground truncate">{user.name}</h3>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </span>
                        {user.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.location.city}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {user.eventsJoined} events joined
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm">
                      <div className="font-medium text-foreground">{user.eventsCreated} created</div>
                      <div className="text-muted-foreground">
                        Last active {format(new Date(user.lastActive), "MMM dd")}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card-light dark:bg-card-dark">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/users/${user._id}`} className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/users/${user._id}/edit`} className="flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user.status === "active" ? "suspend" : "activate", user)}
                          className="flex items-center"
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX className="w-4 h-4 mr-2 text-red-600" />
                              <span className="text-red-600">Suspend User</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                              <span className="text-green-600">Activate User</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user.role === "user" ? "makeAdmin" : "removeAdmin", user)}
                          className="flex items-center"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {user.role === "user" ? "Make Admin" : "Remove Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUserAction("delete", user)}
                          className="flex items-center text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, filteredUsers.length)} of{" "}
          {filteredUsers.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card-light dark:bg-card-dark">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} {selectedUser?.name}? This action may affect their access to the
              platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageUsers
