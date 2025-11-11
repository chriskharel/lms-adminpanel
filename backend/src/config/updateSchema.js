import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateSchema = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db'
  });

  try {
    console.log('Updating database schema...');

    // First ensure users table has correct columns
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT ''
    `);

    // Add created_by column to courses table if it doesn't exist
    await connection.execute(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS created_by INT,
      ADD CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    `).catch(() => {
      // Ignore if foreign key already exists
      console.log('Foreign key constraint already exists or cannot be created');
    });

    // Create student_courses table for enrollment and progress tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        progress DECIMAL(5,2) DEFAULT 0.00,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (student_id, course_id)
      )
    `);

    // Create course_materials table for storing course content
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        type ENUM('video', 'document', 'quiz', 'assignment') NOT NULL,
        content_url VARCHAR(500),
        duration_minutes INT DEFAULT 0,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    console.log('Database schema updated successfully!');

  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await connection.end();
  }
};

export default updateSchema;
