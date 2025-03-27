import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    Chip,
    Avatar,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axiosInstance from '../../Instance';
import { format } from 'date-fns';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        blogCategory: '',
        desc: '',
        images: [],
        extraData: {
            author: '',
            views: 0
        }
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // Track existing images separately
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    // Fetch all blogs
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/blog');
            setBlogs(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch blogs');
            setLoading(false);
            console.error('Error fetching blogs:', err);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('extraData.')) {
            const extraDataField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                extraData: {
                    ...prev.extraData,
                    [extraDataField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImageFiles = [...imageFiles, ...files];
        setImageFiles(newImageFiles);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    // Remove an image
    const handleRemoveImage = (index, isExisting) => {
        if (isExisting) {
            // Remove from existing images
            const newExisting = [...existingImages];
            newExisting.splice(index, 1);
            setExistingImages(newExisting);
        } else {
            // Remove from new uploads
            const newPreviews = [...imagePreviews];
            const newFiles = [...imageFiles];

            // If it's a newly uploaded file (has preview URL)
            if (newPreviews[index].startsWith('blob:')) {
                URL.revokeObjectURL(newPreviews[index]);
            }

            newPreviews.splice(index, 1);
            newFiles.splice(index, 1);
            setImagePreviews(newPreviews);
            setImageFiles(newFiles);
        }
    };

    // Open dialog for creating/editing
    const handleOpenDialog = (blog = null) => {
        if (blog) {
            setCurrentBlog(blog._id);
            setFormData({
                title: blog.title,
                blogCategory: blog.blogCategory,
                desc: blog.desc,
                images: blog.images || [],
                extraData: blog.extraData || { author: '', views: 0 }
            });
            setExistingImages(blog.images || []); // Set existing images
            setImagePreviews([]); // Clear new image previews
            setImageFiles([]); // Clear new image files
        } else {
            setCurrentBlog(null);
            setFormData({
                title: '',
                blogCategory: '',
                desc: '',
                images: [],
                extraData: {
                    author: '',
                    views: 0
                }
            });
            setExistingImages([]);
            setImagePreviews([]);
            setImageFiles([]);
        }
        setOpenDialog(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        // Clean up object URLs
        imagePreviews.forEach(preview => {
            if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        });
        setOpenDialog(false);
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('blogCategory', formData.blogCategory);
        formDataToSend.append('desc', formData.desc);
        formDataToSend.append('extraData', JSON.stringify(formData.extraData));

        // Append all new image files
        imageFiles.forEach(file => {
            formDataToSend.append('images', file);
        });

        // Append existing images that haven't been removed
        existingImages.forEach(image => {
            formDataToSend.append('existingImages', image);
        });

        try {
            if (currentBlog) {
                // Update existing blog
                await axiosInstance.put(`/api/blog/${currentBlog}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Create new blog
                await axiosInstance.post('/api/blog', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchBlogs();
            handleCloseDialog();
        } catch (err) {
            console.error('Error submitting blog:', err);
            setError(err.response?.data?.message || 'Failed to save blog. Please try again.');
        }
    };

    // Handle delete confirmation
    const handleDeleteClick = (id) => {
        setBlogToDelete(id);
        setDeleteConfirmOpen(true);
    };

    // Delete a blog
    const handleDeleteConfirm = async () => {
        try {
            await axiosInstance.delete(`/api/blog/${blogToDelete}`);
            fetchBlogs();
            setDeleteConfirmOpen(false);
        } catch (err) {
            console.error('Error deleting blog:', err);
            setError('Failed to delete blog. Please try again.');
        }
    };

    // Filter blogs based on search term
    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.blogCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.extraData?.author && blog.extraData.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Button onClick={fetchBlogs} variant="outlined" sx={{ ml: 2 }}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 0 } }}>
                Blog Management
            </Typography>
            <Box gap={2} width={{ xs: '100%', sm: 'auto' }} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }} >
                <TextField fullWidth
                    label="Search blogs..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1, maxWidth: 600 }}
                />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
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
                    }}
                >
                    New Blog
                </Button>
            </Box>

            {filteredBlogs.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        {searchTerm ? 'No matching blogs found' : 'No blogs available. Create one!'}
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredBlogs.map(blog => (
                        <Grid item xs={12} sm={6} md={4} key={blog._id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}>
                                {blog.images?.length > 0 ? (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={blog.images[0]}
                                        alt={blog.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Box
                                        height="200"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        bgcolor="action.hover"
                                    >
                                        <ImageIcon fontSize="large" color="disabled" sx={{ height: '200px' }} />
                                    </Box>
                                )}

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', m: 0 }}>
                                            {blog.title}
                                        </Typography>
                                        <Chip
                                            label={blog.blogCategory}
                                            color="primary"
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {blog.desc.length > 150 ? `${blog.desc.substring(0, 150)}...` : blog.desc}
                                    </Typography>

                                    <Box mt={2}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                                    {blog.extraData?.author?.charAt(0) || 'A'}
                                                </Avatar>
                                                <Typography variant="caption">
                                                    {blog.extraData?.author || 'Anonymous'}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center">
                                            <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(blog.createdAt), 'd MMM, yyyy')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>

                                <Box display="flex" justifyContent="flex-end" p={2}>
                                    <IconButton
                                        onClick={() => handleOpenDialog(blog)}
                                        color="primary"
                                        aria-label="edit"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDeleteClick(blog._id)}
                                        color="error"
                                        aria-label="delete"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ bgcolor: '#000', color: 'white' }}>
                    {currentBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                </DialogTitle>

                <DialogContent sx={{ py: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Blog Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                    size="small" sx={{ mt: 3 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Category"
                                    name="blogCategory"
                                    value={formData.blogCategory}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Author Name"
                                    name="extraData.author"
                                    value={formData.extraData.author}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={6}
                                    required
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Blog Images {(existingImages.length + imagePreviews.length) > 0 && 
                                        `(${existingImages.length + imagePreviews.length})`}
                                </Typography>

                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="blog-images-upload"
                                    multiple
                                    type="file"
                                    onChange={handleImageUpload}
                                />

                                <label htmlFor="blog-images-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<ImageIcon />}
                                        fullWidth
                                        sx={{ py: 1.5, mb: 2 }}
                                    >
                                        Upload Images (Max 5)
                                    </Button>
                                </label>

                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    {/* Display existing images */}
                                    {existingImages.map((img, index) => (
                                        <Box
                                            key={`existing-${index}`}
                                            position="relative"
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: '1px solid #eee'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Existing Preview ${index}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.9)'
                                                    }
                                                }}
                                                onClick={() => handleRemoveImage(index, true)}
                                            >
                                                <DeleteIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Box>
                                    ))}

                                    {/* Display new image uploads */}
                                    {imagePreviews.map((img, index) => (
                                        <Box
                                            key={`new-${index}`}
                                            position="relative"
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: '1px solid #eee'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`New Preview ${index}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.9)'
                                                    }
                                                }}
                                                onClick={() => handleRemoveImage(index, false)}
                                            >
                                                <DeleteIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        color="inherit"
                        sx={{
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
                        color="primary"
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
                        }}
                    >
                        {currentBlog ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this blog? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="primary" sx={{ border: '1px solid #000' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained"  >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Blog;