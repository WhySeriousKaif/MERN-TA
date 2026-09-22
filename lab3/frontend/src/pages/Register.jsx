// =========================================================
// Register Page (ShopKart Lab 03 Continuation)
// =========================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/customers/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.data.success) {
        navigate("/login", {
          state: {
            successMessage: "Registration successful! Please sign in with your credentials.",
          },
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "An unexpected error occurred. Please check your details and try again.";
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join ShopKart to explore our catalog</p>
      </div>

      {serverError && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="register-name">
            Full Name
          </label>
          <input
            type="text"
            id="register-name"
            name="fullName"
            className={`form-input ${errors.fullName ? "input-error" : ""}`}
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-email">
            Email Address
          </label>
          <input
            type="email"
            id="register-email"
            name="email"
            className={`form-input ${errors.email ? "input-error" : ""}`}
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-password">
            Password (min 6 characters)
          </label>
          <input
            type="password"
            id="register-password"
            name="password"
            className={`form-input ${errors.password ? "input-error" : ""}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-phone">
            Phone Number
          </label>
          <input
            type="tel"
            id="register-phone"
            name="phone"
            className={`form-input ${errors.phone ? "input-error" : ""}`}
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            required
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="register-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in here</Link>
      </div>
    </div>
  );
}
