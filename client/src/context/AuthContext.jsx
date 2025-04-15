import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/components/CustomToast';
import api from '@/utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      await fetchNotifications();
    } catch (error) {
      setUser(null);
      // localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    const toastId = showToast.loading('Registering...');
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      setUser(response.data.user);
      // localStorage.setItem('token', response.data.token);
      showToast.success('Registration successful', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Registration failed', {
        id: toastId,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const toastId = showToast.loading('Logging in...');
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      setUser(response.data.user);
      // localStorage.setItem('token', response.data.token);
      showToast.success('Login successful', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Login failed', {
        id: toastId,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const toastId = showToast.loading('Logging out...');
    try {
      await api.post('/auth/logout');
      setUser(null);
      setNotifications([]);
      // localStorage.removeItem('token');
      showToast.success('Logged out successfully', { id: toastId });
      navigate('/login');
    } catch (error) {
      showToast.error('Logout failed', { id: toastId });
    }
  };

  const updateProfile = async (profileData, avatarFile) => {
    const toastId = showToast.loading('Updating profile...');
    try {
      setLoading(true);
      let avatarUrl = profileData.avatar;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const uploadRes = await api.post('/upload/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = uploadRes.data.fileUrl.url;
      }
      const response = await api.put('/auth/profile', {
        ...profileData,
        avatar: avatarUrl,
      });
      setUser(response.data.data);
      showToast.success('Profile updated successfully', { id: toastId });
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update profile', {
        id: toastId,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (passwordData) => {
    const toastId = showToast.loading('Updating password...');
    try {
      setLoading(true);
      const response = await api.put('/auth/password', passwordData);
      showToast.success('Password updated successfully', { id: toastId });
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update password', {
        id: toastId,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/auth/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      showToast.error('Failed to fetch notifications');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    const toastId = showToast.loading('Marking notification as read...');
    try {
      const response = await api.put(`/auth/notifications/${notificationId}`);
      setNotifications(response.data.data);
      showToast.success('Notification marked as read', { id: toastId });
    } catch (error) {
      showToast.error('Failed to mark notification as read', { id: toastId });
    }
  };

  const addAchievement = async (achievementData) => {
    const toastId = showToast.loading('Adding achievement...');
    try {
      setLoading(true);
      const response = await api.post('/auth/achievements', achievementData);
      setUser((prev) => ({
        ...prev,
        achievements: response.data.data,
      }));
      showToast.success('Achievement added successfully', { id: toastId });
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to add achievement', {
        id: toastId,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    notifications,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    fetchNotifications,
    markNotificationAsRead,
    addAchievement,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};