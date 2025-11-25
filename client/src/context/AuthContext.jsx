import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const existingToken = localStorage.getItem('token');
      if (!existingToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/auth/me`);
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error?.response?.status, error?.response?.data);
        setUser(null);
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
      const response = await api.post(`/auth/register`, userData);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful! Redirecting to dashboard...');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      const message = error.response?.data?.message || 'Registration failed';
      setAuthError(message);
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
      const response = await api.post(`/auth/login`, credentials);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Login successful! Redirecting to dashboard...');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setAuthError(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post(`/auth/logout`);
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
    const toastId = toast.loading("Updating profile...")

    try {
      const response = await api.put(`/auth/profile`, profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUser(response.data.data);
        toast.success("Profile updated successfully!", { id: toastId })
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error("Failed to update profile", { id: toastId })
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update user password
  const updatePassword = async (passwordData) => {
    setLoading(true);

    try {
      const response = await api.put(`/auth/password`, passwordData);

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
      const response = await api.get(`/auth/notifications`);

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
      const response = await api.put(`/auth/notifications/${notificationId}`);

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
      // Prevent following self
      if (user._id === userId) {
        return { success: false, message: 'You cannot follow yourself' };
      }
      const response = await api.post(`/athletes/${userId}/follow`);

      if (response.data.success) {
        // Update local user state with new following list
        setUser(prev => ({
          ...prev,
          following: [...(prev.following || []), userId]
        }));
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to follow user';
      return { success: false, message };
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      const response = await api.post(`/athletes/${userId}/follow`);

      if (response.data.success) {
        // Update local user state by removing from following list
        setUser(prev => ({
          ...prev,
          following: (prev.following || []).filter(id => id !== userId)
        }));
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unfollow user';
      return { success: false, message };
    }
  };

  // Get user profile by ID
  const getUserProfile = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);

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
      const response = await api.get(`/users/${userId}/followers`);

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
      const response = await api.get(`/users/${userId}/following`);

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
      const response = await api.put(`/auth/preferences`, preferences);

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
      const response = await api.post(`/auth/achievements`, achievement);

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          achievements: response.data.data
        }));
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add achievement';
      return { success: false, message };
    }
  };

  const getCurrentUser = async () => {
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    try {
      const response = await api.get(`/auth/me`);

      if (response.data.success) {
        setUser(response.data.data);
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      const message = error.response?.data?.message || 'Failed to fetch user data';

      return { success: false, message };
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
    getCurrentUser,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext }
