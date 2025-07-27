import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_BASE_URL;

console.log("Environment:", import.meta.env.MODE);
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("API Base URL:", BASE_URL);
console.log("Full API URL:", BASE_URL + "/api");

export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: true,
});

// Add request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
