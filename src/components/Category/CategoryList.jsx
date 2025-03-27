import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Instance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "", parentCategory: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/all/category");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/parent-category");
      setParentCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setFormData({ name: category.name, parentCategory: category.parentCategory?._id || "" });
      setEditingId(category._id);
    } else {
      setFormData({ name: "", parentCategory: "" });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = { name: formData.name, parentCategory: formData.parentCategory };
      let response;

      if (editingId) {
        // Perform the PUT request when updating a category
        response = await axiosInstance.put(
          `/api/parent-category/${formData.parentCategory}/category/${editingId}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Perform the POST request when adding a new category
        response = await axiosInstance.post(
          `/api/parent-category/${formData.parentCategory}/category`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(`Category ${editingId ? "updated" : "added"} successfully`);
        fetchCategories(); // Refresh category list
        handleCloseDialog(); // Close the modal
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const handleDelete = async (categoryId, parentCategoryId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.delete(
        `/api/parent-category/${parentCategoryId}/category/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Category deleted successfully");
        fetchCategories(); // Refresh category list
      } else {
        toast.error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("An error occurred while deleting the category.");
    }
  };


  return (
    <Box p={2} mt={5}>
      <Typography variant="h4" gutterBottom>
        Category List
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Button onClick={() => handleOpenDialog()} variant="contained"
          sx={{
            mb: "20px",
            textTransform: "unset",
            border: "1px solid black",
            padding: "6px 24px",
            fontSize: "16px",
            fontWeight: "500",
            borderRadius: "0px",
            backgroundColor: '#000',
            color: '#fff',
            "&:hover": {
              backgroundColor: '#fff',
              color: '#000',
            },
          }}>
          Add Category
        </Button>
      </Box>
      {loading ? (
        <Typography textAlign="center">Loading...</Typography>
      ) : categories.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="categories table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Parent Category</TableCell>
                <TableCell sx={{ fontWeight: "bold",textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow key={category._id}>
                  <TableCell sx={{ fontWeight: "bold"}}>{index + 1}.</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.parentCategory?.name || "N/A"}</TableCell>
                  <TableCell sx={{textAlign: "center"}} >
                    <IconButton onClick={() => handleOpenDialog(category)} sx={{
                      color: "blue",
                      backgroundColor: "#e3f2fd",
                      borderRadius: "50%",
                      "&:hover": { backgroundColor: "#bbdefb" },
                    }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category._id, category.parentCategory?._id)} sx={{
                        color: "red",
                        backgroundColor: "#ffebee",
                        borderRadius: "50%",
                        marginLeft: "8px",
                        "&:hover": { backgroundColor: "#ffcdd2" },
                      }} >
                      <DeleteIcon />
                    </IconButton>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography textAlign="center">No categories found.</Typography>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} margin="dense" required />
          <FormControl fullWidth margin="dense">
            <InputLabel>Parent Category</InputLabel>
            <Select name="parentCategory" label='parentCategory' value={formData.parentCategory} onChange={handleInputChange}>
              {parentCategories.map((category) => (
                <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              mb: "20px",
              textTransform: "unset",
              border: "1px solid black",
              padding: "6px 24px",
              fontSize: "16px",
              fontWeight: "500",
              borderRadius: "0px",
              backgroundColor: '#fff',
              color: '#000',
              "&:hover": {
                backgroundColor: '#000',
                color: '#fff',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              mb: "20px",
              mx: "20px",
              textTransform: "unset",
              border: "1px solid black",
              padding: "6px 24px",
              fontSize: "16px",
              fontWeight: "500",
              borderRadius: "0px",
              backgroundColor: '#000',
              color: '#fff',
              "&:hover": {
                backgroundColor: '#fff',
                color: '#000',
              },
            }}
          >
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>

      </Dialog>
    </Box>
  );
};

export default CategoryList;
