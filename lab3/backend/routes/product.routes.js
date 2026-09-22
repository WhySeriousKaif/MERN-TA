// =========================================================
// Product Routes (Lab 03)
// =========================================================
// Maps endpoints to controller functions:
// - POST /products        -> createProduct (Task 2)
// - GET  /products        -> getAllProducts (Tasks 3, 5, Bonus)
// - GET  /products/:id    -> getProductById (Task 4)
// =========================================================

const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/product.controller");

// Route: /products
router.post("/", createProduct);
router.get("/", getAllProducts);

// Route: /products/:id
router.get("/:id", getProductById);

module.exports = router;
