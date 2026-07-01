import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/uploads") ? path : `/uploads/${path}`;
}
