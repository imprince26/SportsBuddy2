"use client"

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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Followers/Following Dialog Component
const FollowersDialog = ({ isOpen, onClose, type, userId }) => {
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

  const handleFollow = async (targetUserId) => {
    try {
      await followUser(targetUserId)
      setUsers((prev) => prev.map((u) => (u._id === targetUserId ? { ...u, isFollowedByCurrentUser: true } : u)))
    } catch (error) {
      toast.error("Failed to follow user")
    }
  }

  const handleUnfollow = async (targetUserId) => {
    try {
      await unfollowUser(targetUserId)
      setUsers((prev) => prev.map((u) => (u._id === targetUserId ? { ...u, isFollowedByCurrentUser: false } : u)))
    } catch (error) {
      toast.error("Failed to unfollow user")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] overflow-hidden">
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
                <Link to={`/users/${userData._id}`} className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userData.avatar?.url || "/placeholder.svg"} />
                    <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{userData.name}</p>
                    <p className="text-xs text-muted-foreground">@{userData.username}</p>
                  </div>
                </Link>

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
  const [followLoading, setFollowLoading] = useState(false)

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

        // Check if current user is following this profile
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

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please log in to follow users")
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(userId)
        setIsFollowing(false)
        setProfile((prev) => ({
          ...prev,
          followers: prev.followers.filter((f) => f._id !== user._id),
        }))
        toast.success("Unfollowed successfully")
      } else {
        await followUser(userId)
        setIsFollowing(true)
        setProfile((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), user],
        }))
        toast.success("Following successfully")
      }
    } catch (error) {
      toast.error("Failed to update follow status")
    } finally {
      setFollowLoading(false)
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
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center p-8">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/events")}>Browse Events</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Profile Header Card */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-primary/5 via-background to-secondary/5">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary via-primary/80 to-secondary relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                {user && user._id !== profile._id && (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={
                      isFollowing
                        ? "bg-white/90 text-primary hover:bg-white"
                        : "bg-white text-primary hover:bg-white/90"
                    }
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {followLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-current"></div>
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Flag className="w-4 h-4 mr-2" />
                      Report User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardContent className="relative pt-16 pb-6">
              {/* Avatar */}
              <div className="absolute -top-16 left-6">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.avatar?.url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                    {profile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Stats */}
              <div className="flex justify-end gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {profile.stats?.eventsCreated || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                    <Target className="w-5 h-5 text-blue-500" />
                    {profile.stats?.eventsParticipated || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Events Joined</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setFollowersDialogOpen(true)}>
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    <Users className="w-5 h-5 text-green-500" />
                    {profile.followers?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => setFollowingDialogOpen(true)}>
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    <UserPlus className="w-5 h-5 text-purple-500" />
                    {profile.following?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    {profile.name}
                    {profile.role === "admin" && <Crown className="w-6 h-6 text-yellow-500" />}
                  </h1>
                  <p className="text-muted-foreground text-lg">@{profile.username}</p>
                </div>

                {profile.bio && <p className="text-foreground leading-relaxed max-w-2xl">{profile.bio}</p>}

                {/* Location & Join Date */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {(profile.location?.city || profile.location?.state || profile.location?.country) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[profile.location?.city, profile.location?.state, profile.location?.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(new Date(profile.createdAt || Date.now()), "MMMM yyyy")}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(profile.socialLinks?.facebook || profile.socialLinks?.twitter || profile.socialLinks?.instagram) && (
                  <div className="flex gap-3">
                    {profile.socialLinks?.facebook && (
                      <a
                        href={profile.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-400"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks?.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors dark:bg-sky-900 dark:text-sky-400"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks?.instagram && (
                      <a
                        href={profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors dark:bg-pink-900 dark:text-pink-400"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sports" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Sports
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {profile.stats?.eventsCreated || 0}
                      </div>
                      <div className="text-sm text-blue-600/70 dark:text-blue-400/70">Events Created</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {profile.stats?.eventsParticipated || 0}
                      </div>
                      <div className="text-sm text-green-600/70 dark:text-green-400/70">Events Joined</div>
                    </div>
                  </div>

                  {/* Rating */}
                  {profile.stats?.rating > 0 && (
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {profile.stats.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm text-yellow-600/70 dark:text-yellow-400/70">
                        Average Rating ({profile.stats.totalRatings} reviews)
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-3">
                      {profile.achievements.slice(0, 3).map((achievement, index) => (
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Sports Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.sportsPreferences && profile.sportsPreferences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.sportsPreferences.map((sport, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getSportIcon(sport.sport)}</span>
                          <h3 className="font-medium">{sport.sport}</h3>
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
                    <h3 className="text-lg font-medium mb-2">No sports preferences</h3>
                    <p className="text-muted-foreground">This user hasn't added any sports preferences yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all"
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
                    <h3 className="text-lg font-medium mb-2">No achievements</h3>
                    <p className="text-muted-foreground">This user hasn't earned any achievements yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.recentEvents && profile.recentEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.recentEvents.map((event) => (
                      <Link
                        to={`/events/${event._id}`}
                        key={event._id}
                        className="group p-4 rounded-lg border bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-all"
                      >
                        <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location?.city || "Location TBD"}</span>
                          </div>
                          {event.category && (
                            <Badge variant="secondary" className="text-xs">
                              {event.category}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No recent events</h3>
                    <p className="text-muted-foreground">This user hasn't participated in any events recently</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Followers/Following Dialogs */}
        <FollowersDialog
          isOpen={followersDialogOpen}
          onClose={() => setFollowersDialogOpen(false)}
          type="followers"
          userId={profile._id}
        />

        <FollowersDialog
          isOpen={followingDialogOpen}
          onClose={() => setFollowingDialogOpen(false)}
          type="following"
          userId={profile._id}
        />
      </div>
    </div>
  )
}

export default PublicProfile
