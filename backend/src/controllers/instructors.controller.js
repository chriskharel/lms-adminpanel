import pool from "../config/db.js";

export async function list(_req, res) {
  const [rows] = await pool.query(
    "SELECT id, name, email, subject, courses, students, status FROM instructors ORDER BY id DESC"
  );
  res.json(rows);
}

export async function getById(req, res) {
  const [rows] = await pool.query("SELECT * FROM instructors WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: "Instructor not found" });
  res.json(rows[0]);
}

export async function create(req, res) {
  const { name, email, subject, courses = 0, students = 0, status = "Active" } = req.body;
  const [result] = await pool.query(
    "INSERT INTO instructors (name, email, subject, courses, students, status) VALUES (?,?,?,?,?,?)",
    [name, email, subject, courses, students, status]
  );
  res.status(201).json({ id: result.insertId });
}

export async function update(req, res) {
  const { name, email, subject, courses, students, status } = req.body;
  await pool.query(
    "UPDATE instructors SET name=?, email=?, subject=?, courses=?, students=?, status=? WHERE id=?",
    [name, email, subject, courses, students, status, req.params.id]
  );
  res.json({ message: "Updated" });
}

export async function remove(req, res) {
  await pool.query("DELETE FROM instructors WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
}


