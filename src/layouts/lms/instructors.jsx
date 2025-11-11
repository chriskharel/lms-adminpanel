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
import MenuItem from "@mui/material/MenuItem";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBadge from "components/MDBadge";
import DataTable from "examples/Tables/DataTable";

import api from "../../api/client";
import { useHasRole } from "../../utils/roleHelpers";
import { instructorSchema } from "../../utils/validationSchemas";

function Instructors() {
  const [rowsData, setRowsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const canEdit = useHasRole("admin"); // ✅ only admin can edit/delete
  const canDelete = useHasRole("admin"); // ✅ only admin can delete
  const canView = useHasRole(["admin", "instructor"]); // ✅ both can view table

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(instructorSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      courses: 0,
      students: 0,
      status: "Active",
    },
  });

  const loadInstructors = async () => {
    try {
      const { data } = await api.get("/instructors");
      const sorted = [...data].sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (aDate !== bDate) return aDate - bDate;
        return (a.id || 0) - (b.id || 0);
      });
      const mapped = sorted.map((i, index) => ({
        sr: index + 1,
        name: i.name,
        email: i.email,
        subject: i.subject,
        courses: i.courses,
        students: i.students,
        status: (
          <MDBadge variant="gradient" color={i.status === "Active" ? "success" : "error"} container>
            {i.status}
          </MDBadge>
        ),
        actions:
          canEdit || canDelete ? (
            <MDBox display="flex" justifyContent="center" gap={0.5}>
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" color="info" onClick={() => handleEditOpen(i)}>
                    <Icon fontSize="small">edit</Icon>
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(i.id)}>
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
    } catch (_e) {
      setRowsData([]);
    } finally {
      setLoading(false);
    }
  };

  function handleEditOpen(i) {
    setEditingId(i.id);
    setValue("name", i.name);
    setValue("email", i.email);
    setValue("subject", i.subject);
    setValue("courses", Number(i.courses || 0));
    setValue("students", Number(i.students || 0));
    setValue("status", i.status || "Active");
    setOpen(true);
  }

  async function onSubmit(data) {
    if (!editingId) return;
    try {
      await api.put(`/instructors/${editingId}`, data);
      setOpen(false);
      setEditingId(null);
      reset();
      setLoading(true);
      await loadInstructors();
    } catch (_e) {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/instructors/${id}`);
      await loadInstructors();
    } catch (_e) {
      // handle error
    }
  }

  useEffect(() => {
    loadInstructors();
  }, []);

  const columns = [
    { Header: "Sr", accessor: "sr", width: "6%", align: "left" },
    { Header: "Name", accessor: "name", width: "26%", align: "left" },
    { Header: "Email", accessor: "email", width: "28%", align: "left" },
    { Header: "Subject", accessor: "subject", width: "18%", align: "left" },
    { Header: "Courses", accessor: "courses", width: "10%", align: "center" },
    { Header: "Students", accessor: "students", width: "10%", align: "center" },
    { Header: "Status", accessor: "status", width: "8%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h5" fontWeight="medium">
            Instructor Management
          </MDTypography>
        </MDBox>

        {canView ? (
          <DataTable
            table={{ columns, rows: rowsData }}
            isSorted={true}
            entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
            showTotalEntries={false}
            canSearch
            noEndBorder
          />
        ) : (
          <MDTypography color="error" textAlign="center" mt={4}>
            You are not authorized to view this page.
          </MDTypography>
        )}

        {/* Dialog for edit only (admin only) - only opens when editingId is set */}
        {canEdit && editingId && (
          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Instructor</DialogTitle>
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
                    label="Subject"
                    {...register("subject")}
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Courses"
                    type="number"
                    {...register("courses", { valueAsNumber: true })}
                    error={!!errors.courses}
                    helperText={errors.courses?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Students"
                    type="number"
                    {...register("students", { valueAsNumber: true })}
                    error={!!errors.students}
                    helperText={errors.students?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Status"
                    select
                    {...register("status")}
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
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

export default Instructors;
