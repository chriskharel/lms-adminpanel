/**
=========================================================
* Material Dashboard 2 React - Jobs Control Panel
=========================================================
*/

import React, { useState } from "react";

// @mui
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";

function JobsControlPanel() {
  // Sample data for a job portal admin panel
  const allJobs = [
    {
      id: "job-1992",
      title: "Frontend Engineer",
      company: "Acme Corp",
      applications: 142,
      views: 2350,
      status: "Open",
      updatedAt: new Date(),
      updatedLabel: "today",
    },
    {
      id: "job-1993",
      title: "Backend Engineer",
      company: "Globex",
      applications: 96,
      views: 1450,
      status: "Paused",
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedLabel: "6 hours ago",
    },
    {
      id: "job-1994",
      title: "Product Manager",
      company: "Initech",
      applications: 210,
      views: 3100,
      status: "Closed",
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedLabel: "yesterday",
    },
  ];

  // Toolbar state
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  // KPIs
  const totalJobs = allJobs.length;
  const openJobs = allJobs.filter((j) => j.status === "Open").length;
  const totalApplications = allJobs.reduce((s, j) => s + j.applications, 0);

  // Columns
  const columns = [
    { Header: "job title", accessor: "title", width: "32%", align: "left" },
    { Header: "company", accessor: "company", align: "left" },
    { Header: "applications", accessor: "applications", align: "center" },
    { Header: "views", accessor: "views", align: "center" },
    { Header: "status", accessor: "status", align: "center" },
    { Header: "updated", accessor: "updated", align: "center" },
  ];

  // Filter and map to rows
  const filtered = allJobs.filter((j) => {
    if (statusFilter !== "All" && j.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!j.title.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const rows = filtered.map((j) => ({
    title: (
      <MDBox lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {j.title}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          #{j.id}
        </MDTypography>
      </MDBox>
    ),
    company: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {j.company}
      </MDTypography>
    ),
    applications: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {j.applications.toLocaleString()}
      </MDTypography>
    ),
    views: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {j.views.toLocaleString()}
      </MDTypography>
    ),
    status: (
      <MDTypography
        variant="caption"
        color={j.status === "Open" ? "success" : "text"}
        fontWeight="medium"
      >
        {j.status}
      </MDTypography>
    ),
    updated: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {j.updatedLabel}
      </MDTypography>
    ),
  }));

  // Export CSV
  const handleExport = () => {
    const header = ["id", "title", "company", "applications", "views", "status", "updatedAt"];
    const content = [header.join(",")]
      .concat(
        filtered.map((j) =>
          [
            j.id,
            JSON.stringify(j.title),
            JSON.stringify(j.company),
            j.applications,
            j.views,
            j.status,
            j.updatedAt.toISOString(),
          ].join(",")
        )
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} mb={1}>
          <Grid item xs={12} md={4} lg={4}>
            <DefaultInfoCard color="info" icon="work" title="Total jobs" value={totalJobs} />
          </Grid>
          <Grid item xs={12} md={4} lg={4}>
            <DefaultInfoCard color="success" icon="task" title="Open jobs" value={openJobs} />
          </Grid>
          <Grid item xs={12} md={4} lg={4}>
            <DefaultInfoCard
              color="warning"
              icon="how_to_reg"
              title="Applications"
              value={totalApplications.toLocaleString()}
            />
          </Grid>
        </Grid>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Jobs Control Panel
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Grid container spacing={2} alignItems="center" mb={1}>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      disableClearable
                      options={["All", "Open", "Paused", "Closed"]}
                      value={statusFilter}
                      onChange={(e, v) => setStatusFilter(v)}
                      renderInput={(params) => <MDInput {...params} label="Status" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Search title or company"
                      placeholder="e.g., Frontend, Acme"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                    <MDButton variant="gradient" color="info" onClick={handleExport}>
                      export CSV
                    </MDButton>
                  </Grid>
                </Grid>
                <MDBox
                  sx={{
                    "& thead th": { position: "sticky", top: 0, background: "white", zIndex: 1 },
                    "& th, & td": { py: 1 },
                  }}
                >
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={true}
                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                    showTotalEntries={true}
                    canSearch
                    noEndBorder
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default JobsControlPanel;
