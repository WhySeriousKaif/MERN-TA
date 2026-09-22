// =========================================================
// Products Page — Task 6, Task 7 & State Handling (Lab 03)
// =========================================================
// Features:
// 1. Fetches products from backend GET /products dynamically
// 2. Query synchronization: search, category, sort
// 3. Three distinct UI states:
//    - Loading State: "Loading products..."
//    - Error State: "Something went wrong while loading products."
//    - Empty State: "No products found."
// 4. Dynamic rendering using .map()
// =========================================================

import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { fetchProducts } from "../services/productService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("");

  // Debounced search to prevent excessive API queries while typing
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Load products whenever filters change
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        search: debouncedSearch,
        category,
        sort,
      });
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, category, sort]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setSort("");
  };

  return (
    <div className="products-page-container">
      {/* Page Header */}
      <div className="products-header">
        <h1 className="page-title">Explore Catalog</h1>
        <p className="page-subtitle">
          Discover top electronics, fashion, books, and home essentials with real-time backend filtering.
        </p>
      </div>

      {/* Task 7: Search and Filtering Control Panel */}
      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        onReset={handleResetFilters}
      />

      {/* Products Counter / Summary */}
      {!loading && !error && (
        <div className="products-summary-bar">
          <span className="results-count">
            Showing <strong>{products.length}</strong> product
            {products.length === 1 ? "" : "s"}
          </span>
          {(search || category !== "All Categories" || sort) && (
            <span className="active-filter-indicator">
              Filtered by:{" "}
              {category !== "All Categories" ? `Category: ${category} ` : ""}
              {search ? `• Search: "${search}" ` : ""}
              {sort ? `• Sorted: ${sort === "price_asc" ? "Price Low-High" : "Price High-Low"}` : ""}
            </span>
          )}
        </div>
      )}

      {/* UI States Handling */}

      {/* 1. Loading State */}
      {loading && (
        <div className="state-container state-loading" id="state-loading">
          <div className="spinner"></div>
          <p className="state-message">Loading products...</p>
        </div>
      )}

      {/* 2. Error State */}
      {!loading && error && (
        <div className="state-container state-error" id="state-error">
          <div className="state-icon">⚠️</div>
          <h3 className="state-title">Connection Error</h3>
          <p className="state-message">{error}</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={loadProducts}
          >
            Retry Request
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="state-container state-empty" id="state-empty">
          <div className="state-icon">📦</div>
          <h3 className="state-title">No products found.</h3>
          <p className="state-message">
            We couldn't find any items matching your current filters. Try changing your keywords or resetting filters.
          </p>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleResetFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* 4. Product Listing Grid (Rendered Dynamically via .map()) */}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid" id="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
