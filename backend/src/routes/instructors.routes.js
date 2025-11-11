import { Router } from "express";
import * as ctrl from "../controllers/instructors.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * INSTRUCTOR ROUTES
 * - Admin → full CRUD
 * - Instructor → view only (GET)
 * - Student → no access
 */

// List all instructors
router.get("/", requireAuth, requireRole("admin", "instructor"), asyncHandler(ctrl.list));

// Get single instructor
router.get("/:id", requireAuth, requireRole("admin", "instructor"), asyncHandler(ctrl.getById));

// Update instructor (admin only)
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.update));

// Delete instructor (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.remove));

export default router;
