import { Router } from "express";
import * as ctrl from "../controllers/students.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * STUDENT ROUTES
 * - Admin → full CRUD
 * - Instructor → view only (GET)
 * - Student → no access
 */

// List all students
router.get("/", requireAuth, requireRole("admin", "instructor"), asyncHandler(ctrl.list));

// Get single student
router.get("/:id", requireAuth, requireRole("admin", "instructor"), asyncHandler(ctrl.getById));

// Update student (admin only)
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.update));

// Delete student (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.remove));

export default router;
