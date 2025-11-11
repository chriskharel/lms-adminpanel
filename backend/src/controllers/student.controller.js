import db from '../config/db.js';

// Get student's enrolled courses
export const getStudentCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.*, sc.progress, sc.enrolled_at, sc.completed_at,
       u.name as instructor_name
       FROM courses c
       JOIN student_courses sc ON c.id = sc.course_id
       LEFT JOIN users u ON c.created_by = u.id
       WHERE sc.student_id = ?
       ORDER BY sc.enrolled_at DESC`,
      [req.user.id]
    );

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

// Get available courses for enrollment
export const getAvailableCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.*, u.name as instructor_name,
       COUNT(sc.student_id) as enrolled_count
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN student_courses sc ON c.id = sc.course_id
       WHERE c.status = 'approved' 
       AND c.id NOT IN (
         SELECT course_id FROM student_courses WHERE student_id = ?
       )
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ message: 'Failed to fetch available courses' });
  }
};

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and is approved
    const [courseCheck] = await db.execute(
      'SELECT id, status FROM courses WHERE id = ?',
      [courseId]
    );

    if (courseCheck.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseCheck[0].status !== 'approved') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if already enrolled
    const [enrollmentCheck] = await db.execute(
      'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    if (enrollmentCheck.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Enroll student
    await db.execute(
      'INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)',
      [req.user.id, courseId]
    );

    res.status(201).json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
};

// Update course progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    // Check if enrolled
    const [enrollmentCheck] = await db.execute(
      'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    // Update progress
    const completedAt = progress === 100 ? new Date() : null;
    
    await db.execute(
      'UPDATE student_courses SET progress = ?, completed_at = ? WHERE student_id = ? AND course_id = ?',
      [progress, completedAt, req.user.id, courseId]
    );

    res.status(200).json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};

// Get student dashboard analytics
export const getStudentAnalytics = async (req, res) => {
  try {
    // Total enrolled courses
    const [totalCourses] = await db.execute(
      'SELECT COUNT(*) as total FROM student_courses WHERE student_id = ?',
      [req.user.id]
    );

    // Completed courses
    const [completedCourses] = await db.execute(
      'SELECT COUNT(*) as total FROM student_courses WHERE student_id = ? AND progress = 100',
      [req.user.id]
    );

    // Average progress
    const [avgProgress] = await db.execute(
      'SELECT AVG(progress) as average FROM student_courses WHERE student_id = ?',
      [req.user.id]
    );

    // Recent activity
    const [recentActivity] = await db.execute(
      `SELECT c.title, sc.progress, sc.enrolled_at
       FROM courses c
       JOIN student_courses sc ON c.id = sc.course_id
       WHERE sc.student_id = ?
       ORDER BY sc.enrolled_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.status(200).json({
      totalCourses: totalCourses[0].total,
      completedCourses: completedCourses[0].total,
      averageProgress: Math.round(avgProgress[0].average || 0),
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
