import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Lock,
  Globe,
  UserPlus,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"
import { useNavigate } from "react-router-dom"
import api from "@/utils/api"
import { cn } from "@/lib/utils"

const ManageCommunities = () => {
  const navigate = useNavigate()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPrivacy, setSelectedPrivacy] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(12)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [communityStats, setCommunityStats] = useState({})
  const [actionCommunity, setActionCommunity] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch communities with filtering and pagination
  const fetchCommunities = useCallback(
    async (forceRefresh = false) => {
      try {
        setRefreshing(forceRefresh)
        setLoading(!forceRefresh)
        const token = localStorage.getItem("token")
        const response = await api.get("/admin/communities", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            privacy: selectedPrivacy !== "all" ? selectedPrivacy : undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            sortBy,
            sortOrder,
          },
        })

        if (response.data) {
          // Handle both array and paginated response
          if (Array.isArray(response.data)) {
            setCommunities(response.data)
            setTotalPages(Math.ceil(response.data.length / itemsPerPage))
          } else {
            setCommunities(response.data.data || response.data.communities || [])
            setTotalPages(response.data.totalPages || 1)
          }
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch communities:", err)
        setError(err.message)
        toast.error("Failed to load communities")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedPrivacy, selectedStatus, sortBy, sortOrder],
  )

  // Fetch community statistics
  const fetchCommunityStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await api.get("/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data?.communities) {
        setCommunityStats(response.data.communities)
      }
    } catch (err) {
      console.error("Failed to fetch community stats:", err)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchCommunities()
    fetchCommunityStats()
  }, [fetchCommunities, fetchCommunityStats])

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1)
      fetchCommunities()
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Handle filter changes
  useEffect(() => {
    setCurrentPage(1)
    fetchCommunities()
  }, [selectedCategory, selectedPrivacy, selectedStatus, sortBy, sortOrder])

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
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Handle community actions
  const handleViewCommunity = (community) => {
    setSelectedCommunity(community)
    setShowDetailsDialog(true)
  }

  const handleEditCommunity = (community) => {
    navigate(`/community/${community._id}/edit`)
  }

  const handleDeleteCommunity = (community) => {
    setSelectedCommunity(community)
    setShowDeleteDialog(true)
  }

  // Submit delete community
  const submitDeleteCommunity = async () => {
    if (!selectedCommunity) return

    try {
      const token = localStorage.getItem("token")
      await api.delete(`/admin/communities/${selectedCommunity._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Community deleted successfully!")
      setShowDeleteDialog(false)
      fetchCommunities(true)
    } catch (err) {
      console.error("Failed to delete community:", err)
      toast.error(err.response?.data?.message || "Failed to delete community")
    }
  }

  // Toggle active/inactive status
  const handleToggleStatus = async (community) => {
    try {
      const token = localStorage.getItem("token")
      const newStatus = community.isActive ? "inactive" : "active"

      await api.put(
        `/admin/communities/${community._id}`,
        { isActive: !community.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      toast.success(`Community ${newStatus === "active" ? "activated" : "deactivated"} successfully!`)
      setActionCommunity(null)
      fetchCommunities(true)
    } catch (err) {
      console.error("Failed to toggle community status:", err)
      toast.error("Failed to update community status")
    }
  }

  // Export communities
  const handleExportCommunities = async () => {
    try {
      setRefreshing(true)

      // Create CSV content
      const headers = ["Name", "Category", "Privacy", "Status", "Members", "Creator", "Created Date"]
      const csvContent = [
        headers.join(","),
        ...communities.map((community) =>
          [
            `"${community.name || ""}"`,
            `"${community.category || ""}"`,
            `"${community.privacy || ""}"`,
            `"${community.isActive ? "Active" : "Inactive"}"`,
            `"${community.members?.length || 0}"`,
            `"${community.createdBy?.name || ""}"`,
            `"${format(new Date(community.createdAt), "yyyy-MM-dd HH:mm:ss")}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `sportsbuddy-communities-${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success("Communities exported successfully!")
    } catch (err) {
      console.error("Failed to export communities:", err)
      toast.error("Failed to export communities")
    } finally {
      setRefreshing(false)
    }
  }

  // Get privacy badge variant
  const getPrivacyBadgeVariant = (privacy) => {
    return privacy?.toLowerCase() === "private" ? "secondary" : "default"
  }

  // Get status badge variant
  const getStatusBadgeVariant = (isActive) => {
    return isActive ? "default" : "destructive"
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      football: "⚽",
      basketball: "🏀",
      tennis: "🎾",
      running: "🏃",
      cycling: "🚴",
      swimming: "🏊",
      volleyball: "🏐",
      cricket: "🏏",
      default: "👥",
    }
    return icons[category?.toLowerCase()] || icons.default
  }

  // Filter and paginate communities
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      !searchTerm ||
      community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || community.category === selectedCategory
    const matchesPrivacy = selectedPrivacy === "all" || community.privacy === selectedPrivacy
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && community.isActive) ||
      (selectedStatus === "inactive" && !community.isActive)

    return matchesSearch && matchesCategory && matchesPrivacy && matchesStatus
  })

  const paginatedCommunities = filteredCommunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Update total pages based on filtered results
  useEffect(() => {
    setTotalPages(Math.ceil(filteredCommunities.length / itemsPerPage))
  }, [filteredCommunities.length, itemsPerPage])

  // Loading skeleton
  const CommunitySkeleton = () => (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-32 sm:w-48 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 w-16 sm:w-24 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Mobile Community Card Component
  const MobileCommunityCard = ({ community, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 overflow-hidden">
        {/* Community Image */}
        <div className="relative h-32 overflow-hidden">
          {community.image ? (
            <img
              src={community.image || "/placeholder.svg"}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
              <div className="text-3xl">{getCategoryIcon(community.category)}</div>
            </div>
          )}

          {/* Status and Privacy Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant={getStatusBadgeVariant(community.isActive)} className="backdrop-blur-sm text-xs">
              {community.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={getPrivacyBadgeVariant(community.privacy)} className="backdrop-blur-sm text-xs">
              {community.privacy === "private" ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-2 right-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 h-8 w-8 p-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Community Actions</SheetTitle>
                  <SheetDescription className="text-left">Choose an action for {community.name}</SheetDescription>
                </SheetHeader>
                <div className="grid gap-2 py-4">
                  <Button variant="ghost" className="justify-start" onClick={() => handleViewCommunity(community)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleEditCommunity(community)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Community
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleToggleStatus(community)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {community.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="justify-start text-red-600"
                    onClick={() => handleDeleteCommunity(community)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Community
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Community Title and Category */}
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1 mb-1">
                {community.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {community.category}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  by {community.createdBy?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* Community Details */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>{community.members?.length || 0} members</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Description */}
            {community.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{community.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(community.createdAt), "MMM dd, yyyy")}
              </span>

              <button
                onClick={() => handleViewCommunity(community)}
                className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
              >
                View →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Desktop Community Card Component
  const DesktopCommunityCard = ({ community, index }) => (
    <motion.div
      key={community._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 overflow-hidden">
        {/* Community Image */}
        <div className="relative h-48 overflow-hidden">
          {community.image ? (
            <img
              src={community.image || "/placeholder.svg"}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
              <div className="text-4xl">{getCategoryIcon(community.category)}</div>
            </div>
          )}

          {/* Status and Privacy Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={getStatusBadgeVariant(community.isActive)} className="backdrop-blur-sm">
              {community.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={getPrivacyBadgeVariant(community.privacy)} className="backdrop-blur-sm">
              {community.privacy === "private" ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
          </div>

          {/* Action Menu */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActionCommunity(actionCommunity === community._id ? null : community._id)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {actionCommunity === community._id && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleViewCommunity(community)
                      setActionCommunity(null)
                    }}
                    className="w-full justify-start"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleEditCommunity(community)
                      setActionCommunity(null)
                    }}
                    className="w-full justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Community
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleToggleStatus(community)
                      setActionCommunity(null)
                    }}
                    className={`w-full justify-start ${community.isActive ? "text-orange-600" : "text-green-600"}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {community.isActive ? "Deactivate" : "Activate"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDeleteCommunity(community)
                      setActionCommunity(null)
                    }}
                    className="w-full justify-start text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Community
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Community Title and Category */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                {community.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {community.category}
                </Badge>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  by {community.createdBy?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* Community Details */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>{community.members?.length || 0} members</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Description */}
            {community.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{community.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(community.createdAt), "MMM dd, yyyy")}
              </span>

              <button
                onClick={() => handleViewCommunity(community)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4"
      >
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Communities</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => fetchCommunities(true)} className="bg-blue-600 hover:bg-blue-700">
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Community Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Manage communities and member activities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total communities: {communities.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={() => fetchCommunities(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
              <span className="sm:hidden">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none bg-white/20 border-gray-200/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 backdrop-blur-sm"
              onClick={handleExportCommunities}
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
            title: "Total Communities",
            value: communityStats.total?.toLocaleString() || communities.length.toLocaleString(),
            change: `+${communityStats.thisMonth || 0}`,
            changeType: "positive",
            icon: Users,
            color: "indigo",
            description: "All communities",
          },
          {
            title: "Active Communities",
            value:
              communityStats.active?.toString() ||
              communities.filter((c) => c.isActive).length.toLocaleString() ||
              "0",
            change: "+8%",
            changeType: "positive",
            icon: Activity,
            color: "green",
            description: "Currently active",
          },
          {
            title: "Total Members",
            value:
              communityStats.totalMembers?.toLocaleString() ||
              communities.reduce((sum, c) => sum + (c.members?.length || 0), 0).toLocaleString() ||
              "0",
            change: "+15%",
            changeType: "positive",
            icon: TrendingUp,
            color: "blue",
            description: "Total members",
          },
          {
            title: "Private Communities",
            value:
              communityStats.private?.toString() ||
              communities.filter((c) => c.privacy === "private").length.toLocaleString() ||
              "0",
            change: "35%",
            changeType: "neutral",
            icon: Lock,
            color: "orange",
            description: "Private groups",
          },
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
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-500/5 dark:to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            stat.changeType === "positive"
                              ? "text-green-600"
                              : stat.changeType === "negative"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{stat.description}</p>
                    </div>

                    <div className="p-2 sm:p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border-indigo-200/50 dark:border-indigo-700/50">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-400" />
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
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search communities by name, description, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                />
              </div>

              {/* Filters - Desktop always visible, Mobile collapsible */}
              <div
                className={cn(
                  "space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4",
                  showFilters ? "block" : "hidden lg:flex",
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Cycling">Cycling</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPrivacy} onValueChange={setSelectedPrivacy}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Filter by privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Privacy</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Options */}
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [field, order] = value.split("-")
                      setSortBy(field)
                      setSortOrder(order)
                    }}
                  >
                    <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                      <SelectItem value="members-desc">Most Members</SelectItem>
                      <SelectItem value="members-asc">Least Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Communities Grid */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg sm:text-xl">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Communities ({filteredCommunities.length})
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage and moderate platform communities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CommunitySkeleton key={index} />
                ))}
              </div>
            ) : paginatedCommunities.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Communities Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "Try adjusting your search criteria." : "No communities available."}
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <AnimatePresence>
                    {paginatedCommunities.map((community, index) => (
                      <div key={community._id}>
                        {/* Mobile View */}
                        <div className="block sm:hidden">
                          <MobileCommunityCard community={community} index={index} />
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block">
                          <DesktopCommunityCard community={community} index={index} />
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredCommunities.length)} of{" "}
                      {filteredCommunities.length} communities
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
                              className={
                                currentPage === page ? "bg-indigo-600 text-white" : "bg-white/50 dark:bg-gray-800/50"
                              }
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
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Community Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              Community Details
            </DialogTitle>
          </DialogHeader>
          {selectedCommunity && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Community Image */}
                {selectedCommunity.image && (
                  <div className="w-full h-32 sm:h-48 rounded-lg overflow-hidden">
                    <img
                      src={selectedCommunity.image || "/placeholder.svg"}
                      alt={selectedCommunity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Community Name</Label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedCommunity.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">{selectedCommunity.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                    <Badge variant={getStatusBadgeVariant(selectedCommunity.isActive)}>
                      {selectedCommunity.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Privacy</Label>
                    <Badge variant={getPrivacyBadgeVariant(selectedCommunity.privacy)}>
                      {selectedCommunity.privacy}
                    </Badge>
                  </div>
                </div>

                {/* Members and Creator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedCommunity.members?.length || 0} members
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created By</Label>
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                      {selectedCommunity.createdBy?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created Date</Label>
                  <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                    {format(new Date(selectedCommunity.createdAt), "PPP")}
                  </p>
                </div>

                {/* Description */}
                {selectedCommunity.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base">
                      {selectedCommunity.description}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button
              onClick={() => handleEditCommunity(selectedCommunity)}
              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            >
              Edit Community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Community Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Community
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{selectedCommunity?.name}</strong>"? This action cannot be
              undone and will permanently remove the community and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDeleteCommunity}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Delete Community
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

export default ManageCommunities
