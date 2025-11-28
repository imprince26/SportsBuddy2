import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useMetadata } from "@/hooks/useMetadata"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import {
  MapPin,
  Calendar,
  Award,
  Dumbbell,
  ChevronLeft,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  Trophy,
  Target,
  Crown,
  Medal,
  Star,
  Share2,
  MoreHorizontal,
  Flag,
  Mail,
  CheckCircle,
} from "lucide-react"
import { FaInstagram as Instagram, FaFacebook as Facebook } from "react-icons/fa";
import { FaXTwitter as Twitter } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import api from "@/utils/api"

const FollowersDialog = ({ isOpen, onClose, type, userId, onFollowChange }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { getUserFollowers, getUserFollowing, followUser, unfollowUser, user } = useAuth()

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers()
    }
  }, [isOpen, userId, type])

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

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    // Optimistic UI update
    const originalUsers = [...users]
    setUsers((prev) =>
      prev.map((u) =>
        u._id === targetUserId ? { ...u, isFollowedByCurrentUser: !isCurrentlyFollowing } : u,
      ),
    )

    try {
      const action = isCurrentlyFollowing ? unfollowUser : followUser
      const res = await action(targetUserId)
      if (!res.success) {
        throw new Error(res.message)
      }
      // toast.success(isCurrentlyFollowing ? "Unfollowed successfully!" : "Following successfully!")
      if (user._id === userId) {
        onFollowChange(!isCurrentlyFollowing)
      }
    } catch (error) {
      // Revert UI on error
      setUsers(originalUsers)
      toast.error(error.message || `Failed to ${isCurrentlyFollowing ? "unfollow" : "follow"} user`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[700px] overflow-hidden bg-background border-border shadow-2xl rounded-2xl animate-in slide-in-from-bottom-5 duration-300">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
            <div className="p-2 rounded-full bg-primary">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {type === "followers" ? "People following this user" : "People this user is following"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[500px] space-y-2 py-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="relative">
                <Users className="w-16 h-16 mx-auto text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">0</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground">No {type} yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {type === "followers" ? "No one is following this user yet" : "This user isn't following anyone yet"}
                </p>
              </div>
            </div>
          ) : (
            users.map((userData, index) => (
              <div
                key={userData._id}
                className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent transition-all duration-300 transform animate-in slide-in-from-left-5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/users/${userData._id}`} className="flex items-center gap-4 flex-1 min-w-0" onClick={onClose}>
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={userData.avatar?.url || "/placeholder.svg"} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {userData.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {userData.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {userData.name}
                      </p>
                      {userData.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{userData.username}</p>
                    {userData.bio && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">{userData.bio}</p>
                    )}
                  </div>
                </Link>

                {user && user._id !== userData._id && (
                  <Button
                    size="sm"
                    variant={userData.isFollowedByCurrentUser ? "outline" : "default"}
                    onClick={() => handleFollowToggle(userData._id, userData.isFollowedByCurrentUser)}
                    className={`ml-3 transition-all duration-300 transform hover:scale-105 ${userData.isFollowedByCurrentUser
                      ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      }`}
                  >
                    {userData.isFollowedByCurrentUser ? (
                      <>
                        <UserMinus className="w-3 h-3 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        Follow
                      </>
                    )}
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

const PublicProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { getUserProfile, followUser, unfollowUser, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false)
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false)
  const [userStats, setUserStats] = useState({})

  // Use metadata hook with user data
  useMetadata(profile ? { user: profile } : {})

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const userData = await getUserProfile(userId)
        if (!userData) {
          setError("User not found")
          return
        }
        setProfile(userData)

        if (user && userData.followers) {
          setIsFollowing(userData.followers.some((follower) => follower._id === user._id || follower === user._id))
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError(
          "Failed to load user profile. The user may not exist or you don't have permission to view this profile.",
        )
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId, getUserProfile, user])

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await api.get(`/users/stats/${userId}`)
        setUserStats(res.data.data)
      } catch (error) {
        console.error("Error fetching user stats:", error)
      }
    }
    if (userId) {
      fetchUserStats()
    }
  }, [])

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow users")
      return
    }

    const originalIsFollowing = isFollowing
    const originalStats = { ...userStats }

    // Optimistic UI Update
    setIsFollowing(!originalIsFollowing)
    setUserStats(prev => ({
      ...prev,
      followers: originalIsFollowing ? (prev.followers || 1) - 1 : (prev.followers || 0) + 1
    }))

    try {
      const action = originalIsFollowing ? unfollowUser : followUser
      const res = await action(userId)

      if (!res.success) {
        throw new Error(res.message)
      }
    } catch (error) {
      // Revert UI on error
      setIsFollowing(originalIsFollowing)
      setUserStats(originalStats)
      const errorMessage = error.message || "Failed to update follow status"
      toast.error(errorMessage)
    }
  }

  const getSkillLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700"
      case "Intermediate":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
    }
  }

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Profile link copied to clipboard!")
  }

  const coverImage = profile?.coverImage?.url

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Loading Profile</h3>
            <p className="text-muted-foreground">Fetching user information...</p>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-in slide-in-from-bottom-5 duration-500">
          <Card className="text-center p-8 border-border shadow-xl bg-card rounded-2xl">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Profile Not Found</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/events")} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-300">
                Browse Events
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="w-full hover:bg-accent">
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <div className="relative pb-20">
        {/* Cover Image Section */}
        <div className="h-80 relative w-full overflow-hidden">
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt={`${profile.name} cover`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-primary opacity-90">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>
          )}

          {/* Top Navigation Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-3">
              {user && user._id !== profile._id && (
                <Button
                  onClick={handleFollow}
                  className={`transition-all duration-300 shadow-lg backdrop-blur-md border border-white/20 ${isFollowing
                      ? "bg-white/10 text-white hover:bg-red-500/90 hover:border-red-500"
                      : "bg-white text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={copyProfileLink}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </DropdownMenuItem>
                  <Separator className="my-1" />
                  <DropdownMenuItem className="text-red-600">
                    <Flag className="w-4 h-4 mr-2" />
                    Report User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative -mt-24 mb-8 flex flex-col md:flex-row items-end md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-3xl border-4 border-white dark:border-gray-900 shadow-2xl overflow-hidden bg-white">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={profile.avatar?.url} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-primary/20 text-primary">
                    {profile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {profile.isOnline && (
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 pt-4 md:pt-24 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                  {profile.name}
                  {profile.isVerified && <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/10" />}
                </h1>
                {profile.role === 'admin' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 w-fit mx-auto md:mx-0">
                    <Crown className="w-3 h-3 mr-1" /> Admin
                  </Badge>
                )}
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">@{profile.username}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4">
                {(profile.location?.city || profile.location?.country) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[profile.location?.city, profile.location?.country].filter(Boolean).join(", ")}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Joined {format(new Date(profile.createdAt || Date.now()), "MMMM yyyy")}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 md:pt-24">
              <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setFollowersDialogOpen(true)}>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.followers || 0}</div>
                <div className="text-sm text-gray-500 font-medium">Followers</div>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setFollowingDialogOpen(true)}>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.following || 0}</div>
                <div className="text-sm text-gray-500 font-medium">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.rating?.toFixed(1) || "0.0"}</div>
                <div className="text-sm text-gray-500 font-medium">Rating</div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="max-w-3xl mb-10">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Social Links */}
          {(profile.socialLinks?.facebook || profile.socialLinks?.twitter || profile.socialLinks?.instagram) && (
            <div className="flex gap-3 mb-10">
              {profile.socialLinks?.facebook && (
                <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="rounded-full hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50">
                    <Facebook className="w-5 h-5" />
                  </Button>
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="rounded-full hover:text-sky-500 hover:border-sky-200 hover:bg-sky-50">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </a>
              )}
              {profile.socialLinks?.instagram && (
                <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="rounded-full hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50">
                    <Instagram className="w-5 h-5" />
                  </Button>
                </a>
              )}
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-sm pb-4 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <TabsList className="inline-flex min-w-max justify-start h-auto p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="sports"
                  className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
                >
                  Sports
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
                >
                  Achievements
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
                >
                  Events
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Events Created</p>
                          <h3 className="text-2xl font-bold text-foreground">{userStats?.eventsCreated || 0}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Target className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Events Joined</p>
                          <h3 className="text-2xl font-bold text-foreground">{userStats?.eventsParticipated || 0}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <Star className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Reputation Score</p>
                            <h3 className="text-2xl font-bold text-foreground">
                              {profile.stats?.rating?.toFixed(1) || "0.0"}
                              <span className="text-sm font-normal text-gray-400 ml-2">/ 5.0</span>
                            </h3>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${star <= (profile.stats?.rating || 0)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-200 dark:text-gray-700"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Reliability</span>
                          <span className="font-medium">98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity / Achievements Preview */}
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Latest Achievements</h3>
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {profile.achievements.slice(0, 3).map((achievement, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Medal className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{achievement.title}</p>
                            <p className="text-xs text-gray-500">{format(new Date(achievement.earnedAt), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                      <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No achievements yet</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sports" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.sportsPreferences?.map((sport, index) => (
                  <Card key={index} className="group hover:border-blue-200 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <Badge variant="outline" className={getSkillLevelColor(sport.skillLevel)}>
                          {sport.skillLevel}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{sport.sport}</h3>
                      <p className="text-sm text-gray-500">Primary Position: Forward</p>
                    </CardContent>
                  </Card>
                ))}
                {(!profile.sportsPreferences || profile.sportsPreferences.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sports listed</h3>
                    <p className="text-gray-500">This user hasn't added any sports preferences yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.achievements?.map((achievement, index) => (
                  <div key={index} className="flex gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{achievement.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{achievement.description}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Earned on {format(new Date(achievement.earnedAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.recentEvents?.map((event) => (
                  <Link to={`/events/${event._id}`} key={event._id} className="group">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
                      <div className="h-32 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        {/* Placeholder for event image if available */}
                        <div className="absolute inset-0 bg-primary/5" />
                        <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 hover:bg-white">
                          {event.category}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {event.name}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(event.date), "MMM d, yyyy • h:mm a")}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location?.city || "TBD"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FollowersDialog
        isOpen={followersDialogOpen}
        onClose={() => setFollowersDialogOpen(false)}
        type="followers"
        userId={profile._id}
        onFollowChange={(followed) => setUserStats(prev => ({ ...prev, following: prev.following + (followed ? 1 : -1) }))}
      />

      <FollowersDialog
        isOpen={followingDialogOpen}
        onClose={() => setFollowingDialogOpen(false)}
        type="following"
        userId={profile._id}
        onFollowChange={(followed) => setUserStats(prev => ({ ...prev, following: prev.following + (followed ? 1 : -1) }))}
      />
    </div>
  )
}

export default PublicProfile
