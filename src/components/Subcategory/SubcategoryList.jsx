import React, { useState, useEffect } from "react";
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Button,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import axiosInstance from "../../Instance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";

const SubCategoryList = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        parentCategory: ""
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSubcategories();
        fetchCategories();
    }, []);

    const fetchSubcategories = async () => {
        try {
            const response = await axiosInstance.get("/api/all/sub-category");
            setSubcategories(response.data.data || []);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get("/api/all/category");
            setCategories(response.data.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleOpenDialog = (subcategory = null) => {
        if (subcategory) {
            setFormData({
                name: subcategory.name,
                category: subcategory.category?._id || "",
                parentCategory: subcategory.category?.parentCategory?._id || "" // Add this line
            });
            setEditingId(subcategory._id);
        } else {
            setFormData({
                name: "",
                category: "",
                parentCategory: "" // Add this for the empty state
            });
            setEditingId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            // First ensure we have the required fields
            if (!formData.category) {
                toast.error("Please select a category");
                return;
            }

            // If parentCategory isn't set but we're editing, get it from the category
            if (!formData.parentCategory && editingId) {
                const selectedCategory = categories.find(c => c._id === formData.category);
                if (selectedCategory?.parentCategory) {
                    formData.parentCategory = selectedCategory.parentCategory._id;
                } else {
                    toast.error("Selected category has no parent category");
                    return;
                }
            }

            const token = sessionStorage.getItem("token");
            const data = { name: formData.name };
            let response;

            if (editingId) {
                response = await axiosInstance.put(
                    `/api/parent-category/${formData.parentCategory}/category/${formData.category}/sub-category/${editingId}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axiosInstance.post(
                    `/api/parent-category/${formData.parentCategory}/category/${formData.category}/sub-category`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (response.status === 200 || response.status === 201) {
                toast.success(`Subcategory ${editingId ? "updated" : "added"} successfully`);
                fetchSubcategories();
                handleCloseDialog();
            } else {
                toast.error(response.data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error submitting subcategory:", error);
            toast.error(error.response?.data?.message || "An error occurred while submitting the form.");
        }
    };

    const handleDelete = async (subcategoryId, categoryId, parentCategoryId) => {
        try {
            if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

            const token = sessionStorage.getItem("token");
            const response = await axiosInstance.delete(
                `/api/parent-category/${parentCategoryId}/category/${categoryId}/sub-category/${subcategoryId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success("Subcategory deleted successfully");
                fetchSubcategories();
            } else {
                toast.error(response.data.message || "Failed to delete subcategory");
            }
        } catch (error) {
            console.error("Error deleting subcategory:", error);
            toast.error(error.response?.data?.message || "An error occurred while deleting the subcategory.");
        }
    };

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" gutterBottom>
                Subcategory List
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
                        "&:hover": { backgroundColor: '#fff', color: '#000' },
                    }}>
                    Add Subcategory
                </Button>
            </Box>
            {loading ? (
                <Typography textAlign="center">Loading...</Typography>
            ) : subcategories.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="subcategories table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Subcategory Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: "bold",textAlign: "center" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subcategories.map((subcategory, index) => (
                                <TableRow key={subcategory._id}>
                                    <TableCell sx={{ fontWeight: "bold" }} >{index + 1}.</TableCell>
                                    <TableCell>{subcategory.name}</TableCell>
                                    <TableCell>{subcategory.category?.name || "N/A"}</TableCell>
                                    <TableCell sx={{textAlign: "center"}} >
                                        <IconButton onClick={() => handleOpenDialog(subcategory)} sx={{
                                            color: "blue",
                                            backgroundColor: "#e3f2fd",
                                            borderRadius: "50%",
                                            "&:hover": { backgroundColor: "#bbdefb" },
                                        }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(
                                                subcategory._id,
                                                subcategory.category?._id
                                            )}
                                            sx={{
                                                color: "red",
                                                backgroundColor: "#ffebee",
                                                borderRadius: "50%",
                                                marginLeft: "8px",
                                                "&:hover": { backgroundColor: "#ffcdd2" },
                                            }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography textAlign="center">No subcategories found.</Typography>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>{editingId ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        margin="dense"
                        required
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Category *</InputLabel>
                        <Select
                            name="category" label="category"
                            value={formData.category}
                            onChange={(e) => {
                                const selectedCategory = categories.find(c => c._id === e.target.value);
                                setFormData({
                                    ...formData,
                                    category: e.target.value,
                                    parentCategory: selectedCategory?.parentCategory?._id || ""
                                });
                            }}
                            required
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}
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
                    >Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name || !formData.category}
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

export default SubCategoryList;