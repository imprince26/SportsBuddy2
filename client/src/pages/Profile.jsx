"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useEvents } from "../context/EventContext"
import { format } from "date-fns"
import {
  Mail,
  MapPin,
  Calendar,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Facebook,
  Twitter,
  Instagram,
  Dumbbell,
} from "lucide-react"

const Profile = () => {
  const { user, updateProfile, addAchievement } = useAuth()
  const { getUserEvents } = useEvents()
  const [userEvents, setUserEvents] = useState([])
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
    },
    sportsPreferences: [],
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [addingSport, setAddingSport] = useState(false)
  const [newSport, setNewSport] = useState({
    sport: "",
    skillLevel: "Beginner",
  })
  const [addingAchievement, setAddingAchievement] = useState(false)
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || { city: "", state: "", country: "" },
        socialLinks: user.socialLinks || { facebook: "", twitter: "", instagram: "" },
        sportsPreferences: user.sportsPreferences || [],
      })
    }
  }, [user])

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const events = await getUserEvents()
        setUserEvents(events)
      } catch (error) {
        console.error("Error fetching user events:", error)
      }
    }

    if (user) {
      fetchUserEvents()
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateProfile(profileData, avatarFile)
      setEditing(false)
      setAvatarFile(null)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSport = () => {
    if (!newSport.sport) return

    setProfileData((prev) => ({
      ...prev,
      sportsPreferences: [...prev.sportsPreferences, newSport],
    }))

    setNewSport({
      sport: "",
      skillLevel: "Beginner",
    })
    setAddingSport(false)
  }

  const handleRemoveSport = (index) => {
    setProfileData((prev) => ({
      ...prev,
      sportsPreferences: prev.sportsPreferences.filter((_, i) => i !== index),
    }))
  }

  const handleAddAchievement = async () => {
    if (!newAchievement.title) return

    try {
      await addAchievement(newAchievement)
      setNewAchievement({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      })
      setAddingAchievement(false)
    } catch (error) {
      console.error("Error adding achievement:", error)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-light/90 to-accent-light/90 dark:from-primary-dark/90 dark:to-accent-dark/90">
          {editing ? (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => {
                  setEditing(false)
                  setAvatarFile(null)
                  setAvatarPreview("")
                  if (user) {
                    setProfileData({
                      name: user.name || "",
                      username: user.username || "",
                      bio: user.bio || "",
                      location: user.location || { city: "", state: "", country: "" },
                      socialLinks: user.socialLinks || { facebook: "", twitter: "", instagram: "" },
                      sportsPreferences: user.sportsPreferences || [],
                    })
                  }
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSaveProfile}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                ) : (
                  <Save size={20} />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Edit size={20} />
            </button>
          )}
        </div>

        <div className="relative px-6 pb-6">
          <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-card-light dark:border-card-dark overflow-hidden bg-muted-light dark:bg-muted-dark">
            {editing ? (
              <div className="relative w-full h-full">
                <img
                  src={avatarPreview || user.avatar || "/placeholder.svg?height=128&width=128"}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer">
                  <Camera size={24} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            ) : (
              <img
                src={user.avatar || "/placeholder.svg?height=128&width=128"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="pt-20">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={profileData.location.city}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={profileData.location.state}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="location.country"
                      value={profileData.location.country}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      name="socialLinks.facebook"
                      value={profileData.socialLinks.facebook}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      name="socialLinks.twitter"
                      value={profileData.socialLinks.twitter}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="socialLinks.instagram"
                      value={profileData.socialLinks.instagram}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">{user.name}</h1>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">@{user.username}</p>

                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                    <Mail size={16} className="mr-1" />
                    <span>{user.email}</span>
                  </div>
                  {user.location?.city && (
                    <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                      <MapPin size={16} className="mr-1" />
                      <span>
                        {user.location.city}
                        {user.location.state && `, ${user.location.state}`}
                        {user.location.country && `, ${user.location.country}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                    <Calendar size={16} className="mr-1" />
                    {/* <span>Joined {format(new Date(user.createdAt), "MMMM yyyy")}</span> */}
                  </div>
                </div>

                {user.bio && (
                  <div className="mt-4">
                    <p className="text-foreground-light dark:text-foreground-dark">{user.bio}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  {user.socialLinks?.facebook && (
                    <a
                      href={user.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  {user.socialLinks?.twitter && (
                    <a
                      href={user.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {user.socialLinks?.instagram && (
                    <a
                      href={user.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sports Preferences */}
      <div className="mt-8 bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Sports Preferences</h2>
          {editing && (
            <button
              onClick={() => setAddingSport(true)}
              className="flex items-center gap-1 text-sm text-primary-light dark:text-primary-dark hover:underline"
            >
              <span>Add Sport</span>
              <span>+</span>
            </button>
          )}
        </div>

        {addingSport && (
          <div className="mb-4 p-4 border border-input-light dark:border-input-dark rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Sport
                </label>
                <select
                  value={newSport.sport}
                  onChange={(e) => setNewSport((prev) => ({ ...prev, sport: e.target.value }))}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="">Select a sport</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Skill Level
                </label>
                <select
                  value={newSport.skillLevel}
                  onChange={(e) => setNewSport((prev) => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingSport(false)}
                className="px-3 py-1 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSport}
                disabled={!newSport.sport}
                className={`px-3 py-1 rounded-md ${!newSport.sport
                    ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                    : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                  }`}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {profileData.sportsPreferences && profileData.sportsPreferences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profileData.sportsPreferences.map((sport, index) => (
              <div
                key={index}
                className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Dumbbell className="w-5 h-5 text-primary-light dark:text-primary-dark mr-3" />
                  <div>
                    <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{sport.sport}</h3>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      {sport.skillLevel}
                    </p>
                  </div>
                </div>
                {editing && (
                  <button
                    onClick={() => handleRemoveSport(index)}
                    className="p-1 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
              No sports preferences added yet
            </p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="mt-8 bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">Achievements</h2>
          {!editing && (
            <button
              onClick={() => setAddingAchievement(true)}
              className="flex items-center gap-1 text-sm text-primary-light dark:text-primary-dark hover:underline"
            >
              <span>Add Achievement</span>
              <span>+</span>
            </button>
          )}
        </div>

        {addingAchievement && (
          <div className="mb-4 p-4 border border-input-light dark:border-input-dark rounded-lg">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  placeholder="Achievement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Description
                </label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  placeholder="Describe your achievement"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingAchievement(false)}
                className="px-3 py-1 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAchievement}
                disabled={!newAchievement.title}
                className={`px-3 py-1 rounded-md ${!newAchievement.title
                    ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                    : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                  }`}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {user.achievements && user.achievements.length > 0 ? (
          <div className="space-y-4">
            {user.achievements.map((achievement, index) => (
              <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                <div className="flex items-start">
                  <Award className="w-6 h-6 text-primary-light dark:text-primary-dark mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{achievement.title}</h3>
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
          <div className="text-center py-4">
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No achievements added yet</p>
          </div>
        )}
      </div>

      {/* Recent Events */}
      {/* {userEvents.length > 0 && (
        <div className="mt-8 bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">Recent Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvents.slice(0, 3).map((event) => (
              <div key={event._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                <h3 className="font-medium text-foreground-light dark:text-foreground-dark mb-2">{event.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-2">
                  <Calendar size={14} className="mr-1" />
                  <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  <MapPin size={14} className="mr-1" />
                  <span>{event.location.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  )
}

export default Profile
