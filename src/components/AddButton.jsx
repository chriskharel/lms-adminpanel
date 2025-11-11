import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useHasRole } from "../utils/roleHelpers";

/**
 * Role-aware Add Button component
 * @param {string|string[]} allowedRoles - Who can see the button
 * @param {function} onClick - Click handler for the button
 * @param {string} label - Button text (default: "Add")
 */
export default function AddButton({ allowedRoles = ["admin"], onClick, label = "Add" }) {
  const canShow = useHasRole(allowedRoles);

  if (!canShow) return null; // hide if role not permitted

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{ mb: 2 }}
    >
      {label}
    </Button>
  );
}
