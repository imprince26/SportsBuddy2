/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import {
  MapPin,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Facebook,
  Twitter,
  Instagram,
  Dumbbell,
  Plus,
  Users,
  UserPlus,
  Settings,
  Trophy,
  Calendar,
  Heart,
  TrendingUp,
  Activity,
  Target,
  Crown,
  Medal,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
  Share2,
  MessageCircle,
  Check,
  Flame,
  Globe,
  Image as ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import api from "@/utils/api"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  location: z.object({
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
  }),
  socialLinks: z.object({
    facebook: z.string().optional().or(z.literal("")),
    twitter: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
  }),
  sportsPreferences: z
    .array(
      z.object({
        sport: z.enum([
          "Football",
          "Basketball",
          "Tennis",
          "Running",
          "Cycling",
          "Swimming",
          "Volleyball",
          "Cricket",
          "Other",
        ]),
        skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
      }),
    )
    .optional(),
})

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
})

const FollowersDialog = ({ isOpen, onClose, type, userId }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { getUserFollowers, getUserFollowing, followUser, unfollowUser, user } = useAuth()

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers()
    }
  }, [isOpen, userId])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = type === "followers" ? await getUserFollowers(userId) : await getUserFollowing(userId)
      setUsers(data || [])
    } catch (error) {
      toast.error(`Failed to load ${type}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId) => {
    try {
      await followUser(targetUserId)
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUserId ? { ...u, isFollowedByCurrentUser: true } : u))
      )
    } catch (error) {
      toast.error("Failed to follow user")
    }
  }

  const handleUnfollow = async (targetUserId) => {
    try {
      await unfollowUser(targetUserId)
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUserId ? { ...u, isFollowedByCurrentUser: false } : u))
      )
    } catch (error) {
      toast.error("Failed to unfollow user")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="w-5 h-5 text-blue-500" />
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[400px] space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 text-gray-600 dark:text-gray-400"
            >
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {type} yet</p>
            </motion.div>
          ) : (
            users.map((userData, index) => (
              <motion.div
                key={userData._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-blue-500/20">
                    <AvatarImage src={userData.avatar?.url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {userData.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{userData.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">@{userData.username}</p>
                  </div>
                </div>
                {user && user._id !== userData._id && (
                  <Button
                    size="sm"
                    variant={userData.isFollowedByCurrentUser ? "outline" : "default"}
                    onClick={() =>
                      userData.isFollowedByCurrentUser ? handleUnfollow(userData._id) : handleFollow(userData._id)
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    {userData.isFollowedByCurrentUser ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const Profile = () => {
  const { user, updateProfile, addAchievement } = useAuth()
  const [editing, setEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [openSportDialog, setOpenSportDialog] = useState(false)
  const [openAchievementDialog, setOpenAchievementDialog] = useState(false)
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false)
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [userStats, setUserStats] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState("")
  const [selectedSport, setSelectedSport] = useState("")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("")


  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      location: { city: "", state: "", country: "" },
      socialLinks: { facebook: "", twitter: "", instagram: "" },
      sportsPreferences: [],
    },
  })

  const {
    fields: sportsFields,
    append: appendSport,
    remove: removeSport,
  } = useFieldArray({
    control,
    name: "sportsPreferences",
  })

  const achievementForm = useForm({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  useEffect(() => {
    document.title = `${user ? `${user.name}'s Profile` : "Profile"} - SportsBuddy`
  }, [user])

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await api.get(`/users/stats/${user?.id || user?._id}`)
        setUserStats(res.data.data || {})
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      }
    }
    if (user) {
      fetchUserStats()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || { city: "", state: "", country: "" },
        socialLinks: user.socialLinks || { facebook: "", twitter: "", instagram: "" },
        sportsPreferences: user.sportsPreferences || [],
      })
      setAvatarPreview(user.avatar?.url || "/placeholder.svg")
      setCoverImagePreview(user.coverImage?.url || "")
    }
  }, [user, reset])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB")
        return
      }
      setCoverImage(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      if (avatarFile) formData.append("avatar", avatarFile)
      if (coverImage) formData.append("coverImage", coverImage)
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, typeof value === "object" ? JSON.stringify(value) : value)
      })

      const response = await updateProfile(formData)

      if (response.error) {
        toast.error(response.error.message)
        return
      }

      setEditing(false)
      setAvatarFile(null)
      setCoverImage(null)
      setAvatarPreview(response.data.avatar?.url || "/placeholder.svg")
      setCoverImagePreview(response.data.coverImage?.url || "")
    } catch (error) {
      console.error("Profile update error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAchievement = async (data) => {
    try {
      await addAchievement(data)
      achievementForm.reset()
      setOpenAchievementDialog(false)
      toast.success("Achievement added successfully")
    } catch (error) {
      toast.error("Failed to add achievement")
    }
  }

  const handleAddSportPreference = () => {
    if (selectedSport && selectedSkillLevel) {
      const newSport = { sport: selectedSport, skillLevel: selectedSkillLevel }
      appendSport(newSport)
      setSelectedSport("")
      setSelectedSkillLevel("")
      setOpenSportDialog(false)
    }
  }

  const getSkillLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getSportIcon = (sport) => {
    const icons = {
      Football: "⚽",
      Basketball: "🏀",
      Tennis: "🎾",
      Running: "🏃",
      Cycling: "🚴",
      Swimming: "🏊",
      Volleyball: "🏐",
      Cricket: "🏏",
      Other: "🏃",
    }
    return icons[sport] || "🏃"
  }

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

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
      if (coverImagePreview && coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview)
      }
    }
  }, [avatarPreview, coverImagePreview])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
          />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Loading your profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-5"
            style={{
              left: `${15 + (i * 12) % 70}%`,
              top: `${10 + (i * 15) % 80}%`,
              width: `${30 + (i % 3) * 20}px`,
              height: `${30 + (i % 3) * 20}px`,
              background: `linear-gradient(135deg, ${['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]
                }, transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 8 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Profile Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl">
              <div className="relative">
                {/* Cover Image */}
                <div className="h-64 relative overflow-hidden">
                  {coverImagePreview ? (
                    <img
                      src={coverImagePreview}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (
                      user.coverImage?.url ? (
                        <img
                          src={user.coverImage.url}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
                      )
                    )

                  )}

                  {/* Overlay pattern */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

                  {/* Cover Image Upload */}
                  {editing && (
                    <motion.label
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageChange}
                      />
                    </motion.label>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-3">
                    {editing ? (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditing(false)
                              setAvatarFile(null)
                              setCoverImage(null)
                              setAvatarPreview(user.avatar?.url || "/placeholder.svg")
                              setCoverImagePreview(user.coverImage?.url || "")
                              reset()
                            }}
                            disabled={loading}
                            className="bg-white/90 hover:bg-white text-gray-900 border-0 shadow-lg backdrop-blur-sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                          >
                            {loading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditing(true)}
                            className="bg-white/90 hover:bg-white text-gray-900 border-0 shadow-lg backdrop-blur-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Profile
                          </Button>
                        </motion.div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/90 hover:bg-white text-gray-900 border-0 shadow-lg backdrop-blur-sm"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>

                <CardContent className="relative pt-20 pb-8">
                  {/* Avatar */}
                  <div className="absolute -top-16 left-8">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-2xl">
                        <AvatarImage src={avatarPreview || "/placeholder.svg"} />
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <motion.label
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Camera className="w-8 h-8 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </motion.label>
                      )}
                      {/* Online Status */}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-end gap-8 mb-8">
                    {[
                      { label: "Events Created", value: userStats?.eventsCreated || 0, icon: Trophy, color: "text-yellow-500" },
                      { label: "Events Joined", value: userStats?.eventsParticipated || 0, icon: Target, color: "text-blue-500" },
                      { label: "Followers", value: userStats?.followers || 0, icon: Users, color: "text-green-500", onClick: () => setFollowersDialogOpen(true) },
                      { label: "Following", value: userStats?.following || 0, icon: UserPlus, color: "text-purple-500", onClick: () => setFollowingDialogOpen(true) },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`text-center ${stat.onClick ? 'cursor-pointer' : ''} group`}
                        onClick={stat.onClick}
                      >
                        <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-6">
                    {editing ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            {...register("name")}
                            className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                            placeholder="Your full name"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Username
                          </Label>
                          <Input
                            id="username"
                            {...register("username")}
                            className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                            placeholder="@username"
                          />
                          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            {...register("email")}
                            className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                            placeholder="your.email@example.com"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            {...register("bio")}
                            className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                            rows={4}
                            placeholder="Tell us about yourself, your sports journey, achievements..."
                          />
                          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="mb-6">
                          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                            {user.name}
                            {user.role === "admin" && (
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Crown className="w-8 h-8 text-yellow-500" />
                              </motion.div>
                            )}
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                              Level {Math.floor((userStats?.eventsCreated || 0) / 5) + 1}
                            </Badge>
                          </h1>
                          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">@{user.username}</p>

                          {/* Verification Badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified Athlete
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              <Check className="w-3 h-3 mr-1" />
                              Active Member
                            </Badge>
                          </div>
                        </div>

                        {user.bio && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6"
                          >
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                              {user.bio}
                            </p>
                          </motion.div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400"
                        >
                          {(user.location?.city || user.location?.state || user.location?.country) && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">
                                {[user.location?.city, user.location?.state, user.location?.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-500" />
                            <span className="font-medium">
                              Joined {format(new Date(user.createdAt || Date.now()), "MMMM yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">
                              {Math.floor(Math.random() * 50) + 10} day streak
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-1 shadow-lg">
                {[
                  { value: "overview", icon: Activity, label: "Overview" },
                  { value: "sports", icon: Dumbbell, label: "Sports" },
                  { value: "achievements", icon: Award, label: "Achievements" },
                  { value: "settings", icon: Settings, label: "Settings" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-medium"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Activity Overview */}
                  <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2"
                  >
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <TrendingUp className="w-6 h-6 text-blue-500" />
                          Activity Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50"
                          >
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                              {userStats?.eventsCreated || 0}
                            </div>
                            <div className="text-sm text-blue-600/70 dark:text-blue-400/70 font-medium">Events Created</div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50"
                          >
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                              {userStats?.eventsParticipated || 0}
                            </div>
                            <div className="text-sm text-green-600/70 dark:text-green-400/70 font-medium">Events Joined</div>
                          </motion.div>
                        </div>

                        {/* Progress Indicators */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">87%</span>
                            </div>
                            <Progress value={87} className="h-3 bg-gray-200 dark:bg-gray-700" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Activity Level</span>
                              <span className="text-green-600 dark:text-green-400 font-bold">74%</span>
                            </div>
                            <Progress value={74} className="h-3 bg-gray-200 dark:bg-gray-700" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Community Engagement</span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">92%</span>
                            </div>
                            <Progress value={92} className="h-3 bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Quick Stats & Achievements */}
                  <motion.div variants={itemVariants} className="space-y-6">
                    {/* Recent Achievements */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                          Recent Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {user.achievements && user.achievements.length > 0 ? (
                          <div className="space-y-3">
                            {user.achievements.slice(0, 3).map((achievement, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 5 }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200/50 dark:border-yellow-700/50"
                              >
                                <Medal className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {achievement.title}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {format(new Date(achievement.earnedAt), "MMMM dd, yyyy")}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Award className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">No achievements yet</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Start participating in events!
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Zap className="w-5 h-5 text-purple-500" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { icon: Globe, label: "Browse Events", color: "blue" },
                          { icon: Plus, label: "Create Event", color: "green" },
                          { icon: Users, label: "Find Athletes", color: "purple" },
                          { icon: Trophy, label: "View Leaderboard", color: "yellow" },
                        ].map((action, index) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 hover:shadow-md
                              ${action.color === 'blue' ? 'bg-blue-50/50 border-blue-200/50 hover:bg-blue-100/50 dark:bg-blue-900/10 dark:border-blue-700/50' :
                                action.color === 'green' ? 'bg-green-50/50 border-green-200/50 hover:bg-green-100/50 dark:bg-green-900/10 dark:border-green-700/50' :
                                  action.color === 'purple' ? 'bg-purple-50/50 border-purple-200/50 hover:bg-purple-100/50 dark:bg-purple-900/10 dark:border-purple-700/50' :
                                    'bg-yellow-50/50 border-yellow-200/50 hover:bg-yellow-100/50 dark:bg-yellow-900/10 dark:border-yellow-700/50'
                              }`}
                          >
                            <div className={`p-2 rounded-lg
                              ${action.color === 'blue' ? 'bg-blue-500' :
                                action.color === 'green' ? 'bg-green-500' :
                                  action.color === 'purple' ? 'bg-purple-500' :
                                    'bg-yellow-500'
                              }`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                          </motion.button>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Sports Tab */}
              <TabsContent value="sports" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Dumbbell className="w-6 h-6 text-blue-500" />
                          Sports Preferences
                        </CardTitle>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenSportDialog(true)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Sport
                          </Button>
                        </motion.div>

                      </div>
                    </CardHeader>
                    <CardContent>
                      {sportsFields.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {sportsFields.map((sport, index) => (
                            <motion.div
                              key={sport.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              onHoverStart={() => setHoveredCard(index)}
                              onHoverEnd={() => setHoveredCard(null)}
                              className="relative group p-6 rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                            >
                              {/* Floating particles for hovered card */}
                              {hoveredCard === index && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {[...Array(3)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 bg-blue-500/60 rounded-full"
                                      style={{
                                        left: `${20 + Math.random() * 60}%`,
                                        top: `${20 + Math.random() * 60}%`,
                                      }}
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0],
                                        y: [0, -20, -40],
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <motion.span
                                    animate={{
                                      rotate: hoveredCard === index ? [0, 10, -10, 0] : 0,
                                      scale: hoveredCard === index ? 1.1 : 1
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="text-3xl"
                                  >
                                    {getSportIcon(sport.sport)}
                                  </motion.span>
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{sport.sport}</h3>
                                </div>
                                {editing && (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSport(index)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                              <Badge
                                variant="secondary"
                                className={`${getSkillLevelColor(sport.skillLevel)} border font-medium`}
                              >
                                {sport.skillLevel}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Dumbbell className="w-20 h-20 mx-auto mb-6 text-gray-400 opacity-50" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No sports preferences yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            Add your favorite sports to connect with like-minded athletes and discover exciting events
                          </p>
                          {editing && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => setOpenSportDialog(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Sport
                              </Button>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Award className="w-6 h-6 text-yellow-500" />
                          Achievements & Milestones
                        </CardTitle>
                        {!editing && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenAchievementDialog(true)}
                              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Achievement
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {user.achievements && user.achievements.length > 0 ? (
                        <div className="space-y-6">
                          {user.achievements.map((achievement, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="group p-6 rounded-2xl border bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200/50 dark:border-yellow-700/50 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex items-start gap-5">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex-shrink-0"
                                >
                                  <Award className="w-8 h-8 text-white" />
                                </motion.div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white">{achievement.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {format(new Date(achievement.earnedAt), "MMMM dd, yyyy")}
                                  </p>
                                  {achievement.description && (
                                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{achievement.description}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Trophy className="w-20 h-20 mx-auto mb-6 text-gray-400 opacity-50" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No achievements yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            Start participating in events to earn achievements and build your sports legacy
                          </p>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => setOpenAchievementDialog(true)}
                              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0 shadow-lg"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First Achievement
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Location Settings */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <MapPin className="w-6 h-6 text-blue-500" />
                          Location Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editing ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="location.city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                City
                              </Label>
                              <Input
                                id="location.city"
                                {...register("location.city")}
                                className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="Your city"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location.state" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                State/Province
                              </Label>
                              <Input
                                id="location.state"
                                {...register("location.state")}
                                className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="Your state or province"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location.country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Country
                              </Label>
                              <Input
                                id="location.country"
                                {...register("location.country")}
                                className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="Your country"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(user.location?.city || user.location?.state || user.location?.country) ? (
                              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200/50 dark:border-blue-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                  <MapPin className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium text-gray-900 dark:text-white">Current Location</span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 ml-8">
                                  {[user.location?.city, user.location?.state, user.location?.country]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                <p className="text-gray-600 dark:text-gray-400">No location information set</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Add your location to connect with nearby athletes
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Social Links */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Heart className="w-6 h-6 text-pink-500" />
                          Social Media Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editing ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="socialLinks.facebook" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Facebook
                              </Label>
                              <Input
                                id="socialLinks.facebook"
                                {...register("socialLinks.facebook")}
                                className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="https://facebook.com/username"
                              />
                            </div>
                            <div>
                              <Label htmlFor="socialLinks.twitter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Twitter
                              </Label>
                              <Input
                                id="socialLinks.twitter"
                                {...register("socialLinks.twitter")}
                                className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="https://twitter.com/username"
                              />
                            </div>
                            <div>
                              <Label htmlFor="socialLinks.instagram" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Instagram
                              </Label>
                              <Input
                                id="socialLinks.instagram"
                                {...register("socialLinks.instagram")}
                                className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="https://instagram.com/username"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {user.socialLinks?.facebook && (
                              <motion.a
                                href={user.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 text-blue-600 hover:bg-blue-100/50 transition-colors dark:bg-blue-900/10 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              >
                                <Facebook className="w-5 h-5" />
                                <span className="font-medium">Facebook</span>
                                <ChevronRight className="w-4 h-4 ml-auto" />
                              </motion.a>
                            )}
                            {user.socialLinks?.twitter && (
                              <motion.a
                                href={user.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-sky-50/50 text-sky-600 hover:bg-sky-100/50 transition-colors dark:bg-sky-900/10 dark:text-sky-400 dark:hover:bg-sky-900/20"
                              >
                                <Twitter className="w-5 h-5" />
                                <span className="font-medium">Twitter</span>
                                <ChevronRight className="w-4 h-4 ml-auto" />
                              </motion.a>
                            )}
                            {user.socialLinks?.instagram && (
                              <motion.a
                                href={user.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 text-pink-600 hover:bg-pink-100/50 transition-colors dark:bg-pink-900/10 dark:text-pink-400 dark:hover:bg-pink-900/20"
                              >
                                <Instagram className="w-5 h-5" />
                                <span className="font-medium">Instagram</span>
                                <ChevronRight className="w-4 h-4 ml-auto" />
                              </motion.a>
                            )}
                            {!user.socialLinks?.facebook &&
                              !user.socialLinks?.twitter &&
                              !user.socialLinks?.instagram && (
                                <div className="text-center py-8">
                                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                  <p className="text-gray-600 dark:text-gray-400">No social links added</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Connect your social media to share your sports journey
                                  </p>
                                </div>
                              )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>

        {/* Sports Preference Dialog */}
        <Dialog open={openSportDialog} onOpenChange={setOpenSportDialog}>
          <DialogContent className="max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Add Sport Preference</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="sport" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sport
                </Label>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    {["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"].map(
                      (sport) => (
                        <SelectItem key={sport} value={sport}>
                          <div className="flex items-center gap-2">
                            <span>{getSportIcon(sport)}</span>
                            {sport}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skillLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skill Level
                </Label>
                <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                  <SelectTrigger className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <SelectItem key={level} value={level}>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`${getSkillLevelColor(level)} border-0 text-xs`}
                          >
                            {level}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenSportDialog(false)
                  setSelectedSport("")
                  setSelectedSkillLevel("")
                }}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSportPreference}
                disabled={!selectedSport || !selectedSkillLevel}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Sport
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Achievement Dialog */}
        <Dialog open={openAchievementDialog} onOpenChange={setOpenAchievementDialog}>
          <DialogContent className="max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Add Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={achievementForm.handleSubmit(handleAddAchievement)} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                <Input
                  id="title"
                  {...achievementForm.register("title")}
                  className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Achievement title"
                />
                {achievementForm.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {achievementForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  {...achievementForm.register("description")}
                  className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                  rows={3}
                  placeholder="Describe your achievement..."
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...achievementForm.register("date")}
                  className="mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                />
                {achievementForm.formState.errors.date && (
                  <p className="text-red-500 text-xs mt-1">
                    {achievementForm.formState.errors.date.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenAchievementDialog(false)}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={achievementForm.formState.isSubmitting}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0"
                >
                  {achievementForm.formState.isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Add Achievement"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Followers/Following Dialogs */}
        <FollowersDialog
          isOpen={followersDialogOpen}
          onClose={() => setFollowersDialogOpen(false)}
          type="followers"
          userId={user?.id || user?._id}
        />
        <FollowersDialog
          isOpen={followingDialogOpen}
          onClose={() => setFollowingDialogOpen(false)}
          type="following"
          userId={user?.id || user?._id}
        />
      </div>
    </div>
  )
}

export default Profile
