import React, { useState, useEffect } from "react";
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Button,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, Autocomplete
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
        fetchSubcategories();
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
        axiosInstance.get("/api/category/all")
            .then((response) =>
                    setSubcategories(response.data.data.map((item) => (
                    {
                        parentCategoryId: item._id ,
                        category: item.categories.map((item) => item._id),
                        subcategory : item.categories.map((item) => (
                            item.subcategories.map((subcategory) => (subcategory.name))
                        )),
                        subcategoryId : item.categories.map((item) => (
                            item.subcategories.map((subcategory) => (subcategory._id))
                        )),
                    }
                    )))
            )
            .catch((error) => console.log(error));
    }

    const handleOpenDialog = (type = null) => {
        if (type) {
            setFormData({
                name: type.name,
                subCategory: type.subCategory?.name || ""
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

            let selectedSubCategoryName = formData.subCategory;
            let selectedCategory = null;
            let selectedSubCategoryId = null;
            let parentCategoryId = null;

            subcategories.forEach((item) => {
                item.subcategory.forEach((subList, index) => {
                    if (Array.isArray(subList)) {
                        subList.forEach((sub, subIndex) => {
                            if (sub === formData.subCategory) {
                                selectedCategory = item.category[index];
                                selectedSubCategoryId = item.subcategoryId[index][subIndex];
                                parentCategoryId = item.parentCategoryId;
                            }
                        });
                    } else if (subList === formData.subCategory) {
                        selectedCategory = item.category[index];
                        selectedSubCategoryId = item.subcategoryId[index];
                        parentCategoryId = item.parentCategoryId;
                    }
                });
            });

            if (!selectedCategory || !selectedSubCategoryId || !parentCategoryId) {
                toast.error("Invalid subcategory selected.");
                return;
            }

            const token = sessionStorage.getItem("token");

            const data = {
                name: formData.name,
                subCategoryID: selectedSubCategoryId,
            };


            let response;

            if (editingId) {
                response = await axiosInstance.put(
                    `/api/parent-category/${parentCategoryId}/category/${selectedCategory}/sub-category/${selectedSubCategoryId}/type/${editingId}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axiosInstance.post(
                    `/api/parent-category/${parentCategoryId}/category/${selectedCategory}/sub-category/${selectedSubCategoryId}/type`,
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



    const handleDelete = async (typeId) => {
        try {
            if (!window.confirm("Are you sure you want to delete this type?")) return;

            let selectedCategory = null;
            let selectedSubCategoryId = null;
            let parentCategoryId = null;

            subcategories.forEach((item) => {
                item.subcategory.forEach((subList, index) => {
                    if (Array.isArray(subList)) {
                        subList.forEach((sub, subIndex) => {
                            if (sub === formData.subCategory) {
                                selectedCategory = item.category[index];
                                selectedSubCategoryId = item.subcategoryId[index][subIndex];
                                parentCategoryId = item.parentCategoryId;
                            }
                        });
                    } else if (subList === formData.subCategory) {
                        selectedCategory = item.category[index];
                        selectedSubCategoryId = item.subcategoryId[index];
                        parentCategoryId = item.parentCategoryId;
                    }
                });
            });

            if (!selectedCategory || !selectedSubCategoryId || !parentCategoryId) {
                toast.error("Invalid subcategory selected.");
                return;
            }

            const token = sessionStorage.getItem("token");

            const response = await axiosInstance.delete(
                `/api/parent-category/${parentCategoryId}/category/${selectedCategory}/sub-category/${selectedSubCategoryId}/type/${typeId}`,
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

                    <Autocomplete
                        fullWidth
                        options={subcategories.flatMap(item =>
                            item.subcategory.flatMap(sub => Array.isArray(sub) ? sub : [sub])
                        )}
                        getOptionLabel={(option) => option}
                        value={formData.subCategory || null}
                        onChange={(event, newValue) => {
                            setFormData((prev) => ({
                                ...prev,
                                subCategory: newValue || "",
                            }));
                        }}
                        noOptionsText="No data found"
                        renderInput={(params) => (
                            <TextField {...params} label="Subcategory" margin="dense" required />
                        )}
                    />


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