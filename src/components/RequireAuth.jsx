import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { hasRole } from "../utils/roleHelpers";

export default function RequireAuth({ children, roles }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!token || !user) return <Navigate to="/sign-in" replace state={{ from: location }} />;

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0 && !hasRole(user, roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};
