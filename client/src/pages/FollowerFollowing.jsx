import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, UserMinus, User, ArrowLeft } from 'lucide-react';
import Loader from '../components/Loader';

const FollowersFollowing = ({ type = 'followers' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user profile
        const profile = await getUserProfile(id);
        if (!profile) {
          setError('User not found');
          return;
        }
        setUserProfile(profile);
        
        // Get followers or following based on type
        let userData = [];
        if (type === 'followers') {
          userData = await getUserFollowers(id);
        } else {
          userData = await getUserFollowing(id);
        }
        
        setUsers(userData);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        setError(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, type, getUserProfile, getUserFollowers, getUserFollowing]);
  
  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      // Update UI to show user is now followed
      setUsers(prev => 
        prev.map(u => 
          u._id === userId ? { ...u, isFollowedByCurrentUser: true } : u
        )
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  };
  
  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      // Update UI to show user is no longer followed
      setUsers(prev => 
        prev.map(u => 
          u._id === userId ? { ...u, isFollowedByCurrentUser: false } : u
        )
      );
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };
  
  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userProfile?.name}'s {type === 'followers' ? 'Followers' : 'Following'}
        </h1>
      </div>
      
      {users.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
            No {type} yet
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {type === 'followers' 
              ? `${userProfile?.name} doesn't have any followers yet.` 
              : `${userProfile?.name} isn't following anyone yet.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((userData) => (
            <div 
              key={userData._id} 
              className="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <Link to={`/users/${userData._id}`} className="flex flex-1 items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar || "/placeholder.svg"} 
                      alt={userData.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-2 text-gray-500" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{userData.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{userData.username}</p>
                </div>
              </Link>
              
              {user && user.id !== userData._id && (
                <div>
                  {userData.isFollowedByCurrentUser ? (
                    <button
                      onClick={() => handleUnfollow(userData._id)}
                      className="flex items-center rounded-md bg-gray-100 py-1 px-3 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <UserMinus className="mr-1 h-4 w-4" />
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(userData._id)}
                      className="flex items-center rounded-md bg-blue-600 py-1 px-3 text-sm text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <UserPlus className="mr-1 h-4 w-4" />
                      Follow
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersFollowing;
