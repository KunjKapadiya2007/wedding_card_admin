import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import PrivateRoute from "./privateRoute";
import PolotnoEditorProvider from "./pages/editor/PolotnoEditorProvider";
import { FiberProvider } from "its-fine";

const Root = () => {
    const isLoggedIn = !!sessionStorage.getItem("token");
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
                <Route path="/*" element={
                    <>
                        <App onLogout={handleLogout} isLoggedIn={isLoggedIn} />
                        <PolotnoEditorProvider />
                    </>
                } />
            </Route>
        </Routes>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <FiberProvider>
            <Root />
        </FiberProvider>
    </BrowserRouter>
);
