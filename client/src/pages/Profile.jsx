/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  MapPin,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Dumbbell,
  Plus,
  Users,
  Settings,
  Trophy,
  Calendar,
  Heart,
  Activity,
  Crown,
  Medal,
  ChevronRight,
  Share2,
  MessageCircle,
  Flame,
  Globe,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import { FaInstagram as Instagram, FaFacebook as Facebook } from "react-icons/fa";
import { FaXTwitter as Twitter } from "react-icons/fa6";
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
import { profileSchema, achievementSchema } from "@/schemas/profileSchema"
import FollowersDialog from "@/components/profile/FollowersDialog"


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
      setAvatarPreview(user.avatar?.url)
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
        return "bg-muted text-muted-foreground border-border"
      case "Intermediate":
        return "bg-primary/10 text-primary border-primary/20"
      case "Advanced":
        return "bg-primary text-primary-foreground border-primary"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
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
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-none shadow-none bg-transparent">
          <div className="relative rounded-3xl overflow-hidden border bg-card text-card-foreground shadow-sm">
            {/* Cover Image */}
            <div className="h-48 md:h-64 relative bg-muted">
              {coverImagePreview ? (
                <img
                  src={coverImagePreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.coverImage?.url ? (
                  <img
                    src={user.coverImage.url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )
              )}

              {/* Cover Image Upload */}
              {editing && (
                <label className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />
                </label>
              )}

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
                        setCoverImage(null)
                        setAvatarPreview(user.avatar?.url || "/placeholder.svg")
                        setCoverImagePreview(user.coverImage?.url || "")
                        reset()
                      }}
                      disabled={loading}
                      className="bg-background/80 backdrop-blur-sm hover:bg-background"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="bg-background/80 backdrop-blur-sm hover:bg-background"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Profile
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-background/80 backdrop-blur-sm hover:bg-background"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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

            <div className="px-6 pb-6 pt-16 relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-6 md:left-10">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarPreview} className="object-cover" />
                    <AvatarFallback className="text-6xl bg-primary/10 backdrop-blur-lg text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {editing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
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
              <div className="flex justify-end gap-4 md:gap-8 mb-6 overflow-x-auto pb-2 md:pb-0">
                {[
                  { label: "Events Created", value: userStats?.eventsCreated || 0 },
                  { label: "Events Joined", value: userStats?.eventsParticipated || 0 },
                  { label: "Followers", value: userStats?.followers || 0, onClick: () => setFollowersDialogOpen(true) },
                  { label: "Following", value: userStats?.following || 0, onClick: () => setFollowingDialogOpen(true) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`text-center ${stat.onClick ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
                    onClick={stat.onClick}
                  >
                    <div className="text-xl font-bold flex items-center justify-center gap-1.5">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Profile Info */}
              <div className="space-y-6">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...register("username")}
                        placeholder="@username"
                      />
                      {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        {...register("email")}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...register("bio")}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                      {errors.bio && <p className="text-destructive text-xs">{errors.bio.message}</p>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        {user.name}
                        {user.role === "admin" && (
                          <Crown className="w-6 h-6 text-primary" />
                        )}
                      </h1>
                      <p className="text-lg text-muted-foreground mb-4">@{user.username}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                          {/* <Shield className="w-3 h-3 mr-1" /> */}
                          Verified Athlete
                        </Badge>
                        <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted/80 border-border">
                          {/* <Check className="w-3 h-3 mr-1" /> */}
                          Active Member
                        </Badge>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="mb-6 max-w-2xl">
                        <p className="text-muted-foreground leading-relaxed">
                          {user.bio}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                      {(user.location?.city || user.location?.state || user.location?.country) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {[user.location?.city, user.location?.state, user.location?.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined {format(new Date(user.createdAt || Date.now()), "MMMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span>
                          {Math.floor(Math.random() * 50) + 10} day streak
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-xl">
            {[
              { value: "overview", icon: Activity, label: "Overview" },
              { value: "sports", icon: Dumbbell, label: "Sports" },
              { value: "achievements", icon: Award, label: "Achievements" },
              { value: "settings", icon: Settings, label: "Settings" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                {/* <tab.icon className="w-4 h-4" /> */}
                <span className="inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Overview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* <TrendingUp className="w-5 h-5 text-primary" /> */}
                      Activity Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-6 rounded-xl bg-muted/50 border">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {userStats?.eventsCreated || 0}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Events Created</div>
                      </div>
                      <div className="text-center p-6 rounded-xl bg-muted/50 border">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {userStats?.eventsParticipated || 0}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Events Joined</div>
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Profile Completion</span>
                          <span className="text-primary font-bold">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Activity Level</span>
                          <span className="text-primary font-bold">74%</span>
                        </div>
                        <Progress value={74} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Community Engagement</span>
                          <span className="text-primary font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats & Achievements */}
              <div className="space-y-6">
                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* <Sparkles className="w-5 h-5 text-primary" /> */}
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.achievements && user.achievements.length > 0 ? (
                      <div className="space-y-3">
                        {user.achievements.slice(0, 3).map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border"
                          >
                            <Medal className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {achievement.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(achievement.earnedAt), "MMMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">No achievements yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Start participating in events!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* <Zap className="w-5 h-5 text-primary" /> */}
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { icon: Globe, label: "Browse Events" },
                      { icon: Plus, label: "Create Event" },
                      { icon: Users, label: "Find Athletes" },
                      { icon: Trophy, label: "View Leaderboard" },
                    ].map((action) => (
                      <button
                        key={action.label}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <action.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{action.label}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sports Tab */}
          <TabsContent value="sports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {/* <Dumbbell className="w-5 h-5 text-primary" /> */}
                    Sports Preferences
                  </CardTitle>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenSportDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Sport
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sportsFields.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sportsFields.map((sport, index) => (
                      <div
                        key={sport.id}
                        className="relative group p-6 rounded-xl border bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{sport.sport}</h3>
                          </div>
                          {editing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSport(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${getSkillLevelColor(sport.skillLevel)} border font-medium`}
                        >
                          {sport.skillLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Dumbbell className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-20" />
                    <h3 className="text-xl font-semibold mb-3">No sports preferences yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Add your favorite sports to connect with like-minded athletes and discover exciting events
                    </p>
                    {editing && (
                      <Button
                        onClick={() => setOpenSportDialog(true)}
                      >
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {/* <Award className="w-5 h-5 text-primary" /> */}
                    Achievements & Milestones
                  </CardTitle>
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenAchievementDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Achievement
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {user.achievements && user.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {user.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="group p-6 rounded-xl border bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-5">
                          <div className="p-3 rounded-full bg-primary/10 text-primary flex-shrink-0">
                            <Award className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {format(new Date(achievement.earnedAt), "MMMM dd, yyyy")}
                            </p>
                            {achievement.description && (
                              <p className="text-muted-foreground leading-relaxed">{achievement.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Trophy className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-20" />
                    <h3 className="text-xl font-semibold mb-3">No achievements yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start participating in events to earn achievements and build your sports legacy
                    </p>
                    <Button
                      onClick={() => setOpenAchievementDialog(true)}
                    >
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Location Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {/* <MapPin className="w-5 h-5 text-primary" /> */}
                    Location Information
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
                          placeholder="Your city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location.state">State/Province</Label>
                        <Input
                          id="location.state"
                          {...register("location.state")}
                          placeholder="Your state or province"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location.country">Country</Label>
                        <Input
                          id="location.country"
                          {...register("location.country")}
                          placeholder="Your country"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(user.location?.city || user.location?.state || user.location?.country) ? (
                        <div className="p-4 rounded-xl bg-muted/50 border">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="font-medium">Current Location</span>
                          </div>
                          <p className="text-muted-foreground ml-8">
                            {[user.location?.city, user.location?.state, user.location?.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                          <p className="text-muted-foreground">No location information set</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add your location to connect with nearby athletes
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {/* <Heart className="w-5 h-5 text-primary" /> */}
                    Social Media Links
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
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="socialLinks.twitter">Twitter</Label>
                        <Input
                          id="socialLinks.twitter"
                          {...register("socialLinks.twitter")}
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="socialLinks.instagram">Instagram</Label>
                        <Input
                          id="socialLinks.instagram"
                          {...register("socialLinks.instagram")}
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {user.socialLinks?.facebook && (
                        <a
                          href={user.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          <Facebook className="w-5 h-5" />
                          <span className="font-medium">Facebook</span>
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                      {user.socialLinks?.twitter && (
                        <a
                          href={user.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-black/5 text-black/60  dark:text-white transition-colors hover:bg-black/10 dark:bg-black/90 dark:hover:bg-black/60"
                        >
                          <Twitter className="w-5 h-5" />
                          <span className="font-medium">X (Twitter)</span>
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                      {user.socialLinks?.instagram && (
                        <a
                          href={user.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30"
                        >
                          <Instagram className="w-5 h-5" />
                          <span className="font-medium">Instagram</span>
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                      {!user.socialLinks?.facebook &&
                        !user.socialLinks?.twitter &&
                        !user.socialLinks?.instagram && (
                          <div className="text-center py-8">
                            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground">No social links added</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Connect your social media to share your sports journey
                            </p>
                          </div>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Sport Preference</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="sport">Sport</Label>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"].map(
                      (sport) => (
                        <SelectItem key={sport} value={sport}>
                          <div className="flex items-center gap-2">
                            {sport}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSportPreference}
                disabled={!selectedSport || !selectedSkillLevel}
              >
                Add Sport
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Achievement Dialog */}
        <Dialog open={openAchievementDialog} onOpenChange={setOpenAchievementDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={achievementForm.handleSubmit(handleAddAchievement)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...achievementForm.register("title")}
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
                />
                {achievementForm.formState.errors.date && (
                  <p className="text-destructive text-xs mt-1">
                    {achievementForm.formState.errors.date.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenAchievementDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={achievementForm.formState.isSubmitting}
                >
                  {achievementForm.formState.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
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
