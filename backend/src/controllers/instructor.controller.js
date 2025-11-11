import db from '../config/db.js';

// Get instructor's own courses
export const getInstructorCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.*, 
       COUNT(sc.student_id) as enrolled_students,
       AVG(sc.progress) as avg_progress
       FROM courses c 
       LEFT JOIN student_courses sc ON c.id = sc.course_id 
       WHERE c.created_by = ? 
       GROUP BY c.id 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

// Get students enrolled in instructor's courses
export const getInstructorStudents = async (req, res) => {
  try {
    const [students] = await db.execute(
      `SELECT DISTINCT u.id, u.name, u.email, u.created_at,
       COUNT(sc.course_id) as enrolled_courses,
       AVG(sc.progress) as avg_progress
       FROM users u
       JOIN student_courses sc ON u.id = sc.student_id
       JOIN courses c ON sc.course_id = c.id
       WHERE c.created_by = ? AND u.role = 'student'
       GROUP BY u.id
       ORDER BY u.name`,
      [req.user.id]
    );

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching instructor students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// Get detailed student progress in instructor's courses
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [progress] = await db.execute(
      `SELECT c.title, c.category, sc.progress, sc.enrolled_at, sc.completed_at
       FROM courses c
       JOIN student_courses sc ON c.id = sc.course_id
       WHERE c.created_by = ? AND sc.student_id = ?
       ORDER BY sc.enrolled_at DESC`,
      [req.user.id, studentId]
    );

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ message: 'Failed to fetch student progress' });
  }
};

// Get instructor dashboard analytics
export const getInstructorAnalytics = async (req, res) => {
  try {
    // Total courses
    const [coursesCount] = await db.execute(
      'SELECT COUNT(*) as total FROM courses WHERE created_by = ?',
      [req.user.id]
    );

    // Total students
    const [studentsCount] = await db.execute(
      `SELECT COUNT(DISTINCT sc.student_id) as total 
       FROM student_courses sc 
       JOIN courses c ON sc.course_id = c.id 
       WHERE c.created_by = ?`,
      [req.user.id]
    );

    // Course completion rates
    const [completionRates] = await db.execute(
      `SELECT c.title, 
       COUNT(sc.student_id) as total_enrolled,
       COUNT(CASE WHEN sc.progress = 100 THEN 1 END) as completed
       FROM courses c
       LEFT JOIN student_courses sc ON c.id = sc.course_id
       WHERE c.created_by = ?
       GROUP BY c.id, c.title`,
      [req.user.id]
    );

    // Monthly enrollments
    const [monthlyEnrollments] = await db.execute(
      `SELECT DATE_FORMAT(sc.enrolled_at, '%Y-%m') as month,
       COUNT(*) as enrollments
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       WHERE c.created_by = ?
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      [req.user.id]
    );

    res.status(200).json({
      totalCourses: coursesCount[0].total,
      totalStudents: studentsCount[0].total,
      completionRates,
      monthlyEnrollments
    });
  } catch (error) {
    console.error('Error fetching instructor analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
