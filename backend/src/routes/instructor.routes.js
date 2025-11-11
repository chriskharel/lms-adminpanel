import express from 'express';
import { 
  getInstructorCourses, 
  getInstructorStudents, 
  getStudentProgress,
  getInstructorAnalytics 
} from '../controllers/instructor.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require instructor role
router.use(requireAuth);
router.use(requireRole('instructor'));

// Get instructor's courses
router.get('/my-courses', getInstructorCourses);

// Get instructor's students
router.get('/my-students', getInstructorStudents);

// Get specific student progress in instructor's courses
router.get('/students/:studentId/progress', getStudentProgress);

// Get instructor analytics
router.get('/analytics', getInstructorAnalytics);

export default router;
