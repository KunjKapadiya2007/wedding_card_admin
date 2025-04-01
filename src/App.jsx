import React from "react";
import Header from "./components/global/Header/Header";
import Home from "./pages/Home/Home";
import { Route, Routes, useNavigate } from "react-router-dom";
import AddProduct1 from "./pages/AddProduct1";
import { Box, CssBaseline, styled } from "@mui/material";
import Sidebar from "./components/sidebar/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoryList from "./components/Category/CategoryList";
import SubcategoryList from "./components/Subcategory/SubcategoryList";
import Order from "./pages/Order";
import Users from "./components/Users/users";
import ParentCategory from "./components/ParentCategory/ParentCategory";
import Type from "./components/Type/Type";
import Inquiry from "./components/UserInquiry/inquiry";
import TemplateForm from "./components/Template/TemplateForm";
import Blog from "./components/Blog/Blog";
import Template from "./components/Template/Template";

const drawerWidth = 250;

const App = ({ isLoggedIn, onLogout }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const [open, setOpen] = React.useState(true);
    const navigate = useNavigate();

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const Main = styled("main", {
        shouldForwardProp: (prop) => prop !== "open",
    })(({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    }));

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <ToastContainer />

            {/* ✅ Sidebar aur Header sirf jab logged in ho tab dikhai de */}
            {isLoggedIn && <Header open={open} />}
            {isLoggedIn && (
                <Box component="nav" sx={{ width: { md: drawerWidth, xs: 0 }, flexShrink: { sm: 0 }, boxShadow: "0 2px 48px 0 rgba(0,0,0,.08)", }}>
                    <Sidebar
                        open={open}
                        handleDrawerClose={handleDrawerClose}
                        window={window}
                        handleDrawerToggle={handleDrawerToggle}
                        mobileOpen={mobileOpen}
                        handleDrawerTransitionEnd={handleDrawerTransitionEnd}
                        setOpen={setOpen}
                    />
                </Box>
            )}


            <Main open={isLoggedIn && open}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-product" element={<AddProduct1 />} />
                    <Route path="/edit-product/:productId" element={<AddProduct1 />} />
                    <Route path="/category" element={<CategoryList />} />
                    <Route path="/category/:id" element={<CategoryList />} />
                    <Route path="/parent-category" element={<ParentCategory />} />
                    <Route path="/subcategory" element={<SubcategoryList />} />
                    <Route path="/subcategory/:id" element={<SubcategoryList />} />
                    <Route path="/type" element={<Type />} />
                    <Route path="/type/:id" element={<Type />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/inquiry" element={<Inquiry />} />
                    <Route path="/template-form" element={<TemplateForm />} />
                    <Route path="/template-form/:id" element={<TemplateForm />} />
                    <Route path="/template" element={<Template />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/user" element={<Users />} />
                </Routes>
            </Main>
        </Box>
    );
};

export default App;
