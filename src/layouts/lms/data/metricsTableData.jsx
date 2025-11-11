/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

export default function data() {
  const NumberCell = ({ value }) => (
    <MDTypography variant="button" color="text" fontWeight="medium">
      {value.toLocaleString()}
    </MDTypography>
  );

  const Status = ({ active }) => (
    <MDBox ml={-1}>
      <MDBadge
        badgeContent={active ? "active" : "inactive"}
        color={active ? "success" : "dark"}
        variant="gradient"
        size="sm"
      />
    </MDBox>
  );

  return {
    columns: [
      { Header: "course", accessor: "course", width: "32%", align: "left" },
      { Header: "enrollments", accessor: "enrollments", align: "center" },
      { Header: "reenrollments", accessor: "reenrollments", align: "center" },
      { Header: "active users", accessor: "activeUsers", align: "center" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "updated", accessor: "updated", align: "center" },
    ],

    rows: [
      {
        course: (
          <MDBox lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              YLA 101: Intro to Learning
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Fundamentals track
            </MDTypography>
          </MDBox>
        ),
        enrollments: <NumberCell value={1240} />,
        reenrollments: <NumberCell value={180} />,
        activeUsers: <NumberCell value={670} />,
        status: <Status active />,
        updated: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            2 hours ago
          </MDTypography>
        ),
      },
      {
        course: (
          <MDBox lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              YLA 201: Project-Based Learning
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Intermediate track
            </MDTypography>
          </MDBox>
        ),
        enrollments: <NumberCell value={860} />,
        reenrollments: <NumberCell value={140} />,
        activeUsers: <NumberCell value={420} />,
        status: <Status active />,
        updated: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            today
          </MDTypography>
        ),
      },
      {
        course: (
          <MDBox lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              YLA 301: Leadership Lab
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Capstone
            </MDTypography>
          </MDBox>
        ),
        enrollments: <NumberCell value={510} />,
        reenrollments: <NumberCell value={95} />,
        activeUsers: <NumberCell value={260} />,
        status: <Status active={false} />,
        updated: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            yesterday
          </MDTypography>
        ),
      },
    ],
  };
}
