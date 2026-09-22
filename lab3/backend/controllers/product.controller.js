// =========================================================
// Product Controller — Tasks 2, 3, 4, 5 & Bonus (Lab 03)
// =========================================================
// Handles:
// - POST /products: Insert a new product (Task 2)
// - GET  /products: Fetch all products with search, filter, and sort (Tasks 3, 5, Bonus)
// - GET  /products/:id: Fetch single product by MongoDB _id (Task 4)
// =========================================================

const mongoose = require("mongoose");
const Product = require("../models/product.model");

// ---------------------------------------------------------
// Task 2: Create Product API
// Endpoint: POST /products
// Status: 201 on success, 400 on validation failure
// ---------------------------------------------------------
async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation 1: Check missing required fields
    if (
      name === undefined ||
      description === undefined ||
      price === undefined ||
      category === undefined ||
      image === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, price, category, image, and stock are mandatory",
      });
    }

    // Validation 2: Validate price (must be a number strictly > 0)
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price: Price must be a number greater than 0",
      });
    }

    // Validation 3: Validate stock (must be an integer/number >= 0)
    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock: Stock cannot be negative",
      });
    }

    // Insert into MongoDB
    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numericStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: error.message,
    });
  }
}

// ---------------------------------------------------------
// Task 3, 5 & Bonus: Get All Products (with Search, Category, Sort)
// Endpoint: GET /products
// Queries: ?search=keyboard &category=Electronics &sort=price_asc|price_desc
// ---------------------------------------------------------
async function getAllProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    // Dynamically build MongoDB query filter object
    const query = {};

    // Task 5: Case-insensitive search on product name
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Task 5: Category filtering (ignore if "All" or "All Categories")
    if (
      category &&
      category.trim() !== "" &&
      category.toLowerCase() !== "all" &&
      category.toLowerCase() !== "all categories"
    ) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Bonus Challenge: Sorting by price
    let sortOptions = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    }

    // Execute query with projection of fields required by UI
    const products = await Product.find(query)
      .sort(sortOptions)
      .select("_id name description price category image stock createdAt");

    // Task 3 Expected Response format:
    // { "success": true, "count": N, "products": [...] }
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
}

// ---------------------------------------------------------
// Task 4: Get Single Product API
// Endpoint: GET /products/:id
// Status: 200 on success, 400 for invalid ID, 404 for not found
// ---------------------------------------------------------
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    // Failure Case 1: Invalid MongoDB ObjectId format -> 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product ID format: "${id}". Must be a 24-character hexadecimal ObjectId.`,
      });
    }

    const product = await Product.findById(id);

    // Failure Case 2: Product does not exist -> 404
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    // Success -> 200
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: error.message,
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
