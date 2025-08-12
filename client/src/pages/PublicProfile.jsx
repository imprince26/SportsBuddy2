import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import {
  MapPin,
  Calendar,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Dumbbell,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  Trophy,
  Target,
  Crown,
  Medal,
  Sparkles,
  Activity,
  Star,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Flag,
  Heart,
  Mail,
  Shield,
  CheckCircle,
  TrendingUp,
  Eye,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <DialogContent className="max-w-lg max-h-[700px] overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl animate-in slide-in-from-bottom-5 duration-300">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Users className="w-5 h-5 text-white" />
            </div>
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {type === "followers" ? "People following this user" : "People this user is following"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[500px] space-y-2 py-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="relative">
                <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">0</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">No {type} yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {type === "followers" ? "No one is following this user yet" : "This user isn't following anyone yet"}
                </p>
              </div>
            </div>
          ) : (
            users.map((userData, index) => (
              <div
                key={userData._id}
                className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-300 transform animate-in slide-in-from-left-5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/users/${userData._id}`} className="flex items-center gap-4 flex-1 min-w-0" onClick={onClose}>
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={userData.avatar?.url || "/placeholder.svg"} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
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
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
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
  const [profileViews, setProfileViews] = useState(0)

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
        setProfileViews(res.data.data.profileViews || 0)
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

      // toast.success(originalIsFollowing ? "Unfollowed successfully!" : "Following successfully!", {
      //   icon: originalIsFollowing ? "💔" : "❤️",
      //   style: {
      //     borderRadius: "12px",
      //     background: originalIsFollowing ? "#fee2e2" : "#dcfce7",
      //     color: originalIsFollowing ? "#dc2626" : "#16a34a",
      //   },
      // })
    } catch (error) {
      // Revert UI on error
      setIsFollowing(originalIsFollowing)
      setUserStats(originalStats)
      const errorMessage = error.message || "Failed to update follow status"
      toast.error(errorMessage)
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
    toast.success("Profile link copied to clipboard!", {
      icon: "📋",
    })
  }

  useEffect(() => {
    if (profile) {
      document.title = `${profile.name} (@${profile.username}) | SportsBuddy`
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Profile</h3>
            <p className="text-gray-500 dark:text-gray-400">Fetching user information...</p>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-in slide-in-from-bottom-5 duration-500">
          <Card className="text-center p-8 border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/events")} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
                Browse Events
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-700">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-white dark:hover:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-full px-6 py-2 transition-all duration-300 transform hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl animate-in slide-in-from-bottom-5 duration-500">
          <div className="relative">
            <div className="h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full text-white text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{profileViews} views</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-3">
                {user && user._id !== profile._id && (
                  <Button
                    onClick={handleFollow}
                    className={`transition-all duration-500 transform hover:scale-110 shadow-xl rounded-full px-6 py-2 ${isFollowing
                      ? "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-red-500 hover:border-red-500"
                      : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-0"
                      }`}
                  >
                    {isFollowing ? (
                      <div className="flex items-center gap-2 group">
                        <Heart className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:inline">Unfollow</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Follow</span>
                      </div>
                    )}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-full p-2 shadow-xl transition-all duration-300 transform hover:scale-110"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                    <DropdownMenuItem onClick={copyProfileLink} className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
                      <Flag className="w-4 h-4 mr-2" />
                      Report User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardContent className="relative pt-20 pb-8">
              <div className="absolute -top-20 left-8">
                <div className="relative group">
                  <Avatar className="w-36 h-36 border-4 border-white dark:border-gray-900 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900 transition-all duration-300 group-hover:scale-105">
                    <AvatarImage src={profile.avatar?.url || "/placeholder.svg"} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      {profile.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 mb-8">
                <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    {userStats.eventsCreated || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Events Created</div>
                </div>

                <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    {userStats.eventsParticipated || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Events Joined</div>
                </div>

                <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => setFollowersDialogOpen(true)}>
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    {userStats.followers || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">Followers</div>
                </div>

                <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => setFollowingDialogOpen(true)}>
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    {userStats.following || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">Following</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    {profile.name}
                    {profile.role === "admin" && (
                      <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {profile.isVerified && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">@{profile.username}</p>
                </div>

                {profile.bio && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">{profile.bio}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400">
                  {(profile.location?.city || profile.location?.state || profile.location?.country) && (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="font-medium">
                        {[profile.location?.city, profile.location?.state, profile.location?.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Joined {format(new Date(profile.createdAt || Date.now()), "MMMM yyyy")}</span>
                  </div>
                </div>

                {(profile.socialLinks?.facebook || profile.socialLinks?.twitter || profile.socialLinks?.instagram) && (
                  <div className="flex gap-4">
                    {profile.socialLinks?.facebook && (
                      <a
                        href={profile.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      >
                        <Facebook className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </a>
                    )}
                    {profile.socialLinks?.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      >
                        <Twitter className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </a>
                    )}
                    {profile.socialLinks?.instagram && (
                      <a
                        href={profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      >
                        <Instagram className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-2 h-auto">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <Activity className="w-5 h-5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="sports"
              className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <Dumbbell className="w-5 h-5" />
              <span className="hidden sm:inline">Sports</span>
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <Award className="w-5 h-5" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-white/20 rounded-full">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                        {userStats?.eventsCreated || 0}
                      </div>
                      <div className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">Events Created</div>
                      <Progress value={(userStats?.eventsCreated || 0) * 10} className="mt-3 h-2" />
                    </div>

                    <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
                        {userStats?.eventsJoined || 0}
                      </div>
                      <div className="text-sm font-medium text-green-600/70 dark:text-green-400/70">Events Joined</div>
                      <Progress value={(userStats?.eventsJoined || 0) * 8} className="mt-3 h-2" />
                    </div>
                  </div>

                  {profile.stats?.rating > 0 && (
                    <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-900 border border-yellow-200 dark:border-yellow-800 shadow-lg">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                          <Star className="w-8 h-8 text-white fill-current" />
                        </div>
                        <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                          {profile.stats.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-yellow-600/70 dark:text-yellow-400/70">
                        Average Rating ({profile.stats.totalRatings} reviews)
                      </div>
                      <div className="flex justify-center mt-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= profile.stats.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 dark:text-gray-600"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {profile.achievements.slice(0, 3).map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex-shrink-0">
                            <Medal className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{achievement.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {format(new Date(achievement.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">No achievements yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start participating in events to earn achievements!</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sports" className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <Card className="bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  Sports Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {profile.sportsPreferences && profile.sportsPreferences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.sportsPreferences.map((sport, index) => (
                      <div
                        key={index}
                        className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl group-hover:scale-125 transition-transform">{getSportIcon(sport.sport)}</span>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{sport.sport}</h3>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${getSkillLevelColor(sport.skillLevel)} border font-medium px-4 py-2 rounded-full`}
                        >
                          {sport.skillLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto">
                      <Dumbbell className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No sports preferences</h3>
                      <p className="text-gray-600 dark:text-gray-400">This user hasn't added any sports preferences yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <Card className="bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Trophy className="w-6 h-6" />
                  </div>
                  All Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="space-y-6">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-950 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-left-5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg group-hover:scale-110 transition-transform">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {format(new Date(achievement.date), "MMMM dd, yyyy")}
                            </p>
                            {achievement.description && (
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{achievement.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-200 dark:from-yellow-950 dark:to-orange-900 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="w-12 h-12 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No achievements</h3>
                      <p className="text-gray-600 dark:text-gray-400">This user hasn't earned any achievements yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <Card className="bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Calendar className="w-6 h-6" />
                  </div>
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {profile.recentEvents && profile.recentEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.recentEvents.map((event, index) => (
                      <Link
                        to={`/events/${event._id}`}
                        key={event._id}
                        className="group block p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                          {event.name}
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">{format(new Date(event.date), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                              <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="font-medium">{event.location?.city || "Location TBD"}</span>
                          </div>
                          {event.category && (
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 font-medium"
                            >
                              {event.category}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-200 dark:from-purple-950 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto">
                      <Calendar className="w-12 h-12 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No recent events</h3>
                      <p className="text-gray-600 dark:text-gray-400">This user hasn't participated in any events recently</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
    </div>
  )
}

export default PublicProfile
