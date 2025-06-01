"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from "@/hooks/useSocket";
import { format } from "date-fns"
import { Mail, MapPin, Calendar, Award, Facebook, Twitter, Instagram, Dumbbell, ChevronLeft, Loader2, AlertTriangle, User, UserPlus, UserMinus, Users, Share2, MessageSquare, CalendarDays, Star, X } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

const PublicProfileEnhanced = () => {
  const { userId } = useParams()
  const { user, getUserProfile, followUser, unfollowUser } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("achievements")
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsParticipated: 0,
    rating: 0,
    totalRatings: 0,
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const userData = await getUserProfile(userId)
        setProfile(userData)
        
        // Check if current user is following this profile
        if (user && user.following) {
          setIsFollowing(user.following.includes(userId))
        }
        
        // Set stats
        if (userData.stats) {
          setStats(userData.stats)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError(
          "Failed to load user profile. The user may not exist or you don't have permission to view this profile."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId, getUserProfile, user])

  useEffect(() => {
    if (socket && profile) {
      // Listen for follow/unfollow events
      socket.on("userFollowed", (data) => {
        if (data.followedId === profile._id) {
          setProfile(prev => ({
            ...prev,
            followers: [...prev.followers, data.followerId]
          }))
        }
      })

      socket.on("userUnfollowed", (data) => {
        if (data.unfollowedId === profile._id) {
          setProfile(prev => ({
            ...prev,
            followers: prev.followers.filter(id => id !== data.followerId)
          }))
        }
      })

      return () => {
        socket.off("userFollowed")
        socket.off("userUnfollowed")
      }
    }
  }, [socket, profile])

  const handleFollow = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/profile/${userId}` } })
      return
    }

    try {
      if (isFollowing) {
        await unfollowUser(userId)
        setIsFollowing(false)
      } else {
        await followUser(userId)
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name}'s SportsBuddy Profile`,
        text: `Check out ${profile.name}'s profile on SportsBuddy!`,
        url: window.location.href,
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Profile link copied to clipboard!")
    }
  }

  const handleMessage = () => {
    // This would navigate to a direct message page or open a chat modal
    console.log("Message user:", profile.name)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">{error}</p>
          <Link
            to="/events"
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Events
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-light/90 to-accent-light/90 dark:from-primary-dark/90 dark:to-accent-dark/90">
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute left-0 top-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill="rgba(255,255,255,0.05)"
                fillOpacity="1"
                d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="relative px-6 pb-6">
          <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-card-light dark:border-card-dark overflow-hidden bg-muted-light dark:bg-muted-dark">
            {profile.avatar ? (
              <img
                src={profile.avatar || "/placeholder.svg?height=128&width=128"}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted-light dark:bg-muted-dark">
                <User className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark" />
              </div>
            )}
          </div>

          <div className="pt-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">{profile.name}</h1>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">@{profile.username}</p>
              </div>
              
              {/* Action buttons */}
              {user && user.id !== userId && (
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isFollowing 
                        ? "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark" 
                        : "bg-primary-light dark:bg-primary-dark text-white"
                    }`}
                  >
                    {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    onClick={handleMessage}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                  >
                    <MessageSquare size={18} />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Followers/Following stats */}
            <div className="flex gap-6 mt-4">
              <button 
                onClick={() => setShowFollowers(true)}
                className="flex flex-col items-center hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                <span className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
                  {profile.followers?.length || 0}
                </span>
                <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Followers</span>
              </button>
              <button 
                onClick={() => setShowFollowing(true)}
                className="flex flex-col items-center hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                <span className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
                  {profile.following?.length || 0}
                </span>
                <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Following</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
                  {stats.eventsCreated || 0}
                </span>
                <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Events</span>
              </div>
              {stats.rating > 0 && (
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-lg font-bold text-foreground-light dark:text-foreground-dark">
                    {stats.rating.toFixed(1)}
                    <Star size={16} className="ml-1 text-accent-light dark:text-accent-dark fill-accent-light dark:fill-accent-dark" />
                  </div>
                  <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                    {stats.totalRatings} ratings
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              {profile.email && (
                <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                  <Mail size={16} className="mr-1" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.location?.city && (
                <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                  <MapPin size={16} className="mr-1" />
                  <span>
                    {profile.location.city}
                    {profile.location.state && `, ${profile.location.state}`}
                    {profile.location.country && `, ${profile.location.country}`}
                  </span>
                </div>
              )}
              <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                <Calendar size={16} className="mr-1" />
                <span>Joined {format(new Date(profile.createdAt), "MMMM yyyy")}</span>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-4">
                <p className="text-foreground-light dark:text-foreground-dark">{profile.bio}</p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              {profile.socialLinks?.facebook && (
                <a
                  href={profile.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                >
                  <Facebook size={18} />
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                >
                  <Twitter size={18} />
                </a>
              )}
              {profile.socialLinks?.instagram && (
                <a
                  href={profile.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                >
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="mt-8">
        <div className="border-b border-border-light dark:border-border-dark mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("achievements")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "achievements"
                  ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                  : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab("sports")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "sports"
                  ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                  : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
              }`}
            >
              Sports Preferences
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "events"
                  ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                  : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
              }`}
            >
              Recent Events
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "teams"
                  ? "text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark"
                  : "text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
              }`}
            >
              Teams
            </button>
          </div>
        </div>

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">Achievements</h2>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-4">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                    <div className="flex items-start">
                      <Award className="w-6 h-6 text-primary-light dark:text-primary-dark mr-3 mt-1" />
                      <div>
                        <h3 className="font-medium text-foreground-light dark:text-foreground-dark">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                          {format(new Date(achievement.date), "MMMM dd, yyyy")}
                        </p>
                        {achievement.description && (
                          <p className="text-foreground-light dark:text-foreground-dark">{achievement.description}</p>
                        )}
                        {achievement.eventId && (
                          <Link 
                            to={`/events/${achievement.eventId}`}
                            className="text-sm text-primary-light dark:text-primary-dark hover:underline mt-2 inline-block"
                          >
                            View Event
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No achievements added yet</p>
              </div>
            )}
          </div>
        )}

        {/* Sports Preferences Tab */}
        {activeTab === "sports" && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Sports Preferences
            </h2>
            {profile.sportsPreferences && profile.sportsPreferences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {profile.sportsPreferences.map((sport, index) => (
                  <div
                    key={index}
                    className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center"
                  >
                    <Dumbbell className="w-5 h-5 text-primary-light dark:text-primary-dark mr-3" />
                    <div>
                      <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{sport.sport}</h3>
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        {sport.skillLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  No sports preferences added yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Events Tab */}
        {activeTab === "events" && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">Recent Events</h2>
            {profile.participatedEvents && profile.participatedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.participatedEvents.map((event) => (
                  <Link
                    to={`/events/${event._id}`}
                    key={event._id}
                    className="bg-background-light dark:bg-background-dark rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-32">
                      {event.images && event.images.length > 0 ? (
                        <img
                          src={event.images[0].url || "/placeholder.svg?height=128&width=256"}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                          <CalendarDays className="w-8 h-8 text-muted-foreground-light dark:text-muted-foreground-dark" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <h3 className="text-white font-medium truncate">{event.name}</h3>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                        <Calendar size={14} className="mr-1" />
                        <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">{event.location.city}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No recent events found</p>
              </div>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">Teams</h2>
            {profile.teams && profile.teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.teams.map((team, index) => (
                  <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                    <h3 className="font-medium text-foreground-light dark:text-foreground-dark mb-2">{team.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-3">
                      <Users size={14} className="mr-1" />
                      <span>{team.members?.length || 0} members</span>
                    </div>
                    {team.event && (
                      <Link
                        to={`/events/${team.event._id}`}
                        className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                      >
                        View Event
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No teams found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowers && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Followers</h3>
                <button 
                  onClick={() => setShowFollowers(false)}
                  className="p-1 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {profile.followers && profile.followers.length > 0 ? (
                  <div className="space-y-4">
                    {profile.followers.map((follower) => (
                      <Link
                        key={follower._id}
                        to={`/profile/${follower._id}`}
                        className="flex items-center p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                        onClick={() => setShowFollowers(false)}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                          {follower.avatar ? (
                            <img
                              src={follower.avatar || "/placeholder.svg"}
                              alt={follower.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground-light dark:text-foreground-dark">{follower.name}</p>
                          <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">@{follower.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                    <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No followers yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Following Modal */}
      <AnimatePresence>
        {showFollowing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Following</h3>
                <button 
                  onClick={() => setShowFollowing(false)}
                  className="p-1 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {profile.following && profile.following.length > 0 ? (
                  <div className="space-y-4">
                    {profile.following.map((following) => (
                      <Link
                        key={following._id}
                        to={`/profile/${following._id}`}
                        className="flex items-center p-2 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                        onClick={() => setShowFollowing(false)}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                          {following.avatar ? (
                            <img
                              src={following.avatar || "/placeholder.svg"}
                              alt={following.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground-light dark:text-foreground-dark">{following.name}</p>
                          <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">@{following.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                    <p className="text-muted-foreground-light dark:text-muted-foreground-dark">Not following anyone yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PublicProfileEnhanced
