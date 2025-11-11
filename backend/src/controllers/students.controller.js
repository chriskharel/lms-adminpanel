import pool from "../config/db.js";

export async function list(_req, res) {
  const [rows] = await pool.query(
    "SELECT id, name, email, enrolled_course as enrolledCourse, progress, status FROM students ORDER BY id DESC"
  );
  res.json(rows);
}

export async function getById(req, res) {
  const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: "Student not found" });
  res.json(rows[0]);
}

export async function create(req, res) {
  const { name, email, enrolledCourse, progress = 0, status = "Active" } = req.body;
  const [result] = await pool.query(
    "INSERT INTO students (name, email, enrolled_course, progress, status) VALUES (?,?,?,?,?)",
    [name, email, enrolledCourse, progress, status]
  );
  res.status(201).json({ id: result.insertId });
}

export async function update(req, res) {
  const { name, email, enrolledCourse, progress, status } = req.body;
  await pool.query(
    "UPDATE students SET name=?, email=?, enrolled_course=?, progress=?, status=? WHERE id=?",
    [name, email, enrolledCourse, progress, status, req.params.id]
  );
  res.json({ message: "Updated" });
}

export async function remove(req, res) {
  await pool.query("DELETE FROM students WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
}


