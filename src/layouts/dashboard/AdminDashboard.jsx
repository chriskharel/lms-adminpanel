import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
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

function AdminDashboard() {
  const [overview, setOverview] = useState({});
  const [pendingCourses, setPendingCourses] = useState([]);
  const [users, setUsers] = useState({ users: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, pendingRes, usersRes] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/courses/pending"),
        api.get("/admin/users?limit=5"),
      ]);
      
      setOverview(overviewRes.data);
      setPendingCourses(pendingRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAction = async (courseId, status) => {
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status });
      setApprovalDialog(false);
      setSelectedCourse(null);
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  // Transform data for charts with fallbacks
  const userStatsData = overview.userStats || [];
  const enrollmentData = overview.monthlyEnrollments?.length > 0 
    ? overview.monthlyEnrollments 
    : [{ month: 'No Data', enrollments: 0 }];
  const coursePerformanceData = overview.coursePerformance?.slice(0, 6)?.length > 0
    ? overview.coursePerformance.slice(0, 6)
    : [{ title: 'No Data', total_enrolled: 0 }];

  const columns = [
    { Header: "Name", accessor: "name", width: "30%", align: "left" },
    { Header: "Email", accessor: "email", width: "30%", align: "left" },
    { Header: "Role", accessor: "role", width: "20%", align: "center" },
    { Header: "Joined", accessor: "joined", width: "20%", align: "center" },
  ];

  const userRows = users.users?.map((user) => ({
    name: user.name,
    email: user.email,
    role: (
      <Chip
        label={user.role}
        color={user.role === "admin" ? "error" : user.role === "instructor" ? "info" : "success"}
        size="small"
      />
    ),
    joined: new Date(user.created_at).toLocaleDateString(),
  })) || [];

  const pendingColumns = [
    { Header: "Course Title", accessor: "title", width: "40%", align: "left" },
    { Header: "Instructor", accessor: "instructor", width: "25%", align: "left" },
    { Header: "Category", accessor: "category", width: "15%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "20%", align: "center" },
  ];

  const pendingRows = pendingCourses.map((course) => ({
    title: course.title,
    instructor: course.instructor_name || course.instructor,
    category: (
      <Chip label={course.category} color="info" size="small" variant="outlined" />
    ),
    actions: (
      <MDBox display="flex" justifyContent="center" gap={1}>
        <Button
          size="small"
          color="success"
          variant="contained"
          onClick={() => handleCourseAction(course.id, "approved")}
        >
          Approve
        </Button>
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={() => {
            setSelectedCourse(course);
            setApprovalDialog(true);
          }}
        >
          Reject
        </Button>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Statistics Cards */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="people"
                  title="Total Users"
                  count={
                    userStatsData.reduce((acc, stat) => acc + stat.count, 0) || 0
                  }
                  percentage={{
                    color: "success",
                    amount: "+3%",
                    label: "than last month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="school"
                  title="Active Courses"
                  count={
                    overview.courseStats?.find((s) => s.status === "approved")
                      ?.count || 0
                  }
                  percentage={{
                    color: "success",
                    amount: "+5%",
                    label: "than last week",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="assignment"
                  title="Total Enrollments"
                  count={overview.totalEnrollments || 0}
                  percentage={{
                    color: "success",
                    amount: "+12%",
                    label: "than last month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="pending"
                  title="Pending Approvals"
                  count={
                    overview.courseStats?.find((s) => s.status === "pending")
                      ?.count || 0
                  }
                  percentage={{
                    color: "error",
                    amount: "+2",
                    label: "new requests",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Charts */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
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
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card sx={{ height: "100%" }}>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Top Performing Courses
                  </MDTypography>
                  <MDBox height="300px" minHeight="300px" width="100%">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <BarChart data={coursePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="title"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_enrolled" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Data Tables */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Recent Users
                  </MDTypography>
                  <DataTable
                    table={{ columns, rows: userRows }}
                    showTotalEntries={false}
                    isSorted={false}
                    noEndBorder
                    entriesPerPage={false}
                  />
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" gutterBottom>
                    Pending Course Approvals
                  </MDTypography>
                  <DataTable
                    table={{ columns: pendingColumns, rows: pendingRows }}
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

        {/* Confirmation Dialog */}
        <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
          <DialogTitle>Reject Course</DialogTitle>
          <DialogContent>
            <MDTypography variant="body2">
              Are you sure you want to reject the course "{selectedCourse?.title}"?
              This action cannot be undone.
            </MDTypography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() =>
                selectedCourse && handleCourseAction(selectedCourse.id, "rejected")
              }
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminDashboard;
