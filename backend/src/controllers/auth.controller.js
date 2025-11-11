import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { signJwt } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role = "student" } = req.body;
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) return res.status(409).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)", [
    name,
    email,
    hash,
    role,
  ]);

  return res.status(201).json({ message: "Registered successfully" });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email or password format", errors: errors.array() });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const [rows] = await pool.query("SELECT id, name, email, password_hash, role FROM users WHERE email = ?", [
    email,
  ]);
  if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signJwt({ id: user.id, role: user.role, name: user.name, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});


