/**
=========================================================
* LMS Admin Panel - Routes Configuration
=========================================================
*/

// Layouts
import Dashboard from "layouts/dashboard";
import AdminDashboard from "layouts/dashboard/AdminDashboard";
import InstructorDashboard from "layouts/dashboard/InstructorDashboard";
import StudentDashboard from "layouts/dashboard/StudentDashboard";
import Instructors from "layouts/lms/instructors";
import Students from "layouts/lms/students";
import Courses from "layouts/lms/courses";

// Auth pages
import SignIn from "layouts/authentication/SignIn";

// Router component
import DashboardRouter from "components/DashboardRouter";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // Smart dashboard router for root path
  {
    key: "dashboard-router",
    route: "/",
    component: DashboardRouter,
    protected: true,
  },
  // Role-specific dashboards
  {
    type: "collapse",
    name: "Dashboard",
    key: "admin-dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: AdminDashboard,
    protected: true,
    roles: ["admin"],
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "instructor-dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/instructor-dashboard",
    component: InstructorDashboard,
    protected: true,
    roles: ["instructor"],
  },
  {
    type: "collapse",
    name: "My Learning",
    key: "student-dashboard",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/student-dashboard", 
    component: StudentDashboard,
    protected: true,
    roles: ["student"],
  },
  // Admin-only routes
  {
    type: "collapse",
    name: "Instructor Management",
    key: "instructors",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/instructors",
    component: Instructors,
    protected: true,
    roles: ["admin"],
  },
  {
    type: "collapse",
    name: "Student Management",
    key: "students",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/students",
    component: Students,
    protected: true,
    roles: ["admin"],
  },
  // Course management (role-dependent view)
  {
    type: "collapse",
    name: "Courses",
    key: "courses",
    icon: <Icon fontSize="small">menu_book</Icon>,
    route: "/courses",
    component: Courses,
    protected: true,
    roles: ["admin", "instructor", "student"],
  },
  // Student-specific routes
  {
    type: "collapse",
    name: "My Courses",
    key: "my-courses",
    icon: <Icon fontSize="small">bookmark</Icon>,
    route: "/my-courses",
    component: Courses, // Can reuse same component with different view logic
    protected: true,
    roles: ["student"],
  },
  // Instructor-specific routes
  {
    type: "collapse",
    name: "My Students",
    key: "my-students",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/my-students",
    component: Students,
    protected: true,
    roles: ["instructor"],
  },
  // public route
  {
    name: "Sign In",
    key: "sign-in",
    route: "/sign-in",
    component: SignIn,
    icon: <Icon fontSize="small">login</Icon>,
  },
  // Sign Up removed per requirement
];

export default routes;
