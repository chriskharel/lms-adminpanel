// src/layouts/authentication/SignIn.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Grid, Button, TextField, Typography, Box, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../api/client";
import { useAuth } from "../../context/AuthProvider";
import { signInSchema } from "../../utils/validationSchemas";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
    mode: "onBlur", // Validate on blur for better UX
  });

  async function onSubmit(data) {
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post("/auth/login", data);
      login(response.data.token, response.data.user);
      
      // Redirect to appropriate dashboard based on user role
      const user = response.data.user;
      let redirectPath = "/";
      
      if (user.role === "admin") {
        redirectPath = "/dashboard";
      } else if (user.role === "instructor") {
        redirectPath = "/instructor-dashboard";
      } else if (user.role === "student") {
        redirectPath = "/student-dashboard";
      }
      
      // Use the intended path if it exists and is appropriate for the user
      const intendedPath = location.state?.from?.pathname;
      if (intendedPath && intendedPath !== "/") {
        navigate(intendedPath, { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Invalid email or password";
      setError(message);
      // eslint-disable-next-line no-console
      console.error("Login error:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={11} sm={8} md={4}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 5 }}>
            <Typography variant="h5" fontWeight="bold" mb={1} textAlign="center">
              YNLA ADMIN
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              Welcome back — please sign in to continue
            </Typography>

            <form onSubmit={handleFormSubmit(onSubmit)}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                size="small"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                size="small"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
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
                  {submitting ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
                </Button>
              </Box>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
