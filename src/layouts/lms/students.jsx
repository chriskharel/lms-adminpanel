import React, { useEffect, useState } from "react";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBadge from "components/MDBadge";
import api from "../../api/client";
import DataTable from "examples/Tables/DataTable";
import { useHasRole } from "../../utils/roleHelpers";
import { studentSchema } from "../../utils/validationSchemas";

function Students() {
  const [rowsData, setRowsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ Role-based permissions
  const isAdmin = useHasRole("admin");
  const isInstructor = useHasRole("instructor");

  const canEdit = isAdmin; // Only admin can edit
  const canDelete = isAdmin; // Only admin can delete
  const canView = isAdmin || isInstructor; // Both can view

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      name: "",
      email: "",
      enrolledCourse: "",
      status: "Active",
    },
  });

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/students");
      const sorted = [...data].sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (aDate !== bDate) return aDate - bDate;
        return (a.id || 0) - (b.id || 0);
      });
      const mapped = sorted.map((s, index) => ({
        sr: index + 1,
        student: s.name,
        email: s.email,
        course: s.enrolledCourse,
        status: (
          <MDBadge variant="gradient" color={s.status === "Active" ? "success" : "error"} container>
            {s.status}
          </MDBadge>
        ),
        actions:
          canEdit || canDelete ? (
            <MDBox display="flex" justifyContent="center" gap={0.5}>
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" color="info" onClick={() => handleEditOpen(s)}>
                    <Icon fontSize="small">edit</Icon>
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
                    <Icon fontSize="small">delete</Icon>
                  </IconButton>
                </Tooltip>
              )}
            </MDBox>
          ) : (
            <MDTypography variant="caption" color="textSecondary">
              View Only
            </MDTypography>
          ),
      }));
      setRowsData(mapped);
    } catch (error) {
      console.error("Error loading students:", error);
      setRowsData([]);
    } finally {
      setLoading(false);
    }
  };

  function handleEditOpen(s) {
    setEditingId(s.id);
    setValue("name", s.name);
    setValue("email", s.email);
    setValue("enrolledCourse", s.enrolledCourse);
    setValue("status", s.status || "Active");
    setOpen(true);
  }

  async function onSubmit(data) {
    if (!editingId) return;
    try {
      await api.put(`/students/${editingId}`, data);
      setOpen(false);
      setEditingId(null);
      reset();
      await loadStudents();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/students/${id}`);
      await loadStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const columns = [
    { Header: "Sr", accessor: "sr", width: "8%", align: "left" },
    { Header: "Student", accessor: "student", width: "30%", align: "left" },
    { Header: "Email", accessor: "email", width: "32%", align: "left" },
    { Header: "Enrolled Course", accessor: "course", width: "20%", align: "left" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h5" fontWeight="medium">
            Student Management
          </MDTypography>
        </MDBox>

        {/* ✅ Admin + Instructor can view the table */}
        {canView ? (
          <DataTable
            table={{ columns, rows: rowsData }}
            isSorted
            entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
            showTotalEntries={false}
            canSearch
            noEndBorder
            loading={loading}
          />
        ) : (
          <MDTypography color="error" textAlign="center" mt={4}>
            You are not authorized to view this page.
          </MDTypography>
        )}

        {/* Dialog for edit only (admin only) - only opens when editingId is set */}
        {canEdit && editingId && (
          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Student</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent>
                <MDBox mt={1}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Name"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Enrolled Course"
                    {...register("enrolledCourse")}
                    error={!!errors.enrolledCourse}
                    helperText={errors.enrolledCourse?.message}
                  />
                </MDBox>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="info">
                  Save
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        )}
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Students;
