import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useProtectedRoute = (requiredRole = null) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (requiredRole && user?.role !== requiredRole) {
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate]);

  return { user, isAuthenticated, isLoading };
};
