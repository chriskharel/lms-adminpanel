import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable";
import api from "../../api/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function InstructorDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, coursesRes, studentsRes] = await Promise.all([
        api.get("/instructor/analytics"),
        api.get("/instructor/my-courses"),
        api.get("/instructor/my-students"),
      ]);
      
      setAnalytics(analyticsRes.data);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Error loading instructor dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts with fallbacks
  const completionData = analytics.completionRates?.length > 0
    ? analytics.completionRates.map((course) => ({
        name: course.title.substring(0, 20) + "...",
        completed: course.completed,
        total: course.total_enrolled,
        completionRate: course.total_enrolled > 0 
          ? Math.round((course.completed / course.total_enrolled) * 100) 
          : 0,
      }))
    : [{ name: 'No Data', completed: 0, total: 0, completionRate: 0 }];

  const enrollmentData = analytics.monthlyEnrollments?.length > 0
    ? analytics.monthlyEnrollments
    : [{ month: 'No Data', enrollments: 0 }];

  // Course table
  const courseColumns = [
    { Header: "Course Title", accessor: "title", width: "40%", align: "left" },
    { Header: "Category", accessor: "category", width: "15%", align: "center" },
    { Header: "Students", accessor: "students", width: "15%", align: "center" },
    { Header: "Avg Progress", accessor: "progress", width: "15%", align: "center" },
    { Header: "Status", accessor: "status", width: "15%", align: "center" },
  ];

  const courseRows = courses.map((course) => ({
    title: course.title,
    category: (
      <Chip label={course.category} color="info" size="small" variant="outlined" />
    ),
    students: course.enrolled_students || 0,
    progress: `${Math.round(course.avg_progress || 0)}%`,
    status: (
      <Chip
        label={course.status}
        color={
          course.status === "approved"
            ? "success"
            : course.status === "pending"
            ? "warning"
            : "error"
        }
        size="small"
      />
    ),
  }));

  // Student table
  const studentColumns = [
    { Header: "Student Name", accessor: "name", width: "30%", align: "left" },
    { Header: "Email", accessor: "email", width: "30%", align: "left" },
    { Header: "Courses", accessor: "courses", width: "20%", align: "center" },
    { Header: "Avg Progress", accessor: "progress", width: "20%", align: "center" },
  ];

  const studentRows = students.slice(0, 5).map((student) => ({
    name: student.name,
    email: student.email,
    courses: student.enrolled_courses || 0,
    progress: `${Math.round(student.avg_progress || 0)}%`,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Instructor Dashboard
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Monitor your courses and student progress
          </MDTypography>
        </MDBox>

        {/* Statistics Cards */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="school"
                  title="My Courses"
                  count={analytics.totalCourses || 0}
                  percentage={{
                    color: "success",
                    amount: "+2",
                    label: "new this month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="people"
                  title="Total Students"
                  count={analytics.totalStudents || 0}
                  percentage={{
                    color: "success",
                    amount: "+8%",
                    label: "than last month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="trending_up"
                  title="Course Completion"
                  count={
                    completionData.length > 0
                      ? Math.round(
                          completionData.reduce((acc, course) => acc + course.completionRate, 0) /
                            completionData.length
                        ) + "%"
                      : "0%"
                  }
                  percentage={{
                    color: "success",
                    amount: "+5%",
                    label: "average rate",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="assignment"
                  title="Active Enrollments"
                  count={
                    enrollmentData.reduce((acc, month) => acc + month.enrollments, 0) || 0
                  }
                  percentage={{
                    color: "success",
                    amount: "+12%",
                    label: "growth rate",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Charts */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Course Completion Rates
                  </MDTypography>
                  <MDBox height="300px" minHeight="300px" width="100%">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <BarChart data={completionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [
                          name === 'completionRate' ? `${value}%` : value,
                          name === 'completionRate' ? 'Completion Rate' : 
                          name === 'completed' ? 'Completed' : 'Total Enrolled'
                        ]} />
                        <Bar dataKey="completionRate" fill="#8884d8" name="completionRate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: "100%" }}>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Monthly Enrollments
                  </MDTypography>
                  <MDBox height="300px" minHeight="300px" width="100%">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <LineChart data={enrollmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="enrollments"
                          stroke="#00C49F"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Quick Actions */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Quick Actions
              </MDTypography>
              <MDBox display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<Icon>add</Icon>}
                  href="/courses"
                >
                  Create New Course
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<Icon>people</Icon>}
                  href="/instructors"
                >
                  View My Students
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<Icon>analytics</Icon>}
                >
                  View Analytics
                </Button>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>

        {/* Data Tables */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    My Courses
                  </MDTypography>
                  <DataTable
                    table={{ columns: courseColumns, rows: courseRows }}
                    showTotalEntries={false}
                    isSorted={false}
                    noEndBorder
                    entriesPerPage={false}
                  />
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Recent Students
                  </MDTypography>
                  <DataTable
                    table={{ columns: studentColumns, rows: studentRows }}
                    showTotalEntries={false}
                    isSorted={false}
                    noEndBorder
                    entriesPerPage={false}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default InstructorDashboard;
