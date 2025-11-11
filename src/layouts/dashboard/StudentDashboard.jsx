import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable";
import api from "../../api/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function StudentDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, coursesRes, availableRes] = await Promise.all([
        api.get("/student/analytics"),
        api.get("/student/my-courses"),
        api.get("/student/available"),
      ]);
      
      setAnalytics(analyticsRes.data);
      setCourses(coursesRes.data);
      setAvailableCourses(availableRes.data.slice(0, 3)); // Show only 3 recommended courses
    } catch (error) {
      console.error("Error loading student dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/student/enroll/${courseId}`);
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  // Transform data for charts with fallbacks
  const progressData = courses.length > 0
    ? courses.map((course) => ({
        name: course.title.substring(0, 15) + "...",
        progress: course.progress || 0,
      }))
    : [{ name: 'No Courses', progress: 0 }];

  const completionData = (analytics.totalCourses || 0) > 0
    ? [
        { name: "Completed", value: analytics.completedCourses || 0 },
        { name: "In Progress", value: (analytics.totalCourses || 0) - (analytics.completedCourses || 0) },
      ]
    : [{ name: "No Data", value: 1 }];

  // Course table columns
  const courseColumns = [
    { Header: "Course", accessor: "title", width: "35%", align: "left" },
    { Header: "Instructor", accessor: "instructor", width: "20%", align: "left" },
    { Header: "Category", accessor: "category", width: "15%", align: "center" },
    { Header: "Progress", accessor: "progress", width: "20%", align: "center" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
  ];

  const courseRows = courses.map((course) => ({
    title: course.title,
    instructor: course.instructor_name || course.instructor,
    category: (
      <Chip label={course.category} color="info" size="small" variant="outlined" />
    ),
    progress: (
      <MDBox width="100%">
        <MDBox display="flex" justifyContent="space-between" mb={0.5}>
          <MDTypography variant="caption">{Math.round(course.progress || 0)}%</MDTypography>
        </MDBox>
        <MDProgress
          variant="gradient"
          color={course.progress === 100 ? "success" : course.progress > 50 ? "info" : "warning"}
          value={course.progress || 0}
        />
      </MDBox>
    ),
    status: (
      <Icon
        color={course.progress === 100 ? "success" : "warning"}
        fontSize="small"
      >
        {course.progress === 100 ? "check_circle" : "schedule"}
      </Icon>
    ),
  }));

  // Available courses
  const availableColumns = [
    { Header: "Course", accessor: "title", width: "40%", align: "left" },
    { Header: "Instructor", accessor: "instructor", width: "25%", align: "left" },
    { Header: "Students", accessor: "students", width: "15%", align: "center" },
    { Header: "Action", accessor: "action", width: "20%", align: "center" },
  ];

  const availableRows = availableCourses.map((course) => ({
    title: course.title,
    instructor: course.instructor_name || course.instructor,
    students: course.enrolled_count || 0,
    action: (
      <Button
        size="small"
        variant="contained"
        color="info"
        onClick={() => handleEnroll(course.id)}
      >
        Enroll
      </Button>
    ),
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDTypography variant="h6">Loading dashboard...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            My Learning Dashboard
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Track your progress and discover new courses
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
                  title="Enrolled Courses"
                  count={analytics.totalCourses || 0}
                  percentage={{
                    color: "success",
                    amount: "+1",
                    label: "new this month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="check_circle"
                  title="Completed"
                  count={analytics.completedCourses || 0}
                  percentage={{
                    color: "success",
                    amount: "+2",
                    label: "this month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="trending_up"
                  title="Average Progress"
                  count={`${analytics.averageProgress || 0}%`}
                  percentage={{
                    color: "success",
                    amount: "+15%",
                    label: "improvement",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="access_time"
                  title="In Progress"
                  count={
                    (analytics.totalCourses || 0) - (analytics.completedCourses || 0)
                  }
                  percentage={{
                    color: "warning",
                    amount: "3",
                    label: "courses active",
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
                    Course Progress Overview
                  </MDTypography>
                  <MDBox height="300px" minHeight="300px" width="100%">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <BarChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                        <Bar dataKey="progress" fill="#8884d8" />
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
                    Completion Status
                  </MDTypography>
                  <MDBox height="300px" minHeight="300px" width="100%" display="flex" alignItems="center" justifyContent="center">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <PieChart>
                        <Pie
                          data={completionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </MDBox>
                  <MDBox mt={2}>
                    {completionData.map((entry, index) => (
                      <MDBox key={entry.name} display="flex" alignItems="center" mb={1}>
                        <MDBox
                          width="12px"
                          height="12px"
                          borderRadius="50%"
                          bgcolor={COLORS[index % COLORS.length]}
                          mr={1}
                        />
                        <MDTypography variant="caption">
                          {entry.name}: {entry.value}
                        </MDTypography>
                      </MDBox>
                    ))}
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
                  startIcon={<Icon>search</Icon>}
                >
                  Browse Courses
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<Icon>book</Icon>}
                >
                  Continue Learning
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<Icon>certificate</Icon>}
                >
                  View Certificates
                </Button>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>

        {/* Data Tables */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
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
            <Grid item xs={12} lg={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Recommended Courses
                  </MDTypography>
                  <DataTable
                    table={{ columns: availableColumns, rows: availableRows }}
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

        {/* Recent Activity */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" gutterBottom>
                Recent Activity
              </MDTypography>
              <MDBox>
                {analytics.recentActivity?.slice(0, 5).map((activity, index) => (
                  <MDBox key={index} display="flex" alignItems="center" py={1} borderBottom="1px solid #f0f0f0">
                    <Icon color="info" sx={{ mr: 2 }}>book</Icon>
                    <MDBox flexGrow={1}>
                      <MDTypography variant="button" fontWeight="medium">
                        {activity.title}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" display="block">
                        Progress: {Math.round(activity.progress || 0)}%
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="caption" color="text">
                      {new Date(activity.enrolled_at).toLocaleDateString()}
                    </MDTypography>
                  </MDBox>
                )) || (
                  <MDTypography variant="body2" color="text">
                    No recent activity to show.
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default StudentDashboard;
