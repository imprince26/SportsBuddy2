"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-hot-toast"
import { FaUser, FaLock, FaBell } from "react-icons/fa"

const Settings = () => {
  const { user, updateProfile, updatePassword, updatePreferences, loading } = useAuth()

  const [activeTab, setActiveTab] = useState("profile")
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
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferencesData, setPreferencesData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    radius: 10,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        location: {
          city: user.location?.city || "",
          state: user.location?.state || "",
          country: user.location?.country || "",
        },
        socialLinks: {
          facebook: user.socialLinks?.facebook || "",
          twitter: user.socialLinks?.twitter || "",
          instagram: user.socialLinks?.instagram || "",
        },
      })

      setPreferencesData({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? true,
        radius: user.preferences?.radius || 10,
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value,
        },
      })
    } else {
      setProfileData({
        ...profileData,
        [name]: value,
      })
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target
    setPreferencesData({
      ...preferencesData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const result = await updateProfile(profileData)
    if (result.success) {
      toast.success("Profile updated successfully")
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const result = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })

    if (result.success) {
      toast.success("Password updated successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault()
    const result = await updatePreferences(preferencesData)
    if (result.success) {
      toast.success("Preferences updated successfully")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-6 py-4 text-sm font-medium ${activeTab === "profile" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="inline mr-2" />
            Profile
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium ${activeTab === "password" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("password")}
          >
            <FaLock className="inline mr-2" />
            Password
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium ${activeTab === "preferences" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("preferences")}
          >
            <FaBell className="inline mr-2" />
            Preferences
          </button>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="location.city"
                      name="location.city"
                      value={profileData.location.city}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="location.state"
                      name="location.state"
                      value={profileData.location.state}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="location.country"
                      name="location.country"
                      value={profileData.location.country}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700">
                      Facebook
                    </label>
                    <input
                      type="text"
                      id="socialLinks.facebook"
                      name="socialLinks.facebook"
                      value={profileData.socialLinks.facebook}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700">
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="socialLinks.twitter"
                      name="socialLinks.twitter"
                      value={profileData.socialLinks.twitter}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700">
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="socialLinks.instagram"
                      name="socialLinks.instagram"
                      value={profileData.socialLinks.instagram}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "preferences" && (
            <form onSubmit={handlePreferencesSubmit}>
              <div className="space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={preferencesData.emailNotifications}
                    onChange={handlePreferencesChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                    Email Notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    name="pushNotifications"
                    checked={preferencesData.pushNotifications}
                    onChange={handlePreferencesChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                    Push Notifications
                  </label>
                </div>

                <div>
                  <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                    Event Search Radius (km)
                  </label>
                  <input
                    type="range"
                    id="radius"
                    name="radius"
                    min="1"
                    max="50"
                    value={preferencesData.radius}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{preferencesData.radius} kilometers</div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
