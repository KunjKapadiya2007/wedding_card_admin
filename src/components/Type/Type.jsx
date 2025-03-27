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

const Type = () => {
    const [types, setTypes] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        subCategory: ""
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTypes();
        fetchSubcategories(); // Load all subcategories at once
    }, []);

    const fetchTypes = async () => {
        try {
            const response = await axiosInstance.get("/api/all/type");
            setTypes(response.data.data || []);
        } catch (error) {
            console.error("Error fetching types:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const response = await axiosInstance.get("/api/category/all");
            // Extract all subcategories from the nested structure
            const allSubcategories = response.data[0]?.categories.flatMap(category => {
                if (category.subcategories && category.subcategories._id) {
                    return {
                        ...category.subcategories,
                        categoryId: category._id,
                        parentCategoryId: category.parentCategory
                    };
                }
                return [];
            });
            setSubcategories(allSubcategories || []);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
    };

    const handleOpenDialog = (type = null) => {
        if (type) {
            setFormData({
                name: type.name,
                subCategory: type.subCategory?._id || ""
            });
            setEditingId(type._id);
        } else {
            setFormData({
                name: "",
                subCategory: ""
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.subCategory) {
                toast.error("Please fill all required fields.");
                return;
            }

            // Find the selected subcategory to get its parent IDs
            const selectedSubcategory = subcategories.find(sub => sub._id === formData.subCategory);
            if (!selectedSubcategory) {
                toast.error("Invalid subcategory selected.");
                return;
            }

            const token = localStorage.getItem("token");
            const data = { name: formData.name };
            let response;

            if (editingId) {
                response = await axiosInstance.put(
                    `/api/parent-category/${selectedSubcategory.parentCategoryId}/category/${selectedSubcategory.categoryId}/sub-category/${formData.subCategory}/type/${editingId}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axiosInstance.post(
                    `/api/parent-category/${selectedSubcategory.parentCategoryId}/category/${selectedSubcategory.categoryId}/sub-category/${formData.subCategory}/type`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (response.status === 200 || response.status === 201) {
                toast.success(`Type ${editingId ? "updated" : "added"} successfully`);
                fetchTypes();
                handleCloseDialog();
            } else {
                toast.error(response.data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error submitting type:", error);
            toast.error(error.response?.data?.message || "An error occurred while submitting the form.");
        }
    };

    const handleDelete = async (typeId, subCategoryId, categoryId, parentCategoryId) => {
        try {
            if (!window.confirm("Are you sure you want to delete this type?")) return;

            const token = localStorage.getItem("token");
            const response = await axiosInstance.delete(
                `/api/parent-category/${parentCategoryId}/category/${categoryId}/sub-category/${subCategoryId}/type/${typeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success("Type deleted successfully");
                fetchTypes();
            } else {
                toast.error(response.data.message || "Failed to delete type");
            }
        } catch (error) {
            console.error("Error deleting type:", error);
            toast.error(error.response?.data?.message || "An error occurred while deleting the type.");
        }
    };

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" gutterBottom>
                Type
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
                    Add Type
                </Button>
            </Box>
            {loading ? (
                <Typography textAlign="center">Loading...</Typography>
            ) : types.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="types table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Type Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Subcategory</TableCell>
                                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {types.map((type, index) => (
                                <TableRow key={type._id}>
                                    <TableCell sx={{ fontWeight: "bold" }} >{index + 1}.</TableCell>
                                    <TableCell>{type.name}</TableCell>
                                    <TableCell>{type.subCategory?.name || "N/A"}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }} >
                                        <IconButton onClick={() => handleOpenDialog(type)} sx={{
                                            color: "blue",
                                            backgroundColor: "#e3f2fd",
                                            borderRadius: "50%",
                                            "&:hover": { backgroundColor: "#bbdefb" },
                                        }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(
                                                type._id,
                                                type.subCategory?._id,
                                                type.subCategory?.category?._id,
                                                type.subCategory?.category?.parentCategory?._id)} sx={{
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
                <Typography textAlign="center">No types found.</Typography>
            )}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>{editingId ? "Edit Type" : "Add Type"}</DialogTitle>
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
                        <InputLabel>Subcategory *</InputLabel>
                        <Select
                            name="subCategory"
                            label="Subcategory"
                            value={formData.subCategory || ""}
                            onChange={handleInputChange}
                            required
                        >
                            {subcategories.map((subcategory) => (
                                <MenuItem key={subcategory._id} value={subcategory._id}>
                                    {subcategory.name}
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
                        disabled={!formData.name || !formData.subCategory}
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

export default Type;