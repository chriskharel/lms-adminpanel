import db from '../config/db.js';

// Get admin dashboard overview
export const getAdminOverview = async (req, res) => {
  try {
    // Total counts
    const [totalUsers] = await db.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const [totalCourses] = await db.execute(
      'SELECT status, COUNT(*) as count FROM courses GROUP BY status'
    );

    const [totalEnrollments] = await db.execute(
      'SELECT COUNT(*) as total FROM student_courses'
    );

    // Recent activities
    const [recentUsers] = await db.execute(
      'SELECT name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10'
    );

    const [recentCourses] = await db.execute(
      `SELECT c.title, c.status, c.created_at, u.name as instructor_name
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       ORDER BY c.created_at DESC LIMIT 10`
    );

    // Monthly statistics
    const [monthlyEnrollments] = await db.execute(
      `SELECT DATE_FORMAT(enrolled_at, '%Y-%m') as month,
       COUNT(*) as enrollments
       FROM student_courses
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    );

    const [monthlyUsers] = await db.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
       COUNT(*) as new_users
       FROM users
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    );

    // Course performance
    const [coursePerformance] = await db.execute(
      `SELECT c.title, c.category,
       COUNT(sc.student_id) as total_enrolled,
       AVG(sc.progress) as avg_progress,
       COUNT(CASE WHEN sc.progress = 100 THEN 1 END) as completed
       FROM courses c
       LEFT JOIN student_courses sc ON c.id = sc.course_id
       WHERE c.status = 'approved'
       GROUP BY c.id, c.title, c.category
       ORDER BY total_enrolled DESC
       LIMIT 10`
    );

    res.status(200).json({
      userStats: totalUsers,
      courseStats: totalCourses,
      totalEnrollments: totalEnrollments[0].total,
      recentUsers,
      recentCourses,
      monthlyEnrollments,
      monthlyUsers,
      coursePerformance
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ message: 'Failed to fetch admin overview' });
  }
};

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (role) {
      whereClause += ' WHERE role = ?';
      params.push(role);
    }

    if (search) {
      whereClause += role ? ' AND' : ' WHERE';
      whereClause += ' (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [users] = await db.execute(
      `SELECT id, name, email, role, created_at FROM users${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [totalCount] = await db.execute(
      `SELECT COUNT(*) as total FROM users${whereClause}`,
      params
    );

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalCount[0].total / limit),
      currentPage: parseInt(page),
      totalUsers: totalCount[0].total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get pending courses for approval
export const getPendingCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.*, u.name as instructor_name, u.email as instructor_email
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.status = 'pending'
       ORDER BY c.created_at ASC`
    );

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching pending courses:', error);
    res.status(500).json({ message: 'Failed to fetch pending courses' });
  }
};

// Approve or reject course
export const updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await db.execute(
      'UPDATE courses SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, courseId]
    );

    // TODO: Send notification to instructor
    res.status(200).json({ message: `Course ${status} successfully` });
  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({ message: 'Failed to update course status' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting the admin user
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// System statistics
export const getSystemStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'instructor') as total_instructors,
        (SELECT COUNT(*) FROM courses WHERE status = 'approved') as approved_courses,
        (SELECT COUNT(*) FROM courses WHERE status = 'pending') as pending_courses,
        (SELECT COUNT(*) FROM student_courses) as total_enrollments,
        (SELECT AVG(progress) FROM student_courses) as avg_progress
    `);

    res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Failed to fetch system statistics' });
  }
};
