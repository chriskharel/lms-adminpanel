import { Router } from "express";
import * as ctrl from "../controllers/courses.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// 🟢 Everyone logged in can view courses (role-based filtering in controller)
router.get("/", requireAuth, asyncHandler(ctrl.list));
router.get("/:id", requireAuth, asyncHandler(ctrl.getById));

// 🔵 Only instructors can create courses
router.post("/", requireAuth, requireRole("instructor"), asyncHandler(ctrl.create));

// 🔴 Admin-only: Approve/Reject courses (must come before /:id routes)
router.put("/:id/approve", requireAuth, requireRole("admin"), asyncHandler(ctrl.approve));
router.put("/:id/reject", requireAuth, requireRole("admin"), asyncHandler(ctrl.reject));

// 🟡 Instructors can update/delete their own courses, admins can update/delete any
router.put("/:id", requireAuth, requireRole("admin", "instructor"), asyncHandler(ctrl.update));
router.delete("/:id", requireAuth, requireRole("admin", "instructor"), asyncHandler(ctrl.remove));

export default router;
