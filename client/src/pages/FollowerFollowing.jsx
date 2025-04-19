"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FaArrowLeft, FaUserPlus, FaUserMinus } from "react-icons/fa"
import Loader from "../components/Loader"

const FollowersFollowing = ({ type = "followers" }) => {
  const { userId } = useParams()
  const { user, getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const profileData = await getUserProfile(userId)
        setProfile(profileData)

        let userData = []
        if (type === "followers") {
          userData = await getUserFollowers(userId)
        } else {
          userData = await getUserFollowing(userId)
        }

        setUsers(userData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, type, getUserProfile, getUserFollowers, getUserFollowing])

  const handleFollow = async (targetUserId) => {
    await followUser(targetUserId)
    // Update local state to reflect the change
    setUsers(users.map((u) => (u._id === targetUserId ? { ...u, isFollowing: true } : u)))
  }

  const handleUnfollow = async (targetUserId) => {
    await unfollowUser(targetUserId)
    // Update local state to reflect the change
    setUsers(users.map((u) => (u._id === targetUserId ? { ...u, isFollowing: false } : u)))
  }

  if (loading) {
    return <Loader />
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-600">User not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <FaArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold">
          {profile.name}'s {type === "followers" ? "Followers" : "Following"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <Link
            to={`/users/${userId}/followers`}
            className={`px-6 py-4 text-sm font-medium ${type === "followers" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Followers ({profile.followers?.length || 0})
          </Link>
          <Link
            to={`/users/${userId}/following`}
            className={`px-6 py-4 text-sm font-medium ${type === "following" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Following ({profile.following?.length || 0})
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No {type} yet</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((u) => (
              <li key={u._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <Link to={`/users/${u._id}`} className="flex items-center">
                    <img
                      src={u.avatar || "/placeholder.svg?height=40&width=40"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">@{u.username}</p>
                    </div>
                  </Link>

                  {user && user.id !== u._id && (
                    <div>
                      {u.isFollowing ? (
                        <button
                          onClick={() => handleUnfollow(u._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaUserMinus className="mr-1" /> Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(u._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <FaUserPlus className="mr-1" /> Follow
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FollowersFollowing
