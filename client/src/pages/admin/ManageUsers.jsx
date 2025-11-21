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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import { Users, Search, Filter, MoreHorizontal, Edit, Trash2, Mail, Shield, User, Crown, Eye, EyeOff, RefreshCw, Download, Plus, ChevronLeft, ChevronRight, UserPlus, MapPin, Calendar, Clock, Sparkles, Award, Target, TrendingUp, Settings, Ban, CheckCircle, XCircle, AlertTriangle, UserCheck, UserX, Activity, Zap, Star, Menu, X, Phone, Globe, Heart, MessageCircle, Share, Bookmark, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"
import api from "@/utils/api"
import { cn } from "@/lib/utils"

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
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [userStats, setUserStats] = useState({})
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [selectedUsers, setSelectedUsers] = useState([])

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

        if (response.data.statistics) {
          setUserStats(prev => ({
            ...prev,
            total: response.data.statistics.totalUsers
          }))
        }
      } else {
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

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)
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
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 w-32 sm:w-48 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Mobile User Card Component
  const MobileUserCard = ({ user, index }) => {
    const RoleIcon = getRoleIcon(user.role)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-600/50">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-gray-200/50 dark:ring-gray-700/50">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      user.isActive !== false ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                        {user.name || 'Unnamed User'}
                      </h3>
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="flex items-center gap-1 text-xs px-2 py-0.5"
                      >
                        <RoleIcon className="w-2.5 h-2.5" />
                        {user.role || 'user'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Actions Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto">
                    <SheetHeader>
                      <SheetTitle className="text-left">User Actions</SheetTitle>
                      <SheetDescription className="text-left">
                        Choose an action for {user.name}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-2 py-4">
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleSendNotification(user)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Separator />
                      <Button
                        variant="ghost"
                        className="justify-start text-red-600"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* User Info */}
              <div className="space-y-2">
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

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{user.eventsCreated || 0} events</span>
                    <span className={user.isActive !== false ? 'text-green-600' : 'text-gray-500'}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => handleViewUser(user)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Desktop User Card Component
  const DesktopUserCard = ({ user, index }) => {
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
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                    user.isActive !== false ? 'bg-green-500' : 'bg-gray-400'
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

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewUser(user)}
                    className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

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
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4"
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
      className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total users: {users.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              <span className="sm:hidden">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={handleExportUsers}
              disabled={refreshing}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
            color: "indigo",
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
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 dark:to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <span className={`text-xs sm:text-sm font-medium ${
                          stat.changeType === "positive" ? "text-green-600" :
                          stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{stat.description}</p>
                    </div>

                    <div className="p-2 sm:p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/50 dark:border-blue-700/50">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
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
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Search & Filter</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                />
              </div>

              {/* Filters - Desktop always visible, Mobile collapsible */}
              <div className={cn(
                "space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4",
                showFilters ? "block" : "hidden lg:flex"
              )}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-4 flex-1">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
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

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-')
                    setSortBy(field)
                    setSortOrder(order)
                  }}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
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

                  {/* View Mode Toggle - Desktop only */}
                  <div className="hidden lg:flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="flex-1"
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex-1"
                    >
                      List
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users List */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg sm:text-xl">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Users ({filteredUsers.length})
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="space-y-3 sm:space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <UserSkeleton key={index} />
                  ))}
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? "Try adjusting your search criteria." : "No users available."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence>
                    {paginatedUsers.map((user, index) => (
                      <div key={user._id}>
                        {/* Mobile View */}
                        <div className="block lg:hidden">
                          <MobileUserCard user={user} index={index} />
                        </div>
                        
                        {/* Desktop View */}
                        <div className="hidden lg:block">
                          <DesktopUserCard user={user} index={index} />
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
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
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Details Sheet - Mobile optimized */}
      <Sheet open={showUserDetails} onOpenChange={setShowUserDetails}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-[80vh]">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              Detailed information about {selectedUser?.name}
            </SheetDescription>
          </SheetHeader>
          
          {selectedUser && (
            <ScrollArea className="h-full mt-6">
              <div className="space-y-6 pb-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-gray-200/50 dark:ring-gray-700/50">
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-semibold text-lg">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                      <Badge variant={selectedUser.isActive !== false ? "default" : "secondary"}>
                        {selectedUser.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Events Created</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.eventsCreated || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(selectedUser.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                {(selectedUser.phone || selectedUser.location?.city) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Contact Information</h4>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.location?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedUser.location.city}, {selectedUser.location.state}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDetails(false)
                      handleEditUser(selectedUser)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDetails(false)
                      handleSendNotification(selectedUser)
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={submitEditUser} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDeleteUser}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={submitNotification} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
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
