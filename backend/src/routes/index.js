import { Router } from "express";
import authRoutes from "./auth.routes.js";
import coursesRoutes from "./courses.routes.js";
import studentsRoutes from "./students.routes.js";
import instructorsRoutes from "./instructors.routes.js";
import adminRoutes from "./admin.routes.js";
import instructorApiRoutes from "./instructor.routes.js";
import studentApiRoutes from "./student.routes.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use("/auth", authRoutes);

// Original routes (backwards compatibility)
router.use("/courses", requireAuth, coursesRoutes);
router.use("/students", requireAuth, studentsRoutes);
router.use("/instructors", requireAuth, instructorsRoutes);

// New role-specific API routes
router.use("/admin", adminRoutes);
router.use("/instructor", instructorApiRoutes);
router.use("/student", studentApiRoutes);

export default router;


