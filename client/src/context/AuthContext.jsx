import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  
  // Set auth token for all requests if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          // Token is invalid or expired
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setAuthError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setAuthError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, profileData);
      
      if (response.data.success) {
        setUser(response.data.data);
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update user password
  const updatePassword = async (passwordData) => {
    setLoading(true);
    
    try {
      const response = await axios.put(`${API_URL}/auth/password`, passwordData);
      
      if (response.data.success) {
        toast.success('Password updated successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get user notifications
  const getNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/notifications`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId) => {
    try {
      const response = await axios.put(`${API_URL}/auth/notifications/${notificationId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Follow a user
  const followUser = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/follow`);
      
      if (response.data.success) {
        // Update local user state with new following list
        setUser(prev => ({
          ...prev,
          following: [...prev.following, userId]
        }));
        toast.success('User followed successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to follow user';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}/follow`);
      
      if (response.data.success) {
        // Update local user state by removing from following list
        setUser(prev => ({
          ...prev,
          following: prev.following.filter(id => id !== userId)
        }));
        toast.success('User unfollowed successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unfollow user';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get user profile by ID
  const getUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Get user's followers
  const getUserFollowers = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/followers`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  };

  // Get user's following
  const getUserFollowing = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/following`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await axios.put(`${API_URL}/auth/preferences`, preferences);
      
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            ...preferences
          }
        }));
        toast.success('Preferences updated successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Add achievement
  const addAchievement = async (achievement) => {
    try {
      const response = await axios.post(`${API_URL}/auth/achievements`, achievement);
      
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          achievements: response.data.data
        }));
        toast.success('Achievement added successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add achievement';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Search users
  const searchUsers = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/users/search?q=${query}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    getNotifications,
    markNotificationRead,
    followUser,
    unfollowUser,
    getUserProfile,
    getUserFollowers,
    getUserFollowing,
    updatePreferences,
    addAchievement,
    searchUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
