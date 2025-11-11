import bcrypt from "bcryptjs";
import pool from "./db.js";

// 👇 Utility function to hash passwords
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

// 👇 Main seeding function
export default async function seedData() {
  console.log("🚀 Starting basic data seeding...");

  try {
    // First, fix the category column size issue
    try {
      await pool.query("ALTER TABLE courses MODIFY COLUMN category VARCHAR(200)");
      console.log("✅ Fixed category column size");
    } catch (e) {
      console.log("⚠️ Category column fix:", e.message);
    }

    // Clear old data (order matters if foreign keys exist)
    console.log("🧹 Clearing existing data...");
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    
    // Clear tables safely - check if they exist first
    try {
      await pool.query("TRUNCATE TABLE enrollments");
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
    
    try {
      await pool.query("TRUNCATE TABLE student_courses");
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
    
    try {
      await pool.query("TRUNCATE TABLE course_materials");
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
    
    try {
      await pool.query("TRUNCATE TABLE courses");
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
    
    try {
      await pool.query("TRUNCATE TABLE users");
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
    
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    // 👥 Seed users
    console.log("👥 Seeding users...");
    const password1 = await hashPassword("Passw0rd!");
    const password2 = await hashPassword("Student123!");
    const password3 = await hashPassword("Instructor123!");

    const users = [
      ["Admin User", "admin@lms.local", password1, "admin"],
      ["John Doe", "john@example.com", password2, "student"],
      ["Jane Smith", "jane@instructor.com", password3, "instructor"],
    ];

    for (const [name, email, passwordHash, role] of users) {
      await pool.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, passwordHash, role]
      );
    }

    console.log("✅ Users seeded successfully!");

    // 🎓 Seed courses
    console.log("📚 Seeding courses...");
    const courses = [
      ["Intro to Programming", "John Doe", "Tech", 1],
      ["Data Analytics", "Jane Smith", "Tech", 1],
      ["Web Development", "Mike Johnson", "Tech", 1],
    ];

    for (const [title, instructor, category, createdBy] of courses) {
      try {
        await pool.execute(
          "INSERT INTO courses (title, instructor, category, created_by, status) VALUES (?, ?, ?, ?, 'approved')",
          [title, instructor, category, createdBy]
        );
      } catch (error) {
        // Try inserting without created_by if it fails
        console.log("Trying alternative insert for course:", title);
        await pool.execute(
          "INSERT INTO courses (title, instructor, category, status) VALUES (?, ?, ?, 'approved')",
          [title, instructor, category]
        );
      }
    }

    console.log("✅ Courses seeded successfully!");

    // 🧾 Seed enrollments (optional example)
    console.log("🧾 Seeding enrollments...");
    await pool.execute(
      "INSERT INTO enrollments (student_id, course_id, enrolled_at) VALUES (?, ?, NOW())",
      [2, 1] // John enrolled in Intro to Programming
    );

    console.log("✅ Enrollments seeded successfully!");
    console.log("🎉 Comprehensive seeding completed!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
  // Note: Don't close pool here as it's needed for the running server
}
