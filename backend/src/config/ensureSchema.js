import pool from "./db.js";

export default async function ensureSchema() {
  // Ensure the users table exists so auth can work even if SQL seed wasn't run manually
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin','instructor','student','hr','manager','employee') NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create courses table with status and created_by
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      instructor VARCHAR(255) NOT NULL,
      category VARCHAR(200) NOT NULL,
      students INT DEFAULT 0,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      created_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_created_by (created_by)
    )
  `);
  
  // Add foreign key constraint separately (after table creation)
  try {
    await pool.query(`
      ALTER TABLE courses 
      ADD CONSTRAINT fk_courses_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    `);
  } catch (err) {
    // Constraint might already exist
    if (!err.message.includes("Duplicate foreign key") && !err.message.includes("already exists")) {
      console.log("⚠️ Could not add foreign key constraint:", err.message);
    }
  }

  // Check if courses table exists and has the right structure
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM courses");
    const columnNames = columns.map((col) => col.Field);

    // Add status column if it doesn't exist
    if (!columnNames.includes("status")) {
      await pool.query("ALTER TABLE courses ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
      console.log("✅ Added status column to courses table");
    }

    // Expand category column if it's too small
    const categoryColumn = columns.find(col => col.Field === "category");
    if (categoryColumn && categoryColumn.Type === "varchar(100)") {
      await pool.query("ALTER TABLE courses MODIFY COLUMN category VARCHAR(200) NOT NULL");
      console.log("✅ Expanded category column to VARCHAR(200)");
    }

    // Add created_by column if it doesn't exist (nullable initially)
    if (!columnNames.includes("created_by")) {
      await pool.query("ALTER TABLE courses ADD COLUMN created_by INT NULL");
      console.log("✅ Added created_by column to courses table");
      
      // Try to set a default created_by for existing courses (use first admin or instructor)
      try {
        const [users] = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'instructor') LIMIT 1");
        if (users.length > 0) {
          await pool.query("UPDATE courses SET created_by = ? WHERE created_by IS NULL", [users[0].id]);
        }
      } catch (updateErr) {
        console.log("⚠️ Could not set default created_by:", updateErr.message);
      }
      
      // Add foreign key constraint
      try {
        await pool.query("ALTER TABLE courses ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE");
        console.log("✅ Added foreign key constraint for created_by");
      } catch (fkErr) {
        // Foreign key might already exist
        if (!fkErr.message.includes("Duplicate foreign key")) {
          console.log("⚠️ Could not add foreign key constraint:", fkErr.message);
        }
      }
    }

    // Update existing courses to approved if they don't have status
    await pool.query("UPDATE courses SET status = 'approved' WHERE status IS NULL OR status = ''");
  } catch (err) {
    // Table might not exist yet, which is fine - it will be created by CREATE TABLE IF NOT EXISTS above
    if (err.code !== "ER_NO_SUCH_TABLE") {
      console.log("⚠️ Could not migrate courses table:", err.message);
    }
  }

  // Create student_courses table (enrollments)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      progress DECIMAL(5,2) DEFAULT 0.00,
      completed_at TIMESTAMP NULL,
      INDEX idx_student_id (student_id),
      INDEX idx_course_id (course_id),
      UNIQUE KEY unique_enrollment (student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // Create enrollments table as alias/view for student_courses for compatibility
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      progress DECIMAL(5,2) DEFAULT 0.00,
      completed_at TIMESTAMP NULL,
      INDEX idx_student_id (student_id),
      INDEX idx_course_id (course_id),
      UNIQUE KEY unique_enrollment (student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // Create course_materials table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS course_materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      type ENUM('video', 'document', 'quiz', 'assignment') NOT NULL,
      content_url VARCHAR(500),
      description TEXT,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_course_id (course_id),
      INDEX idx_order (order_index),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);
}


