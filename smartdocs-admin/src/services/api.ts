import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || import.meta.env.VITE_DEV_TOKEN || "";
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
