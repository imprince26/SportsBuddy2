import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Shield,
  User,
  Crown,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Award,
  Target,
  TrendingUp,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Activity,
  Zap,
  Star
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"
import api from "@/utils/api"

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [userStats, setUserStats] = useState({})

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    isActive: true
  })
  const [notificationForm, setNotificationForm] = useState({
    subject: "",
    message: ""
  })

  // Fetch users with filtering and pagination
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    try {
      setRefreshing(forceRefresh)
      setLoading(!forceRefresh)

      const token = localStorage.getItem('token')
      const response = await api.get('/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          role: selectedRole !== 'all' ? selectedRole : undefined,
          sortBy,
          sortOrder
        }
      })

      if (response.data?.success) {
        setUsers(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)

        // You can also use the statistics from the API
        if (response.data.statistics) {
          setUserStats(prev => ({
            ...prev,
            total: response.data.statistics.totalUsers
          }))
        }
      } else {
        // Fallback for old API structure
        setUsers(Array.isArray(response.data) ? response.data : [])
        setTotalPages(Math.ceil((response.data?.length || 0) / itemsPerPage))
      }

      setError(null)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err.response?.data?.message || err.message)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedRole, sortBy, sortOrder])

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data?.users) {
        setUserStats(response.data.users)
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchUsers()
    fetchUserStats()
  }, [fetchUsers, fetchUserStats])

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1)
      fetchUsers()
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Handle role filter change
  useEffect(() => {
    setCurrentPage(1)
    fetchUsers()
  }, [selectedRole, sortBy, sortOrder])

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

  // Handle user actions
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      isActive: user.isActive !== false
    })
    setShowEditDialog(true)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleSendNotification = (user) => {
    setSelectedUser(user)
    setNotificationForm({
      subject: "",
      message: ""
    })
    setShowNotificationDialog(true)
  }

  // Submit edit user
  const submitEditUser = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem('token')
      await api.put(`/admin/users/${selectedUser._id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success("User updated successfully!")
      setShowEditDialog(false)
      fetchUsers(true)
    } catch (err) {
      console.error('Failed to update user:', err)
      toast.error(err.response?.data?.message || "Failed to update user")
    }
  }

  // Submit delete user
  const submitDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem('token')
      await api.delete(`/admin/users/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success("User deleted successfully!")
      setShowDeleteDialog(false)
      fetchUsers(true)
    } catch (err) {
      console.error('Failed to delete user:', err)
      toast.error(err.response?.data?.message || "Failed to delete user")
    }
  }

  // Submit notification
  const submitNotification = async () => {
    if (!selectedUser || !notificationForm.subject || !notificationForm.message) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const token = localStorage.getItem('token')
      await api.post(`/admin/notifications/user/${selectedUser._id}`, notificationForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success("Notification sent successfully!")
      setShowNotificationDialog(false)
    } catch (err) {
      console.error('Failed to send notification:', err)
      toast.error(err.response?.data?.message || "Failed to send notification")
    }
  }

  // Export users
  const handleExportUsers = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem('token')

      // Create CSV content
      const headers = ['Name', 'Email', 'Role', 'Created At', 'Last Active']
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          `"${user.name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.role || ''}"`,
          `"${format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
          `"${user.lastActive ? format(new Date(user.lastActive), 'yyyy-MM-dd HH:mm:ss') : 'Never'}"`
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `sportsbuddy-users-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success("Users exported successfully!")
    } catch (err) {
      console.error('Failed to export users:', err)
      toast.error("Failed to export users")
    } finally {
      setRefreshing(false)
    }
  }

  // Get role badge variant
  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'default'
      case 'moderator':
        return 'secondary'
      case 'premium':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return Crown
      case 'moderator':
        return Shield
      case 'premium':
        return Star
      default:
        return User
    }
  }

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === 'all' || user.role === selectedRole

    return matchesSearch && matchesRole
  })

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Update total pages based on filtered results
  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage))
  }, [filteredUsers.length, itemsPerPage])

  // Loading skeleton
  const UserSkeleton = () => (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 w-48 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700" />
          </div>
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
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Users</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => fetchUsers(true)} className="bg-blue-600 hover:bg-blue-700">
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Total users: {users.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
            onClick={handleExportUsers}
            disabled={refreshing}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: userStats.total?.toLocaleString() || users.length.toLocaleString(),
            change: `+${userStats.newToday || 0}`,
            changeType: "positive",
            icon: Users,
            color: "blue",
            description: "Registered users"
          },
          {
            title: "New Today",
            value: userStats.newToday?.toString() || "0",
            change: "+12%",
            changeType: "positive",
            icon: UserPlus,
            color: "green",
            description: "Daily registrations"
          },
          {
            title: "This Month",
            value: userStats.thisMonth?.toString() || "0",
            change: "+8%",
            changeType: "positive",
            icon: TrendingUp,
            color: "purple",
            description: "Monthly growth"
          },
          {
            title: "Active Users",
            value: Math.floor((userStats.total || users.length) * 0.75).toLocaleString(),
            change: "92%",
            changeType: "neutral",
            icon: Activity,
            color: "orange",
            description: "Active accounts"
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <span className={`text-sm font-medium ${stat.changeType === "positive" ? "text-green-600" :
                            stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                          }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
                    </div>

                    <div className="p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/50 dark:border-blue-700/50">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex gap-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}>
                  <SelectTrigger className="w-48 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="email-asc">Email A-Z</SelectItem>
                    <SelectItem value="role-asc">Role A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users List */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Users ({filteredUsers.length})
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 p-6">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <UserSkeleton key={index} />
                ))
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? "Try adjusting your search criteria." : "No users available."}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {paginatedUsers.map((user, index) => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        className="group"
                      >
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-600/50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <Avatar className="w-12 h-12 ring-2 ring-gray-200/50 dark:ring-gray-700/50">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${user.isActive !== false ? 'bg-green-500' : 'bg-gray-400'
                                    }`} />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {user.name || 'Unnamed User'}
                                    </h3>
                                    <Badge
                                      variant={getRoleBadgeVariant(user.role)}
                                      className="flex items-center gap-1"
                                    >
                                      <RoleIcon className="w-3 h-3" />
                                      {user.role || 'user'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {user.email}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    {user.location?.city && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{user.location.city}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="text-right mr-4">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.eventsCreated || 0} events
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.isActive !== false ? 'Active' : 'Inactive'}
                                  </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                    className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSendNotification(user)}
                                    className="hover:bg-green-100 dark:hover:bg-green-900/20"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-blue-600 text-white" : "bg-white/50 dark:bg-gray-800/50"}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditUser} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Send Notification
            </DialogTitle>
            <DialogDescription>
              Send a notification email to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={notificationForm.subject}
                onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                placeholder="Enter email subject"
                className="bg-white/50 dark:bg-gray-800/50"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                placeholder="Enter your message"
                rows={4}
                className="bg-white/50 dark:bg-gray-800/50 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitNotification} className="bg-green-600 hover:bg-green-700">
              <Mail className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default ManageUsers