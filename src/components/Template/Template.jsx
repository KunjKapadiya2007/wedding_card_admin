import React, {useEffect, useState} from 'react';
import axiosInstance from "../../Instance.jsx";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import {AspectRatio, Delete, Edit, PhotoSizeSelectActual, Star, StarBorder} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';

const Template = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});
    const [selectedColors, setSelectedColors] = useState({}); // Track selected color for each template
    const [deleteDialog, setDeleteDialog] = useState({ open: false, templateId: null });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axiosInstance.get('/api/template');
                setTemplates(response.data.data);

                const initialImages = {};
                const initialColors = {};

                response.data.data.forEach(template => {
                    if (template.colors?.length > 0) {
                        initialImages[template._id] = template.colors[0].templateImages;
                        initialColors[template._id] = template.colors[0].hex;
                    }
                });

                setSelectedImages(initialImages);
                setSelectedColors(initialColors);
            } catch (err) {
                setError(err.message || 'Failed to fetch templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleColorClick = (templateId, newImage, colorHex) => {
        setSelectedImages(prev => ({
            ...prev,
            [templateId]: newImage
        }));
        setSelectedColors(prev => ({
            ...prev,
            [templateId]: colorHex
        }));
    };

    const handleDeleteConfirm = async () => {
        const { templateId } = deleteDialog;
        if (!templateId) return;

        try {
            await axiosInstance.delete(`/api/template/${templateId}`);
            setTemplates(prev => prev.filter(template => template._id !== templateId));
            toast.success("Template deleted successfully");
        } catch (err) {
            toast.error("Failed to delete template");
        } finally {
            setDeleteDialog({ open: false, templateId: null });
        }
    };

    const handleEdit = (_id) => {
        navigate(`/template-form/${_id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ margin: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Wedding Card Templates
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button
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
                    }}
                    onClick={() => navigate("/template-form")}
                >
                    Add Template
                </Button>
            </Box>
            <Grid container spacing={3}>
                {templates.map((template) => (
                    <Grid item xs={12} sm={6} lg={4} key={template._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                                <Tooltip title="Edit">
                                    <IconButton size="small" sx={{ color: "blue" }}>
                                        <Edit fontSize="small" onClick={() => handleEdit(template._id)}/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" sx={{ color: "red" }} onClick={() => setDeleteDialog({ open: true, templateId: template._id })}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {selectedImages[template._id] && (
                                <CardMedia
                                    component="img"
                                    image={selectedImages[template._id]}
                                    alt={template.name}
                                    style={{ width: '100%', height: "300px", objectFit: "contain" }}
                                />
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        {template.name.replace(/"/g, '')}
                                    </Typography>
                                    {template.isPremium && <Chip label="Premium" color="primary" size="small" />}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {template.desc.replace(/"/g, '')}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        {template.colors?.map((color, index) => (
                                            <Box
                                                key={index}
                                                onClick={() => handleColorClick(template._id, color.templateImages, color.hex)}
                                                sx={{
                                                    p: 1.2,
                                                    display: "inline-block",
                                                    border: "1px solid #000",
                                                    borderRadius: "50%",
                                                    backgroundColor: color.hex,
                                                    marginRight: 1,
                                                    cursor: "pointer",
                                                    transition: "transform 0.2s",
                                                    transform: selectedColors[template._id] === color.hex ? "scale(1.2)" : "scale(1)",
                                                    "&:hover": { transform: "scale(1.1)" }
                                                }}
                                            />
                                        ))}
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title="Size">
                                            <Chip
                                                icon={<PhotoSizeSelectActual fontSize="small" />}
                                                label={template.size.replace(/"/g, '')}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title="Orientation">
                                            <Chip
                                                icon={<AspectRatio fontSize="small" />}
                                                label={template.orientation}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title={template.isFavorite ? 'Favorite' : 'Not favorite'}>
                                            <IconButton size="small">
                                                {template.isFavorite ? (
                                                    <Star color="warning" fontSize="small" />
                                                ) : (
                                                    <StarBorder fontSize="small" />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Type</strong>: {template.type?.name}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Template Type</strong>: {template.templateType}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Template Theme</strong>: {template.templateTheme}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Tags</strong>: {template.tags?.join(", ")}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, templateId: null })}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to delete this template?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, templateId: null })} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Template;
