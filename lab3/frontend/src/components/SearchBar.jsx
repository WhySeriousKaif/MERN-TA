// =========================================================
// SearchBar & Filter Component — Task 7 & Bonus (Lab 03)
// =========================================================
// Features:
// - Live search input (with clear button)
// - Category selector dropdown: All Categories, Electronics, Fashion, Books, Home
// - Bonus Challenge: Sorting dropdown (Newest, Price: Low to High, Price: High to Low)
// - Reset / Clear Filters button
// =========================================================

import React from "react";

const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

export default function SearchBar({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onReset,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    (category !== "" && category !== "All Categories") ||
    sort !== "";

  return (
    <div className="filter-panel">
      {/* Search Input */}
      <div className="filter-group search-group">
        <label htmlFor="search-input" className="filter-label">
          Search Products
        </label>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search products by name (e.g. keyboard, watch)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Dropdown Filter */}
      <div className="filter-group select-group">
        <label htmlFor="category-select" className="filter-label">
          Category
        </label>
        <select
          id="category-select"
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Bonus Challenge: Sort By Price */}
      <div className="filter-group select-group">
        <label htmlFor="sort-select" className="filter-label">
          Sort By
        </label>
        <select
          id="sort-select"
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Featured / Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <div className="filter-reset-group">
          <button
            type="button"
            className="btn btn-outline btn-sm filter-reset-btn"
            onClick={onReset}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
