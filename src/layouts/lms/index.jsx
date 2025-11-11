import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Layout wrappers from Material Dashboard
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// This component is your main LMS Admin Dashboard
function LMSAdmin() {
  const stats = [
    { icon: "school", label: "Total Students", value: "1,240" },
    { icon: "menu_book", label: "Courses Available", value: "48" },
    { icon: "people", label: "Active Instructors", value: "22" },
    { icon: "assignment_turned_in", label: "Completed Courses", value: "310" },
  ];

  const recentCourses = [
    {
      title: "React for Beginners",
      instructor: "John Smith",
      students: 230,
      status: "Active",
    },
    {
      title: "Advanced Python Programming",
      instructor: "Jane Doe",
      students: 180,
      status: "Active",
    },
    {
      title: "Data Analysis with Pandas",
      instructor: "Mark Lee",
      students: 150,
      status: "Inactive",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3}>
          {stats.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ p: 2 }}>
                <MDBox display="flex" alignItems="center">
                  <Icon color="info" sx={{ fontSize: "2rem", mr: 1 }}>
                    {item.icon}
                  </Icon>
                  <MDBox>
                    <MDTypography variant="button" color="text">
                      {item.label}
                    </MDTypography>
                    <MDTypography variant="h5" fontWeight="medium">
                      {item.value}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Courses Table */}
        <MDBox mt={5}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Recent Courses
              </MDTypography>
              <MDBox mt={2}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "8px" }}>Course Name</th>
                      <th style={{ padding: "8px" }}>Instructor</th>
                      <th style={{ padding: "8px" }}>Students</th>
                      <th style={{ padding: "8px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((c, i) => (
                      <tr key={i}>
                        <td style={{ padding: "8px" }}>{c.title}</td>
                        <td style={{ padding: "8px" }}>{c.instructor}</td>
                        <td style={{ padding: "8px" }}>{c.students}</td>
                        <td
                          style={{
                            padding: "8px",
                            color: c.status === "Active" ? "green" : "red",
                            fontWeight: 500,
                          }}
                        >
                          {c.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LMSAdmin;
