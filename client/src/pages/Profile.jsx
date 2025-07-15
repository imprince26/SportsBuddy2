import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Progress } from "@/components/ui/progress"
import api from "@/utils/api"

// Zod schema for validation
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

// Followers/Following Dialog Component
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
      <DialogContent className="max-w-md max-h-[600px] overflow-hidden bg-card-light dark:bg-card-dark">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[400px] space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {type} yet</p>
            </div>
          ) : (
            users.map((userData) => (
              <div
                key={userData._id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userData.avatar?.url || "/placeholder.svg"} />
                    <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{userData.name}</p>
                    <p className="text-xs text-muted-foreground">@{userData.username}</p>
                  </div>
                </div>
                {user && user._id !== userData._id && (
                  <Button
                    size="sm"
                    variant={userData.isFollowedByCurrentUser ? "outline" : "default"}
                    onClick={() =>
                      userData.isFollowedByCurrentUser ? handleUnfollow(userData._id) : handleFollow(userData._id)
                    }
                  >
                    {userData.isFollowedByCurrentUser ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
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
  const [userStats, SetUserStats] = useState({})

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

  // Dynamically set page title
  useEffect(() => {
    document.title = `${user ? `${user.name}'s Profile` : "Profile"} - SportsBuddy`
  }, [user])

  useEffect(() => {
    const fetchUserStats = async () => {
      const res = await api.get(`/users/stats/${user.id}`);
      SetUserStats(res.data.data)
    }
    if (user) {
      fetchUserStats();
    }
  }, [])

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

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      if (avatarFile) formData.append("avatar", avatarFile)
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, typeof value === "object" ? JSON.stringify(value) : value)
      })

      const response = await updateProfile(formData)

      if (response.error) {
        toast.error(response.error.message, { id: toastId })
        return
      }

      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(response.data.avatar?.url || "/placeholder.svg")
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

  const getSkillLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const cardClassName = "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark hover:shadow-xl transition-all duration-300"

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-muted-light/20 dark:to-muted-dark/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-border-light dark:border-border-dark shadow-lg rounded-xl">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary via-primary/80 to-secondary relative overflow-hidden">
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                {editing ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditing(false)
                        setAvatarFile(null)
                        setAvatarPreview(user.avatar?.url || "/placeholder.svg")
                        reset()
                      }}
                      disabled={loading}
                      className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-primary"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark hover:bg-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            <CardContent className={`relative pt-16 pb-6 ${cardClassName}`}>
              {/* Avatar */}
              <div className="absolute -top-16 left-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarPreview || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
              </div>
              {/* Stats */}
              <div className="flex justify-end gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {userStats?.eventsCreated || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                    <Target className="w-5 h-5 text-blue-500" />
                    {userStats?.eventsParticipated || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Events Joined</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setFollowersDialogOpen(true)}>
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    <Users className="w-5 h-5 text-green-500" />
                    {userStats?.followers || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setFollowingDialogOpen(true)}>
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    <UserPlus className="w-5 h-5 text-purple-500" />
                    {userStats?.following || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>
              {/* Profile Info */}
              <div className="space-y-4">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className="mt-1"
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username
                      </Label>
                      <Input
                        id="username"
                        {...register("username")}
                        className="mt-1"
                        placeholder="@username"
                      />
                      {errors.username && <p className="text-destructive text-xs mt-1">{errors.username.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        {...register("email")}
                        className="mt-1"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        {...register("bio")}
                        className="mt-1"
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                      {errors.bio && <p className="text-destructive text-xs mt-1">{errors.bio.message}</p>}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        {user.name}
                        {user.role === "admin" && <Crown className="w-6 h-6 text-yellow-500" />}
                      </h1>
                      <p className="text-muted-foreground text-lg">@{user.username}</p>
                    </div>
                    {user.bio && <p className="text-foreground text-justify leading-relaxed max-w-2xl">{user.bio}</p>}
                    {/* Location & Join Date */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {(user.location?.city || user.location?.state || user.location?.country) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {[user.location?.city, user.location?.state, user.location?.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {format(new Date(user.createdAt || Date.now()), "MMMM yyyy")}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm ">
            <TabsTrigger value="overview" className="flex items-center dark:data-[state=active]:bg-primary-dark data-[state=active]:bg-primary-light data-[state=active]:text-foreground-dark dark:text-foreground-dark gap-2 rounded-xl">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sports" className="flex items-center dark:data-[state=active]:bg-primary-dark data-[state=active]:bg-primary-light data-[state=active]:text-foreground-dark dark:text-foreground-dark gap-2 rounded-xl">
              <Dumbbell className="w-4 h-4" />
              Sports
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center dark:data-[state=active]:bg-primary-dark data-[state=active]:bg-primary-light data-[state=active]:text-foreground-dark dark:text-foreground-dark gap-2 rounded-xl">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center dark:data-[state=active]:bg-primary-dark data-[state=active]:bg-primary-light data-[state=active]:text-foreground-dark dark:text-foreground-dark gap-2 rounded-xl">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className={`lg:col-span-2 ${cardClassName} `}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {userStats?.eventsCreated || 0}
                      </div>
                      <div className="text-sm text-blue-600/70 dark:text-blue-400/70">Events Created</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {userStats?.eventsParticipated || 0}
                      </div>
                      <div className="text-sm text-green-600/70 dark:text-green-400/70">Events Joined</div>
                    </div>
                  </div>
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Completion</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Activity Level</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Recent Achievements */}
              <Card className={cardClassName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.achievements && user.achievements.length > 0 ? (
                    <div className="space-y-3">
                      {user.achievements.slice(0, 3).map((achievement, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Medal className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(achievement.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No achievements yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Sports Tab */}
          <TabsContent value="sports" className="space-y-6">
            <Card className={cardClassName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    Sports Preferences
                  </div>
                  {editing && (
                    <Button variant="outline" size="sm" onClick={() => setOpenSportDialog(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Sport
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sportsFields.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sportsFields.map((sport, index) => (
                      <div
                        key={sport.id}
                        className="relative group p-4 rounded-lg border bg-gradient-to-br from-background-light to-muted/20 dark:from-background-dark dark:to-muted/20 hover:bg-gradient-to-br hover:from-background-light hover:dark:from-background-dark hover:to-muted/20 hover:dark hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getSportIcon(sport.sport)}</span>
                            <h3 className="font-medium">{sport.sport}</h3>
                          </div>
                          {editing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSport(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Badge variant="secondary" className={`${getSkillLevelColor(sport.skillLevel)} border`}>
                          {sport.skillLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No sports preferences yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your favorite sports to connect with like-minded athletes
                    </p>
                    {editing && (
                      <Button onClick={() => setOpenSportDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Sport
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className={cardClassName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                  </div>
                  {!editing && (
                    <Button variant="outline" size="sm" onClick={() => setOpenAchievementDialog(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Achievement
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.achievements && user.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {user.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="group p-4 rounded-lg border bg-gradient-to-r from-background-light to-muted/20 dark:from-background-dark dark:to-muted/20 hover:bg-gradient-to-r hover:from-background-light hover:dark:from-background-dark hover:dark  hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800">
                            <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(new Date(achievement.date), "MMMM dd, yyyy")}
                            </p>
                            {achievement.description && <p className="text-foreground">{achievement.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                    <p className="text-muted-foreground mb-4">Start participating in events to earn achievements</p>
                    <Button onClick={() => setOpenAchievementDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Achievement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Settings */}
              <Card className={cardClassName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location.city">City</Label>
                        <Input
                          id="location.city"
                          {...register("location.city")}
                          className="mt-1"
                          placeholder="Your city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location.state">State</Label>
                        <Input
                          id="location.state"
                          {...register("location.state")}
                          className="mt-1"
                          placeholder="Your state"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location.country">Country</Label>
                        <Input
                          id="location.country"
                          {...register("location.country")}
                          className="mt-1"
                          placeholder="Your country"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(user.location?.city || user.location?.state || user.location?.country) ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {[user.location?.city, user.location?.state, user.location?.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No location set</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Social Links */}
              <Card className={cardClassName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="socialLinks.facebook">Facebook</Label>
                        <Input
                          id="socialLinks.facebook"
                          {...register("socialLinks.facebook")}
                          className="mt-1"
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="socialLinks.twitter">Twitter</Label>
                        <Input
                          id="socialLinks.twitter"
                          {...register("socialLinks.twitter")}
                          className="mt-1"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="socialLinks.instagram">Instagram</Label>
                        <Input
                          id="socialLinks.instagram"
                          {...register("socialLinks.instagram")}
                          className="mt-1"
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {user.socialLinks?.facebook && (
                        <a
                          href={user.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-400"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {user.socialLinks?.twitter && (
                        <a
                          href={user.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors dark:bg-sky-900 dark:text-sky-400"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {user.socialLinks?.instagram && (
                        <a
                          href={user.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors dark:bg-pink-900 dark:text-pink-400"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {!user.socialLinks?.facebook &&
                        !user.socialLinks?.twitter &&
                        !user.socialLinks?.instagram && (
                          <p className="text-muted-foreground">No social links added</p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Sports Preference Dialog */}
        <Dialog open={openSportDialog} onOpenChange={setOpenSportDialog}>
          <DialogContent className="max-w-lg bg-card-light dark:bg-card-dark">
            <DialogHeader>
              <DialogTitle>Add Sport Preference</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sport">Sport</Label>
                <Select
                  onValueChange={(value) => {
                    const newSport = { sport: value, skillLevel: "Beginner" }
                    appendSport(newSport)
                    setOpenSportDialog(false)
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Achievement Dialog */}
        <Dialog open={openAchievementDialog} onOpenChange={setOpenAchievementDialog}>
          <DialogContent className="max-w-lg bg-card-light dark:bg-card-dark">
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={achievementForm.handleSubmit(handleAddAchievement)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...achievementForm.register("title")}
                  className="mt-1"
                  placeholder="Achievement title"
                />
                {achievementForm.formState.errors.title && (
                  <p className="text-destructive text-xs mt-1">
                    {achievementForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...achievementForm.register("description")}
                  className="mt-1"
                  rows={3}
                  placeholder="Describe your achievement..."
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...achievementForm.register("date")}
                  className="mt-1"
                />
                {achievementForm.formState.errors.date && (
                  <p className="text-destructive text-xs mt-1">
                    {achievementForm.formState.errors.date.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAchievementDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={achievementForm.formState.isSubmitting}>
                  {achievementForm.formState.isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
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
          userId={user.id}
        />
        <FollowersDialog
          isOpen={followingDialogOpen}
          onClose={() => setFollowingDialogOpen(false)}
          type="following"
          userId={user.id}
        />
      </div>
    </div>
  )
}

export default Profile