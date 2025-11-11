import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Container } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useAuth } from "../../context/AuthProvider";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSignOut = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Container maxWidth="sm">
        <MDBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          textAlign="center"
        >
          <Icon color="error" sx={{ fontSize: 80, mb: 2 }}>
            lock_outline
          </Icon>
          <MDTypography variant="h3" fontWeight="bold" mb={2}>
            Access Denied
          </MDTypography>
          <MDTypography variant="body1" color="text" mb={4} maxWidth="400px">
            You don&apos;t have permission to access this page. Please contact your administrator if
            you believe this is an error.
          </MDTypography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="info"
              onClick={handleGoBack}
              startIcon={<Icon>arrow_back</Icon>}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleSignOut}
              startIcon={<Icon>logout</Icon>}
            >
              Sign Out
            </Button>
          </Box>
        </MDBox>
      </Container>
      <Footer />
    </DashboardLayout>
  );
}
