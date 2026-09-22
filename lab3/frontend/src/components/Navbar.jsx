// =========================================================
// Navbar Component (ShopKart Lab 03)
// =========================================================

import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Navbar({ customer, setCustomer }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      setCustomer(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setCustomer(null);
      navigate("/login");
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/home" className="navbar-brand">
          <span className="brand-icon">🛒</span>
          <span className="brand-name">ShopKart</span>
          <span className="brand-badge">Lab 03</span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="navbar-nav">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Products
          </NavLink>
        </nav>

        {/* User Auth Section */}
        <div className="navbar-auth">
          {customer ? (
            <div className="auth-logged-in">
              <span className="user-greeting">
                👋 Hello, <strong>{customer.fullName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of ShopKart"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-guest">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
