import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Grid, Button, TextField, Typography, Box, CircularProgress } from "@mui/material";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    setError("");

    ```
try {
  // Replace with your actual API call later
  console.log("Registering user:", form);
  setTimeout(() => {
    navigate("/authentication/sign-in");
  }, 1000);
} catch (err) {
  setError("Registration failed, please try again.");
} finally {
  setSubmitting(false);
}
```;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)" }}
    >
      {" "}
      <Grid container justifyContent="center">
        {" "}
        <Grid item xs={11} sm={8} md={4}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 5 }}>
            {" "}
            <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
              Create Account{" "}
            </Typography>{" "}
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              Join the LMS Admin Panel{" "}
            </Typography>
            ```
            <form onSubmit={handleSubmit}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                margin="normal"
                size="small"
                value={form.name}
                onChange={handleChange}
              />
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                size="small"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                size="small"
                value={form.password}
                onChange={handleChange}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                fullWidth
                margin="normal"
                size="small"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              {error && (
                <Typography color="error" mt={1} fontSize={14}>
                  {error}
                </Typography>
              )}

              <Box mt={3} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={submitting}
                  fullWidth
                  sx={{ textTransform: "none", py: 1.2, fontWeight: "bold" }}
                >
                  {submitting ? <CircularProgress size={22} color="inherit" /> : "Sign Up"}
                </Button>
              </Box>

              <Box mt={3} textAlign="center">
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link
                    to="/authentication/sign-in"
                    style={{ color: "#1976d2", textDecoration: "none" }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
