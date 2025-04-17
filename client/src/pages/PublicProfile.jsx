"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { format } from "date-fns"
import { Mail, MapPin, Calendar, Award, Facebook, Twitter, Instagram, Dumbbell, ChevronLeft, Loader2, AlertTriangle, User } from 'lucide-react'

const PublicProfile = () => {
  const { userId } = useParams()
  const { getUserProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("achievements")

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const userData = await getUserProfile(userId)
        setProfile(userData)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError("Failed to load user profile. The user may not exist or you don't have permission to view this profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId, getUserProfile])

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
            <div>
              <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">{profile.name}</h1>
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark">@{profile.username}</p>

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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  No achievements added yet
                </p>
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
            {profile.recentEvents && profile.recentEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.recentEvents.map((event) => (
                  <Link
                    to={`/events/${event._id}`}
                    key={event._id}
                    className="bg-background-light dark:bg-background-dark rounded-lg p-4 hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                  >
                    <h3 className="font-medium text-foreground-light dark:text-foreground-dark mb-2">{event.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                      <Calendar size={14} className="mr-1" />
                      <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      <MapPin size={14} className="mr-1" />
                      <span>{event.location.city}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  No recent events found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicProfile
