import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axiosInstance from "../../Instance.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEditorData} from '../../pages/editor/EditorDataContext.jsx';

const colorDictionary = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#00FF00',
    'yellow': '#FFFF00',
    'black': '#000000',
    'white': '#FFFFFF',
    'purple': '#800080',
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'gray': '#808080',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'lime': '#00FF00',
    'maroon': '#800000',
    'olive': '#808000',
    'navy': '#000080',
    'teal': '#008080',
    'silver': '#C0C0C0',
    'gold': '#FFD700'
};

const hexToColorName = Object.fromEntries(
    Object.entries(colorDictionary).map(([name, hex]) => [hex.toLowerCase(), name])
);

const TemplateForm = () => {
    const [formData, setFormData] = useState({
        type: '',
        name: '',
        desc: '',
        tags: [],
        colors: [
            {
                color: '',
                hex: '',
                templateImages: '',
                initialDetail: {},
            },
        ],
        size: '',
        templateType: '',
        templateTheme: '',
        orientation: '',
        count: 0,
        templatePhoto: false,
        isFavorite: false,
        isPremium: false,

    });
    const [tagInput, setTagInput] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const [types, setTypes] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const { editorData, templetImage } = useEditorData();

    useEffect(() => {

        axiosInstance.get("/api/all/type")
            .then((response) => {
                setTypes(response.data.data);
            })
            .catch((error) => {
                console.error("Error fetching types:", error);
            });

        if (id) {
            setIsEditing(true);
            axiosInstance.get(`/api/template/${id}`)
                .then((response) => {
                    const template = response.data.data;

                    const updatedColors = template.colors.map(color => ({
                        color: color.color || '',
                        hex: color.hex || '#000000',
                        templateImages: Array.isArray(color.templateImages) ? color.templateImages : [],
                        initialDetail: color.initialDetail || {}
                    }));

                    setFormData({
                        ...template,
                        colors: updatedColors,
                        type: template.type._id,
                    });

                    const previews = updatedColors.map(color => {
                        return color.templateImages.map(img => ({
                            url: img,
                            name: img.split('/').pop(),
                            file: null
                        }));
                    });

                    setImagePreviews(previews);
                })
                .catch((error) => {
                    console.error("Error fetching template:", error);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTypeChange = (event) => {
        setFormData({ ...formData, type: event.target.value });
    };

    const handleColorNameChange = (index, e) => {
        const { value } = e.target;
        const updatedColors = [...formData.colors];

        updatedColors[index].color = value;

        if (colorDictionary[value.toLowerCase()]) {
            updatedColors[index].hex = colorDictionary[value.toLowerCase()];
        }

        setFormData(prev => ({ ...prev, colors: updatedColors }));
    };

    const handleHexChange = (index, e) => {
        const { value } = e.target;
        const updatedColors = [...formData.colors];

        updatedColors[index].hex = value;

        if (hexToColorName[value.toLowerCase()]) {
            updatedColors[index].color = hexToColorName[value.toLowerCase()];
        }

        setFormData(prev => ({ ...prev, colors: updatedColors }));
    };

    const handleAddColor = () => {
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, { color: '', hex: '#000000', templateImages: [], initialDetail: {} }]
        }));
    };

    const handleRemoveColor = (index) => {
        const updatedColors = formData.colors.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, colors: updatedColors }));

        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.type) newErrors.type = 'Type is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.desc) newErrors.desc = 'Description is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const formDataToSend = new FormData();

            formDataToSend.append('name', formData.name);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('desc', formData.desc);
            formDataToSend.append('size', formData.size);
            formDataToSend.append('templateType', formData.templateType);
            formDataToSend.append('templateTheme', formData.templateTheme);
            formDataToSend.append('orientation', formData.orientation);
            formDataToSend.append('count', formData.count || 0);
            formDataToSend.append('templatePhoto', formData.templatePhoto || false);
            formDataToSend.append('isFavorite', formData.isFavorite || false);
            formDataToSend.append('isPremium', formData.isPremium || false);

            if (formData.tags && Array.isArray(formData.tags)) {
                formData.tags.forEach((tag, index) => {
                    formDataToSend.append(`tags[${index}]`, tag);
                });
            }

            if (formData.colors && Array.isArray(formData.colors)) {
                formData.colors.forEach((color, index) => {
                    formDataToSend.append(`colors[${index}][color]`, color.color);
                    formDataToSend.append(`colors[${index}][hex]`, color.hex);
                    formDataToSend.append(`colors[${index}][initialDetail]`, JSON.stringify(color.initialDetail || {}));
                });
            }

            imagePreviews.forEach((colorPreviews, colorIndex) => {
                colorPreviews.forEach((preview) => {
                    if (preview.file) {
                        formDataToSend.append(`templateImages[${colorIndex}]`, preview.file);
                    }
                });
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = isEditing
                ? await axiosInstance.put(`/api/template/${id}`, formDataToSend, config)
                : await axiosInstance.post('/api/template', formDataToSend, config);

            navigate("/template");
        } catch (error) {
            console.error('Error saving template:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach(colorPreviews => {
                colorPreviews?.forEach(preview => {
                    if (preview.url.startsWith('blob:')) {
                        URL.revokeObjectURL(preview.url);
                    }
                });
            });
        };
    }, [imagePreviews]);

    return (
        <Box p={2} mt={5}>
            <Container>
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    {isEditing ? 'Edit Template' : 'Create New Template'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Colors
                            </Typography>
                            {errors.colors && (
                                <Typography color="error" variant="body2" gutterBottom>
                                    {errors.colors}
                                </Typography>
                            )}
                            {formData.colors.map((color, index) => (
                                <Paper key={index} sx={{ p: 3, mb: 3, position: 'relative', border: '1px solid #eee' }}>
                                    <IconButton
                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                        onClick={() => handleRemoveColor(index)}
                                        color="error"
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3.7}>
                                            <Box
                                                onClick={() => navigate('/editor')}
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
                                                <Typography variant="body1" color="textSecondary">
                                                    Customize in Editor
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={3.7}>
                                            <TextField
                                                fullWidth
                                                label="Color Name"
                                                name="color"
                                                value={color.color}
                                                onChange={(e) => handleColorNameChange(index, e)}
                                                helperText="Type color name (e.g., 'red', 'blue')"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3.7}>
                                            <TextField
                                                fullWidth
                                                label="Hex Code"
                                                name="hex"
                                                value={color.hex}
                                                onChange={(e) => handleHexChange(index, e)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <Box
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                bgcolor: color.hex,
                                                                border: '1px solid #ccc',
                                                                mr: 1,
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    ),
                                                }}
                                                helperText="Enter hex code (e.g.,rgb(255, 0, 0))"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2">Uploaded Images</Typography>
                                            {templetImage && (
                                                <Box
                                                    component="img"
                                                    src={templetImage}
                                                    alt="Template Preview"
                                                    sx={{ width: 120, height: 120, border: '1px solid #ccc' }}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddColor}
                                sx={{ mt: 1 }}
                            >
                                Add Another Color
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleTypeChange}
                                    label="Type"
                                >
                                    {types.length > 0 ? (
                                        types.map((type) => (
                                            <MenuItem key={type._id} value={type._id}>
                                                {type.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No types available</MenuItem>
                                    )}
                                </Select>
                                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Size"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="desc"
                                value={formData.desc}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                error={!!errors.desc}
                                helperText={errors.desc}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TextField
                                    label="Add Tag"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    size="small"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddTag}
                                    startIcon={<AddIcon />}
                                >
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.tags.map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={() => handleRemoveTag(tag)}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Template Type</InputLabel>
                                <Select
                                    name="templateType"
                                    value={formData.templateType}
                                    onChange={handleChange}
                                    label="Template Type"
                                >
                                    <MenuItem value="wedding">Wedding</MenuItem>
                                    <MenuItem value="birthday">Birthday</MenuItem>
                                    <MenuItem value="anniversary">Anniversary</MenuItem>
                                    <MenuItem value="graduation">Graduation</MenuItem>
                                    <MenuItem value="corporate">Corporate</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Template Theme</InputLabel>
                                <Select
                                    name="templateTheme"
                                    value={formData.templateTheme}
                                    onChange={handleChange}
                                    label="Template Theme"
                                >
                                    <MenuItem value="modern">Modern</MenuItem>
                                    <MenuItem value="vintage">Vintage</MenuItem>
                                    <MenuItem value="minimalist">Minimalist</MenuItem>
                                    <MenuItem value="elegant">Elegant</MenuItem>
                                    <MenuItem value="fun">Fun</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Orientation</InputLabel>
                                <Select
                                    name="orientation"
                                    value={formData.orientation}
                                    onChange={handleChange}
                                    label="Orientation"
                                >
                                    <MenuItem value="portrait">Portrait</MenuItem>
                                    <MenuItem value="landscape">Landscape</MenuItem>
                                    <MenuItem value="square">Square</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="templatePhoto"
                                        checked={formData.templatePhoto}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                }
                                label="Has Template Photo"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="isFavorite"
                                        checked={formData.isFavorite}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                }
                                label="Mark as Favorite"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="isPremium"
                                        checked={formData.isPremium}
                                        onChange={handleChange}
                                        color="primary"
                                    />
                                }
                                label="Premium Template"
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
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
                                {isEditing ? 'Update Template' : 'Create Template'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </Box>
    );
};

export default TemplateForm;