import pool from "../config/db.js";

// Role-based course listing
export async function list(req, res) {
  const user = req.user; // from requireAuth middleware
  let query = "SELECT c.*, u.name as creator_name FROM courses c LEFT JOIN users u ON c.created_by = u.id";
  const params = [];

  if (user.role === "student") {
    // Students only see approved courses
    query += " WHERE c.status = 'approved'";
  } else if (user.role === "instructor") {
    // Instructors see all approved courses AND their own courses (any status)
    query += " WHERE c.status = 'approved' OR c.created_by = ?";
    params.push(user.id);
  }
  // Admins see all courses (no WHERE clause)

  query += " ORDER BY c.created_at DESC";
  const [rows] = await pool.query(query, params);
  res.json(rows);
}

export async function getById(req, res) {
  const user = req.user;
  const [rows] = await pool.query(
    "SELECT c.*, u.name as creator_name FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: "Course not found" });

  const course = rows[0];

  // Students can only view approved courses
  if (user.role === "student" && course.status !== "approved") {
    return res.status(403).json({ message: "Access denied: course not approved" });
  }

  // Instructors can view approved courses OR their own courses (any status)
  if (user.role === "instructor" && course.status !== "approved" && course.created_by !== user.id) {
    return res.status(403).json({ message: "Access denied: not your course" });
  }

  res.json(course);
}

// Only instructors can create courses
export async function create(req, res) {
  const user = req.user;
  const { title, instructor, category, students = 0 } = req.body;

  // Only instructors can create courses
  if (user.role !== "instructor") {
    return res.status(403).json({ message: "Only instructors can create courses" });
  }

  // Validate required fields
  if (!title || !instructor || !category) {
    return res.status(400).json({ message: "Title, instructor, and category are required" });
  }

  // Validate user.id exists
  if (!user.id || !Number.isInteger(Number(user.id))) {
    return res.status(400).json({ message: "Invalid user ID. Please log in again." });
  }

  try {
    // Verify user exists in database
    const [userCheck] = await pool.query("SELECT id FROM users WHERE id = ?", [user.id]);
    if (userCheck.length === 0) {
      return res.status(400).json({ message: "User not found. Please log in again." });
    }

    // Status is automatically set to 'pending'
    const [result] = await pool.query(
      "INSERT INTO courses (title, instructor, category, students, status, created_by) VALUES (?,?,?,?, 'pending', ?)",
      [title, instructor, category, Number(students) || 0, user.id]
    );
    res.status(201).json({ id: result.insertId, message: "Course created and pending approval" });
  } catch (err) {
    console.error("Error creating course:", err);
    console.error("SQL Error details:", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    // Handle specific SQL errors
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Courses table does not exist. Please restart the server to run migrations." });
    }
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ message: "Invalid user ID. Please log in again." });
    }
    if (err.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({ message: `Database schema error: ${err.sqlMessage || err.message}. Please restart the server.` });
    }
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Course with this title already exists." });
    }
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === "production" 
      ? "Failed to create course. Please try again."
      : err.sqlMessage || err.message || "Failed to create course";
    return res.status(500).json({ message: errorMessage });
  }
}

// Instructors can update their own courses, admins can update any
export async function update(req, res) {
  const user = req.user;
  const { title, instructor, category, students } = req.body;

  // Check if course exists and permissions
  const [courseRows] = await pool.query("SELECT created_by FROM courses WHERE id = ?", [req.params.id]);
  if (!courseRows.length) return res.status(404).json({ message: "Course not found" });

  const course = courseRows[0];

  // Instructors can only update their own courses
  if (user.role === "instructor" && course.created_by !== user.id) {
    return res.status(403).json({ message: "Access denied: not your course" });
  }

  await pool.query(
    "UPDATE courses SET title=?, instructor=?, category=?, students=? WHERE id=?",
    [title, instructor, category, students, req.params.id]
  );
  res.json({ message: "Updated" });
}

// Instructors can delete their own courses, admins can delete any
export async function remove(req, res) {
  const user = req.user;

  const [courseRows] = await pool.query("SELECT created_by FROM courses WHERE id = ?", [req.params.id]);
  if (!courseRows.length) return res.status(404).json({ message: "Course not found" });

  const course = courseRows[0];

  // Instructors can only delete their own courses
  if (user.role === "instructor" && course.created_by !== user.id) {
    return res.status(403).json({ message: "Access denied: not your course" });
  }

  await pool.query("DELETE FROM courses WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
}

// Admin-only: Approve course
export async function approve(req, res) {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }

  const [rows] = await pool.query("SELECT id FROM courses WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: "Course not found" });

  await pool.query("UPDATE courses SET status = 'approved' WHERE id = ?", [req.params.id]);
  res.json({ message: "Course approved" });
}

// Admin-only: Reject course
export async function reject(req, res) {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }

  const [rows] = await pool.query("SELECT id FROM courses WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: "Course not found" });

  await pool.query("UPDATE courses SET status = 'rejected' WHERE id = ?", [req.params.id]);
  res.json({ message: "Course rejected" });
}


