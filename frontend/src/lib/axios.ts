import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE || "/api",
  timeout: 30000,
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      console.error("Unauthorized access - redirecting to login");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("Forbidden access");
    } else if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
