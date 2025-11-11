import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { hasRole } from "../utils/roleHelpers";

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  // Redirect based on user role
  if (hasRole(user, ["admin"])) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (hasRole(user, ["instructor"])) {
    return <Navigate to="/instructor-dashboard" replace />;
  }
  
  if (hasRole(user, ["student"])) {
    return <Navigate to="/student-dashboard" replace />;
  }

  // Default fallback (shouldn't happen with proper auth)
  return <Navigate to="/sign-in" replace />;
}
