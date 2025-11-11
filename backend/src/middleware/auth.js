import { verifyJwt } from "../utils/jwt.js";
import db from '../config/db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = verifyJwt(token);
    req.user = payload;
    next();
  } catch (_e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
}

// Middleware to check if instructor owns the resource
export function checkInstructorOwnership(resourceType = 'course') {
  return async (req, res, next) => {
    if (req.user.role === 'admin') {
      return next(); // Admins can access everything
    }

    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resourceId = req.params.id || req.params.courseId;
    
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource ID required' });
    }

    try {
      let query;
      let params;

      switch (resourceType) {
        case 'course':
          query = 'SELECT created_by FROM courses WHERE id = ?';
          params = [resourceId];
          break;
        case 'student':
          // Check if student is enrolled in instructor's courses
          query = `
            SELECT DISTINCT sc.student_id 
            FROM student_courses sc 
            JOIN courses c ON sc.course_id = c.id 
            WHERE sc.student_id = ? AND c.created_by = ?
          `;
          params = [resourceId, req.user.id];
          break;
        default:
          return res.status(400).json({ message: 'Invalid resource type' });
      }

      const [rows] = await db.execute(query, params);

      if (resourceType === 'course') {
        if (rows.length === 0 || rows[0].created_by !== req.user.id) {
          return res.status(403).json({ message: 'Access denied - not your resource' });
        }
      } else if (resourceType === 'student') {
        if (rows.length === 0) {
          return res.status(403).json({ message: 'Access denied - student not in your courses' });
        }
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  };
}

// Middleware to ensure student can only access their enrolled courses
export function checkStudentEnrollment(req, res, next) {
  if (req.user.role === 'admin') {
    return next(); // Admins can access everything
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const courseId = req.params.id || req.params.courseId;
  
  if (!courseId) {
    return res.status(400).json({ message: 'Course ID required' });
  }

  return (async () => {
    try {
      const [rows] = await db.execute(
        'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?',
        [req.user.id, courseId]
      );

      if (rows.length === 0) {
        return res.status(403).json({ message: 'Access denied - not enrolled in this course' });
      }

      next();
    } catch (error) {
      console.error('Enrollment check error:', error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  })();
}

// Alias for consistency with requirements
export const authorize = requireRole;


