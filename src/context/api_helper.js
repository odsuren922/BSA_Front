import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor - Automatically add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error("Request error!"); // Show toast on request error
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle Unauthorized & Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.warning("Unauthorized! Redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error(`Error: ${error.response.data.message || "Өгөгдөл татахад алдаа гарлаа!"}`);
      }
    } else {
      toast.error("Сүлжээний алдаа. Холболтоо шалгана уу.");
    }
    return Promise.reject(error);
  }
);

export default api;
