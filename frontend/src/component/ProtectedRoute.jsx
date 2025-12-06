import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const userData = JSON.parse(localStorage.getItem("user"));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated() && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has the required role
  if (allowedRoles.length > 0) {
    const userRole = getUserRole() || userData?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
