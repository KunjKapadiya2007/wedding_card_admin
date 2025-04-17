import React, {useState, useRef, useEffect} from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Chip,
    IconButton,
    Container
} from '@mui/material';
import {Delete as DeleteIcon, Add as AddIcon} from '@mui/icons-material';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axiosInstance from "../../Instance.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEditorData} from '../../pages/editor/EditorDataContext.jsx';

const TemplateForm = () => {
    const [tagInput, setTagInput] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const fileInputRefs = useRef([]);
    const [types, setTypes] = useState([]);
    const [dataUrl, setDataUrl] = useState('');
    const {id} = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const {
        editorData,
        templetImage,
        setEditorData,
        formData,
        setFormData,
        setCurrentColorIndex,
        setTempletImage,
        initialValues
    } = useEditorData();

    useEffect(() => {
        axiosInstance.get("/api/all/type")
            .then((response) => {
                setTypes(response.data.data);
            })
            .catch((error) => {
                console.error("Error fetching types:", error);
            });

        if (id && !formData._id) {
            setIsEditing(true);
            axiosInstance.get(`/api/template/${id}`)
                .then((response) => {
                    const template = response.data.data;

                    const updatedColors = template.colors.map(color => ({
                        color: color.color || '',
                        hex: color.hex || '',
                        templateImages: color.templateImages,
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
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTypeChange = (event) => {
        setFormData({...formData, type: event.target.value});
    };

    const handleColorNameChange = (index, e) => {
        const {value} = e.target;
        const updatedColors = [...formData.colors];

        updatedColors[index].color = value;

        setFormData(prev => ({...prev, colors: updatedColors}));
    };

    const handleHexChange = (index, e) => {
        const {value} = e.target;
        const updatedColors = [...formData.colors];

        updatedColors[index].hex = value;

        setFormData(prev => ({...prev, colors: updatedColors}));
    };

    const handleAddColor = () => {
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, {color: '', hex: '#000000', templateImages: [], initialDetail: {}}]
        }));
    };

    const handleRemoveColor = (index) => {
        const updatedColors = formData.colors.filter((_, i) => i !== index);
        setFormData(prev => ({...prev, colors: updatedColors}));

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
            formData.colors.forEach((color, index) => {
                formDataToSend.append(`colors[${index}][color]`, color.color);
                formDataToSend.append(`colors[${index}][hex]`, color.hex);
                if (color.templateImages.includes('cloudinary')) {
                    formDataToSend.append(`colors[${index}][templateImages]`, color.templateImages);
                }
                else  if (color.templateImages.includes('base64')) {
                    const base64 = color.templateImages;
                    const byteString = atob(base64.split(',')[1]);
                    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], {type: mimeString});
                    const file = new File([blob], `templateImage_${color.color}.png`, {type: mimeString});
                    formDataToSend.append(`templateImages[${index}]`, file);
                }
                const initialDetailData = (index === formData.colors.length - 1 && editorData)
                    ? editorData
                    : color.initialDetail || {};
                formDataToSend.append(`colors[${index}][initialDetail]`, JSON.stringify(initialDetailData));
            });


            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = (isEditing || formData._id)
                ? await axiosInstance.put(`/api/template/${id}`, formDataToSend, config)
                : await axiosInstance.post('/api/template', formDataToSend, config);

            setFormData(initialValues)
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

    console.log("formData.colors : ",formData)

    return (
        <Box p={2} mt={5}>
            <Container>
                <Typography variant="h4" gutterBottom sx={{mb: 4}}>
                    {(isEditing || formData._id) ? 'Edit Template' : 'Create New Template'}
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
                            {formData.colors?.map((color, index) => (
                                <Paper key={index} sx={{p: 3, mb: 3, position: 'relative', border: '1px solid #eee'}}>
                                    <IconButton
                                        sx={{position: 'absolute', top: 8, right: 8}}
                                        onClick={() => handleRemoveColor(index)}
                                        color="error"
                                    >
                                        <DeleteOutlineIcon/>
                                    </IconButton>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3.7}>
                                            <Box
                                                onClick={() => {
                                                    // If `initialDetail` is already an object, don't parse it
                                                    const detail = typeof color.initialDetail === 'string'
                                                        ? JSON.parse(color.initialDetail)
                                                        : color.initialDetail;

                                                    setEditorData(detail || null);
                                                    setTempletImage(color.templateImages);
                                                    setCurrentColorIndex(index);

                                                    if (id) {
                                                        navigate(`/editor?id=${id}`);
                                                    } else {
                                                        navigate(`/editor`);
                                                    }
                                                }}
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
                                                        <>
                                                            <Box
                                                                component="input"
                                                                type="color"
                                                                value={color.hex}
                                                                onChange={(e) => handleHexChange(index, {target: {value: e.target.value}})}
                                                                sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    border: 'none',
                                                                    mr: 1,
                                                                    padding: 0,
                                                                    background: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                            />
                                                        </>
                                                    ),
                                                }}
                                                helperText="Enter hex code (e.g., #ff0000)"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2">Uploaded Images</Typography>
                                            {/*{id ? (*/}
                                            {/*        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>*/}
                                            {/*                <Box*/}
                                            {/*                    key={index}*/}
                                            {/*                    component="img"*/}
                                            {/*                    src={color.templateImages[0]}*/}
                                            {/*                    alt="Template Preview"*/}
                                            {/*                    sx={{ width: 120, height: 120, border: '1px solid #ccc' }}*/}
                                            {/*                />*/}
                                            {/*        </Box>*/}
                                            {/*) : (*/}
                                            {color.templateImages && (
                                                <Box
                                                    component="img"
                                                    src={color.templateImages}
                                                    alt="Template Preview"
                                                    sx={{width: 120, height: 120, border: '1px solid #ccc'}}
                                                />
                                            )}
                                            {/*)}*/}
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon/>}
                                onClick={handleAddColor}
                                sx={{mt: 1}}
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

                        {/* Tags */}
                        <Grid item xs={12}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
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
                                    startIcon={<AddIcon/>}
                                >
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                {formData?.tags?.map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={() => handleRemoveTag(tag)}
                                        sx={{mb: 1}}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Template Properties */}
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

                        {/* Checkboxes */}
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

                        {/* Submit Button */}
                        <Grid item xs={12} sx={{mt: 4}}>
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{
                                textTransform: "unset",
                                border: "1px solid black",
                                padding: "6px 24px",
                                fontSize: "16px",
                                fontWeight: "500",
                                borderRadius: "0px",
                                backgroundColor: '#000',
                                color: '#fff',
                                "&:hover": {backgroundColor: '#fff', color: '#000',},
                            }}>
                                {(isEditing || formData._id) ? 'Update Template' : 'Create Template'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </Box>
    );
};

export default TemplateForm;