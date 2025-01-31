import { createContext, useState, useContext, useEffect } from "react";
import api from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkUserAuthentication: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const response = await api.get("/auth/me");

      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Authentication Error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      setUser(response.data.user);
      setIsAuthenticated(true);

      toast.success("Welcome to Your Sports Journey!", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
        },
      });

      navigate("/");

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";

      toast.error(errorMessage, {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });

      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      setUser(response.data.user);
      setIsAuthenticated(true);

      toast.success("Registration Successful!", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
        },
      });

      navigate("/");

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";

      toast.error(errorMessage, {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });

      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");

      setUser(null);
      setIsAuthenticated(false);

      toast.success("Logged out successfully", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
        },
      });

      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed";

      toast.error(errorMessage, {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkUserAuthentication,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
