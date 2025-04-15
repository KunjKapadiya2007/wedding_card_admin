import React, { useState } from "react";
import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
    ListItemButton,
    ListItem,
    Drawer,
    List,
    Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../../../assets/image/logo/logo.png";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const Header = ({ open }) => {
    const drawerWidth = 270;
    const drawerWidth2 = 370;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const handleDrawerToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };
    const menuItems = [
        {
            label: "Editor",
            to: "/editor",
        },
        {
            label: "Template",
            to: "/template",
        },
        {
            label: "Parent Category",
            to: "/parent-category",
        },
        {
            label: "Category",
            to: "/category",
        },
        {
            label: "Subcategory",
            to: "/subcategory",
        },
        {
            label: "Type",
            to: "/type",
        },
        {
            label: "Inquiry",
            to: "/inquiry",
        },
        {
            label: "Blog",
            to: "/blog",
        },
        {
            label: "Users",
            to: "/user",
        },
        {
            label: "Config",
            to: "/config",
        },
    ];

    // { text: "Add Product", icon: <MailIcon />, path: "/add-product" },
    // { text: "Listing", icon: <MailIcon />, path: "/" },
    // { text: "Category", icon: <MailIcon />, path: "/category" },
    // { text: "Subcategory", icon: <MailIcon />, path: "/subcategory" },
    // { text: "Order", icon: <MailIcon />, path: "/order" },

    const drawer = (
        <Box>
            <Typography sx={{ mt: 2, px: "16px", textAlign: "end" }}>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Typography>
            <List>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.to); // Navigate on click
                                setMobileMenuOpen(false); // Close drawer after navigation
                            }}
                        >
                            <Typography sx={{ width: "100%", fontWeight: "500", color: "black" }}>
                                {item.label}
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
    return (
        <Box>
            <AppBar
                sx={{
                    backgroundColor: "white",
                    boxShadow: "0 2px 48px 0 rgba(0,0,0,.08)",
                    width: open ? { md: `calc(100% - ${drawerWidth}px)` } : "100%",
                    ml: { sm: `${drawerWidth}px` }
                }}
            >
                <Toolbar>
                    <Box sx={{ width: "100%", px: "30px" }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                component={"img"}
                                src={logo}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: { xs: "60px" },
                                    width: { md: "176px", xs: "120px" },
                                    cursor: "pointer",
                                    py: "10px",
                                    objectFit: "contain",
                                }}
                                onClick={() => navigate('/parent-category')}
                            ></Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: { xs: "space-between", sm: "unset" },
                                        width: "100%",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        component="div"
                                        sx={{
                                            mr: 2,
                                        }}
                                    ></Typography>
                                </Box>
                                <nav>
                                    <Drawer
                                        anchor="right"
                                        variant="temporary"
                                        open={mobileMenuOpen}
                                        onClose={handleDrawerToggle}
                                        ModalProps={{
                                            keepMounted: true,
                                        }}
                                        sx={{
                                            display: { xs: "block", md: "none" },
                                            "& .MuiDrawer-paper": {
                                                boxSizing: "border-box",
                                                width: { xs: drawerWidth, sm: drawerWidth2 },
                                            },
                                        }}
                                    >
                                        {drawer}
                                    </Drawer>
                                </nav>
                                <Box
                                    sx={{
                                        display: { xs: "none" },
                                        alignItems: "center",
                                    }}
                                >
                                    {menuItems.map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                color: "black",
                                                margin: "20px 30px 0px",
                                                pb: "10px",
                                                position: "relative",
                                                fontSize: "14px",
                                                transition: "0.4s",
                                                cursor: "pointer",
                                                textWrap: "nowrap",
                                                "&::before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    bottom: "0",
                                                    left: "0%",
                                                    height: "2px",
                                                    width: "0%",
                                                    backgroundColor: "black",
                                                    transition: ".4s",
                                                },
                                                "&:hover": {
                                                    "&::before": {
                                                        width: "100%",
                                                    },
                                                },
                                            }}
                                        >
                                            <Typography
                                                className="lato"
                                                onClick={() => navigate(item.to)}
                                                style={{ color: "unset" }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    color: "black",
                                    display: { xs: "flex" },
                                    alignItems: "center",
                                    fontWeight: "600",
                                    letterSpacing: "-0.7px",
                                }}
                            >
                                <Button variant="outlined"
                                    sx={{
                                        color: "black", borderColor: '#000', textTransform: 'capitalize', '&:hover': {
                                            bgcolor: 'black',
                                            color: 'white',
                                        }
                                    }}
                                    onClick={() => {
                                        sessionStorage.removeItem("token"); // 🔥 Remove token from localStorage
                                        navigate("/login", { replace: true }); // 🔥 Redirect to login page
                                    }}
                                >
                                    Log Out
                                    {/* <PersonIcon/> */}
                                </Button>
                                <Box
                                    sx={{
                                        flexGrow: 0,
                                        display: { xs: "block", md: "none" },
                                    }}
                                >
                                    <IconButton
                                        size="large"
                                        aria-label="menu"
                                        onClick={handleDrawerToggle}
                                        sx={{ color: "black", fontSize: "3px" }}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};
export default Header;
