import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Collapse,
    TextField,
    Autocomplete,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import axiosInstance from "../../Instance";

const Home = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [openRow, setOpenRow] = useState(null);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Filter products based on search query and selected category
    const filteredData = data.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? item.category?.name === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    // Fetch Categories
    const handleFetchCategories = () => {
        axiosInstance
            .get("/api/category")
            .then((res) => setCategories(res.data.data))
            .catch((err) => console.log(err));
    };

    const handleFetchData = () => {
        axiosInstance
            .get("/api/product")
            .then((res) => setData(res.data.data))
            .catch((err) => console.log(err));
    };

    const handleDelete = (id) => {
        axiosInstance
            .delete("/api/product/" + id)
            .then(() => handleFetchData())
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        handleFetchData();
        handleFetchCategories();
    }, []);

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" gutterBottom>
                Product List
            </Typography>

            <Box display="flex" gap={2} mb={4}>
                {/* Category Autocomplete Filter */}
                <Autocomplete
                    disablePortal
                    options={categories.map((cat) => cat.name)}
                    sx={{ width: 300 }}
                    value={selectedCategory}
                    onChange={(event, newValue) => setSelectedCategory(newValue)}
                    renderInput={(params) => <TextField {...params} label="Filter by Category" />}
                />

                {/* Search Input */}
                <TextField
                    label="Search Product"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sr No.</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((item, index) => (
                            <React.Fragment key={item._id}>
                                <TableRow>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell sx={{ width: '80px' }}>
                                        <img
                                            src={item.color_options[0]?.product_images[0]}
                                            alt="Product"
                                            width="100%"
                                            height="100%"
                                        />
                                    </TableCell>
                                    <TableCell>{item.title}</TableCell>
                                    <TableCell>{item.color_options[0]?.price.discounted_price}</TableCell>
                                    <TableCell>{item.color_options[0]?.size_options[0]?.stock}</TableCell>
                                    <TableCell>{item.category?.name}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => navigate(`/edit-product/${item._id}`)}
                                            sx={{ color: "gray" }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(item._id)}
                                            sx={{ color: "red" }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() =>
                                                setOpenRow(openRow === index ? null : index)
                                            }
                                        >
                                            {openRow === index ? (
                                                <KeyboardArrowUpIcon />
                                            ) : (
                                                <KeyboardArrowDownIcon />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                {openRow === index && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                                                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f9f9f9", boxShadow: 1 }}>
                                                    <Typography
                                                        sx={{
                                                            fontSize: "24px",
                                                            fontWeight: "600",
                                                            borderBottom: "2px solid #000",
                                                            pb: 1,
                                                            mb: 2,
                                                        }}
                                                    >
                                                        Color Options
                                                    </Typography>

                                                    {item.color_options.map((color, colorIndex) => (
                                                        <Box key={colorIndex} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                                                            <Typography sx={{ fontSize: "18px", fontWeight: "500", mb: 1 }}>
                                                                <strong>Color:</strong> {color.color}
                                                            </Typography>
                                                            <Typography sx={{ mb: 1 }}>
                                                                <strong>Hex:</strong> {color.hex}
                                                            </Typography>

                                                            <Typography sx={{ mb: 1 }}>
                                                                <strong>Images:</strong>
                                                            </Typography>
                                                            <Box sx={{ display: "flex", gap: 1, width: '100px' }}>
                                                                {color.product_images.map((img, imgIndex) => (
                                                                    <img
                                                                        key={imgIndex}
                                                                        src={img}
                                                                        alt="Color Option"
                                                                        width="100%"
                                                                        height="100%"
                                                                        style={{ borderRadius: 4, border: "1px solid #ccc" }}
                                                                    />
                                                                ))}
                                                            </Box>

                                                            <Typography sx={{ mt: 2, fontWeight: "500" }}>
                                                                <strong>Sizes:</strong>
                                                            </Typography>
                                                            <Box sx={{ pl: 2 }}>
                                                                {color.size_options.map((size, sizeIndex) => (
                                                                    <Typography key={sizeIndex} sx={{ fontSize: "14px" }}>
                                                                        Size: {size.size}, Stock: {size.stock}
                                                                    </Typography>
                                                                ))}
                                                            </Box>

                                                            <Typography sx={{ mt: 2, fontWeight: "500" }}>
                                                                <strong>Price:</strong> Original:   <span style={{ textDecoration: "line-through", color: "gray", marginRight: "8px" }}> ₹{color.price.original_price}</span>, Discounted: <span style={{ color: "red", fontWeight: "bold" }}> ₹{color.price.discounted_price}</span>
                                                            </Typography>
                                                        </Box>
                                                    ))}

                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography sx={{ fontSize: "20px", fontWeight: "600", borderBottom: "1px solid #000", pb: 1, mb: 1 }}>
                                                            Instructions
                                                        </Typography>
                                                        <Box sx={{ pl: 2 }}>
                                                            {item.instruction.map((inst, instIndex) => (
                                                                <Typography key={instIndex} sx={{ fontSize: "14px" }}>
                                                                    {inst}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    </Box>

                                                    <Typography sx={{ fontSize: "20px", fontWeight: "600", borderBottom: "1px solid #000", pb: 1, mb: 1 }}>
                                                        Other Info
                                                    </Typography>
                                                    <Box sx={{ pl: 2 }}>
                                                        {item.other_info.map((info, infoIndex) => (
                                                            <Typography key={infoIndex} sx={{ fontSize: "14px" }}>
                                                                <strong>{info.title}:</strong> {info.description}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Home;
