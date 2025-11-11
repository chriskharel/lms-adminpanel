import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Reports() {
  const summary = [
    { label: "Total Enrollments", value: "12,480", icon: "school", color: "info" },
    { label: "Active Courses", value: "35", icon: "menu_book", color: "success" },
    { label: "Completed Courses", value: "18", icon: "check_circle", color: "warning" },
    { label: "Total Instructors", value: "14", icon: "person", color: "primary" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={3}>
        <Grid container spacing={3}>
          {summary.map((item, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card>
                <MDBox p={2} display="flex" alignItems="center">
                  <MDBox
                    bgColor={item.color}
                    color="white"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ width: 50, height: 50, mr: 2 }}
                  >
                    <Icon>{item.icon}</Icon>
                  </MDBox>
                  <MDBox lineHeight={1}>
                    <MDTypography variant="button" color="text">
                      {item.label}
                    </MDTypography>
                    <MDTypography variant="h6" fontWeight="medium">
                      {item.value}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Card>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              Reports Overview
            </MDTypography>
            <MDTypography variant="button" color="text">
              Here you can display charts showing:
              <ul>
                <li>Monthly enrollment growth</li>
                <li>Student completion rates</li>
                <li>Top performing courses</li>
                <li>Instructor engagement</li>
              </ul>
            </MDTypography>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Reports;
