// =========================================================
// ProductCard Component — Task 6 (Lab 03)
// =========================================================
// Displays:
// - Product image with fallback
// - Category pill badge
// - Product title
// - Formatted Price (₹)
// - Stock indicator (e.g., "10 units left" or "Out of Stock")
// - "View Details" button linking to /products/:id
// =========================================================

import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const { _id, name, price, category, image, stock } = product;

  // Format price as Indian Rupee (₹)
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="product-card">
      {/* Product Image Container */}
      <div className="card-image-wrap">
        <img
          src={image}
          alt={name}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80";
          }}
        />
        <span className="category-pill">{category}</span>
      </div>

      {/* Product Content Body */}
      <div className="card-body">
        <h3 className="card-title" title={name}>
          {name}
        </h3>

        <div className="card-price-row">
          <span className="card-price">{formattedPrice}</span>
          <span
            className={`stock-badge ${
              isOutOfStock
                ? "stock-out"
                : isLowStock
                ? "stock-low"
                : "stock-available"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : isLowStock
              ? `Only ${stock} left!`
              : `${stock} units left`}
          </span>
        </div>

        {/* View Details Action */}
        <Link
          to={`/products/${_id}`}
          className="btn btn-primary card-action-btn"
          id={`view-details-${_id}`}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
