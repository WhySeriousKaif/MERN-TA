// =========================================================
// Product Model — Task 1 (Lab 03)
// =========================================================
// Defines the Mongoose schema and model for products in ShopKart.
//
// Schema Validations:
// 1. name: String, required, trimmed
// 2. description: String, required, trimmed
// 3. price: Number, required, must be strictly > 0
// 4. category: String, required, trimmed
// 5. image: String, required (URL)
// 6. stock: Number, required, cannot be negative (min: 0)
// 7. createdAt: Date, automatically generated via timestamps
// =========================================================

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      // Price must be strictly greater than 0
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Price must be greater than 0",
      },
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Product stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  {
    // Automatically adds createdAt and updatedAt Date fields
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
