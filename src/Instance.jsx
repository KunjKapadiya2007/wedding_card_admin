import axios from "axios";

const token = localStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BASE_URL,
  headers: {
    // athorName: "syket",
    Authorization: `Bearer ${token}`,
  },
});

export default axiosInstance;
