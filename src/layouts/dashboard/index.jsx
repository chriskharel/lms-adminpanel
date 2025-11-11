/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
// Removed old widgets; replace with Top Courses table

function Dashboard() {
  const { enrollments, completions } = reportsLineChartData;

  const topCoursesColumns = [
    { Header: "Course", accessor: "course", width: "40%", align: "left" },
    { Header: "Instructor", accessor: "instructor", width: "20%", align: "left" },
    { Header: "Students", accessor: "students", width: "20%", align: "center" },
    { Header: "Completion", accessor: "completion", width: "20%", align: "center" },
  ];

  const topCoursesRows = [
    { course: "React for Beginners", instructor: "John Doe", students: 230, completion: "78%" },
    { course: "Python Data Science", instructor: "Jane Smith", students: 180, completion: "72%" },
    { course: "Data Science Bootcamp", instructor: "David Lee", students: 150, completion: "69%" },
    {
      course: "Full Stack with MERN",
      instructor: "Sarah Johnson",
      students: 320,
      completion: "83%",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="school"
                title="Total Enrollments"
                count={"12,480"}
                percentage={{
                  color: "success",
                  amount: "+7%",
                  label: "vs last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="groups"
                title="Active Students"
                count="2,340"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "vs last week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="menu_book"
                title="Active Courses"
                count="48"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "new this week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="task_alt"
                title="Completion Rate"
                count="76%"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Weekly signups"
                  description="New learner signups (current week)"
                  date="updated just now"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Monthly enrollments"
                  description={
                    <>
                      <strong>+12%</strong> vs previous quarter
                    </>
                  }
                  date="updated 5 min ago"
                  chart={enrollments}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Monthly completions"
                  description="Completion trend"
                  date="just updated"
                  chart={completions}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DataTable
                table={{ columns: topCoursesColumns, rows: topCoursesRows }}
                isSorted
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
