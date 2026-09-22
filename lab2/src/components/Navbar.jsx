// =========================================================
// Navbar Component
// =========================================================
// Task 4: Logout
// Displays ShopKart branding, navigation links, and handles
// customer logout by invoking POST /customers/logout and
// redirecting the user to /login.
// =========================================================

import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Navbar({ customer, setCustomer }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Handles customer logout
  const handleLogout = async () => {
    try {
      // 1. Call backend to clear the HttpOnly cookie
      await api.post("/customers/logout");
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      // 2. Clear customer state in React
      if (setCustomer) {
        setCustomer(null);
      }
      // 3. Navigate back to login page
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Name */}
        <Link to="/home" className="navbar-brand">
          <div className="brand-icon">🛒</div>
          <span>ShopKart</span>
        </Link>

        {/* Navigation Actions */}
        <div className="navbar-links">
          {customer ? (
            // Shown when user is logged in
            <>
              <div className="user-badge" title={customer.email}>
                <span className="user-avatar-sm">
                  {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : "U"}
                </span>
                <span>{customer.fullName}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger"
                id="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            // Shown when user is logged out
            <>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
                id="nav-login-link"
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}
                id="nav-register-link"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
