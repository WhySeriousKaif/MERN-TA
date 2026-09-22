// =========================================================
// App Component — Main Routing & State Shell
// =========================================================
// Configures React Router DOM for:
// - /register -> Register page (Task 1)
// - /login    -> Login page (Task 2)
// - /home     -> Protected customer dashboard (Task 3)
// - /         -> Redirects to /home
// =========================================================

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import api from "./services/api";

export default function App() {
  const [customer, setCustomer] = useState(null);
  const [checkingInitialAuth, setCheckingInitialAuth] = useState(true);

  // Check auth state on first load by calling GET /customers/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch {
        // If not logged in or cookie expired, customer remains null
        setCustomer(null);
      } finally {
        setCheckingInitialAuth(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Top navigation bar with Logout button (Task 4) */}
        <Navbar customer={customer} setCustomer={setCustomer} />

        {/* Page Content */}
        <main className="main-content">
          <Routes>
            {/* Default root path redirects to /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Task 1: Registration Page */}
            <Route path="/register" element={<Register />} />

            {/* Task 2: Login Page */}
            <Route
              path="/login"
              element={<Login setCustomer={setCustomer} />}
            />

            {/* Task 3: Protected Home Page */}
            <Route
              path="/home"
              element={<Home customer={customer} setCustomer={setCustomer} />}
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
