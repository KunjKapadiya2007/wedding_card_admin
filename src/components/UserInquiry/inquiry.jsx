import React, { useEffect, useState } from "react";
import axiosInstance from "../../Instance";
import {
    Box, Typography, CircularProgress, Alert,
    Card, CardContent, Button,
    Grid
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import toast, { Toaster } from "react-hot-toast";

const Inquiry = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await axiosInstance.get("/api/inquiry");
            setInquiries(response.data.data || []);
            setError(null);
        } catch (err) {
            setError("Failed to fetch inquiries. Please try again.");
            console.error("Error fetching inquiries:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (inquiryId) => {
        toast(
            (t) => (
                <div>
                    <p>Are you sure you want to delete this inquiry?</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button onClick={() => confirmDelete(inquiryId, t.id)} style={buttonStyle}>Yes</button>
                        <button onClick={() => toast.dismiss(t.id)} style={buttonStyle}>No</button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                position: "top-center",
            }
        );
    };

    const confirmDelete = async (inquiryId, toastId) => {
        toast.dismiss(toastId);
        try {
            await axiosInstance.delete(`/api/inquiry/${inquiryId}`);
            setInquiries((prevInquiries) => prevInquiries.filter(inquiry => inquiry._id !== inquiryId));
            toast.success("Inquiry deleted successfully!");
        } catch (err) {
            toast.error("Failed to delete inquiry. Please try again.");
            console.error("Error deleting inquiry:", err);
        }
    };

    const buttonStyle = {
        background: "#000",
        color: "#fff",
        padding: "5px 10px",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear().toString().slice(2);

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? String(hours).padStart(2, '0') : '12';

        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
    };

    return (
        <Box p={2} mt={5}>
            <Toaster position="top-center" reverseOrder={false} />
            <Typography variant="h4" sx={{ mb: 2 }}>
                Inquiry List
            </Typography>

            {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && inquiries.length === 0 && (
                <Alert severity="info">No inquiries available.</Alert>
            )}

            {!loading && (
                <Grid container spacing={2}>
                    {inquiries.map((inquiry) => (
                        <Grid item xs={12} sm={6} key={inquiry._id}>
                            <Card sx={{ boxShadow: 1, borderRadius: '20px' }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                            {inquiry.name || 'No name provided'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex' }} >
                                            📌 <Typography sx={{ ml: 1 }} > {inquiry.topic || 'No topic available'}</Typography>
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex' }} >
                                            📧 <Typography sx={{ ml: 1 }} > {inquiry.email || 'No email provided'}</Typography>
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex' }} >
                                            🖊️ <Typography sx={{ ml: 1 }} > {inquiry.description || 'No description available'}</Typography>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "gray" }}>
                                            Created At: {formatDate(inquiry.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Button
                                            sx={{ mt: 1, border: 'none', bgcolor: '#fff', borderRadius: '50px', boxShadow: 'none' }}
                                            onClick={() => handleDelete(inquiry._id)}
                                        >
                                            <DeleteOutlineIcon sx={{ color: 'red' }} />
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Inquiry;