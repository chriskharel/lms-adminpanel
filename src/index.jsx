import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Custom components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function LMSAdmin() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Stats cards */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6" fontWeight="medium">
                Total Courses
              </MDTypography>
              <MDTypography variant="h4" color="info">
                48
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6" fontWeight="medium">
                Enrolled Students
              </MDTypography>
              <MDTypography variant="h4" color="info">
                1,280
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6" fontWeight="medium">
                Active Instructors
              </MDTypography>
              <MDTypography variant="h4" color="info">
                32
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6" fontWeight="medium">
                Monthly Revenue
              </MDTypography>
              <MDTypography variant="h4" color="info">
                £12,430
              </MDTypography>
            </Card>
          </Grid>
        </Grid>

        {/* Courses summary section */}
        <MDBox mt={4}>
          <Card sx={{ p: 3 }}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Recent Courses
            </MDTypography>
            <MDBox>
              <ul>
                <li>React for Beginners – 120 Students</li>
                <li>Python Data Science Bootcamp – 90 Students</li>
                <li>Full Stack with MERN – 60 Students</li>
                <li>Cloud Computing Basics – 45 Students</li>
              </ul>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LMSAdmin;
