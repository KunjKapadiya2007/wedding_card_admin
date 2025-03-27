import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography,
    IconButton,
    Select,
    InputLabel,
    MenuItem,
    FormControl,
    Container,
    Box
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axiosInstance from "../Instance";
import { useNavigate, useParams } from "react-router-dom";

function AddProductForm() {
    const { productId } = useParams(); // Get the product ID from the route params (for editing)
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        gender: "",
        stock: "",
        color_options: [
            {
                color: "",
                hex: "",
                product_images: [],
                size_options: [{ size: "", stock: "" }],
                price: { original_price: "", discounted_price: "" },
            },
        ],
        other_info: [{ title: "", description: "" }],
        instruction: [],
    });

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const fetchCategoryData = async () => {
        try {
            const response = await axiosInstance.get("/api/category");
            if (response.data && Array.isArray(response.data.data)) {
                setCategories(response.data.data);
            } else {
                console.error("Unexpected response format");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const response = await axiosInstance.get(
                `/api/category/${formData.category}/subcategory`
            );

            if (response.data && Array.isArray(response.data.data)) {
                setSubcategories(response.data.data);
                // setError(null);
            } else {
                console.log("Unexpected response format");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [loading, setLoading] = useState(true);

    // Fetch product data
    const fetchProductData = async () => {
        try {
            // Always fetch categories
            await fetchCategoryData();

            // If editing, fetch product details
            if (productId) {
                const response = await axiosInstance.get(`/api/product/${productId}`);
                if (response.data.data) {
                    const productData = response.data.data;
                    const colorOptionsWithImages = productData.color_options.map((colorOption) => ({
                        ...colorOption,
                        product_images: colorOption.product_images || [], // Ensure product_images is an array
                    }));
                    setFormData({
                        title: productData.title,
                        description: productData.description,
                        category: productData.category._id, // Use category ID for matching
                        subcategory: productData.subcategory,
                        gender: productData.gender,
                        stock: productData.stock,
                        color_options: productData.color_options,
                        other_info: productData.other_info,
                        instruction: productData.instruction,
                    });

                    // Fetch subcategories based on the category
                    fetchSubcategories(productData.category._id);
                }
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        } finally {
            setLoading(false); // Set loading to false after the data is fetched
        }
    };

    useEffect(() => {
        fetchCategoryData()
        if (formData.category) fetchSubcategories();
        fetchProductData();
    }, [productId, formData.category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleColorChange = (e, index) => {
        const { name, value } = e.target;
        const updatedColors = [...formData.color_options];
        updatedColors[index][name] = value;
        setFormData((prevState) => ({
            ...prevState,
            color_options: updatedColors,
        }));
    };

    const handleImageUpload = (e, colorIndex) => {
        const files = Array.from(e.target.files);
        const updatedColors = [...formData.color_options];
        updatedColors[colorIndex].product_images = files;
        setFormData({ ...formData, color_options: updatedColors });
    };

    const handleSizeChange = (e, colorIndex, sizeIndex) => {
        const { name, value } = e.target;
        const updatedColors = [...formData.color_options];
        updatedColors[colorIndex].size_options[sizeIndex][name] = value;
        setFormData((prevState) => ({
            ...prevState,
            color_options: updatedColors,
        }));
    };

    const handleAddColor = () => {
        setFormData((prevState) => ({
            ...prevState,
            color_options: [
                ...prevState.color_options,
                {
                    color: "",
                    hex: "",
                    product_images: [],
                    size_options: [{ size: "", stock: "" }],
                    price: { original_price: "", discounted_price: "" },
                },
            ],
        }));
    };

    const handleRemoveColor = (index) => {
        const updatedColors = formData.color_options.filter((_, i) => i !== index);
        setFormData((prevState) => ({
            ...prevState,
            color_options: updatedColors,
        }));
    };

    const handleAddSize = (colorIndex) => {
        const updatedColors = [...formData.color_options];
        updatedColors[colorIndex].size_options.push({ size: "", stock: "" });
        setFormData((prevState) => ({
            ...prevState,
            color_options: updatedColors,
        }));
    };

    const handleRemoveSize = (colorIndex, sizeIndex) => {
        const updatedColors = [...formData.color_options];
        updatedColors[colorIndex].size_options = updatedColors[colorIndex].size_options.filter((_, i) => i !== sizeIndex);
        setFormData((prevState) => ({
            ...prevState,
            color_options: updatedColors,
        }));
    };

    // Remove selected image
    const handleRemoveImage = (colorIndex, imageIndex) => {
        const updatedColors = [...formData.color_options];
        updatedColors[colorIndex].product_images = updatedColors[colorIndex].product_images.filter(
            (_, index) => index !== imageIndex
        );
        setFormData({ ...formData, color_options: updatedColors });
    };

    const handlePriceChange = (e, colorIndex) => {
        const { name, value } = e.target;
        const updatedColors = [...formData.color_options];
        updatedColors[colorIndex].price = {
            ...updatedColors[colorIndex].price,
            [name]: value,
        };
        setFormData((prevState) => ({
            ...prevState,
            color_options: updatedColors,
        }));
    };

    const handleAddOtherInfo = () => {
        setFormData((prev) => ({
            ...prev,
            other_info: [...prev.other_info, { title: "", description: "" }],
        }));
    };

    const handleAddIntruction = () => {
        setFormData((prev) => ({
            ...prev,
            instruction: [...prev.instruction, ""],
        }));
    };

    const handleOtherInfoChange = (e, index) => {
        const newOtherInfoOptions = [...formData.other_info];
        newOtherInfoOptions[index] = {
            ...newOtherInfoOptions[index],
            [e.target.name]: e.target.value,
        };
        setFormData((prev) => ({ ...prev, other_info: newOtherInfoOptions }));
    };

    const handleIntructionChange = (e, index) => {
        const newIntructionOptions = [...formData.instruction];
        newIntructionOptions[index] = e.target.value;
        setFormData({
            ...formData,
            instruction: newIntructionOptions,
        });
    };

    const handleRemoveOtherInfo = (index) => {
        const updatedOtherInfo = [...formData.other_info];
        updatedOtherInfo.splice(index, 1);
        setFormData({
            ...formData,
            other_info: updatedOtherInfo,
        });
    };

    const handleRemoveIntruction = (index) => {
        const updatedIntruction = [...formData.instruction];
        updatedIntruction.splice(index, 1);
        setFormData({
            ...formData,
            instruction: updatedIntruction,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formToSend = new FormData();

        formToSend.append("title", formData.title);
        formToSend.append("description", formData.description);
        formToSend.append("category", formData.category);
        formToSend.append("subcategory", formData.subcategory);
        formToSend.append("gender", formData.gender);

        formData.color_options.forEach((item, index) => {
            item.product_images.forEach((img) => {
                formToSend.append(`product_images[${index}]`, img);
            });
        });

        const jsonColorOptions = formData.color_options.map((color) => ({
            color: color.color,
            hex: color.hex,
            size_options: color.size_options.map((size) => ({
                size: size.size,
                stock: size.stock,
            })),
            price: {
                original_price: color.price.original_price,
                discounted_price: color.price.discounted_price,
            },
        }));

        const jsonString = JSON.stringify(jsonColorOptions);
        formToSend.append("color_options", jsonString);

        formToSend.append("other_info", JSON.stringify(formData.other_info));
        formToSend.append("instruction", JSON.stringify(formData.instruction));

        try {
            const response = productId
                ? await axiosInstance.put(`/api/product/${productId}`, formToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                : await axiosInstance.post("/api/product", formToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            if (response.status === 200 || response.status === 201) {
                console.log("Product successfully added/updated", response.data);
                navigate("/"); // Redirect to a different page (e.g., product list)
            } else {
                console.error("Error in response:", response.data);
            }
        } catch (error) {
            console.error("Error sending data:", error);
        }
    };


    return (
        <Box p={2} mt={5}>
            <Container>
                <Typography variant="h4" gutterBottom>
                    Add Product
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid item xs={12}>
                        <TextField
                            label="Title"
                            name="title"
                            variant="outlined"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            name="description"
                            variant="outlined"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                label="Category"
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {formData.category && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Subcategory</InputLabel>
                                <Select
                                    label="Subcategory"
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    name="subcategory"
                                >
                                    {subcategories.map((subcategory) => (
                                        <MenuItem key={subcategory._id} value={subcategory._id}>
                                            {subcategory.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ my: 2 }}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                label="Gender"
                            >
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="kids">Kids</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Typography variant="h6">Color Options</Typography>
                        {formData.color_options.map((color, colorIndex) => (
                            <Grid container spacing={2} key={colorIndex} sx={{ mt: 2 }}>
                                <Grid item xs={4}>
                                    <Box
                                        component="label"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "100%",
                                            padding: "8px",
                                            border: "2px dashed #aaa",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease-in-out",
                                            "&:hover": {
                                                borderColor: "#4CAF50",
                                                backgroundColor: "rgba(76, 175, 80, 0.1)"
                                            }
                                        }}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleImageUpload(e, colorIndex)}
                                            style={{ display: "none" }}
                                        />
                                        <Typography variant="body1" color="textSecondary">
                                            Click or Drag & Drop to Upload Images
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Color Input */}
                                <Grid item xs={4}>
                                    <TextField
                                        label="Color"
                                        name="color"
                                        value={color.color}
                                        onChange={(e) => handleColorChange(e, colorIndex)}
                                        fullWidth
                                    />
                                </Grid>
                                {/* Hex Input */}
                                <Grid item xs={4}>
                                    <TextField
                                        label="Hex"
                                        name="hex"
                                        value={color.hex}
                                        onChange={(e) => handleColorChange(e, colorIndex)}
                                        fullWidth
                                    />
                                </Grid>

                                {/* Show Selected Images */}
                                {color.product_images.length > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">Selected Images</Typography>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "10px",
                                                marginTop: "10px",
                                            }}
                                        >
                                            {color.product_images.map((image, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        position: "relative",
                                                        display: "inline-block",
                                                        overflow: "hidden",
                                                        boxShadow: 3,
                                                        borderRadius: 1,
                                                        margin: "3px"
                                                    }}
                                                >
                                                    <Box sx={{ width: "100px", overflow: "hidden" }}>
                                                        <img
                                                            src={image instanceof File ? URL.createObjectURL(image) : image}
                                                            alt={`Product ${color.color} image ${index}`}
                                                            width="100%"
                                                            style={{ display: "block" }}
                                                        />
                                                    </Box>
                                                    <IconButton
                                                        onClick={() => handleRemoveImage(colorIndex, index)}
                                                        color="error"
                                                        sx={{
                                                            position: "absolute",
                                                            top: 2,
                                                            right: 2,
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" sx={{ color: 'red' }} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </div>
                                    </Grid>
                                )}

                                {/* Sizes Section */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">Sizes</Typography>
                                    {color.size_options.map((size, sizeIndex) => (
                                        <Grid container spacing={2} key={sizeIndex} sx={{ mt: 2 }}>
                                            <Grid item xs={5}>
                                                <TextField
                                                    label="Size"
                                                    name="size"
                                                    value={size.size}
                                                    onChange={(e) =>
                                                        handleSizeChange(e, colorIndex, sizeIndex)
                                                    }
                                                    fullWidth
                                                    onInput={(e) =>
                                                        (e.target.value = e.target.value.toUpperCase())
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <TextField
                                                    label="Stock"
                                                    name="stock"
                                                    value={size.stock}
                                                    onChange={(e) =>
                                                        handleSizeChange(e, colorIndex, sizeIndex)
                                                    }
                                                    fullWidth
                                                    type="number"
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <IconButton
                                                    onClick={() => handleRemoveSize(colorIndex, sizeIndex)}
                                                    color="error"
                                                >
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAddSize(colorIndex)}
                                        sx={{ mt: 2 }}
                                    >
                                        Add Size
                                    </Button>
                                </Grid>

                                {/* Price Section */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">Price</Typography>
                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                        <Grid item xs={5}>
                                            <TextField
                                                label="Original Price"
                                                name="original_price"
                                                value={color.price.original_price}
                                                onChange={(e) => handlePriceChange(e, colorIndex)}
                                                fullWidth
                                                type="number"
                                            />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <TextField
                                                label="Discounted Price"
                                                name="discounted_price"
                                                value={color.price.discounted_price}
                                                onChange={(e) => handlePriceChange(e, colorIndex)}
                                                fullWidth
                                                type="number"
                                            />
                                        </Grid>
                                        {/* Remove Color Section */}
                                        <Grid item xs={2}>
                                            <IconButton
                                                onClick={() => handleRemoveColor(colorIndex)}
                                                color="error"
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}

                        {/* Add More Colors Button */}
                        <Button variant="outlined" onClick={handleAddColor} sx={{ mt: 2 }}>
                            Add More Colors
                        </Button>
                    </Grid>

                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Typography variant="h6">Other Info</Typography>
                        {formData.other_info.map((option, index) => (
                            <Grid container spacing={2} key={index} sx={{ mt: 2 }}>
                                <Grid item xs={5}>
                                    <TextField
                                        label="Title"
                                        variant="outlined"
                                        name="title"
                                        value={option.title}
                                        onChange={(e) => handleOtherInfoChange(e, index)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        name="description"
                                        value={option.description}
                                        onChange={(e) => handleOtherInfoChange(e, index)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton
                                        onClick={() => handleRemoveOtherInfo(index)}
                                        color="error"
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleAddOtherInfo}
                            sx={{ mt: 2 }}
                        >
                            Add Other Info
                        </Button>
                    </Grid>

                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Typography variant="h6">Instructions</Typography>
                        {formData.instruction.map((instruction, index) => (
                            <Grid container spacing={2} key={index} sx={{ mt: 2 }}>
                                <Grid item xs={10}>
                                    <TextField
                                        label="Instruction Detail"
                                        variant="outlined"
                                        name="detail"
                                        value={instruction}
                                        onChange={(e) => handleIntructionChange(e, index)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton
                                        onClick={() => handleRemoveIntruction(index)}
                                        color="error"
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleAddIntruction}
                            sx={{ mt: 2 }}
                        >
                            Add Instruction
                        </Button>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 3 }}>
                        <Button type="submit" variant="contained"
                            sx={{
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
                            Submit
                        </Button>
                    </Grid>
                </form>
            </Container>
        </Box>
    );
}

export default AddProductForm;
