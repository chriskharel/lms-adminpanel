# 🎓 LMS Admin Panel - Udemy-Style Learning Management System

A comprehensive Learning Management System built with React, Material UI, Node.js, and MySQL featuring role-based access control and modern dashboard analytics.

## ✨ Features

### 🎭 Role-Based Access Control
- **Admin**: Full system control, user management, course approvals, and analytics
- **Instructor**: Personal course management, student tracking, and performance analytics  
- **Student**: Course enrollment, progress tracking, and learning dashboard

### 📊 Modern Dashboards
- **Admin Dashboard**: System overview, user management, course approvals, analytics charts
- **Instructor Dashboard**: Course performance, student progress, enrollment analytics
- **Student Dashboard**: Learning progress, course recommendations, completion tracking

### 🔧 Enhanced Features
- Interactive charts and analytics (Recharts)
- Real-time progress tracking
- Course enrollment system
- Material approval workflow
- Responsive design with Material UI
- Professional snackbar notifications
- Role-specific navigation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd adminLMS
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend  
cd backend
npm install
```

3. **Setup database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE adminlms;
exit
```

4. **Configure environment**
```bash
# Copy and edit backend/.env
cd backend
cp .env.example .env

# Edit .env with your database credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=adminlms
JWT_SECRET=your_jwt_secret
```

5. **Seed database with sample data**
```bash
npm run seed:full
```

6. **Start the application**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from root directory)
cd ..
npm start
```

## 🔐 Default Login Credentials

After running the seeder, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | password123 |
| Instructor | sarah.johnson@lms.com | password123 |
| Student | alice.smith@student.com | password123 |

## 🏗️ Architecture

### Backend Structure
```
backend/src/
├── controllers/          # Role-specific business logic
│   ├── admin.controller.js
│   ├── instructor.controller.js
│   ├── student.controller.js
│   └── courses.controller.js
├── middleware/          # Authentication & authorization
│   └── auth.js
├── routes/             # API endpoints
│   ├── admin.routes.js
│   ├── instructor.routes.js
│   └── student.routes.js
└── config/            # Database & configuration
    └── db.js
```

### Frontend Structure
```
src/
├── layouts/
│   └── dashboard/         # Role-specific dashboards
│       ├── AdminDashboard.jsx
│       ├── InstructorDashboard.jsx
│       └── StudentDashboard.jsx
├── components/           # Reusable components
├── utils/               # Validation & helpers
└── api/                 # API client
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with roles (admin, instructor, student)
- **courses**: Course content with approval workflow
- **student_courses**: Enrollment and progress tracking
- **course_materials**: Course content and materials

### Key Relationships
- Courses → Users (created_by instructor)
- Student_Courses → Users + Courses (many-to-many)
- Course_Materials → Courses (one-to-many)

## 🛣️ API Endpoints

### Admin Routes
```
GET    /api/admin/overview          # Dashboard analytics
GET    /api/admin/users            # User management
GET    /api/admin/courses/pending  # Pending approvals
PUT    /api/admin/courses/:id/status # Approve/reject courses
DELETE /api/admin/users/:id        # Delete user
```

### Instructor Routes
```
GET    /api/instructor/my-courses     # Instructor's courses
GET    /api/instructor/my-students    # Enrolled students
GET    /api/instructor/analytics      # Performance data
GET    /api/instructor/students/:id/progress # Student progress
```

### Student Routes
```
GET    /api/student/my-courses       # Enrolled courses
GET    /api/student/available        # Available courses
POST   /api/student/enroll/:id       # Course enrollment
PUT    /api/student/progress/:id     # Update progress
GET    /api/student/analytics        # Learning analytics
```

## 🎨 UI Components

### Dashboard Features
- **Statistics Cards**: Key metrics with trend indicators
- **Interactive Charts**: Progress tracking and enrollment analytics
- **Data Tables**: Sortable, searchable content management
- **Quick Actions**: Role-specific action buttons
- **Responsive Design**: Mobile-friendly layout

### Enhanced UX
- **Snackbar Notifications**: Professional user feedback
- **Loading States**: Smooth user experience
- **Error Handling**: Graceful error management
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Authorization**: Middleware protection
- **Resource Ownership**: Instructors can only access their content
- **Input Validation**: Yup schema validation
- **SQL Injection Protection**: Parameterized queries

## 📈 Analytics & Reporting

### Admin Analytics
- User registration trends
- Course approval pipeline
- System-wide engagement metrics
- Monthly growth statistics

### Instructor Analytics  
- Course completion rates
- Student enrollment trends
- Individual student progress
- Performance comparisons

### Student Analytics
- Learning progress tracking
- Course completion status
- Time investment metrics
- Achievement milestones

## 🎯 Best Practices Implemented

1. **Separation of Concerns**: Clear role-based architecture
2. **Error Handling**: Comprehensive error management
3. **Code Organization**: Modular, maintainable structure
4. **User Experience**: Intuitive, responsive design
5. **Security**: Multi-layer protection
6. **Scalability**: Database design for growth

## 🚀 Deployment

### Production Setup
```bash
# Build frontend
npm run build

# Set production environment variables
NODE_ENV=production

# Start production server
npm start
```

### Environment Variables
```bash
# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=adminlms

# Security
JWT_SECRET=your_secure_secret
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material UI for the design system
- Recharts for analytics visualization
- React ecosystem for modern frontend development
- MySQL for reliable data storage

---

**Built with ❤️ for modern education technology**
