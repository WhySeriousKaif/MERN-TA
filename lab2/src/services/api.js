// =========================================================
// API Service Configuration (ShopKart Frontend)
// =========================================================
// This file sets up an Axios client with default configurations.
//
// KEY CONCEPT: withCredentials: true
// By default, browsers DO NOT send cookies during cross-origin HTTP requests.
// Setting withCredentials: true tells Axios/Browser to:
// 1. Send the HttpOnly 'token' cookie along with requests (e.g. GET /customers/me)
// 2. Accept and store cookies sent back by the server (e.g. POST /customers/login)
// =========================================================

import axios from "axios";

const api = axios.create({
  // Backend runs on port 5001 as configured in shopkart-backend/.env
  baseURL: "http://localhost:5001",
  // Crucial: allows HttpOnly cookie authentication to work across ports!
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
