import React, { useEffect, useState } from 'react';
import axiosInstance from "../Instance.jsx";
import { Box, Tabs, Tab, Typography, Grid, Card, CardContent, IconButton, TextField, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function Config() {
    const [config, setConfig] = useState(null);
    const [value, setValue] = useState('config');
    const [newType, setNewType] = useState("");

    useEffect(() => {
        axiosInstance.get("/api/config")
            .then((res) => setConfig(res.data.data))
            .catch((err) => console.log(err));
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleAddType = () => {
        if (newType.trim() === "" || !config) return;

        const updatedTypes = [...config.types, newType];

        axiosInstance.put(`/api/config/${config._id}`, { types: updatedTypes })
            .then(() => {
                setConfig(prevConfig => ({
                    ...prevConfig,
                    types: updatedTypes
                }));
                setNewType("");
            })
            .catch((err) => console.log(err));
    };

    const handleDeleteType = (index) => {
        if (!config) return;

        const updatedTypes = config.types.filter((_, i) => i !== index);

        axiosInstance.put(`/api/config/${config._id}`, { types: updatedTypes })
            .then(() => {
                setConfig(prevConfig => ({
                    ...prevConfig,
                    types: updatedTypes
                }));
            })
            .catch((err) => console.log(err));
    };

    return (
        <Box sx={{ width: '100%', mt: 5 }}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="config tabs"
                sx={{ '& .MuiTab-root': { fontWeight: 900, color: '#000' }, '& .Mui-selected': { color: '#0d47a1' } }}
            >
                <Tab value="config" label="Config" />
                <Tab value="type" label="Type" />
            </Tabs>
            <Box sx={{ p: 2 }}>
                {value === "config" && config && (
                    <Typography>{config.name}</Typography>
                )}
                {value === "type" && config && (
                    <Box sx={{ flex: 1, background: "#f9f9f9", p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Type"
                                variant="outlined"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleAddType}>Add Type</Button>
                        </Box>
                        <Grid container spacing={2}>
                            {config.types.length > 0 ? (
                                config.types.map((type, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Card sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
                                            <CardContent>
                                                <Typography>{type}</Typography>
                                            </CardContent>
                                            <IconButton color="error" onClick={() => handleDeleteType(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Typography sx={{p:2}}>No types available</Typography>
                            )}
                        </Grid>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Config;