// =========================================================
// Product Service Layer (Lab 03)
// =========================================================
// Encapsulates all Product API operations away from UI components.
//
// Methods:
// - fetchProducts({ search, category, sort }): Calls GET /products with query params
// - fetchProductById(id): Calls GET /products/:id
// - createProduct(productData): Calls POST /products
// =========================================================

import api from "./api";

/**
 * Fetches products from backend with optional search, category filter, and sorting.
 * @param {Object} params - { search, category, sort }
 * @returns {Promise<Object>} { success, count, products }
 */
export async function fetchProducts({ search = "", category = "", sort = "" } = {}) {
  const queryParams = new URLSearchParams();

  if (search && search.trim() !== "") {
    queryParams.append("search", search.trim());
  }

  if (
    category &&
    category.trim() !== "" &&
    category.toLowerCase() !== "all" &&
    category.toLowerCase() !== "all categories"
  ) {
    queryParams.append("category", category.trim());
  }

  if (sort && sort.trim() !== "") {
    queryParams.append("sort", sort.trim());
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/products?${queryString}` : "/products";

  const response = await api.get(endpoint);
  return response.data;
}

/**
 * Fetches a single product by its MongoDB _id.
 * @param {string} id - 24-character ObjectId string
 * @returns {Promise<Object>} product document
 */
export async function fetchProductById(id) {
  const response = await api.get(`/products/${id}`);
  // Support both direct product response or wrapped { success: true, product }
  return response.data.product || response.data;
}

/**
 * Inserts a new product into the database.
 * @param {Object} productData - { name, description, price, category, image, stock }
 * @returns {Promise<Object>} { success, message, product }
 */
export async function createProduct(productData) {
  const response = await api.post("/products", productData);
  return response.data;
}
