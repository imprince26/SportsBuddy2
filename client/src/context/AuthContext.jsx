import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data);
      await fetchNotifications();
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", userData);
      setUser(response.data.user);
      toast({
        title: "Success",
        description: "Registration successful",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Registration failed",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", credentials);
      setUser(response.data.user);
      await fetchNotifications();
      toast({
        title: "Success",
        description: "Login successful",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Login failed",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      setNotifications([]);
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Logout failed",
      });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.put("/auth/profile", profileData);
      setUser(response.data.data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      await api.put("/auth/password", passwordData);
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update password",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/auth/notifications");
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/auth/notifications/${notificationId}`);
      setNotifications(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read",
      });
    }
  };

  const addAchievement = async (achievementData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/achievements", achievementData);
      setUser(prev => ({
        ...prev,
        achievements: response.data.data
      }));
      toast({
        title: "Success",
        description: "Achievement added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add achievement",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    notifications,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    markNotificationAsRead,
    addAchievement,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
