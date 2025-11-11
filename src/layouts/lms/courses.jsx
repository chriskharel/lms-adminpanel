import React, { useEffect, useState, useCallback } from "react";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBadge from "components/MDBadge";
import DataTable from "examples/Tables/DataTable";
import api from "../../api/client";
import { useHasRole } from "../../utils/roleHelpers";
import { courseSchema } from "../../utils/validationSchemas";
import { useAuth } from "../../context/AuthProvider";

function Courses() {
  const [rowsData, setRowsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const { user } = useAuth();
  const isAdmin = useHasRole("admin");
  const isInstructor = useHasRole("instructor");
  const isStudent = useHasRole("student");

  // Only instructors can add courses
  const canAdd = isInstructor;
  // Instructors can edit/delete their own courses, admins can edit/delete any
  const canEdit = isAdmin || isInstructor;
  const canDelete = isAdmin || isInstructor;
  const canApprove = isAdmin; // Only admins can approve/reject

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(courseSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      title: "",
      instructor: "",
      category: "",
      students: 0,
    },
  });

  // Extracted row mapping for readability
  const mapCourseRows = (data) => {
    return data.map((c, index) => {
      let statusColor = "info";
      if (c.status === "approved") statusColor = "success";
      else if (c.status === "rejected") statusColor = "error";
      else if (c.status === "pending") statusColor = "warning";

      return {
        sr: index + 1,
        id: `#${c.id}`,
        title: c.title,
        instructor: c.instructor,
        category: <Chip label={c.category} color="info" size="small" variant="outlined" />,
        students: (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={0.5}
          >
            <Icon fontSize="small" color="info">
              people
            </Icon>
            <MDTypography variant="button" fontWeight="medium" color="info">
              {c.students}
            </MDTypography>
          </MDBox>
        ),
        status: (
          <MDBadge variant="gradient" color={statusColor} container>
            {c.status?.charAt(0).toUpperCase() + c.status?.slice(1) || "Pending"}
          </MDBadge>
        ),
        updated: c.updated_at?.slice(0, 10) || "",
        actions: (
          <MDBox
            display="flex"
            justifyContent="center"
            gap={0.5}
            aria-label={`Actions for course ${c.title}`}
          >
            {/* Admin: Approve/Reject buttons */}
            {canApprove && c.status === "pending" && (
              <>
                <Tooltip title="Approve">
                  <IconButton
                    size="small"
                    color="success"
                    aria-label="Approve course"
                    onClick={() => handleApprove(c.id)}
                  >
                    <Icon fontSize="small">check_circle</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Reject course"
                    onClick={() => handleReject(c.id)}
                  >
                    <Icon fontSize="small">cancel</Icon>
                  </IconButton>
                </Tooltip>
              </>
            )}
            {/* Edit/Delete buttons for instructors (own courses) and admins (all courses) */}
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  color="info"
                  aria-label="Edit course"
                  onClick={() => handleEditOpen(c)}
                >
                  <Icon fontSize="small">edit</Icon>
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete course"
                  onClick={() => handleDelete(c.id)}
                >
                  <Icon fontSize="small">delete</Icon>
                </IconButton>
              </Tooltip>
            )}
            {/* Students: View only */}
            {isStudent && (
              <MDTypography variant="caption" color="text">
                View Only
              </MDTypography>
            )}
          </MDBox>
        ),
      };
    });
  };

  const loadCourses = useCallback(async () => {
    try {
      const { data } = await api.get("/courses");
      const sorted = [...data].sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (aDate !== bDate) return aDate - bDate;
        return (a.id || 0) - (b.id || 0);
      });
      setRowsData(mapCourseRows(sorted));
    } catch (_e) {
      setRowsData([]);
      setSnackbar({ open: true, message: "Failed to load courses.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [mapCourseRows]);

  async function onSubmit(data) {
    try {
      setLoading(true);
      if (editingId) {
        await api.put(`/courses/${editingId}`, {
          ...data,
          students: Number(data.students) || 0,
        });
        setSnackbar({ open: true, message: "Course updated successfully!", severity: "success" });
      } else {
        // Only instructors can create, status is auto-set to 'pending'
        await api.post("/courses", {
          ...data,
          students: Number(data.students) || 0, // Ensure students is a number
        });
        setSnackbar({ open: true, message: "Course created successfully!", severity: "success" });
      }
      setOpen(false);
      setEditingId(null);
      reset();
      await loadCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to save course. Please try again.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleEditOpen(course) {
    setEditingId(course.id);
    setValue("title", course.title || "");
    setValue("instructor", course.instructor || "");
    setValue("category", course.category && typeof course.category === "string" ? course.category : "");
    setValue("students", Number(course.students ?? 0));
    setOpen(true);
  }

  function handleAddOpen() {
    setEditingId(null);
    reset();
    // Auto-fill instructor name for instructors
    if (isInstructor && user?.name) {
      setValue("instructor", user.name);
    }
    setOpen(true);
  }

  async function handleDelete(courseId) {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setSnackbar({ open: true, message: "Course deleted successfully!", severity: "success" });
      await loadCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      setSnackbar({ open: true, message: "Failed to delete course.", severity: "error" });
    }
  }

  async function handleApprove(courseId) {
    try {
      await api.put(`/courses/${courseId}/approve`);
      setSnackbar({ open: true, message: "Course approved!", severity: "success" });
      await loadCourses();
    } catch (err) {
      console.error("Error approving course:", err);
      setSnackbar({ open: true, message: "Failed to approve course.", severity: "error" });
    }
  }

  async function handleReject(courseId) {
    try {
      await api.put(`/courses/${courseId}/reject`);
      setSnackbar({ open: true, message: "Course rejected!", severity: "success" });
      await loadCourses();
    } catch (err) {
      console.error("Error rejecting course:", err);
      setSnackbar({ open: true, message: "Failed to reject course.", severity: "error" });
    }
  }

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Page title based on role
  const pageTitle = isInstructor ? "My Courses" : isAdmin ? "All Courses" : "Courses";

  const columns = [
    { Header: "Sr", accessor: "sr", width: "6%", align: "left" },
    { Header: "Title", accessor: "title", width: "24%", align: "left" },
    { Header: "Instructor", accessor: "instructor", width: "16%", align: "left" },
    { Header: "Category", accessor: "category", width: "12%", align: "left" },
    { Header: "Students", accessor: "students", width: "10%", align: "center" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Last Updated", accessor: "updated", width: "10%", align: "left" },
    { Header: "Actions", accessor: "actions", width: "12%", align: "center" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium">
            {pageTitle}
          </MDTypography>
          {canAdd && (
            <Button
              variant="contained"
              color="info"
              onClick={handleAddOpen}
              startIcon={<Icon>add</Icon>}
              aria-label="Add new course"
            >
              Add New Course
            </Button>
          )}
        </MDBox>

        <DataTable
          table={{ columns, rows: rowsData }}
          isSorted
          entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
          showTotalEntries={false}
          canSearch
          noEndBorder
          loading={loading}
        />

        {/* Dialog for create/edit (instructors only for create) */}
        {(canAdd || canEdit) && (
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="sm"
            aria-labelledby="course-dialog-title"
          >
            <DialogTitle id="course-dialog-title">
              {editingId ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent>
                <MDBox mt={1}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Title"
                    {...register("title")}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Instructor"
                    {...register("instructor")}
                    error={!!errors.instructor}
                    helperText={errors.instructor?.message}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Category"
                    select
                    {...register("category")}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    defaultValue=""
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Web Development">Web Development</MenuItem>
                    <MenuItem value="Programming">Programming</MenuItem>
                    <MenuItem value="Tech">Tech</MenuItem>
                    <MenuItem value="Data Science">Data Science</MenuItem>
                    <MenuItem value="AI / ML">AI / ML</MenuItem>
                    <MenuItem value="DevOps">DevOps</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Students"
                    type="number"
                    inputProps={{ min: 0 }}
                    {...register("students", {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
                    })}
                    error={!!errors.students}
                    helperText={errors.students?.message}
                  />
                  {!editingId && (
                    <MDTypography variant="caption" color="text" mt={1}>
                      Note: Course will be created with &quot;Pending&quot; status and requires admin approval.
                    </MDTypography>
                  )}
                </MDBox>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)} type="button">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="info"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading
                    ? editingId
                      ? "Saving..."
                      : "Creating..."
                    : editingId
                    ? "Save"
                    : "Create"}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Courses;
