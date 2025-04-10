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
import React, { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axiosInstance from "../Instance";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const navigate = useNavigate();
  const notify = () => toast.success("Login successful :tada:");
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
          console.log(response);
          const { token } = response.data;
          localStorage.setItem("token", token, { expires: 7 });
          actions.resetForm();
          navigate("/");
          notify();
        })
        .catch((error) => {
          const status = error.response ? error.response.status : 500;
          switch (status) {
            case 400:
              notifyError("Bad request. Please check your input.");
              break;
            case 401:
              notifyError("Unauthorized. Please check your credentials.");
              break;
            case 403:
              notifyError(
                "Forbidden. You don't have permission to perform this action."
              );
              break;
            case 404:
              notifyError(
                "Not found. The requested resource could not be found."
              );
              break;
            case 500:
              notifyError("Internal server error. Please try again later.");
              break;
            default:
              notifyError("An unknown error occurred. Please try again.");
              break;
          }
        });
    },
  });
  return (
    <Box>
      <Container>
        <Grid container justifyContent="center">
          <Grid
            item
            xs={12}
            sx={{
              width: "100%",
              padding: { xs: "20px", sm: "40px", md: "54px" },
            }}
          >
            <Box>
              <Typography
                className="lato"
                sx={{
                  fontSize: { xs: "20px", sm: "24px", md: "32px" },
                  fontWeight: "800",
                  marginBottom: 2,
                }}
              >
                LOG IN
              </Typography>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography component="p"
                sx={{
                  fontSize: { xs: "14px", sm: "16px" },
                  marginBottom: 2,
                }}
              >
                Login and enjoy member-only benefits and promotions
              </Typography>
              <Typography
                component="p"
                sx={{
                  fontSize: { xs: "14px", sm: "16px" },
                }}
              >
                Please complete all fields marked with an *.
              </Typography>
            </Box>
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
                  <Box sx={{ position: "relative" }}>
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
                      sx={{ position: "absolute", right: 10, top: 10 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
                </Grid>
                {/* <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Typography sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox />
                      Remember me
                    </Typography>
                    <Typography sx={{ textDecoration: "underline" }}>
                      Forgot your password?
                    </Typography>
                  </Box>
                </Grid> */}
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
      </Container>
    </Box>
  );
};
export default Login;
