// =========================================================
// Product Details Page — Task 8 (Lab 03)
// =========================================================
// Features:
// 1. Reads dynamic route param :id via useParams()
// 2. Calls GET /products/:id via fetchProductById()
// 3. Displays:
//    - Large product image
//    - Product name & category
//    - Full description
//    - Formatted price (₹)
//    - Stock availability & badge
//    - Add to Cart button (UI only with feedback)
// 4. Handles Loading and Error states (e.g. invalid or non-existent ID)
// =========================================================

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/productService";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error loading product details:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load product details. The product may not exist or the ID is invalid."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const handleAddToCart = () => {
    // Task 8: UI only for now (Cart functionality to be added in Lab 04)
    setCartSuccess(true);
    setTimeout(() => {
      setCartSuccess(false);
    }, 3000);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="product-details-container">
        <div className="state-container state-loading">
          <div className="spinner"></div>
          <p className="state-message">Loading product details...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="state-container state-error">
          <div className="state-icon">⚠️</div>
          <h3 className="state-title">Product Not Found</h3>
          <p className="state-message">{error || "Product not found."}</p>
          <div className="details-actions-row">
            <Link to="/products" className="btn btn-primary btn-sm">
              ← Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;
  const isOutOfStock = stock <= 0;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="product-details-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/home" className="breadcrumb-link">
          Home
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/products" className="breadcrumb-link">
          Products
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{name}</span>
      </nav>

      {/* Main Details Card */}
      <div className="product-details-card">
        {/* Large Product Image Column */}
        <div className="details-image-col">
          <div className="details-image-wrapper">
            <img
              src={image}
              alt={name}
              className="details-large-image"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80";
              }}
            />
          </div>
        </div>

        {/* Product Information Column */}
        <div className="details-info-col">
          <div className="details-header">
            <span className="category-pill">{category}</span>
            <h1 className="details-title">{name}</h1>
            <div className="details-price-row">
              <span className="details-price">{formattedPrice}</span>
              <span
                className={`stock-badge ${
                  isOutOfStock ? "stock-out" : "stock-available"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `${stock} units in stock`}
              </span>
            </div>
          </div>

          <hr className="details-divider" />

          {/* Description */}
          <div className="details-section">
            <h4 className="section-heading">Description</h4>
            <p className="details-description">{description}</p>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="details-purchase-section">
            <div className="quantity-row">
              <label htmlFor="qty-select" className="qty-label">
                Quantity:
              </label>
              <select
                id="qty-select"
                className="filter-select qty-select"
                value={quantity}
                disabled={isOutOfStock}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[...Array(Math.min(stock, 10)).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>
                    {n + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Task 8: Add to Cart Button (UI Only for Lab 03) */}
            <button
              className={`btn btn-primary btn-lg ${
                isOutOfStock ? "btn-disabled" : ""
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              id="add-to-cart-btn"
            >
              {isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
            </button>

            {/* Feedback notification for Lab 03 */}
            {cartSuccess && (
              <div className="cart-feedback-alert" role="alert">
                ✓ Added {quantity} item(s) to cart! (Cart persistence coming in Lab 04)
              </div>
            )}
          </div>

          <div className="details-footer-nav">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline btn-sm"
            >
              ← Go Back
            </button>
            <Link to="/products" className="btn btn-secondary btn-sm">
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
