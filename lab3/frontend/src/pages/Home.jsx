// =========================================================
// Home Page (ShopKart Lab 03 Continuation)
// =========================================================

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Home({ customer, setCustomer }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(customer || null);

  useEffect(() => {
    let isMounted = true;

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

  if (loading) {
    return (
      <div className="state-container state-loading">
        <div className="spinner"></div>
        <p className="state-message">Verifying authentication & loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {profile.fullName}! 👋</h1>
          <p>
            Your authentication session is active. Ready to explore products in Lab 03?
          </p>
          <div style={{ marginTop: "1.25rem" }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              🛒 Browse Product Catalog →
            </Link>
          </div>
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

        {/* Display Fields */}
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
            <h4>HttpOnly Cookie Session Active</h4>
            <p>
              Your session is securely governed by an <strong>HttpOnly JWT cookie</strong>.
              Now jump into the product catalog to test real dynamic API fetching!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
