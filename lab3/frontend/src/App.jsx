// =========================================================
// App Component — Main Routing & Shell (ShopKart Lab 03)
// =========================================================
// Routes:
// - /products     -> Product Listing & Discovery (Task 6 & Task 7)
// - /products/:id -> Product Details (Task 8)
// - /home         -> Customer Dashboard (Lab 02)
// - /login        -> Authentication (Lab 02)
// - /register     -> Registration (Lab 02)
// - /             -> Redirects to /products
// =========================================================

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import api from "./services/api";

export default function App() {
  const [customer, setCustomer] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check auth state on first load by calling GET /customers/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch {
        setCustomer(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Header navigation bar */}
        <Navbar customer={customer} setCustomer={setCustomer} />

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            {/* Default redirect to Products catalog */}
            <Route path="/" element={<Navigate to="/products" replace />} />

            {/* Task 6 & 7: Product Catalog & Search/Filter */}
            <Route path="/products" element={<Products />} />

            {/* Task 8: Dynamic Route for Single Product Details */}
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Home / Customer Profile */}
            <Route
              path="/home"
              element={<Home customer={customer} setCustomer={setCustomer} />}
            />

            {/* Authentication Routes */}
            <Route
              path="/login"
              element={<Login setCustomer={setCustomer} />}
            />
            <Route path="/register" element={<Register />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
