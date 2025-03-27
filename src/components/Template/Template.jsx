import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Alert,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import {
    Palette,
    PhotoSizeSelectActual,
    AspectRatio,
    Star,
    StarBorder,
    Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Template = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get('https://wedding-card-be.onrender.com/api/template');
                setTemplates(response.data.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

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
                        // width: "100%",
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
                    }}
                    onClick={() => navigate("/template-form")}
                >
                    Add Template
                </Button>
            </Box>

            <Grid container spacing={3}>
                {templates.map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Template Preview Images (using first color variant) */}
                            {template.colors?.[0]?.templateImages?.[0] && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={template.colors[0].templateImages[0]}
                                    alt={template.name}
                                />
                            )}

                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        {template.name.replace(/"/g, '')}
                                    </Typography>
                                    {template.isPremium && (
                                        <Chip label="Premium" color="primary" size="small" />
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {template.desc.replace(/"/g, '')}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                {/* Template Details */}
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Tooltip title="Color Variants">
                                            <Chip
                                                icon={<Palette fontSize="small" />}
                                                label={`${template.colors.length} colors`}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Tooltip>
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
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Template;