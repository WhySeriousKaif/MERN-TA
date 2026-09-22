// =========================================================
// Task 3: Protected Home Page (/home)
// =========================================================
// Requirements:
// 1. Fetch the logged-in customer's details via GET /customers/me
// 2. Display welcome message, fullName, email, and phone
// 3. If not logged in (e.g. 401 Unauthorized), automatically redirect to /login
// =========================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Home({ customer, setCustomer }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(customer || null);

  useEffect(() => {
    let isMounted = true;

    // Fetch authenticated user profile using the HttpOnly cookie
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/customers/me");
        if (isMounted) {
          setProfile(response.data);
          if (setCustomer) {
            setCustomer(response.data);
          }
        }
      } catch (error) {
        // If 401 (Unauthorized) or any auth error -> Redirect to /login
        console.warn("User not authenticated, redirecting to /login:", error);
        if (isMounted) {
          if (setCustomer) {
            setCustomer(null);
          }
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setCustomer]);

  // Render spinner while verifying authentication
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying authentication & loading profile...</p>
      </div>
    );
  }

  // Safety fallback if redirected or profile is null
  if (!profile) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {profile.fullName}! 👋</h1>
          <p>You have successfully authenticated into your ShopKart account.</p>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-lg">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="profile-name">{profile.fullName}</h2>
            <div className="profile-status">
              <span className="status-dot"></span>
              <span>Authenticated Customer</span>
            </div>
          </div>
        </div>

        {/* Display Fields: Name, Email, Phone, Account ID */}
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Customer Name</div>
            <div className="info-value">{profile.fullName}</div>
          </div>

          <div className="info-item">
            <div className="info-label">Email Address</div>
            <div className="info-value">{profile.email}</div>
          </div>

          <div className="info-item">
            <div className="info-label">Phone Number</div>
            <div className="info-value">{profile.phone || "Not provided"}</div>
          </div>

          <div className="info-item">
            <div className="info-label">Account ID</div>
            <div className="info-value" style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
              {profile._id || "Verified"}
            </div>
          </div>
        </div>

        {/* Security / Cookie explanation note */}
        <div className="security-card">
          <span className="security-card-icon">🔒</span>
          <div className="security-card-text">
            <h4>HttpOnly Cookie Protection Active</h4>
            <p>
              Your session is secured using an <strong>HttpOnly JWT cookie</strong>.
              Client-side JavaScript cannot read or modify this token, protecting your
              account against Cross-Site Scripting (XSS) attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
