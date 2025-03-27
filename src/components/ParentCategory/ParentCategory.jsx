import React, { useState, useEffect } from "react";
import {
    Box, Button, TextField, Typography, TableRow, TableHead, Table,
    TableContainer, TableCell, Paper, TableBody, Grid, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axiosInstance from "../../Instance";

const ParentCategory = () => {
    const [newCategory, setNewCategory] = useState("");
    const [createdId, setCreatedId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    // 🔹 Saari Parent Categories Fetch karne ka function
    const fetchParentCategories = async () => {
        try {
            const response = await axiosInstance.get(`/api/all/parent-category`);
            setCategories(response.data.data);
        } catch (error) {
            console.error("Error fetching parent categories:", error);
        }
    };

    // 🔹 Naya Parent Category create karna aur sirf ID lena
    const addParentCategory = async () => {
        if (!newCategory) return;
        try {
            const response = await axiosInstance.post('/api/parent-category', { name: newCategory });
            setCreatedId(response.data._id);
            setNewCategory("");
            fetchParentCategories(); // ✅ Auto-refresh table
        } catch (error) {
            console.error("Error creating parent category:", error);
        }
    };

    // 🔹 Parent Category Delete Karne ka Function
    const deleteParentCategory = async (id) => {
        try {
            await axiosInstance.delete(`/api/parent-category/${id}`);
            fetchParentCategories(); // ✅ Auto-refresh table after delete
        } catch (error) {
            console.error("Error deleting parent category:", error);
        }
    };

    // 🔹 Edit Start karne ka function
    const startEditing = (id, name) => {
        setEditCategoryId(id);
        setEditCategoryName(name);
    };

    // 🔹 Parent Category Update Karne ka Function
    const updateParentCategory = async (id) => {
        try {
            await axiosInstance.put(`/api/parent-category/${id}`, { name: editCategoryName });
            setEditCategoryId(null); // ✅ Editing mode close
            fetchParentCategories(); // ✅ Auto-refresh table after update
        } catch (error) {
            console.error("Error updating parent category:", error);
        }
    };

    // 🔹 Component mount hone par categories fetch karo
    useEffect(() => {
        fetchParentCategories();
    }, []);

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" gutterBottom>
                Manage Parent Categories
            </Typography>

            <Grid container spacing={2} alignItems="center">
                {/* Input Field */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="New Parent Category"
                        variant="outlined"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </Grid>

                {/* Button */}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={addParentCategory}
                        sx={{
                            width: "100%",
                            margin: "10px 0px",
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
                        Create Category
                    </Button>
                </Grid>
            </Grid>

            {createdId && (
                <Typography variant="body1" sx={{ mt: 2, color: "green" }}>
                    Created ID: {createdId}
                </Typography>
            )}

            {/* Parent Categories Table */}
            {categories.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Category Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category._id}>
                                    <TableCell sx={{ fontWeight: "bold" }}>{index + 1}.</TableCell>
                                    <TableCell>
                                        {editCategoryId === category._id ? (
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                value={editCategoryName}
                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                sx={{ backgroundColor: "#fff", borderRadius: "6px" }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontWeight: "500" }}>{category.name}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: "14px", color: "#666" }}>
                                            {category._id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        {editCategoryId === category._id ? (
                                            <IconButton
                                                onClick={() => updateParentCategory(category._id)}
                                                sx={{
                                                    color: "green",
                                                    backgroundColor: "#e8f5e9",
                                                    borderRadius: "50%",
                                                    "&:hover": { backgroundColor: "#c8e6c9" },
                                                }}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                onClick={() => startEditing(category._id, category.name)}
                                                sx={{
                                                    color: "blue",
                                                    backgroundColor: "#e3f2fd",
                                                    borderRadius: "50%",
                                                    "&:hover": { backgroundColor: "#bbdefb" },
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => deleteParentCategory(category._id)}
                                            sx={{
                                                color: "red",
                                                backgroundColor: "#ffebee",
                                                borderRadius: "50%",
                                                marginLeft: "8px",
                                                "&:hover": { backgroundColor: "#ffcdd2" },
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ParentCategory;
