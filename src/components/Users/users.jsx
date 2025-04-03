import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid, CircularProgress, TextField } from '@mui/material';
import axiosInstance from '../../Instance.jsx';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axiosInstance
            .get('/api/user')
            .then((response) => {
                const userData = response.data.data; // Ensure it's an array
                setUsers(userData || []);
                setLoading(false);
            })
            .catch((err) => {
                setError('Error fetching user data');
                setLoading(false);
            });
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
                User Profiles
            </Typography>

            <TextField
                label="Search User"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ marginBottom: 4 }}
            />

            <Grid container spacing={4}>
                {filteredUsers.map((user) => (
                    <Grid item xs={12} sm={6} md={4} key={user._id}>
                        <Card sx={{ maxWidth: '100%', boxShadow: 3, p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                {user.firstName} {user.lastName}
                            </Typography>

                            <Typography variant="body2" sx={{ marginTop: 1, color: '#1976d2' }}>
                                📧 {user.email}
                            </Typography>

                            <Typography variant="body2" sx={{ marginTop: 1, color: '#388e3c' }}>
                                📞 {user.contact || 'Phone not provided'}
                            </Typography>

                            <Typography variant="body2" sx={{ marginTop: 1, color: '#8e24aa' }}>
                                💼 Role: {user.role}
                            </Typography>

                            <Typography variant="body2" sx={{ marginTop: 1 }}>
                                {user.isPremium ? (
                                    <span style={{ color: '#ff9800' }}>⭐ Premium User</span>
                                ) : (
                                    <span style={{ color: '#9e9e9e' }}>Standard User</span>
                                )}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Users;



// import React, { useEffect, useState } from "react";
// import {
//     Box,
//     Card,
//     Typography,
//     Grid,
//     CircularProgress,
//     TextField,
//     Button,
// } from "@mui/material";
// import axiosInstance from "../../Instance.jsx";
// import { toast } from "react-toastify";
//
// const Users = () => {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchQuery, setSearchQuery] = useState("");
//
//     useEffect(() => {
//         fetchUsers();
//     }, []);
//
//     const fetchUsers = () => {
//         axiosInstance
//             .get("/api/user")
//             .then((response) => {
//                 setUsers(response.data.data || []);
//                 setLoading(false);
//             })
//             .catch(() => {
//                 setError("Error fetching user data");
//                 setLoading(false);
//             });
//     };
//
//     const handleDelete = (userId) => {
//         if (!window.confirm("Are you sure you want to delete this user?")) {
//             return;
//         }
//
//         axiosInstance
//             .delete(`/api/user/${userId}`)
//             .then(() => {
//                 setUsers(users.filter((user) => user._id !== userId));
//                 toast.success("User deleted successfully!");
//             })
//             .catch(() => {
//                 toast.error("Error deleting user. Please try again.");
//             });
//     };
//
//     const handleSearchChange = (e) => {
//         setSearchQuery(e.target.value);
//     };
//
//     const filteredUsers = users.filter(
//         (user) =>
//             user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             user.email.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//
//     if (loading) {
//         return (
//             <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//                 <CircularProgress />
//             </Box>
//         );
//     }
//
//     if (error) {
//         return (
//             <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//                 <Typography variant="h6" color="error">
//                     {error}
//                 </Typography>
//             </Box>
//         );
//     }
//
//     return (
//         <Box p={2} mt={5}>
//             <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 4 }}>
//                 User Profiles
//             </Typography>
//
//             <TextField
//                 label="Search User"
//                 variant="outlined"
//                 fullWidth
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 sx={{ marginBottom: 4 }}
//             />
//
//             <Grid container spacing={4}>
//                 {filteredUsers.map((user) => (
//                     <Grid item xs={12} sm={6} md={4} key={user._id}>
//                         <Card sx={{ maxWidth: "100%", boxShadow: 3, p: 3 }}>
//                             <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3f51b5" }}>
//                                 {user.firstName} {user.lastName}
//                             </Typography>
//
//                             <Typography variant="body2" sx={{ marginTop: 1, color: "#1976d2" }}>
//                                 📧 {user.email}
//                             </Typography>
//
//                             <Typography variant="body2" sx={{ marginTop: 1, color: "#388e3c" }}>
//                                 📞 {user.contact || "Phone not provided"}
//                             </Typography>
//
//                             <Typography variant="body2" sx={{ marginTop: 1, color: "#8e24aa" }}>
//                                 💼 Role: {user.role}
//                             </Typography>
//
//                             <Typography variant="body2" sx={{ marginTop: 1 }}>
//                                 {user.isPremium ? (
//                                     <span style={{ color: "#ff9800" }}>⭐ Premium User</span>
//                                 ) : (
//                                     <span style={{ color: "#9e9e9e" }}>Standard User</span>
//                                 )}
//                             </Typography>
//
//                             {/* 🔥 Delete Button */}
//                             <Button
//                                 variant="contained"
//                                 color="error"
//                                 sx={{ marginTop: 2, width: "100%" }}
//                                 onClick={() => handleDelete(user._id)}
//                             >
//                                 Delete User
//                             </Button>
//                         </Card>
//                     </Grid>
//                 ))}
//             </Grid>
//         </Box>
//     );
// };
//
// export default Users;
