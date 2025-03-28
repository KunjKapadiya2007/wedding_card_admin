import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import PrivateRoute from "./privateRoute";

const Root = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // 🔥 Logout karne ke liye token remove
        navigate("/login"); // 🔥 Login page pe redirect
    };

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute/>}>
                <Route path="/*" element={<App onLogout={handleLogout} isLoggedIn={isLoggedIn} />} />
            </Route>
        </Routes>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <Root />
    </BrowserRouter>
);
