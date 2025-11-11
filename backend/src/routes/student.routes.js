import express from 'express';
import { 
  getStudentCourses, 
  getAvailableCourses, 
  enrollInCourse,
  updateProgress,
  getStudentAnalytics 
} from '../controllers/student.controller.js';
import { requireAuth, requireRole, checkStudentEnrollment } from '../middleware/auth.js';

const router = express.Router();

// All routes require student role
router.use(requireAuth);
router.use(requireRole('student'));

// Get student's enrolled courses
router.get('/my-courses', getStudentCourses);

// Get available courses for enrollment
router.get('/available', getAvailableCourses);

// Enroll in a course
router.post('/enroll/:courseId', enrollInCourse);

// Update course progress (only for enrolled courses)
router.put('/progress/:courseId', checkStudentEnrollment, updateProgress);

// Get student analytics
router.get('/analytics', getStudentAnalytics);

export default router;
