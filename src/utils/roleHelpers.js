import { useAuth } from "../context/AuthProvider";

/**
 * Check if the current user has one of the required roles.
 * Works both for single or multiple roles.
 * @param {string | string[]} requiredRoles - Role(s) to check (e.g. "admin" or ["admin", "instructor"])
 * @returns {boolean} True if the logged-in user matches at least one required role.
 */
export function useHasRole(requiredRoles) {
  const { user } = useAuth();
  if (!user?.role) return false;

  const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return allowed.includes(user.role.toLowerCase());
}

/**
 * Non-hook helper for checking role access outside React components.
 * @param {object} user - User object containing the `role` property.
 * @param {string | string[]} requiredRoles - Role(s) to check.
 * @returns {boolean} True if user's role is in the allowed list.
 */
export function hasRole(user, requiredRoles) {
  if (!user?.role) return false;

  const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return allowed.includes(user.role.toLowerCase());
}
