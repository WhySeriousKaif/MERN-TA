// =========================================================
// API Service Configuration (ShopKart Lab 03)
// =========================================================
// Centralized Axios instance:
// - Reads backend base URL from import.meta.env.VITE_API_URL
// - withCredentials: true ensures HttpOnly cookies (auth tokens) are sent/received
// =========================================================

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
