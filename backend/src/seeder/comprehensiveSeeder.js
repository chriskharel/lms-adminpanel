import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import updateSchema from '../config/updateSchema.js';

const seedData = async () => {
  try {
    console.log('🌱 Starting comprehensive data seeding...');

    // First, update the schema
    await updateSchema();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    await db.execute('DELETE FROM student_courses');
    await db.execute('DELETE FROM courses');
    await db.execute('DELETE FROM users');
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Seed users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    const [adminResult] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@lms.com', hashedPassword, 'admin']
    );
    const adminId = adminResult.insertId;

    // Instructors
    const instructors = [
      { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@lms.com' },
      { name: 'Prof. Michael Chen', email: 'michael.chen@lms.com' },
      { name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@lms.com' }
    ];

    const instructorIds = [];
    for (const instructor of instructors) {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [instructor.name, instructor.email, hashedPassword, 'instructor']
      );
      instructorIds.push(result.insertId);
    }

    // Students
    const students = [
      { name: 'Alice Smith', email: 'alice.smith@student.com' },
      { name: 'Bob Wilson', email: 'bob.wilson@student.com' },
      { name: 'Charlie Brown', email: 'charlie.brown@student.com' },
      { name: 'Diana Prince', email: 'diana.prince@student.com' },
      { name: 'Edward Miller', email: 'edward.miller@student.com' },
      { name: 'Fiona Davis', email: 'fiona.davis@student.com' }
    ];

    const studentIds = [];
    for (const student of students) {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [student.name, student.email, hashedPassword, 'student']
      );
      studentIds.push(result.insertId);
    }

    // Seed courses
    console.log('📚 Seeding courses...');
    const courses = [
      // Sarah Johnson's courses
      {
        title: 'Full Stack Web Development with React & Node.js',
        instructor: 'Dr. Sarah Johnson',
        category: 'Web Development',
        students: 45,
        status: 'approved',
        created_by: instructorIds[0]
      },
      {
        title: 'Advanced JavaScript & ES6+',
        instructor: 'Dr. Sarah Johnson',
        category: 'Programming',
        students: 32,
        status: 'approved',
        created_by: instructorIds[0]
      },
      {
        title: 'React Native Mobile Development',
        instructor: 'Dr. Sarah Johnson',
        category: 'Web Development',
        students: 28,
        status: 'pending',
        created_by: instructorIds[0]
      },
      
      // Michael Chen's courses
      {
        title: 'Machine Learning Fundamentals',
        instructor: 'Prof. Michael Chen',
        category: 'AI / ML',
        students: 67,
        status: 'approved',
        created_by: instructorIds[1]
      },
      {
        title: 'Deep Learning with TensorFlow',
        instructor: 'Prof. Michael Chen',
        category: 'AI / ML',
        students: 43,
        status: 'approved',
        created_by: instructorIds[1]
      },
      {
        title: 'Computer Vision Applications',
        instructor: 'Prof. Michael Chen',
        category: 'AI / ML',
        students: 25,
        status: 'pending',
        created_by: instructorIds[1]
      },
      
      // Emily Rodriguez's courses
      {
        title: 'Docker & Kubernetes Masterclass',
        instructor: 'Dr. Emily Rodriguez',
        category: 'DevOps',
        students: 38,
        status: 'approved',
        created_by: instructorIds[2]
      },
      {
        title: 'AWS Cloud Architecture',
        instructor: 'Dr. Emily Rodriguez',
        category: 'DevOps',
        students: 52,
        status: 'approved',
        created_by: instructorIds[2]
      },
      {
        title: 'CI/CD Pipeline Automation',
        instructor: 'Dr. Emily Rodriguez',
        category: 'DevOps',
        students: 31,
        status: 'approved',
        created_by: instructorIds[2]
      }
    ];

    const courseIds = [];
    for (const course of courses) {
      const [result] = await db.execute(
        'INSERT INTO courses (title, instructor, category, students, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [course.title, course.instructor, course.category, course.students, course.status, course.created_by]
      );
      courseIds.push(result.insertId);
    }

    // Seed student enrollments with realistic progress
    console.log('📖 Seeding student enrollments...');
    const enrollments = [
      // Alice Smith - enrolled in 3 courses
      { studentId: studentIds[0], courseId: courseIds[0], progress: 85.5 },
      { studentId: studentIds[0], courseId: courseIds[3], progress: 67.2 },
      { studentId: studentIds[0], courseId: courseIds[6], progress: 100.0 },
      
      // Bob Wilson - enrolled in 4 courses
      { studentId: studentIds[1], courseId: courseIds[0], progress: 45.8 },
      { studentId: studentIds[1], courseId: courseIds[1], progress: 92.3 },
      { studentId: studentIds[1], courseId: courseIds[4], progress: 78.9 },
      { studentId: studentIds[1], courseId: courseIds[7], progress: 23.4 },
      
      // Charlie Brown - enrolled in 2 courses
      { studentId: studentIds[2], courseId: courseIds[3], progress: 100.0 },
      { studentId: studentIds[2], courseId: courseIds[8], progress: 56.7 },
      
      // Diana Prince - enrolled in 5 courses
      { studentId: studentIds[3], courseId: courseIds[0], progress: 12.5 },
      { studentId: studentIds[3], courseId: courseIds[1], progress: 100.0 },
      { studentId: studentIds[3], courseId: courseIds[3], progress: 89.1 },
      { studentId: studentIds[3], courseId: courseIds[6], progress: 76.3 },
      { studentId: studentIds[3], courseId: courseIds[7], progress: 34.8 },
      
      // Edward Miller - enrolled in 3 courses
      { studentId: studentIds[4], courseId: courseIds[4], progress: 91.7 },
      { studentId: studentIds[4], courseId: courseIds[6], progress: 100.0 },
      { studentId: studentIds[4], courseId: courseIds[8], progress: 68.2 },
      
      // Fiona Davis - enrolled in 2 courses
      { studentId: studentIds[5], courseId: courseIds[1], progress: 43.6 },
      { studentId: studentIds[5], courseId: courseIds[7], progress: 87.4 }
    ];

    for (const enrollment of enrollments) {
      const completedAt = enrollment.progress === 100 ? new Date() : null;
      await db.execute(
        'INSERT INTO student_courses (student_id, course_id, progress, completed_at) VALUES (?, ?, ?, ?)',
        [enrollment.studentId, enrollment.courseId, enrollment.progress, completedAt]
      );
    }

    // Seed course materials
    console.log('📄 Seeding course materials...');
    const materials = [
      // Full Stack Web Development course materials
      { courseId: courseIds[0], title: 'Introduction to Full Stack Development', type: 'video', duration: 25 },
      { courseId: courseIds[0], title: 'Setting up Development Environment', type: 'video', duration: 30 },
      { courseId: courseIds[0], title: 'React Fundamentals', type: 'video', duration: 45 },
      { courseId: courseIds[0], title: 'Project Setup Assignment', type: 'assignment', duration: 120 },
      
      // Machine Learning Fundamentals materials
      { courseId: courseIds[3], title: 'What is Machine Learning?', type: 'video', duration: 20 },
      { courseId: courseIds[3], title: 'Linear Regression Deep Dive', type: 'video', duration: 40 },
      { courseId: courseIds[3], title: 'ML Algorithms Cheat Sheet', type: 'document', duration: 0 },
      { courseId: courseIds[3], title: 'Midterm Quiz', type: 'quiz', duration: 60 },
      
      // Docker & Kubernetes materials
      { courseId: courseIds[6], title: 'Container Basics', type: 'video', duration: 35 },
      { courseId: courseIds[6], title: 'Docker Commands Reference', type: 'document', duration: 0 },
      { courseId: courseIds[6], title: 'Kubernetes Deployment Lab', type: 'assignment', duration: 180 }
    ];

    for (const [index, material] of materials.entries()) {
      await db.execute(
        'INSERT INTO course_materials (course_id, title, type, duration_minutes, order_index) VALUES (?, ?, ?, ?, ?)',
        [material.courseId, material.title, material.type, material.duration, index + 1]
      );
    }

    console.log('✅ Comprehensive seeding completed successfully!');
    console.log(`
📊 SEEDED DATA SUMMARY:
   • 1 Admin user
   • 3 Instructor users  
   • 6 Student users
   • 9 Courses (7 approved, 2 pending)
   • 19 Student enrollments
   • 11 Course materials

🔐 LOGIN CREDENTIALS:
   Admin: admin@lms.com / password123
   Instructor: sarah.johnson@lms.com / password123
   Student: alice.smith@student.com / password123
   (All users have password: password123)
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedData;
