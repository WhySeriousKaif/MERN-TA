// =========================================================
// Task 1: Registration Page (/register)
// =========================================================
// Requirements:
// 1. Controlled components for: fullName, email, password, phone
// 2. Client-side and server-side validation error displays
// 3. POST /customers/register
// 4. On success -> Redirect to /login
// =========================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  // 1. Form state: Controlled components
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  // 2. UI status states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error as the user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setServerError("");
  };

  // Client-side validation function
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Run client validation first
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send registration payload to backend API
      const response = await api.post("/regis/customerster", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.data.success) {
        // Redirect to /login page with a success message in router state
        navigate("/login", {
          state: {
            successMessage: "Registration successful! Please login with your credentials.",
          },
        });
      }
    } catch (error) {
      // Display server error (e.g. 409 "Email already registered" or 400 "Validation failed")
      const message =
        error.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join ShopKart to start shopping today</p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`form-input ${errors.fullName ? "input-error" : ""}`}
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
          />
          {errors.fullName && <p className="field-error">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email ? "input-error" : ""}`}
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-input ${errors.password ? "input-error" : ""}`}
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={`form-input ${errors.phone ? "input-error" : ""}`}
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          id="register-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in here</Link>
      </div>
    </div>
  );
}
