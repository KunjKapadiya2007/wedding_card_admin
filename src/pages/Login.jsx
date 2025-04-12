import {
    Box,
    Button,
    Checkbox,
    Container,
    Grid,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import React, {useState} from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {useFormik} from "formik";
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";
import {toast, ToastContainer} from "react-toastify";
import axiosInstance from "../Instance";
import logo from "../assets/image/logo/logo.png"
import bgImg from "../assets/image/login/login-background.jpg"

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const navigate = useNavigate();
    const notify = () => toast.success("Login successful");
    const notifyError = (message) => toast.error(message);
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .matches(
                    /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
                    "Invalid email address"
                )
                .required("Enter a valid email"),
            password: Yup.string().required("Enter a valid password"),
        }),
        onSubmit: (values, actions) => {
            axiosInstance
                .post("/api/auth/login", values)
                .then((response) => {
                    const { token, user } = response.data;
                    if (user.role === "ADMIN") {
                        localStorage.setItem("token", token);
                        actions.resetForm();
                        notify();
                        navigate("/");
                    } else {
                        notifyError("Access Denied: Only admin can log in.");
                    }
                })
                .catch(() => {
                    notifyError("Login failed. Please check your credentials.");
                });
        },
    });


    return (
        <Box
            sx={{
                position: "relative",
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ToastContainer />
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    backgroundImage: `url(${bgImg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(3px)",
                    zIndex: -1,
                }}
            />
            <Container sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Box
                    sx={{
                        width: "450px",
                        backgroundColor: "#FFF",
                        borderRadius: "12px",
                        boxShadow: 3,
                    }}
                >
                    <Grid container justifyContent="center">
                        <Grid
                            item
                            xs={12}
                            sx={{
                                padding: {xs: "20px", sm: "40px", md: "54px"},
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        height: {sm:"80px" , xs:"60px"},
                                        width: {sm:"250px" , xs:"200px"},
                                        mb: {sm:4 , xs:2},
                                    }}
                                >
                                    <img
                                        src={logo}
                                        alt="logo"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </Box>
                                <Typography
                                    className="lato"
                                    sx={{
                                        fontSize: {xs: "20px", sm: "24px", md: "32px"},
                                        fontWeight: "800",
                                        marginBottom: 4,
                                    }}
                                >
                                    Hi, Welcome Back
                                </Typography>
                            </Box>

                            {/* Login Form */}
                            <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                            helperText={formik.touched.email && formik.errors.email}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{position: "relative"}}>
                                            <TextField
                                                fullWidth
                                                label="Password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formik.values.password}
                                                onChange={formik.handleChange}
                                                error={
                                                    formik.touched.password && Boolean(formik.errors.password)
                                                }
                                                helperText={
                                                    formik.touched.password && formik.errors.password
                                                }
                                            />
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                sx={{position: "absolute", right: 10, top: 10}}
                                            >
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="flex-end" my={3}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                sx={{
                                                    textTransform: "unset",
                                                    border: "1px solid black",
                                                    padding: {
                                                        xs: "12px 30px",
                                                        sm: "12px 60px",
                                                        md: "12px 88px",
                                                    },
                                                    fontSize: "16px",
                                                    fontWeight: "500",
                                                    borderRadius: "0px",
                                                    backgroundColor: "#000000",
                                                    width: "100%",
                                                    "&:hover": {
                                                        backgroundColor: "#FFFFFF",
                                                        color: "#000000",
                                                    },
                                                }}
                                            >
                                                LOGIN
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>

    );
};
export default Login;
