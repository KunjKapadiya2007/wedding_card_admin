import React, { useEffect, useState } from "react";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import axiosInstance from "../Instance";

function Order() {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null); // 🔹 Tracks expanded row

    // Fetch orders from API
    const fetchOrders = () => {
        try {
            axiosInstance.get("/api/order").then((res) => setOrders(res.data)).catch((e) => console.log(e))
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Handle status change
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await axiosInstance.put(`/api/order/${orderId}`, {
                status: newStatus,
            });

            if (response.status === 200) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, status: newStatus } : order
                    )
                );
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Toggle expand/collapse
    const toggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <Box p={2} mt={5}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Orders List
            </Typography>

            {/* Orders Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Order ID</strong></TableCell>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Product</strong></TableCell>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell><strong>Quantity</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...orders]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 🔥 Newest first, Oldest last
                            .map((order) => (
                                <React.Fragment key={order._id}>
                                    {/* 🔹 Main Row */}
                                    <TableRow>
                                        <TableCell>{order._id}</TableCell>
                                        <TableCell>{order.user_id?.first_name} {order.user_id?.last_name}</TableCell>
                                        <TableCell>{order.product_id?.title}</TableCell>
                                        <TableCell>₹{order.price}</TableCell>
                                        <TableCell>{order.qty}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    label="Status"
                                                    sx={{
                                                        color:
                                                            order.status === "placed" ? "lightblue" :
                                                            order.status === "confirmed" ? "blue" :
                                                            order.status === "shipped" ? "orange" :
                                                            order.status === "delivered" ? "green" :
                                                            order.status === "cancelled" ? "red" : "white",
                                                        // color: "white",
                                                        fontWeight: "bold",
                                                        borderRadius: 1,
                                                        width:'100%'
                                                    }}
                                                >
                                                    <MenuItem value="placed">Placed</MenuItem>
                                                    <MenuItem value="confirmed">Confirmed</MenuItem>
                                                    <MenuItem value="shipped">Shipped</MenuItem>
                                                    <MenuItem value="delivered">Delivered</MenuItem>
                                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>

                                        <TableCell>
                                            <IconButton onClick={() => toggleExpand(order._id)}>
                                                {expandedOrderId === order._id ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                    {/* 🔹 Expandable Row (Order Details) */}
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                                            <Collapse in={expandedOrderId === order._id} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                        <Box>
                                                            <Typography variant="h6" gutterBottom>
                                                                Order Details
                                                            </Typography>
                                                            <Typography>Color : {order.color.color}</Typography>
                                                            <Typography>Size : {order.size}</Typography>
                                                            <Typography>Qty : {order.qty}</Typography>
                                                            <Typography>Product Price
                                                                : ₹{order.color.price.discounted_price}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography component={'img'}
                                                                src={order.color.product_images[0]}
                                                                sx={{ width: 80 }}></Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                            <Collapse in={expandedOrderId === order._id} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2, padding: 2, background: "#f5f5f5", borderRadius: 2 }}>
                                                    <Typography variant="h6" gutterBottom>User Details</Typography>
                                                    <Typography><strong>Name:</strong> {order.user_id?.first_name} {order.user_id?.last_name}</Typography>
                                                    <Typography><strong>Phone No. :</strong> {order.user_id?.phone_number}</Typography>
                                                    <Typography><strong>Email:</strong> {order.user_id?.email}</Typography>
                                                    <Typography><strong>Address:</strong> {order.user_id?.address_details?.address_1}, {order.user_id?.address_details?.address_2}, {order.user_id?.address_details?.city}, {order.user_id?.address_details?.state}, {order.user_id?.address_details?.country}, {order.user_id?.address_details?.zipcode}</Typography>
                                                    {/* <Typography><strong>Payment
                                                   Method:</strong> {order.payment_method || "N/A"}</Typography> */}
                                                    <Typography><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>

                                </React.Fragment>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default Order;
