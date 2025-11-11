import express from 'express';
import { 
  getAdminOverview, 
  getAllUsers, 
  getPendingCourses,
  updateCourseStatus,
  deleteUser,
  getSystemStats 
} from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Get admin dashboard overview
router.get('/overview', getAdminOverview);

// Get system statistics
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);

// Course approval
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:courseId/status', updateCourseStatus);

export default router;
