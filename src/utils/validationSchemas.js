import * as yup from "yup";

// Sign In validation
export const signInSchema = yup.object().shape({
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

// Student validation
export const studentSchema = yup.object().shape({
  name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  enrolledCourse: yup.string().required("Enrolled course is required"),
  status: yup.string().oneOf(["Active", "Inactive"], "Status must be Active or Inactive").required("Status is required"),
});

// Instructor validation
export const instructorSchema = yup.object().shape({
  name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  subject: yup.string().required("Subject is required"),
  courses: yup.number().min(0, "Courses must be 0 or greater").required("Courses is required"),
  students: yup.number().min(0, "Students must be 0 or greater").required("Students is required"),
  status: yup.string().oneOf(["Active", "Inactive"], "Status must be Active or Inactive").required("Status is required"),
});

// Course validation (instructors create, status is auto-set to pending)
export const courseSchema = yup.object().shape({
  title: yup.string().min(3, "Title must be at least 3 characters").required("Title is required"),
  instructor: yup.string().required("Instructor is required"),
  category: yup.string().oneOf(["Web Development", "Programming", "AI / ML", "DevOps"], "Invalid category").required("Category is required"),
  students: yup
    .number()
    .typeError("Students must be a number")
    .min(0, "Students must be 0 or greater")
    .required("Students is required")
    .default(0),
  // Status is not in form - it's automatically set to 'pending' when instructor creates
});

