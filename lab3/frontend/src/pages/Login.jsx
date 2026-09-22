// =========================================================
// Login Page (ShopKart Lab 03 Continuation)
// =========================================================

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Login({ setCustomer }) {
  const navigate = useNavigate();
  const location = useLocation();

  const registrationSuccess = location.state?.successMessage;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/customers/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        try {
          const profileRes = await api.get("/customers/me");
          if (setCustomer) {
            setCustomer(profileRes.data);
          }
        } catch {
          // Non-blocking: Home page fetches profile regardless
        }

        navigate("/products");
      }
    } catch (error) {
      const errorText =
        error.response?.data?.message || "Invalid Credentials. Please try again.";
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your ShopKart account</p>
      </div>

      {registrationSuccess && !errorMessage && (
        <div className="alert alert-success" role="alert">
          <span>✅</span>
          <span>{registrationSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger" role="alert" id="login-error-alert">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            Email Address
          </label>
          <input
            type="email"
            id="login-email"
            name="email"
            className="form-input"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            name="password"
            className="form-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="login-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Create one now</Link>
      </div>
    </div>
  );
}
